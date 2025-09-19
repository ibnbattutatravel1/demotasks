import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'
import { and, eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { endpoint } = (await req.json().catch(() => ({}))) as { endpoint?: string }

    if (endpoint) {
      await db
        .delete(dbSchema.pushSubscriptions)
        .where(and(eq(dbSchema.pushSubscriptions.userId, payload.sub), eq(dbSchema.pushSubscriptions.endpoint, endpoint)))
    } else {
      await db.delete(dbSchema.pushSubscriptions).where(eq(dbSchema.pushSubscriptions.userId, payload.sub))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/settings/push/unsubscribe error', error)
    return NextResponse.json({ success: false, error: 'Failed to unsubscribe' }, { status: 500 })
  }
}
