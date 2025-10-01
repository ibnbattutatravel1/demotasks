import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'
import { and, eq, inArray } from 'drizzle-orm'
import { toISOStringOrUndefined } from '@/lib/date-utils'

// GET /api/admin/timesheets?status=submitted|returned|approved|rejected (default: submitted)
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const me = (await db.select({ role: dbSchema.users.role }).from(dbSchema.users).where(eq(dbSchema.users.id, payload.sub)))[0]
    if (!me || me.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const status = (searchParams.get('status') || 'submitted') as 'submitted' | 'returned' | 'approved' | 'rejected'

    const rows = await db
      .select({
        id: dbSchema.timesheets.id,
        month: dbSchema.timesheets.month,
        status: dbSchema.timesheets.status,
        userId: dbSchema.timesheets.userId,
        submittedAt: dbSchema.timesheets.submittedAt,
      })
      .from(dbSchema.timesheets)
      .where(eq(dbSchema.timesheets.status, status))

    // Attach user name
    const userIds = Array.from(new Set(rows.map(r => r.userId)))
    const users = await db
      .select({ id: dbSchema.users.id, name: dbSchema.users.name, email: dbSchema.users.email })
      .from(dbSchema.users)
      .where(inArray(dbSchema.users.id, userIds as any))
    const byId = new Map(users.map(u => [u.id, u]))

    const data = rows.map((r: any) => ({ 
      ...r, 
      user: byId.get(r.userId),
      submittedAt: toISOStringOrUndefined(r.submittedAt),
    }))
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('GET /api/admin/timesheets error', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch timesheets' }, { status: 500 })
  }
}
