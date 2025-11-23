import { NextRequest, NextResponse } from "next/server"
import { db, dbSchema } from "@/lib/db/client"
import { and, eq, gte, lte, inArray, not } from "drizzle-orm"
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
    const weekStartStr = formatDate(weekStart)
    const weekEndStr = formatDate(new Date(weekEnd.getTime() - 1))

    const upcomingTasks = await db
      .select({
        id: dbSchema.tasks.id,
        title: dbSchema.tasks.title,
        dueDate: dbSchema.tasks.dueDate,
        status: dbSchema.tasks.status,
        createdById: dbSchema.tasks.createdById,
      })
      .from(dbSchema.tasks)
      .where(
        and(
          gte(dbSchema.tasks.dueDate, weekStartStr as any),
          lte(dbSchema.tasks.dueDate, weekEndStr as any),
          not(eq(dbSchema.tasks.status, "done" as any)),
        ),
      )

    if (!upcomingTasks.length) {
      return NextResponse.json({ success: true, data: { usersNotified: 0, tasksCount: 0 } })
    }

    const taskIds = upcomingTasks.map((t: any) => t.id)

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

    const tasksByUser = new Map<string, { id: string; title: string; dueDate: string }[]>()

    for (const task of upcomingTasks) {
      const recipients = assigneesByTask.get(task.id) || []
      const targetUsers = recipients.length ? recipients : [task.createdById]

      for (const uid of targetUsers) {
        if (!uid) continue
        const list = tasksByUser.get(uid) || []
        list.push({ id: task.id, title: task.title, dueDate: task.dueDate as any })
        tasksByUser.set(uid, list)
      }
    }

    let usersNotified = 0

    for (const [userId, tasks] of tasksByUser.entries()) {
      if (!tasks.length) continue

      const total = tasks.length
      const topTasks = tasks
        .slice()
        .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""))
        .slice(0, 7)

      const lines = topTasks
        .map((t) => {
          const due = t.dueDate || "this week"
          return `• ${t.title} (due ${due})`
        })
        .join("<br>")

      const more = total > topTasks.length ? `<br>...and ${total - topTasks.length} more scheduled this week.` : ""

      const message = [
        `Here is a snapshot of your tasks scheduled between ${weekStartStr} and ${weekEndStr}.`,
        "<br><br>",
        "Focus for this week:",
        "<br>",
        lines,
        more,
        "<br><br>",
        "You have a solid plan in front of you. Tackle one task at a time, start with the most important items, and keep moving forward.",
      ].join("")

      await notifyUser({
        userId,
        type: "task_weekly_plan",
        title: "Your tasks for this week",
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
        tasksCount: upcomingTasks.length,
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
      },
    })
  } catch (error) {
    console.error("GET /api/cron/weekly-planning error", error)
    return NextResponse.json({ success: false, error: "Failed to send weekly planning emails" }, { status: 500 })
  }
}
