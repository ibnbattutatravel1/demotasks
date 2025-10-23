import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { sql } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'

// POST - Add/remove reaction
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
    const { reaction_type } = body // 'like', 'love', 'celebrate', etc.

    if (!reaction_type) {
      return NextResponse.json({ success: false, error: 'Reaction type is required' }, { status: 400 })
    }

    // Check if user is member
    const memberResult = await db.execute(sql`SELECT role FROM community_members WHERE community_id = ${id} AND user_id = ${userId}`)
    const member = Array.isArray(memberResult[0]) ? memberResult[0][0] : memberResult.rows?.[0] || memberResult[0]

    if (!member) {
      return NextResponse.json({ success: false, error: 'Not a member' }, { status: 403 })
    }

    // Check community settings
    const communityResult = await db.execute(sql`SELECT settings FROM communities WHERE id = ${id}`)
    const community = Array.isArray(communityResult[0]) ? communityResult[0][0] : communityResult.rows?.[0] || communityResult[0]
    const settings = community?.settings ? (typeof community.settings === 'string' ? JSON.parse(community.settings) : community.settings) : {}

    if (settings.allow_reactions === false) {
      return NextResponse.json({ success: false, error: 'Reactions are disabled for this community' }, { status: 403 })
    }

    // Check if reaction already exists
    const existingResult = await db.execute(sql`
      SELECT id FROM community_reactions 
      WHERE post_id = ${postId} AND user_id = ${userId} AND reaction_type = ${reaction_type}
    `)
    const existing = Array.isArray(existingResult[0]) ? existingResult[0][0] : existingResult.rows?.[0] || existingResult[0]

    if (existing) {
      // Remove reaction (toggle off)
      await db.execute(sql`
        DELETE FROM community_reactions 
        WHERE post_id = ${postId} AND user_id = ${userId} AND reaction_type = ${reaction_type}
      `)
      
      return NextResponse.json({
        success: true,
        action: 'removed',
        message: 'Reaction removed'
      })
    } else {
      // Add reaction
      const reactionId = `react_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      await db.execute(sql`
        INSERT INTO community_reactions (
          id, post_id, user_id, reaction_type, created_at
        ) VALUES (
          ${reactionId},
          ${postId},
          ${userId},
          ${reaction_type},
          NOW()
        )
      `)

      // Get post author for notification
      const postResult = await db.execute(sql`SELECT author_id FROM community_posts WHERE id = ${postId}`)
      const post = Array.isArray(postResult[0]) ? postResult[0][0] : postResult.rows?.[0] || postResult[0]

      // Send notification to post author (if not self)
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
              ${'New Reaction'},
              ${'Someone reacted to your post with ' + reaction_type},
              ${postId},
              'post',
              NOW()
            )
          `)
        } catch (e) {
          console.error('Failed to create notification:', e)
        }
      }

      return NextResponse.json({
        success: true,
        action: 'added',
        message: 'Reaction added',
        data: { id: reactionId }
      }, { status: 201 })
    }

  } catch (error) {
    console.error('POST reaction error:', error)
    return NextResponse.json({ success: false, error: 'Failed to process reaction' }, { status: 500 })
  }
}

// GET - Get reactions for a post
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  try {
    const { postId } = await params

    const result = await db.execute(sql`
      SELECT 
        r.reaction_type,
        COUNT(*) as count,
        GROUP_CONCAT(u.name) as user_names
      FROM community_reactions r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.post_id = ${postId}
      GROUP BY r.reaction_type
    `)
    const data = Array.isArray(result[0]) ? result[0] : result.rows || result || []

    // Also get current user's reactions
    const token = req.cookies.get(AUTH_COOKIE)?.value
    let userReactions = []
    
    if (token) {
      const payload = await verifyAuthToken(token).catch(() => null)
      if (payload?.sub) {
        const userResult = await db.execute(sql`
          SELECT reaction_type FROM community_reactions 
          WHERE post_id = ${postId} AND user_id = ${payload.sub}
        `)
        userReactions = Array.isArray(userResult[0]) ? userResult[0].map((r: any) => r.reaction_type) : []
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        reactions: data,
        userReactions: userReactions
      }
    })

  } catch (error) {
    console.error('GET reactions error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch reactions' }, { status: 500 })
  }
}
