import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'
import { and, eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'

// GET /api/timesheets?month=YYYY-MM -> returns current user's timesheet with entries
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const month = (searchParams.get('month') || new Date().toISOString().slice(0,7))

    const tsRows = await db.select().from(dbSchema.timesheets).where(and(eq(dbSchema.timesheets.userId, payload.sub), eq(dbSchema.timesheets.month, month)))
    let timesheet = tsRows[0]
    if (!timesheet) {
      // Create draft if not exists
      const id = randomUUID()
      const now = new Date().toISOString()
      await db.insert(dbSchema.timesheets).values({ id, userId: payload.sub, month, status: 'draft', createdAt: now })
      timesheet = { id, userId: payload.sub, month, status: 'draft', createdAt: now } as any
    }

    const entries = await db.select().from(dbSchema.timesheetEntries).where(eq(dbSchema.timesheetEntries.timesheetId, timesheet.id))

    return NextResponse.json({ success: true, data: { timesheet, entries } })
  } catch (error) {
    console.error('GET /api/timesheets error', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch timesheet' }, { status: 500 })
  }
}

// POST /api/timesheets -> ensure a draft exists for a month (optional custom month)
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({})) as { month?: string }
    const month = body.month || new Date().toISOString().slice(0,7)

    const tsRows = await db.select().from(dbSchema.timesheets).where(and(eq(dbSchema.timesheets.userId, payload.sub), eq(dbSchema.timesheets.month, month)))
    let timesheet = tsRows[0]
    if (!timesheet) {
      const id = randomUUID()
      const now = new Date().toISOString()
      await db.insert(dbSchema.timesheets).values({ id, userId: payload.sub, month, status: 'draft', createdAt: now })
      timesheet = { id, userId: payload.sub, month, status: 'draft', createdAt: now } as any
    }

    return NextResponse.json({ success: true, data: { timesheet } })
  } catch (error) {
    console.error('POST /api/timesheets error', error)
    return NextResponse.json({ success: false, error: 'Failed to create timesheet' }, { status: 500 })
  }
}
