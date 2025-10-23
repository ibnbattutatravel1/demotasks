import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { sql } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'

// GET - List comments
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  try {
    const { postId } = await params

    const result = await db.execute(sql`
      SELECT 
        c.*,
        u.name as author_name,
        u.avatar as author_avatar,
        u.initials as author_initials
      FROM community_comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.post_id = ${postId} AND c.is_deleted = FALSE
      ORDER BY c.created_at ASC
    `)
    const data = Array.isArray(result[0]) ? result[0] : result.rows || result || []

    return NextResponse.json({
      success: true,
      data: data
    })

  } catch (error) {
    console.error('GET comments error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch comments' }, { status: 500 })
  }
}

// POST - Create comment
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  try {
    const { id, postId } = await params

    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const userId = payload.sub
    const body = await req.json()
    const { content, parent_comment_id, mentioned_users } = body

    if (!content?.trim()) {
      return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 })
    }

    // Get community settings and visibility to check if comments are allowed
    const communityResult = await db.execute(sql`SELECT visibility, settings FROM communities WHERE id = ${id} AND is_archived = FALSE`)
    const community = Array.isArray(communityResult[0]) ? communityResult[0][0] : communityResult.rows?.[0] || communityResult[0]
    
    if (!community) {
      return NextResponse.json({ success: false, error: 'Community not found' }, { status: 404 })
    }

    // For private communities, check membership
    if (community.visibility === 'private') {
      const memberResult = await db.execute(sql`SELECT role FROM community_members WHERE community_id = ${id} AND user_id = ${userId}`)
      const member = Array.isArray(memberResult[0]) ? memberResult[0][0] : memberResult.rows?.[0] || memberResult[0]

      if (!member) {
        return NextResponse.json({ success: false, error: 'Only members can comment in private communities' }, { status: 403 })
      }
    }
    // For public communities, any authenticated user can comment
    const settings = community?.settings ? (typeof community.settings === 'string' ? JSON.parse(community.settings) : community.settings) : {}

    if (settings.allow_comments === false) {
      return NextResponse.json({ success: false, error: 'Comments are disabled for this community' }, { status: 403 })
    }

    const commentId = `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    await db.execute(sql`
      INSERT INTO community_comments (
        id, post_id, content, author_id, parent_comment_id, mentioned_users, created_at, updated_at
      ) VALUES (
        ${commentId},
        ${postId},
        ${content.trim()},
        ${userId},
        ${parent_comment_id || null},
        ${mentioned_users ? JSON.stringify(mentioned_users) : null},
        NOW(),
        NOW()
      )
    `)

    // Get post author for notification
    const postResult = await db.execute(sql`SELECT author_id FROM community_posts WHERE id = ${postId}`)
    const post = Array.isArray(postResult[0]) ? postResult[0][0] : postResult.rows?.[0] || postResult[0]

    // Notify post author
    if (post && post.author_id !== userId) {
      try {
        const notifId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        await db.execute(sql`
          INSERT INTO notifications (
            id, user_id, type, title, message, related_id, related_type, created_at
          ) VALUES (
            ${notifId},
            ${post.author_id},
            'community',
            ${'New Comment'},
            ${'New comment on your post'},
            ${commentId},
            'comment',
            NOW()
          )
        `)
      } catch (e) {
        console.error('Failed to create notification:', e)
      }
    }

    // Notify mentioned users
    if (mentioned_users && Array.isArray(mentioned_users)) {
      for (const mentionedUserId of mentioned_users) {
        try {
          const notifId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          await db.execute(sql`
            INSERT INTO notifications (
              id, user_id, type, title, message, related_id, related_type, created_at
            ) VALUES (
              ${notifId},
              ${mentionedUserId},
              'community',
              ${'You were mentioned'},
              ${'You were mentioned in a comment'},
              ${commentId},
              'comment',
              NOW()
            )
          `)
        } catch (e) {
          console.error('Failed to create mention notification:', e)
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: { id: commentId }
    }, { status: 201 })

  } catch (error) {
    console.error('POST comment error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create comment' }, { status: 500 })
  }
}
