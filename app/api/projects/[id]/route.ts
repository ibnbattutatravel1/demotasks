import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq, inArray } from 'drizzle-orm'

// GET /api/projects/[id] - Get single project
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id
    const project = (await db.select().from(dbSchema.projects).where(eq(dbSchema.projects.id, projectId)))[0]
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }

    // Load owner, team, tags
    const owner = (await db.select().from(dbSchema.users).where(eq(dbSchema.users.id, project.ownerId)))[0]
    const teamRows = await db.select().from(dbSchema.projectTeam).where(eq(dbSchema.projectTeam.projectId, projectId))
    const teamUserIds = teamRows.map(t => t.userId)
    const teamUsers = teamUserIds.length ? await db.select().from(dbSchema.users).where(inArray(dbSchema.users.id, teamUserIds)) : []
    const tagRows = await db.select().from(dbSchema.projectTags).where(eq(dbSchema.projectTags.projectId, projectId))

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
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id
    const body = await req.json()
    
    // Check if project exists
    const existing = (await db.select().from(dbSchema.projects).where(eq(dbSchema.projects.id, projectId)))[0]
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }

    const now = new Date().toISOString()
    const updateData = { ...body, updatedAt: now }
    delete updateData.teamIds
    delete updateData.tags

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

    return NextResponse.json({ success: true, message: 'Project updated successfully' })
  } catch (err) {
    console.error('PUT /api/projects/[id] error', err)
    return NextResponse.json({ success: false, error: 'Failed to update project' }, { status: 500 })
  }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id
    
    // Check if project exists
    const existing = (await db.select().from(dbSchema.projects).where(eq(dbSchema.projects.id, projectId)))[0]
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }

    // Delete related data first (foreign key constraints)
    await db.delete(dbSchema.projectTeam).where(eq(dbSchema.projectTeam.projectId, projectId))
    await db.delete(dbSchema.projectTags).where(eq(dbSchema.projectTags.projectId, projectId))
    
    // Delete tasks and related data
    const tasks = await db.select({ id: dbSchema.tasks.id }).from(dbSchema.tasks).where(eq(dbSchema.tasks.projectId, projectId))
    if (tasks.length > 0) {
      const taskIds = tasks.map(t => t.id)
      await db.delete(dbSchema.taskAssignees).where(inArray(dbSchema.taskAssignees.taskId, taskIds))
      await db.delete(dbSchema.taskTags).where(inArray(dbSchema.taskTags.taskId, taskIds))
      await db.delete(dbSchema.tasks).where(eq(dbSchema.tasks.projectId, projectId))
    }

    // Finally delete the project
    await db.delete(dbSchema.projects).where(eq(dbSchema.projects.id, projectId))

    return NextResponse.json({ success: true, message: 'Project deleted successfully' })
  } catch (err) {
    console.error('DELETE /api/projects/[id] error', err)
    return NextResponse.json({ success: false, error: 'Failed to delete project' }, { status: 500 })
  }
}
