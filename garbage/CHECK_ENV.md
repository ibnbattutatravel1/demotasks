# ✅ تأكد من وجود هذه المتغيرات في ملف .env

يجب أن يحتوي ملف `.env` على المتغيرات التالية لكي يعمل التطبيق مع MySQL:

```env
# ========================================
# إعدادات MySQL - مطلوبة للتطبيق
# ========================================
MYSQL_HOST=srv557.hstgr.io
MYSQL_PORT=3306
MYSQL_USER=u744630877_tasks
MYSQL_PASSWORD=ضع_كلمة_المرور_الفعلية_هنا
MYSQL_DATABASE=u744630877_tasks

# ========================================
# إعدادات Turso - مطلوبة فقط للتصدير
# يمكن إزالتها بعد اكتمال الترحيل
# ========================================
LIBSQL_URL=libsql://demotasks-ibnbattutatravel1.aws-us-west-2.turso.io
LIBSQL_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTc2OTU5OTAsImlkIjoiOWVmZmI5OGUtNzhkMi00ZGUxLTlhYmUtYTdlOTk1YTczNTQzIiwicmlkIjoiN2FhZjQxYjctMWVhMS00NjNiLWFiYjEtZjVlMjQ1MTRhNTgwIn0.6uHeYOQckojsreozTaGUhaFMF8Uk4M35qwo_fQHfKK6sJWoeLGfgVPTgy_xjvGSj94YYcRiZ-HMGrsHGNhZsBw

# ========================================
# إعدادات التطبيق
# ========================================
AUTH_SECRET=ergerg ergerhjiolgkjhujfikogjhryjikgt heugyugre re
```

## ⚠️ مهم جداً:
- ضع كلمة مرور MySQL الحقيقية في `MYSQL_PASSWORD`
- لا تترك `MYSQL_PASSWORD` فارغاً
- بعد اكتمال الترحيل، يمكنك حذف `LIBSQL_URL` و `LIBSQL_AUTH_TOKEN`
