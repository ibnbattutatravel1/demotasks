import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'
import { and, eq } from 'drizzle-orm'
import { toISOStringOrUndefined } from '@/lib/date-utils'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const statusParam = (searchParams.get('status') || 'submitted').toLowerCase()
    const q = (searchParams.get('q') || '').trim().toLowerCase()

    const whereUser = eq(dbSchema.timesheets.userId, payload.sub)
    const rows = await db
      .select({
        id: dbSchema.timesheets.id,
        month: dbSchema.timesheets.month,
        status: dbSchema.timesheets.status,
        submittedAt: dbSchema.timesheets.submittedAt,
        approvedAt: dbSchema.timesheets.approvedAt,
        returnedAt: dbSchema.timesheets.returnedAt,
        rejectedAt: dbSchema.timesheets.rejectedAt,
      })
      .from(dbSchema.timesheets)
      .where(whereUser)

    const filtered = rows.filter((r: any) => {
      const statusOk = statusParam === 'all' ? true : r.status === statusParam
      const queryOk = !q || String(r.month || '').toLowerCase().includes(q)
      return statusOk && queryOk
    })

    const data = filtered.map((r: any) => ({
      ...r,
      submittedAt: toISOStringOrUndefined(r.submittedAt),
      approvedAt: toISOStringOrUndefined(r.approvedAt),
      returnedAt: toISOStringOrUndefined(r.returnedAt),
      rejectedAt: toISOStringOrUndefined(r.rejectedAt),
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('GET /api/timesheets/my error', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch my timesheets' }, { status: 500 })
  }
}
