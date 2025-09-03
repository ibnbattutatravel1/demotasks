import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyAuthToken(token)
    const userId = payload.sub

    const rows = await db
      .select({
        id: dbSchema.users.id,
        name: dbSchema.users.name,
        email: dbSchema.users.email,
        avatar: dbSchema.users.avatar,
        initials: dbSchema.users.initials,
        role: dbSchema.users.role,
      })
      .from(dbSchema.users)
      .where(eq(dbSchema.users.id, userId))
      .limit(1)

    const user = rows[0]
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    return NextResponse.json({ success: true, data: user })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
}
