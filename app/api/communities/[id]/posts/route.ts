import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { sql } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'

// GET /api/communities/[id]/posts - List posts
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    // Get posts with author info and comment counts
    const query = `
      SELECT 
        p.*,
        u.name as author_name,
        u.avatar as author_avatar,
        u.initials as author_initials,
        (SELECT COUNT(*) FROM community_comments WHERE post_id = p.id AND is_deleted = FALSE) as comments_count
      FROM community_posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.community_id = ? AND p.is_deleted = FALSE AND p.is_draft = FALSE
      ORDER BY p.is_pinned DESC, p.created_at DESC
      LIMIT ? OFFSET ?
    `

    const result = await db.execute(sql.raw(query, [id, limit, offset]))

    return NextResponse.json({
      success: true,
      data: result.rows || []
    })

  } catch (error) {
    console.error('GET posts error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch posts' }, { status: 500 })
  }
}

// POST /api/communities/[id]/posts - Create post
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const userId = payload.sub
    const body = await req.json()
    const { title, content, content_type, is_draft, tags, mentioned_users } = body

    if (!content) {
      return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 })
    }

    // Check if user is member
    const memberQuery = `SELECT role FROM community_members WHERE community_id = ? AND user_id = ?`
    const memberResult = await db.execute(sql.raw(memberQuery, [id, userId]))
    const member = memberResult.rows?.[0]

    if (!member) {
      return NextResponse.json({ success: false, error: 'Not a member' }, { status: 403 })
    }

    // Check permissions (viewer cannot post)
    if (member.role === 'viewer') {
      return NextResponse.json({ success: false, error: 'Viewers cannot create posts' }, { status: 403 })
    }

    const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const insertQuery = `
      INSERT INTO community_posts (
        id, community_id, title, content, content_type, author_id,
        is_draft, tags, mentioned_users, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `

    await db.execute(sql.raw(insertQuery, [
      postId,
      id,
      title || null,
      content,
      content_type || 'markdown',
      userId,
      is_draft || false,
      tags ? JSON.stringify(tags) : null,
      mentioned_users ? JSON.stringify(mentioned_users) : null
    ]))

    // Create notifications for mentions
    if (mentioned_users && Array.isArray(mentioned_users)) {
      for (const mentionedUserId of mentioned_users) {
        try {
          const notifQuery = `
            INSERT INTO notifications (
              id, user_id, type, title, message, related_id, related_type, is_read, created_at
            ) VALUES (?, ?, 'community', ?, ?, ?, 'post', FALSE, NOW())
          `
          
          await db.execute(sql.raw(notifQuery, [
            `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            mentionedUserId,
            'You were mentioned',
            `${payload.name} mentioned you in a post`,
            postId
          ]))
        } catch (e) {
          console.error('Failed to create mention notification:', e)
        }
      }
    }

    // Log activity
    try {
      const activityQuery = `
        INSERT INTO community_activity (
          id, community_id, user_id, action, target_type, target_id, created_at
        ) VALUES (?, ?, ?, 'created', 'post', ?, NOW())
      `
      
      await db.execute(sql.raw(activityQuery, [
        `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        id,
        userId,
        postId
      ]))
    } catch (e) {
      console.error('Failed to log activity:', e)
    }

    return NextResponse.json({
      success: true,
      data: { id: postId }
    }, { status: 201 })

  } catch (error) {
    console.error('POST create post error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create post' }, { status: 500 })
  }
}
