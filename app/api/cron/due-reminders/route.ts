import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { and, eq, inArray } from 'drizzle-orm'
import { notifyUser } from '@/lib/notifications'

// GET /api/cron/due-reminders
// Intended to be triggered by a scheduler (e.g., Vercel Cron) or manually.
// Sends reminders for tasks due tomorrow to their assignees.
export async function GET(_req: NextRequest) {
  try {
    // Compute tomorrow's date in YYYY-MM-DD
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(now.getDate() + 1)
    const yyyy = tomorrow.getFullYear()
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0')
    const dd = String(tomorrow.getDate()).padStart(2, '0')
    const target = `${yyyy}-${mm}-${dd}`

    // Find tasks due tomorrow
    const dueTasks = await db.select().from(dbSchema.tasks).where(eq(dbSchema.tasks.dueDate, target))
    if (!dueTasks.length) return NextResponse.json({ success: true, data: { sent: 0 } })

    const taskIds = dueTasks.map((t: any) => t.id)
    // Load assignees
    const assignees = await db
      .select()
      .from(dbSchema.taskAssignees)
      .where(inArray(dbSchema.taskAssignees.taskId, taskIds))

    // Group by taskId
    const assigneesByTask = new Map<string, Array<{ userId: string }>>()
    for (const a of assignees as any[]) {
      const list = assigneesByTask.get(a.taskId) || []
      list.push({ userId: a.userId })
      assigneesByTask.set(a.taskId, list)
    }

    let sent = 0
    for (const task of dueTasks as any[]) {
      const users = assigneesByTask.get(task.id) || []
      await Promise.all(
        users.map((u) =>
          notifyUser({
            userId: u.userId,
            type: 'task_due_tomorrow',
            title: `Task due tomorrow: ${task.title}`,
            message: `The task "${task.title}" is due on ${task.dueDate}.`,
            relatedId: task.id,
            relatedType: 'task',
            topic: 'taskReminders',
          })
        )
      )
      sent += users.length
    }

    return NextResponse.json({ success: true, data: { sent, date: target } })
  } catch (error) {
    console.error('GET /api/cron/due-reminders error', error)
    return NextResponse.json({ success: false, error: 'Failed to send reminders' }, { status: 500 })
  }
}
