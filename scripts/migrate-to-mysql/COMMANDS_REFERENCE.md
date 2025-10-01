# 📋 مرجع الأوامر السريع

## أوامر npm المتاحة

### التحويل الكامل (أوتوماتيكي)
```bash
npm run migrate:mysql:all
```
يشغّل جميع الخطوات: Setup → Export → Import → Verify

---

### تشغيل خطوة واحدة فقط

#### 1. إنشاء الجداول في MySQL
```bash
npm run migrate:mysql:setup
```
- يُنشئ جميع الجداول والعلاقات
- يستخدم `drizzle.config.mysql.ts`

#### 2. تصدير البيانات من SQLite
```bash
npm run migrate:mysql:export
```
- يتصل بـ Turso
- يصدّر جميع الجداول إلى JSON
- يحفظ في `scripts/migrate-to-mysql/exported-data/`

#### 3. استيراد البيانات إلى MySQL
```bash
npm run migrate:mysql:import
```
- يقرأ ملفات JSON
- يستورد البيانات إلى MySQL
- يحول أنواع البيانات تلقائياً

#### 4. التحقق من التطابق
```bash
npm run migrate:mysql:verify
```
- يقارن عدد الصفوف في كل جدول
- يُنشئ تقرير التحقق
- يعرض النتائج في الـ console

---

## أدوات Drizzle

### فتح واجهة إدارة MySQL
```bash
npm run db:studio:mysql
```
يفتح Drizzle Studio على `https://local.drizzle.studio`

### فتح واجهة إدارة SQLite (الأصلية)
```bash
npm run db:studio
```

---

## أوامر MySQL المباشرة

### الاتصال بقاعدة البيانات
```bash
mysql -u root -p demotasks
```

### إنشاء قاعدة البيانات
```bash
mysql -u root -p < scripts/migrate-to-mysql/00-setup-mysql.sql
```

### نسخ احتياطي
```bash
mysqldump -u root -p demotasks > backup.sql
```

### استعادة نسخة احتياطية
```bash
mysql -u root -p demotasks < backup.sql
```

### عرض الجداول
```sql
USE demotasks;
SHOW TABLES;
```

### عد الصفوف في جدول معين
```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM projects;
SELECT COUNT(*) FROM tasks;
```

---

## أوامر تشغيل السكريبتات مباشرة

### تصدير البيانات
```bash
npx tsx scripts/migrate-to-mysql/01-export-sqlite-data.ts
```

### استيراد البيانات
```bash
npx tsx scripts/migrate-to-mysql/02-import-to-mysql.ts
```

### التحقق من الترحيل
```bash
npx tsx scripts/migrate-to-mysql/verify-migration.ts
```

---

## متغيرات البيئة المطلوبة

### لـ SQLite (Turso) - التصدير
```env
LIBSQL_URL=libsql://...
LIBSQL_AUTH_TOKEN=eyJ...
```

### لـ MySQL - الاستيراد
```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=demotasks
```

---

## نصائح

### اختبار الاتصال بـ MySQL
```bash
mysql -u root -p -e "SELECT 1"
```

### مسح جدول لإعادة الاستيراد
```sql
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE table_name;
SET FOREIGN_KEY_CHECKS = 1;
```

### عرض بنية جدول
```sql
DESCRIBE users;
SHOW CREATE TABLE projects;
```

### حذف قاعدة البيانات (للبدء من جديد)
```sql
DROP DATABASE demotasks;
CREATE DATABASE demotasks CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
