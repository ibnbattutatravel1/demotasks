import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { and, eq, inArray } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
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

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Admin auth required
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const id = params.id
    const body = await req.json() as { name?: string; email?: string; avatar?: string | null; role?: 'admin' | 'user'; status?: 'Active' | 'Away' | 'Inactive' }

    const update: any = {}
    if (typeof body.name === 'string' && body.name.trim()) update.name = body.name.trim()
    if (typeof body.email === 'string' && body.email.trim()) update.email = body.email.trim()
    if (typeof body.avatar === 'string') update.avatar = body.avatar
    if (body.avatar === null) update.avatar = null as unknown as string | null
    if (body.role === 'admin' || body.role === 'user') update.role = body.role
    if (body.status === 'Active' || body.status === 'Away' || body.status === 'Inactive') update.status = body.status

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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Admin auth required
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const id = params.id

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

    // Check references to prevent orphan records
    const [ownedProjects, projectTeamRows, createdTasks, approvedTasks, assigneeRows, subtaskAssignees, attachments, notifications] = await Promise.all([
      db.select({ id: dbSchema.projects.id }).from(dbSchema.projects).where(eq(dbSchema.projects.ownerId, id)),
      db.select({ userId: dbSchema.projectTeam.userId }).from(dbSchema.projectTeam).where(eq(dbSchema.projectTeam.userId, id)),
      db.select({ id: dbSchema.tasks.id }).from(dbSchema.tasks).where(eq(dbSchema.tasks.createdById, id)),
      db.select({ id: dbSchema.tasks.id }).from(dbSchema.tasks).where(eq(dbSchema.tasks.approvedById, id)),
      db.select({ userId: dbSchema.taskAssignees.userId }).from(dbSchema.taskAssignees).where(eq(dbSchema.taskAssignees.userId, id)),
      db.select({ id: dbSchema.subtasks.id }).from(dbSchema.subtasks).where(eq(dbSchema.subtasks.assigneeId, id)),
      db.select({ id: dbSchema.attachments.id }).from(dbSchema.attachments).where(eq(dbSchema.attachments.uploadedById, id)),
      db.select({ id: dbSchema.notifications.id }).from(dbSchema.notifications).where(eq(dbSchema.notifications.userId, id)),
    ])

    const referenced = [
      ownedProjects.length,
      projectTeamRows.length,
      createdTasks.length,
      approvedTasks.length,
      assigneeRows.length,
      subtaskAssignees.length,
      attachments.length,
      notifications.length,
    ].some((n) => n > 0)

    if (referenced) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete user with related records (projects/tasks/assignments/etc).' },
        { status: 400 },
      )
    }

    const deleted = await db.delete(dbSchema.users).where(eq(dbSchema.users.id, id))
    return NextResponse.json({ success: true, data: { id } })
  } catch (error) {
    console.error('DELETE /api/users/[id] error', error)
    return NextResponse.json({ success: false, error: 'Failed to delete user' }, { status: 500 })
  }
}
