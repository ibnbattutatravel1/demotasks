-- سكريبت لمسح جميع البيانات من جداول MySQL
-- استخدم هذا السكريبت إذا أردت إعادة الاستيراد

USE demotasks;

-- تعطيل فحص المفاتيح الخارجية مؤقتاً
SET FOREIGN_KEY_CHECKS = 0;

-- مسح جميع الجداول بالترتيب العكسي
TRUNCATE TABLE timesheet_entries;
TRUNCATE TABLE timesheets;
TRUNCATE TABLE notifications;
TRUNCATE TABLE attachments;
TRUNCATE TABLE comments;
TRUNCATE TABLE subtask_tags;
TRUNCATE TABLE subtasks;
TRUNCATE TABLE task_tags;
TRUNCATE TABLE task_assignees;
TRUNCATE TABLE tasks;
TRUNCATE TABLE project_tags;
TRUNCATE TABLE project_team;
TRUNCATE TABLE projects;
TRUNCATE TABLE push_subscriptions;
TRUNCATE TABLE user_settings;
TRUNCATE TABLE users;

-- إعادة تفعيل فحص المفاتيح الخارجية
SET FOREIGN_KEY_CHECKS = 1;

SELECT 'جميع الجداول تم مسحها بنجاح' as Status;
