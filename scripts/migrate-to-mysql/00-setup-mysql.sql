-- سكريبت إنشاء قاعدة بيانات MySQL وإعدادات الأداء الأساسية
-- قم بتشغيل هذا السكريبت قبل البدء في عملية الترحيل

-- إنشاء قاعدة البيانات
CREATE DATABASE IF NOT EXISTS demotasks 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE demotasks;

-- إعدادات الأداء (اختياري - حسب متطلبات السيرفر)
-- SET GLOBAL max_connections = 200;
-- SET GLOBAL innodb_buffer_pool_size = 1G;

-- إنشاء مستخدم خاص بالتطبيق (اختياري ولكن موصى به)
-- استبدل 'your_password' بكلمة مرور قوية
-- CREATE USER IF NOT EXISTS 'demotasks_user'@'%' IDENTIFIED BY 'your_password';
-- GRANT ALL PRIVILEGES ON demotasks.* TO 'demotasks_user'@'%';
-- FLUSH PRIVILEGES;

-- عرض معلومات قاعدة البيانات
SELECT 
  'Database created successfully' as Status,
  @@character_set_database as CharacterSet,
  @@collation_database as Collation;
