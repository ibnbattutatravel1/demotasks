# 🔧 استكشاف الأخطاء وحلولها

## ❌ أخطاء شائعة وحلولها

### 1. خطأ: "Cannot connect to MySQL server"

**الأسباب المحتملة:**
- MySQL غير مشغّل
- معلومات الاتصال خاطئة في `.env`
- الجدار الناري يمنع الاتصال

**الحلول:**
```bash
# تحقق من أن MySQL يعمل (Windows)
Get-Service MySQL* | Select-Object Name, Status

# أو حاول الاتصال يدوياً
mysql -u root -p

# تحقق من المنفذ
netstat -an | findstr 3306
```

---

### 2. خطأ: "Access denied for user"

**الأسباب:**
- كلمة المرور خاطئة
- المستخدم ليس لديه صلاحيات

**الحلول:**
```sql
-- أعد تعيين كلمة المرور
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';

-- امنح الصلاحيات
GRANT ALL PRIVILEGES ON demotasks.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

---

### 3. خطأ: "Foreign key constraint fails"

**السبب:**
ترتيب الاستيراد غير صحيح أو بيانات مفقودة

**الحل:**
```typescript
// السكريبت يعطل الفحص تلقائياً، لكن يمكنك القيام بذلك يدوياً:
```

```sql
SET FOREIGN_KEY_CHECKS = 0;
-- استورد البيانات
SET FOREIGN_KEY_CHECKS = 1;
```

---

### 4. خطأ: "Data truncated for column"

**السبب:**
البيانات أطول من الحد المسموح في VARCHAR

**الحل:**
عدّل `lib/db/schema-mysql.ts` وزد الطول:
```typescript
// من
name: varchar('name', { length: 255 })

// إلى
name: varchar('name', { length: 500 })
```

ثم أعد تشغيل:
```bash
npm run migrate:mysql:setup
```

---

### 5. خطأ: "Unknown database 'demotasks'"

**السبب:**
قاعدة البيانات غير موجودة

**الحل:**
```bash
mysql -u root -p -e "CREATE DATABASE demotasks CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

---

### 6. خطأ: "LIBSQL_URL is not set"

**السبب:**
سكريبت التصدير يحتاج معلومات Turso

**الحل:**
تأكد من وجود المتغيرات في `.env`:
```env
LIBSQL_URL=libsql://...
LIBSQL_AUTH_TOKEN=eyJ...
```

---

### 7. خطأ: "Cannot find module 'mysql2'"

**السبب:**
المكتبة غير مثبتة

**الحل:**
```bash
npm install mysql2
```

---

### 8. البيانات المستوردة غير مكتملة

**الحل:**

1. افحص تقرير التصدير:
```bash
# افتح الملف
code scripts/migrate-to-mysql/exported-data/_export_summary.json
```

2. شغّل سكريبت التحقق:
```bash
npm run migrate:mysql:verify
```

3. إذا وجدت فروقات، أعد الاستيراد:
```bash
# احذف البيانات القديمة
mysql -u root -p demotasks < scripts/migrate-to-mysql/clear-tables.sql

# أعد الاستيراد
npm run migrate:mysql:import
```

---

### 9. خطأ: "Duplicate entry for key PRIMARY"

**السبب:**
محاولة استيراد البيانات مرتين

**الحل:**
```sql
-- امسح الجداول أولاً
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE users;
TRUNCATE TABLE projects;
TRUNCATE TABLE tasks;
-- ... باقي الجداول
SET FOREIGN_KEY_CHECKS = 1;
```

أو استخدم:
```bash
mysql -u root -p demotasks -e "DROP DATABASE demotasks; CREATE DATABASE demotasks CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
npm run migrate:mysql:setup
npm run migrate:mysql:import
```

---

### 10. التطبيق لا يظهر البيانات بعد التحويل

**الأسباب المحتملة:**
- لم تحدّث `client.ts`
- المتغيرات البيئية غير صحيحة
- البيانات لم تُستورد بشكل صحيح

**الحلول:**

1. تحقق من `lib/db/client.ts`:
```typescript
// يجب أن يكون
import * as schema from './schema-mysql'
```

2. تحقق من `.env`:
```bash
# يجب أن يحتوي على
MYSQL_HOST=localhost
MYSQL_USER=root
# ... إلخ
```

3. تحقق من البيانات:
```bash
mysql -u root -p demotasks -e "SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM projects;"
```

4. أعد تشغيل التطبيق:
```bash
# أوقف التطبيق (Ctrl+C)
npm run dev
```

---

## 🧪 اختبارات التشخيص

### اختبار 1: الاتصال بـ MySQL
```bash
mysql -u root -p -e "SELECT 1 as test"
```
**النتيجة المتوقعة:** يظهر `test | 1`

### اختبار 2: وجود قاعدة البيانات
```bash
mysql -u root -p -e "SHOW DATABASES LIKE 'demotasks'"
```
**النتيجة المتوقعة:** يظهر `demotasks`

### اختبار 3: وجود الجداول
```bash
mysql -u root -p demotasks -e "SHOW TABLES"
```
**النتيجة المتوقعة:** قائمة بـ 16 جدول

### اختبار 4: عدد البيانات
```bash
npm run migrate:mysql:verify
```
**النتيجة المتوقعة:** جميع الأعمدة بها ✅

### اختبار 5: الاتصال من Node.js
```bash
node -e "const mysql = require('mysql2/promise'); mysql.createConnection({host:'localhost',user:'root',password:'your_pass',database:'demotasks'}).then(()=>console.log('✅ Connected')).catch(e=>console.log('❌',e.message))"
```

---

## 🔍 فحص متقدم

### عرض جميع الجداول مع عدد الصفوف
```sql
USE demotasks;

SELECT 
  table_name,
  table_rows
FROM information_schema.tables
WHERE table_schema = 'demotasks'
ORDER BY table_name;
```

### فحص العلاقات (Foreign Keys)
```sql
SELECT 
  TABLE_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'demotasks'
  AND REFERENCED_TABLE_NAME IS NOT NULL;
```

### فحص الفهارس
```sql
SHOW INDEX FROM users;
SHOW INDEX FROM projects;
SHOW INDEX FROM tasks;
```

---

## 📞 طلب المساعدة

إذا استمرت المشاكل:

1. **اجمع المعلومات:**
   - رسالة الخطأ الكاملة
   - محتوى `.env` (بدون كلمات المرور)
   - نتيجة `npm run migrate:mysql:verify`

2. **راجع الملفات:**
   - `MIGRATION_TO_MYSQL_AR.md` - الدليل الكامل
   - `DIFFERENCES_EXPLAINED_AR.md` - الفروقات التقنية

3. **تحقق من الـ logs:**
   ```bash
   # أثناء تشغيل التطبيق
   npm run dev 2>&1 | tee app.log
   ```

---

## 🔄 البدء من جديد

إذا أردت البدء من الصفر:

```bash
# 1. احذف قاعدة البيانات
mysql -u root -p -e "DROP DATABASE IF EXISTS demotasks"

# 2. أعد إنشاءها
mysql -u root -p < scripts/migrate-to-mysql/00-setup-mysql.sql

# 3. أعد تشغيل عملية الترحيل
npm run migrate:mysql:all

# 4. تحقق من النتائج
npm run migrate:mysql:verify
```

---

## ✅ قائمة التحقق عند حدوث مشكلة

- [ ] MySQL يعمل بشكل صحيح
- [ ] جميع المتغيرات البيئية في `.env` صحيحة
- [ ] قاعدة البيانات `demotasks` موجودة
- [ ] جميع الجداول موجودة (16 جدول)
- [ ] مكتبة `mysql2` مثبتة
- [ ] تم تحديث `lib/db/client.ts` بشكل صحيح
- [ ] البيانات تم استيرادها (تحقق من `verify-migration`)
- [ ] لا توجد أخطاء في console عند `npm run dev`
