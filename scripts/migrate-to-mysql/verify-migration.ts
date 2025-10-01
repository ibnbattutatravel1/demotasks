/**
 * سكريبت للتحقق من نجاح عملية الترحيل
 * يقارن عدد الصفوف بين SQLite و MySQL
 */

import { createClient } from '@libsql/client'
import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'

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

async function verifyMigration() {
  console.log('🔍 بدء عملية التحقق من الترحيل...\n')

  // الاتصال بـ SQLite (Turso)
  const sqliteClient = createClient({
    url: process.env.LIBSQL_URL!,
    authToken: process.env.LIBSQL_AUTH_TOKEN,
  })

  // الاتصال بـ MySQL
  const mysqlConnection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER!,
    password: process.env.MYSQL_PASSWORD!,
    database: process.env.MYSQL_DATABASE!,
  })

  const comparison: Array<{
    table: string
    sqlite: number
    mysql: number
    match: string
  }> = []

  for (const table of tables) {
    try {
      // عد الصفوف في SQLite
      const sqliteResult = await sqliteClient.execute(`SELECT COUNT(*) as count FROM ${table}`)
      const sqliteCount = Number(sqliteResult.rows[0].count)

      // عد الصفوف في MySQL
      const [mysqlResult] = await mysqlConnection.query(`SELECT COUNT(*) as count FROM ${table}`)
      const mysqlCount = Number((mysqlResult as any)[0].count)

      const match = sqliteCount === mysqlCount ? '✅' : '❌'

      comparison.push({
        table,
        sqlite: sqliteCount,
        mysql: mysqlCount,
        match,
      })

      console.log(`${match} ${table}: SQLite=${sqliteCount}, MySQL=${mysqlCount}`)
    } catch (error) {
      console.error(`❌ خطأ في التحقق من ${table}:`, error)
      comparison.push({
        table,
        sqlite: -1,
        mysql: -1,
        match: '❌',
      })
    }
  }

  // حفظ تقرير المقارنة
  const reportPath = path.join(
    process.cwd(),
    'scripts',
    'migrate-to-mysql',
    'exported-data',
    '_verification_report.json'
  )
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        verificationDate: new Date().toISOString(),
        comparison,
        summary: {
          totalTables: tables.length,
          matchingTables: comparison.filter((c) => c.match === '✅').length,
          mismatchTables: comparison.filter((c) => c.match === '❌').length,
        },
      },
      null,
      2
    ),
    'utf-8'
  )

  console.log('\n📊 ملخص التحقق:')
  console.table(comparison)

  const allMatch = comparison.every((c) => c.match === '✅')
  if (allMatch) {
    console.log('\n✅ نجحت عملية الترحيل! جميع البيانات تطابقت بنجاح.')
  } else {
    console.log('\n⚠️  هناك اختلافات في البيانات. يرجى مراجعة التقرير.')
  }

  console.log(`\n📄 تقرير التحقق محفوظ في: ${reportPath}`)

  await sqliteClient.close()
  await mysqlConnection.end()
}

verifyMigration().catch((error) => {
  console.error('❌ فشلت عملية التحقق:', error)
  process.exit(1)
})
