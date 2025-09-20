import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const me = (await db.select({ id: dbSchema.users.id, role: dbSchema.users.role }).from(dbSchema.users).where(eq(dbSchema.users.id, payload.sub)))[0]
    if (!me || me.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    const ts = (await db.select().from(dbSchema.timesheets).where(eq(dbSchema.timesheets.id, id)))[0]
    if (!ts) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    if (ts.status !== 'submitted' && ts.status !== 'returned') {
      return NextResponse.json({ success: false, error: 'Only submitted/returned timesheets can be approved' }, { status: 400 })
    }

    await db.update(dbSchema.timesheets)
      .set({ status: 'approved', approvedAt: new Date().toISOString(), approvedById: me.id })
      .where(eq(dbSchema.timesheets.id, id))

    // Notify submitter
    await db.insert(dbSchema.notifications).values({
      id: randomUUID(),
      type: 'timesheet_approved',
      title: 'Timesheet approved',
      message: `Your ${ts.month} timesheet was approved`,
      read: 0 as any,
      userId: ts.userId,
      relatedId: id,
      relatedType: 'timesheet' as any,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/admin/timesheets/[id]/approve error', error)
    return NextResponse.json({ success: false, error: 'Failed to approve timesheet' }, { status: 500 })
  }
}
