import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq, and, or, sql, desc } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'

// GET /api/communities - Get all communities user has access to
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userId = payload.sub

    // Get user info
    const userRows = await db.select().from(dbSchema.users).where(eq(dbSchema.users.id, userId))
    const user = userRows[0]
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Get communities where user is a member OR public communities
    const query = `
      SELECT DISTINCT
        c.*,
        cm.role as user_role,
        cm.joined_at as user_joined_at,
        u.name as creator_name,
        u.avatar as creator_avatar
      FROM communities c
      LEFT JOIN community_members cm ON c.id = cm.community_id AND cm.user_id = ?
      LEFT JOIN users u ON c.created_by = u.id
      WHERE 
        (cm.user_id = ? OR c.visibility = 'public' OR ? = 'admin')
        AND c.is_archived = FALSE
      ORDER BY 
        CASE WHEN cm.user_id IS NOT NULL THEN 0 ELSE 1 END,
        c.created_at DESC
    `

    const communities = await db.execute(sql.raw(query, [userId, userId, user.role]))

    return NextResponse.json({
      success: true,
      data: communities.rows || []
    })

  } catch (error) {
    console.error('GET /api/communities error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch communities' },
      { status: 500 }
    )
  }
}

// POST /api/communities - Create new community (Admin only)
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const userId = payload.sub

    // Check if user is admin
    const userRows = await db.select().from(dbSchema.users).where(eq(dbSchema.users.id, userId))
    const user = userRows[0]
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { name, description, icon, color, visibility, settings, memberIds } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Community name is required' },
        { status: 400 }
      )
    }

    // Generate ID
    const communityId = `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create community
    const query = `
      INSERT INTO communities (
        id, name, description, icon, color, visibility, 
        created_by, settings, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `

    await db.execute(sql.raw(query, [
      communityId,
      name,
      description || null,
      icon || '🏘️',
      color || '#6366f1',
      visibility || 'private',
      userId,
      settings ? JSON.stringify(settings) : null
    ]))

    // Add creator as owner
    const memberQuery = `
      INSERT INTO community_members (
        id, community_id, user_id, role, joined_at
      ) VALUES (?, ?, ?, 'owner', NOW())
    `
    
    await db.execute(sql.raw(memberQuery, [
      `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      communityId,
      userId
    ]))

    // Add initial members if provided
    if (memberIds && Array.isArray(memberIds) && memberIds.length > 0) {
      for (const memberId of memberIds) {
        try {
          const memberInsertQuery = `
            INSERT INTO community_members (
              id, community_id, user_id, role, joined_at
            ) VALUES (?, ?, ?, 'viewer', NOW())
          `
          
          await db.execute(sql.raw(memberInsertQuery, [
            `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            communityId,
            memberId
          ]))

          // Create notification
          try {
            const notifQuery = `
              INSERT INTO notifications (
                id, user_id, type, title, message, related_id, related_type, is_read, created_at
              ) VALUES (?, ?, 'community', ?, ?, ?, 'community', FALSE, NOW())
            `
            
            await db.execute(sql.raw(notifQuery, [
              `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              memberId,
              'Added to Community',
              `You've been added to ${name}`,
              communityId
            ]))
          } catch (e) {
            console.error('Failed to create notification:', e)
          }
        } catch (e) {
          console.error('Failed to add member:', e)
        }
      }
    }

    // Log activity
    try {
      const activityQuery = `
        INSERT INTO community_activity (
          id, community_id, user_id, action, target_type, target_id, created_at
        ) VALUES (?, ?, ?, 'created', 'community', ?, NOW())
      `
      
      await db.execute(sql.raw(activityQuery, [
        `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        communityId,
        userId,
        communityId
      ]))
    } catch (e) {
      console.error('Failed to log activity:', e)
    }

    return NextResponse.json({
      success: true,
      data: { id: communityId, name, description, icon, color, visibility }
    }, { status: 201 })

  } catch (error) {
    console.error('POST /api/communities error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create community' },
      { status: 500 }
    )
  }
}
