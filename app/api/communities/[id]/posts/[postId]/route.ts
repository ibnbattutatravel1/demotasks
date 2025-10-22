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

    const query = `
      SELECT 
        p.*,
        u.name as author_name,
        u.avatar as author_avatar,
        u.initials as author_initials
      FROM community_posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.id = ? AND p.is_deleted = FALSE
    `

    const result = await db.execute(sql.raw(query, [postId]))
    const post = result.rows?.[0]

    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
    }

    // Increment view count
    try {
      const updateQuery = `UPDATE community_posts SET views_count = views_count + 1 WHERE id = ?`
      await db.execute(sql.raw(updateQuery, [postId]))
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
    const postQuery = `SELECT author_id FROM community_posts WHERE id = ?`
    const postResult = await db.execute(sql.raw(postQuery, [postId]))
    const post = postResult.rows?.[0]

    const memberQuery = `SELECT role FROM community_members WHERE community_id = ? AND user_id = ?`
    const memberResult = await db.execute(sql.raw(memberQuery, [id, userId]))
    const member = memberResult.rows?.[0]

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
    values.push(postId)

    const updateQuery = `UPDATE community_posts SET ${updates.join(', ')} WHERE id = ?`
    await db.execute(sql.raw(updateQuery, values))

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
    const postQuery = `SELECT author_id FROM community_posts WHERE id = ?`
    const postResult = await db.execute(sql.raw(postQuery, [postId]))
    const post = postResult.rows?.[0]

    const memberQuery = `SELECT role FROM community_members WHERE community_id = ? AND user_id = ?`
    const memberResult = await db.execute(sql.raw(memberQuery, [id, userId]))
    const member = memberResult.rows?.[0]

    const canDelete = 
      post?.author_id === userId ||
      ['owner', 'admin', 'moderator'].includes(member?.role)

    if (!canDelete) {
      return NextResponse.json({ success: false, error: 'Permission denied' }, { status: 403 })
    }

    // Soft delete
    const deleteQuery = `UPDATE community_posts SET is_deleted = TRUE, updated_at = NOW() WHERE id = ?`
    await db.execute(sql.raw(deleteQuery, [postId]))

    return NextResponse.json({
      success: true,
      message: 'Post deleted'
    })

  } catch (error) {
    console.error('DELETE post error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete post' }, { status: 500 })
  }
}
