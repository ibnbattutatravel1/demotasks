import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq, and, sql } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'

// GET /api/communities/[id] - Get community details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userId = payload.sub

    // Get community with user's role
    const query = `
      SELECT 
        c.*,
        cm.role as user_role,
        cm.joined_at as user_joined_at,
        u.name as creator_name,
        u.avatar as creator_avatar
      FROM communities c
      LEFT JOIN community_members cm ON c.id = cm.community_id AND cm.user_id = ?
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = ? AND c.is_archived = FALSE
    `

    const result = await db.execute(sql.raw(query, [userId, id]))
    const community = result.rows?.[0]

    if (!community) {
      return NextResponse.json({ success: false, error: 'Community not found' }, { status: 404 })
    }

    // Check access
    const userRows = await db.select().from(dbSchema.users).where(eq(dbSchema.users.id, userId))
    const user = userRows[0]
    
    const hasAccess = 
      community.visibility === 'public' ||
      community.user_role ||
      user?.role === 'admin'

    if (!hasAccess) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
    }

    // Get recent posts
    const postsQuery = `
      SELECT 
        p.*,
        u.name as author_name,
        u.avatar as author_avatar,
        u.initials as author_initials,
        (SELECT COUNT(*) FROM community_comments WHERE post_id = p.id AND is_deleted = FALSE) as comments_count
      FROM community_posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.community_id = ? AND p.is_deleted = FALSE
      ORDER BY 
        p.is_pinned DESC,
        p.created_at DESC
      LIMIT 20
    `

    const postsResult = await db.execute(sql.raw(postsQuery, [id]))
    const posts = postsResult.rows || []

    // Get members count by role
    const membersQuery = `
      SELECT 
        role,
        COUNT(*) as count
      FROM community_members
      WHERE community_id = ?
      GROUP BY role
    `

    const membersResult = await db.execute(sql.raw(membersQuery, [id]))
    const membersByRole = membersResult.rows || []

    return NextResponse.json({
      success: true,
      data: {
        community,
        posts,
        membersByRole,
      }
    })

  } catch (error) {
    console.error('GET /api/communities/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch community' },
      { status: 500 }
    )
  }
}

// PATCH /api/communities/[id] - Update community
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userId = payload.sub

    // Check if user is admin or community owner/admin
    const memberQuery = `
      SELECT role FROM community_members 
      WHERE community_id = ? AND user_id = ?
    `
    const memberResult = await db.execute(sql.raw(memberQuery, [id, userId]))
    const member = memberResult.rows?.[0]

    const userRows = await db.select().from(dbSchema.users).where(eq(dbSchema.users.id, userId))
    const user = userRows[0]

    const canEdit = 
      user?.role === 'admin' ||
      member?.role === 'owner' ||
      member?.role === 'admin'

    if (!canEdit) {
      return NextResponse.json({ success: false, error: 'Permission denied' }, { status: 403 })
    }

    const body = await req.json()
    const { name, description, icon, color, visibility, settings } = body

    // Build update query dynamically
    const updates: string[] = []
    const values: any[] = []

    if (name !== undefined) {
      updates.push('name = ?')
      values.push(name)
    }
    if (description !== undefined) {
      updates.push('description = ?')
      values.push(description)
    }
    if (icon !== undefined) {
      updates.push('icon = ?')
      values.push(icon)
    }
    if (color !== undefined) {
      updates.push('color = ?')
      values.push(color)
    }
    if (visibility !== undefined) {
      updates.push('visibility = ?')
      values.push(visibility)
    }
    if (settings !== undefined) {
      updates.push('settings = ?')
      values.push(JSON.stringify(settings))
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 })
    }

    updates.push('updated_at = NOW()')
    values.push(id)

    const updateQuery = `
      UPDATE communities 
      SET ${updates.join(', ')}
      WHERE id = ?
    `

    await db.execute(sql.raw(updateQuery, values))

    // Log activity
    try {
      const activityQuery = `
        INSERT INTO community_activity (
          id, community_id, user_id, action, target_type, target_id, created_at
        ) VALUES (?, ?, ?, 'updated', 'community', ?, NOW())
      `
      
      await db.execute(sql.raw(activityQuery, [
        `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        id,
        userId,
        id
      ]))
    } catch (e) {
      console.error('Failed to log activity:', e)
    }

    return NextResponse.json({
      success: true,
      message: 'Community updated'
    })

  } catch (error) {
    console.error('PATCH /api/communities/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update community' },
      { status: 500 }
    )
  }
}

// DELETE /api/communities/[id] - Delete/Archive community
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userId = payload.sub

    // Check if user is admin or community owner
    const memberQuery = `
      SELECT role FROM community_members 
      WHERE community_id = ? AND user_id = ?
    `
    const memberResult = await db.execute(sql.raw(memberQuery, [id, userId]))
    const member = memberResult.rows?.[0]

    const userRows = await db.select().from(dbSchema.users).where(eq(dbSchema.users.id, userId))
    const user = userRows[0]

    const canDelete = 
      user?.role === 'admin' ||
      member?.role === 'owner'

    if (!canDelete) {
      return NextResponse.json({ success: false, error: 'Only owners can delete communities' }, { status: 403 })
    }

    // Soft delete (archive)
    const deleteQuery = `
      UPDATE communities 
      SET is_archived = TRUE, archived_at = NOW(), updated_at = NOW()
      WHERE id = ?
    `

    await db.execute(sql.raw(deleteQuery, [id]))

    // Log activity
    try {
      const activityQuery = `
        INSERT INTO community_activity (
          id, community_id, user_id, action, target_type, target_id, created_at
        ) VALUES (?, ?, ?, 'archived', 'community', ?, NOW())
      `
      
      await db.execute(sql.raw(activityQuery, [
        `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        id,
        userId,
        id
      ]))
    } catch (e) {
      console.error('Failed to log activity:', e)
    }

    return NextResponse.json({
      success: true,
      message: 'Community archived'
    })

  } catch (error) {
    console.error('DELETE /api/communities/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete community' },
      { status: 500 }
    )
  }
}
