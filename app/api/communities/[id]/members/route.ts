import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { sql } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'

// GET - List members
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const query = `
      SELECT 
        cm.*,
        u.name,
        u.email,
        u.avatar,
        u.initials
      FROM community_members cm
      LEFT JOIN users u ON cm.user_id = u.id
      WHERE cm.community_id = ?
      ORDER BY 
        CASE cm.role
          WHEN 'owner' THEN 1
          WHEN 'admin' THEN 2
          WHEN 'moderator' THEN 3
          WHEN 'editor' THEN 4
          WHEN 'contributor' THEN 5
          WHEN 'viewer' THEN 6
        END,
        cm.joined_at DESC
    `

    const result = await db.execute(sql.raw(query, [id]))

    return NextResponse.json({
      success: true,
      data: result.rows || []
    })

  } catch (error) {
    console.error('GET members error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch members' }, { status: 500 })
  }
}

// POST - Add member
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

    // Check permissions
    const memberQuery = `SELECT role FROM community_members WHERE community_id = ? AND user_id = ?`
    const memberResult = await db.execute(sql.raw(memberQuery, [id, userId]))
    const member = memberResult.rows?.[0]

    if (!member || !['owner', 'admin', 'moderator'].includes(member.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await req.json()
    const { user_id, role = 'viewer' } = body

    if (!user_id) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 })
    }

    // Check if already member
    const existingQuery = `SELECT id FROM community_members WHERE community_id = ? AND user_id = ?`
    const existingResult = await db.execute(sql.raw(existingQuery, [id, user_id]))
    
    if (existingResult.rows && existingResult.rows.length > 0) {
      return NextResponse.json({ success: false, error: 'User already a member' }, { status: 400 })
    }

    const memberId = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const insertQuery = `
      INSERT INTO community_members (
        id, community_id, user_id, role, joined_at
      ) VALUES (?, ?, ?, ?, NOW())
    `

    await db.execute(sql.raw(insertQuery, [memberId, id, user_id, role]))

    // Create notification
    try {
      const commQuery = `SELECT name FROM communities WHERE id = ?`
      const commResult = await db.execute(sql.raw(commQuery, [id]))
      const community = commResult.rows?.[0]

      const notifQuery = `
        INSERT INTO notifications (
          id, user_id, type, title, message, related_id, related_type, is_read, created_at
        ) VALUES (?, ?, 'community', ?, ?, ?, 'community', FALSE, NOW())
      `
      
      await db.execute(sql.raw(notifQuery, [
        `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id,
        'Added to Community',
        `You've been added to ${community?.name || 'a community'}`,
        id
      ]))
    } catch (e) {
      console.error('Failed to create notification:', e)
    }

    return NextResponse.json({
      success: true,
      data: { id: memberId }
    }, { status: 201 })

  } catch (error) {
    console.error('POST member error:', error)
    return NextResponse.json({ success: false, error: 'Failed to add member' }, { status: 500 })
  }
}
