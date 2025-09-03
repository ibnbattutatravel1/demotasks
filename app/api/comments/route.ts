import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { db, dbSchema } from '@/lib/db/client'
import { and, eq } from 'drizzle-orm'

// GET /api/comments?entityType=task|subtask&entityId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const entityType = searchParams.get('entityType') as 'task' | 'subtask' | null
    const entityId = searchParams.get('entityId')
    if (!entityType || !entityId) {
      return NextResponse.json({ success: false, error: 'Missing entityType or entityId' }, { status: 400 })
    }

    const rows = await db
      .select()
      .from(dbSchema.comments)
      .where(and(eq(dbSchema.comments.entityType, entityType), eq(dbSchema.comments.entityId, entityId)))

    // Sort by createdAt ascending for conversation feel
    rows.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))

    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    console.error('GET /api/comments error', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch comments' }, { status: 500 })
  }
}

// POST /api/comments
// body: { entityType: 'task'|'subtask', entityId: string, userId: string, userName: string, avatar?: string, content: string }
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      entityType: 'task' | 'subtask'
      entityId: string
      userId: string
      userName: string
      avatar?: string | null
      content: string
    }

    if (!body?.entityType || !body?.entityId || !body?.userId || !body?.userName || !body?.content?.trim()) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const id = randomUUID()

    await db.insert(dbSchema.comments).values({
      id,
      entityType: body.entityType,
      entityId: body.entityId,
      userId: body.userId,
      userName: body.userName,
      avatar: body.avatar || null,
      content: body.content.trim(),
      createdAt: now,
      updatedAt: now,
    })

    const created = (await db.select().from(dbSchema.comments).where(eq(dbSchema.comments.id, id)))[0]
    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (error) {
    console.error('POST /api/comments error', error)
    return NextResponse.json({ success: false, error: 'Failed to create comment' }, { status: 500 })
  }
}
