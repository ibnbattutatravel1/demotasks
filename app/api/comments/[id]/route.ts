import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq } from 'drizzle-orm'
import { toISOString } from '@/lib/date-utils'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = (await req.json()) as Partial<{ content: string }>
    if (typeof body.content !== 'string' || !body.content.trim()) {
      return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 })
    }
    const now = new Date()
    await db.update(dbSchema.comments).set({ content: body.content.trim(), updatedAt: now }).where(eq(dbSchema.comments.id, id))
    const fresh = (await db.select().from(dbSchema.comments).where(eq(dbSchema.comments.id, id)))[0]
    if (!fresh) return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: fresh })
  } catch (error) {
    console.error('PATCH /api/comments/[id] error', error)
    return NextResponse.json({ success: false, error: 'Failed to update comment' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const existing = (await db.select().from(dbSchema.comments).where(eq(dbSchema.comments.id, id)))[0]
    if (!existing) return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 })
    await db.delete(dbSchema.comments).where(eq(dbSchema.comments.id, id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/comments/[id] error', error)
    return NextResponse.json({ success: false, error: 'Failed to delete comment' }, { status: 500 })
  }
}
