import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq, and, or, gte, lte } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'
import { notifyMeetingCreated, notifyAttendeeAdded } from '@/lib/meeting-notifications'
import { toMySQLDatetime, toMySQLDatetimeOrNull } from '@/lib/date-utils'

/**
 * GET /api/meetings
 * Get all meetings for the authenticated user
 * Query params:
 *   - status: filter by status (scheduled, in-progress, completed, cancelled)
 *   - projectId: filter by project
 *   - startDate: filter meetings starting after this date
 *   - endDate: filter meetings ending before this date
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const userId = payload.sub
    const isAdmin = payload.role === 'admin'

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const projectId = searchParams.get('projectId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Get all meetings where user is an attendee or organizer
    const attendeeRecords = await db
      .select()
      .from(dbSchema.meetingAttendees)
      .where(eq(dbSchema.meetingAttendees.userId, userId))

    const meetingIds = attendeeRecords.map(a => a.meetingId)

    // Get meetings
    let meetingsQuery = db.select().from(dbSchema.meetings)

    // For non-admin users, only show meetings they're part of
    if (!isAdmin && meetingIds.length === 0) {
      return NextResponse.json({ success: true, data: [] })
    }

    const allMeetings = await meetingsQuery

    // Filter meetings
    let meetings = allMeetings.filter(m => 
      isAdmin || meetingIds.includes(m.id)
    )

    // Apply filters
    if (status) {
      meetings = meetings.filter(m => m.status === status)
    }
    if (projectId) {
      meetings = meetings.filter(m => m.projectId === projectId)
    }
    if (startDate) {
      meetings = meetings.filter(m => new Date(m.startTime) >= new Date(startDate))
    }
    if (endDate) {
      meetings = meetings.filter(m => new Date(m.endTime) <= new Date(endDate))
    }

    // Get attendees for each meeting
    const meetingsWithAttendees = await Promise.all(
      meetings.map(async (meeting) => {
        const attendees = await db
          .select()
          .from(dbSchema.meetingAttendees)
          .where(eq(dbSchema.meetingAttendees.meetingId, meeting.id))

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

        return {
          ...meeting,
          organizer: organizer[0] ? {
            id: organizer[0].id,
            name: organizer[0].name,
            email: organizer[0].email,
            avatar: organizer[0].avatar,
          } : null,
          attendees: attendeeDetails,
        }
      })
    )

    // Sort by start time (upcoming first)
    meetingsWithAttendees.sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )

    return NextResponse.json({ success: true, data: meetingsWithAttendees })
  } catch (error: any) {
    console.error('GET /api/meetings error', error)
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Failed to fetch meetings' 
    }, { status: 500 })
  }
}

/**
 * POST /api/meetings
 * Create a new meeting
 * Body:
 *   - title: string (required)
 *   - description: string (required)
 *   - meetingLink: string (required)
 *   - meetingType: string (optional, default: 'zoom')
 *   - startTime: string (required, ISO timestamp)
 *   - endTime: string (required, ISO timestamp)
 *   - timezone: string (optional, default: 'UTC')
 *   - projectId: string (optional)
 *   - agenda: string (optional)
 *   - reminderMinutes: number (optional, default: 15)
 *   - attendeeIds: string[] (required, user IDs to invite)
 *   - isRecurring: boolean (optional)
 *   - recurrencePattern: string (optional)
 *   - recurrenceEndDate: string (optional)
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    
    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const userId = payload.sub
    const body = await req.json()

    // Validate required fields
    if (!body.title || !body.description || !body.meetingLink || !body.startTime || !body.endTime) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: title, description, meetingLink, startTime, endTime' 
      }, { status: 400 })
    }

    if (!body.attendeeIds || !Array.isArray(body.attendeeIds) || body.attendeeIds.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'At least one attendee is required' 
      }, { status: 400 })
    }

    // Validate date range
    const startTime = new Date(body.startTime)
    const endTime = new Date(body.endTime)
    if (endTime <= startTime) {
      return NextResponse.json({ 
        success: false, 
        error: 'End time must be after start time' 
      }, { status: 400 })
    }

    // Create meeting
    const meetingId = crypto.randomUUID()
    const now = new Date()

    // Convert to MySQL datetime format (YYYY-MM-DD HH:MM:SS)
    const startTimeFormatted = toMySQLDatetime(body.startTime)
    const endTimeFormatted = toMySQLDatetime(body.endTime)
    const recurrenceEndDateFormatted = toMySQLDatetimeOrNull(body.recurrenceEndDate)

    await db.insert(dbSchema.meetings).values({
      id: meetingId,
      title: body.title,
      description: body.description,
      meetingLink: body.meetingLink,
      meetingType: body.meetingType || 'zoom',
      startTime: startTimeFormatted,
      endTime: endTimeFormatted,
      timezone: body.timezone || 'UTC',
      status: 'scheduled',
      createdById: userId,
      createdAt: toMySQLDatetime(now),
      projectId: body.projectId || null,
      reminderMinutes: body.reminderMinutes || 15,
      agenda: body.agenda || null,
      notes: null,
      recordingUrl: null,
      isRecurring: body.isRecurring || false,
      recurrencePattern: body.recurrencePattern || null,
      recurrenceEndDate: recurrenceEndDateFormatted,
    })

    // Add organizer as attendee with 'organizer' role
    await db.insert(dbSchema.meetingAttendees).values({
      id: crypto.randomUUID(),
      meetingId,
      userId,
      role: 'organizer',
      status: 'accepted',
      addedAt: now.toISOString(),
      notificationSent: false,
      reminderSent: false,
    })

    // Add other attendees
    const attendeePromises = body.attendeeIds
      .filter((id: string) => id !== userId) // Don't add organizer twice
      .map(async (attendeeId: string) => {
        await db.insert(dbSchema.meetingAttendees).values({
          id: crypto.randomUUID(),
          meetingId,
          userId: attendeeId,
          role: 'attendee',
          status: 'pending',
          addedAt: now.toISOString(),
          notificationSent: false,
          reminderSent: false,
        })
      })

    await Promise.all(attendeePromises)

    // Get the created meeting with details
    const meeting = await db
      .select()
      .from(dbSchema.meetings)
      .where(eq(dbSchema.meetings.id, meetingId))
      .limit(1)

    if (meeting.length === 0) {
      throw new Error('Failed to create meeting')
    }

    // Send notifications to all attendees (async, don't wait)
    notifyMeetingCreated(
      {
        id: meetingId,
        title: body.title,
        description: body.description,
        meetingLink: body.meetingLink,
        meetingType: body.meetingType || 'zoom',
        startTime: body.startTime,
        endTime: body.endTime,
        timezone: body.timezone || 'UTC',
        createdById: userId,
        projectId: body.projectId,
        agenda: body.agenda,
      },
      body.attendeeIds
    ).catch(err => console.error('Failed to send meeting notifications:', err))

    return NextResponse.json({ 
      success: true, 
      data: meeting[0],
      message: 'Meeting created successfully'
    }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/meetings error', error)
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Failed to create meeting' 
    }, { status: 500 })
  }
}
