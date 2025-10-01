import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { db, dbSchema } from '@/lib/db/client'
import { eq } from 'drizzle-orm'
import { toISOString, toISOStringOrUndefined } from '@/lib/date-utils'

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
    const body = (await req.json()) as {
      taskId: string
      title: string
      description?: string
      assigneeId?: string
      startDate?: string
      dueDate?: string
      priority?: 'low' | 'medium' | 'high'
      status?: 'todo' | 'in-progress' | 'review' | 'done'
    }

    const { taskId, title, description = '', assigneeId = null, startDate = null, dueDate = null, priority = null, status = 'todo' } = body as any

    if (!taskId || !title) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const task = await db.select().from(dbSchema.tasks).where(eq(dbSchema.tasks.id, taskId))
    if (!task.length) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 })
    }
    const now = new Date()
    const id = (globalThis.crypto?.randomUUID?.() ?? randomUUID()) as string

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
      assigneeId,
      priority,
    })

    // rollups
    await recomputeTaskProgress(taskId)
    await recomputeProjectProgress(task[0].projectId)

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
      } 
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/subtasks error', error)
    return NextResponse.json({ success: false, error: 'Failed to create subtask' }, { status: 500 })
  }
}
