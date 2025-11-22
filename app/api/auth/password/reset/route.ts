import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq } from 'drizzle-orm'
import { verifyAndConsumeResetToken } from '@/lib/auth-password'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ success: false, error: 'Missing token' }, { status: 400 })
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const result = await verifyAndConsumeResetToken(token)
    if (!result.ok || !result.userId) {
      return NextResponse.json({ success: false, error: result.error || 'Invalid token' }, { status: 400 })
    }

    const { hash } = await import('bcryptjs')
    const passwordHash = await hash(password, 10)

    await db
      .update(dbSchema.users)
      .set({ passwordHash, status: 'Active' as any })
      .where(eq(dbSchema.users.id, result.userId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Password reset failed', error)
    return NextResponse.json({ success: false, error: 'Failed to reset password' }, { status: 500 })
  }
}
