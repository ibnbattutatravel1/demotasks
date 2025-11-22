import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'
import { createPasswordResetToken } from '@/lib/auth-password'
import { sendPasswordResetEmail } from '@/lib/email/password-reset-email'

export async function GET() {
  try {
    const users = await db.select({
      id: dbSchema.users.id,
      name: dbSchema.users.name,
      email: dbSchema.users.email,
      avatar: dbSchema.users.avatar,
      initials: dbSchema.users.initials,
      role: dbSchema.users.role,
      status: dbSchema.users.status,
    }).from(dbSchema.users)

    // Hide the internal ghost user used for safe deletions
    const filtered = users.filter((u: any) => u.id !== 'system-deleted-user')

    return NextResponse.json({ success: true, data: filtered })
  } catch (error) {
    console.error('Failed to fetch users', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // Admin auth required
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json() as {
      name?: string
      email?: string
      avatar?: string
      role?: string // 'admin' | 'user'
      status?: string // 'Active' | 'Away' | 'Inactive'
      password?: string
    }

    const name = (body.name || '').trim()
    const email = (body.email || '').trim()
    if (!name || !email) {
      return NextResponse.json({ success: false, error: 'Name and email are required' }, { status: 400 })
    }

    let role: 'admin' | 'user' = 'user'
    if (body.role && (body.role === 'admin' || body.role === 'user')) {
      role = body.role
    }

    let status: 'Active' | 'Away' | 'Inactive' = 'Inactive'
    if (body.status === 'Active' || body.status === 'Away' || body.status === 'Inactive') {
      status = body.status
    }

    // Prevent duplicate emails
    const existing = await db.select({ id: dbSchema.users.id }).from(dbSchema.users).where(eq(dbSchema.users.email, email))
    if (existing.length) {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 409 })
    }

    const id = (globalThis.crypto?.randomUUID?.() ?? randomUUID()) as string
    const initials = name.split(/\s+/).map(p => p[0]?.toUpperCase() ?? '').slice(0, 2).join('') || name[0]?.toUpperCase() || 'U'

    // Always require user to set password via secure email link
    const passwordHash: string | null = null

    await db.insert(dbSchema.users).values({
      id,
      name,
      email,
      avatar: body.avatar ?? null as unknown as string | null,
      initials,
      role,
      status,
      passwordHash,
    })

    const created = await db.select({
      id: dbSchema.users.id,
      name: dbSchema.users.name,
      email: dbSchema.users.email,
      avatar: dbSchema.users.avatar,
      initials: dbSchema.users.initials,
      role: dbSchema.users.role,
      status: dbSchema.users.status,
    }).from(dbSchema.users).where(eq(dbSchema.users.id, id))

    // Send password set/reset email with secure token
    try {
      const { token } = await createPasswordResetToken(id, 60)
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const resetLink = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`
      await sendPasswordResetEmail({ to: email, name, resetLink })
    } catch (e) {
      console.warn('Failed to send password reset email:', e)
    }

    return NextResponse.json({ success: true, data: created[0] }, { status: 201 })
  } catch (error) {
    console.error('Failed to create user', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
