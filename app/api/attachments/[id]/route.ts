import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'

// DELETE /api/attachments/[id] - Delete attachment
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    // Check authentication
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    
    try {
      await verifyAuthToken(token)
    } catch {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if attachment exists
    const existing = (await db.select().from(dbSchema.attachments).where(eq(dbSchema.attachments.id, id)))[0]
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Attachment not found' }, { status: 404 })
    }

    // Delete the attachment record
    // Note: In production, you would also delete the file from cloud storage here
    await db.delete(dbSchema.attachments).where(eq(dbSchema.attachments.id, id))

    return NextResponse.json({ success: true, message: 'Attachment deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/attachments/[id] error', error)
    return NextResponse.json({ success: false, error: 'Failed to delete attachment' }, { status: 500 })
  }
}
