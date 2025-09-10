import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const rows = await db.select().from(dbSchema.notifications).where(eq(dbSchema.notifications.id, id))
    if (!rows.length) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    const notif = rows[0]
    if (notif.userId !== payload.sub) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    await db.update(dbSchema.notifications).set({ read: 1 as any }).where(eq(dbSchema.notifications.id, id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PATCH /api/notifications/[id] error', error)
    return NextResponse.json({ success: false, error: 'Failed to update notification' }, { status: 500 })
  }
}
