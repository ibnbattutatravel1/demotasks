import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'uploads', ...params.path)
    
    if (!existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 })
    }

    const file = await readFile(filePath)
    const ext = path.extname(filePath).toLowerCase()
    
    let contentType = 'application/octet-stream'
    if (ext === '.png') contentType = 'image/png'
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg'
    else if (ext === '.gif') contentType = 'image/gif'
    else if (ext === '.webp') contentType = 'image/webp'
    else if (ext === '.pdf') contentType = 'application/pdf'

    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  } catch (error) {
    console.error('File serve error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
