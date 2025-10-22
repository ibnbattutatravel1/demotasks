import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'
import { unlink } from 'fs/promises'
import { join } from 'path'

// DELETE /api/projects/[id]/documents/[docId] - Delete a document
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const { id: projectId, docId } = await params

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

    // Get document
    const docRows = await db.select().from(dbSchema.projectDocuments).where(eq(dbSchema.projectDocuments.id, docId))
    const document = docRows[0]
    if (!document) return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 })

    // Get project
    const projectRows = await db.select().from(dbSchema.projects).where(eq(dbSchema.projects.id, projectId))
    const project = projectRows[0]
    if (!project) return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })

    // Check permissions: Admin, Project Owner, or Document Uploader
    const isAdmin = user.role === 'admin'
    const isProjectOwner = project.ownerId === userId
    const isDocumentUploader = document.uploadedById === userId

    if (!isAdmin && !isProjectOwner && !isDocumentUploader) {
      return NextResponse.json({ success: false, error: 'No permission to delete this document' }, { status: 403 })
    }

    // Delete file from filesystem
    try {
      const filepath = join(process.cwd(), 'public', document.url)
      await unlink(filepath)
    } catch (fileErr) {
      console.error('Failed to delete file:', fileErr)
      // Continue anyway to remove from database
    }

    // Delete from database
    await db.delete(dbSchema.projectDocuments).where(eq(dbSchema.projectDocuments.id, docId))

    return NextResponse.json({ success: true, message: 'Document deleted' })
  } catch (err) {
    console.error('DELETE /api/projects/[id]/documents/[docId] error', err)
    return NextResponse.json({ success: false, error: 'Failed to delete document' }, { status: 500 })
  }
}
