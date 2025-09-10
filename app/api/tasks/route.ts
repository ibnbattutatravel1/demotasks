import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { db, dbSchema } from '@/lib/db/client'
import { and, eq, inArray } from 'drizzle-orm'

// Ensure user records exist for provided IDs
async function ensureUsers(ids: string[]) {
  if (!ids.length) return
  const existing = await db.select().from(dbSchema.users).where(inArray(dbSchema.users.id, ids))
  const existingIds = new Set(existing.map(u => u.id))
  const toInsert = ids
    .filter(id => !existingIds.has(id))
    .map((id) => ({
      id,
      name: `User ${id.slice(0, 4)}`,
      email: `${id.slice(0, 4)}@example.com`,
      initials: id.slice(0, 2).toUpperCase(),
      role: 'user' as const,
      avatar: null as unknown as string | null,
    }))
  if (toInsert.length) {
    await db.insert(dbSchema.users).values(toInsert)
  }
}

async function composeTask(task: any) {
  const [assignees, tags, subtasks, commentRows] = await Promise.all([
    db.select().from(dbSchema.taskAssignees).where(eq(dbSchema.taskAssignees.taskId, task.id))
      .leftJoin(dbSchema.users, eq(dbSchema.taskAssignees.userId, dbSchema.users.id)),
    db.select().from(dbSchema.taskTags).where(eq(dbSchema.taskTags.taskId, task.id)),
    db.select().from(dbSchema.subtasks).where(eq(dbSchema.subtasks.taskId, task.id)),
    db.select().from(dbSchema.comments).where(and(eq(dbSchema.comments.entityType, 'task'), eq(dbSchema.comments.entityId, task.id))),
  ])

  const assigneeUsers = assignees.map((row) => row.users).filter(Boolean)
  const tagList = tags.map(t => t.tag)
  const subtaskList = subtasks.map(st => ({
    id: st.id,
    taskId: st.taskId,
    title: st.title,
    description: st.description,
    completed: !!st.completed,
    startDate: st.startDate,
    dueDate: st.dueDate,
    createdAt: st.createdAt,
    updatedAt: st.updatedAt,
    assigneeId: st.assigneeId,
    priority: st.priority,
  }))

  const subtasksCompleted = subtaskList.filter(s => s.completed).length
  const totalSubtasks = subtaskList.length
  const commentsCount = commentRows.length

  return {
    ...task,
    assignees: assigneeUsers,
    tags: tagList,
    subtasks: subtaskList,
    subtasksCompleted,
    totalSubtasks,
    commentsCount,
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const assigneeId = searchParams.get('assigneeId')
    const createdById = searchParams.get('createdById')
    const approvalStatus = searchParams.get('approvalStatus')

    let where = undefined as any
    if (projectId && assigneeId) {
      // tasks in project assigned to user
      const taskIdsForUser = await db.select({ taskId: dbSchema.taskAssignees.taskId })
        .from(dbSchema.taskAssignees)
        .where(eq(dbSchema.taskAssignees.userId, assigneeId))
      const taskIds = taskIdsForUser.map(t => t.taskId)
      where = and(inArray(dbSchema.tasks.id, taskIds), eq(dbSchema.tasks.projectId, projectId))
    } else if (projectId && createdById) {
      where = and(eq(dbSchema.tasks.projectId, projectId), eq(dbSchema.tasks.createdById, createdById))
    } else if (assigneeId) {
      const taskIdsForUser = await db.select({ taskId: dbSchema.taskAssignees.taskId })
        .from(dbSchema.taskAssignees)
        .where(eq(dbSchema.taskAssignees.userId, assigneeId))
      const taskIds = taskIdsForUser.map(t => t.taskId)
      where = inArray(dbSchema.tasks.id, taskIds)
    } else if (projectId) {
      where = eq(dbSchema.tasks.projectId, projectId)
    } else if (createdById) {
      where = eq(dbSchema.tasks.createdById, createdById)
    }

    // Add approvalStatus filter if provided
    if (approvalStatus) {
      const statusCond = eq(dbSchema.tasks.approvalStatus, approvalStatus)
      where = where ? and(where, statusCond) : statusCond
    }

    const rows = where
      ? await db.select().from(dbSchema.tasks).where(where)
      : await db.select().from(dbSchema.tasks)

    const data = await Promise.all(rows.map(composeTask))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('GET /api/tasks error', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      projectId: string
      title: string
      description?: string
      status?: 'todo' | 'in-progress' | 'review' | 'done'
      priority: 'low' | 'medium' | 'high'
      startDate?: string
      dueDate?: string
      createdById: string
      approvalStatus?: 'pending' | 'approved' | 'rejected'
      assigneeIds?: string[]
      tags?: string[]
      progress?: number
      subtasks?: Array<{
        title: string
        description?: string
        assigneeId?: string
        startDate?: string
        dueDate?: string
        priority?: 'low' | 'medium' | 'high'
      }>
    }

    const {
      projectId,
      title,
      description = '',
      status = 'todo',
      priority,
      startDate,
      dueDate,
      createdById,
      approvalStatus = 'pending',
      assigneeIds = [],
      tags = [],
      progress = 0,
      subtasks = [],
    } = body

    if (!projectId || !title || !priority || !createdById) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    await ensureUsers([createdById, ...assigneeIds])

    const id = (globalThis.crypto?.randomUUID?.() ?? randomUUID()) as string
    const now = new Date().toISOString()

    await db.insert(dbSchema.tasks).values({
      id,
      projectId,
      title,
      description,
      status,
      priority,
      startDate: startDate ?? now.split('T')[0],
      dueDate: dueDate ?? now.split('T')[0],
      createdAt: now,
      updatedAt: now,
      completedAt: null as unknown as string | null,
      createdById,
      approvalStatus,
      approvedAt: null as unknown as string | null,
      approvedById: null as unknown as string | null,
      rejectionReason: null as unknown as string | null,
      progress,
    })

    if (assigneeIds.length) {
      await db.insert(dbSchema.taskAssignees).values(
        assigneeIds.map((userId) => ({ taskId: id, userId }))
      )
    }
    if (tags.length) {
      await db.insert(dbSchema.taskTags).values(
        tags.map(tag => ({ taskId: id, tag }))
      )
    }

    if (subtasks.length) {
      const subRows = subtasks.map(st => ({
        id: (globalThis.crypto?.randomUUID?.() ?? randomUUID()) as string,
        taskId: id,
        title: st.title,
        description: st.description ?? '',
        completed: false,
        startDate: st.startDate ?? null as unknown as string | null,
        dueDate: st.dueDate ?? null as unknown as string | null,
        createdAt: now,
        updatedAt: now,
        assigneeId: st.assigneeId ?? null as unknown as string | null,
        priority: st.priority ?? null as unknown as string | null,
      }))
      await db.insert(dbSchema.subtasks).values(subRows)
    }

    const created = await db.select().from(dbSchema.tasks).where(eq(dbSchema.tasks.id, id))
    const task = created[0]
    const data = await composeTask(task)

    // Create a notification for the creator based on approval status
    try {
      let notifType: string | null = null
      let message = ''
      if (approvalStatus === 'approved') {
        notifType = 'task_approved'
        message = 'Your task has been approved.'
      } else if (approvalStatus === 'pending') {
        notifType = 'task_pending'
        message = 'Your task is pending approval.'
      } else if (approvalStatus === 'rejected') {
        notifType = 'task_rejected'
        message = 'Your task has been rejected.'
      }
      if (notifType) {
        await db.insert(dbSchema.notifications).values({
          id: (globalThis.crypto?.randomUUID?.() ?? randomUUID()) as string,
          type: notifType,
          title: title,
          message,
          read: 0 as any,
          userId: createdById,
          relatedId: id,
          relatedType: 'task',
        })
      }
    } catch (e) {
      console.warn('Failed to create notification for task creation', e)
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('POST /api/tasks error', error)
    return NextResponse.json({ success: false, error: 'Failed to create task' }, { status: 500 })
  }
}
