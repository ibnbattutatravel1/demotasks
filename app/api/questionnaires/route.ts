import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq, and, or, sql } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'

// GET /api/questionnaires - Get user's questionnaires
export async function GET(req: NextRequest) {
  try {
    // Verify user
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const userId = payload.sub

    // Get user's responses with questionnaire info
    const responses = await db
      .select({
        responseId: dbSchema.questionnaireResponses.id,
        status: dbSchema.questionnaireResponses.status,
        submittedAt: dbSchema.questionnaireResponses.submittedAt,
        reviewedAt: dbSchema.questionnaireResponses.reviewedAt,
        adminNotes: dbSchema.questionnaireResponses.adminNotes,
        isLate: dbSchema.questionnaireResponses.isLate,
        questionnaireId: dbSchema.questionnaires.id,
        title: dbSchema.questionnaires.title,
        description: dbSchema.questionnaires.description,
        instructions: dbSchema.questionnaires.instructions,
        deadline: dbSchema.questionnaires.deadline,
        isMandatory: dbSchema.questionnaires.isMandatory,
      })
      .from(dbSchema.questionnaireResponses)
      .leftJoin(dbSchema.questionnaires, eq(dbSchema.questionnaireResponses.questionnaireId, dbSchema.questionnaires.id))
      .where(eq(dbSchema.questionnaireResponses.userId, userId))

    // Get critical feedback count for each
    const questionnairesWithFeedback = await Promise.all(
      responses.map(async (r) => {
        const criticalFeedback = await db
          .select({ count: sql<number>`count(*)` })
          .from(dbSchema.questionnaireFeedback)
          .where(
            and(
              eq(dbSchema.questionnaireFeedback.responseId, r.responseId),
              eq(dbSchema.questionnaireFeedback.isCritical, true)
            )
          )
        
        const criticalFeedbackCount = Number(criticalFeedback[0]?.count || 0)

        return {
          id: r.questionnaireId,
          title: r.title,
          description: r.description,
          instructions: r.instructions,
          deadline: r.deadline?.toISOString(),
          isMandatory: r.isMandatory,
          status: r.status,
          submittedAt: r.submittedAt?.toISOString(),
          reviewedAt: r.reviewedAt?.toISOString(),
          adminNotes: r.adminNotes,
          isLate: r.isLate,
          hasUnreadFeedback: criticalFeedbackCount > 0,
          criticalFeedbackCount,
        }
      })
    )

    return NextResponse.json({ success: true, data: questionnairesWithFeedback })
  } catch (err) {
    console.error('GET /api/questionnaires error', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch questionnaires' }, { status: 500 })
  }
}
