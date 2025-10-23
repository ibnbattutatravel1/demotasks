import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq, and } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'

/**
 * POST /api/meetings/[id]/respond
 * Respond to a meeting invitation
 * Body:
 *   - status: 'accepted' | 'declined' | 'tentative'
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const userId = payload.sub
    const resolvedParams = await params
    const meetingId = resolvedParams.id
    const body = await req.json()

    if (!body.status || !['accepted', 'declined', 'tentative'].includes(body.status)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid status. Must be: accepted, declined, or tentative' 
      }, { status: 400 })
    }

    // Check if user is an attendee
    const attendees = await db
      .select()
      .from(dbSchema.meetingAttendees)
      .where(
        and(
          eq(dbSchema.meetingAttendees.meetingId, meetingId),
          eq(dbSchema.meetingAttendees.userId, userId)
        )
      )
      .limit(1)

    if (attendees.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'You are not an attendee of this meeting' 
      }, { status: 404 })
    }

    // Update attendee status
    await db
      .update(dbSchema.meetingAttendees)
      .set({ 
        status: body.status,
        responseAt: new Date().toISOString()
      })
      .where(eq(dbSchema.meetingAttendees.id, attendees[0].id))

    // Create in-app notification for organizer
    const meeting = await db
      .select()
      .from(dbSchema.meetings)
      .where(eq(dbSchema.meetings.id, meetingId))
      .limit(1)

    if (meeting.length > 0) {
      const user = await db
        .select()
        .from(dbSchema.users)
        .where(eq(dbSchema.users.id, userId))
        .limit(1)

      if (user.length > 0) {
        const statusEmoji = body.status === 'accepted' ? '✅' : body.status === 'declined' ? '❌' : '❓'
        await db.insert(dbSchema.notifications).values({
          id: crypto.randomUUID(),
          userId: meeting[0].createdById,
          type: 'meeting_response',
          title: `${statusEmoji} Meeting Response`,
          message: `${user[0].name} ${body.status} "${meeting[0].title}"`,
          read: false,
          relatedId: meetingId,
          relatedType: 'meeting',
          createdAt: new Date().toISOString(),
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Meeting invitation ${body.status}`,
      data: { status: body.status }
    })
  } catch (error: any) {
    console.error('POST /api/meetings/[id]/respond error', error)
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Failed to respond to meeting' 
    }, { status: 500 })
  }
}
