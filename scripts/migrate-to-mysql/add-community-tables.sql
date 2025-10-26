-- ======================================
-- Add Community Tables to MySQL
-- ======================================
-- Run this on production MySQL database to add missing community tables
-- ======================================

-- 1. Communities Table
CREATE TABLE IF NOT EXISTS communities (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  color VARCHAR(20) DEFAULT '#6366f1',
  visibility VARCHAR(10) DEFAULT 'private',
  created_by VARCHAR(191),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_archived BOOLEAN DEFAULT FALSE,
  archived_at DATETIME NULL,
  settings JSON,
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
  user_id VARCHAR(191) NOT NULL,
  role VARCHAR(20) DEFAULT 'viewer',
  custom_permissions JSON,
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_active_at DATETIME NULL,
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
  content_type VARCHAR(20) DEFAULT 'markdown',
  author_id VARCHAR(191) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  edited_at DATETIME NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_draft BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  views_count INT DEFAULT 0,
  reactions JSON,
  tags JSON,
  mentioned_users JSON,
  parent_post_id VARCHAR(50) NULL,
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
  author_id VARCHAR(191) NOT NULL,
  parent_comment_id VARCHAR(50) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  edited_at DATETIME NULL,
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
  uploaded_by VARCHAR(191) NOT NULL,
  uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  description TEXT,
  tags JSON,
  downloads_count INT DEFAULT 0,
  is_public BOOLEAN DEFAULT FALSE,
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

-- 6. Community Vault Table
CREATE TABLE IF NOT EXISTS community_vault (
  id VARCHAR(50) PRIMARY KEY,
  community_id VARCHAR(50) NOT NULL,
  title VARCHAR(300) NOT NULL,
  item_type VARCHAR(20) NOT NULL,
  encrypted_content TEXT NOT NULL,
  encryption_iv VARCHAR(100) NOT NULL,
  encryption_tag VARCHAR(100),
  description TEXT,
  tags JSON,
  created_by VARCHAR(191) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  expires_at DATETIME NULL,
  access_count INT DEFAULT 0,
  last_accessed_at DATETIME NULL,
  last_accessed_by VARCHAR(191) NULL,
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
  user_id VARCHAR(191) NOT NULL,
  action VARCHAR(20) NOT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  accessed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
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
  transcription TEXT,
  transcription_status VARCHAR(20) DEFAULT 'pending',
  created_by VARCHAR(191) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
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
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
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
  user_id VARCHAR(191) NOT NULL,
  action VARCHAR(20) NOT NULL,
  target_type VARCHAR(20) NOT NULL,
  target_id VARCHAR(50),
  metadata JSON,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_community (community_id),
  INDEX idx_user (user_id),
  INDEX idx_action (action),
  INDEX idx_target (target_type, target_id),
  INDEX idx_created (created_at DESC),
  
  FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================
-- Composite Indexes for Performance
-- ======================================
CREATE INDEX idx_posts_community_created ON community_posts(community_id, created_at DESC);
CREATE INDEX idx_posts_author_created ON community_posts(author_id, created_at DESC);
CREATE INDEX idx_comments_post_created ON community_comments(post_id, created_at);
CREATE INDEX idx_files_community_uploaded ON community_files(community_id, uploaded_at DESC);
CREATE INDEX idx_activity_community_created ON community_activity(community_id, created_at DESC);

-- ======================================
-- DONE! 🎉
-- ======================================
