import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq, desc, and, sql } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'

// GET /api/admin/questionnaires - Get all questionnaires
export async function GET(req: NextRequest) {
  try {
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

    // Get questionnaires with stats
    const questionnaires = await db
      .select({
        id: dbSchema.questionnaires.id,
        title: dbSchema.questionnaires.title,
        description: dbSchema.questionnaires.description,
        targetType: dbSchema.questionnaires.targetType,
        targetRole: dbSchema.questionnaires.targetRole,
        deadline: dbSchema.questionnaires.deadline,
        isMandatory: dbSchema.questionnaires.isMandatory,
        status: dbSchema.questionnaires.status,
        publishedAt: dbSchema.questionnaires.publishedAt,
        createdAt: dbSchema.questionnaires.createdAt,
      })
      .from(dbSchema.questionnaires)
      .orderBy(desc(dbSchema.questionnaires.createdAt))

    // Get counts for each questionnaire
    const questionnairesWithStats = await Promise.all(
      questionnaires.map(async (q) => {
        // Get total targets
        let totalTargets = 0
        if (q.targetType === 'all_users') {
          const allUsers = await db.select({ count: sql<number>`count(*)` }).from(dbSchema.users).where(eq(dbSchema.users.role, 'user'))
          totalTargets = Number(allUsers[0]?.count || 0)
        } else if (q.targetType === 'specific_users') {
          const targets = await db.select({ count: sql<number>`count(*)` }).from(dbSchema.questionnaireTargets).where(eq(dbSchema.questionnaireTargets.questionnaireId, q.id))
          totalTargets = Number(targets[0]?.count || 0)
        } else if (q.targetType === 'role_based' && q.targetRole) {
          const roleUsers = await db.select({ count: sql<number>`count(*)` }).from(dbSchema.users).where(eq(dbSchema.users.role, q.targetRole))
          totalTargets = Number(roleUsers[0]?.count || 0)
        }

        // Get response counts
        const responses = await db.select({ count: sql<number>`count(*)` }).from(dbSchema.questionnaireResponses).where(eq(dbSchema.questionnaireResponses.questionnaireId, q.id))
        const totalResponses = Number(responses[0]?.count || 0)

        const pending = await db.select({ count: sql<number>`count(*)` }).from(dbSchema.questionnaireResponses).where(and(eq(dbSchema.questionnaireResponses.questionnaireId, q.id), eq(dbSchema.questionnaireResponses.status, 'pending')))
        const pendingCount = Number(pending[0]?.count || 0)

        const submitted = await db.select({ count: sql<number>`count(*)` }).from(dbSchema.questionnaireResponses).where(and(eq(dbSchema.questionnaireResponses.questionnaireId, q.id), eq(dbSchema.questionnaireResponses.status, 'submitted')))
        const submittedCount = Number(submitted[0]?.count || 0)

        const approved = await db.select({ count: sql<number>`count(*)` }).from(dbSchema.questionnaireResponses).where(and(eq(dbSchema.questionnaireResponses.questionnaireId, q.id), eq(dbSchema.questionnaireResponses.status, 'approved')))
        const approvedCount = Number(approved[0]?.count || 0)

        return {
          ...q,
          totalTargets,
          totalResponses,
          pendingCount,
          submittedCount,
          approvedCount,
        }
      })
    )

    return NextResponse.json({ success: true, data: questionnairesWithStats })
  } catch (err) {
    console.error('GET /api/admin/questionnaires error', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch questionnaires' }, { status: 500 })
  }
}

// POST /api/admin/questionnaires - Create new questionnaire
export async function POST(req: NextRequest) {
  try {
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

    const body = await req.json()
    const {
      title,
      description,
      instructions,
      targetType,
      targetRole,
      targetUserIds,
      deadline,
      isMandatory,
      allowLateSubmission,
      showResultsToUsers,
      questions,
    } = body

    if (!title || !targetType || !deadline) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    // Create questionnaire
    const questionnaireId = `quest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await db.insert(dbSchema.questionnaires).values({
      id: questionnaireId,
      title,
      description: description || null,
      instructions: instructions || null,
      createdById: user.id,
      targetType,
      targetRole: targetRole || null,
      deadline: new Date(deadline),
      isMandatory: isMandatory ?? true,
      allowLateSubmission: allowLateSubmission ?? false,
      showResultsToUsers: showResultsToUsers ?? false,
      status: 'draft',
      createdAt: new Date(),
    })

    // Add target users if specific
    if (targetType === 'specific_users' && targetUserIds && Array.isArray(targetUserIds)) {
      for (const userId of targetUserIds) {
        const targetId = `target_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        await db.insert(dbSchema.questionnaireTargets).values({
          id: targetId,
          questionnaireId,
          userId,
          createdAt: new Date(),
        })
      }
    }

    // Add questions
    if (questions && Array.isArray(questions)) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        const questionId = `q_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`
        await db.insert(dbSchema.questionnaireQuestions).values({
          id: questionId,
          questionnaireId,
          questionText: q.questionText,
          questionType: q.questionType,
          isRequired: q.isRequired ?? true,
          options: q.options ? JSON.stringify(q.options) : null,
          minValue: q.minValue || null,
          maxValue: q.maxValue || null,
          maxFileSize: q.maxFileSize || null,
          allowedFileTypes: q.allowedFileTypes || null,
          placeholderText: q.placeholderText || null,
          helpText: q.helpText || null,
          displayOrder: i + 1,
          createdAt: new Date(),
        })
      }
    }

    return NextResponse.json({ success: true, data: { id: questionnaireId } })
  } catch (err) {
    console.error('POST /api/admin/questionnaires error', err)
    return NextResponse.json({ success: false, error: 'Failed to create questionnaire' }, { status: 500 })
  }
}
