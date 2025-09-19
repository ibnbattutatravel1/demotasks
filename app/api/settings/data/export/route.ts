import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'
import { and, eq, inArray, not } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const userId = payload.sub

    const user = (await db.select().from(dbSchema.users).where(eq(dbSchema.users.id, userId)))[0]
    const settings = (await db.select().from(dbSchema.userSettings).where(eq(dbSchema.userSettings.userId, userId)))[0]
    const pushSubs = await db.select().from(dbSchema.pushSubscriptions).where(eq(dbSchema.pushSubscriptions.userId, userId))
    const notifs = await db.select().from(dbSchema.notifications).where(eq(dbSchema.notifications.userId, userId))

    // Projects owned by user
    const projects = await db.select().from(dbSchema.projects).where(eq(dbSchema.projects.ownerId, userId))
    const projectIds = projects.map((p: any) => p.id)
    const team = projectIds.length
      ? await db.select().from(dbSchema.projectTeam).where(inArray(dbSchema.projectTeam.projectId, projectIds))
      : []
    const tags = projectIds.length
      ? await db.select().from(dbSchema.projectTags).where(inArray(dbSchema.projectTags.projectId, projectIds))
      : []

    // Tasks within owned projects
    const tasksInOwned = projectIds.length
      ? await db.select().from(dbSchema.tasks).where(inArray(dbSchema.tasks.projectId, projectIds))
      : []
    const taskIdsInOwned = tasksInOwned.map((t: any) => t.id)

    // Tasks created by the user but outside owned projects
    let otherTasksByUser: any[] = []
    if (taskIdsInOwned.length) {
      otherTasksByUser = await db
        .select()
        .from(dbSchema.tasks)
        .where(and(eq(dbSchema.tasks.createdById, userId), not(inArray(dbSchema.tasks.id, taskIdsInOwned))))
    } else {
      otherTasksByUser = await db
        .select()
        .from(dbSchema.tasks)
        .where(eq(dbSchema.tasks.createdById, userId))
    }

    const allUserTasks = [...tasksInOwned, ...otherTasksByUser]
    const allTaskIds = allUserTasks.map((t: any) => t.id)

    const taskAssignees = allTaskIds.length
      ? await db.select().from(dbSchema.taskAssignees).where(inArray(dbSchema.taskAssignees.taskId, allTaskIds))
      : []
    const taskTags = allTaskIds.length
      ? await db.select().from(dbSchema.taskTags).where(inArray(dbSchema.taskTags.taskId, allTaskIds))
      : []
    const subtasks = allTaskIds.length
      ? await db.select().from(dbSchema.subtasks).where(inArray(dbSchema.subtasks.taskId, allTaskIds))
      : []
    const subtaskIds = subtasks.map((s: any) => s.id)

    const commentsTasks = allTaskIds.length
      ? await db.select().from(dbSchema.comments).where(and(eq(dbSchema.comments.entityType, 'task'), inArray(dbSchema.comments.entityId, allTaskIds)))
      : []
    const commentsSubtasks = subtaskIds.length
      ? await db.select().from(dbSchema.comments).where(and(eq(dbSchema.comments.entityType, 'subtask'), inArray(dbSchema.comments.entityId, subtaskIds)))
      : []

    const attachmentsTasks = allTaskIds.length
      ? await db.select().from(dbSchema.attachments).where(inArray(dbSchema.attachments.entityId, allTaskIds))
      : []
    const attachmentsSubtasks = subtaskIds.length
      ? await db.select().from(dbSchema.attachments).where(inArray(dbSchema.attachments.entityId, subtaskIds))
      : []
    const attachmentsProjects = projectIds.length
      ? await db.select().from(dbSchema.attachments).where(inArray(dbSchema.attachments.entityId, projectIds))
      : []

    const exportData = {
      exportedAt: new Date().toISOString(),
      user,
      settings,
      pushSubscriptions: pushSubs,
      notifications: notifs,
      projects,
      projectTeam: team,
      projectTags: tags,
      tasks: allUserTasks,
      taskAssignees,
      taskTags,
      subtasks,
      comments: [...commentsTasks, ...commentsSubtasks],
      attachments: [...attachmentsTasks, ...attachmentsSubtasks, ...attachmentsProjects],
    }

    return NextResponse.json({ success: true, data: exportData })
  } catch (error) {
    console.error('GET /api/settings/data/export error', error)
    return NextResponse.json({ success: false, error: 'Failed to export data' }, { status: 500 })
  }
}
