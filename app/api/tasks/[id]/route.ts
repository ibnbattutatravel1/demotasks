import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { db, dbSchema } from '@/lib/db/client'
import { and, eq, inArray, notInArray } from 'drizzle-orm'

async function recomputeTaskProgress(taskId: string) {
  const subtasks = await db.select().from(dbSchema.subtasks).where(eq(dbSchema.subtasks.taskId, taskId))
  if (!subtasks.length) return null
  const completed = subtasks.filter((s) => !!s.completed).length
  const total = subtasks.length
  const pct = Math.round((completed / total) * 100)
  await db.update(dbSchema.tasks).set({ progress: pct, updatedAt: new Date().toISOString() }).where(eq(dbSchema.tasks.id, taskId))
  return pct
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const rows = await db.select().from(dbSchema.tasks).where(eq(dbSchema.tasks.id, id))
    if (!rows.length) return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 })
    const data = await composeTask(rows[0])
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('GET /api/tasks/[id] error', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch task' }, { status: 500 })
  }
}

async function recomputeProjectProgress(projectId: string) {
  const rows = await db.select({ progress: dbSchema.tasks.progress }).from(dbSchema.tasks).where(eq(dbSchema.tasks.projectId, projectId))
  if (!rows.length) return null
  const avg = Math.round(rows.reduce((s, r) => s + (r.progress || 0), 0) / rows.length)
  await db.update(dbSchema.projects).set({ progress: avg, updatedAt: new Date().toISOString() }).where(eq(dbSchema.projects.id, projectId))
  return avg
}

async function composeTask(task: any) {
  const [assignees, tags, subtasks] = await Promise.all([
    db.select().from(dbSchema.taskAssignees).where(eq(dbSchema.taskAssignees.taskId, task.id)).leftJoin(dbSchema.users, eq(dbSchema.taskAssignees.userId, dbSchema.users.id)),
    db.select().from(dbSchema.taskTags).where(eq(dbSchema.taskTags.taskId, task.id)),
    db.select().from(dbSchema.subtasks).where(eq(dbSchema.subtasks.taskId, task.id)),
  ])
  const assigneeUsers = assignees.map((row) => row.users).filter(Boolean)
  const tagList = tags.map((t) => t.tag)
  const subtaskList = subtasks.map((st) => ({
    id: st.id,
    taskId: st.taskId,
    title: st.title,
    description: st.description,
    status: st.status,
    completed: !!st.completed,
    startDate: st.startDate,
    dueDate: st.dueDate,
    createdAt: st.createdAt,
    updatedAt: st.updatedAt,
    assigneeId: st.assigneeId,
    priority: st.priority,
  }))
  const subtasksCompleted = subtaskList.filter((s) => s.completed).length
  const totalSubtasks = subtaskList.length
  return { ...task, assignees: assigneeUsers, tags: tagList, subtasks: subtaskList, subtasksCompleted, totalSubtasks }
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

    const update: any = { updatedAt: new Date().toISOString() }
    for (const key of ['title','description','status','priority','startDate','dueDate','approvalStatus','approvedAt','approvedById','rejectionReason','progress'] as const) {
      if (key in body && body[key] !== undefined) (update as any)[key] = body[key as keyof typeof body]
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
      const prevSet = new Set(existingAssignees.map(a => a.userId))

      await db.delete(dbSchema.taskAssignees).where(eq(dbSchema.taskAssignees.taskId, id))
      if (body.assigneeIds.length) {
        try {
          // Ensure all users exist
          await Promise.all(
            body.assigneeIds.map((userId) =>
              db
                .insert(dbSchema.users)
                .values({
                  id: userId,
                  name: `User ${userId}`,
                  email: `${userId}@example.com`,
                  initials: (userId[0] || 'U').toUpperCase(),
                  role: 'user',
                })
                .onConflictDoNothing()
            )
          )
          
          // Insert new assignees (schema has composite PK: taskId + userId)
          await db.insert(dbSchema.taskAssignees).values(
            body.assigneeIds.map((userId) => ({
              taskId: id,
              userId,
            }))
          )

          // Notify new assignees
          try {
            const newAssignees = body.assigneeIds.filter(uid => !prevSet.has(uid))
            if (newAssignees.length) {
              const title = current.title
              await Promise.all(newAssignees.map(uid =>
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
              createdAt: new Date().toISOString(),
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

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const existing = await db.select().from(dbSchema.tasks).where(eq(dbSchema.tasks.id, id))
    if (!existing.length) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 })
    }
    const current = existing[0]

    // delete children and relations
    await db.delete(dbSchema.subtaskTags).where(inArray(dbSchema.subtaskTags.subtaskId,
      (await db.select({ id: dbSchema.subtasks.id }).from(dbSchema.subtasks).where(eq(dbSchema.subtasks.taskId, id))).map(r => r.id)
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
