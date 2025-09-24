import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'
import { randomUUID } from 'node:crypto'
import { db, dbSchema } from '@/lib/db/client'
import { notifyUser } from '@/lib/notifications'
import { and, eq } from 'drizzle-orm'

// GET /api/comments?entityType=task|subtask&entityId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const entityType = searchParams.get('entityType') as 'task' | 'subtask' | null
    const entityId = searchParams.get('entityId')
    if (!entityType || !entityId) {
      return NextResponse.json({ success: false, error: 'Missing entityType or entityId' }, { status: 400 })
    }

    const rows = await db
      .select()
      .from(dbSchema.comments)
      .where(and(eq(dbSchema.comments.entityType, entityType), eq(dbSchema.comments.entityId, entityId)))

    // Sort by createdAt ascending for conversation feel
    rows.sort((a: { createdAt?: string }, b: { createdAt?: string }) => (a.createdAt || '').localeCompare(b.createdAt || ''))

    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    console.error('GET /api/comments error', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch comments' }, { status: 500 })
  }
}

// POST /api/comments
// body: { entityType: 'task'|'subtask', entityId: string, userId: string, userName: string, avatar?: string, content: string }
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      entityType: 'task' | 'subtask'
      entityId: string
      content: string
      mentions?: string[]
    }

    if (!body?.entityType || !body?.entityId || !body?.content?.trim()) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    // Authenticate user via JWT cookie
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    let userIdFromToken: string
    try {
      const payload = await verifyAuthToken(token)
      userIdFromToken = String(payload.sub)
    } catch {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Load user to attach display fields
    const userRow = (
      await db.select().from(dbSchema.users).where(eq(dbSchema.users.id, userIdFromToken))
    )[0]
    if (!userRow) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })

    const now = new Date().toISOString()
    const id = randomUUID()

    await db.insert(dbSchema.comments).values({
      id,
      entityType: body.entityType,
      entityId: body.entityId,
      userId: userRow.id,
      userName: userRow.name,
      avatar: userRow.avatar || null,
      content: body.content.trim(),
      createdAt: now,
      updatedAt: now,
    })

    // Notifications: notify stakeholders for tasks/subtasks, excluding the author
    try {
      if (body.entityType === 'task') {
        const task = (await db.select().from(dbSchema.tasks).where(eq(dbSchema.tasks.id, body.entityId)))[0]
        if (task) {
          const assignees = await db
            .select({ userId: dbSchema.taskAssignees.userId })
            .from(dbSchema.taskAssignees)
            .where(eq(dbSchema.taskAssignees.taskId, task.id))
          const recipients = new Set<string>([task.createdById, ...assignees.map((a: { userId: string }) => a.userId)])
          // Add mentions explicitly
          for (const m of (body.mentions || [])) recipients.add(m)
          recipients.delete(userRow.id) // exclude author
          if (recipients.size) {
            const title = task.title
            const message = `${userRow.name} commented on a task.`
            await Promise.all(
              Array.from(recipients).map(uid =>
                notifyUser({
                  userId: uid,
                  type: (body.mentions || []).includes(uid) ? 'mention' : 'task_commented',
                  title,
                  message: (body.mentions || []).includes(uid) ? `${userRow.name} mentioned you in a task comment.` : message,
                  relatedId: task.id,
                  relatedType: 'task',
                  topic: 'projectUpdates',
                })
              )
            )
          }
        }
      } else if (body.entityType === 'subtask') {
        const subt = (await db.select().from(dbSchema.subtasks).where(eq(dbSchema.subtasks.id, body.entityId)))[0]
        if (subt) {
          const task = (await db.select().from(dbSchema.tasks).where(eq(dbSchema.tasks.id, subt.taskId)))[0]
          const assignees = await db
            .select({ userId: dbSchema.taskAssignees.userId })
            .from(dbSchema.taskAssignees)
            .where(eq(dbSchema.taskAssignees.taskId, subt.taskId))
          const recipients = new Set<string>([task?.createdById, subt.assigneeId, ...assignees.map((a: { userId: string }) => a.userId)].filter(Boolean) as string[])
          for (const m of (body.mentions || [])) recipients.add(m)
          recipients.delete(userRow.id)
          if (recipients.size) {
            const title = task?.title || 'Subtask'
            const message = `${userRow.name} commented on a subtask.`
            await Promise.all(
              Array.from(recipients).map(uid =>
                notifyUser({
                  userId: uid,
                  type: (body.mentions || []).includes(uid) ? 'mention' : 'task_commented',
                  title,
                  message: (body.mentions || []).includes(uid) ? `${userRow.name} mentioned you in a subtask comment.` : message,
                  relatedId: subt.taskId,
                  relatedType: 'task',
                  topic: 'projectUpdates',
                })
              )
            )
          }
        }
      }
    } catch (e) {
      console.warn('Failed to create comment notifications', e)
    }

    const created = (await db.select().from(dbSchema.comments).where(eq(dbSchema.comments.id, id)))[0]
    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (error) {
    console.error('POST /api/comments error', error)
    return NextResponse.json({ success: false, error: 'Failed to create comment' }, { status: 500 })
  }
}
