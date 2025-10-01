# 📁 ملفات التحويل من SQLite إلى MySQL

هذا المجلد يحتوي على جميع السكريبتات والأدوات اللازمة لتحويل قاعدة البيانات من SQLite (Turso) إلى MySQL بأمان.

## 📄 الملفات

### سكريبتات التحويل الرئيسية
1. **00-setup-mysql.sql** - إنشاء قاعدة البيانات والإعدادات الأولية
2. **01-export-sqlite-data.ts** - تصدير البيانات من SQLite إلى JSON
3. **02-import-to-mysql.ts** - استيراد البيانات من JSON إلى MySQL
4. **verify-migration.ts** - التحقق من نجاح عملية الترحيل

### الأدلة الإرشادية
- **QUICK_START_AR.md** - بدء سريع (5 دقائق)
- **rollback-to-sqlite.md** - العودة إلى SQLite إذا حدثت مشاكل

### مجلد البيانات
- **exported-data/** - يحتوي على ملفات JSON للبيانات المصدرة (يتم إنشاؤه تلقائياً)

## 🚀 الاستخدام السريع

### تشغيل جميع الخطوات بأمر واحد:
```bash
npm run migrate:mysql:all
```

### أو تشغيل كل خطوة على حدة:
```bash
# 1. إنشاء الجداول في MySQL
npm run migrate:mysql:setup

# 2. تصدير البيانات من SQLite
npm run migrate:mysql:export

# 3. استيراد البيانات إلى MySQL
npm run migrate:mysql:import

# 4. التحقق من نجاح الترحيل
npm run migrate:mysql:verify
```

## 📚 للمزيد من المعلومات
راجع الدليل الكامل في: `MIGRATION_TO_MYSQL_AR.md`
