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

    const [ts] = await db.select().from(dbSchema.timesheets).where(eq(dbSchema.timesheets.id, id))
    if (!ts) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    if (ts.userId !== payload.sub) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    if (ts.status !== 'draft' && ts.status !== 'returned') return NextResponse.json({ success: false, error: 'Already submitted' }, { status: 400 })

    await db.update(dbSchema.timesheets).set({ status: 'submitted', submittedAt: new Date() }).where(eq(dbSchema.timesheets.id, id))

    // Notify admins
    const admins = await db.select({ id: dbSchema.users.id }).from(dbSchema.users).where(eq(dbSchema.users.role, 'admin'))
    for (const a of admins) {
      await db.insert(dbSchema.notifications).values({
        id: randomUUID(),
        type: 'timesheet_submitted',
        title: 'Timesheet submitted',
        message: `A timesheet for ${ts.month} has been submitted`,
        read: 0 as any,
        userId: a.id,
        relatedId: id,
        relatedType: 'timesheet' as any,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/timesheets/[id]/submit error', error)
    return NextResponse.json({ success: false, error: 'Failed to submit timesheet' }, { status: 500 })
  }
}
