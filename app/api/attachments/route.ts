import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { randomUUID } from 'node:crypto'
import { and, eq } from 'drizzle-orm'
import { toISOString } from '@/lib/date-utils'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'

// GET /api/attachments?entityType=task|project|subtask&entityId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const entityType = searchParams.get('entityType') as 'task' | 'project' | 'subtask' | null
    const entityId = searchParams.get('entityId')

    if (!entityType || !entityId) {
      return NextResponse.json({ success: false, error: 'Missing entityType or entityId' }, { status: 400 })
    }

    const attachments = await db
      .select()
      .from(dbSchema.attachments)
      .where(and(eq(dbSchema.attachments.entityType, entityType), eq(dbSchema.attachments.entityId, entityId)))

    return NextResponse.json({ success: true, data: attachments })
  } catch (error) {
    console.error('GET /api/attachments error', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch attachments' }, { status: 500 })
  }
}

// POST /api/attachments - Upload file and create attachment record
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    
    let userPayload: any
    try {
      userPayload = await verifyAuthToken(token)
    } catch {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Get user details
    const user = (await db.select().from(dbSchema.users).where(eq(dbSchema.users.id, userPayload.sub)))[0]
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })

    const formData = await req.formData()
    const file = formData.get('file') as File
    const entityType = formData.get('entityType') as string
    const entityId = formData.get('entityId') as string

    if (!file || !entityType || !entityId) {
      return NextResponse.json({ success: false, error: 'Missing file, entityType, or entityId' }, { status: 400 })
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, error: 'File too large. Maximum size is 50MB.' }, { status: 400 })
    }

    // For demo purposes, we'll store a placeholder URL since we don't have file storage configured
    // In production, you would upload to cloud storage (AWS S3, Cloudinary, etc.)
    const fileBuffer = await file.arrayBuffer()
    const base64Data = Buffer.from(fileBuffer).toString('base64')
    const dataUrl = `data:${file.type};base64,${base64Data}`

    const id = randomUUID()
    const now = new Date()

    const attachment = {
      id,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      url: dataUrl, // In production, this would be the cloud storage URL
      type: file.type,
      uploadedAt: now,
      uploadedById: user.id,
      uploadedByName: user.name,
      entityType: entityType as 'task' | 'project' | 'subtask',
      entityId,
    }

    await db.insert(dbSchema.attachments).values(attachment)

    const response = {
      ...attachment,
      uploadedBy: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        initials: user.initials,
      },
    }

    return NextResponse.json({ success: true, data: response }, { status: 201 })
  } catch (error) {
    console.error('POST /api/attachments error', error)
    return NextResponse.json({ success: false, error: 'Failed to upload attachment' }, { status: 500 })
  }
}
