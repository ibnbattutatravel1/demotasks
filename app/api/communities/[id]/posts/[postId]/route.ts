import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { sql } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'

// GET - Get single post
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  try {
    const { postId } = await params

    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const result = await db.execute(sql`
      SELECT 
        p.*,
        u.name as author_name,
        u.avatar as author_avatar,
        u.initials as author_initials
      FROM community_posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.id = ${postId} AND p.is_deleted = FALSE
    `)
    const post = Array.isArray(result[0]) ? result[0][0] : result.rows?.[0] || result[0]

    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
    }

    // Increment view count
    try {
      await db.execute(sql`UPDATE community_posts SET views_count = views_count + 1 WHERE id = ${postId}`)
    } catch (e) {
      console.error('Failed to increment view count:', e)
    }

    return NextResponse.json({
      success: true,
      data: post
    })

  } catch (error) {
    console.error('GET post error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch post' }, { status: 500 })
  }
}

// PATCH - Update post
export async function PATCH(
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
    const { content, title, is_pinned } = body

    // Check if user can edit
    const postResult = await db.execute(sql`SELECT author_id FROM community_posts WHERE id = ${postId}`)
    const post = Array.isArray(postResult[0]) ? postResult[0][0] : postResult.rows?.[0] || postResult[0]

    const memberResult = await db.execute(sql`SELECT role FROM community_members WHERE community_id = ${id} AND user_id = ${userId}`)
    const member = Array.isArray(memberResult[0]) ? memberResult[0][0] : memberResult.rows?.[0] || memberResult[0]

    const canEdit = 
      post?.author_id === userId ||
      ['owner', 'admin', 'moderator', 'editor'].includes(member?.role)

    if (!canEdit) {
      return NextResponse.json({ success: false, error: 'Permission denied' }, { status: 403 })
    }

    const updates: string[] = []
    const values: any[] = []

    if (content !== undefined) {
      updates.push('content = ?')
      values.push(content)
    }
    if (title !== undefined) {
      updates.push('title = ?')
      values.push(title)
    }
    if (is_pinned !== undefined && ['owner', 'admin', 'moderator'].includes(member?.role)) {
      updates.push('is_pinned = ?')
      values.push(is_pinned)
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 })
    }

    updates.push('edited_at = NOW()')
    updates.push('updated_at = NOW()')

    const updateSQL = `UPDATE community_posts SET ${updates.join(', ')} WHERE id = '${postId}'`
    await db.execute(sql.raw(updateSQL))

    return NextResponse.json({
      success: true,
      message: 'Post updated'
    })

  } catch (error) {
    console.error('PATCH post error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update post' }, { status: 500 })
  }
}

// DELETE - Delete post
export async function DELETE(
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

    // Check permissions
    const postResult = await db.execute(sql`SELECT author_id FROM community_posts WHERE id = ${postId}`)
    const post = Array.isArray(postResult[0]) ? postResult[0][0] : postResult.rows?.[0] || postResult[0]

    const memberResult = await db.execute(sql`SELECT role FROM community_members WHERE community_id = ${id} AND user_id = ${userId}`)
    const member = Array.isArray(memberResult[0]) ? memberResult[0][0] : memberResult.rows?.[0] || memberResult[0]

    const canDelete = 
      post?.author_id === userId ||
      ['owner', 'admin', 'moderator'].includes(member?.role)

    if (!canDelete) {
      return NextResponse.json({ success: false, error: 'Permission denied' }, { status: 403 })
    }

    // Soft delete
    await db.execute(sql`UPDATE community_posts SET is_deleted = TRUE, updated_at = NOW() WHERE id = ${postId}`)

    return NextResponse.json({
      success: true,
      message: 'Post deleted'
    })

  } catch (error) {
    console.error('DELETE post error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete post' }, { status: 500 })
  }
}
