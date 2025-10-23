import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq, and } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'
import { notifyAttendeeAdded, notifyAttendeeRemoved } from '@/lib/meeting-notifications'

/**
 * POST /api/meetings/[id]/attendees
 * Add attendees to a meeting
 * Body:
 *   - userIds: string[] (array of user IDs to add)
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
    const isAdmin = payload.role === 'admin'
    const resolvedParams = await params
    const meetingId = resolvedParams.id
    const body = await req.json()

    if (!body.userIds || !Array.isArray(body.userIds) || body.userIds.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'userIds array is required' 
      }, { status: 400 })
    }

    // Get meeting
    const meetings = await db
      .select()
      .from(dbSchema.meetings)
      .where(eq(dbSchema.meetings.id, meetingId))
      .limit(1)

    if (meetings.length === 0) {
      return NextResponse.json({ success: false, error: 'Meeting not found' }, { status: 404 })
    }

    const meeting = meetings[0]

    // Check if user is organizer or admin
    if (!isAdmin && meeting.createdById !== userId) {
      return NextResponse.json({ success: false, error: 'Only the organizer can add attendees' }, { status: 403 })
    }

    // Get existing attendees
    const existingAttendees = await db
      .select()
      .from(dbSchema.meetingAttendees)
      .where(eq(dbSchema.meetingAttendees.meetingId, meetingId))

    const existingUserIds = existingAttendees.map(a => a.userId)

    // Filter out users who are already attendees
    const newUserIds = body.userIds.filter((id: string) => !existingUserIds.includes(id))

    if (newUserIds.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'All users are already attendees' 
      }, { status: 400 })
    }

    // Verify all users exist
    const users = await db
      .select()
      .from(dbSchema.users)

    const validUserIds = users.map(u => u.id)
    const invalidUsers = newUserIds.filter((id: string) => !validUserIds.includes(id))

    if (invalidUsers.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: `Invalid user IDs: ${invalidUsers.join(', ')}` 
      }, { status: 400 })
    }

    // Add new attendees
    const now = new Date().toISOString()
    const addPromises = newUserIds.map(async (attendeeId: string) => {
      await db.insert(dbSchema.meetingAttendees).values({
        id: crypto.randomUUID(),
        meetingId,
        userId: attendeeId,
        role: 'attendee',
        status: 'pending',
        addedAt: now,
        notificationSent: false,
        reminderSent: false,
      })

      // Send notification to the new attendee (async)
      notifyAttendeeAdded(
        {
          id: meetingId,
          title: meeting.title,
          description: meeting.description,
          meetingLink: meeting.meetingLink,
          meetingType: meeting.meetingType,
          startTime: meeting.startTime,
          endTime: meeting.endTime,
          timezone: meeting.timezone,
          createdById: meeting.createdById,
          projectId: meeting.projectId || undefined,
          agenda: meeting.agenda || undefined,
        },
        attendeeId
      ).catch(err => console.error('Failed to send attendee added notification:', err))
    })

    await Promise.all(addPromises)

    return NextResponse.json({
      success: true,
      message: `Successfully added ${newUserIds.length} attendee(s)`,
      data: { addedCount: newUserIds.length }
    })
  } catch (error: any) {
    console.error('POST /api/meetings/[id]/attendees error', error)
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Failed to add attendees' 
    }, { status: 500 })
  }
}

/**
 * DELETE /api/meetings/[id]/attendees/[userId]
 * Remove an attendee from a meeting
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const userId = payload.sub
    const isAdmin = payload.role === 'admin'
    const resolvedParams = await params
    const meetingId = resolvedParams.id
    
    // Get userId from query params
    const { searchParams } = new URL(req.url)
    const attendeeUserId = searchParams.get('userId')

    if (!attendeeUserId) {
      return NextResponse.json({ 
        success: false, 
        error: 'userId query parameter is required' 
      }, { status: 400 })
    }

    // Get meeting
    const meetings = await db
      .select()
      .from(dbSchema.meetings)
      .where(eq(dbSchema.meetings.id, meetingId))
      .limit(1)

    if (meetings.length === 0) {
      return NextResponse.json({ success: false, error: 'Meeting not found' }, { status: 404 })
    }

    const meeting = meetings[0]

    // Check if user is organizer or admin
    if (!isAdmin && meeting.createdById !== userId) {
      return NextResponse.json({ success: false, error: 'Only the organizer can remove attendees' }, { status: 403 })
    }

    // Cannot remove the organizer
    if (attendeeUserId === meeting.createdById) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot remove the meeting organizer' 
      }, { status: 400 })
    }

    // Check if attendee exists
    const attendees = await db
      .select()
      .from(dbSchema.meetingAttendees)
      .where(
        and(
          eq(dbSchema.meetingAttendees.meetingId, meetingId),
          eq(dbSchema.meetingAttendees.userId, attendeeUserId)
        )
      )
      .limit(1)

    if (attendees.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Attendee not found in this meeting' 
      }, { status: 404 })
    }

    // Remove attendee
    await db
      .delete(dbSchema.meetingAttendees)
      .where(eq(dbSchema.meetingAttendees.id, attendees[0].id))

    // Send notification to the removed attendee (async)
    notifyAttendeeRemoved(
      {
        id: meetingId,
        title: meeting.title,
        description: meeting.description,
        meetingLink: meeting.meetingLink,
        meetingType: meeting.meetingType,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        timezone: meeting.timezone,
        createdById: meeting.createdById,
        projectId: meeting.projectId || undefined,
        agenda: meeting.agenda || undefined,
      },
      attendeeUserId
    ).catch(err => console.error('Failed to send attendee removed notification:', err))

    return NextResponse.json({
      success: true,
      message: 'Attendee removed successfully'
    })
  } catch (error: any) {
    console.error('DELETE /api/meetings/[id]/attendees error', error)
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Failed to remove attendee' 
    }, { status: 500 })
  }
}
