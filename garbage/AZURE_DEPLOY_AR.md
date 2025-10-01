# دليل نشر المشروع على Azure (بالعربي)

## 📋 نظرة عامة
مشروعك هو تطبيق **Next.js** يستخدم قاعدة بيانات SQLite/LibSQL. عندك **3 خيارات** للنشر على Azure:

---

## ⚡ الخيار 1: Azure Static Web Apps (الأسهل والأرخص) - **موصى به**

### ✅ المميزات:
- **مجاني تماماً** للمشاريع الصغيرة والمتوسطة
- سهل جداً في الإعداد (دقائق معدودة)
- يتصل تلقائياً مع GitHub
- SSL مجاني (HTTPS)
- **الأنسب لمشروع Next.js**

### ⚠️ العيوب:
- محدود في حجم الملفات والـ API routes
- مش مناسب للتطبيقات الضخمة جداً

### 📝 خطوات التنفيذ:

#### 1. رفع المشروع على GitHub
```bash
# لو ما عملتش كده
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/your-repo.git
git push -u origin main
```

#### 2. إنشاء Static Web App من Azure Portal
1. سجل دخول على [portal.azure.com](https://portal.azure.com)
2. اضغط **"Create a resource"**
3. ابحث عن **"Static Web Apps"**
4. اختر **Free plan**
5. املأ التفاصيل:
   - **Subscription**: اختر اشتراكك
   - **Resource Group**: اعمل واحد جديد (مثلاً: `taskara-rg`)
   - **Name**: اسم المشروع (مثلاً: `taskara-app`)
   - **Region**: اختر أقرب منطقة لك
   - **Source**: اختار GitHub
6. اربط حساب GitHub وحدد الـ repository
7. **Build Presets**: اختار **Next.js**
8. **App location**: `/`
9. **Output location**: `out` أو `.next`

#### 3. إعداد قاعدة البيانات
لازم تستخدم **قاعدة بيانات خارجية** لأن Static Web Apps مش بتدعم SQLite محلياً:

**الخيار الأفضل: Turso (LibSQL)**
```bash
# تثبيت Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# إنشاء قاعدة بيانات
turso db create taskara-db

# الحصول على رابط الاتصال
turso db show taskara-db

# إنشاء token
turso db tokens create taskara-db
```

#### 4. إضافة Environment Variables في Azure
في Azure Portal → Static Web Apps → Configuration → Environment Variables:
```
AUTH_SECRET=أي_نص_عشوائي_طويل_هنا
LIBSQL_URL=libsql://your-db-url.turso.io
LIBSQL_AUTH_TOKEN=your_turso_token_here
```

#### 5. تهيئة قاعدة البيانات
```bash
# استخدم Turso CLI لتطبيق المخططات
turso db shell taskara-db < drizzle/0000_curved_cerebro.sql
turso db shell taskara-db < scripts/001_create_projects_tasks_schema.sql
turso db shell taskara-db < scripts/002_create_triggers_and_functions.sql
turso db shell taskara-db < scripts/003_seed_sample_data.sql
```

---

## 🖥️ الخيار 2: Azure Virtual Machine (الأكثر مرونة)

### ✅ المميزات:
- **تحكم كامل** في السيرفر
- يمكنك استخدام SQLite المحلية
- مناسب للتطبيقات المعقدة
- يمكنك تثبيت أي برامج تحتاجها

### ⚠️ العيوب:
- **غالي** (من $10-50 شهرياً حسب المواصفات)
- يحتاج صيانة ومتابعة
- لازم تعرف Linux/Windows Server شوية
- **مش ضروري لمشروعك** (الخيار 1 كافي)

### 📝 خطوات التنفيذ:

#### 1. إنشاء Virtual Machine
1. في Azure Portal → **Create a resource** → **Virtual Machine**
2. اختر المواصفات:
   - **Image**: Ubuntu 22.04 LTS (الأنسب)
   - **Size**: B1s أو B2s (كافي لمشروعك)
   - **Authentication**: SSH public key
3. في **Networking**: افتح الـ ports: 80 (HTTP) و 443 (HTTPS) و 22 (SSH)
4. اضغط **Create**

#### 2. الاتصال بالـ VM
```bash
# من جهازك (PowerShell أو CMD)
ssh azureuser@your-vm-ip
```

#### 3. تثبيت البيئة المطلوبة
```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# تثبيت Git
sudo apt install -y git

# تثبيت PM2 (لإدارة التطبيق)
sudo npm install -g pm2

# تثبيت Nginx (reverse proxy)
sudo apt install -y nginx
```

#### 4. رفع المشروع على الـ VM
```bash
# استنساخ المشروع
cd /var/www
sudo git clone https://github.com/username/your-repo.git taskara
cd taskara

# تثبيت الحزم
sudo npm install

# إنشاء ملف البيئة
sudo nano .env
```

في ملف `.env` ضع:
```env
AUTH_SECRET=your_random_secret_here
SQLITE_PATH=./sqlite/data.db
NODE_ENV=production
```

#### 5. بناء المشروع
```bash
# بناء المشروع
sudo npm run build

# تهيئة قاعدة البيانات
sudo npm run db:migrate
```

#### 6. تشغيل المشروع مع PM2
```bash
# تشغيل التطبيق
sudo pm2 start npm --name "taskara" -- start

# جعله يعمل تلقائياً عند إعادة التشغيل
sudo pm2 startup
sudo pm2 save
```

#### 7. إعداد Nginx كـ Reverse Proxy
```bash
sudo nano /etc/nginx/sites-available/taskara
```

أضف هذا:
```nginx
server {
    listen 80;
    server_name your-vm-ip-or-domain;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

فعّل الإعدادات:
```bash
sudo ln -s /etc/nginx/sites-available/taskara /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## ☁️ الخيار 3: Azure App Service (الوسط بين البساطة والمرونة)

### ✅ المميزات:
- سهل الإعداد (أسهل من VM)
- صيانة تلقائية
- Auto-scaling متاح
- يدعم CI/CD مع GitHub

### ⚠️ العيوب:
- أغلى من Static Web Apps (من $13 شهرياً)
- SQLite محلية غير موصى بها (استخدم Turso)

### 📝 خطوات التنفيذ:

#### 1. إنشاء App Service
1. Azure Portal → **Create a resource** → **App Service**
2. املأ التفاصيل:
   - **Name**: اسم فريد (مثلاً: `taskara-app-xyz`)
   - **Runtime**: Node.js 20 LTS
   - **Region**: اختر الأقرب
   - **Pricing**: B1 Basic (أرخص خيار مناسب)
3. اضغط **Create**

#### 2. ربط مع GitHub
1. في App Service → **Deployment Center**
2. اختر **GitHub**
3. وافق على الصلاحيات
4. حدد الـ repository والـ branch

#### 3. إعداد Environment Variables
في App Service → **Configuration** → **Application settings**:
```
AUTH_SECRET=your_secret
LIBSQL_URL=your_turso_url
LIBSQL_AUTH_TOKEN=your_turso_token
SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

#### 4. إعداد Startup Command
في **Configuration** → **General settings** → **Startup Command**:
```bash
npm run start
```

#### 5. إعداد قاعدة البيانات مع Turso
(نفس خطوات الخيار 1 - قسم قاعدة البيانات)

---

## 🎯 التوصية النهائية

### للمبتدئين (أنت) → استخدم **الخيار 1: Azure Static Web Apps**
**لماذا؟**
- مجاني 100%
- سهل الإعداد
- يتوافق تماماً مع مشروعك (Next.js)
- مناسب للمشاريع الصغيرة والمتوسطة

### متى تستخدم Virtual Machine؟
- عندك تطبيقات معقدة جداً
- تحتاج تثبيت برامج خاصة
- تحتاج تحكم كامل في السيرفر
- **مش حالتك حالياً**

---

## 🔍 مقارنة سريعة

| الميزة | Static Web Apps | App Service | Virtual Machine |
|--------|----------------|-------------|-----------------|
| **السعر** | مجاني | من $13/شهر | من $10/شهر |
| **السهولة** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **المرونة** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **الصيانة** | تلقائية | تلقائية | يدوية |
| **مناسب لـ Next.js** | ✅ جداً | ✅ نعم | ✅ نعم |
| **قاعدة البيانات** | خارجية (Turso) | خارجية (Turso) | محلية أو خارجية |

---

## 🚀 ابدأ من هنا (خطوة بخطوة)

### الخطوة 1: ارفع مشروعك على GitHub (لو ما عملتش كده)
```bash
git init
git add .
git commit -m "Initial commit"
# أنشئ repository على GitHub أولاً، ثم:
git remote add origin https://github.com/username/repo.git
git push -u origin main
```

### الخطوة 2: افتح حساب Turso (مجاني)
```bash
# ثبت Turso CLI
# للويندوز (PowerShell):
irm get.tur.so/install.ps1 | iex

# أنشئ قاعدة بيانات
turso auth signup
turso db create taskara-db
turso db show taskara-db
turso db tokens create taskara-db
```

احفظ الـ URL والـ Token!

### الخطوة 3: روح على Azure Portal
1. [portal.azure.com](https://portal.azure.com)
2. Create a resource
3. ابحث عن **Static Web Apps**
4. اتبع الخطوات في **الخيار 1** فوق

### الخطوة 4: شغل قاعدة البيانات
```bash
turso db shell taskara-db < drizzle/0000_curved_cerebro.sql
turso db shell taskara-db < scripts/001_create_projects_tasks_schema.sql
turso db shell taskara-db < scripts/002_create_triggers_and_functions.sql
```

### الخطوة 5: استمتع! 🎉
موقعك هيكون شغال على رابط زي:
`https://taskara-app.azurestaticapps.net`

---

## 🆘 مشاكل شائعة وحلولها

### المشكلة: "Build failed"
**الحل**: تأكد إن الـ environment variables موجودة في Azure

### المشكلة: "Database connection failed"
**الحل**: تأكد من صحة `LIBSQL_URL` و `LIBSQL_AUTH_TOKEN`

### المشكلة: "Cannot find module..."
**الحل**: تأكد إن `package.json` فيه كل الحزم المطلوبة

---

## 📞 محتاج مساعدة؟

لو عندك أي سؤال أو حصلت مشكلة، قولي بالظبط إيه المشكلة وهساعدك!

---

## 💰 الخلاصة عن التكلفة

### استخدام مجاني 100%:
- ✅ Azure Static Web Apps (Free tier)
- ✅ Turso Database (500 MB مجاناً)
- ✅ GitHub (مجاني)

**يعني مشروعك يشتغل على Azure بدون أي مصاريف!** 🎉
