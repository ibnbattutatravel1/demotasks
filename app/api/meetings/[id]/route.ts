import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq, and } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'
import { notifyMeetingUpdated, notifyMeetingCancelled } from '@/lib/meeting-notifications'

/**
 * GET /api/meetings/[id]
 * Get a specific meeting by ID
 */
export async function GET(
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

    // Check if user has access (is attendee or organizer or admin)
    if (!isAdmin && meeting.createdById !== userId) {
      const attendee = await db
        .select()
        .from(dbSchema.meetingAttendees)
        .where(
          and(
            eq(dbSchema.meetingAttendees.meetingId, meetingId),
            eq(dbSchema.meetingAttendees.userId, userId)
          )
        )
        .limit(1)

      if (attendee.length === 0) {
        return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
      }
    }

    // Get attendees
    const attendees = await db
      .select()
      .from(dbSchema.meetingAttendees)
      .where(eq(dbSchema.meetingAttendees.meetingId, meetingId))

    const attendeeDetails = await Promise.all(
      attendees.map(async (att) => {
        const user = await db
          .select()
          .from(dbSchema.users)
          .where(eq(dbSchema.users.id, att.userId))
          .limit(1)

        return {
          id: att.id,
          userId: att.userId,
          name: user[0]?.name || 'Unknown',
          email: user[0]?.email || '',
          avatar: user[0]?.avatar,
          role: att.role,
          status: att.status,
          responseAt: att.responseAt,
        }
      })
    )

    // Get organizer info
    const organizer = await db
      .select()
      .from(dbSchema.users)
      .where(eq(dbSchema.users.id, meeting.createdById))
      .limit(1)

    // Get project info if associated
    let project = null
    if (meeting.projectId) {
      const projects = await db
        .select()
        .from(dbSchema.projects)
        .where(eq(dbSchema.projects.id, meeting.projectId))
        .limit(1)
      
      if (projects.length > 0) {
        project = {
          id: projects[0].id,
          name: projects[0].name,
          color: projects[0].color,
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...meeting,
        organizer: organizer[0] ? {
          id: organizer[0].id,
          name: organizer[0].name,
          email: organizer[0].email,
          avatar: organizer[0].avatar,
        } : null,
        attendees: attendeeDetails,
        project,
      }
    })
  } catch (error: any) {
    console.error('GET /api/meetings/[id] error', error)
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Failed to fetch meeting' 
    }, { status: 500 })
  }
}

/**
 * PUT /api/meetings/[id]
 * Update a meeting
 */
export async function PUT(
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
      return NextResponse.json({ success: false, error: 'Only the organizer can update this meeting' }, { status: 403 })
    }

    // Validate date range if provided
    const startTime = body.startTime ? new Date(body.startTime) : new Date(meeting.startTime)
    const endTime = body.endTime ? new Date(body.endTime) : new Date(meeting.endTime)
    if (endTime <= startTime) {
      return NextResponse.json({ 
        success: false, 
        error: 'End time must be after start time' 
      }, { status: 400 })
    }

    // Update meeting
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    }

    if (body.title) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.meetingLink) updateData.meetingLink = body.meetingLink
    if (body.meetingType) updateData.meetingType = body.meetingType
    if (body.startTime) updateData.startTime = body.startTime
    if (body.endTime) updateData.endTime = body.endTime
    if (body.timezone) updateData.timezone = body.timezone
    if (body.status) updateData.status = body.status
    if (body.projectId !== undefined) updateData.projectId = body.projectId
    if (body.reminderMinutes !== undefined) updateData.reminderMinutes = body.reminderMinutes
    if (body.agenda !== undefined) updateData.agenda = body.agenda
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.recordingUrl !== undefined) updateData.recordingUrl = body.recordingUrl
    if (body.isRecurring !== undefined) updateData.isRecurring = body.isRecurring
    if (body.recurrencePattern !== undefined) updateData.recurrencePattern = body.recurrencePattern
    if (body.recurrenceEndDate !== undefined) updateData.recurrenceEndDate = body.recurrenceEndDate

    await db
      .update(dbSchema.meetings)
      .set(updateData)
      .where(eq(dbSchema.meetings.id, meetingId))

    // Get updated meeting
    const updatedMeetings = await db
      .select()
      .from(dbSchema.meetings)
      .where(eq(dbSchema.meetings.id, meetingId))
      .limit(1)

    // Get all attendees to notify
    const attendees = await db
      .select()
      .from(dbSchema.meetingAttendees)
      .where(eq(dbSchema.meetingAttendees.meetingId, meetingId))

    const attendeeIds = attendees.map(a => a.userId)

    // Send update notifications (async, don't wait)
    notifyMeetingUpdated(
      {
        id: meetingId,
        title: updatedMeetings[0].title,
        description: updatedMeetings[0].description,
        meetingLink: updatedMeetings[0].meetingLink,
        meetingType: updatedMeetings[0].meetingType,
        startTime: updatedMeetings[0].startTime,
        endTime: updatedMeetings[0].endTime,
        timezone: updatedMeetings[0].timezone,
        createdById: updatedMeetings[0].createdById,
        projectId: updatedMeetings[0].projectId || undefined,
        agenda: updatedMeetings[0].agenda || undefined,
      },
      attendeeIds
    ).catch(err => console.error('Failed to send meeting update notifications:', err))

    return NextResponse.json({
      success: true,
      data: updatedMeetings[0],
      message: 'Meeting updated successfully'
    })
  } catch (error: any) {
    console.error('PUT /api/meetings/[id] error', error)
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Failed to update meeting' 
    }, { status: 500 })
  }
}

/**
 * DELETE /api/meetings/[id]
 * Delete/Cancel a meeting
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
      return NextResponse.json({ success: false, error: 'Only the organizer can delete this meeting' }, { status: 403 })
    }

    // Get all attendees to notify
    const attendees = await db
      .select()
      .from(dbSchema.meetingAttendees)
      .where(eq(dbSchema.meetingAttendees.meetingId, meetingId))

    const attendeeIds = attendees.map(a => a.userId)

    // Instead of deleting, mark as cancelled
    await db
      .update(dbSchema.meetings)
      .set({ 
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      })
      .where(eq(dbSchema.meetings.id, meetingId))

    // Send cancellation notifications (async, don't wait)
    notifyMeetingCancelled(
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
      attendeeIds
    ).catch(err => console.error('Failed to send meeting cancellation notifications:', err))

    return NextResponse.json({
      success: true,
      message: 'Meeting cancelled successfully'
    })
  } catch (error: any) {
    console.error('DELETE /api/meetings/[id] error', error)
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Failed to cancel meeting' 
    }, { status: 500 })
  }
}
