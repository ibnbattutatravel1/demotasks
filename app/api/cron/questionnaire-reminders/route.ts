import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq, and, lt, gte, sql } from 'drizzle-orm'
import { sendBatchEmails } from '@/lib/email/questionnaire-emails'

/**
 * Cron Job: Questionnaire Reminders
 * 
 * This endpoint checks for questionnaires with upcoming deadlines
 * and sends reminder emails to users who haven't submitted yet.
 * 
 * Schedule: Run every hour
 * 
 * Setup Options:
 * 
 * 1. Vercel Cron (add to vercel.json):
 *    {
 *      "crons": [{
 *        "path": "/api/cron/questionnaire-reminders",
 *        "schedule": "0 * * * *"
 *      }]
 *    }
 * 
 * 2. External Cron Service:
 *    - Use cron-job.org or similar
 *    - URL: https://your-domain.com/api/cron/questionnaire-reminders
 *    - Schedule: Every hour (0 * * * *)
 * 
 * 3. Secret Key (optional security):
 *    Add CRON_SECRET to .env and check in this function
 */

export async function GET(req: NextRequest) {
  try {
    console.log('🔔 Running questionnaire reminders cron job...')

    // Optional: Check secret key for security
    const secret = req.nextUrl.searchParams.get('secret')
    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const in12Hours = new Date(now.getTime() + 12 * 60 * 60 * 1000)
    const in1Hour = new Date(now.getTime() + 1 * 60 * 60 * 1000)

    let totalReminders = 0
    let totalEmails = 0

    // Find questionnaires with upcoming deadlines (24h, 12h, 1h)
    const upcomingQuestionnaires = await db
      .select()
      .from(dbSchema.questionnaires)
      .where(
        and(
          eq(dbSchema.questionnaires.status, 'published'),
          gte(dbSchema.questionnaires.deadline, now),
          lt(dbSchema.questionnaires.deadline, in24Hours)
        )
      )

    console.log(`Found ${upcomingQuestionnaires.length} questionnaires with upcoming deadlines`)

    for (const questionnaire of upcomingQuestionnaires) {
      const deadlineTime = new Date(questionnaire.deadline).getTime()
      const timeUntilDeadline = deadlineTime - now.getTime()
      const hoursUntilDeadline = Math.floor(timeUntilDeadline / (1000 * 60 * 60))

      // Determine if we should send reminder (24h, 12h, or 1h)
      let shouldSendReminder = false
      let reminderType = ''

      if (hoursUntilDeadline <= 1 && hoursUntilDeadline > 0) {
        shouldSendReminder = true
        reminderType = '1h'
      } else if (hoursUntilDeadline <= 12 && hoursUntilDeadline > 11) {
        shouldSendReminder = true
        reminderType = '12h'
      } else if (hoursUntilDeadline <= 24 && hoursUntilDeadline > 23) {
        shouldSendReminder = true
        reminderType = '24h'
      }

      if (!shouldSendReminder) continue

      console.log(`Processing ${reminderType} reminder for: ${questionnaire.title}`)

      // Get pending responses (users who haven't submitted)
      const pendingResponses = await db
        .select({
          responseId: dbSchema.questionnaireResponses.id,
          userId: dbSchema.questionnaireResponses.userId,
          status: dbSchema.questionnaireResponses.status,
          userName: dbSchema.users.name,
          userEmail: dbSchema.users.email,
        })
        .from(dbSchema.questionnaireResponses)
        .leftJoin(dbSchema.users, eq(dbSchema.questionnaireResponses.userId, dbSchema.users.id))
        .where(
          and(
            eq(dbSchema.questionnaireResponses.questionnaireId, questionnaire.id),
            eq(dbSchema.questionnaireResponses.status, 'pending')
          )
        )

      if (pendingResponses.length === 0) {
        console.log('No pending responses to remind')
        continue
      }

      console.log(`Found ${pendingResponses.length} users to remind`)

      // Send reminder emails
      const emailData = pendingResponses
        .filter(r => r.userEmail)
        .map(r => ({
          to: r.userEmail!,
          toName: r.userName || 'User',
          questionnaireTitle: questionnaire.title || 'Questionnaire',
          deadline: questionnaire.deadline.toISOString(),
          link: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/questionnaires/${questionnaire.id}`,
        }))

      if (emailData.length > 0) {
        // Send batch emails
        await sendBatchEmails('reminder', emailData)
        totalEmails += emailData.length
      }

      // Create in-app notifications
      for (const response of pendingResponses) {
        try {
          await db.insert(dbSchema.notifications).values({
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: response.userId,
            type: 'questionnaire',
            title: `⏰ Reminder: ${questionnaire.title}`,
            message: `Deadline in ${hoursUntilDeadline} hour(s). Please complete your response soon.`,
            relatedId: questionnaire.id,
            relatedType: 'questionnaire',
            isRead: false,
            createdAt: new Date(),
          })
        } catch (e) {
          console.error('Failed to create notification', e)
        }
      }

      totalReminders += pendingResponses.length

      // Log reminder sent
      try {
        await db.insert(dbSchema.questionnaireHistory).values({
          id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          questionnaireId: questionnaire.id,
          userId: 'system',
          action: 'reminder_sent',
          notes: `${reminderType} reminder sent to ${pendingResponses.length} users`,
          createdAt: new Date(),
        })
      } catch (e) {
        console.error('Failed to log reminder', e)
      }
    }

    // Check for overdue questionnaires
    const overdueQuestionnaires = await db
      .select()
      .from(dbSchema.questionnaires)
      .where(
        and(
          eq(dbSchema.questionnaires.status, 'published'),
          lt(dbSchema.questionnaires.deadline, now)
        )
      )

    console.log(`Found ${overdueQuestionnaires.length} overdue questionnaires`)

    for (const questionnaire of overdueQuestionnaires) {
      // Get pending responses for overdue questionnaires
      const pendingResponses = await db
        .select({
          responseId: dbSchema.questionnaireResponses.id,
          userId: dbSchema.questionnaireResponses.userId,
          userName: dbSchema.users.name,
          userEmail: dbSchema.users.email,
        })
        .from(dbSchema.questionnaireResponses)
        .leftJoin(dbSchema.users, eq(dbSchema.questionnaireResponses.userId, dbSchema.users.id))
        .where(
          and(
            eq(dbSchema.questionnaireResponses.questionnaireId, questionnaire.id),
            eq(dbSchema.questionnaireResponses.status, 'pending')
          )
        )

      if (pendingResponses.length === 0) continue

      // Send late submission warnings (once per day)
      const daysSinceDeadline = Math.floor((now.getTime() - new Date(questionnaire.deadline).getTime()) / (1000 * 60 * 60 * 24))
      
      // Send reminder on day 1, 3, 7 after deadline
      if ([1, 3, 7].includes(daysSinceDeadline)) {
        console.log(`Sending late submission warning (day ${daysSinceDeadline}) for: ${questionnaire.title}`)

        const emailData = pendingResponses
          .filter(r => r.userEmail)
          .map(r => ({
            to: r.userEmail!,
            toName: r.userName || 'User',
            questionnaireTitle: questionnaire.title || 'Questionnaire',
            deadline: questionnaire.deadline.toISOString(),
            link: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/questionnaires/${questionnaire.id}`,
          }))

        if (emailData.length > 0) {
          await sendBatchEmails('late', emailData)
          totalEmails += emailData.length
        }

        // Create in-app notifications
        for (const response of pendingResponses) {
          try {
            await db.insert(dbSchema.notifications).values({
              id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              userId: response.userId,
              type: 'questionnaire',
              title: `🚨 OVERDUE: ${questionnaire.title}`,
              message: `This questionnaire is ${daysSinceDeadline} day(s) overdue. Please complete it immediately.`,
              relatedId: questionnaire.id,
              relatedType: 'questionnaire',
              isRead: false,
              createdAt: new Date(),
            })
          } catch (e) {
            console.error('Failed to create notification', e)
          }
        }
      }
    }

    console.log(`✅ Cron job completed: ${totalReminders} reminders, ${totalEmails} emails sent`)

    return NextResponse.json({
      success: true,
      message: 'Reminders sent successfully',
      stats: {
        upcomingQuestionnaires: upcomingQuestionnaires.length,
        overdueQuestionnaires: overdueQuestionnaires.length,
        totalReminders,
        totalEmails,
      }
    })
  } catch (err) {
    console.error('Cron job error:', err)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send reminders',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
