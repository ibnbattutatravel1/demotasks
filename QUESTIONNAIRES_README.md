# 🚀 نظام الاستبيانات - دليل التثبيت والاستخدام السريع

## ✅ التثبيت (Installation)

### 1. تشغيل SQL للـ Database

```bash
mysql -u username -p database < scripts/questionnaires-tables.sql
```

أو افتح **MySQL Workbench** / **phpMyAdmin** وشغل الـ SQL من ملف:
`scripts/questionnaires-tables.sql`

### 2. إنشاء مجلد الملفات

```bash
mkdir -p public/uploads/questionnaires
```

### 3. Done! ✅

---

## 🎯 الاستخدام السريع (Quick Start)

### للـ Admin:

#### 1. **إنشاء Questionnaire جديد**
```
Go to: /admin/questionnaires
Click: "Create Questionnaire"
Fill: Title, Description, Instructions
Select: Target Users (All / Specific / Role-based)
Set: Deadline
Add: Questions (MCQ, Text, Rating, Yes/No, File, Date, etc.)
Click: "Publish"
```

#### 2. **مراجعة الردود**
```
Go to: /admin/questionnaires
Click on questionnaire
View: All responses
Filter: By status
Select response → Review answers
Add: Feedback (normal or critical - red)
Action: Approve / Reject / Return for resubmission
```

#### 3. **عرض الإحصائيات**
```
Go to: /admin/questionnaires/[id]/stats
View: Response rate, completion time, question analysis
Export: CSV/Excel reports
```

---

### للـ Users:

#### 1. **عرض Questionnaires**
```
Go to: /questionnaires
See: Pending questionnaires (with deadline countdown)
Badge: Red notification in sidebar
```

#### 2. **ملء Questionnaire**
```
Click on questionnaire
Read: Instructions
Fill: All required questions
Save: As draft (optional)
Submit: Before deadline
```

#### 3. **مراجعة الـ Feedback**
```
Go to: /questionnaires/responses
View: Status (Approved/Rejected/Returned)
Read: Admin feedback (critical ones in RED)
Resubmit: If returned
```

---

## 📋 أنواع الأسئلة المتاحة

### ✅ الأنواع:

1. **MCQ** - اختيار واحد من متعدد
2. **Multiple Choice** - اختيار أكثر من واحد
3. **Checkbox** - قائمة checklist
4. **Text** - نص حر (قصير أو طويل)
5. **Rating** - تقييم (1-5 نجوم مثلاً)
6. **Yes/No** - نعم أو لا
7. **File Upload** - رفع ملف
8. **Date** - اختيار تاريخ

---

## 🔔 Notifications

### متى تصل Notifications؟

✅ عند نشر questionnaire جديد → جميع المستهدفين  
✅ قبل الـ deadline بـ 24 ساعة → من لم يرد  
✅ عند الموافقة على الرد → اليوزر  
✅ عند الرفض → اليوزر + السبب  
✅ عند الإرجاع للتعديل → اليوزر + Feedback  

### Badge في الـ Sidebar:
- يظهر عدد الـ Pending + Returned
- لون أحمر للـ urgent/critical

---

## 🎨 الميزات المتقدمة

### 1. **Critical Feedback**
Admin يقدر يضيف ملاحظات "حرجة" تظهر بـ **لون أحمر** لليوزر

### 2. **History & Audit**
كل action يتسجل:
- من عمل إيه
- إمتى
- ملاحظات

### 3. **Late Submissions**
- Auto-detect لو الرد جاء بعد الـ deadline
- يظهر badge "Late Submission"
- Admin يقدر يسمح أو يمنع late submissions

### 4. **Approval Workflow**
```
Pending → Draft → Submitted → Under Review → Approved/Rejected/Returned
```

### 5. **Statistics Dashboard**
- Response rate %
- Average completion time
- Question-by-question breakdown
- Export to Excel/CSV

---

## 🔐 Permissions Summary

| Feature | Admin | Project Lead | User |
|---------|-------|--------------|------|
| Create Questionnaire | ✅ | ❌ | ❌ |
| View All Responses | ✅ | ❌ | ❌ |
| Approve/Reject | ✅ | ❌ | ❌ |
| View Statistics | ✅ | ❌ | ❌ |
| Fill Questionnaire | ✅ | ✅ | ✅ |
| View Own Responses | ✅ | ✅ | ✅ |

---

## 📁 الملفات المهمة

### Database:
- `scripts/questionnaires-tables.sql` - جداول SQL

### Schema:
- `lib/db/schema-mysql.ts` - Schema definitions

### Admin Pages:
- `app/admin/questionnaires/page.tsx` - Dashboard
- `app/admin/questionnaires/new/page.tsx` - Create new (TODO)
- `app/admin/questionnaires/[id]/responses/page.tsx` - View responses (TODO)
- `app/admin/questionnaires/[id]/stats/page.tsx` - Statistics (TODO)

### User Pages:
- `app/questionnaires/page.tsx` - My questionnaires
- `app/questionnaires/[id]/page.tsx` - Fill questionnaire (TODO)
- `app/questionnaires/responses/page.tsx` - Response history (TODO)

### APIs:
- `app/api/admin/questionnaires/route.ts` - CRUD
- `app/api/admin/questionnaires/[id]/publish/route.ts` - Publish
- `app/api/questionnaires/route.ts` - User endpoints

---

## 🐛 Troubleshooting

### مشكلة: لا تظهر الـ notifications
**الحل:** تأكد من جدول `notifications` موجود في الـ database

### مشكلة: لا يمكن رفع ملفات
**الحل:** 
```bash
mkdir -p public/uploads/questionnaires
chmod 755 public/uploads/questionnaires
```

### مشكلة: الـ Badge لا يظهر في الـ Sidebar
**الحل:** سيتم إضافته في الخطوة التالية (Sidebar component update)

---

## 📊 Database Tables

تم إضافة 7 جداول جديدة:

1. `questionnaires` - الاستبيانات
2. `questionnaire_targets` - المستهدفين
3. `questionnaire_questions` - الأسئلة
4. `questionnaire_responses` - الردود
5. `questionnaire_answers` - الإجابات
6. `questionnaire_history` - التاريخ
7. `questionnaire_feedback` - التعليقات

---

## 🎯 Next Steps (TODO)

الصفحات اللي لسه محتاجة تتعمل:

### Admin:
- [ ] Create/Edit Questionnaire page with question builder
- [ ] Responses management page
- [ ] Individual response review page
- [ ] Statistics dashboard with charts
- [ ] Export functionality

### User:
- [ ] Fill questionnaire page with all question types
- [ ] Response history page
- [ ] Resubmit functionality

### Components:
- [ ] Question Builder component
- [ ] Question Renderer component (for each type)
- [ ] Feedback display component
- [ ] History timeline component
- [ ] Sidebar badge notification update

### Features:
- [ ] Email notifications
- [ ] Reminder system (24h before deadline)
- [ ] Templates system
- [ ] Bulk actions
- [ ] Advanced analytics

---

## 🎉 الخلاصة

النظام جاهز للبداية! 

✅ Database setup  
✅ Basic admin dashboard  
✅ User questionnaires page  
✅ Core APIs  
✅ Permission system  
✅ History & audit  

**Next:** أكمل باقي الصفحات والـ components حسب الأولوية! 💪

---

Created by: Cascade AI  
Date: October 22, 2025  
Version: 1.0 (Foundation)
