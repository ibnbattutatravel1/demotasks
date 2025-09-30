import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { db, dbSchema } from '@/lib/db/client'
import { notifyUser } from '@/lib/notifications'
import { and, eq, inArray } from 'drizzle-orm'

// Ensure user records exist for provided IDs
async function ensureUsers(ids: string[]) {
  if (!ids.length) return
  const existing = await db.select().from(dbSchema.users).where(inArray(dbSchema.users.id, ids))
  const existingIds = new Set(existing.map((u: any) => u.id))
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

// Optimized batch loading to avoid N+1 queries
async function composeTasksBatch(tasks: any[]) {
  if (tasks.length === 0) return []
  
  const taskIds = tasks.map(t => t.id)
  const creatorIds = [...new Set(tasks.map(t => t.createdById))]
  
  // Fetch all related data in parallel with single queries per type
  const [assigneesData, tagsData, subtasksData, commentsData, creatorsData] = await Promise.all([
    db.select()
      .from(dbSchema.taskAssignees)
      .where(inArray(dbSchema.taskAssignees.taskId, taskIds))
      .leftJoin(dbSchema.users, eq(dbSchema.taskAssignees.userId, dbSchema.users.id)),
    db.select()
      .from(dbSchema.taskTags)
      .where(inArray(dbSchema.taskTags.taskId, taskIds)),
    db.select()
      .from(dbSchema.subtasks)
      .where(inArray(dbSchema.subtasks.taskId, taskIds)),
    db.select()
      .from(dbSchema.comments)
      .where(and(
        eq(dbSchema.comments.entityType, 'task'),
        inArray(dbSchema.comments.entityId, taskIds)
      )),
    db.select()
      .from(dbSchema.users)
      .where(inArray(dbSchema.users.id, creatorIds)),
  ])
  
  // Create lookup maps for O(1) access
  const assigneesMap = new Map<string, any[]>()
  assigneesData.forEach((row: any) => {
    if (!assigneesMap.has(row.task_assignees.taskId)) {
      assigneesMap.set(row.task_assignees.taskId, [])
    }
    if (row.users) {
      assigneesMap.get(row.task_assignees.taskId)!.push(row.users)
    }
  })
  
  const tagsMap = new Map<string, string[]>()
  tagsData.forEach((row: any) => {
    if (!tagsMap.has(row.taskId)) {
      tagsMap.set(row.taskId, [])
    }
    tagsMap.get(row.taskId)!.push(row.tag)
  })
  
  const subtasksMap = new Map<string, any[]>()
  subtasksData.forEach((st: any) => {
    if (!subtasksMap.has(st.taskId)) {
      subtasksMap.set(st.taskId, [])
    }
    subtasksMap.get(st.taskId)!.push({
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
    })
  })
  
  const commentsCountMap = new Map<string, number>()
  commentsData.forEach((comment: any) => {
    const count = commentsCountMap.get(comment.entityId) || 0
    commentsCountMap.set(comment.entityId, count + 1)
  })
  
  const creatorsMap = new Map<string, any>()
  creatorsData.forEach((user: any) => {
    creatorsMap.set(user.id, user)
  })
  
  // Compose all tasks using the maps
  return tasks.map(task => {
    const assignees = assigneesMap.get(task.id) || []
    const tags = tagsMap.get(task.id) || []
    const subtasks = subtasksMap.get(task.id) || []
    const commentsCount = commentsCountMap.get(task.id) || 0
    const subtasksCompleted = subtasks.filter((s: any) => s.completed).length
    
    const creator = creatorsMap.get(task.createdById)
    const createdBy = creator
      ? {
          id: creator.id,
          name: creator.name,
          avatar: creator.avatar,
          initials: creator.initials,
        }
      : {
          id: task.createdById,
          name: `User ${task.createdById}`,
          avatar: null as unknown as string | null,
          initials: (task.createdById?.[0] || 'U').toUpperCase(),
        }
    
    return {
      ...task,
      assignees,
      tags,
      subtasks,
      subtasksCompleted,
      totalSubtasks: subtasks.length,
      commentsCount,
      createdBy,
    }
  })
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const assigneeId = searchParams.get('assigneeId')
    const createdById = searchParams.get('createdById')
    const approvalStatus = searchParams.get('approvalStatus')
    const includeRejected = searchParams.get('includeRejected') === 'true' // For admin views

    let where = undefined as any
    if (projectId && assigneeId) {
      // tasks in project assigned to user
      const taskIdsForUser = await db.select({ taskId: dbSchema.taskAssignees.taskId })
        .from(dbSchema.taskAssignees)
        .where(eq(dbSchema.taskAssignees.userId, assigneeId))
      const taskIds = taskIdsForUser.map((t: any) => t.taskId)
      where = and(inArray(dbSchema.tasks.id, taskIds), eq(dbSchema.tasks.projectId, projectId))
    } else if (projectId && createdById) {
      where = and(eq(dbSchema.tasks.projectId, projectId), eq(dbSchema.tasks.createdById, createdById))
    } else if (assigneeId) {
      const taskIdsForUser = await db.select({ taskId: dbSchema.taskAssignees.taskId })
        .from(dbSchema.taskAssignees)
        .where(eq(dbSchema.taskAssignees.userId, assigneeId))
      const taskIds = taskIdsForUser.map((t: any) => t.taskId)
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

    // Hide rejected tasks by default (unless explicitly requested)
    // Note: We filter out rejected tasks after fetching if not admin view
    // This is a simpler approach than using SQL NOT condition

    const rows = where
      ? await db.select().from(dbSchema.tasks).where(where)
      : await db.select().from(dbSchema.tasks)

    // Filter out rejected tasks unless explicitly requested
    const filteredRows = includeRejected 
      ? rows 
      : rows.filter((task: any) => task.approvalStatus !== 'rejected')

    // Use optimized batch loading instead of N+1 queries
    const data = await composeTasksBatch(filteredRows)

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
      status?: 'planning' | 'todo' | 'in-progress' | 'review' | 'done'
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
        assigneeIds.map((userId: string) => ({ taskId: id, userId }))
      )
    }
    if (tags.length) {
      await db.insert(dbSchema.taskTags).values(
        tags.map((tag: string) => ({ taskId: id, tag }))
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
    const data = (await composeTasksBatch([task]))[0]

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
        await notifyUser({
          userId: createdById,
          type: notifType,
          title,
          message,
          relatedId: id,
          relatedType: 'task',
          topic: 'generic',
        })
      }

      // Notify admins so they can act on pending approvals
      if (approvalStatus === 'pending') {
        const admins = await db
          .select({ id: dbSchema.users.id })
          .from(dbSchema.users)
          .where(eq(dbSchema.users.role, 'admin'))

        const adminRecipients = admins
          .map((row: { id: string }) => row.id)
          .filter((uid: string) => uid !== createdById)

        if (adminRecipients.length) {
          const adminMessage = `${title} is awaiting approval.`
          await Promise.all(
            adminRecipients.map((uid: string) =>
              notifyUser({
                userId: uid,
                type: 'task_pending_review',
                title,
                message: adminMessage,
                relatedId: id,
                relatedType: 'task',
                topic: 'projectUpdates',
              }),
            ),
          )
        }
      }
    } catch (e) {
      console.warn('Failed to notify for task creation', e)
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('POST /api/tasks error', error)
    return NextResponse.json({ success: false, error: 'Failed to create task' }, { status: 500 })
  }
}
