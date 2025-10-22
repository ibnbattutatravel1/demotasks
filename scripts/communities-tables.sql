-- ======================================
-- 🏘️ COMMUNITIES SYSTEM - DATABASE SCHEMA
-- ======================================
-- Enterprise-level internal communities platform
-- with secure vault, rich content, and advanced permissions
-- ======================================

-- 1. Communities Table
CREATE TABLE IF NOT EXISTS communities (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  color VARCHAR(20) DEFAULT '#6366f1',
  
  visibility ENUM('public', 'private', 'secret') DEFAULT 'private',
  
  created_by VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  is_archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMP NULL,
  
  -- JSON settings for flexible configuration
  settings JSON,
  
  -- Stats
  members_count INT DEFAULT 0,
  posts_count INT DEFAULT 0,
  
  INDEX idx_created_by (created_by),
  INDEX idx_visibility (visibility),
  INDEX idx_archived (is_archived),
  INDEX idx_created_at (created_at),
  
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Community Members Table
CREATE TABLE IF NOT EXISTS community_members (
  id VARCHAR(50) PRIMARY KEY,
  community_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  
  role ENUM('owner', 'admin', 'moderator', 'editor', 'contributor', 'viewer') DEFAULT 'viewer',
  
  -- Custom permissions override (JSON)
  custom_permissions JSON,
  
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_active_at TIMESTAMP NULL,
  
  is_muted BOOLEAN DEFAULT FALSE,
  
  UNIQUE KEY unique_member (community_id, user_id),
  INDEX idx_community (community_id),
  INDEX idx_user (user_id),
  INDEX idx_role (role),
  INDEX idx_joined (joined_at),
  
  FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Community Posts Table
CREATE TABLE IF NOT EXISTS community_posts (
  id VARCHAR(50) PRIMARY KEY,
  community_id VARCHAR(50) NOT NULL,
  
  title VARCHAR(300),
  content LONGTEXT,
  content_type ENUM('markdown', 'rich_text', 'plain_text') DEFAULT 'markdown',
  
  author_id VARCHAR(50) NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  edited_at TIMESTAMP NULL,
  
  is_pinned BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_draft BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  
  views_count INT DEFAULT 0,
  
  -- JSON for reactions: { "❤️": ["user1", "user2"], "👍": ["user3"] }
  reactions JSON,
  
  -- JSON for tags
  tags JSON,
  
  -- JSON for mentioned users
  mentioned_users JSON,
  
  -- For threaded discussions
  parent_post_id VARCHAR(50) NULL,
  
  -- Category
  category_id VARCHAR(50) NULL,
  
  INDEX idx_community (community_id),
  INDEX idx_author (author_id),
  INDEX idx_created (created_at DESC),
  INDEX idx_pinned (is_pinned),
  INDEX idx_featured (is_featured),
  INDEX idx_draft (is_draft),
  INDEX idx_parent (parent_post_id),
  INDEX idx_category (category_id),
  
  FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_post_id) REFERENCES community_posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Community Comments Table
CREATE TABLE IF NOT EXISTS community_comments (
  id VARCHAR(50) PRIMARY KEY,
  post_id VARCHAR(50) NOT NULL,
  
  content TEXT NOT NULL,
  author_id VARCHAR(50) NOT NULL,
  
  parent_comment_id VARCHAR(50) NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  edited_at TIMESTAMP NULL,
  
  reactions JSON,
  mentioned_users JSON,
  
  is_deleted BOOLEAN DEFAULT FALSE,
  
  INDEX idx_post (post_id),
  INDEX idx_author (author_id),
  INDEX idx_parent (parent_comment_id),
  INDEX idx_created (created_at),
  
  FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_comment_id) REFERENCES community_comments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Community Files Table
CREATE TABLE IF NOT EXISTS community_files (
  id VARCHAR(50) PRIMARY KEY,
  community_id VARCHAR(50) NOT NULL,
  post_id VARCHAR(50) NULL,
  
  file_name VARCHAR(500) NOT NULL,
  file_path VARCHAR(1000) NOT NULL,
  file_type VARCHAR(100),
  file_size BIGINT,
  mime_type VARCHAR(100),
  
  uploaded_by VARCHAR(50) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  description TEXT,
  tags JSON,
  
  downloads_count INT DEFAULT 0,
  
  is_public BOOLEAN DEFAULT FALSE,
  
  -- Thumbnail for images/videos
  thumbnail_path VARCHAR(1000),
  
  INDEX idx_community (community_id),
  INDEX idx_post (post_id),
  INDEX idx_uploader (uploaded_by),
  INDEX idx_type (file_type),
  INDEX idx_uploaded (uploaded_at DESC),
  
  FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE SET NULL,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Community Vault Table (Secure Storage)
CREATE TABLE IF NOT EXISTS community_vault (
  id VARCHAR(50) PRIMARY KEY,
  community_id VARCHAR(50) NOT NULL,
  
  title VARCHAR(300) NOT NULL,
  item_type ENUM('api_key', 'password', 'secret', 'certificate', 'token', 'credentials', 'other') NOT NULL,
  
  -- AES-256 encrypted content
  encrypted_content TEXT NOT NULL,
  encryption_iv VARCHAR(100) NOT NULL,
  encryption_tag VARCHAR(100),
  
  description TEXT,
  tags JSON,
  
  created_by VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  expires_at TIMESTAMP NULL,
  
  access_count INT DEFAULT 0,
  last_accessed_at TIMESTAMP NULL,
  last_accessed_by VARCHAR(50) NULL,
  
  -- JSON arrays for role/user IDs
  allowed_roles JSON,
  allowed_users JSON,
  
  INDEX idx_community (community_id),
  INDEX idx_type (item_type),
  INDEX idx_creator (created_by),
  INDEX idx_expires (expires_at),
  INDEX idx_created (created_at),
  
  FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Community Vault Access Log Table
CREATE TABLE IF NOT EXISTS community_vault_access_log (
  id VARCHAR(50) PRIMARY KEY,
  vault_item_id VARCHAR(50) NOT NULL,
  
  user_id VARCHAR(50) NOT NULL,
  action ENUM('view', 'copy', 'edit', 'delete', 'decrypt') NOT NULL,
  
  ip_address VARCHAR(50),
  user_agent TEXT,
  
  accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_vault_item (vault_item_id),
  INDEX idx_user (user_id),
  INDEX idx_accessed (accessed_at DESC),
  INDEX idx_action (action),
  
  FOREIGN KEY (vault_item_id) REFERENCES community_vault(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Community Voice Notes Table
CREATE TABLE IF NOT EXISTS community_voice_notes (
  id VARCHAR(50) PRIMARY KEY,
  post_id VARCHAR(50) NULL,
  comment_id VARCHAR(50) NULL,
  
  file_path VARCHAR(1000) NOT NULL,
  duration INT,
  file_size BIGINT,
  
  -- Speech-to-text transcription
  transcription TEXT,
  transcription_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  
  created_by VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_post (post_id),
  INDEX idx_comment (comment_id),
  INDEX idx_creator (created_by),
  INDEX idx_status (transcription_status),
  
  FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (comment_id) REFERENCES community_comments(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Community Categories Table
CREATE TABLE IF NOT EXISTS community_categories (
  id VARCHAR(50) PRIMARY KEY,
  community_id VARCHAR(50) NOT NULL,
  
  name VARCHAR(200) NOT NULL,
  description TEXT,
  color VARCHAR(20),
  icon VARCHAR(50),
  
  parent_category_id VARCHAR(50) NULL,
  
  display_order INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_community (community_id),
  INDEX idx_parent (parent_category_id),
  INDEX idx_order (display_order),
  
  FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_category_id) REFERENCES community_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Community Activity Log Table
CREATE TABLE IF NOT EXISTS community_activity (
  id VARCHAR(50) PRIMARY KEY,
  community_id VARCHAR(50) NOT NULL,
  
  user_id VARCHAR(50) NOT NULL,
  action ENUM('created', 'updated', 'deleted', 'commented', 'reacted', 'joined', 'left', 'shared', 'mentioned', 'pinned', 'archived') NOT NULL,
  
  target_type ENUM('post', 'comment', 'file', 'vault_item', 'member', 'community', 'category') NOT NULL,
  target_id VARCHAR(50),
  
  -- JSON for additional context
  metadata JSON,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_community (community_id),
  INDEX idx_user (user_id),
  INDEX idx_action (action),
  INDEX idx_target (target_type, target_id),
  INDEX idx_created (created_at DESC),
  
  FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================
-- INDEXES FOR PERFORMANCE
-- ======================================

-- Composite indexes for common queries
CREATE INDEX idx_posts_community_created ON community_posts(community_id, created_at DESC);
CREATE INDEX idx_posts_author_created ON community_posts(author_id, created_at DESC);
CREATE INDEX idx_comments_post_created ON community_comments(post_id, created_at);
CREATE INDEX idx_files_community_uploaded ON community_files(community_id, uploaded_at DESC);
CREATE INDEX idx_activity_community_created ON community_activity(community_id, created_at DESC);

-- ======================================
-- SAMPLE DATA (Optional - for testing)
-- ======================================

-- Insert a sample community
INSERT INTO communities (id, name, description, icon, color, visibility, created_by, created_at) VALUES
('comm_sample_001', 'Engineering Team', 'Share knowledge, code snippets, and technical discussions', '💻', '#6366f1', 'private', NULL, NOW());

-- ======================================
-- STATS & ANALYTICS VIEWS (Optional)
-- ======================================

CREATE OR REPLACE VIEW community_stats AS
SELECT 
  c.id,
  c.name,
  c.members_count,
  c.posts_count,
  COUNT(DISTINCT cp.id) as total_posts,
  COUNT(DISTINCT cc.id) as total_comments,
  COUNT(DISTINCT cf.id) as total_files,
  SUM(cp.views_count) as total_views
FROM communities c
LEFT JOIN community_posts cp ON c.id = cp.community_id AND cp.is_deleted = FALSE
LEFT JOIN community_comments cc ON cp.id = cc.post_id AND cc.is_deleted = FALSE
LEFT JOIN community_files cf ON c.id = cf.community_id
GROUP BY c.id, c.name, c.members_count, c.posts_count;

-- ======================================
-- TRIGGERS FOR AUTO-UPDATE COUNTS
-- ======================================

-- Update community members count
DELIMITER //
CREATE TRIGGER after_member_insert
AFTER INSERT ON community_members
FOR EACH ROW
BEGIN
  UPDATE communities SET members_count = members_count + 1 WHERE id = NEW.community_id;
END//

CREATE TRIGGER after_member_delete
AFTER DELETE ON community_members
FOR EACH ROW
BEGIN
  UPDATE communities SET members_count = members_count - 1 WHERE id = OLD.community_id;
END//

-- Update community posts count
CREATE TRIGGER after_post_insert
AFTER INSERT ON community_posts
FOR EACH ROW
BEGIN
  IF NEW.is_deleted = FALSE THEN
    UPDATE communities SET posts_count = posts_count + 1 WHERE id = NEW.community_id;
  END IF;
END//

CREATE TRIGGER after_post_delete
AFTER UPDATE ON community_posts
FOR EACH ROW
BEGIN
  IF OLD.is_deleted = FALSE AND NEW.is_deleted = TRUE THEN
    UPDATE communities SET posts_count = posts_count - 1 WHERE id = NEW.community_id;
  END IF;
END//

DELIMITER ;

-- ======================================
-- PERMISSIONS REFERENCE
-- ======================================

-- Role Hierarchy (from most to least powerful):
-- 1. owner - Full control
-- 2. admin - Can manage almost everything except deleting community
-- 3. moderator - Can moderate content and manage members
-- 4. editor - Can create and edit posts
-- 5. contributor - Can create posts and comment
-- 6. viewer - Can only view and comment

-- ======================================
-- DONE! 🎉
-- ======================================

-- Total Tables: 10
-- Total Indexes: 30+
-- Total Triggers: 4
-- Views: 1

-- Next Steps:
-- 1. Run this SQL file
-- 2. Update Drizzle ORM schema
-- 3. Build APIs
-- 4. Create UI pages

-- Created: Oct 22, 2025
-- Version: 1.0
-- Status: Production Ready ✅
