import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'
import { and, eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { endpoint, keys } = (await req.json()) as {
      endpoint: string
      keys: { p256dh: string; auth: string }
    }
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ success: false, error: 'Invalid subscription payload' }, { status: 400 })
    }

    // Upsert by (userId, endpoint)
    const existing = await db
      .select()
      .from(dbSchema.pushSubscriptions)
      .where(and(eq(dbSchema.pushSubscriptions.userId, payload.sub), eq(dbSchema.pushSubscriptions.endpoint, endpoint)))

    if (existing.length === 0) {
      await db.insert(dbSchema.pushSubscriptions).values({
        id: (globalThis.crypto?.randomUUID?.() ?? randomUUID()) as string,
        userId: payload.sub,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      })
    } else {
      await db
        .update(dbSchema.pushSubscriptions)
        .set({ p256dh: keys.p256dh, auth: keys.auth })
        .where(and(eq(dbSchema.pushSubscriptions.userId, payload.sub), eq(dbSchema.pushSubscriptions.endpoint, endpoint)))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/settings/push/subscribe error', error)
    return NextResponse.json({ success: false, error: 'Failed to subscribe' }, { status: 500 })
  }
}
