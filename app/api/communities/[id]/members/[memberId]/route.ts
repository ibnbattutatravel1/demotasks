import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { sql } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'

// PATCH - Update member role
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { id, memberId } = await params

    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const userId = payload.sub

    // Check if requester is owner or admin
    const requesterResult = await db.execute(sql`
      SELECT role FROM community_members 
      WHERE community_id = ${id} AND user_id = ${userId}
    `)
    const requester = Array.isArray(requesterResult[0]) ? requesterResult[0][0] : requesterResult.rows?.[0] || requesterResult[0]

    if (!requester || !['owner', 'admin'].includes(requester.role)) {
      return NextResponse.json({ success: false, error: 'Permission denied' }, { status: 403 })
    }

    // Get target member
    const memberResult = await db.execute(sql`
      SELECT * FROM community_members WHERE id = ${memberId}
    `)
    const member = Array.isArray(memberResult[0]) ? memberResult[0][0] : memberResult.rows?.[0] || memberResult[0]

    if (!member || member.community_id !== id) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 })
    }

    // Can't change owner role
    if (member.role === 'owner') {
      return NextResponse.json({ success: false, error: 'Cannot change owner role' }, { status: 403 })
    }

    // Only owner can make admins
    const body = await req.json()
    const { role } = body

    if (role === 'admin' && requester.role !== 'owner') {
      return NextResponse.json({ success: false, error: 'Only owner can assign admin role' }, { status: 403 })
    }

    // Update role
    await db.execute(sql`
      UPDATE community_members 
      SET role = ${role} 
      WHERE id = ${memberId}
    `)

    // Send notification to member
    try {
      const notifId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await db.execute(sql`
        INSERT INTO notifications (
          id, user_id, type, title, message, related_id, related_type, created_at
        ) VALUES (
          ${notifId},
          ${member.user_id},
          'community',
          ${'Role Updated'},
          ${'Your role in the community has been updated to ' + role},
          ${id},
          'community',
          NOW()
        )
      `)
    } catch (e) {
      console.error('Failed to send notification:', e)
    }

    return NextResponse.json({
      success: true,
      message: 'Member role updated'
    })

  } catch (error) {
    console.error('PATCH member error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update member' }, { status: 500 })
  }
}

// DELETE - Remove member
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { id, memberId } = await params

    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const userId = payload.sub

    // Check if requester is owner or admin
    const requesterResult = await db.execute(sql`
      SELECT role FROM community_members 
      WHERE community_id = ${id} AND user_id = ${userId}
    `)
    const requester = Array.isArray(requesterResult[0]) ? requesterResult[0][0] : requesterResult.rows?.[0] || requesterResult[0]

    if (!requester || !['owner', 'admin'].includes(requester.role)) {
      return NextResponse.json({ success: false, error: 'Permission denied' }, { status: 403 })
    }

    // Get target member
    const memberResult = await db.execute(sql`
      SELECT * FROM community_members WHERE id = ${memberId}
    `)
    const member = Array.isArray(memberResult[0]) ? memberResult[0][0] : memberResult.rows?.[0] || memberResult[0]

    if (!member || member.community_id !== id) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 })
    }

    // Can't remove owner
    if (member.role === 'owner') {
      return NextResponse.json({ success: false, error: 'Cannot remove owner' }, { status: 403 })
    }

    // Delete member
    await db.execute(sql`
      DELETE FROM community_members WHERE id = ${memberId}
    `)

    // Send notification to member
    try {
      const communityResult = await db.execute(sql`
        SELECT name FROM communities WHERE id = ${id}
      `)
      const community = Array.isArray(communityResult[0]) ? communityResult[0][0] : communityResult.rows?.[0] || communityResult[0]

      const notifId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await db.execute(sql`
        INSERT INTO notifications (
          id, user_id, type, title, message, created_at
        ) VALUES (
          ${notifId},
          ${member.user_id},
          'community',
          ${'Removed from Community'},
          ${'You have been removed from ' + (community?.name || 'a community')},
          NOW()
        )
      `)
    } catch (e) {
      console.error('Failed to send notification:', e)
    }

    return NextResponse.json({
      success: true,
      message: 'Member removed'
    })

  } catch (error) {
    console.error('DELETE member error:', error)
    return NextResponse.json({ success: false, error: 'Failed to remove member' }, { status: 500 })
  }
}
