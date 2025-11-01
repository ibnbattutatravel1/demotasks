import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq, inArray } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'
import { toISOString, toISOStringOrUndefined } from '@/lib/date-utils'

// Helper to ensure a user exists (since current auth uses local mock ids)
async function ensureUsers(ids: string[]) {
  if (ids.length === 0) return
  const existing = await db.select().from(dbSchema.users).where(inArray(dbSchema.users.id, ids))
  const existingIds = new Set(existing.map((u) => u.id))
  const toInsert = ids
    .filter((id) => !existingIds.has(id))
    .map((id) => ({
      id,
      name: `User ${id}`,
      email: `${id}@example.com`,
      avatar: null as string | null,
      initials: (id[0] || 'U').toUpperCase(),
      role: 'user' as const,
    }))
  if (toInsert.length > 0) {
    await db.insert(dbSchema.users).values(toInsert)
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get current user from auth token
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    
    const currentUserId = payload.sub
    const isAdmin = payload.role === 'admin'

    // Get all projects and team members
    const allProjects = await db.select().from(dbSchema.projects)
    const allTeamRows = await db.select().from(dbSchema.projectTeam)
    
    let rows: typeof allProjects
    
    if (isAdmin) {
      // Admins can see all projects
      rows = allProjects
    } else {
      // Filter projects: user is owner OR user is in project team
      const userProjectIds = new Set<string>()
      
      // Add projects where user is owner
      allProjects.forEach((p) => {
        if (p.ownerId === currentUserId) {
          userProjectIds.add(p.id)
        }
      })
      
      // Add projects where user is team member
      allTeamRows.forEach((t) => {
        if (t.userId === currentUserId) {
          userProjectIds.add(t.projectId)
        }
      })
      
      // Filter to only user's projects
      rows = allProjects.filter((p) => userProjectIds.has(p.id))
    }
    
    if (rows.length === 0) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 })
    }

    // Optimized: Load all related data in parallel with single queries
    const projectIds = rows.map((p) => p.id)
    const ownerIds = [...new Set(rows.map((r) => r.ownerId))]

    const [owners, teamRows, tagRows, taskRows] = await Promise.all([
      db.select().from(dbSchema.users).where(inArray(dbSchema.users.id, ownerIds)),
      db.select().from(dbSchema.projectTeam).where(inArray(dbSchema.projectTeam.projectId, projectIds)),
      db.select().from(dbSchema.projectTags).where(inArray(dbSchema.projectTags.projectId, projectIds)),
      db.select({ projectId: dbSchema.tasks.projectId, status: dbSchema.tasks.status }).from(dbSchema.tasks).where(inArray(dbSchema.tasks.projectId, projectIds))
    ])

    // Get unique team user IDs and fetch them
    const teamUserIds = [...new Set(teamRows.map((t) => t.userId))]
    const teamUsers = teamUserIds.length > 0
      ? await db.select().from(dbSchema.users).where(inArray(dbSchema.users.id, teamUserIds))
      : []

    const data = rows.map((p) => {
      const owner = owners.find((o) => o.id === p.ownerId)
      const teamIds = teamRows.filter((t) => t.projectId === p.id).map((t) => t.userId)
      const team = teamIds
        .map((uid) => teamUsers.find((u) => u.id === uid))
        .filter(Boolean)
        .map((u) => ({ id: u!.id, name: u!.name, email: u!.email, initials: u!.initials, avatar: u!.avatar || undefined }))

      const tags = tagRows.filter((t) => t.projectId === p.id).map((t) => t.tag)
      
      // Count tasks for this project
      const projectTaskRows = taskRows.filter((t) => t.projectId === p.id)
      const totalTasks = projectTaskRows.length
      const tasksCompleted = projectTaskRows.filter((t) => t.status === 'done').length

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status as any,
        priority: p.priority as any,
        startDate: toISOString(p.startDate),
        dueDate: toISOString(p.dueDate),
        createdAt: toISOString(p.createdAt),
        updatedAt: toISOStringOrUndefined(p.updatedAt),
        completedAt: toISOStringOrUndefined(p.completedAt),
        progress: p.progress,
        tasks: [],
        tasksCompleted,
        totalTasks,
        ownerId: p.ownerId,
        owner: owner
          ? { id: owner.id, name: owner.name, email: owner.email, initials: owner.initials, avatar: owner.avatar || undefined }
          : { id: p.ownerId, name: `User ${p.ownerId}`, email: `${p.ownerId}@example.com`, initials: (p.ownerId[0] || 'U').toUpperCase() },
        team,
        tags,
        color: p.color,
      }
    })

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (err) {
    console.error('GET /api/projects error', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check if user is admin
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const userRows = await db.select({ id: dbSchema.users.id, role: dbSchema.users.role }).from(dbSchema.users).where(eq(dbSchema.users.id, payload.sub))
    const user = userRows[0]
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Only admins can create projects' }, { status: 403 })
    }
    
    const body = await req.json()
    const {
      name,
      description,
      priority,
      startDate,
      dueDate,
      ownerId,
      teamIds = [],
      tags = [],
      color = '#6366f1',
    } = body as {
      name: string
      description: string
      priority: 'low' | 'medium' | 'high'
      startDate: string
      dueDate: string
      ownerId: string
      teamIds?: string[]
      tags?: string[]
      color?: string
    }

    if (!name || !priority || !ownerId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    // Ensure users exist for owner and team
    await ensureUsers([ownerId, ...teamIds])

    const id = (globalThis.crypto?.randomUUID?.() ?? randomUUID()) as string
    const now = new Date()

    await db.insert(dbSchema.projects).values({
      id,
      name,
      description: description ?? '',
      status: 'planning',
      priority,
      startDate: startDate ? new Date(startDate) : now,
      dueDate: dueDate ? new Date(dueDate) : now,
      createdAt: now,
      updatedAt: now,
      progress: 0,
      ownerId,
      color,
    })

    if (teamIds.length) {
      await db.insert(dbSchema.projectTeam).values(teamIds.map((uid) => ({ projectId: id, userId: uid })))
    }

    if (tags.length) {
      await db.insert(dbSchema.projectTags).values(tags.map((tag) => ({ projectId: id, tag })))
    }

    // Return the created project via GET composition for consistency
    const projectRow = (await db.select().from(dbSchema.projects).where(eq(dbSchema.projects.id, id)))[0]
    const owner = (await db.select().from(dbSchema.users).where(eq(dbSchema.users.id, ownerId)))[0]
    const team = teamIds.length
      ? await db.select().from(dbSchema.users).where(inArray(dbSchema.users.id, teamIds))
      : []
    const tagRows = await db.select().from(dbSchema.projectTags).where(eq(dbSchema.projectTags.projectId, id))

    const response = {
      id: projectRow.id,
      name: projectRow.name,
      description: projectRow.description,
      status: projectRow.status as any,
      priority: projectRow.priority as any,
      startDate: toISOString(projectRow.startDate),
      dueDate: toISOString(projectRow.dueDate),
      createdAt: toISOString(projectRow.createdAt),
      updatedAt: toISOStringOrUndefined(projectRow.updatedAt),
      completedAt: toISOStringOrUndefined(projectRow.completedAt),
      progress: projectRow.progress,
      tasks: [],
      tasksCompleted: 0,
      totalTasks: 0,
      ownerId: projectRow.ownerId,
      owner: owner
        ? { id: owner.id, name: owner.name, initials: owner.initials, avatar: owner.avatar || undefined }
        : { id: projectRow.ownerId, name: `User ${projectRow.ownerId}`, initials: (projectRow.ownerId[0] || 'U').toUpperCase() },
      team: team.map((u) => ({ id: u.id, name: u.name, initials: u.initials, avatar: u.avatar || undefined })),
      tags: tagRows.map((t) => t.tag),
      color: projectRow.color,
    }

    return NextResponse.json({ success: true, data: response }, { status: 201 })
  } catch (err) {
    console.error('POST /api/projects error', err)
    return NextResponse.json({ success: false, error: 'Failed to create project' }, { status: 500 })
  }
}
