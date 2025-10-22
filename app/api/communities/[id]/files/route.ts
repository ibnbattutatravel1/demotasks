import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { sql } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// GET - List files
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await db.execute(sql`
      SELECT 
        f.*,
        u.name as uploader_name,
        u.avatar as uploader_avatar
      FROM community_files f
      LEFT JOIN users u ON f.uploaded_by = u.id
      WHERE f.community_id = ${id}
      ORDER BY f.uploaded_at DESC
    `)
    const data = Array.isArray(result[0]) ? result[0] : result.rows || result || []

    return NextResponse.json({
      success: true,
      data: data
    })

  } catch (error) {
    console.error('GET files error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch files' }, { status: 500 })
  }
}

// POST - Upload file
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const userId = payload.sub

    // Check member permissions
    const memberResult = await db.execute(sql`SELECT role FROM community_members WHERE community_id = ${id} AND user_id = ${userId}`)
    const member = Array.isArray(memberResult[0]) ? memberResult[0][0] : memberResult.rows?.[0] || memberResult[0]

    if (!member) {
      return NextResponse.json({ success: false, error: 'Not a member' }, { status: 403 })
    }

    if (member.role === 'viewer') {
      return NextResponse.json({ success: false, error: 'Viewers cannot upload files' }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const description = formData.get('description') as string
    const notes = formData.get('notes') as string
    const postId = formData.get('post_id') as string

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'communities', id)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}_${originalName}`
    const filepath = path.join(uploadDir, filename)

    // Write file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Save to database
    const fileId = `file_${timestamp}_${Math.random().toString(36).substr(2, 9)}`
    const relativePath = `/uploads/communities/${id}/${filename}`

    await db.execute(sql`
      INSERT INTO community_files (
        id, community_id, post_id, file_name, file_path, file_type, 
        file_size, mime_type, uploaded_by, description, notes, uploaded_at
      ) VALUES (
        ${fileId},
        ${id},
        ${postId || null},
        ${originalName},
        ${relativePath},
        ${file.type.split('/')[0] || 'other'},
        ${file.size},
        ${file.type},
        ${userId},
        ${description || null},
        ${notes || null},
        NOW()
      )
    `)

    // Log activity
    try {
      const activityId = `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await db.execute(sql`
        INSERT INTO community_activity (
          id, community_id, user_id, action, target_type, target_id, created_at
        ) VALUES (${activityId}, ${id}, ${userId}, 'shared', 'file', ${fileId}, NOW())
      `)
    } catch (e) {
      console.error('Failed to log activity:', e)
    }

    // Send notifications to admins/moderators
    try {
      const adminsResult = await db.execute(sql`
        SELECT user_id FROM community_members 
        WHERE community_id = ${id} 
        AND role IN ('owner', 'admin', 'moderator')
        AND user_id != ${userId}
      `)
      const admins = Array.isArray(adminsResult[0]) ? adminsResult[0] : adminsResult.rows || []
      
      for (const admin of admins) {
        const notifId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        await db.execute(sql`
          INSERT INTO notifications (
            id, user_id, type, title, message, related_id, related_type, created_at
          ) VALUES (
            ${notifId},
            ${admin.user_id},
            'community',
            ${'New File Uploaded'},
            ${'A file has been shared in the community'},
            ${id},
            'community',
            NOW()
          )
        `)
      }
    } catch (e) {
      console.error('Failed to send notifications:', e)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: fileId,
        file_name: originalName,
        file_path: relativePath,
        file_size: file.size
      }
    }, { status: 201 })

  } catch (error) {
    console.error('POST file error:', error)
    return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 })
  }
}
