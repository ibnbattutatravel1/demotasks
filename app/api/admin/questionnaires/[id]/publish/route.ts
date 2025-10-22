import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq, and, or } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'

// POST /api/admin/questionnaires/[id]/publish
export async function POST(
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

    if (questionnaire.status !== 'draft') {
      return NextResponse.json({ success: false, error: 'Only draft questionnaires can be published' }, { status: 400 })
    }

    // Update status
    await db.update(dbSchema.questionnaires)
      .set({ status: 'published', publishedAt: new Date(), updatedAt: new Date() })
      .where(eq(dbSchema.questionnaires.id, id))

    // Get target users
    let targetUserIds: string[] = []
    
    if (questionnaire.targetType === 'all_users') {
      const allUsers = await db.select({ id: dbSchema.users.id }).from(dbSchema.users).where(eq(dbSchema.users.role, 'user'))
      targetUserIds = allUsers.map(u => u.id)
    } else if (questionnaire.targetType === 'specific_users') {
      const targets = await db.select({ userId: dbSchema.questionnaireTargets.userId }).from(dbSchema.questionnaireTargets).where(eq(dbSchema.questionnaireTargets.questionnaireId, id))
      targetUserIds = targets.map(t => t.userId)
    } else if (questionnaire.targetType === 'role_based' && questionnaire.targetRole) {
      const roleUsers = await db.select({ id: dbSchema.users.id }).from(dbSchema.users).where(eq(dbSchema.users.role, questionnaire.targetRole))
      targetUserIds = roleUsers.map(u => u.id)
    }

    // Create response records for each target user
    for (const userId of targetUserIds) {
      const responseId = `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await db.insert(dbSchema.questionnaireResponses).values({
        id: responseId,
        questionnaireId: id,
        userId,
        status: 'pending',
        isLate: false,
        createdAt: new Date(),
      })

      // Create notification
      try {
        await db.insert(dbSchema.notifications).values({
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          type: 'questionnaire',
          title: 'New Questionnaire Available',
          message: `You have a new ${questionnaire.isMandatory ? 'mandatory ' : ''}questionnaire: ${questionnaire.title}`,
          relatedId: id,
          relatedType: 'questionnaire',
          isRead: false,
          createdAt: new Date(),
        })
      } catch (e) {
        console.error('Failed to create notification', e)
      }
    }

    // Add to history
    try {
      await db.insert(dbSchema.questionnaireHistory).values({
        id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        questionnaireId: id,
        userId: user.id,
        action: 'published',
        notes: `Published to ${targetUserIds.length} users`,
        createdAt: new Date(),
      })
    } catch (e) {
      console.error('Failed to create history', e)
    }

    return NextResponse.json({ 
      success: true, 
      message: `Questionnaire published to ${targetUserIds.length} users` 
    })
  } catch (err) {
    console.error('POST /api/admin/questionnaires/[id]/publish error', err)
    return NextResponse.json({ success: false, error: 'Failed to publish questionnaire' }, { status: 500 })
  }
}
