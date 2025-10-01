#!/bin/bash
# سكريبت لعمل نسخة احتياطية من قاعدة بيانات MySQL

# الإعدادات
DB_NAME="demotasks"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_backup_$TIMESTAMP.sql"

# إنشاء مجلد النسخ الاحتياطية إذا لم يكن موجوداً
mkdir -p "$BACKUP_DIR"

# عمل النسخة الاحتياطية
echo "🔄 جاري إنشاء نسخة احتياطية..."
mysqldump -u root -p "$DB_NAME" > "$BACKUP_FILE"

# ضغط الملف
echo "🗜️  جاري ضغط الملف..."
gzip "$BACKUP_FILE"

echo "✅ تم إنشاء النسخة الاحتياطية بنجاح:"
echo "📁 $BACKUP_FILE.gz"
echo ""
echo "لاستعادة النسخة الاحتياطية، استخدم:"
echo "gunzip $BACKUP_FILE.gz"
echo "mysql -u root -p $DB_NAME < $BACKUP_FILE"
