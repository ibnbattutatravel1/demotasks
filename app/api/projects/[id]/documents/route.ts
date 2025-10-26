import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq, and, desc } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// GET /api/projects/[id]/documents - Get all documents for a project
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params

    // Verify user authentication
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    // Get documents with uploader info
    const documents = await db
      .select({
        id: dbSchema.projectDocuments.id,
        projectId: dbSchema.projectDocuments.projectId,
        name: dbSchema.projectDocuments.name,
        size: dbSchema.projectDocuments.size,
        type: dbSchema.projectDocuments.type,
        url: dbSchema.projectDocuments.url,
        uploadedById: dbSchema.projectDocuments.uploadedById,
        uploadedAt: dbSchema.projectDocuments.uploadedAt,
        userName: dbSchema.users.name,
        userAvatar: dbSchema.users.avatar,
        userInitials: dbSchema.users.initials,
      })
      .from(dbSchema.projectDocuments)
      .leftJoin(dbSchema.users, eq(dbSchema.projectDocuments.uploadedById, dbSchema.users.id))
      .where(eq(dbSchema.projectDocuments.projectId, projectId))
      .orderBy(desc(dbSchema.projectDocuments.uploadedAt))

    const formattedDocuments = documents.map((doc: typeof documents[0]) => ({
      id: doc.id,
      projectId: doc.projectId,
      name: doc.name,
      size: doc.size,
      type: doc.type,
      url: doc.url,
      uploadedBy: {
        id: doc.uploadedById,
        name: doc.userName || 'Unknown',
        avatar: doc.userAvatar || undefined,
        initials: doc.userInitials || 'U',
      },
      uploadedAt: doc.uploadedAt.toISOString(),
    }))

    return NextResponse.json({ success: true, data: formattedDocuments })
  } catch (err) {
    console.error('GET /api/projects/[id]/documents error', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch documents' }, { status: 500 })
  }
}

// POST /api/projects/[id]/documents - Upload new documents
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params

    // Verify user authentication
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const userId = payload.sub

    // Get user and check permissions
    const userRows = await db.select().from(dbSchema.users).where(eq(dbSchema.users.id, userId))
    const user = userRows[0]
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })

    // Check if user has access to project
    const projectRows = await db.select().from(dbSchema.projects).where(eq(dbSchema.projects.id, projectId))
    const project = projectRows[0]
    if (!project) return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })

    // Check if user is admin, project owner, or team member
    const isAdmin = user.role === 'admin'
    const isOwner = project.ownerId === userId
    const teamRows = await db
      .select()
      .from(dbSchema.projectTeam)
      .where(and(eq(dbSchema.projectTeam.projectId, projectId), eq(dbSchema.projectTeam.userId, userId)))
    const isTeamMember = teamRows.length > 0

    if (!isAdmin && !isOwner && !isTeamMember) {
      return NextResponse.json({ success: false, error: 'No access to this project' }, { status: 403 })
    }

    // Parse form data
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: 'No files provided' }, { status: 400 })
    }

    const uploadedDocs = []

    // Create upload directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'projects', projectId)
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Generate unique filename
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substr(2, 9)
      const ext = file.name.split('.').pop()
      const filename = `${timestamp}_${randomStr}.${ext}`
      const filepath = join(uploadsDir, filename)

      // Write file
      await writeFile(filepath, buffer)

      // Save to database
      const docId = `doc_${timestamp}_${randomStr}`
      const url = `/api/uploads/projects/${projectId}/${filename}`

      await db.insert(dbSchema.projectDocuments).values({
        id: docId,
        projectId,
        name: file.name,
        size: file.size,
        type: file.type,
        url,
        uploadedById: userId,
        uploadedAt: new Date(),
      })

      uploadedDocs.push({ id: docId, name: file.name, url })
    }

    return NextResponse.json({ success: true, data: uploadedDocs })
  } catch (err) {
    console.error('POST /api/projects/[id]/documents error', err)
    return NextResponse.json({ success: false, error: 'Failed to upload documents' }, { status: 500 })
  }
}
