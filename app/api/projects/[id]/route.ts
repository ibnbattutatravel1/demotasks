import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq, inArray } from 'drizzle-orm'
import { notifyUser } from '@/lib/notifications'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'

// GET /api/projects/[id] - Get single project
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params
    const project = (await db.select().from(dbSchema.projects).where(eq(dbSchema.projects.id, projectId)))[0]
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }

    // Optimized: Load all related data in parallel
    const [ownerRows, teamRows, tagRows] = await Promise.all([
      db.select().from(dbSchema.users).where(eq(dbSchema.users.id, project.ownerId)),
      db.select().from(dbSchema.projectTeam).where(eq(dbSchema.projectTeam.projectId, projectId)),
      db.select().from(dbSchema.projectTags).where(eq(dbSchema.projectTags.projectId, projectId))
    ])
    
    const owner = ownerRows[0]
    const teamUserIds = teamRows.map(t => t.userId)
    const teamUsers = teamUserIds.length > 0 
      ? await db.select().from(dbSchema.users).where(inArray(dbSchema.users.id, teamUserIds)) 
      : []

    const response = {
      ...project,
      owner: owner ? { id: owner.id, name: owner.name, initials: owner.initials, avatar: owner.avatar } : null,
      team: teamUsers.map(u => ({ id: u.id, name: u.name, initials: u.initials, avatar: u.avatar })),
      tags: tagRows.map(t => t.tag),
      tasks: [],
      tasksCompleted: 0,
      totalTasks: 0,
    }

    return NextResponse.json({ success: true, data: response })
  } catch (err) {
    console.error('GET /api/projects/[id] error', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch project' }, { status: 500 })
  }
}

// PUT /api/projects/[id] - Update project
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params
    // Check if user is admin
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const userRows = await db.select({ id: dbSchema.users.id, role: dbSchema.users.role }).from(dbSchema.users).where(eq(dbSchema.users.id, payload.sub))
    const user = userRows[0]
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Only admins can edit projects' }, { status: 403 })
    }
    
    const body = await req.json()
    
    // Check if project exists
    const existing = (await db.select().from(dbSchema.projects).where(eq(dbSchema.projects.id, projectId)))[0]
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }

    const now = new Date()
    const updateData = { ...body, updatedAt: now }
    delete updateData.teamIds
    delete updateData.tags
    
    // تحويل التواريخ إلى Date objects
    if (updateData.startDate && typeof updateData.startDate === 'string') {
      updateData.startDate = new Date(updateData.startDate)
    }
    if (updateData.dueDate && typeof updateData.dueDate === 'string') {
      updateData.dueDate = new Date(updateData.dueDate)
    }
    if (updateData.completedAt && typeof updateData.completedAt === 'string') {
      updateData.completedAt = new Date(updateData.completedAt)
    }

    // Update project
    await db.update(dbSchema.projects).set(updateData).where(eq(dbSchema.projects.id, projectId))

    // Update team if provided
    if (body.teamIds !== undefined) {
      await db.delete(dbSchema.projectTeam).where(eq(dbSchema.projectTeam.projectId, projectId))
      if (body.teamIds.length > 0) {
        await db.insert(dbSchema.projectTeam).values(body.teamIds.map((userId: string) => ({ projectId, userId })))
      }
    }

    // Update tags if provided
    if (body.tags !== undefined) {
      await db.delete(dbSchema.projectTags).where(eq(dbSchema.projectTags.projectId, projectId))
      if (body.tags.length > 0) {
        await db.insert(dbSchema.projectTags).values(body.tags.map((tag: string) => ({ projectId, tag })))
      }
    }

    // Notify owner, team, and admins about project updates
    try {
      const teamRows = await db.select().from(dbSchema.projectTeam).where(eq(dbSchema.projectTeam.projectId, projectId))
      const userIds = new Set<string>([existing.ownerId, ...teamRows.map((t: any) => t.userId)])
      
      // Add all admins to recipients
      const admins = await db
        .select({ id: dbSchema.users.id })
        .from(dbSchema.users)
        .where(eq(dbSchema.users.role, 'admin'))
      for (const admin of admins) userIds.add(admin.id)
      
      await Promise.all(
        Array.from(userIds).map((uid) =>
          notifyUser({
            userId: uid,
            type: 'project_updated',
            title: `Project updated: ${existing.name}`,
            message: 'Project details have been updated.',
            relatedId: projectId,
            relatedType: 'project',
            topic: 'projectUpdates',
          })
        )
      )
    } catch (e) {
      console.warn('Failed to notify project updates', e)
    }

    return NextResponse.json({ success: true, message: 'Project updated successfully' })
  } catch (err) {
    console.error('PUT /api/projects/[id] error', err)
    return NextResponse.json({ success: false, error: 'Failed to update project' }, { status: 500 })
  }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params
    
    // Check if project exists
    const existing = (await db.select().from(dbSchema.projects).where(eq(dbSchema.projects.id, projectId)))[0]
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }

    // Get all tasks for this project
    const tasks = await db.select({ id: dbSchema.tasks.id }).from(dbSchema.tasks).where(eq(dbSchema.tasks.projectId, projectId))
    const taskIds = tasks.map(t => t.id)

    if (taskIds.length > 0) {
      // Get all subtasks for these tasks
      const subtasks = await db.select({ id: dbSchema.subtasks.id }).from(dbSchema.subtasks).where(inArray(dbSchema.subtasks.taskId, taskIds))
      const subtaskIds = subtasks.map(s => s.id)

      // Delete in correct order to avoid foreign key constraints:
      
      // 1. Delete comments for subtasks and tasks
      if (subtaskIds.length > 0) {
        await db.delete(dbSchema.comments).where(inArray(dbSchema.comments.entityId, subtaskIds))
      }
      await db.delete(dbSchema.comments).where(inArray(dbSchema.comments.entityId, taskIds))

      // 2. Delete attachments for subtasks and tasks
      if (subtaskIds.length > 0) {
        await db.delete(dbSchema.attachments).where(inArray(dbSchema.attachments.entityId, subtaskIds))
      }
      await db.delete(dbSchema.attachments).where(inArray(dbSchema.attachments.entityId, taskIds))

      // 3. Delete subtask tags and subtasks
      if (subtaskIds.length > 0) {
        await db.delete(dbSchema.subtaskTags).where(inArray(dbSchema.subtaskTags.subtaskId, subtaskIds))
        await db.delete(dbSchema.subtasks).where(inArray(dbSchema.subtasks.taskId, taskIds))
      }

      // 4. Delete task assignees and task tags
      await db.delete(dbSchema.taskAssignees).where(inArray(dbSchema.taskAssignees.taskId, taskIds))
      await db.delete(dbSchema.taskTags).where(inArray(dbSchema.taskTags.taskId, taskIds))

      // 5. Delete tasks
      await db.delete(dbSchema.tasks).where(eq(dbSchema.tasks.projectId, projectId))
    }

    // 6. Delete project attachments
    await db.delete(dbSchema.attachments).where(eq(dbSchema.attachments.entityId, projectId))

    // 7. Delete project team and tags
    await db.delete(dbSchema.projectTeam).where(eq(dbSchema.projectTeam.projectId, projectId))
    await db.delete(dbSchema.projectTags).where(eq(dbSchema.projectTags.projectId, projectId))
    
    // 8. Finally delete the project itself
    await db.delete(dbSchema.projects).where(eq(dbSchema.projects.id, projectId))

    return NextResponse.json({ success: true, message: 'Project deleted successfully' })
  } catch (err) {
    console.error('DELETE /api/projects/[id] error', err)
    return NextResponse.json({ success: false, error: 'Failed to delete project' }, { status: 500 })
  }
}
