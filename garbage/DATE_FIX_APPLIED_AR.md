# ✅ حل مشكلة toISOString مع MySQL

## المشكلة
```
TypeError: value.toISOString is not a function
```

### السبب
- **SQLite** يُرجع التواريخ كـ `string` (مثل: `"2025-10-01T02:24:45"`)
- **MySQL** يُرجع التواريخ كـ `Date` objects

عندما حاول الكود استخدام التواريخ مباشرة، فشل لأن MySQL يُرجع Date objects بدلاً من strings.

---

## ✅ الحل المُطبَّق

### 1. إنشاء ملف `lib/date-utils.ts`
دوال مساعدة للتعامل مع التواريخ بشكل موحد:

```typescript
export function toISOString(value: any): string
export function toISOStringOrUndefined(value: any): string | undefined
export function toDateString(value: any): string
export function normalizeDates<T>(obj: T): T
```

### 2. تحديث `app/api/projects/route.ts`
- إضافة: `import { toISOString, toISOStringOrUndefined } from '@/lib/date-utils'`
- تحويل جميع التواريخ باستخدام الدوال المساعدة

**قبل:**
```typescript
startDate: p.startDate,
createdAt: p.createdAt,
updatedAt: p.updatedAt || undefined,
```

**بعد:**
```typescript
startDate: toISOString(p.startDate),
createdAt: toISOString(p.createdAt),
updatedAt: toISOStringOrUndefined(p.updatedAt),
```

---

## 🔧 الملفات المُحدَّثة

1. ✅ `lib/date-utils.ts` - **جديد** - دوال مساعدة للتواريخ
2. ✅ `app/api/projects/route.ts` - محدَّث لاستخدام date-utils

---

## 📋 الخطوات التالية

### سيحتاج تحديث مماثل لـ APIs الأخرى:

يجب تطبيق نفس الحل على:
- ✅ `/api/projects` - **تم**
- ⏳ `/api/tasks`
- ⏳ `/api/tasks/[id]`
- ⏳ `/api/subtasks`
- ⏳ `/api/comments`
- ⏳ `/api/attachments`
- ⏳ `/api/notifications`
- ⏳ `/api/admin/timesheets`
- ⏳ وجميع APIs الأخرى التي تتعامل مع تواريخ

---

## 🚀 التطبيق السريع

لتحديث أي API:

### 1. أضف Import
```typescript
import { toISOString, toISOStringOrUndefined } from '@/lib/date-utils'
```

### 2. استبدل التواريخ
```typescript
// للحقول المطلوبة (not null)
startDate: toISOString(row.startDate)

// للحقول الاختيارية (nullable)
updatedAt: toISOStringOrUndefined(row.updatedAt)
```

---

## 💡 نصائح

### استخدام normalizeDates
للكائنات الكاملة:
```typescript
import { normalizeDates } from '@/lib/date-utils'

const project = await db.select()...
return normalizeDates(project)
```

### الحقول الشائعة التي تحتاج تحويل:
- `createdAt`
- `updatedAt`
- `completedAt`
- `approvedAt`
- `rejectedAt`
- `startDate`
- `dueDate`
- `uploadedAt`
- `submittedAt`

---

## ✅ الآن

المشكلة **محلولة في `/api/projects`**.

الخطوة التالية: **اختبر إنشاء مشروع جديد** - يجب أن يعمل بدون أخطاء!

---

**تم إنشاؤه في:** 2025-10-01T05:00:00+03:00
