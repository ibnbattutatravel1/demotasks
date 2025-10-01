import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'
import { and, eq, inArray } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'

// GET /api/timesheets/[id] -> returns timesheet with entries (owner or admin)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const [ts] = await db.select().from(dbSchema.timesheets).where(eq(dbSchema.timesheets.id, id))
    if (!ts) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    // Allow owner or admin
    if (ts.userId !== payload.sub) {
      const [me] = await db.select({ role: dbSchema.users.role }).from(dbSchema.users).where(eq(dbSchema.users.id, payload.sub))
      if (!me || me.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const entries = await db.select().from(dbSchema.timesheetEntries).where(eq(dbSchema.timesheetEntries.timesheetId, id))
    return NextResponse.json({ success: true, data: { timesheet: ts, entries } })
  } catch (error) {
    console.error('GET /api/timesheets/[id] error', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch timesheet' }, { status: 500 })
  }
}

// PUT /api/timesheets/[id] -> update entries (owner only) when status in draft|returned
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const [ts] = await db.select().from(dbSchema.timesheets).where(eq(dbSchema.timesheets.id, id))
    if (!ts) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    if (ts.userId !== payload.sub) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    if (ts.status !== 'draft' && ts.status !== 'returned') {
      return NextResponse.json({ success: false, error: 'Timesheet is not editable' }, { status: 400 })
    }

    const body = await req.json() as { entries: Array<{ date: string; hours: number; note?: string }> }
    const monthPrefix = ts.month + '-'

    // Validate entries dates within month and sane hours
    for (const e of body.entries || []) {
      if (!e.date.startsWith(monthPrefix)) {
        return NextResponse.json({ success: false, error: 'Entry date outside timesheet month' }, { status: 400 })
      }
      const h = Number(e.hours)
      if (Number.isNaN(h) || h < 0 || h > 24) {
        return NextResponse.json({ success: false, error: 'Invalid hours (0-24)' }, { status: 400 })
      }
    }

    // Replace all entries with provided list (idempotent upsert by date)
    const existing = await db.select().from(dbSchema.timesheetEntries).where(eq(dbSchema.timesheetEntries.timesheetId, id))
    const existingByDate = new Map(existing.map((x: any) => [x.date, x]))

    const toDeleteDates = existing.filter((x: any) => !(body.entries || []).some(e => e.date === x.date)).map((x: any) => x.id)
    if (toDeleteDates.length) {
      await db.delete(dbSchema.timesheetEntries).where(inArray(dbSchema.timesheetEntries.id, toDeleteDates))
    }

    for (const e of body.entries || []) {
      const prev = existingByDate.get(e.date)
      if (prev) {
        await db.update(dbSchema.timesheetEntries).set({ hours: e.hours, note: e.note }).where(eq(dbSchema.timesheetEntries.id, prev.id))
      } else {
        await db.insert(dbSchema.timesheetEntries).values({ id: randomUUID(), timesheetId: id, date: e.date, hours: e.hours, note: e.note })
      }
    }

    await db.update(dbSchema.timesheets).set({ updatedAt: new Date() }).where(eq(dbSchema.timesheets.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PUT /api/timesheets/[id] error', error)
    return NextResponse.json({ success: false, error: 'Failed to update timesheet' }, { status: 500 })
  }
}
