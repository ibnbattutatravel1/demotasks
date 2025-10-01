import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { db, dbSchema } from '@/lib/db/client'
import { and, eq, inArray } from 'drizzle-orm'
import { notifyUser } from '@/lib/notifications'
import { toISOString, toISOStringOrUndefined } from '@/lib/date-utils'

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

// Optimized version - fetches subtasks first, then their comments
async function composeTask(task: any) {
  // First, get subtasks to know their IDs
  const subtasksData = await db.select().from(dbSchema.subtasks).where(eq(dbSchema.subtasks.taskId, task.id))
  const subtaskIds = subtasksData.map((st: any) => st.id)
  
  // Now fetch everything else in parallel
  const [assignees, tags, creatorRows, taskComments, subtaskComments] = await Promise.all([
    db.select().from(dbSchema.taskAssignees).where(eq(dbSchema.taskAssignees.taskId, task.id)).leftJoin(dbSchema.users, eq(dbSchema.taskAssignees.userId, dbSchema.users.id)),
    db.select().from(dbSchema.taskTags).where(eq(dbSchema.taskTags.taskId, task.id)),
    db.select().from(dbSchema.users).where(eq(dbSchema.users.id, task.createdById)),
    db.select().from(dbSchema.comments).where(and(eq(dbSchema.comments.entityType, 'task'), eq(dbSchema.comments.entityId, task.id))),
    subtaskIds.length > 0 
      ? db.select().from(dbSchema.comments).where(and(eq(dbSchema.comments.entityType, 'subtask'), inArray(dbSchema.comments.entityId, subtaskIds)))
      : Promise.resolve([])
  ])
  
  // Build comment lookup map for subtasks
  const commentsByEntity: Record<string, any[]> = {}
  for (const c of subtaskComments) {
    const key = c.entityId
    if (!commentsByEntity[key]) commentsByEntity[key] = []
    commentsByEntity[key].push(c)
  }
  
  const assigneeUsers = assignees.map((row: any) => row.users).filter(Boolean)
  const tagList = tags.map((t: any) => t.tag)
  const subtaskList = subtasksData.map((st: any) => ({
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
    assigneeId: st.assigneeId,
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
  }))
  
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
    tags: tagList, 
    subtasks: subtaskList, 
    subtasksCompleted, 
    totalSubtasks, 
    createdBy 
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = (await req.json()) as Partial<{
      title: string
      description: string
      status: 'planning' | 'todo' | 'in-progress' | 'review' | 'done'
      priority: 'low' | 'medium' | 'high'
      startDate: string
      dueDate: string
      approvalStatus: 'pending' | 'approved' | 'rejected'
      approvedAt: string | null
      approvedById: string | null
      rejectionReason: string | null
      progress: number
      assigneeIds: string[]
      tags: string[]
    }>

    const existing = await db.select().from(dbSchema.tasks).where(eq(dbSchema.tasks.id, id))
    if (!existing.length) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 })
    }
    const current = existing[0]

    // Check if task is rejected - prevent non-admin users from editing rejected tasks
    // (unless they're changing the approval status back to pending/approved)
    if (current.approvalStatus === 'rejected' && body.approvalStatus !== 'pending' && body.approvalStatus !== 'approved') {
      // Get userId from request headers or body
      const userIdFromBody = (body as any).userId
      if (userIdFromBody) {
        const userRows = await db.select().from(dbSchema.users).where(eq(dbSchema.users.id, userIdFromBody))
        const user = userRows[0]
        
        // Only admin or task creator can modify rejected tasks
        if (user && user.role !== 'admin' && current.createdById !== userIdFromBody) {
          return NextResponse.json({ 
            success: false, 
            error: 'This task has been rejected and cannot be modified. Contact an admin for assistance.' 
          }, { status: 403 })
        }
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

    if (body.tags) {
      try {
        await db.delete(dbSchema.taskTags).where(eq(dbSchema.taskTags.taskId, id))
        if (body.tags.length) {
          await db.insert(dbSchema.taskTags).values(
            body.tags.map((tag) => ({
              id: randomUUID(),
              taskId: id,
              tag,
              createdAt: new Date(),
            }))
          )
        }
      } catch (error) {
        console.error('Error updating tags:', error)
        throw error
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
    const { id } = await params
    const existing = await db.select().from(dbSchema.tasks).where(eq(dbSchema.tasks.id, id))
    if (!existing.length) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 })
    }
    const current = existing[0]

    // Check if user is admin or task creator
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID is required for delete operations' 
      }, { status: 400 })
    }
    
    const userRows = await db.select().from(dbSchema.users).where(eq(dbSchema.users.id, userId))
    const user = userRows[0]
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 })
    }

    // If user is not admin, notify admins about delete request
    if (user.role !== 'admin') {
      // Notify all admins about the delete request
      const admins = await db
        .select({ id: dbSchema.users.id })
        .from(dbSchema.users)
        .where(eq(dbSchema.users.role, 'admin'))

      if (admins.length > 0) {
        console.log(`[DELETE REQUEST] User ${user.name} (${user.id}) requesting to delete task "${current.title}" (${id})`)
        console.log(`[DELETE REQUEST] Notifying ${admins.length} admin(s)`)
        
        await Promise.all(
          admins.map((admin: { id: string }) =>
            notifyUser({
              userId: admin.id,
              type: 'task_delete_request',
              title: `Delete request for: ${current.title}`,
              message: `${user.name} has requested to delete the task "${current.title}".`,
              relatedId: id,
              relatedType: 'task',
              topic: 'projectUpdates',
            })
          )
        )
        
        console.log(`[DELETE REQUEST] Notifications sent successfully to all admins`)
      } else {
        console.warn(`[DELETE REQUEST] No admins found to notify about delete request`)
      }

      // Don't actually delete the task - just notify admins
      return NextResponse.json({ 
        success: true, 
        message: 'Delete request sent to admin for approval.',
        pending: true 
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
