import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq, and } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const rows = await db.select().from(dbSchema.notifications).where(eq(dbSchema.notifications.userId, payload.sub))

    // Sort newest first
    rows.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const data = rows.map((n: any) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      read: !!n.read,
      createdAt: n.createdAt,
      userId: n.userId,
      relatedId: n.relatedId || undefined,
      relatedType: n.relatedType || undefined,
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('GET /api/notifications error', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    await db.delete(dbSchema.notifications).where(and(eq(dbSchema.notifications.userId, payload.sub), eq(dbSchema.notifications.read as any, 1 as any)))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/notifications error', error)
    return NextResponse.json({ success: false, error: 'Failed to clear notifications' }, { status: 500 })
  }
}
