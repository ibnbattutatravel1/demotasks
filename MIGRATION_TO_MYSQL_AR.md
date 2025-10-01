# 🔄 دليل التحويل من SQLite (Turso) إلى MySQL

هذا الدليل سيساعدك على تحويل قاعدة البيانات من SQLite (Turso) إلى MySQL بأمان تام وبدون فقدان أي بيانات.

## 📋 المتطلبات الأساسية

### 1. تثبيت MySQL
- قم بتثبيت MySQL Server (النسخة 8.0 أو أحدث)
- تأكد من أن MySQL يعمل بشكل صحيح

### 2. تحديث Dependencies
أضف المكتبات المطلوبة:

```bash
npm install mysql2 drizzle-orm@latest
```

### 3. تجهيز معلومات الاتصال بـ MySQL
ستحتاج إلى:
- `MYSQL_HOST`: عنوان السيرفر (مثل: localhost أو عنوان IP)
- `MYSQL_PORT`: المنفذ (افتراضياً: 3306)
- `MYSQL_USER`: اسم المستخدم
- `MYSQL_PASSWORD`: كلمة المرور
- `MYSQL_DATABASE`: اسم قاعدة البيانات (مثل: demotasks)

---

## 🚀 خطوات التحويل

### المرحلة 1️⃣: إعداد قاعدة بيانات MySQL

#### 1. إنشاء قاعدة البيانات
قم بتشغيل السكريبت التالي في MySQL:

```bash
mysql -u root -p < scripts/migrate-to-mysql/00-setup-mysql.sql
```

أو افتح MySQL client وقم بتنفيذ:
```sql
CREATE DATABASE IF NOT EXISTS demotasks 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;
```

#### 2. إنشاء الجداول باستخدام Drizzle
```bash
# إنشاء ملفات الـ migration
npx drizzle-kit generate --config=drizzle.config.mysql.ts

# تطبيق الـ migrations على قاعدة البيانات
npx drizzle-kit push --config=drizzle.config.mysql.ts
```

---

### المرحلة 2️⃣: تصدير البيانات من SQLite (Turso)

⚠️ **مهم**: تأكد من أن ملف `.env` يحتوي على معلومات الاتصال بـ Turso:
```env
LIBSQL_URL=libsql://demotasks-ibnbattutatravel1.aws-us-west-2.turso.io
LIBSQL_AUTH_TOKEN=eyJhbGci...
```

قم بتشغيل سكريبت التصدير:
```bash
npx tsx scripts/migrate-to-mysql/01-export-sqlite-data.ts
```

هذا السكريبت سيقوم بـ:
- ✅ الاتصال بقاعدة بيانات Turso
- ✅ تصدير جميع البيانات من كل الجداول
- ✅ حفظ البيانات في ملفات JSON في المجلد `scripts/migrate-to-mysql/exported-data/`
- ✅ إنشاء ملف ملخص `_export_summary.json`

**تحقق من نجاح العملية:**
- افتح المجلد `scripts/migrate-to-mysql/exported-data/`
- تأكد من وجود ملفات JSON لكل جدول
- افتح `_export_summary.json` للتحقق من عدد الصفوف المصدرة

---

### المرحلة 3️⃣: استيراد البيانات إلى MySQL

⚠️ **مهم**: أضف معلومات الاتصال بـ MySQL إلى ملف `.env`:
```env
# بيانات MySQL الجديدة
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=demotasks

# بيانات Turso القديمة (احتفظ بها للاحتياط)
LIBSQL_URL=libsql://demotasks-ibnbattutatravel1.aws-us-west-2.turso.io
LIBSQL_AUTH_TOKEN=eyJhbGci...
```

قم بتشغيل سكريبت الاستيراد:
```bash
npx tsx scripts/migrate-to-mysql/02-import-to-mysql.ts
```

هذا السكريبت سيقوم بـ:
- ✅ الاتصال بقاعدة بيانات MySQL
- ✅ استيراد جميع البيانات من ملفات JSON
- ✅ تحويل أنواع البيانات بشكل صحيح (boolean, datetime, إلخ)
- ✅ إظهار ملخص العملية

---

### المرحلة 4️⃣: تحديث التطبيق ليستخدم MySQL

#### 1. تحديث ملف client
عدّل الملف `lib/db/client.ts`:

**الطريقة الأولى - التحديث الكامل (موصى بها):**
```typescript
// استبدل محتوى الملف بالكامل بـ:
import * as schema from './schema-mysql'
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'

function makeDb() {
  if (!process.env.MYSQL_HOST || !process.env.MYSQL_USER || !process.env.MYSQL_DATABASE) {
    throw new Error(
      'Database misconfiguration: MYSQL_HOST, MYSQL_USER, and MYSQL_DATABASE must be set.'
    )
  }

  const poolConnection = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  })

  return drizzle(poolConnection, { schema, mode: 'default' })
}

export const db = makeDb() as any
export type DB = typeof db
export * as dbSchema from './schema-mysql'
```

**الطريقة الثانية - التحديث التدريجي (للاختبار):**
يمكنك إضافة متغير بيئة للتبديل بين قواعد البيانات:
```typescript
// في lib/db/client.ts
function makeDb() {
  // استخدم MySQL إذا كان USE_MYSQL=true
  if (process.env.USE_MYSQL === 'true') {
    // كود MySQL...
  }
  
  // وإلا استخدم SQLite كما هو
  if (process.env.LIBSQL_URL) {
    // كود Turso الحالي...
  }
}
```

#### 2. تحديث ملف schema
استبدل استيراد schema في `lib/db/client.ts`:
```typescript
// بدلاً من
import * as schema from './schema'

// استخدم
import * as schema from './schema-mysql'
```

#### 3. تحديث drizzle.config.ts
انسخ إعدادات MySQL:
```bash
# يمكنك نسخ الملف أو تحديث الموجود
cp drizzle.config.mysql.ts drizzle.config.ts
```

---

### المرحلة 5️⃣: اختبار التطبيق

#### 1. اختبار محلي
```bash
# تأكد من أن المتغيرات البيئية صحيحة في .env
# ثم قم بتشغيل التطبيق
npm run dev
```

#### 2. التحقق من البيانات
- افتح التطبيق في المتصفح
- تحقق من:
  - ✅ عرض المشاريع والمهام
  - ✅ إنشاء مهمة جديدة
  - ✅ تحديث مهمة موجودة
  - ✅ حذف عنصر
  - ✅ تسجيل الدخول والخروج

#### 3. فحص قاعدة البيانات مباشرة
```bash
# استخدم Drizzle Studio
npx drizzle-kit studio --config=drizzle.config.mysql.ts

# أو استخدم MySQL client
mysql -u root -p demotasks
```

---

## 📊 مقارنة الأداء

### SQLite (Turso)
- ✅ سريع للقراءة
- ⚠️ محدود في الكتابة المتزامنة
- ⚠️ محدود في حجم قاعدة البيانات

### MySQL
- ✅ أفضل للكتابة المتزامنة
- ✅ يدعم قواعد بيانات كبيرة جداً
- ✅ إمكانيات متقدمة (triggers, stored procedures)
- ✅ سهولة النسخ الاحتياطي والاستعادة

---

## 🔧 استكشاف الأخطاء

### خطأ: "Cannot connect to MySQL"
**الحل:**
1. تحقق من أن MySQL يعمل: `sudo systemctl status mysql`
2. تحقق من معلومات الاتصال في `.env`
3. تحقق من أن المستخدم لديه صلاحيات: `GRANT ALL PRIVILEGES ON demotasks.* TO 'user'@'localhost';`

### خطأ: "Foreign key constraint fails"
**الحل:**
- تأكد من تشغيل سكريبت الاستيراد بالترتيب الصحيح (المستخدمين أولاً، ثم المشاريع، إلخ)
- السكريبت يعطل فحص المفاتيح الخارجية مؤقتاً، تأكد من أنه يعمل بشكل صحيح

### خطأ: "Data truncated"
**الحل:**
- تحقق من أن أحجام الحقول في schema-mysql.ts كافية
- خاصة حقول varchar - قد تحتاج لزيادة الطول

### البيانات غير مكتملة بعد الاستيراد
**الحل:**
1. افتح `scripts/migrate-to-mysql/exported-data/_export_summary.json`
2. قارن عدد الصفوف المصدرة مع المستوردة
3. أعد تشغيل سكريبت الاستيراد مع تفريغ الجداول أولاً:
```sql
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE users;
TRUNCATE TABLE projects;
-- ... إلخ
SET FOREIGN_KEY_CHECKS = 1;
```

---

## 🔐 النسخ الاحتياطي

### قبل التحويل
```bash
# احتفظ بنسخة من بيانات Turso (تم بالفعل في خطوة التصدير)
# الملفات موجودة في: scripts/migrate-to-mysql/exported-data/
```

### بعد التحويل
```bash
# إنشاء نسخة احتياطية من MySQL
mysqldump -u root -p demotasks > backup_demotasks_$(date +%Y%m%d).sql

# استعادة النسخة الاحتياطية
mysql -u root -p demotasks < backup_demotasks_20250115.sql
```

---

## 📝 ملاحظات مهمة

1. **احتفظ بـ Turso مؤقتاً**: لا تحذف قاعدة بيانات Turso فوراً. احتفظ بها لمدة أسبوع على الأقل للتأكد من نجاح التحويل.

2. **ملفات البيئة**: أنشئ `.env.backup` لحفظ إعدادات Turso القديمة:
```bash
cp .env .env.backup
```

3. **الإنتاج (Production)**: اختبر التحويل على بيئة تجريبية أولاً قبل تطبيقه على الإنتاج.

4. **الفهارس (Indexes)**: بعد اكتمال الترحيل، قد تحتاج لإضافة فهارس على الأعمدة المستخدمة في البحث:
```sql
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
```

5. **المراقبة**: راقب أداء التطبيق في الأيام الأولى بعد التحويل.

---

## ✅ Checklist النهائي

- [ ] تم تثبيت MySQL وتشغيله
- [ ] تم إنشاء قاعدة البيانات والجداول
- [ ] تم تصدير البيانات من Turso بنجاح
- [ ] تم استيراد البيانات إلى MySQL بنجاح
- [ ] تم تحديث ملفات الاتصال (client.ts و schema)
- [ ] تم تحديث متغيرات البيئة (.env)
- [ ] تم اختبار التطبيق والتحقق من البيانات
- [ ] تم إنشاء نسخة احتياطية من MySQL
- [ ] تم الاحتفاظ بنسخة من بيانات Turso
- [ ] التطبيق يعمل بدون أخطاء

---

## 🆘 الدعم

إذا واجهت أي مشاكل:
1. راجع قسم "استكشاف الأخطاء" أعلاه
2. تحقق من ملفات الـ logs
3. تأكد من أن جميع الخطوات تمت بالترتيب الصحيح

---

**تم إنشاء هذا الدليل بواسطة Cascade AI** 🤖
