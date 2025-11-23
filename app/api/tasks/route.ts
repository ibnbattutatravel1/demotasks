import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { db, dbSchema } from '@/lib/db/client'
import { notifyUser } from '@/lib/notifications'
import { and, eq, inArray, or } from 'drizzle-orm'
import { toISOString, toISOStringOrUndefined } from '@/lib/date-utils'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'

// Validate that user records exist for provided IDs
async function validateUsers(ids: string[]): Promise<string[]> {
  if (!ids.length) return []
  const existing = await db.select({ id: dbSchema.users.id }).from(dbSchema.users).where(inArray(dbSchema.users.id, ids))
  const existingIds = new Set(existing.map((u: any) => u.id))
  const validIds = ids.filter(id => existingIds.has(id))
  
  const invalidIds = ids.filter(id => !existingIds.has(id))
  if (invalidIds.length > 0) {
    console.warn(`Warning: Invalid user IDs ignored: ${invalidIds.join(', ')}`)
  }
  
  return validIds
}

// Optimized batch loading to avoid N+1 queries
async function composeTasksBatch(tasks: any[]) {
  if (tasks.length === 0) return []
  
  const taskIds = tasks.map(t => t.id)
  const creatorIds = [...new Set(tasks.map(t => t.createdById))]
  
  // Fetch all related data in parallel with single queries per type
  const [assigneesData, subtasksData, commentsData, creatorsData] = await Promise.all([
    db.select()
      .from(dbSchema.taskAssignees)
      .where(inArray(dbSchema.taskAssignees.taskId, taskIds))
      .leftJoin(dbSchema.users, eq(dbSchema.taskAssignees.userId, dbSchema.users.id)),
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
      startDate: toISOStringOrUndefined(st.startDate),
      dueDate: toISOStringOrUndefined(st.dueDate),
      createdAt: toISOString(st.createdAt),
      updatedAt: toISOStringOrUndefined(st.updatedAt),
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
      startDate: toISOString(task.startDate),
      dueDate: toISOString(task.dueDate),
      createdAt: toISOString(task.createdAt),
      updatedAt: toISOStringOrUndefined(task.updatedAt),
      completedAt: toISOStringOrUndefined(task.completedAt),
      approvedAt: toISOStringOrUndefined(task.approvedAt),
      assignees,
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
    // Authenticate user
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    
    const currentUserId = payload.sub
    const isAdmin = payload.role === 'admin'

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const assigneeId = searchParams.get('assigneeId')
    const createdById = searchParams.get('createdById')
    const approvalStatus = searchParams.get('approvalStatus')
    const includeRejected = searchParams.get('includeRejected') === 'true' // For admin views
    const scope = searchParams.get('scope') // when scope=self, only return tasks related to current user

    let where = undefined as any

    // Special case: personal view (e.g. calendar) should only see tasks directly related to current user
    if (scope === 'self') {
      // Tasks where user is assignee or creator
      const taskIdsForUser = await db
        .select({ taskId: dbSchema.taskAssignees.taskId })
        .from(dbSchema.taskAssignees)
        .where(eq(dbSchema.taskAssignees.userId, currentUserId))

      const taskIds = taskIdsForUser.map((t: any) => t.taskId)

      let selfWhere: any = eq(dbSchema.tasks.createdById, currentUserId)
      if (taskIds.length > 0) {
        const assigneeCond = inArray(dbSchema.tasks.id, taskIds)
        selfWhere = or(selfWhere, assigneeCond)
      }

      let rows = await db.select().from(dbSchema.tasks).where(selfWhere)

      // Optional filters still apply
      if (approvalStatus) {
        rows = rows.filter((task: any) => task.approvalStatus === approvalStatus)
      }

      const filteredRows = includeRejected
        ? rows
        : rows.filter((task: any) => task.approvalStatus !== 'rejected')

      const data = await composeTasksBatch(filteredRows)
      return NextResponse.json({ success: true, data })
    }
    
    // If not admin, enforce user-specific filtering
    if (!isAdmin) {
      if (projectId && assigneeId) {
        // tasks in project assigned to user
        const taskIdsForUser = await db.select({ taskId: dbSchema.taskAssignees.taskId })
          .from(dbSchema.taskAssignees)
          .where(eq(dbSchema.taskAssignees.userId, currentUserId))
        const taskIds = taskIdsForUser.map((t: any) => t.taskId)
        where = and(inArray(dbSchema.tasks.id, taskIds), eq(dbSchema.tasks.projectId, projectId))
      } else if (projectId && createdById) {
        where = and(eq(dbSchema.tasks.projectId, projectId), eq(dbSchema.tasks.createdById, currentUserId))
      } else if (assigneeId) {
        // Only allow users to see their own assigned tasks
        if (assigneeId !== currentUserId) {
          return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
        }
        const taskIdsForUser = await db.select({ taskId: dbSchema.taskAssignees.taskId })
          .from(dbSchema.taskAssignees)
          .where(eq(dbSchema.taskAssignees.userId, currentUserId))
        const taskIds = taskIdsForUser.map((t: any) => t.taskId)
        where = inArray(dbSchema.tasks.id, taskIds)
      } else if (projectId) {
        // Get projects where user is owner or team member
        const userProjects = await db.select().from(dbSchema.projectTeam).where(eq(dbSchema.projectTeam.userId, currentUserId))
        const userOwnedProjects = await db.select().from(dbSchema.projects).where(eq(dbSchema.projects.ownerId, currentUserId))
        const accessibleProjectIds = new Set([
          ...userProjects.map(p => p.projectId),
          ...userOwnedProjects.map(p => p.id)
        ])
        
        if (!accessibleProjectIds.has(projectId)) {
          return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
        }
        where = eq(dbSchema.tasks.projectId, projectId)
      } else if (createdById) {
        // Only allow users to see their own created tasks
        if (createdById !== currentUserId) {
          return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
        }
        where = eq(dbSchema.tasks.createdById, currentUserId)
      } else {
        // No specific filters - get all tasks from accessible projects
        const userProjects = await db.select().from(dbSchema.projectTeam).where(eq(dbSchema.projectTeam.userId, currentUserId))
        const userOwnedProjects = await db.select().from(dbSchema.projects).where(eq(dbSchema.projects.ownerId, currentUserId))
        const accessibleProjectIds = [
          ...userProjects.map(p => p.projectId),
          ...userOwnedProjects.map(p => p.id)
        ]
        where = inArray(dbSchema.tasks.projectId, accessibleProjectIds)
      }
    } else {
      // Admin can access any tasks with provided filters
      if (projectId && assigneeId) {
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
      // If no filters for admin, return all tasks (where remains undefined)
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
    // Authenticate user
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    
    const currentUserId = payload.sub
    const isAdmin = payload.role === 'admin'

    const body = (await req.json()) as {
      projectId: string
      title: string
      description?: string
      status?: 'planning' | 'todo' | 'in-progress' | 'review' | 'done' | 'blocked' | 'postponed'
      priority: 'low' | 'medium' | 'high'
      startDate?: string
      dueDate?: string
      createdById: string
      approvalStatus?: 'pending' | 'approved' | 'rejected'
      assigneeIds?: string[]
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
      progress = 0,
      subtasks = [],
    } = body

    if (!projectId || !title || !priority || !createdById) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    // Check permissions: admin can create tasks in any project, others must have access to project
    if (!isAdmin) {
      // Check if user is owner or team member of the project
      const project = (await db.select().from(dbSchema.projects).where(eq(dbSchema.projects.id, projectId)))[0]
      if (!project) {
        return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
      }
      
      // Check if user is owner
      if (project.ownerId !== currentUserId) {
        // Check if user is team member
        const teamMembership = await db.select()
          .from(dbSchema.projectTeam)
          .where(eq(dbSchema.projectTeam.projectId, projectId))
          .where(eq(dbSchema.projectTeam.userId, currentUserId))
        
        if (teamMembership.length === 0) {
          return NextResponse.json({ success: false, error: 'Forbidden: You do not have access to this project' }, { status: 403 })
        }
      }
      
      // Non-admin users can only create tasks as themselves
      if (createdById !== currentUserId) {
        return NextResponse.json({ success: false, error: 'Forbidden: You can only create tasks as yourself' }, { status: 403 })
      }
    }

    // التحقق من صحة المستخدمين
    const validAssigneeIds = await validateUsers(assigneeIds)
    const allUserIds = await validateUsers([createdById, ...assigneeIds])
    
    if (!allUserIds.includes(createdById)) {
      return NextResponse.json({ success: false, error: 'Invalid creator user ID' }, { status: 400 })
    }

    const id = (globalThis.crypto?.randomUUID?.() ?? randomUUID()) as string
    const now = new Date()

    await db.insert(dbSchema.tasks).values({
      id,
      projectId,
      title,
      description,
      status,
      priority,
      startDate: startDate ? new Date(startDate) : now,
      dueDate: dueDate ? new Date(dueDate) : now,
      createdAt: now,
      updatedAt: now,
      completedAt: null,
      createdById,
      approvalStatus,
      approvedAt: null,
      approvedById: null,
      rejectionReason: null,
      progress,
    })

    if (validAssigneeIds.length) {
      await db.insert(dbSchema.taskAssignees).values(
        validAssigneeIds.map((userId: string) => ({ taskId: id, userId }))
      )
    }

    if (subtasks.length) {
      const subRows = subtasks.map(st => ({
        id: (globalThis.crypto?.randomUUID?.() ?? randomUUID()) as string,
        taskId: id,
        title: st.title,
        description: st.description ?? '',
        completed: false,
        startDate: st.startDate ? new Date(st.startDate) : null,
        dueDate: st.dueDate ? new Date(st.dueDate) : null,
        createdAt: now,
        updatedAt: now,
        assigneeId: st.assigneeId ?? null,
        priority: st.priority ?? null,
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

      // Notify admins and project leads so they can act on pending approvals
      if (approvalStatus === 'pending') {
        // Get admins
        const admins = await db
          .select({ id: dbSchema.users.id })
          .from(dbSchema.users)
          .where(eq(dbSchema.users.role, 'admin'))

        // Get project owner (project lead)
        const projectLead = await db
          .select({ id: dbSchema.users.id })
          .from(dbSchema.projects)
          .leftJoin(dbSchema.users, eq(dbSchema.projects.ownerId, dbSchema.users.id))
          .where(eq(dbSchema.projects.id, projectId))

        const adminRecipients = admins
          .map((row: { id: string }) => row.id)
          .filter((uid: string) => uid !== createdById)

        const projectLeadRecipients = projectLead
          .filter((row: any) => row.id && row.id !== createdById)
          .map((row: any) => row.id)

        // Notify admins
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

        // Notify project leads
        if (projectLeadRecipients.length) {
          const leadMessage = `New task "${title}" in your project needs approval.`
          await Promise.all(
            projectLeadRecipients.map((uid: string) =>
              notifyUser({
                userId: uid,
                type: 'task_pending_approval',
                title,
                message: leadMessage,
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
