import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'

// DELETE /api/admin/questionnaires/[id]
export async function DELETE(
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

    // Delete questionnaire (cascade will handle related records)
    await db.delete(dbSchema.questionnaires).where(eq(dbSchema.questionnaires.id, id))

    return NextResponse.json({ success: true, message: 'Questionnaire deleted' })
  } catch (err) {
    console.error('DELETE /api/admin/questionnaires/[id] error', err)
    return NextResponse.json({ success: false, error: 'Failed to delete questionnaire' }, { status: 500 })
  }
}
