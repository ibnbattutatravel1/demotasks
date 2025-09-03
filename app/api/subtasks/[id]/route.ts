import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { and, eq } from 'drizzle-orm'

async function recomputeTaskProgress(taskId: string) {
  const subtasks = await db.select().from(dbSchema.subtasks).where(eq(dbSchema.subtasks.taskId, taskId))
  if (!subtasks.length) return null
  const completed = subtasks.filter((s) => !!s.completed).length
  const total = subtasks.length
  const pct = Math.round((completed / total) * 100)
  await db.update(dbSchema.tasks).set({ progress: pct, updatedAt: new Date().toISOString() }).where(eq(dbSchema.tasks.id, taskId))
  return pct
}

async function recomputeProjectProgress(projectId: string) {
  const rows = await db.select({ progress: dbSchema.tasks.progress }).from(dbSchema.tasks).where(eq(dbSchema.tasks.projectId, projectId))
  if (!rows.length) return null
  const avg = Math.round(rows.reduce((s, r) => s + (r.progress || 0), 0) / rows.length)
  await db.update(dbSchema.projects).set({ progress: avg, updatedAt: new Date().toISOString() }).where(eq(dbSchema.projects.id, projectId))
  return avg
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = (await req.json()) as Partial<{
      title: string
      description: string | null
      completed: boolean
      assigneeId: string | null
      startDate: string | null
      dueDate: string | null
      priority: 'low' | 'medium' | 'high' | null
    }>

    const existing = await db.select().from(dbSchema.subtasks).where(eq(dbSchema.subtasks.id, id))
    if (!existing.length) {
      return NextResponse.json({ success: false, error: 'Subtask not found' }, { status: 404 })
    }
    const current = existing[0]

    const update: any = { updatedAt: new Date().toISOString() }
    for (const key of ['title','description','assigneeId','startDate','dueDate','priority'] as const) {
      if (key in body) (update as any)[key] = body[key]
    }
    if (body.completed !== undefined) (update as any).completed = body.completed ? 1 : 0

    await db.update(dbSchema.subtasks).set(update).where(eq(dbSchema.subtasks.id, id))

    const parentTask = (await db.select().from(dbSchema.tasks).where(eq(dbSchema.tasks.id, current.taskId)))[0]
    await recomputeTaskProgress(current.taskId)
    await recomputeProjectProgress(parentTask.projectId)

    const fresh = (await db.select().from(dbSchema.subtasks).where(eq(dbSchema.subtasks.id, id)))[0]
    return NextResponse.json({ success: true, data: { ...fresh, completed: !!fresh.completed } })
  } catch (error) {
    console.error('PATCH /api/subtasks/[id] error', error)
    return NextResponse.json({ success: false, error: 'Failed to update subtask' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const existing = await db.select().from(dbSchema.subtasks).where(eq(dbSchema.subtasks.id, id))
    if (!existing.length) {
      return NextResponse.json({ success: false, error: 'Subtask not found' }, { status: 404 })
    }
    const current = existing[0]

    await db.delete(dbSchema.subtaskTags).where(eq(dbSchema.subtaskTags.subtaskId, id))
    await db.delete(dbSchema.comments).where(and(eq(dbSchema.comments.entityType, 'subtask'), eq(dbSchema.comments.entityId, id)))
    await db.delete(dbSchema.attachments).where(and(eq(dbSchema.attachments.entityType, 'subtask'), eq(dbSchema.attachments.entityId, id)))
    await db.delete(dbSchema.subtasks).where(eq(dbSchema.subtasks.id, id))

    const parentTask = (await db.select().from(dbSchema.tasks).where(eq(dbSchema.tasks.id, current.taskId)))[0]
    await recomputeTaskProgress(current.taskId)
    await recomputeProjectProgress(parentTask.projectId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/subtasks/[id] error', error)
    return NextResponse.json({ success: false, error: 'Failed to delete subtask' }, { status: 500 })
  }
}
