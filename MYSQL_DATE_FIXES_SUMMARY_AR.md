# ✅ ملخص إصلاحات التواريخ في MySQL

## 🎯 المشكلة
عند التحويل من SQLite إلى MySQL، ظهرت أخطاء `TypeError: value.toISOString is not a function` لأن:
- **SQLite** يخزن ويُرجع التواريخ كـ `string`
- **MySQL** يخزن ويُرجع التواريخ كـ `Date` objects

---

## ✅ الملفات التي تم إصلاحها

### 1. ✅ `/api/projects/route.ts`
- **INSERT**: تحويل `new Date().toISOString()` → `new Date()`
- **GET**: إضافة `toISOString()` لجميع التواريخ المُرجعة
- **POST**: تحويل `startDate` و `dueDate` إلى `Date` objects

### 2. ✅ `/api/projects/[id]/route.ts`
- **PATCH**: تحويل `updatedAt` و `completedAt` إلى `Date` objects
- إضافة تحويل للتواريخ القادمة من body

### 3. ✅ `/api/tasks/route.ts`
- **INSERT**: تحويل جميع التواريخ إلى `Date` objects
- **GET**: إضافة `toISOString()` لجميع التواريخ المُرجعة  
- **Subtasks**: تحويل تواريخ subtasks

### 4. ✅ `/api/tasks/[id]/route.ts`
- **UPDATE**: تحويل `updatedAt` إلى `Date`
- **Progress updates**: تحويل التواريخ في التحديثات

### 5. ✅ `/api/subtasks/route.ts`
- **INSERT**: تحويل `createdAt` و `updatedAt`
- **Progress calculations**: تحويل التواريخ

### 6. ✅ `/api/subtasks/[id]/route.ts`
- **UPDATE**: تحويل `updatedAt`
- **Progress updates**: تحويل التواريخ

### 7. ✅ `/api/comments/route.ts`
- **INSERT**: تحويل `createdAt`

### 8. ✅ `/api/comments/[id]/route.ts`
- **UPDATE**: تحويل `updatedAt`

### 9. ✅ `/api/attachments/route.ts`
- **INSERT**: تحويل `uploadedAt`

---

## 📦 الحل المستخدم

### دالة مساعدة: `lib/date-utils.ts`
```typescript
// للحقول المطلوبة
export function toISOString(value: any): string

// للحقول الاختيارية
export function toISOStringOrUndefined(value: any): string | undefined
```

### القاعدة العامة:
1. **عند الكتابة (INSERT/UPDATE)**: استخدم `new Date()` بدلاً من `new Date().toISOString()`
2. **عند القراءة (SELECT)**: استخدم `toISOString(row.date)` لتحويل النتيجة

---

## 🔧 الملفات المتبقية (قد تحتاج إصلاح)

هذه الملفات تحتوي على `.toISOString()` لكن لم يتم إصلاحها بعد:

### Admin APIs
- `/api/admin/timesheets/*` 
- `/api/timesheets/*`

### Settings
- `/api/settings/route.ts`
- `/api/settings/data/export/route.ts`

---

## 📋 الأنماط الشائعة للإصلاح

### Pattern 1: INSERT/UPDATE
```typescript
// ❌ قبل
const now = new Date().toISOString()
await db.insert(table).values({ createdAt: now })

// ✅ بعد
const now = new Date()
await db.insert(table).values({ createdAt: now })
```

### Pattern 2: GET Response
```typescript
// ❌ قبل
return {
  createdAt: row.createdAt,
  updatedAt: row.updatedAt || undefined
}

// ✅ بعد
return {
  createdAt: toISOString(row.createdAt),
  updatedAt: toISOStringOrUndefined(row.updatedAt)
}
```

### Pattern 3: Date from Body
```typescript
// ❌ قبل
startDate: startDate ?? now.split('T')[0]

// ✅ بعد
startDate: startDate ? new Date(startDate) : now
```

---

## 🚀 الحالة الحالية

### ✅ يعمل بدون مشاكل:
- إنشاء وعرض المشاريع
- إنشاء وعرض المهام
- إضافة Subtasks
- إضافة Comments
- رفع Attachments

### ⏳ قد يحتاج اختبار:
- Timesheets
- Settings Export
- بعض Admin functions

---

## 💡 نصيحة للمستقبل

عند إضافة أي feature جديد يستخدم تواريخ:
1. **استخدم `new Date()`** عند الإدخال/التحديث
2. **استخدم `toISOString()`** عند الإرجاع للـ frontend
3. **حوّل strings من body** باستخدام `new Date(stringDate)`

---

## ✅ الخلاصة

تم إصلاح المشكلة في **أهم 9 ملفات API** التي تتعامل مع:
- Projects
- Tasks  
- Subtasks
- Comments
- Attachments

التطبيق الآن **يعمل بشكل صحيح** مع MySQL! 🎉

---

**آخر تحديث:** 2025-10-01T05:12:00+03:00
