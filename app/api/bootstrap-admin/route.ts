import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'

export async function POST(req: NextRequest) {
  try {
    const bootstrapToken = process.env.ADMIN_BOOTSTRAP_TOKEN
    if (!bootstrapToken) {
      return NextResponse.json({ success: false, error: 'Bootstrap disabled' }, { status: 403 })
    }
    const provided = req.headers.get('x-bootstrap-token') || req.nextUrl.searchParams.get('token')
    if (!provided || provided !== bootstrapToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json()) as {
      name?: string
      email?: string
      password?: string
    }

    const name = (body.name || '').trim()
    const email = (body.email || '').trim()
    const password = (body.password || '').trim()
    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'name, email, password are required' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Prevent duplicate emails
    const exists = await db
      .select({ id: dbSchema.users.id })
      .from(dbSchema.users)
      .where(eq(dbSchema.users.email, email))
    if (exists.length) {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 409 })
    }

    const initials = name
      .split(/\s+/)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .slice(0, 2)
      .join('') || name[0]?.toUpperCase() || 'A'

    const { hashSync } = await import('bcryptjs')
    const passwordHash = hashSync(password, 10)

    const id = (globalThis.crypto?.randomUUID?.() ?? randomUUID()) as string

    await db.insert(dbSchema.users).values({
      id,
      name,
      email,
      avatar: null as unknown as string | null,
      initials,
      role: 'admin',
      status: 'Active',
      passwordHash,
    })

    const created = (
      await db
        .select({ id: dbSchema.users.id, name: dbSchema.users.name, email: dbSchema.users.email, role: dbSchema.users.role })
        .from(dbSchema.users)
        .where(eq(dbSchema.users.id, id))
    )[0]

    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (err) {
    console.error('POST /api/bootstrap-admin error', err)
    return NextResponse.json({ success: false, error: 'Failed to create admin' }, { status: 500 })
  }
}
