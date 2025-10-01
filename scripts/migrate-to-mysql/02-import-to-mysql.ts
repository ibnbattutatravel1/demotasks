/**
 * سكريبت لاستيراد البيانات المصدرة إلى قاعدة بيانات MySQL
 */

import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from '../../lib/db/schema-mysql'
import fs from 'fs'
import path from 'path'

const EXPORT_DIR = path.join(process.cwd(), 'scripts', 'migrate-to-mysql', 'exported-data')

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

async function importAllData() {
  console.log('🚀 بدء عملية استيراد البيانات إلى MySQL...\n')

  // الاتصال بقاعدة بيانات MySQL
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER!,
    password: process.env.MYSQL_PASSWORD!,
    database: process.env.MYSQL_DATABASE!,
    multipleStatements: true,
  })

  const db = drizzle(connection, { schema, mode: 'default' })

  const importSummary: Record<string, { imported: number; errors: number }> = {}

  // تعطيل فحص المفاتيح الخارجية مؤقتاً
  await connection.query('SET FOREIGN_KEY_CHECKS = 0')

  for (const table of tables) {
    try {
      const filePath = path.join(EXPORT_DIR, `${table}.json`)
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  ملف ${table}.json غير موجود، تخطي...`)
        continue
      }

      console.log(`📊 استيراد جدول: ${table}...`)
      
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      
      if (!Array.isArray(data) || data.length === 0) {
        console.log(`   ℹ️  لا توجد بيانات في ${table}`)
        importSummary[table] = { imported: 0, errors: 0 }
        continue
      }

      let imported = 0
      let errors = 0

      // استيراد البيانات دفعة واحدة أو صف بصف حسب حجم البيانات
      if (data.length < 100) {
        // استيراد دفعة واحدة للجداول الصغيرة
        try {
          const schemaTable = (schema as any)[toCamelCase(table)]
          if (schemaTable) {
            // تحويل البيانات من SQLite إلى MySQL format
            const transformedData = data.map(transformRow)
            await db.insert(schemaTable).values(transformedData)
            imported = data.length
          }
        } catch (error) {
          console.error(`   ❌ خطأ في استيراد دفعة ${table}:`, error)
          errors = data.length
        }
      } else {
        // استيراد صف بصف للجداول الكبيرة
        for (const row of data) {
          try {
            const schemaTable = (schema as any)[toCamelCase(table)]
            if (schemaTable) {
              const transformedRow = transformRow(row)
              await db.insert(schemaTable).values(transformedRow)
              imported++
            }
          } catch (error) {
            errors++
            if (errors < 5) {
              console.error(`   ⚠️  خطأ في صف من ${table}:`, error)
            }
          }
        }
      }

      importSummary[table] = { imported, errors }
      console.log(`   ✅ تم استيراد ${imported} صف من ${table} (${errors} أخطاء)`)
    } catch (error) {
      console.error(`   ❌ خطأ في استيراد ${table}:`, error)
      importSummary[table] = { imported: 0, errors: -1 }
    }
  }

  // إعادة تفعيل فحص المفاتيح الخارجية
  await connection.query('SET FOREIGN_KEY_CHECKS = 1')

  console.log('\n✅ اكتملت عملية الاستيراد!')
  console.log('\n📊 ملخص العملية:')
  console.table(importSummary)

  await connection.end()
}

// تحويل اسم الجدول من snake_case إلى camelCase
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
}

// تحويل البيانات من تنسيق SQLite إلى MySQL
function transformRow(row: any): any {
  const transformed: any = {}
  
  for (const [key, value] of Object.entries(row)) {
    if (value === null || value === undefined) {
      transformed[key] = null
      continue
    }

    // تحويل القيم الرقمية من SQLite (0/1) إلى boolean
    if (key.includes('completed') || key.includes('read') || key.includes('Notifications') || 
        key.includes('Reminders') || key.includes('Updates') || key.includes('push_notifications')) {
      transformed[key] = value === 1 || value === true
      continue
    }

    // تحويل التواريخ من نص إلى datetime
    if (key.includes('Date') || key.includes('At') || key.includes('_at') || 
        key.includes('start_date') || key.includes('due_date') || key.includes('created_at')) {
      if (typeof value === 'string' && value !== '') {
        try {
          // محاولة تحويل النص إلى تاريخ
          const date = new Date(value)
          transformed[key] = isNaN(date.getTime()) ? null : date
        } catch {
          transformed[key] = null
        }
      } else {
        transformed[key] = null
      }
      continue
    }

    transformed[key] = value
  }

  return transformed
}

importAllData().catch((error) => {
  console.error('❌ فشلت عملية الاستيراد:', error)
  process.exit(1)
})
