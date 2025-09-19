import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'
import { eq } from 'drizzle-orm'

async function fileToDataUrl(file: File): Promise<string> {
  const buf = await file.arrayBuffer()
  const base64 = Buffer.from(buf).toString('base64')
  const mime = file.type || 'image/jpeg'
  return `data:${mime};base64,${base64}`
}

async function fetchImageToDataUrl(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch image URL')
  const contentType = res.headers.get('content-type') || 'image/jpeg'
  const buf = Buffer.from(await res.arrayBuffer())
  return `data:${contentType};base64,${buf.toString('base64')}`
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const contentType = req.headers.get('content-type') || ''
    let name: string | undefined
    let avatarDataUrl: string | undefined

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      const file = form.get('avatarFile') as File | null
      const providedName = form.get('name') as string | null
      if (providedName) name = providedName
      if (file) {
        // Limit ~10MB similar to attachments route
        if (file.size > 10 * 1024 * 1024) {
          return NextResponse.json({ success: false, error: 'File too large (max 10MB)' }, { status: 400 })
        }
        avatarDataUrl = await fileToDataUrl(file)
      }
    } else if (contentType.includes('application/json')) {
      const body = (await req.json()) as { name?: string; avatarUrl?: string | null }
      if (typeof body.name === 'string' && body.name.trim()) name = body.name.trim()
      if (typeof body.avatarUrl === 'string' && body.avatarUrl.trim()) {
        // Convert external URL to data URL and store
        const url = body.avatarUrl.trim()
        try {
          new URL(url)
        } catch {
          return NextResponse.json({ success: false, error: 'Invalid avatar URL' }, { status: 400 })
        }
        avatarDataUrl = await fetchImageToDataUrl(url)
      } else if (body.avatarUrl === null) {
        avatarDataUrl = null as unknown as string | undefined
      }
    } else {
      return NextResponse.json({ success: false, error: 'Unsupported content type' }, { status: 400 })
    }

    const update: any = {}
    if (typeof name === 'string') update.name = name
    if (typeof avatarDataUrl !== 'undefined') update.avatar = avatarDataUrl

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ success: false, error: 'No changes provided' }, { status: 400 })
    }

    await db.update(dbSchema.users).set(update).where(eq(dbSchema.users.id, payload.sub))

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
      .where(eq(dbSchema.users.id, payload.sub))
      .limit(1)

    const user = rows[0]
    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('PUT /api/profile error', error)
    return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 })
  }
}
