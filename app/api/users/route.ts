import { NextRequest, NextResponse } from 'next/server'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'
import { db, dbSchema } from '@/lib/db/client'
import { eq } from 'drizzle-orm'
import { randomUUID, randomBytes } from 'node:crypto'
import { sendUserWelcomeEmail } from '@/lib/email/user-welcome-email'

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
    const filtered = users.filter((u) => u.id !== 'system-deleted-user')

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

    const providedPassword = typeof body.password === 'string' ? body.password.trim() : ''
    let plainPassword = providedPassword

    if (plainPassword && plainPassword.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    if (!plainPassword) {
      // Generate a secure temporary password (12 characters, mixed set)
      const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*'
      const randomBuffer = randomBytes(12)
      plainPassword = Array.from(randomBuffer, (byte) => alphabet[byte % alphabet.length]).join('')
    }

    const { hashSync } = await import('bcryptjs')
    const passwordHash = hashSync(plainPassword, 10)

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

    const createdRows = await db.select({
      id: dbSchema.users.id,
      name: dbSchema.users.name,
      email: dbSchema.users.email,
      avatar: dbSchema.users.avatar,
      initials: dbSchema.users.initials,
      role: dbSchema.users.role,
      status: dbSchema.users.status,
    }).from(dbSchema.users).where(eq(dbSchema.users.id, id))

    const createdUser = createdRows[0]

    // Fire-and-forget welcome email (log failures but do not block response)
    sendUserWelcomeEmail({
      to: createdUser.email,
      name: createdUser.name,
      tempPassword: plainPassword,
    }).catch((error) => {
      console.error('Failed to send welcome email:', error)
    })

    return NextResponse.json({ success: true, data: createdUser }, { status: 201 })
  } catch (error) {
    console.error('Failed to create user', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
