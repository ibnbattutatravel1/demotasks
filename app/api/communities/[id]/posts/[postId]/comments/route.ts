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

    const query = `
      SELECT 
        c.*,
        u.name as author_name,
        u.avatar as author_avatar,
        u.initials as author_initials
      FROM community_comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.post_id = ? AND c.is_deleted = FALSE
      ORDER BY c.created_at ASC
    `

    const result = await db.execute(sql.raw(query, [postId]))

    return NextResponse.json({
      success: true,
      data: result.rows || []
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

    const commentId = `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const insertQuery = `
      INSERT INTO community_comments (
        id, post_id, content, author_id, parent_comment_id, mentioned_users, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `

    await db.execute(sql.raw(insertQuery, [
      commentId,
      postId,
      content.trim(),
      userId,
      parent_comment_id || null,
      mentioned_users ? JSON.stringify(mentioned_users) : null
    ]))

    // Get post author for notification
    const postQuery = `SELECT author_id FROM community_posts WHERE id = ?`
    const postResult = await db.execute(sql.raw(postQuery, [postId]))
    const post = postResult.rows?.[0]

    // Notify post author
    if (post && post.author_id !== userId) {
      try {
        const notifQuery = `
          INSERT INTO notifications (
            id, user_id, type, title, message, related_id, related_type, is_read, created_at
          ) VALUES (?, ?, 'community', ?, ?, ?, 'comment', FALSE, NOW())
        `
        
        await db.execute(sql.raw(notifQuery, [
          `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          post.author_id,
          'New Comment',
          `${payload.name} commented on your post`,
          commentId
        ]))
      } catch (e) {
        console.error('Failed to create notification:', e)
      }
    }

    // Notify mentioned users
    if (mentioned_users && Array.isArray(mentioned_users)) {
      for (const mentionedUserId of mentioned_users) {
        try {
          const notifQuery = `
            INSERT INTO notifications (
              id, user_id, type, title, message, related_id, related_type, is_read, created_at
            ) VALUES (?, ?, 'community', ?, ?, ?, 'comment', FALSE, NOW())
          `
          
          await db.execute(sql.raw(notifQuery, [
            `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            mentionedUserId,
            'You were mentioned',
            `${payload.name} mentioned you in a comment`,
            commentId
          ]))
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
