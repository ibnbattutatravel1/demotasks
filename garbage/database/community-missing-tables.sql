-- ============================================
-- إضافة الجداول والأعمدة المفقودة لنظام Community
-- ============================================

-- 1. إنشاء جدول community_reactions
-- ============================================
CREATE TABLE IF NOT EXISTS `community_reactions` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `post_id` VARCHAR(100) NOT NULL,
  `user_id` VARCHAR(100) NOT NULL,
  `reaction_type` ENUM('like', 'love', 'celebrate', 'support', 'insightful', 'curious') NOT NULL DEFAULT 'like',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX `idx_post_reactions` (`post_id`),
  INDEX `idx_user_reactions` (`user_id`),
  INDEX `idx_reaction_type` (`reaction_type`),
  UNIQUE KEY `unique_user_post_reaction` (`post_id`, `user_id`, `reaction_type`),
  
  CONSTRAINT `fk_reaction_post` 
    FOREIGN KEY (`post_id`) REFERENCES `community_posts`(`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  
  CONSTRAINT `fk_reaction_user` 
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. إضافة column notes لجدول community_files
-- ============================================
ALTER TABLE `community_files` 
ADD COLUMN IF NOT EXISTS `notes` TEXT NULL AFTER `description`;

-- 3. إضافة column is_approved لجدول community_posts (اختياري)
-- ============================================
ALTER TABLE `community_posts` 
ADD COLUMN IF NOT EXISTS `is_approved` BOOLEAN NOT NULL DEFAULT TRUE AFTER `is_draft`;

-- 4. إضافة column is_approved لجدول community_comments (اختياري)
-- ============================================
ALTER TABLE `community_comments` 
ADD COLUMN IF NOT EXISTS `is_approved` BOOLEAN NOT NULL DEFAULT TRUE AFTER `is_deleted`;

-- ============================================
-- تأكد من وجود الـ indexes المهمة
-- ============================================

-- Index لـ community_posts
CREATE INDEX IF NOT EXISTS `idx_posts_community` ON `community_posts`(`community_id`, `is_deleted`, `is_draft`, `is_approved`);
CREATE INDEX IF NOT EXISTS `idx_posts_author` ON `community_posts`(`author_id`);
CREATE INDEX IF NOT EXISTS `idx_posts_pinned` ON `community_posts`(`is_pinned`, `created_at`);

-- Index لـ community_comments
CREATE INDEX IF NOT EXISTS `idx_comments_post` ON `community_comments`(`post_id`, `is_deleted`);
CREATE INDEX IF NOT EXISTS `idx_comments_author` ON `community_comments`(`author_id`);

-- Index لـ community_files
CREATE INDEX IF NOT EXISTS `idx_files_community` ON `community_files`(`community_id`);
CREATE INDEX IF NOT EXISTS `idx_files_uploader` ON `community_files`(`uploaded_by`);

-- ============================================
-- تم الانتهاء ✅
-- ============================================
-- لتشغيل هذا الملف:
-- mysql -u your_username -p your_database < community-missing-tables.sql
-- أو من phpMyAdmin: استورد هذا الملف
