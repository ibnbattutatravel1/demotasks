import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

// مجلد uploads في public
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads')

// التأكد من وجود المجلدات
async function ensureUploadDirs() {
  const dirs = [
    UPLOADS_DIR,
    path.join(UPLOADS_DIR, 'avatars'),
    path.join(UPLOADS_DIR, 'attachments'),
  ]

  for (const dir of dirs) {
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true })
    }
  }
}

/**
 * حفظ ملف في file system
 * @param file - الملف المراد حفظه
 * @param type - نوع الملف (avatar, attachment)
 * @returns رابط الملف
 */
export async function saveFile(file: File, type: 'avatar' | 'attachment'): Promise<string> {
  await ensureUploadDirs()

  // إنشاء اسم فريد للملف
  const ext = file.name.split('.').pop() || 'bin'
  const filename = `${randomUUID()}.${ext}`
  
  // تحديد المجلد حسب النوع
  const subdir = type === 'avatar' ? 'avatars' : 'attachments'
  const filepath = path.join(UPLOADS_DIR, subdir, filename)
  
  // حفظ الملف
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(filepath, buffer)
  
  // إرجاع رابط الملف
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/uploads/${subdir}/${filename}`
}

/**
 * حفظ صورة من URL خارجي
 * @param imageUrl - رابط الصورة
 * @returns رابط الملف المحفوظ
 */
export async function saveImageFromUrl(imageUrl: string): Promise<string> {
  await ensureUploadDirs()
  
  const response = await fetch(imageUrl)
  if (!response.ok) throw new Error('Failed to fetch image')
  
  const buffer = Buffer.from(await response.arrayBuffer())
  const contentType = response.headers.get('content-type') || 'image/jpeg'
  const ext = contentType.split('/')[1] || 'jpg'
  
  const filename = `${randomUUID()}.${ext}`
  const filepath = path.join(UPLOADS_DIR, 'avatars', filename)
  
  await writeFile(filepath, buffer)
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/uploads/avatars/${filename}`
}

/**
 * استخراج اسم الملف من رابط
 */
export function getFilenameFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    return path.basename(urlObj.pathname)
  } catch {
    return null
  }
}
