import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const rows = await db.select().from(dbSchema.userSettings).where(eq(dbSchema.userSettings.userId, payload.sub))
    const s = rows[0] || null

    const data = {
      notifications: {
        email: s ? !!s.emailNotifications : true,
        push: s ? !!s.pushNotifications : false,
        taskReminders: s ? !!s.taskReminders : true,
        projectUpdates: s ? !!s.projectUpdates : true,
      },
      appearance: {
        timezone: s?.timezone || 'UTC',
      },
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('GET /api/settings error', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = (await req.json()) as {
      notifications?: {
        email?: boolean
        push?: boolean
        taskReminders?: boolean
        projectUpdates?: boolean
      },
      appearance?: {
        timezone?: string
      }
    }

    const existing = await db.select().from(dbSchema.userSettings).where(eq(dbSchema.userSettings.userId, payload.sub))
    const current = existing[0] || null

    const values = {
      userId: payload.sub,
      emailNotifications: body.notifications?.email ?? true,
      pushNotifications: body.notifications?.push ?? false,
      taskReminders: body.notifications?.taskReminders ?? true,
      projectUpdates: body.notifications?.projectUpdates ?? true,
      timezone: body.appearance?.timezone || current?.timezone || 'UTC',
      updatedAt: new Date().toISOString(),
    } as any

    if (existing.length) {
      await db.update(dbSchema.userSettings).set(values).where(eq(dbSchema.userSettings.userId, payload.sub))
    } else {
      await db.insert(dbSchema.userSettings).values(values)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PUT /api/settings error', error)
    return NextResponse.json({ success: false, error: 'Failed to save settings' }, { status: 500 })
  }
}
