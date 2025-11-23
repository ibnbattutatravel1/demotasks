import { NextRequest, NextResponse } from "next/server"
import { db, dbSchema } from "@/lib/db/client"
import { and, eq, gte, lt, inArray } from "drizzle-orm"
import { notifyUser } from "@/lib/notifications"

function getThisWeekRange(now: Date) {
  const day = now.getDay()
  const diffToMonday = (day + 6) % 7
  const start = new Date(now)
  start.setDate(now.getDate() - diffToMonday)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 7)
  end.setHours(0, 0, 0, 0)
  return { start, end }
}

function formatDate(date: Date) {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

export async function GET(req: NextRequest) {
  try {
    const secret = req.nextUrl.searchParams.get("secret")
    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const { start: weekStart, end: weekEnd } = getThisWeekRange(now)

    const completedTasks = await db
      .select({
        id: dbSchema.tasks.id,
        title: dbSchema.tasks.title,
        completedAt: dbSchema.tasks.completedAt,
        createdById: dbSchema.tasks.createdById,
      })
      .from(dbSchema.tasks)
      .where(
        and(
          eq(dbSchema.tasks.status, "done"),
          gte(dbSchema.tasks.completedAt, weekStart),
          lt(dbSchema.tasks.completedAt, weekEnd),
        ),
      )

    if (!completedTasks.length) {
      return NextResponse.json({ success: true, data: { usersNotified: 0, tasksCount: 0 } })
    }

    const taskIds = completedTasks.map((t) => t.id)

    const assignees = await db
      .select({ taskId: dbSchema.taskAssignees.taskId, userId: dbSchema.taskAssignees.userId })
      .from(dbSchema.taskAssignees)
      .where(inArray(dbSchema.taskAssignees.taskId, taskIds))

    const assigneesByTask = new Map<string, string[]>()
    for (const row of assignees) {
      const list = assigneesByTask.get(row.taskId) || []
      list.push(row.userId)
      assigneesByTask.set(row.taskId, list)
    }

    const tasksByUser = new Map<string, { id: string; title: string }[]>()

    for (const task of completedTasks) {
      const recipients = assigneesByTask.get(task.id) || []
      const targetUsers = recipients.length ? recipients : [task.createdById]

      for (const uid of targetUsers) {
        if (!uid) continue
        const list = tasksByUser.get(uid) || []
        list.push({ id: task.id, title: task.title })
        tasksByUser.set(uid, list)
      }
    }

    let usersNotified = 0
    const weekStartStr = formatDate(weekStart)
    const weekEndStr = formatDate(new Date(weekEnd.getTime() - 1))

    for (const [userId, tasks] of tasksByUser.entries()) {
      if (!tasks.length) continue

      const total = tasks.length
      const topTasks = tasks.slice(0, 5)
      const lines = topTasks.map((t) => `• ${t.title}`).join("<br>")
      const more = total > 5 ? `<br>...and ${total - 5} more.` : ""

      const message = [
        `You wrapped up ${total} task${total === 1 ? "" : "s"} between ${weekStartStr} and ${weekEndStr}.`,
        "<br><br>",
        "Highlights:",
        "<br>",
        lines,
        more,
        "<br><br>",
        "Nice work closing out the week with progress on your tasks. Keep this momentum going into next week!",
      ].join("")

      await notifyUser({
        userId,
        type: "task_weekly_summary",
        title: "Your weekly task summary",
        message,
        topic: "taskReminders",
        metadata: { tasksCount: total, weekStart: weekStartStr, weekEnd: weekEndStr },
      })

      usersNotified += 1
    }

    return NextResponse.json({
      success: true,
      data: {
        usersNotified,
        tasksCount: completedTasks.length,
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
      },
    })
  } catch (error) {
    console.error("GET /api/cron/weekly-summary error", error)
    return NextResponse.json({ success: false, error: "Failed to send weekly summaries" }, { status: 500 })
  }
}
