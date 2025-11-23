import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { db, dbSchema } from '@/lib/db/client'
import { eq } from 'drizzle-orm'
import { toISOString, toISOStringOrUndefined } from '@/lib/date-utils'
import { notifyUser } from '@/lib/notifications'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'

async function recomputeTaskProgress(taskId: string) {
  const subtasks = await db.select().from(dbSchema.subtasks).where(eq(dbSchema.subtasks.taskId, taskId))
  if (!subtasks.length) return null
  const completed = (subtasks as any[]).filter((s: any) => !!s.completed).length
  const total = subtasks.length
  const pct = Math.round((completed / total) * 100)
  await db.update(dbSchema.tasks).set({ progress: pct, updatedAt: new Date() }).where(eq(dbSchema.tasks.id, taskId))
  return pct
}

async function recomputeProjectProgress(projectId: string) {
  const rows = await db.select({ progress: dbSchema.tasks.progress }).from(dbSchema.tasks).where(eq(dbSchema.tasks.projectId, projectId))
  if (!rows.length) return null
  const avg = Math.round(((rows as any[]).reduce((sum: number, r: any) => sum + (r.progress || 0), 0)) / rows.length)
  await db.update(dbSchema.projects).set({ progress: avg, updatedAt: new Date() }).where(eq(dbSchema.projects.id, projectId))
  return avg
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    
    const currentUserId = payload.sub
    const isAdmin = payload.role === 'admin'

    const body = (await req.json()) as {
      taskId: string
      title: string
      description?: string
      assigneeIds?: string[]
      startDate?: string
      dueDate?: string
      priority?: 'low' | 'medium' | 'high'
      status?: 'todo' | 'in-progress' | 'review' | 'done' | 'blocked' | 'postponed'
    }

    const { taskId, title, description = '', assigneeIds = [], startDate = null, dueDate = null, priority = null, status = 'todo' } = body as any

    if (!taskId || !title) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const task = await db.select().from(dbSchema.tasks).where(eq(dbSchema.tasks.id, taskId))
    if (!task.length) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 })
    }

    // Check permissions: admin can create subtasks in any task, others must have access to project
    if (!isAdmin) {
      // Get the project to check access
      const project = (await db.select().from(dbSchema.projects).where(eq(dbSchema.projects.id, task[0].projectId)))[0]
      if (!project) {
        return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
      }
      
      // Check if user is owner or team member of the project
      let hasAccess = project.ownerId === currentUserId
      
      if (!hasAccess) {
        const teamMembership = await db.select()
          .from(dbSchema.projectTeam)
          .where(eq(dbSchema.projectTeam.projectId, task[0].projectId))
          .where(eq(dbSchema.projectTeam.userId, currentUserId))
        
        hasAccess = teamMembership.length > 0
      }
      
      if (!hasAccess) {
        return NextResponse.json({ success: false, error: 'Forbidden: You do not have access to this project' }, { status: 403 })
      }
    }
    const now = new Date()
    const id = (globalThis.crypto?.randomUUID?.() ?? randomUUID()) as string

    // Insert subtask
    await db.insert(dbSchema.subtasks).values({
      id,
      taskId,
      title,
      description,
      status,
      completed: 0,
      startDate: startDate ? new Date(startDate) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      createdAt: now,
      updatedAt: now,
      priority,
    })

    // Insert assignee relationships
    if (assigneeIds.length > 0) {
      await db.insert(dbSchema.subtaskAssignees).values(
        assigneeIds.map((userId: string) => ({
          subtaskId: id,
          userId
        }))
      )
    }

    // rollups
    await recomputeTaskProgress(taskId)
    await recomputeProjectProgress(task[0].projectId)

    // Send notifications to all assignees
    if (assigneeIds.length > 0) {
      try {
        const parentProject = await db.select().from(dbSchema.projects).where(eq(dbSchema.projects.id, task[0].projectId))
        const notificationPromises = assigneeIds.map((assigneeId: string) =>
          notifyUser({
            userId: assigneeId,
            type: 'task_assigned',
            title: 'New Subtask Assigned',
            message: `You have been assigned a new subtask: ${title}`,
            relatedId: id,
            relatedType: 'subtask',
            topic: 'taskReminders',
            metadata: {
              taskTitle: title,
              projectName: parentProject[0]?.name,
              dueDate: dueDate
            }
          })
        )
        await Promise.all(notificationPromises)
      } catch (notificationError) {
        console.error('Failed to send subtask assignment notifications:', notificationError)
      }
    }

    const created = (await db.select().from(dbSchema.subtasks).where(eq(dbSchema.subtasks.id, id)))[0]
    return NextResponse.json({ 
      success: true, 
      data: { 
        ...created, 
        completed: !!created.completed,
        startDate: toISOStringOrUndefined(created.startDate),
        dueDate: toISOStringOrUndefined(created.dueDate),
        createdAt: toISOString(created.createdAt),
        updatedAt: toISOStringOrUndefined(created.updatedAt),
        assigneeIds,
      } 
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/subtasks error', error)
    return NextResponse.json({ success: false, error: 'Failed to create subtask' }, { status: 500 })
  }
}
