# سكريبت PowerShell لعمل نسخة احتياطية من MySQL على Windows

# الإعدادات
$DB_NAME = "demotasks"
$BACKUP_DIR = ".\backups"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = "$BACKUP_DIR\${DB_NAME}_backup_$TIMESTAMP.sql"

# إنشاء مجلد النسخ الاحتياطية إذا لم يكن موجوداً
if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
}

Write-Host "🔄 جاري إنشاء نسخة احتياطية..." -ForegroundColor Yellow

# عمل النسخة الاحتياطية
# ملاحظة: قد تحتاج لتعديل المسار إلى mysqldump.exe حسب التثبيت لديك
& mysqldump -u root -p $DB_NAME | Out-File -FilePath $BACKUP_FILE -Encoding UTF8

if ($LASTEXITCODE -eq 0) {
    # ضغط الملف
    Write-Host "🗜️  جاري ضغط الملف..." -ForegroundColor Yellow
    Compress-Archive -Path $BACKUP_FILE -DestinationPath "$BACKUP_FILE.zip"
    Remove-Item $BACKUP_FILE
    
    Write-Host "✅ تم إنشاء النسخة الاحتياطية بنجاح:" -ForegroundColor Green
    Write-Host "📁 $BACKUP_FILE.zip" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "لاستعادة النسخة الاحتياطية، استخدم:" -ForegroundColor Yellow
    Write-Host "Expand-Archive -Path '$BACKUP_FILE.zip' -DestinationPath '$BACKUP_DIR'" -ForegroundColor White
    Write-Host "mysql -u root -p $DB_NAME < $BACKUP_FILE" -ForegroundColor White
} else {
    Write-Host "❌ فشل إنشاء النسخة الاحتياطية" -ForegroundColor Red
}
