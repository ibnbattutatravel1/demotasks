import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq } from 'drizzle-orm'
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

    // Reassign or clean up references to avoid orphan records.
    // We'll use a special ghost user as the sink for historical references.
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

    // Perform all changes atomically
    await db.transaction(async (tx) => {
      // Reassign ownership/creator references
      await tx.update(dbSchema.projects).set({ ownerId: GHOST_USER_ID }).where(eq(dbSchema.projects.ownerId, id))
      await tx.update(dbSchema.tasks).set({ createdById: GHOST_USER_ID }).where(eq(dbSchema.tasks.createdById, id))
      await tx.update(dbSchema.tasks).set({ approvedById: null as unknown as string | null }).where(eq(dbSchema.tasks.approvedById, id))

      // Memberships (remove)
      await tx.delete(dbSchema.projectTeam).where(eq(dbSchema.projectTeam.userId, id))
      await tx.delete(dbSchema.taskAssignees).where(eq(dbSchema.taskAssignees.userId, id))

      // Subtasks: assignee is optional
      await tx.update(dbSchema.subtasks).set({ assigneeId: null as unknown as string | null }).where(eq(dbSchema.subtasks.assigneeId, id))

      // Attachments and comments keep history but should not point to a deleted user
      await tx
        .update(dbSchema.attachments)
        .set({ uploadedById: GHOST_USER_ID, uploadedByName: 'Deleted User' })
        .where(eq(dbSchema.attachments.uploadedById, id))
      await tx
        .update(dbSchema.comments)
        .set({ userId: GHOST_USER_ID, userName: 'Deleted User', avatar: null as unknown as string | null })
        .where(eq(dbSchema.comments.userId, id))

      // Notifications and timesheets
      await tx.update(dbSchema.notifications).set({ userId: GHOST_USER_ID }).where(eq(dbSchema.notifications.userId, id))
      await tx.update(dbSchema.timesheets).set({ userId: GHOST_USER_ID }).where(eq(dbSchema.timesheets.userId, id))
      await tx.update(dbSchema.timesheets).set({ approvedById: null as unknown as string | null }).where(eq(dbSchema.timesheets.approvedById, id))

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
