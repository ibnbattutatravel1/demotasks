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
    const communities = await db.execute(sql`
      SELECT DISTINCT
        c.*,
        cm.user_id,
        cm.role as user_role,
        cm.joined_at as user_joined_at,
        u.name as creator_name,
        u.avatar as creator_avatar
      FROM communities c
      LEFT JOIN community_members cm ON c.id = cm.community_id AND cm.user_id = ${userId}
      LEFT JOIN users u ON c.created_by = u.id
      WHERE 
        (cm.user_id = ${userId} OR c.visibility = 'public' OR ${user.role} = 'admin')
        AND c.is_archived = FALSE
      ORDER BY 
        CASE WHEN cm.user_id IS NOT NULL THEN 0 ELSE 1 END,
        c.created_at DESC
    `)

    // Debug logging
    console.log('Communities raw response:', JSON.stringify(communities).substring(0, 500))
    console.log('Communities response structure:', {
      hasRows: !!communities.rows,
      rowsLength: communities.rows?.length || 0,
      hasArray: Array.isArray(communities),
      arrayLength: Array.isArray(communities) ? communities.length : 0,
      type: typeof communities,
      keys: Object.keys(communities || {}),
      constructor: communities?.constructor?.name
    })

    // Handle both array and rows format
    let data = []
    if (Array.isArray(communities)) {
      // Check if it's a nested array [[...]]
      if (Array.isArray(communities[0])) {
        data = communities[0]
      } else {
        data = communities
      }
    } else if (communities.rows && Array.isArray(communities.rows)) {
      data = communities.rows
    } else if (communities[0]) {
      // Convert object with numeric keys to array
      data = Object.values(communities)
    }
    
    console.log('✅ Sending data count:', data.length)
    console.log('✅ First community:', data[0]?.name || 'none')

    return NextResponse.json({
      success: true,
      data: data
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
    await db.execute(sql`
      INSERT INTO communities (
        id, name, description, icon, color, visibility, 
        created_by, settings, created_at, updated_at
      ) VALUES (
        ${communityId},
        ${name},
        ${description || null},
        ${icon || '🏘️'},
        ${color || '#6366f1'},
        ${visibility || 'private'},
        ${userId},
        ${settings ? JSON.stringify(settings) : null},
        NOW(),
        NOW()
      )
    `)

    // Add creator as owner
    const memberId = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await db.execute(sql`
      INSERT INTO community_members (
        id, community_id, user_id, role, joined_at
      ) VALUES (${memberId}, ${communityId}, ${userId}, 'owner', NOW())
    `)

    // Add initial members if provided
    if (memberIds && Array.isArray(memberIds) && memberIds.length > 0) {
      for (const memberId of memberIds) {
        try {
          const newMemberId = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          await db.execute(sql`
            INSERT INTO community_members (
              id, community_id, user_id, role, joined_at
            ) VALUES (${newMemberId}, ${communityId}, ${memberId}, 'contributor', NOW())
          `)

          // Create notification
          try {
            const notifId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            await db.execute(sql`
              INSERT INTO notifications (
                id, user_id, type, title, message, related_id, related_type, is_read, created_at
              ) VALUES (
                ${notifId},
                ${memberId},
                'community',
                ${'Added to Community'},
                ${`You've been added to ${name}`},
                ${communityId},
                'community',
                FALSE,
                NOW()
              )
            `)
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
      const activityId = `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await db.execute(sql`
        INSERT INTO community_activity (
          id, community_id, user_id, action, target_type, target_id, created_at
        ) VALUES (
          ${activityId},
          ${communityId},
          ${userId},
          'created',
          'community',
          ${communityId},
          NOW()
        )
      `)
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
