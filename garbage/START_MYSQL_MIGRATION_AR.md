# 🚀 ابدأ التحويل إلى MySQL الآن

## ⚡ تعليمات سريعة - 10 دقائق فقط

### الخطوة 1: تثبيت المكتبة المطلوبة
```bash
npm install mysql2
```

### الخطوة 2: تشغيل MySQL
تأكد من أن MySQL يعمل على جهازك

### الخطوة 3: إعداد قاعدة البيانات
```bash
mysql -u root -p
```
ثم نفّذ:
```sql
CREATE DATABASE demotasks CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

### الخطوة 4: إضافة معلومات الاتصال
أضف هذه الأسطر إلى ملف `.env`:
```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=demotasks
```

### الخطوة 5: تشغيل عملية الترحيل الكاملة
```bash
npm run migrate:mysql:all
```

هذا الأمر سيقوم بـ:
1. ✅ إنشاء جميع الجداول في MySQL
2. ✅ تصدير جميع البيانات من Turso
3. ✅ استيراد البيانات إلى MySQL
4. ✅ التحقق من تطابق البيانات

### الخطوة 6: تحديث ملف الاتصال
افتح `lib/db/client.ts` واستبدل **السطر الأول**:
```typescript
// من
import * as schema from './schema'

// إلى
import * as schema from './schema-mysql'
```

ثم استبدل **دالة makeDb()** بالكود التالي:
```typescript
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
```

وأضف import في أعلى الملف:
```typescript
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
```

وعدّل آخر سطر:
```typescript
export * as dbSchema from './schema-mysql'
```

### الخطوة 7: اختبار التطبيق
```bash
npm run dev
```

### الخطوة 8: التحقق
افتح التطبيق في المتصفح وتأكد من:
- ✅ ظهور جميع المشاريع والمهام
- ✅ إمكانية إنشاء مهمة جديدة
- ✅ إمكانية التعديل والحذف

---

## 🎉 تهانينا!
التطبيق الآن يستخدم MySQL بدلاً من SQLite

---

## 📚 للمزيد من التفاصيل
- **دليل كامل مفصّل**: `MIGRATION_TO_MYSQL_AR.md`
- **ملخص سريع**: `MYSQL_MIGRATION_SUMMARY_AR.md`
- **استكشاف الأخطاء**: راجع القسم المخصص في الدليل الكامل

---

## 🔙 العودة لـ SQLite
إذا واجهت مشاكل: `scripts/migrate-to-mysql/rollback-to-sqlite.md`

---

## ⚠️ ملاحظة مهمة
**لا تحذف قاعدة بيانات Turso** حتى تتأكد من استقرار التطبيق على MySQL (على الأقل أسبوع)
