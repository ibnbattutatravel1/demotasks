import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq, and } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'

// GET /api/questionnaires/[id] - Get questionnaire with questions for filling
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    // Check if user is targeted
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
      return NextResponse.json({ success: false, error: 'You are not assigned to this questionnaire' }, { status: 403 })
    }

    // Get questions
    const questions = await db
      .select()
      .from(dbSchema.questionnaireQuestions)
      .where(eq(dbSchema.questionnaireQuestions.questionnaireId, id))
      .orderBy(dbSchema.questionnaireQuestions.displayOrder)

    // Parse options JSON safely
    const questionsWithOptions = questions.map(q => {
      let parsedOptions = undefined
      if (q.options) {
        try {
          // If already an array, use it directly
          if (Array.isArray(q.options)) {
            parsedOptions = q.options
          } else if (typeof q.options === 'string') {
            // Try to parse string
            const parsed = JSON.parse(q.options)
            parsedOptions = Array.isArray(parsed) ? parsed : undefined
          }
        } catch (e) {
          console.error('Failed to parse options:', e)
          parsedOptions = undefined
        }
      }
      return {
        ...q,
        options: parsedOptions
      }
    })

    // Get existing answers if any
    const answers = await db
      .select()
      .from(dbSchema.questionnaireAnswers)
      .where(eq(dbSchema.questionnaireAnswers.responseId, response.id))

    return NextResponse.json({
      success: true,
      data: {
        questionnaire: {
          id: questionnaire.id,
          title: questionnaire.title,
          description: questionnaire.description,
          instructions: questionnaire.instructions,
          deadline: questionnaire.deadline.toISOString(),
          isMandatory: questionnaire.isMandatory,
        },
        response: {
          id: response.id,
          status: response.status,
        },
        questions: questionsWithOptions,
        answers,
      }
    })
  } catch (err) {
    console.error('GET /api/questionnaires/[id] error', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch questionnaire' }, { status: 500 })
  }
}
