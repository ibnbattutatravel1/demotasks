import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq, and, sql } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'

// GET /api/admin/questionnaires/[id]/responses
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify admin
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const userRows = await db.select().from(dbSchema.users).where(eq(dbSchema.users.id, payload.sub))
    const user = userRows[0]
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    // Get questionnaire
    const questRows = await db.select().from(dbSchema.questionnaires).where(eq(dbSchema.questionnaires.id, id))
    const questionnaire = questRows[0]
    if (!questionnaire) {
      return NextResponse.json({ success: false, error: 'Questionnaire not found' }, { status: 404 })
    }

    // Get responses with user info
    const responses = await db
      .select({
        id: dbSchema.questionnaireResponses.id,
        userId: dbSchema.questionnaireResponses.userId,
        status: dbSchema.questionnaireResponses.status,
        submittedAt: dbSchema.questionnaireResponses.submittedAt,
        reviewedAt: dbSchema.questionnaireResponses.reviewedAt,
        isLate: dbSchema.questionnaireResponses.isLate,
        userName: dbSchema.users.name,
        userAvatar: dbSchema.users.avatar,
        userInitials: dbSchema.users.initials,
      })
      .from(dbSchema.questionnaireResponses)
      .leftJoin(dbSchema.users, eq(dbSchema.questionnaireResponses.userId, dbSchema.users.id))
      .where(eq(dbSchema.questionnaireResponses.questionnaireId, id))

    // Check for critical feedback
    const responsesWithFeedback = await Promise.all(
      responses.map(async (r) => {
        const criticalFeedback = await db
          .select({ count: sql<number>`count(*)` })
          .from(dbSchema.questionnaireFeedback)
          .where(
            and(
              eq(dbSchema.questionnaireFeedback.responseId, r.id),
              eq(dbSchema.questionnaireFeedback.isCritical, true)
            )
          )
        
        return {
          ...r,
          hasCriticalFeedback: Number(criticalFeedback[0]?.count || 0) > 0
        }
      })
    )

    return NextResponse.json({
      success: true,
      questionnaire: {
        id: questionnaire.id,
        title: questionnaire.title,
        description: questionnaire.description,
      },
      responses: responsesWithFeedback
    })
  } catch (err) {
    console.error('GET /api/admin/questionnaires/[id]/responses error', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch responses' }, { status: 500 })
  }
}
