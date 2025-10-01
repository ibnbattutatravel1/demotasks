/**
 * سكريبت لتصدير جميع البيانات من قاعدة بيانات SQLite (Turso)
 * يحفظ البيانات في ملفات JSON لاستيرادها لاحقاً في MySQL
 */

import { createClient } from '@libsql/client'
import fs from 'fs'
import path from 'path'

const EXPORT_DIR = path.join(process.cwd(), 'scripts', 'migrate-to-mysql', 'exported-data')

// إنشاء مجلد التصدير إذا لم يكن موجوداً
if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true })
}

// الاتصال بقاعدة البيانات الحالية (Turso)
const client = createClient({
  url: process.env.LIBSQL_URL!,
  authToken: process.env.LIBSQL_AUTH_TOKEN,
})

// قائمة الجداول بالترتيب الصحيح (مع مراعاة العلاقات)
const tables = [
  'users',
  'user_settings',
  'push_subscriptions',
  'projects',
  'project_team',
  'project_tags',
  'tasks',
  'task_assignees',
  'task_tags',
  'subtasks',
  'subtask_tags',
  'comments',
  'attachments',
  'notifications',
  'timesheets',
  'timesheet_entries',
]

async function exportAllData() {
  console.log('🚀 بدء عملية تصدير البيانات من SQLite...\n')

  const exportSummary: Record<string, number> = {}

  for (const table of tables) {
    try {
      console.log(`📊 تصدير جدول: ${table}...`)
      
      const result = await client.execute(`SELECT * FROM ${table}`)
      const rows = result.rows
      
      exportSummary[table] = rows.length

      // حفظ البيانات في ملف JSON
      const filePath = path.join(EXPORT_DIR, `${table}.json`)
      fs.writeFileSync(filePath, JSON.stringify(rows, null, 2), 'utf-8')
      
      console.log(`   ✅ تم تصدير ${rows.length} صف من ${table}`)
    } catch (error) {
      console.error(`   ❌ خطأ في تصدير ${table}:`, error)
      exportSummary[table] = -1
    }
  }

  // حفظ ملخص العملية
  const summaryPath = path.join(EXPORT_DIR, '_export_summary.json')
  fs.writeFileSync(
    summaryPath,
    JSON.stringify(
      {
        exportDate: new Date().toISOString(),
        totalTables: tables.length,
        summary: exportSummary,
        totalRows: Object.values(exportSummary).reduce((a, b) => (b > 0 ? a + b : a), 0),
      },
      null,
      2
    ),
    'utf-8'
  )

  console.log('\n✅ اكتملت عملية التصدير بنجاح!')
  console.log(`📁 الملفات محفوظة في: ${EXPORT_DIR}`)
  console.log('\n📊 ملخص العملية:')
  console.table(exportSummary)
  
  await client.close()
}

exportAllData().catch((error) => {
  console.error('❌ فشلت عملية التصدير:', error)
  process.exit(1)
})
