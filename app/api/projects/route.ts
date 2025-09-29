import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq, inArray } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'

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

export async function GET() {
  try {
    const rows = await db.select().from(dbSchema.projects)

    // Load owner, team, and tags for each project
    const projectIds = rows.map((p) => p.id)

    const owners = await db
      .select()
      .from(dbSchema.users)
      .where(inArray(dbSchema.users.id, rows.map((r) => r.ownerId)))

    const teamRows = projectIds.length
      ? await db.select().from(dbSchema.projectTeam).where(inArray(dbSchema.projectTeam.projectId, projectIds))
      : []

    const teamUserIds = [...new Set(teamRows.map((t) => t.userId))]
    const teamUsers = teamUserIds.length
      ? await db.select().from(dbSchema.users).where(inArray(dbSchema.users.id, teamUserIds))
      : []

    const tagRows = projectIds.length
      ? await db.select().from(dbSchema.projectTags).where(inArray(dbSchema.projectTags.projectId, projectIds))
      : []

    const data = rows.map((p) => {
      const owner = owners.find((o) => o.id === p.ownerId)
      const teamIds = teamRows.filter((t) => t.projectId === p.id).map((t) => t.userId)
      const team = teamIds
        .map((uid) => teamUsers.find((u) => u.id === uid))
        .filter(Boolean)
        .map((u) => ({ id: u!.id, name: u!.name, initials: u!.initials, avatar: u!.avatar || undefined }))

      const tags = tagRows.filter((t) => t.projectId === p.id).map((t) => t.tag)

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status as any,
        priority: p.priority as any,
        startDate: p.startDate,
        dueDate: p.dueDate,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt || undefined,
        completedAt: p.completedAt || undefined,
        progress: p.progress,
        tasks: [],
        tasksCompleted: 0,
        totalTasks: 0,
        ownerId: p.ownerId,
        owner: owner
          ? { id: owner.id, name: owner.name, initials: owner.initials, avatar: owner.avatar || undefined }
          : { id: p.ownerId, name: `User ${p.ownerId}`, initials: (p.ownerId[0] || 'U').toUpperCase() },
        team,
        tags,
        color: p.color,
        budget: p.budget ?? undefined,
        estimatedHours: p.estimatedHours ?? undefined,
        actualHours: p.actualHours ?? undefined,
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
      budget,
      estimatedHours,
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
      budget?: number
      estimatedHours?: number
    }

    if (!name || !priority || !ownerId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    // Ensure users exist for owner and team
    await ensureUsers([ownerId, ...teamIds])

    const id = (globalThis.crypto?.randomUUID?.() ?? randomUUID()) as string
    const now = new Date().toISOString()

    await db.insert(dbSchema.projects).values({
      id,
      name,
      description: description ?? '',
      status: 'planning',
      priority,
      startDate: startDate ?? now.split('T')[0],
      dueDate: dueDate ?? now.split('T')[0],
      createdAt: now,
      updatedAt: now,
      progress: 0,
      ownerId,
      color,
      budget: budget ?? null,
      estimatedHours: estimatedHours ?? null,
      actualHours: null,
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
      startDate: projectRow.startDate,
      dueDate: projectRow.dueDate,
      createdAt: projectRow.createdAt,
      updatedAt: projectRow.updatedAt || undefined,
      completedAt: projectRow.completedAt || undefined,
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
      budget: projectRow.budget ?? undefined,
      estimatedHours: projectRow.estimatedHours ?? undefined,
      actualHours: projectRow.actualHours ?? undefined,
    }

    return NextResponse.json({ success: true, data: response }, { status: 201 })
  } catch (err) {
    console.error('POST /api/projects error', err)
    return NextResponse.json({ success: false, error: 'Failed to create project' }, { status: 500 })
  }
}
