import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq, and } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'

// PATCH /api/projects/[id]/notes/[noteId] - Update a note
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const { id: projectId, noteId } = await params

    // Verify user authentication
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const userId = payload.sub

    // Get user
    const userRows = await db.select().from(dbSchema.users).where(eq(dbSchema.users.id, userId))
    const user = userRows[0]
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })

    // Get note
    const noteRows = await db.select().from(dbSchema.projectNotes).where(eq(dbSchema.projectNotes.id, noteId))
    const note = noteRows[0]
    if (!note) return NextResponse.json({ success: false, error: 'Note not found' }, { status: 404 })

    // Get project
    const projectRows = await db.select().from(dbSchema.projects).where(eq(dbSchema.projects.id, projectId))
    const project = projectRows[0]
    if (!project) return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })

    // Check permissions: Admin, Project Owner, or Note Creator
    const isAdmin = user.role === 'admin'
    const isProjectOwner = project.ownerId === userId
    const isNoteCreator = note.createdById === userId

    if (!isAdmin && !isProjectOwner && !isNoteCreator) {
      return NextResponse.json({ success: false, error: 'No permission to edit this note' }, { status: 403 })
    }

    const body = await req.json()
    const updateData: any = { updatedAt: new Date() }

    if (body.title !== undefined) updateData.title = body.title
    if (body.content !== undefined) updateData.content = body.content
    if (body.isPinned !== undefined) updateData.isPinned = body.isPinned

    await db.update(dbSchema.projectNotes).set(updateData).where(eq(dbSchema.projectNotes.id, noteId))

    return NextResponse.json({ success: true, message: 'Note updated' })
  } catch (err) {
    console.error('PATCH /api/projects/[id]/notes/[noteId] error', err)
    return NextResponse.json({ success: false, error: 'Failed to update note' }, { status: 500 })
  }
}

// DELETE /api/projects/[id]/notes/[noteId] - Delete a note
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const { id: projectId, noteId } = await params

    // Verify user authentication
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const userId = payload.sub

    // Get user
    const userRows = await db.select().from(dbSchema.users).where(eq(dbSchema.users.id, userId))
    const user = userRows[0]
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })

    // Get note
    const noteRows = await db.select().from(dbSchema.projectNotes).where(eq(dbSchema.projectNotes.id, noteId))
    const note = noteRows[0]
    if (!note) return NextResponse.json({ success: false, error: 'Note not found' }, { status: 404 })

    // Get project
    const projectRows = await db.select().from(dbSchema.projects).where(eq(dbSchema.projects.id, projectId))
    const project = projectRows[0]
    if (!project) return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })

    // Check permissions: Admin, Project Owner, or Note Creator
    const isAdmin = user.role === 'admin'
    const isProjectOwner = project.ownerId === userId
    const isNoteCreator = note.createdById === userId

    if (!isAdmin && !isProjectOwner && !isNoteCreator) {
      return NextResponse.json({ success: false, error: 'No permission to delete this note' }, { status: 403 })
    }

    await db.delete(dbSchema.projectNotes).where(eq(dbSchema.projectNotes.id, noteId))

    return NextResponse.json({ success: true, message: 'Note deleted' })
  } catch (err) {
    console.error('DELETE /api/projects/[id]/notes/[noteId] error', err)
    return NextResponse.json({ success: false, error: 'Failed to delete note' }, { status: 500 })
  }
}
