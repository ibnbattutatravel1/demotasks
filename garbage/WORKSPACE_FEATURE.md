# 📁 Project Workspace Feature

## نظرة عامة (Overview)

تم إضافة **Workspace مخصص** لكل project يوفر:

✅ **Notes Section** - مساحة تعاونية للملاحظات (مثل Notion)  
✅ **Documents Section** - مشاركة وإدارة الملفات  
✅ **Filter System** - بحث وفلترة متقدمة  
✅ **Permission System** - نظام صلاحيات كامل  

---

## 🚀 التثبيت (Installation)

### 1. تشغيل SQL للـ Database

#### طريقة 1: MySQL Workbench
1. افتح MySQL Workbench
2. اتصل بالـ database
3. افتح ملف `scripts/workspace-tables.sql`
4. اضغط Execute (⚡)

#### طريقة 2: Command Line
```bash
mysql -u your_username -p your_database < scripts/workspace-tables.sql
```

#### طريقة 3: phpMyAdmin
1. افتح phpMyAdmin
2. اختر الـ database
3. اذهب لـ SQL tab
4. انسخ والصق محتوى `scripts/workspace-tables.sql`
5. اضغط Go

هذا سيضيف:
- جدول `project_notes` 
- جدول `project_documents`
- Indexes للأداء الأفضل

### 2. إنشاء مجلد للـ Uploads

```bash
mkdir -p public/uploads/projects
```

---

## 📋 الميزات (Features)

### 1. Notes (الملاحظات)

#### المميزات:
- ✍️ إنشاء ملاحظات بعنوان ومحتوى
- 📌 تثبيت الملاحظات المهمة (Pin)
- ✏️ تعديل الملاحظات
- 🗑️ حذف الملاحظات
- 🔍 البحث في الملاحظات
- 👤 فلترة حسب الكاتب
- ⏰ عرض تاريخ الإنشاء والتعديل

#### الصلاحيات:
- **Admin & Project Lead**: تحكم كامل في كل الملاحظات
- **Team Members**: إضافة وتعديل وحذف ملاحظاتهم فقط

### 2. Documents (المستندات)

#### المميزات:
- 📤 رفع ملفات متعددة
- 📥 تحميل الملفات
- 🗑️ حذف الملفات
- 🔍 البحث في أسماء الملفات
- 👤 فلترة حسب الرافع
- 📊 عرض حجم الملف وتاريخ الرفع

#### الصلاحيات:
- **Admin & Project Lead**: تحكم كامل في كل الملفات
- **Team Members**: رفع وحذف ملفاتهم فقط

---

## 🎯 الوصول للـ Workspace

### من صفحة Project

يوجد زرار **"Workspace"** في شريط الأدوات العلوي بجانب زرار "New Task"

### الرابط المباشر

```
/projects/[projectId]/workspace
```

---

## 🔐 نظام الصلاحيات (Permissions)

### Admin (المدير)
- ✅ الوصول لكل المشاريع
- ✅ إنشاء، تعديل، حذف أي ملاحظة
- ✅ رفع وحذف أي ملف
- ✅ تثبيت/إلغاء تثبيت الملاحظات

### Project Lead (قائد المشروع)
- ✅ الوصول لمشروعه
- ✅ إنشاء، تعديل، حذف أي ملاحظة
- ✅ رفع وحذف أي ملف
- ✅ تثبيت/إلغاء تثبيت الملاحظات

### Team Member (عضو الفريق)
- ✅ الوصول للمشاريع المشارك فيها
- ✅ إنشاء ملاحظات جديدة
- ✅ تعديل وحذف ملاحظاته فقط
- ✅ رفع ملفات جديدة
- ✅ حذف ملفاته فقط
- ❌ لا يمكن تعديل/حذف محتوى الآخرين

### غير الأعضاء
- ❌ لا يمكن الوصول للـ Workspace

---

## 📡 API Endpoints

### Notes APIs

#### GET /api/projects/[id]/notes
الحصول على كل ملاحظات المشروع

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "note_123",
      "projectId": "proj_456",
      "title": "Meeting Notes",
      "content": "Discussion points...",
      "isPinned": true,
      "createdBy": {
        "id": "user_1",
        "name": "Ahmed",
        "avatar": "/avatar.jpg",
        "initials": "AH"
      },
      "createdAt": "2025-10-22T00:00:00.000Z",
      "updatedAt": "2025-10-22T01:00:00.000Z"
    }
  ]
}
```

#### POST /api/projects/[id]/notes
إنشاء ملاحظة جديدة

**Request:**
```json
{
  "title": "New Note",
  "content": "Note content here..."
}
```

#### PATCH /api/projects/[id]/notes/[noteId]
تعديل ملاحظة

**Request:**
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "isPinned": true
}
```

#### DELETE /api/projects/[id]/notes/[noteId]
حذف ملاحظة

---

### Documents APIs

#### GET /api/projects/[id]/documents
الحصول على كل مستندات المشروع

#### POST /api/projects/[id]/documents
رفع مستندات جديدة

**Request:** FormData with `files` field

#### DELETE /api/projects/[id]/documents/[docId]
حذف مستند

---

## 🗄️ Database Schema

### Table: project_notes

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(191) | Primary Key |
| project_id | VARCHAR(191) | Foreign Key → projects |
| title | VARCHAR(500) | عنوان الملاحظة |
| content | TEXT | محتوى الملاحظة |
| is_pinned | BOOLEAN | مثبتة أم لا |
| created_by_id | VARCHAR(191) | Foreign Key → users |
| created_at | DATETIME | تاريخ الإنشاء |
| updated_at | DATETIME | تاريخ التعديل |

### Table: project_documents

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(191) | Primary Key |
| project_id | VARCHAR(191) | Foreign Key → projects |
| name | VARCHAR(500) | اسم الملف |
| size | INT | حجم الملف (bytes) |
| type | VARCHAR(100) | MIME type |
| url | VARCHAR(1000) | رابط الملف |
| uploaded_by_id | VARCHAR(191) | Foreign Key → users |
| uploaded_at | DATETIME | تاريخ الرفع |

---

## 🎨 UI Components

### صفحة Workspace

المسار: `app/projects/[id]/workspace/page.tsx`

#### المكونات الرئيسية:
1. **Header** - العنوان والأزرار
2. **Tabs** - تبديل بين Notes و Documents
3. **Filters** - بحث وفلترة
4. **Notes Grid** - عرض الملاحظات في cards
5. **Documents List** - قائمة الملفات

#### الميزات UI:
- 📱 Responsive design
- 🎨 Modern UI مع Tailwind CSS
- 🔄 Real-time updates
- ⚡ Fast loading
- 🎯 User-friendly interface

---

## 🔧 Configuration

### Environment Variables

```env
# No additional env vars needed
# Uses existing NEXT_PUBLIC_APP_URL for file URLs
```

### File Upload Settings

- **Max file size**: Configurable (default: no limit)
- **Upload location**: `public/uploads/projects/[projectId]/`
- **Supported formats**: All file types

---

## 📝 Usage Examples

### إنشاء ملاحظة جديدة

```typescript
const response = await fetch(`/api/projects/${projectId}/notes`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Sprint Planning',
    content: 'Tasks for next sprint:\n1. Feature A\n2. Feature B'
  })
})
```

### رفع ملف

```typescript
const formData = new FormData()
formData.append('files', file1)
formData.append('files', file2)

const response = await fetch(`/api/projects/${projectId}/documents`, {
  method: 'POST',
  body: formData
})
```

---

## 🐛 Troubleshooting

### المشكلة: لا يمكن الوصول للـ Workspace
**الحل:** تأكد أنك عضو في الفريق أو Project Lead أو Admin

### المشكلة: فشل رفع الملفات
**الحل:** 
1. تأكد من وجود مجلد `public/uploads/projects`
2. تأكد من صلاحيات الكتابة على المجلد

### المشكلة: الملاحظات لا تظهر
**الحل:**
1. تأكد من تشغيل Migration
2. تحقق من Console للأخطاء

---

## 🎯 Best Practices

### للـ Notes:
- ✅ استخدم عناوين واضحة
- ✅ ثبّت الملاحظات المهمة
- ✅ حدّث الملاحظات القديمة
- ✅ احذف الملاحظات غير الضرورية

### للـ Documents:
- ✅ استخدم أسماء ملفات واضحة
- ✅ نظّم الملفات حسب النوع
- ✅ احذف الملفات القديمة
- ✅ استخدم نسخ محدثة

---

## 🚀 Future Enhancements

### خطط مستقبلية:
- [ ] Rich text editor للملاحظات (مثل TipTap)
- [ ] Categories/Tags للملاحظات
- [ ] Comments على الملاحظات
- [ ] Version control للملفات
- [ ] Folder structure للملفات
- [ ] Preview للملفات
- [ ] Collaborative editing
- [ ] Notifications للتغييرات

---

## 📞 Support

للمساعدة أو الإبلاغ عن مشاكل:
1. تحقق من هذا الملف أولاً
2. راجع Console للأخطاء
3. تأكد من الصلاحيات

---

## ✨ Credits

تم التطوير بواسطة Cascade AI  
تاريخ الإضافة: 22 أكتوبر 2025

---

**🎉 استمتع باستخدام Workspace الجديد!**
