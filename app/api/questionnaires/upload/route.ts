import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'

// POST /api/questionnaires/upload - Upload file for questionnaire answer
export async function POST(req: NextRequest) {
  try {
    // Verify user
    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File
    const questionnaireId = formData.get('questionnaireId') as string
    const questionId = formData.get('questionId') as string

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    // Create upload directory if not exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'questionnaires', questionnaireId)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${questionId}_${timestamp}_${originalName}`
    const filepath = path.join(uploadDir, filename)

    // Write file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Return relative path
    const relativePath = `/uploads/questionnaires/${questionnaireId}/${filename}`

    return NextResponse.json({
      success: true,
      filePath: relativePath,
      filename,
    })
  } catch (err) {
    console.error('POST /api/questionnaires/upload error', err)
    return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 })
  }
}
