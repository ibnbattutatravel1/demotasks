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

    const result = await db.execute(sql`
      SELECT 
        cm.*,
        u.name,
        u.email,
        u.avatar,
        u.initials
      FROM community_members cm
      LEFT JOIN users u ON cm.user_id = u.id
      WHERE cm.community_id = ${id}
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
    `)
    const data = Array.isArray(result[0]) ? result[0] : result.rows || result || []

    return NextResponse.json({
      success: true,
      data: data
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
    const memberResult = await db.execute(sql`SELECT role FROM community_members WHERE community_id = ${id} AND user_id = ${userId}`)
    const member = Array.isArray(memberResult[0]) ? memberResult[0][0] : memberResult.rows?.[0] || memberResult[0]

    if (!member || !['owner', 'admin', 'moderator'].includes(member.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await req.json()
    const { user_id, role = 'contributor' } = body

    if (!user_id) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 })
    }

    // Check if already member
    const existingResult = await db.execute(sql`SELECT id FROM community_members WHERE community_id = ${id} AND user_id = ${user_id}`)
    const existing = Array.isArray(existingResult[0]) ? existingResult[0] : existingResult.rows || existingResult || []
    
    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: 'User already a member' }, { status: 400 })
    }

    const memberId = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    await db.execute(sql`
      INSERT INTO community_members (
        id, community_id, user_id, role, joined_at
      ) VALUES (${memberId}, ${id}, ${user_id}, ${role}, NOW())
    `)

    // Create notification
    try {
      const commResult = await db.execute(sql`SELECT name FROM communities WHERE id = ${id}`)
      const community = Array.isArray(commResult[0]) ? commResult[0][0] : commResult.rows?.[0] || commResult[0]

      const notifId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await db.execute(sql`
        INSERT INTO notifications (
          id, user_id, type, title, message, related_id, related_type, created_at
        ) VALUES (
          ${notifId},
          ${user_id},
          'community',
          ${'Added to Community'},
          ${`You've been added to ${community?.name || 'a community'}`},
          ${id},
          'community',
          NOW()
        )
      `)
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
