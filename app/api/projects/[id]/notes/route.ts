import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq, and, desc } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'

// GET /api/projects/[id]/notes - Get all notes for a project
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

    // Get notes with creator info
    const notes = await db
      .select({
        id: dbSchema.projectNotes.id,
        projectId: dbSchema.projectNotes.projectId,
        title: dbSchema.projectNotes.title,
        content: dbSchema.projectNotes.content,
        isPinned: dbSchema.projectNotes.isPinned,
        createdById: dbSchema.projectNotes.createdById,
        createdAt: dbSchema.projectNotes.createdAt,
        updatedAt: dbSchema.projectNotes.updatedAt,
        userName: dbSchema.users.name,
        userAvatar: dbSchema.users.avatar,
        userInitials: dbSchema.users.initials,
      })
      .from(dbSchema.projectNotes)
      .leftJoin(dbSchema.users, eq(dbSchema.projectNotes.createdById, dbSchema.users.id))
      .where(eq(dbSchema.projectNotes.projectId, projectId))
      .orderBy(desc(dbSchema.projectNotes.isPinned), desc(dbSchema.projectNotes.createdAt))

    const formattedNotes = notes.map((note) => ({
      id: note.id,
      projectId: note.projectId,
      title: note.title,
      content: note.content,
      isPinned: note.isPinned,
      createdBy: {
        id: note.createdById,
        name: note.userName || 'Unknown',
        avatar: note.userAvatar || undefined,
        initials: note.userInitials || 'U',
      },
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt?.toISOString(),
    }))

    return NextResponse.json({ success: true, data: formattedNotes })
  } catch (err) {
    console.error('GET /api/projects/[id]/notes error', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch notes' }, { status: 500 })
  }
}

// POST /api/projects/[id]/notes - Create a new note
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

    const body = await req.json()
    const { title, content } = body

    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'Title and content are required' }, { status: 400 })
    }

    // Create note
    const noteId = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await db.insert(dbSchema.projectNotes).values({
      id: noteId,
      projectId,
      title,
      content,
      isPinned: false,
      createdById: userId,
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true, data: { id: noteId } })
  } catch (err) {
    console.error('POST /api/projects/[id]/notes error', err)
    return NextResponse.json({ success: false, error: 'Failed to create note' }, { status: 500 })
  }
}
