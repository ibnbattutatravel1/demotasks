/**
 * سكريبت للتحقق من الاتصال بـ MySQL
 */

import { config } from 'dotenv'
config()

import mysql from 'mysql2/promise'

async function testConnection() {
  console.log('🔍 فحص معلومات الاتصال...\n')
  
  // التحقق من المتغيرات
  const requiredVars = ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_DATABASE', 'MYSQL_PASSWORD']
  const missing = requiredVars.filter(v => !process.env[v])
  
  if (missing.length > 0) {
    console.error('❌ متغيرات البيئة المفقودة:', missing.join(', '))
    console.error('\nيرجى إضافتها إلى ملف .env\n')
    process.exit(1)
  }
  
  console.log('✅ جميع المتغيرات موجودة')
  console.log(`   المضيف: ${process.env.MYSQL_HOST}`)
  console.log(`   المستخدم: ${process.env.MYSQL_USER}`)
  console.log(`   قاعدة البيانات: ${process.env.MYSQL_DATABASE}`)
  console.log(`   المنفذ: ${process.env.MYSQL_PORT || '3306'}`)
  
  console.log('\n🔌 محاولة الاتصال بـ MySQL...')
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    })
    
    console.log('✅ نجح الاتصال بـ MySQL!')
    
    // اختبار استعلام بسيط
    console.log('\n📊 فحص الجداول...')
    const [tables] = await connection.query('SHOW TABLES')
    console.log(`✅ عدد الجداول: ${(tables as any[]).length}`)
    
    if ((tables as any[]).length > 0) {
      console.log('\n📋 الجداول الموجودة:')
      ;(tables as any[]).forEach((table: any, index: number) => {
        const tableName = Object.values(table)[0]
        console.log(`   ${index + 1}. ${tableName}`)
      })
    }
    
    // فحص بعض الجداول المهمة
    console.log('\n🔍 فحص البيانات...')
    
    try {
      const [users] = await connection.query('SELECT COUNT(*) as count FROM users')
      console.log(`   👥 المستخدمون: ${(users as any)[0].count}`)
    } catch (e) {
      console.log('   ⚠️  جدول users غير موجود أو فارغ')
    }
    
    try {
      const [projects] = await connection.query('SELECT COUNT(*) as count FROM projects')
      console.log(`   📁 المشاريع: ${(projects as any)[0].count}`)
    } catch (e) {
      console.log('   ⚠️  جدول projects غير موجود أو فارغ')
    }
    
    try {
      const [tasks] = await connection.query('SELECT COUNT(*) as count FROM tasks')
      console.log(`   ✅ المهام: ${(tasks as any)[0].count}`)
    } catch (e) {
      console.log('   ⚠️  جدول tasks غير موجود أو فارغ')
    }
    
    await connection.end()
    
    console.log('\n✅ الاتصال سليم! التطبيق جاهز للعمل مع MySQL')
    
  } catch (error: any) {
    console.error('\n❌ فشل الاتصال بـ MySQL:')
    console.error(`   ${error.message}`)
    
    if (error.code === 'ENOTFOUND') {
      console.error('\n💡 الحل: تحقق من عنوان MYSQL_HOST')
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 الحل: تحقق من MYSQL_USER و MYSQL_PASSWORD')
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 الحل: تحقق من MYSQL_DATABASE أو أنشئها')
    }
    
    process.exit(1)
  }
}

testConnection()
