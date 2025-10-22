import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq, and, sql } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'

// GET /api/admin/questionnaires/[id]/stats
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

    // Get total targets
    let totalTargets = 0
    if (questionnaire.targetType === 'all_users') {
      const allUsers = await db.select({ count: sql<number>`count(*)` }).from(dbSchema.users).where(eq(dbSchema.users.role, 'user'))
      totalTargets = Number(allUsers[0]?.count || 0)
    } else if (questionnaire.targetType === 'specific_users') {
      const targets = await db.select({ count: sql<number>`count(*)` }).from(dbSchema.questionnaireTargets).where(eq(dbSchema.questionnaireTargets.questionnaireId, id))
      totalTargets = Number(targets[0]?.count || 0)
    } else if (questionnaire.targetType === 'role_based' && questionnaire.targetRole) {
      const roleUsers = await db.select({ count: sql<number>`count(*)` }).from(dbSchema.users).where(eq(dbSchema.users.role, questionnaire.targetRole))
      totalTargets = Number(roleUsers[0]?.count || 0)
    }

    // Get responses stats
    const allResponses = await db.select().from(dbSchema.questionnaireResponses).where(eq(dbSchema.questionnaireResponses.questionnaireId, id))
    
    const totalResponses = allResponses.length
    const pendingCount = allResponses.filter(r => r.status === 'pending').length
    const submittedCount = allResponses.filter(r => r.status === 'submitted').length
    const approvedCount = allResponses.filter(r => r.status === 'approved').length
    const rejectedCount = allResponses.filter(r => r.status === 'rejected').length
    const returnedCount = allResponses.filter(r => r.status === 'returned').length
    const lateCount = allResponses.filter(r => r.isLate).length

    const responseRate = totalTargets > 0 ? Math.round((totalResponses / totalTargets) * 100) : 0

    // Calculate average completion time (mock for now)
    const averageCompletionTime = 15 // minutes

    // Get questions
    const questions = await db
      .select()
      .from(dbSchema.questionnaireQuestions)
      .where(eq(dbSchema.questionnaireQuestions.questionnaireId, id))
      .orderBy(dbSchema.questionnaireQuestions.displayOrder)

    // Get question stats
    const questionStats = await Promise.all(
      questions.map(async (q) => {
        const answers = await db
          .select()
          .from(dbSchema.questionnaireAnswers)
          .where(eq(dbSchema.questionnaireAnswers.questionId, q.id))

        const totalResponses = answers.length
        const answerDistribution: { [key: string]: number } = {}
        let averageRating: number | undefined

        if (q.questionType === 'mcq' || q.questionType === 'yes_no') {
          // Count answer values
          answers.forEach(a => {
            const val = a.answerValue || 'No answer'
            answerDistribution[val] = (answerDistribution[val] || 0) + 1
          })
        } else if (q.questionType === 'multiple_choice' || q.questionType === 'checkbox') {
          // Parse JSON options
          answers.forEach(a => {
            try {
              const options = JSON.parse(a.answerOptions as string || '[]')
              options.forEach((opt: string) => {
                answerDistribution[opt] = (answerDistribution[opt] || 0) + 1
              })
            } catch (e) {}
          })
        } else if (q.questionType === 'rating') {
          // Calculate average
          const ratings = answers.map(a => Number(a.answerNumber) || 0).filter(r => r > 0)
          if (ratings.length > 0) {
            averageRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length
          }
          // Distribution
          ratings.forEach(r => {
            answerDistribution[r.toString()] = (answerDistribution[r.toString()] || 0) + 1
          })
        }

        return {
          questionId: q.id,
          questionText: q.questionText,
          questionType: q.questionType,
          totalResponses,
          answerDistribution,
          averageRating,
          mostCommon: Object.keys(answerDistribution).length > 0 
            ? Object.entries(answerDistribution).sort((a, b) => b[1] - a[1])[0][0]
            : undefined
        }
      })
    )

    // Timeline (mock - group by day)
    const timeline: Array<{ date: string; count: number }> = []
    const dateGroups: { [key: string]: number } = {}
    
    allResponses.forEach(r => {
      if (r.submittedAt) {
        const date = r.submittedAt.toISOString().split('T')[0]
        dateGroups[date] = (dateGroups[date] || 0) + 1
      }
    })

    Object.entries(dateGroups).forEach(([date, count]) => {
      timeline.push({ date, count })
    })

    const stats = {
      questionnaire: {
        id: questionnaire.id,
        title: questionnaire.title,
        description: questionnaire.description,
        deadline: questionnaire.deadline.toISOString(),
        totalTargets,
      },
      overview: {
        totalResponses,
        responseRate,
        pendingCount,
        submittedCount,
        approvedCount,
        rejectedCount,
        returnedCount,
        lateCount,
        averageCompletionTime,
      },
      questionStats,
      timeline: timeline.sort((a, b) => a.date.localeCompare(b.date)),
    }

    return NextResponse.json({ success: true, data: stats })
  } catch (err) {
    console.error('GET /api/admin/questionnaires/[id]/stats error', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 })
  }
}
