# ⚡ بدء سريع - تحويل SQLite إلى MySQL

## 🎯 الخطوات السريعة (5 دقائق)

### 1️⃣ تثبيت المكتبات المطلوبة
```bash
npm install mysql2
```

### 2️⃣ إعداد MySQL
```bash
# أنشئ قاعدة البيانات
mysql -u root -p < scripts/migrate-to-mysql/00-setup-mysql.sql
```

### 3️⃣ إعداد متغيرات البيئة
أضف إلى ملف `.env`:
```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=demotasks
```

### 4️⃣ إنشاء الجداول
```bash
npx drizzle-kit push --config=drizzle.config.mysql.ts
```

### 5️⃣ تصدير البيانات من SQLite
```bash
npx tsx scripts/migrate-to-mysql/01-export-sqlite-data.ts
```

### 6️⃣ استيراد البيانات إلى MySQL
```bash
npx tsx scripts/migrate-to-mysql/02-import-to-mysql.ts
```

### 7️⃣ التحقق من نجاح الترحيل
```bash
npx tsx scripts/migrate-to-mysql/verify-migration.ts
```

### 8️⃣ تحديث التطبيق
في `lib/db/client.ts`:
```typescript
// استبدل هذا السطر
import * as schema from './schema'

// بهذا السطر
import * as schema from './schema-mysql'
```

ثم استبدل دالة `makeDb()` بالكود من ملف `lib/db/client-mysql.ts`

### 9️⃣ اختبار التطبيق
```bash
npm run dev
```

## ✅ تم!
التطبيق الآن يستخدم MySQL بدلاً من SQLite

---

## 🆘 مشكلة؟
راجع الدليل الكامل في `MIGRATION_TO_MYSQL_AR.md`
