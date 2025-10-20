import { db, dbSchema } from '@/lib/db/client'
import { randomUUID } from 'node:crypto'
import { and, eq } from 'drizzle-orm'
import { createRequire } from 'module'
import * as emailTemplates from '@/lib/email/templates'
const require = createRequire(import.meta.url)

// Optional deps: nodemailer and web-push
let nodemailer: any = null
let webPush: any = null
try { nodemailer = require('nodemailer') } catch (_) {}
try { webPush = require('web-push') } catch (_) {}

export type NotificationTopic = 'taskReminders' | 'projectUpdates' | 'generic'

// Extended notification metadata for email templates
export interface NotificationMetadata {
  taskTitle?: string
  projectName?: string
  dueDate?: string
  reason?: string
  commenterName?: string
  comment?: string
  [key: string]: any
}

export async function getUserSettings(userId: string) {
  const rows = await db.select().from(dbSchema.userSettings).where(eq(dbSchema.userSettings.userId, userId))
  const s = rows[0] || null
  return {
    email: s ? !!s.emailNotifications : true,
    push: s ? !!s.pushNotifications : false,
    taskReminders: s ? !!s.taskReminders : true,
    projectUpdates: s ? !!s.projectUpdates : true,
  }
}

function topicEnabled(settings: Awaited<ReturnType<typeof getUserSettings>>, topic: NotificationTopic) {
  if (topic === 'projectUpdates') return settings.projectUpdates
  if (topic === 'taskReminders') return settings.taskReminders
  return true
}

async function sendEmail(userId: string, subject: string, htmlContent: string, textFallback: string) {
  if (!nodemailer) {
    console.warn('[EMAIL] nodemailer is not installed')
    return
  }
  
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env as Record<string, string>
  
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_FROM) {
    console.warn('[EMAIL] Missing SMTP configuration:', { 
      hasHost: !!SMTP_HOST, 
      hasPort: !!SMTP_PORT, 
      hasFrom: !!SMTP_FROM,
      hasUser: !!SMTP_USER,
      hasPass: !!SMTP_PASS
    })
    return
  }
  
  const users = await db.select().from(dbSchema.users).where(eq(dbSchema.users.id, userId))
  const user = users[0]
  
  if (!user?.email) {
    console.warn(`[EMAIL] User ${userId} has no email address`)
    return
  }

  try {
    console.log(`[EMAIL] Attempting to send email to ${user.email}`)
    console.log(`[EMAIL] SMTP Config: ${SMTP_HOST}:${SMTP_PORT}, From: ${SMTP_FROM}`)
    
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
      tls: {
        rejectUnauthorized: false  // For development/testing - remove in production if possible
      },
    })
    
    const info = await transporter.sendMail({ 
      from: SMTP_FROM, 
      to: user.email, 
      subject, 
      html: htmlContent,
      text: textFallback
    })
    
    console.log(`[EMAIL] ✅ Email sent successfully to ${user.email}`, info.messageId)
  } catch (error) {
    console.error(`[EMAIL] ❌ Failed to send email to ${user.email}:`, error)
  }
}

async function sendPush(userId: string, payload: any) {
  if (!webPush) return
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_CONTACT_EMAIL } = process.env as Record<string, string>
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return
  webPush.setVapidDetails(`mailto:${VAPID_CONTACT_EMAIL || 'admin@example.com'}`, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

  const subs = await db.select().from(dbSchema.pushSubscriptions).where(eq(dbSchema.pushSubscriptions.userId, userId))
  const promises = subs.map((s: any) =>
    webPush.sendNotification(
      {
        endpoint: s.endpoint,
        keys: { p256dh: s.p256dh, auth: s.auth },
      },
      JSON.stringify(payload)
    ).catch(async (err: any) => {
      // Clean up gone subscriptions
      if (err?.statusCode === 404 || err?.statusCode === 410) {
        await db.delete(dbSchema.pushSubscriptions).where(and(eq(dbSchema.pushSubscriptions.userId, userId), eq(dbSchema.pushSubscriptions.endpoint, s.endpoint)))
      }
    })
  )
  await Promise.all(promises)
}

export async function notifyUser(args: {
  userId: string
  type: string
  title: string
  message: string
  relatedId?: string
  relatedType?: 'task' | 'project' | 'subtask'
  topic?: NotificationTopic
  metadata?: Record<string, any>
}) {
  const id = (globalThis.crypto?.randomUUID?.() ?? randomUUID()) as string
  const { userId, type, title, message, relatedId, relatedType, metadata } = args
  const topic: NotificationTopic = args.topic || 'generic'

  console.log(`[NOTIFICATION] Creating notification for user ${userId}:`, { type, title, topic })

  // Always create in-app notification
  await db.insert(dbSchema.notifications).values({
    id,
    type,
    title,
    message,
    read: 0 as any,
    userId,
    relatedId: relatedId ?? null as unknown as string | null,
    relatedType: relatedType ?? null as unknown as any,
  })
  
  console.log(`[NOTIFICATION] In-app notification created with ID: ${id}`)

  // Fetch settings once
  const settings = await getUserSettings(userId)
  const topicOk = topicEnabled(settings, topic)

  // Email with HTML template
  if (settings.email && topicOk) {
    await sendEmailWithTemplate(userId, type, title, message, relatedId, relatedType, metadata)
  }

  // Push
  if (settings.push && topicOk) {
    await sendPush(userId, { title, body: message, data: { relatedId, relatedType, type } })
  }

  return { id }
}

async function sendEmailWithTemplate(
  userId: string,
  type: string,
  title: string,
  message: string,
  relatedId?: string,
  relatedType?: 'task' | 'project' | 'subtask',
  metadata?: Record<string, any>
) {
  // Get user info
  const users = await db.select().from(dbSchema.users).where(eq(dbSchema.users.id, userId))
  const user = users[0]
  if (!user) return

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  let htmlContent: string
  let subject: string

  // Generate HTML based on notification type
  switch (type) {
    case 'task_assigned':
      subject = `New Task Assigned: ${metadata?.taskTitle || title}`
      htmlContent = emailTemplates.taskAssignedEmail(
        user.name,
        metadata?.taskTitle || title,
        relatedId || '',
        metadata?.projectName
      )
      break

    case 'task_due_tomorrow':
      subject = `Task Due Tomorrow: ${metadata?.taskTitle || title}`
      htmlContent = emailTemplates.taskDueTomorrowEmail(
        user.name,
        metadata?.taskTitle || title,
        relatedId || '',
        metadata?.dueDate || 'tomorrow'
      )
      break

    case 'task_approved':
      subject = `Task Approved: ${metadata?.taskTitle || title}`
      htmlContent = emailTemplates.taskApprovedEmail(
        user.name,
        metadata?.taskTitle || title,
        relatedId || ''
      )
      break

    case 'task_rejected':
      subject = `Task Requires Revision: ${metadata?.taskTitle || title}`
      htmlContent = emailTemplates.taskRejectedEmail(
        user.name,
        metadata?.taskTitle || title,
        relatedId || '',
        metadata?.reason
      )
      break

    case 'project_updated':
      subject = `Project Updated: ${metadata?.projectName || title}`
      htmlContent = emailTemplates.projectUpdatedEmail(
        user.name,
        metadata?.projectName || title,
        relatedId || ''
      )
      break

    case 'comment_added':
      subject = `New Comment on: ${metadata?.taskTitle || title}`
      htmlContent = emailTemplates.commentAddedEmail(
        user.name,
        metadata?.taskTitle || title,
        relatedId || '',
        metadata?.commenterName || 'Someone',
        metadata?.comment || message
      )
      break

    default:
      // Generic notification
      subject = title
      const actionUrl = relatedId && relatedType
        ? `${appUrl}/${relatedType === 'task' ? 'tasks' : relatedType === 'project' ? 'projects' : 'tasks'}/${relatedId}`
        : undefined
      htmlContent = emailTemplates.genericNotificationEmail(
        user.name,
        title,
        message,
        actionUrl,
        actionUrl ? 'View Details' : undefined
      )
  }

  // Send email with HTML and text fallback
  await sendEmail(userId, subject, htmlContent, message)
}
