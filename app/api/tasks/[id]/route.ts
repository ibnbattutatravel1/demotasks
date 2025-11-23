import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { db, dbSchema } from '@/lib/db/client'
import { and, eq, inArray, or } from 'drizzle-orm'
import { notifyUser } from '@/lib/notifications'
import { toISOString, toISOStringOrUndefined } from '@/lib/date-utils'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'

async function recomputeTaskProgress(taskId: string) {
  const subtasks = await db.select().from(dbSchema.subtasks).where(eq(dbSchema.subtasks.taskId, taskId))
  if (!subtasks.length) return null
  const completed = subtasks.filter((s: any) => !!s.completed).length
  const total = subtasks.length
  const pct = Math.round((completed / total) * 100)
  await db.update(dbSchema.tasks).set({ progress: pct, updatedAt: new Date() }).where(eq(dbSchema.tasks.id, taskId))
  return pct
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const rows = await db.select().from(dbSchema.tasks).where(eq(dbSchema.tasks.id, id))
    if (!rows.length) return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 })
    
    const task = rows[0]
    
    // Check if task is rejected - only allow admin and task creator to view rejected tasks
    if (task.approvalStatus === 'rejected') {
      const { searchParams } = new URL(req.url)
      const userId = searchParams.get('userId')
      const userRows = userId ? await db.select().from(dbSchema.users).where(eq(dbSchema.users.id, userId)) : []
      const user = userRows[0]
      
      // Only admin or task creator can view rejected tasks
      if (!user || (user.role !== 'admin' && task.createdById !== userId)) {
        return NextResponse.json({ 
          success: false, 
          error: 'This task has been rejected and is no longer accessible.' 
        }, { status: 403 })
      }
    }
    
    const data = await composeTask(task)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('GET /api/tasks/[id] error', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch task' }, { status: 500 })
  }
}

async function recomputeProjectProgress(projectId: string) {
  const rows = await db.select({ progress: dbSchema.tasks.progress }).from(dbSchema.tasks).where(eq(dbSchema.tasks.projectId, projectId))
  const avg = Math.round(rows.reduce((s: number, r: { progress?: number | null }) => s + (r.progress || 0), 0) / rows.length)
  await db.update(dbSchema.projects).set({ progress: avg, updatedAt: new Date() }).where(eq(dbSchema.projects.id, projectId))
  return avg
}

// Optimized version - fetches subtasks first, then their comments and assignees
async function composeTask(task: any) {
  // First, get subtasks to know their IDs
  const subtasksData = await db.select().from(dbSchema.subtasks).where(eq(dbSchema.subtasks.taskId, task.id))
  const subtaskIds = subtasksData.map((st: any) => st.id)
  
  // Now fetch everything else in parallel
  const [assignees, creatorRows, taskComments, subtaskComments, subtaskAssigneeRelations] = await Promise.all([
    db.select().from(dbSchema.taskAssignees).where(eq(dbSchema.taskAssignees.taskId, task.id)).leftJoin(dbSchema.users, eq(dbSchema.taskAssignees.userId, dbSchema.users.id)),
    db.select().from(dbSchema.users).where(eq(dbSchema.users.id, task.createdById)),
    db.select().from(dbSchema.comments).where(and(eq(dbSchema.comments.entityType, 'task'), eq(dbSchema.comments.entityId, task.id))),
    subtaskIds.length > 0 
      ? db.select().from(dbSchema.comments).where(and(eq(dbSchema.comments.entityType, 'subtask'), inArray(dbSchema.comments.entityId, subtaskIds)))
      : Promise.resolve([]),
    subtaskIds.length > 0
      ? db.select().from(dbSchema.subtaskAssignees).where(inArray(dbSchema.subtaskAssignees.subtaskId, subtaskIds))
      : Promise.resolve([])
  ])
  
  // Build comment lookup map for subtasks
  const commentsByEntity: Record<string, any[]> = {}
  for (const c of subtaskComments) {
    const key = c.entityId
    if (!commentsByEntity[key]) commentsByEntity[key] = []
    commentsByEntity[key].push(c)
  }
  
  // Build assignee relationships map for subtasks
  const subtaskAssigneeMap: Record<string, string[]> = {}
  for (const relation of subtaskAssigneeRelations) {
    const key = relation.subtaskId
    if (!subtaskAssigneeMap[key]) subtaskAssigneeMap[key] = []
    subtaskAssigneeMap[key].push(relation.userId)
  }
  
  // Get unique assignee IDs from subtasks
  const subtaskAssigneeIds = [...new Set(subtaskAssigneeRelations.map((r: any) => r.userId).filter(Boolean))]
  
  // Fetch subtask assignees separately
  let subtaskAssignees: any[] = []
  if (subtaskAssigneeIds.length > 0) {
    // Fetch each assignee individually to avoid complex type issues
    const assigneePromises = subtaskAssigneeIds.map((id: any) => 
      db.select().from(dbSchema.users).where(eq(dbSchema.users.id, id))
    )
    const assigneeResults = await Promise.all(assigneePromises)
    subtaskAssignees = assigneeResults.flat()
  }
  
  // Build assignee lookup map for subtasks
  const assigneeMap: Record<string, any> = {}
  for (const assignee of subtaskAssignees) {
    assigneeMap[assignee.id] = {
      id: assignee.id,
      name: assignee.name,
      email: assignee.email,
      avatar: assignee.avatar,
      initials: assignee.initials,
    }
  }
  
  const assigneeUsers = assignees.map((row: any) => row.users).filter(Boolean)
  const subtaskList = subtasksData.map((st: any) => {
    const assigneeIds = subtaskAssigneeMap[st.id] || []
    const assignees = assigneeIds.map((id: string) => assigneeMap[id]).filter(Boolean)
    
    return {
      id: st.id,
      taskId: st.taskId,
      title: st.title,
      description: st.description,
      status: st.status,
      completed: !!st.completed,
      startDate: toISOStringOrUndefined(st.startDate),
      dueDate: toISOStringOrUndefined(st.dueDate),
      createdAt: toISOString(st.createdAt),
      updatedAt: toISOStringOrUndefined(st.updatedAt),
      assigneeIds,
      assignees,
      priority: st.priority,
      comments: (commentsByEntity[st.id] || []).map((c: any) => ({
        id: c.id,
        userId: c.userId,
        user: c.userName,
        avatar: c.avatar || undefined,
        content: c.content,
        createdAt: toISOString(c.createdAt),
        updatedAt: toISOStringOrUndefined(c.updatedAt),
      })),
    }
  })
  
  const subtasksCompleted = subtaskList.filter((s: any) => s.completed).length
  const totalSubtasks = subtaskList.length
  const createdBy = (creatorRows && creatorRows[0])
    ? {
        id: creatorRows[0].id,
        name: creatorRows[0].name,
        avatar: creatorRows[0].avatar,
        initials: creatorRows[0].initials,
      }
    : {
        id: task.createdById,
        name: `User ${task.createdById}`,
        avatar: null as unknown as string | null,
        initials: (task.createdById?.[0] || 'U').toUpperCase(),
      }

  // تحويل تواريخ الـ task الرئيسي
  return { 
    ...task, 
    startDate: toISOStringOrUndefined(task.startDate),
    dueDate: toISOStringOrUndefined(task.dueDate),
    createdAt: toISOString(task.createdAt),
    updatedAt: toISOStringOrUndefined(task.updatedAt),
    completedAt: toISOStringOrUndefined(task.completedAt),
    approvedAt: toISOStringOrUndefined(task.approvedAt),
    assignees: assigneeUsers, 
    subtasks: subtaskList, 
    subtasksCompleted, 
    totalSubtasks, 
    createdBy 
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate user
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    
    const currentUserId = payload.sub
    const isAdmin = payload.role === 'admin'

    const { id } = await params
    const body = (await req.json()) as Partial<{
      title: string
      description: string
      status: 'planning' | 'todo' | 'in-progress' | 'review' | 'done' | 'blocked' | 'postponed'
      priority: 'low' | 'medium' | 'high'
      startDate: string
      dueDate: string
      approvalStatus: 'pending' | 'approved' | 'rejected'
      approvedAt: string | null
      approvedById: string | null
      rejectionReason: string | null
      progress: number
      assigneeIds: string[]
    }>

    const existing = await db.select().from(dbSchema.tasks).where(eq(dbSchema.tasks.id, id))
    if (!existing.length) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 })
    }
    const current = existing[0]

    // Check permissions: admin can edit any task, others must have access to project
    if (!isAdmin) {
      // Get the project to check access
      const project = (await db.select().from(dbSchema.projects).where(eq(dbSchema.projects.id, current.projectId)))[0]
      if (!project) {
        return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
      }
      
      // Check if user is owner or team member of the project
      let hasAccess = project.ownerId === currentUserId
      
      if (!hasAccess) {
        const teamMembership = await db.select()
          .from(dbSchema.projectTeam)
          .where(eq(dbSchema.projectTeam.projectId, current.projectId))
          .where(eq(dbSchema.projectTeam.userId, currentUserId))
        
        hasAccess = teamMembership.length > 0
      }
      
      if (!hasAccess) {
        return NextResponse.json({ success: false, error: 'Forbidden: You do not have access to this project' }, { status: 403 })
      }
    }

    // Check if task is rejected - prevent non-admin users from editing rejected tasks
    // (unless they're changing the approval status back to pending/approved)
    if (current.approvalStatus === 'rejected' && body.approvalStatus !== 'pending' && body.approvalStatus !== 'approved') {
      // Only admin or task creator can modify rejected tasks
      if (!isAdmin && current.createdById !== currentUserId) {
        return NextResponse.json({ 
          success: false, 
          error: 'This task has been rejected and cannot be modified. Contact an admin for assistance.' 
        }, { status: 403 })
      }
    }

    const update: any = { updatedAt: new Date() }
    for (const key of ['title','description','status','priority','approvalStatus','approvedById','rejectionReason','progress'] as const) {
      if (key in body && body[key] !== undefined) (update as any)[key] = body[key as keyof typeof body]
    }
    
    // تحويل التواريخ من strings إلى Date objects
    if ('startDate' in body && body.startDate !== undefined) {
      update.startDate = body.startDate ? new Date(body.startDate) : null
    }
    if ('dueDate' in body && body.dueDate !== undefined) {
      update.dueDate = body.dueDate ? new Date(body.dueDate) : null
    }
    if ('approvedAt' in body && body.approvedAt !== undefined) {
      update.approvedAt = body.approvedAt ? new Date(body.approvedAt) : null
    }

    // Handle status transition side-effects for reports and progress
    const nowIso = new Date()
    const statusChanging = typeof body.status !== 'undefined' && body.status !== current.status
    if (statusChanging) {
      // When marking as done: set completedAt and progress=100 if not provided
      if (body.status === 'done') {
        if (typeof body.approvedAt === 'undefined') {
          // leave approvals alone
        }
        if (typeof update.completedAt === 'undefined') update.completedAt = nowIso
        if (typeof body.progress === 'undefined') update.progress = 100
      } else {
        // Moving away from done: clear completedAt and if no subtasks and progress not explicitly provided, set progress to 0
        if (typeof update.completedAt === 'undefined') update.completedAt = null
        if (typeof body.progress === 'undefined') {
          const subIds = await db.select({ id: dbSchema.subtasks.id }).from(dbSchema.subtasks).where(eq(dbSchema.subtasks.taskId, id))
          if (!subIds.length) update.progress = 0
        }
      }
    }

    if (Object.keys(update).length > 1) {
      await db.update(dbSchema.tasks).set(update).where(eq(dbSchema.tasks.id, id))
    }

    if (body.assigneeIds) {
      // replace assignees
      // capture existing before replacement to compute new ones
      const existingAssignees = await db
        .select({ userId: dbSchema.taskAssignees.userId })
        .from(dbSchema.taskAssignees)
        .where(eq(dbSchema.taskAssignees.taskId, id))
      const prevSet = new Set(existingAssignees.map((a: any) => a.userId))

      await db.delete(dbSchema.taskAssignees).where(eq(dbSchema.taskAssignees.taskId, id))
      if (body.assigneeIds.length) {
        try {
          // التحقق من أن جميع المستخدمين موجودين
          const existingUsers = await db
            .select({ id: dbSchema.users.id })
            .from(dbSchema.users)
            .where(inArray(dbSchema.users.id, body.assigneeIds))
          
          const existingUserIds = new Set(existingUsers.map((u: any) => u.id))
          const validAssigneeIds = body.assigneeIds.filter(id => existingUserIds.has(id))
          
          if (validAssigneeIds.length === 0) {
            console.warn('No valid users found for assignment')
            // لا نرمي خطأ - فقط نتخطى الإضافة
          } else {
            // Insert only valid assignees
            await db.insert(dbSchema.taskAssignees).values(
              validAssigneeIds.map((userId) => ({
                taskId: id,
                userId,
              }))
            )
          }
          
          // Update prevSet to only include valid users for notifications
          const validNewAssignees = validAssigneeIds.filter(uid => !prevSet.has(uid))

          // Notify new assignees
          try {
            if (validNewAssignees.length) {
              const title = current.title
              await Promise.all(validNewAssignees.map(uid =>
                db.insert(dbSchema.notifications).values({
                  id: randomUUID(),
                  type: 'task_assigned',
                  title,
                  message: 'You were assigned to a task.',
                  read: 0 as any,
                  userId: uid,
                  relatedId: id,
                  relatedType: 'task',
                })
              ))
            }
          } catch (e) {
            console.warn('Failed to create assignment notifications', e)
          }
        } catch (error) {
          console.error('Error updating assignees:', error)
          throw error
        }
      }
    }

    // rollups
    await recomputeTaskProgress(id)
    await recomputeProjectProgress(current.projectId)

    const fresh = (await db.select().from(dbSchema.tasks).where(eq(dbSchema.tasks.id, id)))[0]
    const data = await composeTask(fresh)

    // Notifications for approval status change
    try {
      if (body.approvalStatus && body.approvalStatus !== current.approvalStatus) {
        const title = current.title
        let notifType: string | null = null
        let message = ''
        if (body.approvalStatus === 'approved') { notifType = 'task_approved'; message = 'Your task has been approved.' }
        else if (body.approvalStatus === 'pending') { notifType = 'task_pending'; message = 'Your task is pending approval.' }
        else if (body.approvalStatus === 'rejected') { notifType = 'task_rejected'; message = 'Your task has been rejected.' }
        if (notifType) {
          // Notify task creator
          await db.insert(dbSchema.notifications).values({
            id: randomUUID(),
            type: notifType,
            title,
            message,
            read: 0 as any,
            userId: current.createdById,
            relatedId: id,
            relatedType: 'task',
          })

          // Notify all admins about approval status changes
          const admins = await db
            .select({ id: dbSchema.users.id })
            .from(dbSchema.users)
            .where(eq(dbSchema.users.role, 'admin'))

          const adminRecipients = admins
            .map((row: { id: string }) => row.id)
            .filter((uid: string) => uid !== current.createdById)

          if (adminRecipients.length) {
            const adminMessage = body.approvalStatus === 'approved' 
              ? `Task "${title}" has been approved.`
              : body.approvalStatus === 'rejected'
              ? `Task "${title}" has been rejected.`
              : `Task "${title}" status changed to ${body.approvalStatus}.`
            
            await Promise.all(
              adminRecipients.map((uid: string) =>
                db.insert(dbSchema.notifications).values({
                  id: randomUUID(),
                  type: `admin_${notifType}`,
                  title,
                  message: adminMessage,
                  read: 0 as any,
                  userId: uid,
                  relatedId: id,
                  relatedType: 'task',
                })
              )
            )
          }
        }
      }
    } catch (e) {
      console.warn('Failed to create approval status notification', e)
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('PATCH /api/tasks/[id] error', error)
    return NextResponse.json({ success: false, error: 'Failed to update task' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate user
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    
    const currentUserId = payload.sub
    const isAdmin = payload.role === 'admin'

    const { id } = await params
    const existing = await db.select().from(dbSchema.tasks).where(eq(dbSchema.tasks.id, id))
    if (!existing.length) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 })
    }
    const current = existing[0]

    // Check permissions: admin can delete any task, others must have access to project
    if (!isAdmin) {
      // Get the project to check access
      const project = (await db.select().from(dbSchema.projects).where(eq(dbSchema.projects.id, current.projectId)))[0]
      if (!project) {
        return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
      }
      
      // Check if user is owner or team member of the project
      let hasAccess = project.ownerId === currentUserId
      
      if (!hasAccess) {
        const teamMembership = await db.select()
          .from(dbSchema.projectTeam)
          .where(eq(dbSchema.projectTeam.projectId, current.projectId))
          .where(eq(dbSchema.projectTeam.userId, currentUserId))
        
        hasAccess = teamMembership.length > 0
      }
      
      if (!hasAccess) {
        return NextResponse.json({ success: false, error: 'Forbidden: You do not have access to this project' }, { status: 403 })
      }
    }

    // If user is not admin, notify admins about delete request
    if (!isAdmin) {
      // Notify all admins about the delete request
      const admins = await db
        .select({ id: dbSchema.users.id })
        .from(dbSchema.users)
        .where(eq(dbSchema.users.role, 'admin'))

      if (admins.length > 0) {
        console.log(`[DELETE REQUEST] User ${currentUserId} requesting to delete task "${current.title}" (${id})`)
        console.log(`[DELETE REQUEST] Notifying ${admins.length} admin(s)`)
        
        await Promise.all(
          admins.map((admin: { id: string }) =>
            notifyUser({
              userId: admin.id,
              type: 'task_delete_request',
              title: `Task Delete Request: ${current.title}`,
              message: `User requested to delete task "${current.title}". Please review this request.`,
              relatedId: id,
              relatedType: 'task',
              topic: 'taskUpdates',
            })
          )
        )
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Delete request submitted for admin review' 
      })
    }

    // If admin, proceed with deletion
    // delete children and relations
    await db.delete(dbSchema.subtaskTags).where(inArray(
      dbSchema.subtaskTags.subtaskId,
      (await db
        .select({ id: dbSchema.subtasks.id })
        .from(dbSchema.subtasks)
        .where(eq(dbSchema.subtasks.taskId, id))
      ).map((r: any) => r.id)
    ))
    await db.delete(dbSchema.subtasks).where(eq(dbSchema.subtasks.taskId, id))
    await db.delete(dbSchema.taskAssignees).where(eq(dbSchema.taskAssignees.taskId, id))
    await db.delete(dbSchema.taskTags).where(eq(dbSchema.taskTags.taskId, id))
    await db.delete(dbSchema.comments).where(and(eq(dbSchema.comments.entityType, 'task'), eq(dbSchema.comments.entityId, id)))
    await db.delete(dbSchema.attachments).where(and(eq(dbSchema.attachments.entityType, 'task'), eq(dbSchema.attachments.entityId, id)))

    await db.delete(dbSchema.tasks).where(eq(dbSchema.tasks.id, id))

    await recomputeProjectProgress(current.projectId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/tasks/[id] error', error)
    return NextResponse.json({ success: false, error: 'Failed to delete task' }, { status: 500 })
  }
}
