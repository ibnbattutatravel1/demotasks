import { config } from 'dotenv'
config() // قراءة ملف .env

import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import { hash } from 'bcryptjs'
import { randomUUID } from 'crypto'
import * as schema from '../lib/db/schema-mysql.js'
import { eq } from 'drizzle-orm'

async function createAdminUser() {
  // التحقق من إعدادات MySQL
  if (!process.env.MYSQL_HOST || !process.env.MYSQL_USER || !process.env.MYSQL_DATABASE) {
    console.error('❌ خطأ: يجب تعيين MYSQL_HOST و MYSQL_USER و MYSQL_DATABASE في ملف .env')
    process.exit(1)
  }

  console.log('🔌 الاتصال بقاعدة البيانات MySQL...')
  console.log(`   المضيف: ${process.env.MYSQL_HOST}`)
  console.log(`   قاعدة البيانات: ${process.env.MYSQL_DATABASE}`)

  // إنشاء اتصال MySQL
  const connection = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })

  const db = drizzle(connection, { schema, mode: 'default' })

  try {
    // بيانات المستخدم الأدمن
    const adminEmail = 'admin@taskara.com'
    const adminPassword = 'admin123'
    const adminName = 'Admin User'

    console.log('\n📝 إنشاء/تحديث المستخدم الأدمن...')

    // التحقق من وجود المستخدم
    const existingUsers = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, adminEmail))
      .limit(1)

    // تشفير كلمة المرور
    const passwordHash = await hash(adminPassword, 10)

    if (existingUsers && existingUsers.length > 0) {
      // تحديث المستخدم الموجود
      await db
        .update(schema.users)
        .set({ passwordHash })
        .where(eq(schema.users.email, adminEmail))
      console.log('✅ تم تحديث كلمة مرور المستخدم الأدمن')
    } else {
      // إنشاء مستخدم جديد
      await db.insert(schema.users).values({
        id: randomUUID(),
        name: adminName,
        email: adminEmail,
        avatar: '/placeholder-user.jpg',
        initials: 'AU',
        role: 'admin',
        passwordHash,
      })
      console.log('✅ تم إنشاء المستخدم الأدمن بنجاح')
    }

    // إنشاء مستخدم عادي أيضاً
    const userEmail = 'user@taskara.com'
    const existingRegularUsers = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, userEmail))
      .limit(1)

    const userPasswordHash = await hash('user123', 10)

    if (existingRegularUsers && existingRegularUsers.length > 0) {
      await db
        .update(schema.users)
        .set({ passwordHash: userPasswordHash })
        .where(eq(schema.users.email, userEmail))
      console.log('✅ تم تحديث كلمة مرور المستخدم العادي')
    } else {
      await db.insert(schema.users).values({
        id: randomUUID(),
        name: 'Regular User',
        email: userEmail,
        avatar: '/placeholder-user.jpg',
        initials: 'RU',
        role: 'user',
        passwordHash: userPasswordHash,
      })
      console.log('✅ تم إنشاء المستخدم العادي بنجاح')
    }

    console.log('\n🎉 تم إنشاء/تحديث المستخدمين بنجاح!')
    console.log('\n📋 بيانات الدخول:')
    console.log('   المستخدم الأدمن:')
    console.log('   - البريد الإلكتروني: admin@taskara.com')
    console.log('   - كلمة المرور: admin123')
    console.log('\n   المستخدم العادي:')
    console.log('   - البريد الإلكتروني: user@taskara.com')
    console.log('   - كلمة المرور: user123')

  } catch (error) {
    console.error('❌ حدث خطأ:', error)
    process.exit(1)
  } finally {
    await connection.end()
  }
}

createAdminUser()
