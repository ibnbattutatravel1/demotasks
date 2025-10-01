# 📋 نظام إدارة المشاريع والمهام - DemoTasks

نظام شامل لإدارة المشاريع والمهام مبني بـ Next.js و TypeScript و Drizzle ORM.

---

## 🗄️ قواعد البيانات المدعومة

يدعم المشروع الآن:
- ✅ **SQLite** (Turso) - افتراضياً
- ✅ **MySQL** - مع أدوات تحويل كاملة

---

## 🔄 التحويل من SQLite إلى MySQL

إذا كنت تريد التحويل إلى MySQL، راجع:

### 📚 الأدلة المتوفرة:
1. **[START_MYSQL_MIGRATION_AR.md](./START_MYSQL_MIGRATION_AR.md)** - ابدأ هنا! (10 دقائق)
2. **[MYSQL_MIGRATION_SUMMARY_AR.md](./MYSQL_MIGRATION_SUMMARY_AR.md)** - ملخص شامل
3. **[MIGRATION_TO_MYSQL_AR.md](./MIGRATION_TO_MYSQL_AR.md)** - الدليل الكامل المفصّل

### ⚡ بدء سريع:
```bash
# 1. تثبيت المكتبة
npm install mysql2

# 2. إعداد MySQL
mysql -u root -p < scripts/migrate-to-mysql/00-setup-mysql.sql

# 3. إضافة معلومات الاتصال في .env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=demotasks

# 4. تشغيل عملية الترحيل الكاملة
npm run migrate:mysql:all
```

---

## 🚀 البدء السريع

### المتطلبات
- Node.js 18 أو أحدث
- npm 9 أو أحدث

### التثبيت
```bash
# استنساخ المشروع
git clone <repo-url>
cd demotasks

# تثبيت المكتبات
npm install

# إعداد متغيرات البيئة
cp .env.example .env
# عدّل .env بمعلومات قاعدة البيانات

# تشغيل التطبيق
npm run dev
```

---

## 📦 السكريبتات المتاحة

### التطوير
```bash
npm run dev          # تشغيل بيئة التطوير
npm run build        # بناء للإنتاج
npm run start        # تشغيل نسخة الإنتاج
npm run lint         # فحص الكود
```

### قاعدة البيانات (SQLite)
```bash
npm run db:generate  # إنشاء migrations
npm run db:migrate   # تطبيق migrations
npm run db:studio    # فتح Drizzle Studio
```

### التحويل إلى MySQL
```bash
npm run migrate:mysql:all      # تشغيل جميع الخطوات
npm run migrate:mysql:setup    # إنشاء الجداول
npm run migrate:mysql:export   # تصدير البيانات
npm run migrate:mysql:import   # استيراد البيانات
npm run migrate:mysql:verify   # التحقق من النتائج
npm run db:studio:mysql        # فتح Studio لـ MySQL
```

---

## 🏗️ البنية

```
demotasks/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── admin/             # صفحات الإدارة
│   └── ...
├── components/            # React Components
├── lib/
│   ├── db/
│   │   ├── schema.ts           # SQLite Schema
│   │   ├── schema-mysql.ts     # MySQL Schema
│   │   ├── client.ts           # SQLite Client
│   │   └── client-mysql.ts     # MySQL Client
│   └── ...
├── scripts/
│   └── migrate-to-mysql/  # أدوات التحويل إلى MySQL
├── drizzle.config.ts          # إعدادات SQLite
├── drizzle.config.mysql.ts    # إعدادات MySQL
└── ...
```

---

## 🎯 الميزات

- ✅ إدارة المشاريع والمهام
- ✅ نظام المهام الفرعية (Subtasks)
- ✅ التعليقات والمرفقات
- ✅ الإشعارات
- ✅ إدارة الفرق
- ✅ نظام الموافقات
- ✅ تتبع الوقت (Timesheets)
- ✅ لوحة تحكم تحليلية
- ✅ دعم SQLite و MySQL

---

## 📖 التوثيق

### عام
- [README_PERFORMANCE.md](./README_PERFORMANCE.md) - تحسينات الأداء

### التحويل إلى MySQL
- [START_MYSQL_MIGRATION_AR.md](./START_MYSQL_MIGRATION_AR.md) - بدء سريع
- [MYSQL_MIGRATION_SUMMARY_AR.md](./MYSQL_MIGRATION_SUMMARY_AR.md) - الملخص
- [MIGRATION_TO_MYSQL_AR.md](./MIGRATION_TO_MYSQL_AR.md) - الدليل الكامل
- [scripts/migrate-to-mysql/](./scripts/migrate-to-mysql/) - السكريبتات والأدوات

---

## 🛠️ التقنيات المستخدمة

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Database**: SQLite (Turso) / MySQL
- **ORM**: Drizzle ORM
- **UI**: React 19 + Tailwind CSS + shadcn/ui
- **Forms**: React Hook Form + Zod
- **Authentication**: JWT (Jose)
- **Icons**: Lucide React

---

## 📄 الترخيص

هذا المشروع مفتوح المصدر.

---

## 🆘 الدعم

للمساعدة في التحويل إلى MySQL:
- راجع [TROUBLESHOOTING_AR.md](./scripts/migrate-to-mysql/TROUBLESHOOTING_AR.md)
- اطلع على [COMMANDS_REFERENCE.md](./scripts/migrate-to-mysql/COMMANDS_REFERENCE.md)

---

**تم بواسطة: Cascade AI** 🤖
