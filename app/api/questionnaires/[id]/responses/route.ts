import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq, and } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'

// POST /api/questionnaires/[id]/responses - Submit/Save response
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { answers, isDraft } = body

    // Verify user
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const userId = payload.sub

    // Get questionnaire
    const questRows = await db.select().from(dbSchema.questionnaires).where(eq(dbSchema.questionnaires.id, id))
    const questionnaire = questRows[0]
    if (!questionnaire) {
      return NextResponse.json({ success: false, error: 'Questionnaire not found' }, { status: 404 })
    }

    // Get user's response
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
      return NextResponse.json({ success: false, error: 'Response record not found' }, { status: 404 })
    }

    // Check if already submitted and not returned
    if (response.status === 'submitted' || response.status === 'approved') {
      return NextResponse.json({ success: false, error: 'Response already submitted' }, { status: 400 })
    }

    // Check deadline (only for final submission, not draft)
    const isLate = !isDraft && questionnaire.deadline && new Date() > new Date(questionnaire.deadline)

    // Delete existing answers
    await db.delete(dbSchema.questionnaireAnswers).where(eq(dbSchema.questionnaireAnswers.responseId, response.id))

    // Insert new answers
    for (const answer of answers) {
      await db.insert(dbSchema.questionnaireAnswers).values({
        id: `ans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        responseId: response.id,
        questionId: answer.questionId,
        answerValue: answer.answerValue || null,
        answerText: answer.answerText || null,
        answerNumber: answer.answerNumber || null,
        answerOptions: answer.answerOptions ? JSON.stringify(answer.answerOptions) : null,
        answerFile: answer.answerFile || null,
        answerDate: answer.answerDate || null,
      })
    }

    // Update response status
    if (!isDraft) {
      await db
        .update(dbSchema.questionnaireResponses)
        .set({
          status: 'submitted',
          submittedAt: new Date(),
          isLate,
        })
        .where(eq(dbSchema.questionnaireResponses.id, response.id))

      // Create notification for admin
      try {
        const adminUsers = await db.select().from(dbSchema.users).where(eq(dbSchema.users.role, 'admin'))
        for (const admin of adminUsers) {
          await db.insert(dbSchema.notifications).values({
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: admin.id,
            type: 'questionnaire',
            title: 'New Questionnaire Response',
            message: `${payload.name || 'A user'} submitted a response to "${questionnaire.title}"`,
            relatedId: response.id,
            relatedType: 'questionnaire_response',
            isRead: false,
            createdAt: new Date(),
          })
        }
      } catch (e) {
        console.error('Failed to create notification', e)
      }

      // Add to history
      try {
        await db.insert(dbSchema.questionnaireHistory).values({
          id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          questionnaireId: id,
          userId,
          action: isLate ? 'late_submission' : 'submitted',
          notes: isLate ? 'Submitted after deadline' : 'Response submitted',
          createdAt: new Date(),
        })
      } catch (e) {
        console.error('Failed to create history', e)
      }

      // TODO: Send email notification to admin
    }

    return NextResponse.json({
      success: true,
      message: isDraft ? 'Draft saved' : 'Response submitted',
      data: { responseId: response.id }
    })
  } catch (err) {
    console.error('POST /api/questionnaires/[id]/responses error', err)
    return NextResponse.json({ success: false, error: 'Failed to save response' }, { status: 500 })
  }
}
