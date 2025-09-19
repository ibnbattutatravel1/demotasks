import { db, dbSchema } from '@/lib/db/client'
import { randomUUID } from 'node:crypto'
import { and, eq } from 'drizzle-orm'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

// Optional deps: nodemailer and web-push
let nodemailer: any = null
let webPush: any = null
try { nodemailer = require('nodemailer') } catch (_) {}
try { webPush = require('web-push') } catch (_) {}

export type NotificationTopic = 'taskReminders' | 'projectUpdates' | 'generic'

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

async function sendEmail(userId: string, subject: string, text: string) {
  if (!nodemailer) return
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env as Record<string, string>
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_FROM) return
  const users = await db.select().from(dbSchema.users).where(eq(dbSchema.users.id, userId))
  const user = users[0]
  if (!user?.email) return

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  })
  await transporter.sendMail({ from: SMTP_FROM, to: user.email, subject, text })
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
}) {
  const id = (globalThis.crypto?.randomUUID?.() ?? randomUUID()) as string
  const { userId, type, title, message, relatedId, relatedType } = args
  const topic: NotificationTopic = args.topic || 'generic'

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

  // Fetch settings once
  const settings = await getUserSettings(userId)
  const topicOk = topicEnabled(settings, topic)

  // Email
  if (settings.email && topicOk) {
    await sendEmail(userId, title, message)
  }

  // Push
  if (settings.push && topicOk) {
    await sendPush(userId, { title, body: message, data: { relatedId, relatedType, type } })
  }

  return { id }
}
