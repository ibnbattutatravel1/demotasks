# 🗄️ Workspace Tables Installation

## Quick Start (أسرع طريقة)

### نفذ الـ SQL مباشرة:

1. **افتح MySQL Workbench أو phpMyAdmin**
2. **اختر الـ database بتاعك**
3. **انسخ والصق الكود التالي:**

```sql
-- Notes Table
CREATE TABLE IF NOT EXISTS project_notes (
    id VARCHAR(191) PRIMARY KEY,
    project_id VARCHAR(191) NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_by_id VARCHAR(191) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Documents Table
CREATE TABLE IF NOT EXISTS project_documents (
    id VARCHAR(191) PRIMARY KEY,
    project_id VARCHAR(191) NOT NULL,
    name VARCHAR(500) NOT NULL,
    size INT NOT NULL,
    type VARCHAR(100) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    uploaded_by_id VARCHAR(191) NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_project_notes_project_id ON project_notes(project_id);
CREATE INDEX idx_project_notes_created_by ON project_notes(created_by_id);
CREATE INDEX idx_project_documents_project_id ON project_documents(project_id);
CREATE INDEX idx_project_documents_uploaded_by ON project_documents(uploaded_by_id);
```

4. **اضغط Execute أو Go**
5. **Done! ✅**

---

## Alternative Methods

### طريقة 1: استخدام ملف SQL جاهز

```bash
mysql -u your_username -p your_database < scripts/workspace-tables.sql
```

### طريقة 2: استخدام الملف المبسط

```bash
mysql -u your_username -p your_database < scripts/workspace-tables-simple.sql
```

---

## Verification (التحقق)

بعد التنفيذ، تأكد إن الجداول اتعملت:

```sql
SHOW TABLES LIKE 'project_%';
```

يجب تشوف:
- `project_documents`
- `project_notes`

---

## Next Steps

1. ✅ إنشاء مجلد الملفات:
   ```bash
   mkdir -p public/uploads/projects
   ```

2. ✅ شغّل السيرفر:
   ```bash
   npm run dev
   ```

3. ✅ اذهب لأي project واضغط **"Workspace"**

---

## Troubleshooting

### مشكلة: Foreign key constraint fails
**الحل:** تأكد إن جداول `projects` و `users` موجودة قبل تنفيذ الـ SQL

### مشكلة: Table already exists
**الحل:** الجداول موجودة بالفعل، لا داعي للقلق!

---

## Files في هذا المجلد:

- `workspace-tables.sql` - نسخة كاملة مع تعليقات
- `workspace-tables-simple.sql` - نسخة مبسطة
- `add-workspace-tables.ts` - TypeScript migration (اختياري)

استخدم أي ملف تفضله! 🎯
