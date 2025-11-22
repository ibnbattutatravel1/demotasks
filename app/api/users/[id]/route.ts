import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq, inArray } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const rows = await db.select({
      id: dbSchema.users.id,
      name: dbSchema.users.name,
      email: dbSchema.users.email,
      avatar: dbSchema.users.avatar,
      initials: dbSchema.users.initials,
      role: dbSchema.users.role,
      status: dbSchema.users.status,
    }).from(dbSchema.users).where(eq(dbSchema.users.id, id))

    if (!rows.length) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: rows[0] })
  } catch (error) {
    console.error('GET /api/users/[id] error', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch user' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Admin auth required
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json() as { name?: string; email?: string; avatar?: string | null; role?: 'admin' | 'user'; status?: 'Active' | 'Away' | 'Inactive'; password?: string }

    const update: any = {}
    if (typeof body.name === 'string' && body.name.trim()) update.name = body.name.trim()
    if (typeof body.email === 'string' && body.email.trim()) update.email = body.email.trim()
    if (typeof body.avatar === 'string') update.avatar = body.avatar
    if (body.avatar === null) update.avatar = null as unknown as string | null
    if (body.role === 'admin' || body.role === 'user') update.role = body.role
    if (body.status === 'Active' || body.status === 'Away' || body.status === 'Inactive') update.status = body.status

    if (typeof body.password === 'string' && body.password.trim()) {
      if (body.password.trim().length < 8) {
        return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 })
      }
      // lazy import to avoid top-level dep here
      const { hashSync } = await import('bcryptjs')
      update.passwordHash = hashSync(body.password.trim(), 10)
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields to update' }, { status: 400 })
    }

    await db.update(dbSchema.users).set(update).where(eq(dbSchema.users.id, id))

    const rows = await db.select({
      id: dbSchema.users.id,
      name: dbSchema.users.name,
      email: dbSchema.users.email,
      avatar: dbSchema.users.avatar,
      initials: dbSchema.users.initials,
      role: dbSchema.users.role,
    }).from(dbSchema.users).where(eq(dbSchema.users.id, id))

    if (!rows.length) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: rows[0] })
  } catch (error) {
    console.error('PUT /api/users/[id] error', error)
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Admin auth required
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    // Prevent deleting self
    if (payload.sub === id) {
      return NextResponse.json({ success: false, error: 'You cannot delete your own account' }, { status: 400 })
    }
    // Prevent deleting the last admin
    const admins = await db.select({ id: dbSchema.users.id }).from(dbSchema.users).where(eq(dbSchema.users.role, 'admin'))
    const isTargetAdmin = !!admins.find(a => a.id === id)
    if (isTargetAdmin && admins.length <= 1) {
      return NextResponse.json({ success: false, error: 'Cannot delete the last remaining admin' }, { status: 400 })
    }

    // Fallback admin for reassignment when a project lead is not suitable
    const adminFallback = admins.find(a => a.id !== id) || admins[0]

    // Reassign or clean up references to avoid orphan records.
    // We'll use a special ghost user only for historical references (comments, attachments, etc.).
    const GHOST_USER_ID = 'system-deleted-user'

    // Ensure the ghost user exists (id is deterministic)
    const ghost = await db
      .select({ id: dbSchema.users.id })
      .from(dbSchema.users)
      .where(eq(dbSchema.users.id, GHOST_USER_ID))

    if (!ghost.length) {
      await db.insert(dbSchema.users).values({
        id: GHOST_USER_ID,
        name: 'Deleted User',
        email: 'deleted@system.local',
        avatar: null as unknown as string | null,
        initials: 'DU',
        role: 'user',
        status: 'Inactive',
        passwordHash: null as unknown as string | null,
      })
    }

    const FALLBACK_ADMIN_ID = adminFallback?.id || GHOST_USER_ID

    // Perform all changes atomically
    await db.transaction(async (tx) => {
      // --- Reassign tasks and subtasks ownership/assignees ---

      // Tasks created by this user
      const createdTasks = await tx
        .select({ id: dbSchema.tasks.id, projectId: dbSchema.tasks.projectId })
        .from(dbSchema.tasks)
        .where(eq(dbSchema.tasks.createdById, id))

      // Tasks where this user is an assignee
      const userTaskAssignees = await tx
        .select({ taskId: dbSchema.taskAssignees.taskId })
        .from(dbSchema.taskAssignees)
        .where(eq(dbSchema.taskAssignees.userId, id))

      const taskIdsForAssignee = Array.from(new Set(userTaskAssignees.map(t => t.taskId)))

      let tasksWithAssignee: { id: string; projectId: string }[] = []
      if (taskIdsForAssignee.length) {
        tasksWithAssignee = await tx
          .select({ id: dbSchema.tasks.id, projectId: dbSchema.tasks.projectId })
          .from(dbSchema.tasks)
          .where(inArray(dbSchema.tasks.id, taskIdsForAssignee))
      }

      // Build task -> project map and collect affected project IDs
      const taskToProject = new Map<string, string>()
      for (const t of createdTasks) {
        taskToProject.set(t.id, t.projectId)
      }
      for (const t of tasksWithAssignee) {
        taskToProject.set(t.id, t.projectId)
      }

      const projectIds = Array.from(new Set(Array.from(taskToProject.values())))

      const projectLeadMap = new Map<string, string>()
      if (projectIds.length) {
        const projects = await tx
          .select({ id: dbSchema.projects.id, ownerId: dbSchema.projects.ownerId })
          .from(dbSchema.projects)
          .where(inArray(dbSchema.projects.id, projectIds))

        for (const p of projects) {
          // Prefer project lead (owner) if it is not the deleted user, otherwise fall back to admin
          const replacement = p.ownerId && p.ownerId !== id ? p.ownerId : FALLBACK_ADMIN_ID
          projectLeadMap.set(p.id, replacement)
        }
      }

      // Reassign createdById for tasks created by this user
      for (const t of createdTasks) {
        const replacementId = projectLeadMap.get(t.projectId) || FALLBACK_ADMIN_ID
        await tx
          .update(dbSchema.tasks)
          .set({ createdById: replacementId })
          .where(eq(dbSchema.tasks.id, t.id))
      }

      // Reassign task assignees for this user to the project lead/admin
      if (tasksWithAssignee.length) {
        const uniqueTaskIds = Array.from(new Set(tasksWithAssignee.map(t => t.id)))

        // Remove old assignee records for this user
        await tx.delete(dbSchema.taskAssignees).where(eq(dbSchema.taskAssignees.userId, id))

        const candidateAssignments: { taskId: string; userId: string }[] = []
        for (const taskId of uniqueTaskIds) {
          const projectId = taskToProject.get(taskId)
          const replacementId = (projectId && projectLeadMap.get(projectId)) || FALLBACK_ADMIN_ID
          candidateAssignments.push({ taskId, userId: replacementId })
        }

        // De-duplicate (taskId, userId) pairs to avoid duplicate assignments
        const seen = new Set<string>()
        const assignments = candidateAssignments.filter((row) => {
          const key = `${row.taskId}:${row.userId}`
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })

        if (assignments.length) {
          await tx.insert(dbSchema.taskAssignees).values(assignments)
        }
      } else {
        // Ensure any lingering assignee records for this user are removed
        await tx.delete(dbSchema.taskAssignees).where(eq(dbSchema.taskAssignees.userId, id))
      }

      // Reassign subtasks where this user was the assignee
      const userSubtasks = await tx
        .select({ id: dbSchema.subtasks.id, taskId: dbSchema.subtasks.taskId })
        .from(dbSchema.subtasks)
        .where(eq(dbSchema.subtasks.assigneeId, id))

      for (const st of userSubtasks) {
        const projectId = taskToProject.get(st.taskId)
        const replacementId = (projectId && projectLeadMap.get(projectId)) || FALLBACK_ADMIN_ID
        await tx
          .update(dbSchema.subtasks)
          .set({ assigneeId: replacementId })
          .where(eq(dbSchema.subtasks.id, st.id))
      }

      // Tasks approved by this user should lose the approver reference
      await tx
        .update(dbSchema.tasks)
        .set({ approvedById: null as unknown as string | null })
        .where(eq(dbSchema.tasks.approvedById, id))

      // Project ownership moves to the ghost user to keep the project itself intact
      await tx
        .update(dbSchema.projects)
        .set({ ownerId: GHOST_USER_ID })
        .where(eq(dbSchema.projects.ownerId, id))

      // Memberships (remove the deleted user from teams)
      await tx.delete(dbSchema.projectTeam).where(eq(dbSchema.projectTeam.userId, id))

      // Attachments and comments keep history but should not point to a deleted user
      await tx
        .update(dbSchema.attachments)
        .set({ uploadedById: GHOST_USER_ID, uploadedByName: 'Deleted User' })
        .where(eq(dbSchema.attachments.uploadedById, id))
      await tx
        .update(dbSchema.comments)
        .set({ userId: GHOST_USER_ID, userName: 'Deleted User', avatar: null as unknown as string | null })
        .where(eq(dbSchema.comments.userId, id))

      // Notifications and timesheets are moved to the ghost user
      await tx
        .update(dbSchema.notifications)
        .set({ userId: GHOST_USER_ID })
        .where(eq(dbSchema.notifications.userId, id))

      await tx
        .update(dbSchema.timesheets)
        .set({ userId: GHOST_USER_ID })
        .where(eq(dbSchema.timesheets.userId, id))

      await tx
        .update(dbSchema.timesheets)
        .set({ approvedById: null as unknown as string | null })
        .where(eq(dbSchema.timesheets.approvedById, id))

      // Per-user configs/subscriptions
      await tx.delete(dbSchema.pushSubscriptions).where(eq(dbSchema.pushSubscriptions.userId, id))
      await tx.delete(dbSchema.userSettings).where(eq(dbSchema.userSettings.userId, id))

      // Finally, delete the user
      await tx.delete(dbSchema.users).where(eq(dbSchema.users.id, id))
    })
    return NextResponse.json({ success: true, data: { id } })
  } catch (error) {
    console.error('DELETE /api/users/[id] error', error)
    return NextResponse.json({ success: false, error: 'Failed to delete user' }, { status: 500 })
  }
}
