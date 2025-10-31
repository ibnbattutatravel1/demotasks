/**
 * Meeting Notification Helper Functions
 * Handles both in-app and email notifications for meetings
 */

import { db, dbSchema } from './db/client'
import { eq, and } from 'drizzle-orm'
import { sendMeetingEmail } from './email/meeting-emails'
import { toMySQLDatetime } from './date-utils'

interface Meeting {
  id: string
  title: string
  description: string
  meetingLink: string
  meetingType: string
  startTime: string
  endTime: string
  timezone: string
  createdById: string
  projectId?: string
  agenda?: string
}

interface MeetingAttendee {
  id: string
  meetingId: string
  userId: string
  role: string
  status: string
}

interface User {
  id: string
  name: string
  email: string
}

/**
 * Create in-app notification for a user
 */
async function createInAppNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  relatedId?: string,
  relatedType?: string
) {
  try {
    await db.insert(dbSchema.notifications).values({
      id: crypto.randomUUID(),
      userId,
      type,
      title,
      message,
      read: false,
      relatedId,
      relatedType,
      createdAt: toMySQLDatetime(new Date()),
    })
  } catch (error) {
    console.error('Failed to create in-app notification:', error)
  }
}

/**
 * Check if user wants to receive email notifications
 */
async function shouldSendEmail(userId: string): Promise<boolean> {
  try {
    const settings = await db
      .select()
      .from(dbSchema.userSettings)
      .where(eq(dbSchema.userSettings.userId, userId))
      .limit(1)

    if (settings.length === 0) return true // default to true
    return settings[0].emailNotifications && settings[0].meetingUpdates
  } catch (error) {
    console.error('Failed to check email settings:', error)
    return true // default to true on error
  }
}

/**
 * Get meeting organizer
 */
async function getMeetingOrganizer(meetingId: string): Promise<User | null> {
  try {
    const meeting = await db
      .select()
      .from(dbSchema.meetings)
      .where(eq(dbSchema.meetings.id, meetingId))
      .limit(1)

    if (meeting.length === 0) return null

    const organizer = await db
      .select()
      .from(dbSchema.users)
      .where(eq(dbSchema.users.id, meeting[0].createdById))
      .limit(1)

    return organizer.length > 0 ? organizer[0] : null
  } catch (error) {
    console.error('Failed to get meeting organizer:', error)
    return null
  }
}

/**
 * Notify attendees when a new meeting is created
 */
export async function notifyMeetingCreated(
  meeting: Meeting,
  attendeeIds: string[]
) {
  try {
    // Get organizer info
    const organizer = await db
      .select()
      .from(dbSchema.users)
      .where(eq(dbSchema.users.id, meeting.createdById))
      .limit(1)

    if (organizer.length === 0) return

    const organizerName = organizer[0].name

    // Get all attendees
    const attendees = await db
      .select()
      .from(dbSchema.users)
      .where(eq(dbSchema.users.id, attendeeIds[0])) // This is simplified, in production use `in` operator

    // For each attendee, send notification
    for (const attendeeId of attendeeIds) {
      const attendee = await db
        .select()
        .from(dbSchema.users)
        .where(eq(dbSchema.users.id, attendeeId))
        .limit(1)

      if (attendee.length === 0) continue

      const user = attendee[0]

      // Create in-app notification
      await createInAppNotification(
        user.id,
        'meeting_created',
        '📅 New Meeting Scheduled',
        `${organizerName} invited you to "${meeting.title}"`,
        meeting.id,
        'meeting'
      )

      // Send email if user prefers
      if (await shouldSendEmail(user.id)) {
        await sendMeetingEmail('meeting_created', {
          to: user.email,
          toName: user.name,
          meetingTitle: meeting.title,
          meetingDescription: meeting.description,
          meetingLink: meeting.meetingLink,
          startTime: meeting.startTime,
          endTime: meeting.endTime,
          timezone: meeting.timezone,
          organizerName,
          attendeeCount: attendeeIds.length,
          agenda: meeting.agenda,
          meetingType: meeting.meetingType,
          detailsLink: `${process.env.NEXT_PUBLIC_APP_URL}/meetings/${meeting.id}`,
        })
      }
    }
  } catch (error) {
    console.error('Failed to notify meeting created:', error)
  }
}

/**
 * Notify attendees when a meeting is updated
 */
export async function notifyMeetingUpdated(
  meeting: Meeting,
  attendeeIds: string[]
) {
  try {
    const organizer = await db
      .select()
      .from(dbSchema.users)
      .where(eq(dbSchema.users.id, meeting.createdById))
      .limit(1)

    if (organizer.length === 0) return

    const organizerName = organizer[0].name

    for (const attendeeId of attendeeIds) {
      // Skip the organizer (don't notify themselves)
      if (attendeeId === meeting.createdById) continue

      const attendee = await db
        .select()
        .from(dbSchema.users)
        .where(eq(dbSchema.users.id, attendeeId))
        .limit(1)

      if (attendee.length === 0) continue

      const user = attendee[0]

      // Create in-app notification
      await createInAppNotification(
        user.id,
        'meeting_updated',
        '📝 Meeting Updated',
        `${organizerName} updated "${meeting.title}"`,
        meeting.id,
        'meeting'
      )

      // Send email
      if (await shouldSendEmail(user.id)) {
        await sendMeetingEmail('meeting_updated', {
          to: user.email,
          toName: user.name,
          meetingTitle: meeting.title,
          meetingDescription: meeting.description,
          meetingLink: meeting.meetingLink,
          startTime: meeting.startTime,
          endTime: meeting.endTime,
          timezone: meeting.timezone,
          organizerName,
          meetingType: meeting.meetingType,
          detailsLink: `${process.env.NEXT_PUBLIC_APP_URL}/meetings/${meeting.id}`,
        })
      }
    }
  } catch (error) {
    console.error('Failed to notify meeting updated:', error)
  }
}

/**
 * Notify attendees when a meeting is cancelled
 */
export async function notifyMeetingCancelled(
  meeting: Meeting,
  attendeeIds: string[]
) {
  try {
    const organizer = await db
      .select()
      .from(dbSchema.users)
      .where(eq(dbSchema.users.id, meeting.createdById))
      .limit(1)

    if (organizer.length === 0) return

    const organizerName = organizer[0].name

    for (const attendeeId of attendeeIds) {
      const attendee = await db
        .select()
        .from(dbSchema.users)
        .where(eq(dbSchema.users.id, attendeeId))
        .limit(1)

      if (attendee.length === 0) continue

      const user = attendee[0]

      // Create in-app notification
      await createInAppNotification(
        user.id,
        'meeting_cancelled',
        '❌ Meeting Cancelled',
        `${organizerName} cancelled "${meeting.title}"`,
        meeting.id,
        'meeting'
      )

      // Send email
      if (await shouldSendEmail(user.id)) {
        await sendMeetingEmail('meeting_cancelled', {
          to: user.email,
          toName: user.name,
          meetingTitle: meeting.title,
          meetingLink: meeting.meetingLink,
          startTime: meeting.startTime,
          endTime: meeting.endTime,
          timezone: meeting.timezone,
          organizerName,
        })
      }
    }
  } catch (error) {
    console.error('Failed to notify meeting cancelled:', error)
  }
}

/**
 * Notify a user when they're added to a meeting
 */
export async function notifyAttendeeAdded(
  meeting: Meeting,
  userId: string
) {
  try {
    const [organizer, user] = await Promise.all([
      db.select().from(dbSchema.users).where(eq(dbSchema.users.id, meeting.createdById)).limit(1),
      db.select().from(dbSchema.users).where(eq(dbSchema.users.id, userId)).limit(1),
    ])

    if (organizer.length === 0 || user.length === 0) return

    const organizerName = organizer[0].name
    const attendeeUser = user[0]

    // Create in-app notification
    await createInAppNotification(
      attendeeUser.id,
      'meeting_attendee_added',
      '✅ Added to Meeting',
      `${organizerName} added you to "${meeting.title}"`,
      meeting.id,
      'meeting'
    )

    // Send email
    if (await shouldSendEmail(attendeeUser.id)) {
      await sendMeetingEmail('attendee_added', {
        to: attendeeUser.email,
        toName: attendeeUser.name,
        meetingTitle: meeting.title,
        meetingDescription: meeting.description,
        meetingLink: meeting.meetingLink,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        timezone: meeting.timezone,
        organizerName,
        detailsLink: `${process.env.NEXT_PUBLIC_APP_URL}/meetings/${meeting.id}`,
      })
    }
  } catch (error) {
    console.error('Failed to notify attendee added:', error)
  }
}

/**
 * Notify a user when they're removed from a meeting
 */
export async function notifyAttendeeRemoved(
  meeting: Meeting,
  userId: string
) {
  try {
    const [organizer, user] = await Promise.all([
      db.select().from(dbSchema.users).where(eq(dbSchema.users.id, meeting.createdById)).limit(1),
      db.select().from(dbSchema.users).where(eq(dbSchema.users.id, userId)).limit(1),
    ])

    if (organizer.length === 0 || user.length === 0) return

    const organizerName = organizer[0].name
    const attendeeUser = user[0]

    // Create in-app notification
    await createInAppNotification(
      attendeeUser.id,
      'meeting_attendee_removed',
      '🚫 Removed from Meeting',
      `${organizerName} removed you from "${meeting.title}"`,
      meeting.id,
      'meeting'
    )
  } catch (error) {
    console.error('Failed to notify attendee removed:', error)
  }
}

/**
 * Send meeting reminders (typically called by cron job)
 */
export async function sendMeetingReminders(reminderMinutes: number = 15) {
  try {
    // Get all meetings starting in the next reminderMinutes
    const now = new Date()
    const futureTime = new Date(now.getTime() + reminderMinutes * 60000)

    const upcomingMeetings = await db
      .select()
      .from(dbSchema.meetings)
      .where(eq(dbSchema.meetings.status, 'scheduled'))

    for (const meeting of upcomingMeetings) {
      const meetingStart = new Date(meeting.startTime)
      
      // Check if meeting is within reminder window
      if (meetingStart > now && meetingStart <= futureTime) {
        // Get attendees who haven't received reminder yet
        const attendees = await db
          .select()
          .from(dbSchema.meetingAttendees)
          .where(
            and(
              eq(dbSchema.meetingAttendees.meetingId, meeting.id),
              eq(dbSchema.meetingAttendees.reminderSent, false)
            )
          )

        const organizer = await db
          .select()
          .from(dbSchema.users)
          .where(eq(dbSchema.users.id, meeting.createdById))
          .limit(1)

        if (organizer.length === 0) continue

        const organizerName = organizer[0].name

        for (const attendee of attendees) {
          const user = await db
            .select()
            .from(dbSchema.users)
            .where(eq(dbSchema.users.id, attendee.userId))
            .limit(1)

          if (user.length === 0) continue

          const userData = user[0]

          // Create in-app notification
          await createInAppNotification(
            userData.id,
            'meeting_reminder',
            '⏰ Meeting Starting Soon',
            `"${meeting.title}" starts in ${reminderMinutes} minutes`,
            meeting.id,
            'meeting'
          )

          // Send email reminder
          if (await shouldSendEmail(userData.id)) {
            await sendMeetingEmail('meeting_reminder', {
              to: userData.email,
              toName: userData.name,
              meetingTitle: meeting.title,
              meetingLink: meeting.meetingLink,
              startTime: meeting.startTime,
              endTime: meeting.endTime,
              timezone: meeting.timezone,
              organizerName,
            })
          }

          // Mark reminder as sent
          await db
            .update(dbSchema.meetingAttendees)
            .set({ reminderSent: true })
            .where(eq(dbSchema.meetingAttendees.id, attendee.id))
        }
      }
    }
  } catch (error) {
    console.error('Failed to send meeting reminders:', error)
  }
}

/**
 * Notify when meeting is starting (at meeting time)
 */
export async function notifyMeetingStarting(meetingId: string) {
  try {
    const meeting = await db
      .select()
      .from(dbSchema.meetings)
      .where(eq(dbSchema.meetings.id, meetingId))
      .limit(1)

    if (meeting.length === 0) return

    const meetingData = meeting[0]

    const attendees = await db
      .select()
      .from(dbSchema.meetingAttendees)
      .where(eq(dbSchema.meetingAttendees.meetingId, meetingId))

    const organizer = await db
      .select()
      .from(dbSchema.users)
      .where(eq(dbSchema.users.id, meetingData.createdById))
      .limit(1)

    if (organizer.length === 0) return

    const organizerName = organizer[0].name

    for (const attendee of attendees) {
      const user = await db
        .select()
        .from(dbSchema.users)
        .where(eq(dbSchema.users.id, attendee.userId))
        .limit(1)

      if (user.length === 0) continue

      const userData = user[0]

      // Create in-app notification
      await createInAppNotification(
        userData.id,
        'meeting_starting',
        '🚀 Meeting is Live!',
        `"${meetingData.title}" is starting now. Join immediately!`,
        meetingData.id,
        'meeting'
      )

      // Send email
      if (await shouldSendEmail(userData.id)) {
        await sendMeetingEmail('meeting_starting', {
          to: userData.email,
          toName: userData.name,
          meetingTitle: meetingData.title,
          meetingLink: meetingData.meetingLink,
          startTime: meetingData.startTime,
          endTime: meetingData.endTime,
          timezone: meetingData.timezone,
          organizerName,
        })
      }
    }
  } catch (error) {
    console.error('Failed to notify meeting starting:', error)
  }
}
