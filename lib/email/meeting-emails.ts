/**
 * Meeting Email Notifications
 * Beautiful HTML templates for all meeting events
 * Now supports Gmail SMTP
 */

import nodemailer from 'nodemailer'

interface MeetingEmailData {
  to: string
  toName: string
  meetingTitle: string
  meetingDescription?: string
  meetingLink: string
  startTime: string // ISO timestamp
  endTime: string // ISO timestamp
  timezone: string
  organizerName: string
  attendeeCount?: number
  agenda?: string
  meetingType?: string
  detailsLink?: string
}

// Create SMTP transporter
function createTransporter() {
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = parseInt(process.env.SMTP_PORT || '587')
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS

  if (!smtpHost || !smtpUser || !smtpPass) {
    return null
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  })
}

export async function sendMeetingEmail(
  type: 
    | 'meeting_created' 
    | 'meeting_updated' 
    | 'meeting_cancelled' 
    | 'meeting_reminder' 
    | 'attendee_added'
    | 'attendee_removed'
    | 'meeting_starting',
  data: MeetingEmailData
) {
  try {
    const transporter = createTransporter()
    
    if (!transporter) {
      console.warn('Email service not configured - missing SMTP credentials')
      return { success: false, reason: 'Email service not configured' }
    }

    const { subject, html } = getMeetingEmailTemplate(type, data)

    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER
    const fromName = 'Taskara Meetings'

    const ics = generateICS({
      title: data.meetingTitle,
      description: data.meetingDescription || '',
      start: data.startTime,
      end: data.endTime,
      organizerName: data.organizerName,
      organizerEmail: fromEmail || '',
      attendeeName: data.toName,
      attendeeEmail: data.to,
      location: data.meetingLink || 'Online'
    })

    const result = await transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to: data.to,
      subject,
      html,
      alternatives: [
        {
          content: ics,
          contentType: 'text/calendar; charset=UTF-8; method=REQUEST'
        }
      ],
      attachments: [
        {
          filename: 'invite.ics',
          content: ics,
          contentType: 'text/calendar'
        }
      ]
    })

    console.log('✅ Email sent successfully:', { to: data.to, subject, messageId: result.messageId })
    return { success: true, data: result }

  } catch (error: any) {
    console.error('❌ Failed to send meeting email:', error)
    return { success: false, error: error.message }
  }
}

function toICSDate(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  const y = d.getUTCFullYear()
  const m = pad(d.getUTCMonth() + 1)
  const day = pad(d.getUTCDate())
  const h = pad(d.getUTCHours())
  const min = pad(d.getUTCMinutes())
  const s = pad(d.getUTCSeconds())
  return `${y}${m}${day}T${h}${min}${s}Z`
}

function escapeICS(text: string): string {
  return (text || '')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

function generateICS(opts: {
  title: string
  description: string
  start: string
  end: string
  organizerName?: string
  organizerEmail: string
  attendeeName?: string
  attendeeEmail?: string
  location?: string
}): string {
  const uid = `taskara-${Date.now()}-${Math.random().toString(36).slice(2)}`
  const dtstamp = toICSDate(new Date().toISOString())
  const dtstart = toICSDate(opts.start)
  const dtend = toICSDate(opts.end)
  const organizerCN = escapeICS(opts.organizerName || 'Organizer')
  const attendeeCN = escapeICS(opts.attendeeName || 'Attendee')
  const summary = escapeICS(opts.title)
  const description = escapeICS(opts.description)
  const location = escapeICS(opts.location || '')

  const lines = [
    'BEGIN:VCALENDAR',
    'PRODID:-//Taskara//Meetings//EN',
    'VERSION:2.0',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `ORGANIZER;CN=${organizerCN}:MAILTO:${opts.organizerEmail}`,
    opts.attendeeEmail ? `ATTENDEE;CN=${attendeeCN};ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:MAILTO:${opts.attendeeEmail}` : '',
    location ? `LOCATION:${location}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean)

  return lines.join('\r\n')
}

function formatDateTime(isoString: string, timezone: string = 'UTC'): string {
  const date = new Date(isoString)
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
    timeZoneName: 'short'
  }
  return date.toLocaleString('en-US', options)
}

function getMeetingTypeIcon(meetingType?: string): string {
  switch (meetingType) {
    case 'zoom': return '🔵 Zoom'
    case 'google-meet': return '🎥 Google Meet'
    case 'teams': return '💼 Microsoft Teams'
    default: return '📹 Video Call'
  }
}

function getMeetingEmailTemplate(type: string, data: MeetingEmailData) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const startTimeFormatted = formatDateTime(data.startTime, data.timezone)
  const endTimeFormatted = formatDateTime(data.endTime, data.timezone)
  const meetingTypeIcon = getMeetingTypeIcon(data.meetingType)
  
  switch (type) {
    case 'meeting_created':
      return {
        subject: `New Meeting: ${data.meetingTitle}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
                .header h1 { margin: 0; font-size: 28px; }
                .content { padding: 40px 30px; }
                .meeting-card { background: #f8fafc; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 8px; }
                .meeting-info { margin: 15px 0; }
                .meeting-info strong { color: #1e293b; display: block; margin-bottom: 5px; }
                .button { display: inline-block; padding: 14px 28px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
                .button:hover { background: #5568d3; }
                .footer { text-align: center; padding: 30px; color: #64748b; font-size: 12px; background: #f8fafc; }
                .attendee-count { background: #e0e7ff; color: #4338ca; padding: 4px 12px; border-radius: 12px; font-size: 14px; display: inline-block; }
                .agenda { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border: 1px solid #e2e8f0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>📅 New Meeting Scheduled</h1>
                </div>
                <div class="content">
                  <p>Hi ${data.toName},</p>
                  <p><strong>${data.organizerName}</strong> has invited you to a meeting!</p>
                  
                  <div class="meeting-card">
                    <h2 style="margin: 0 0 15px 0; color: #1e293b; font-size: 22px;">${data.meetingTitle}</h2>
                    ${data.meetingDescription ? `<p style="color: #475569; margin: 10px 0;">${data.meetingDescription}</p>` : ''}
                    
                    <div class="meeting-info">
                      <strong>🕒 Start Time</strong>
                      <span style="color: #475569;">${startTimeFormatted}</span>
                    </div>
                    
                    <div class="meeting-info">
                      <strong>⏰ End Time</strong>
                      <span style="color: #475569;">${endTimeFormatted}</span>
                    </div>
                    
                    <div class="meeting-info">
                      <strong>🌍 Timezone</strong>
                      <span style="color: #475569;">${data.timezone}</span>
                    </div>
                    
                    <div class="meeting-info">
                      <strong>${meetingTypeIcon}</strong>
                      ${data.attendeeCount ? `<span class="attendee-count">${data.attendeeCount} attendees</span>` : ''}
                    </div>
                    
                    ${data.agenda ? `
                      <div class="meeting-info">
                        <strong>📋 Agenda</strong>
                        <div class="agenda">${data.agenda}</div>
                      </div>
                    ` : ''}
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${data.meetingLink}" class="button" style="margin-right: 10px;">🎥 Join Meeting</a>
                    ${data.detailsLink ? `<a href="${data.detailsLink}" class="button" style="background: #64748b;">📄 View Details</a>` : ''}
                  </div>
                  
                  <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
                    💡 Tip: Add this meeting to your calendar so you don't miss it!
                  </p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Taskara Meetings. All rights reserved.</p>
                  <p>You're receiving this because you're invited to a meeting.</p>
                </div>
              </div>
            </body>
          </html>
        `
      }

    case 'meeting_updated':
      return {
        subject: `Meeting Updated: ${data.meetingTitle}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; }
                .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 30px; text-align: center; }
                .header h1 { margin: 0; font-size: 28px; }
                .content { padding: 40px 30px; }
                .meeting-card { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 8px; }
                .meeting-info { margin: 15px 0; }
                .meeting-info strong { color: #78350f; display: block; margin-bottom: 5px; }
                .button { display: inline-block; padding: 14px 28px; background: #f59e0b; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
                .footer { text-align: center; padding: 30px; color: #64748b; font-size: 12px; background: #f8fafc; }
                .alert { background: #fef3c7; border: 2px solid #fbbf24; padding: 15px; border-radius: 8px; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>📝 Meeting Updated</h1>
                </div>
                <div class="content">
                  <p>Hi ${data.toName},</p>
                  
                  <div class="alert">
                    ⚠️ <strong>Important:</strong> The meeting details have been updated by ${data.organizerName}.
                  </div>
                  
                  <div class="meeting-card">
                    <h2 style="margin: 0 0 15px 0; color: #78350f; font-size: 22px;">${data.meetingTitle}</h2>
                    ${data.meetingDescription ? `<p style="color: #92400e; margin: 10px 0;">${data.meetingDescription}</p>` : ''}
                    
                    <div class="meeting-info">
                      <strong>🕒 Start Time</strong>
                      <span style="color: #92400e;">${startTimeFormatted}</span>
                    </div>
                    
                    <div class="meeting-info">
                      <strong>⏰ End Time</strong>
                      <span style="color: #92400e;">${endTimeFormatted}</span>
                    </div>
                    
                    <div class="meeting-info">
                      <strong>🌍 Timezone</strong>
                      <span style="color: #92400e;">${data.timezone}</span>
                    </div>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${data.meetingLink}" class="button">🎥 Join Meeting</a>
                  </div>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Taskara Meetings. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `
      }

    case 'meeting_cancelled':
      return {
        subject: `Meeting Cancelled: ${data.meetingTitle}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; }
                .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 40px 30px; text-align: center; }
                .header h1 { margin: 0; font-size: 28px; }
                .content { padding: 40px 30px; }
                .meeting-card { background: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 8px; }
                .footer { text-align: center; padding: 30px; color: #64748b; font-size: 12px; background: #f8fafc; }
                .alert { background: #fee2e2; border: 2px solid #f87171; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>❌ Meeting Cancelled</h1>
                </div>
                <div class="content">
                  <p>Hi ${data.toName},</p>
                  
                  <div class="alert">
                    🚫 <strong>${data.organizerName}</strong> has cancelled the following meeting.
                  </div>
                  
                  <div class="meeting-card">
                    <h2 style="margin: 0 0 15px 0; color: #7f1d1d; font-size: 22px;">${data.meetingTitle}</h2>
                    <p style="color: #991b1b;">Originally scheduled for: <strong>${startTimeFormatted}</strong></p>
                  </div>
                  
                  <p style="color: #64748b; margin-top: 30px;">
                    This meeting has been removed from your calendar. You don't need to take any action.
                  </p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Taskara Meetings. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `
      }

    case 'meeting_reminder':
      return {
        subject: `⏰ Reminder: ${data.meetingTitle} starts soon!`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; }
                .header { background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; padding: 40px 30px; text-align: center; }
                .header h1 { margin: 0; font-size: 28px; }
                .content { padding: 40px 30px; }
                .meeting-card { background: #cffafe; border-left: 4px solid #06b6d4; padding: 20px; margin: 20px 0; border-radius: 8px; }
                .button { display: inline-block; padding: 14px 28px; background: #06b6d4; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
                .footer { text-align: center; padding: 30px; color: #64748b; font-size: 12px; background: #f8fafc; }
                .timer { font-size: 48px; text-align: center; margin: 20px 0; color: #0891b2; font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>⏰ Meeting Starting Soon!</h1>
                </div>
                <div class="content">
                  <p>Hi ${data.toName},</p>
                  <p>This is a friendly reminder that your meeting is starting soon!</p>
                  
                  <div class="meeting-card">
                    <h2 style="margin: 0 0 15px 0; color: #164e63; font-size: 22px;">${data.meetingTitle}</h2>
                    <p style="color: #155e75; font-size: 18px; margin: 15px 0;">
                      <strong>📅 ${startTimeFormatted}</strong>
                    </p>
                    <p style="color: #155e75;">Organizer: ${data.organizerName}</p>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${data.meetingLink}" class="button">🎥 Join Now</a>
                  </div>
                  
                  <p style="color: #64748b; text-align: center; margin-top: 20px;">
                    🎯 Don't be late! Join a few minutes early to test your connection.
                  </p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Taskara Meetings. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `
      }

    case 'attendee_added':
      return {
        subject: `You've been added to: ${data.meetingTitle}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; }
                .header h1 { margin: 0; font-size: 28px; }
                .content { padding: 40px 30px; }
                .meeting-card { background: #d1fae5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 8px; }
                .meeting-info { margin: 15px 0; }
                .meeting-info strong { color: #065f46; display: block; margin-bottom: 5px; }
                .button { display: inline-block; padding: 14px 28px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
                .footer { text-align: center; padding: 30px; color: #64748b; font-size: 12px; background: #f8fafc; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>✅ Added to Meeting</h1>
                </div>
                <div class="content">
                  <p>Hi ${data.toName},</p>
                  <p>You've been added to an upcoming meeting by <strong>${data.organizerName}</strong>.</p>
                  
                  <div class="meeting-card">
                    <h2 style="margin: 0 0 15px 0; color: #065f46; font-size: 22px;">${data.meetingTitle}</h2>
                    ${data.meetingDescription ? `<p style="color: #047857; margin: 10px 0;">${data.meetingDescription}</p>` : ''}
                    
                    <div class="meeting-info">
                      <strong>🕒 Start Time</strong>
                      <span style="color: #047857;">${startTimeFormatted}</span>
                    </div>
                    
                    <div class="meeting-info">
                      <strong>⏰ End Time</strong>
                      <span style="color: #047857;">${endTimeFormatted}</span>
                    </div>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${data.meetingLink}" class="button">🎥 View Meeting</a>
                  </div>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Taskara Meetings. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `
      }

    case 'meeting_starting':
      return {
        subject: `🚀 ${data.meetingTitle} is starting NOW!`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; }
                .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 40px 30px; text-align: center; }
                .header h1 { margin: 0; font-size: 28px; }
                .content { padding: 40px 30px; text-align: center; }
                .meeting-title { font-size: 32px; color: #5b21b6; margin: 30px 0; font-weight: bold; }
                .button-big { display: inline-block; padding: 20px 40px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 12px; margin: 20px 0; font-weight: bold; font-size: 18px; }
                .button-big:hover { background: #7c3aed; }
                .footer { text-align: center; padding: 30px; color: #64748b; font-size: 12px; background: #f8fafc; }
                .pulse { animation: pulse 2s infinite; }
                @keyframes pulse {
                  0% { opacity: 1; }
                  50% { opacity: 0.7; }
                  100% { opacity: 1; }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header pulse">
                  <h1>🚀 Meeting is Live!</h1>
                </div>
                <div class="content">
                  <p style="font-size: 20px;">Hi ${data.toName},</p>
                  
                  <div class="meeting-title">${data.meetingTitle}</div>
                  
                  <p style="font-size: 18px; color: #64748b; margin: 20px 0;">
                    Your meeting is starting right now!<br>
                    Click below to join immediately.
                  </p>
                  
                  <a href="${data.meetingLink}" class="button-big">🎥 JOIN NOW</a>
                  
                  <p style="color: #64748b; margin-top: 40px; font-size: 14px;">
                    Organizer: ${data.organizerName}
                  </p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Taskara Meetings. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `
      }

    default:
      return {
        subject: 'Meeting Notification',
        html: '<p>Meeting notification</p>'
      }
}

function formatICSDate(isoString: string): string {
  const d = new Date(isoString)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
}

function generateICS(opts: {
  title: string
  description: string
  start: string
  end: string
  organizerName: string
  organizerEmail: string
  attendeeName: string
  attendeeEmail: string
  location: string
}): string {
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const dtstamp = formatICSDate(new Date().toISOString())
  const dtstart = formatICSDate(opts.start)
  const dtend = formatICSDate(opts.end)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Taskara//Meeting//EN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${opts.title}`,
    `DESCRIPTION:${opts.description}`,
    `LOCATION:${opts.location}`,
    `ORGANIZER;CN=${opts.organizerName}:MAILTO:${opts.organizerEmail}`,
    `ATTENDEE;CN=${opts.attendeeName};ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION:MAILTO:${opts.attendeeEmail}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ]
  return lines.join('\r\n')
}
}
