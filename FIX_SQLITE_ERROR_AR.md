# 🔧 حل مشكلة SqliteError بعد التحويل إلى MySQL

## المشكلة
التطبيق لا يزال يحاول الاتصال بـ SQLite بدلاً من MySQL بعد التحويل.

## ✅ الحل (تم تطبيقه!)

تم تحديث الملفات التالية:

### 1. ✅ `lib/db/client.ts`
تم تحديثه بالكامل ليستخدم MySQL بدلاً من SQLite.

### 2. ✅ Scripts جديدة
- `npm run test:mysql` - اختبار الاتصال بـ MySQL
- `npm run create:admin:mysql` - إنشاء مستخدم أدمن

---

## 🚀 الخطوات التالية

### 1️⃣ تحقق من ملف .env

يجب أن يحتوي على:
```env
MYSQL_HOST=srv557.hstgr.io
MYSQL_PORT=3306
MYSQL_USER=u744630877_tasks
MYSQL_PASSWORD=كلمة_المرور_الحقيقية
MYSQL_DATABASE=u744630877_tasks

# اختياري - للتصدير فقط
LIBSQL_URL=libsql://...
LIBSQL_AUTH_TOKEN=eyJ...

AUTH_SECRET=ergerg ergerhjiolgkjhujfikogjhryjikgt heugyugre re
```

⚠️ **مهم**: ضع كلمة مرور MySQL الحقيقية!

### 2️⃣ اختبر الاتصال

```bash
npm run test:mysql
```

يجب أن ترى:
- ✅ نجح الاتصال بـ MySQL
- ✅ عدد الجداول: 16
- ✅ قائمة بالبيانات

### 3️⃣ أنشئ مستخدم أدمن (إذا لزم الأمر)

```bash
npm run create:admin:mysql
```

### 4️⃣ أعد تشغيل التطبيق

```bash
# أوقف التطبيق الحالي (Ctrl+C)
npm run dev
```

---

## 🔍 التحقق من النجاح

بعد تشغيل `npm run dev`، يجب أن:
- ✅ لا تظهر أخطاء `SqliteError`
- ✅ يعمل التطبيق بشكل طبيعي
- ✅ تظهر البيانات من MySQL

---

## ❌ إذا استمرت المشكلة

### تحقق من:
1. **كلمة المرور صحيحة** في `.env`
2. **الاتصال بالإنترنت** يعمل
3. **MySQL Server** يعمل على العنوان المحدد

### اختبار يدوي:
```bash
# اختبر الاتصال
npm run test:mysql

# إذا فشل، تحقق من المتغيرات
```

---

## 📋 الملفات المُحدَّثة

1. ✅ `lib/db/client.ts` - يستخدم MySQL الآن
2. ✅ `package.json` - scripts جديدة
3. ✅ `scripts/test-mysql-connection.ts` - سكريبت اختبار
4. ✅ `CHECK_ENV.md` - دليل متغيرات البيئة

---

## 💡 نصيحة

احتفظ بمتغيرات Turso في `.env` لبضعة أيام كنسخة احتياطية. يمكنك حذفها لاحقاً عندما تتأكد من استقرار MySQL.
