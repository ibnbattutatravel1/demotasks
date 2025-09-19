import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'
import { and, eq, inArray, not } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const userId = payload.sub

    // Projects owned by user
    const projects = await db.select({ id: dbSchema.projects.id }).from(dbSchema.projects).where(eq(dbSchema.projects.ownerId, userId))
    const projectIds = projects.map((p: any) => p.id)

    // Tasks in owned projects
    const tasksInOwned = projectIds.length
      ? await db.select({ id: dbSchema.tasks.id }).from(dbSchema.tasks).where(inArray(dbSchema.tasks.projectId, projectIds))
      : []
    const taskIdsInOwned = tasksInOwned.map((t: any) => t.id)

    // Other tasks created by this user (not in owned projects)
    let otherTasksByUser: Array<{ id: string }> = []
    if (taskIdsInOwned.length) {
      otherTasksByUser = await db
        .select({ id: dbSchema.tasks.id })
        .from(dbSchema.tasks)
        .where(and(eq(dbSchema.tasks.createdById, userId), not(inArray(dbSchema.tasks.id, taskIdsInOwned))))
    } else {
      otherTasksByUser = await db
        .select({ id: dbSchema.tasks.id })
        .from(dbSchema.tasks)
        .where(eq(dbSchema.tasks.createdById, userId))
    }
    const otherTaskIds = otherTasksByUser.map((t: any) => t.id)

    const allTaskIds = [...taskIdsInOwned, ...otherTaskIds]

    // Subtasks for all tasks
    const subtaskRows = allTaskIds.length
      ? await db.select({ id: dbSchema.subtasks.id }).from(dbSchema.subtasks).where(inArray(dbSchema.subtasks.taskId, allTaskIds))
      : []
    const subtaskIds = subtaskRows.map((s: any) => s.id)

    // 1. Delete comments for subtasks and tasks
    if (subtaskIds.length) {
      await db.delete(dbSchema.comments).where(and(eq(dbSchema.comments.entityType, 'subtask'), inArray(dbSchema.comments.entityId, subtaskIds)))
    }
    if (allTaskIds.length) {
      await db.delete(dbSchema.comments).where(and(eq(dbSchema.comments.entityType, 'task'), inArray(dbSchema.comments.entityId, allTaskIds)))
    }

    // 2. Delete attachments for subtasks and tasks
    if (subtaskIds.length) {
      await db.delete(dbSchema.attachments).where(inArray(dbSchema.attachments.entityId, subtaskIds))
    }
    if (allTaskIds.length) {
      await db.delete(dbSchema.attachments).where(inArray(dbSchema.attachments.entityId, allTaskIds))
    }

    // 3. Delete subtask tags and subtasks
    if (subtaskIds.length) {
      await db.delete(dbSchema.subtaskTags).where(inArray(dbSchema.subtaskTags.subtaskId, subtaskIds))
      await db.delete(dbSchema.subtasks).where(inArray(dbSchema.subtasks.id, subtaskIds))
    }

    // 4. Delete task assignees and task tags
    if (allTaskIds.length) {
      await db.delete(dbSchema.taskAssignees).where(inArray(dbSchema.taskAssignees.taskId, allTaskIds))
      await db.delete(dbSchema.taskTags).where(inArray(dbSchema.taskTags.taskId, allTaskIds))
    }

    // 5. Delete tasks
    if (allTaskIds.length) {
      await db.delete(dbSchema.tasks).where(inArray(dbSchema.tasks.id, allTaskIds))
    }

    // 6. Delete project attachments
    if (projectIds.length) {
      await db.delete(dbSchema.attachments).where(inArray(dbSchema.attachments.entityId, projectIds))
    }

    // 7. Delete project team and tags
    if (projectIds.length) {
      await db.delete(dbSchema.projectTeam).where(inArray(dbSchema.projectTeam.projectId, projectIds))
      await db.delete(dbSchema.projectTags).where(inArray(dbSchema.projectTags.projectId, projectIds))
    }

    // 8. Delete projects
    if (projectIds.length) {
      await db.delete(dbSchema.projects).where(inArray(dbSchema.projects.id, projectIds))
    }

    // 9. Delete personal notifications
    await db.delete(dbSchema.notifications).where(eq(dbSchema.notifications.userId, userId))

    return NextResponse.json({ success: true, data: { deletedProjects: projectIds.length, deletedTasks: allTaskIds.length } })
  } catch (error) {
    console.error('POST /api/settings/data/clear error', error)
    return NextResponse.json({ success: false, error: 'Failed to clear data' }, { status: 500 })
  }
}
