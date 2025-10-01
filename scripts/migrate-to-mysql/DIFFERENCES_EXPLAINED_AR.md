# 🔄 الفروقات بين SQLite و MySQL في هذا المشروع

## 📊 مقارنة أنواع البيانات

### التواريخ والأوقات

**SQLite (قبل)**
```typescript
createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`)
```
- يُخزّن كـ TEXT بصيغة ISO 8601
- مثال: "2025-10-01T02:24:45"

**MySQL (بعد)**
```typescript
createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
```
- يُخزّن كـ DATETIME
- أفضل للاستعلامات والمقارنات

---

### القيم المنطقية (Boolean)

**SQLite (قبل)**
```typescript
completed: integer('completed', { mode: 'boolean' }).notNull().default(false)
```
- يُخزّن كـ INTEGER (0 أو 1)
- Drizzle يحوله تلقائياً

**MySQL (بعد)**
```typescript
completed: boolean('completed').notNull().default(false)
```
- يُخزّن كـ BOOLEAN/TINYINT
- أكثر وضوحاً وقابلية للقراءة

---

### الأعداد العشرية

**SQLite (قبل)**
```typescript
budget: real('budget')
```
- يُخزّن كـ REAL (دقة محدودة)

**MySQL (بعد)**
```typescript
budget: decimal('budget', { precision: 10, scale: 2 })
```
- يُخزّن كـ DECIMAL (دقة عالية)
- مناسب للأموال والحسابات المالية

---

### النصوص

**SQLite (قبل)**
```typescript
id: text('id').primaryKey()
name: text('name').notNull()
```
- كل شيء TEXT بدون حد للطول

**MySQL (بعد)**
```typescript
id: varchar('id', { length: 191 }).primaryKey()
name: varchar('name', { length: 255 }).notNull()
description: text('description').notNull()
```
- VARCHAR للنصوص القصيرة (مع حد)
- TEXT للنصوص الطويلة

> **ملاحظة**: 191 حرف لـ IDs لدعم الفهارس UTF8MB4

---

## 🔧 تغييرات في الاستعلامات

### لا تغييرات مطلوبة! 🎉

بفضل Drizzle ORM، جميع استعلاماتك ستعمل بدون تعديل:

```typescript
// هذا الكود يعمل مع SQLite و MySQL
const projects = await db.select().from(dbSchema.projects)

const users = await db.query.users.findMany({
  where: eq(dbSchema.users.role, 'admin')
})
```

Drizzle يترجم الاستعلامات تلقائياً!

---

## ⚙️ تغييرات في الإعدادات

### ملف client.ts

**SQLite (قبل)**
```typescript
import { createClient } from '@libsql/client'
import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql'

const client = createClient({
  url: process.env.LIBSQL_URL!,
  authToken: process.env.LIBSQL_AUTH_TOKEN,
})

return drizzleLibsql(client, { schema })
```

**MySQL (بعد)**
```typescript
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'

const poolConnection = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  connectionLimit: 10,
})

return drizzle(poolConnection, { schema, mode: 'default' })
```

---

## 🚀 مزايا MySQL مقارنة بـ SQLite

### 1. الكتابة المتزامنة
- **SQLite**: محدودة (قفل على مستوى قاعدة البيانات)
- **MySQL**: ممتازة (قفل على مستوى الصف)

### 2. الحجم
- **SQLite**: محدود (مشاكل مع قواعد البيانات الكبيرة جداً)
- **MySQL**: غير محدود عملياً

### 3. الأداء تحت ضغط عالي
- **SQLite**: ممتاز للقراءة، متوسط للكتابة
- **MySQL**: ممتاز لكليهما مع التوزيع الصحيح

### 4. النسخ الاحتياطي
- **SQLite**: يتطلب إيقاف الكتابة
- **MySQL**: يمكن عمل backup دون إيقاف الخدمة

### 5. الميزات المتقدمة
- **SQLite**: محدودة
- **MySQL**: 
  - Stored Procedures
  - Triggers متقدمة
  - Views
  - Full-text search متطور
  - Replication

### 6. التوسع (Scalability)
- **SQLite**: رأسي فقط (vertical)
- **MySQL**: رأسي وأفقي (horizontal with replication)

---

## 📈 متى تستخدم أي منهما؟

### استخدم SQLite إذا:
- ✅ تطبيق صغير أو متوسط
- ✅ عدد محدود من المستخدمين المتزامنين
- ✅ القراءة أكثر من الكتابة بكثير
- ✅ تريد بساطة في الإعداد
- ✅ تطبيق محمول أو embedded

### استخدم MySQL إذا:
- ✅ تطبيق كبير أو متنامي
- ✅ عدد كبير من المستخدمين المتزامنين
- ✅ عمليات كتابة كثيرة ومتزامنة
- ✅ تحتاج ميزات متقدمة
- ✅ تخطط للتوسع مستقبلاً
- ✅ تحتاج backup واستعادة سهلة

---

## 🔄 التحويل التلقائي للبيانات

سكريبت الاستيراد يقوم بتحويل تلقائي:

### Boolean
```typescript
// SQLite: 0, 1
// MySQL: false, true
value === 1 || value === true ? true : false
```

### Dates
```typescript
// SQLite: "2025-10-01T02:24:45"
// MySQL: Date object
new Date(value)
```

### Decimal/Real
```typescript
// SQLite: floating point
// MySQL: DECIMAL string
// Drizzle يتعامل معها تلقائياً
```

---

## ⚠️ أشياء تنتبه لها

### 1. حجم VARCHAR
MySQL يتطلب تحديد حد أقصى للطول. اخترنا:
- **191** للـ IDs (لدعم UTF8MB4 indexes)
- **255** للأسماء والعناوين القصيرة
- **500** للعناوين الطويلة
- **TEXT** للمحتوى الطويل (descriptions, content)

### 2. التوقيت
MySQL أكثر دقة في التعامل مع المناطق الزمنية. تأكد من إعداد timezone في إعدادات MySQL.

### 3. Case Sensitivity
MySQL (على Windows) غير حساس لحالة أسماء الجداول.
SQLite حساس لحالة الأحرف.

### 4. Foreign Keys
MySQL يطبق قيود المفاتيح الخارجية بشكل افتراضي (يمكن تعطيلها مؤقتاً).
SQLite يتطلب تفعيلها يدوياً.

---

## 📝 ملخص

التحويل من SQLite إلى MySQL في هذا المشروع:
- ✅ آمن ومضمون
- ✅ لا يتطلب تعديل كود التطبيق (بفضل Drizzle)
- ✅ يحسّن الأداء والقابلية للتوسع
- ✅ يوفر ميزات متقدمة
- ✅ قابل للتراجع في أي وقت
