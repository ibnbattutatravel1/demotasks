import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq } from 'drizzle-orm'
import { compare } from 'bcryptjs'
import { AUTH_COOKIE, signAuthToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 })
    }

    const rows = await db
      .select({
        id: dbSchema.users.id,
        name: dbSchema.users.name,
        email: dbSchema.users.email,
        avatar: dbSchema.users.avatar,
        initials: dbSchema.users.initials,
        role: dbSchema.users.role,
        passwordHash: dbSchema.users.passwordHash,
      })
      .from(dbSchema.users)
      .where(eq(dbSchema.users.email, email))
      .limit(1)

    const user = rows[0]
    if (!user) {
      console.log('❌ Login failed: User not found for email:', email)
      return NextResponse.json({ success: false, error: 'No account found with this email address. Please check your email or contact support.' }, { status: 401 })
    }

    if (!user.passwordHash) {
      console.log('❌ Login failed: No password hash for user:', email)
      return NextResponse.json({ success: false, error: 'Account setup incomplete. Please contact support.' }, { status: 401 })
    }

    const ok = await compare(password, user.passwordHash)
    if (!ok) {
      console.log('❌ Login failed: Incorrect password for user:', email)
      return NextResponse.json({ success: false, error: 'Incorrect password. Please try again or reset your password.' }, { status: 401 })
    }

    const token = await signAuthToken({ sub: user.id, role: user.role })

    const res = NextResponse.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, initials: user.initials, role: user.role },
    })

    res.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return res
  } catch (err) {
    console.error('Auth login error', err)
    return NextResponse.json({ success: false, error: 'An error occurred during login. Please try again later or contact support.' }, { status: 500 })
  }
}
