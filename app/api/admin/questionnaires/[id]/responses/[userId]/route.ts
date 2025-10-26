import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq, and } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'

// GET /api/admin/questionnaires/[id]/responses/[userId]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id, userId } = await params

    // Verify admin
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const userRows = await db.select().from(dbSchema.users).where(eq(dbSchema.users.id, payload.sub))
    const adminUser = userRows[0]
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    // Get questionnaire
    const questRows = await db.select().from(dbSchema.questionnaires).where(eq(dbSchema.questionnaires.id, id))
    const questionnaire = questRows[0]
    if (!questionnaire) {
      return NextResponse.json({ success: false, error: 'Questionnaire not found' }, { status: 404 })
    }

    // Get response
    const responseRows = await db
      .select()
      .from(dbSchema.questionnaireResponses)
      .where(
        and(
          eq(dbSchema.questionnaireResponses.questionnaireId, id),
          eq(dbSchema.questionnaireResponses.userId, userId)
        )
      )
    
    const response = responseRows[0]
    if (!response) {
      return NextResponse.json({ success: false, error: 'Response not found' }, { status: 404 })
    }

    // Get user info
    const targetUserRows = await db.select().from(dbSchema.users).where(eq(dbSchema.users.id, userId))
    const targetUser = targetUserRows[0]

    // Get questions
    const questions = await db
      .select()
      .from(dbSchema.questionnaireQuestions)
      .where(eq(dbSchema.questionnaireQuestions.questionnaireId, id))
      .orderBy(dbSchema.questionnaireQuestions.displayOrder)

    // Get answers
    const answers = await db
      .select()
      .from(dbSchema.questionnaireAnswers)
      .where(eq(dbSchema.questionnaireAnswers.responseId, response.id))

    // Combine questions with answers
    const questionsAnswers = questions.map(q => {
      const answer = answers.find(a => a.questionId === q.id)
      // Safely parse answerOptions
      let parsedAnswerOptions = undefined
      if (answer?.answerOptions) {
        try {
          if (Array.isArray(answer.answerOptions)) {
            parsedAnswerOptions = answer.answerOptions
          } else if (typeof answer.answerOptions === 'string') {
            const parsed = JSON.parse(answer.answerOptions)
            parsedAnswerOptions = Array.isArray(parsed) ? parsed : undefined
          }
        } catch (e) {
          console.error('Failed to parse answerOptions:', e)
        }
      }

      return {
        questionId: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        isRequired: q.isRequired,
        answerValue: answer?.answerValue,
        answerText: answer?.answerText,
        answerNumber: answer?.answerNumber,
        answerOptions: parsedAnswerOptions,
        answerFile: answer?.answerFile,
        answerDate: answer?.answerDate,
      }
    })

    // Get existing feedbacks
    const feedbacks = await db
      .select()
      .from(dbSchema.questionnaireFeedback)
      .where(eq(dbSchema.questionnaireFeedback.responseId, response.id))

    // Get history
    const history = await db
      .select({
        id: dbSchema.questionnaireHistory.id,
        action: dbSchema.questionnaireHistory.action,
        notes: dbSchema.questionnaireHistory.notes,
        createdAt: dbSchema.questionnaireHistory.createdAt,
        userName: dbSchema.users.name,
      })
      .from(dbSchema.questionnaireHistory)
      .leftJoin(dbSchema.users, eq(dbSchema.questionnaireHistory.userId, dbSchema.users.id))
      .where(eq(dbSchema.questionnaireHistory.questionnaireId, id))
      .orderBy(dbSchema.questionnaireHistory.createdAt)

    return NextResponse.json({
      success: true,
      data: {
        questionnaire: {
          id: questionnaire.id,
          title: questionnaire.title,
          description: questionnaire.description,
        },
        response: {
          id: response.id,
          status: response.status,
          submittedAt: response.submittedAt?.toISOString(),
          reviewedAt: response.reviewedAt?.toISOString(),
          isLate: response.isLate,
          adminNotes: response.adminNotes,
        },
        user: {
          id: targetUser.id,
          name: targetUser.name,
          avatar: targetUser.avatar,
          initials: targetUser.initials,
        },
        questionsAnswers,
        feedbacks,
        history: history.map(h => ({
          ...h,
          createdAt: h.createdAt?.toISOString()
        })),
      }
    })
  } catch (err) {
    console.error('GET /api/admin/questionnaires/[id]/responses/[userId] error', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch response' }, { status: 500 })
  }
}

// PATCH /api/admin/questionnaires/[id]/responses/[userId] - Approve/Reject/Return
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id, userId } = await params
    const body = await req.json()
    const { action, adminNotes, feedbacks } = body

    // Verify admin
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const userRows = await db.select().from(dbSchema.users).where(eq(dbSchema.users.id, payload.sub))
    const adminUser = userRows[0]
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    // Get questionnaire
    const questRows = await db.select().from(dbSchema.questionnaires).where(eq(dbSchema.questionnaires.id, id))
    const questionnaire = questRows[0]
    if (!questionnaire) {
      return NextResponse.json({ success: false, error: 'Questionnaire not found' }, { status: 404 })
    }

    // Get response
    const responseRows = await db
      .select()
      .from(dbSchema.questionnaireResponses)
      .where(
        and(
          eq(dbSchema.questionnaireResponses.questionnaireId, id),
          eq(dbSchema.questionnaireResponses.userId, userId)
        )
      )
    
    const response = responseRows[0]
    if (!response) {
      return NextResponse.json({ success: false, error: 'Response not found' }, { status: 404 })
    }

    // Delete old feedbacks
    await db.delete(dbSchema.questionnaireFeedback).where(eq(dbSchema.questionnaireFeedback.responseId, response.id))

    // Insert new feedbacks
    if (feedbacks && feedbacks.length > 0) {
      for (const fb of feedbacks) {
        if (fb.feedbackText?.trim()) {
          await db.insert(dbSchema.questionnaireFeedback).values({
            id: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            responseId: response.id,
            questionId: fb.questionId,
            feedbackText: fb.feedbackText,
            isCritical: fb.isCritical || false,
            createdAt: new Date(),
          })
        }
      }
    }

    // Update response
    const statusMap: { [key: string]: string } = {
      approve: 'approved',
      reject: 'rejected',
      return: 'returned',
    }
    const newStatus = statusMap[action] || response.status

    await db
      .update(dbSchema.questionnaireResponses)
      .set({
        status: newStatus,
        reviewedAt: new Date(),
        adminNotes: adminNotes || null,
      })
      .where(eq(dbSchema.questionnaireResponses.id, response.id))

    // Create notification for user
    try {
      let notificationMessage = ''
      if (action === 'approve') {
        notificationMessage = `Your response to "${questionnaire.title}" has been approved`
      } else if (action === 'reject') {
        notificationMessage = `Your response to "${questionnaire.title}" has been rejected. Please review the feedback.`
      } else if (action === 'return') {
        notificationMessage = `Your response to "${questionnaire.title}" needs revision. Please review the feedback and resubmit.`
      }

      await db.insert(dbSchema.notifications).values({
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type: 'questionnaire',
        title: action === 'approve' ? 'Response Approved' : action === 'reject' ? 'Response Rejected' : 'Response Needs Revision',
        message: notificationMessage,
        relatedId: response.id,
        relatedType: 'questionnaire_response',
        isRead: false,
        createdAt: new Date(),
      })
    } catch (e) {
      console.error('Failed to create notification', e)
    }

    // Add to history
    try {
      await db.insert(dbSchema.questionnaireHistory).values({
        id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        questionnaireId: id,
        userId: adminUser.id,
        action: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'returned',
        notes: adminNotes || `Response ${action}ed by admin`,
        createdAt: new Date(),
      })
    } catch (e) {
      console.error('Failed to create history', e)
    }

    // TODO: Send email notification
    // await sendQuestionnaireEmail(userEmail, action, ...)

    return NextResponse.json({
      success: true,
      message: `Response ${action}ed successfully`
    })
  } catch (err) {
    console.error('PATCH /api/admin/questionnaires/[id]/responses/[userId] error', err)
    return NextResponse.json({ success: false, error: 'Failed to process response' }, { status: 500 })
  }
}
