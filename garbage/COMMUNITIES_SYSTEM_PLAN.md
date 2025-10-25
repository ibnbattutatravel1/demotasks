# 🏘️ نظام المجتمعات الداخلية - التخطيط الشامل
# Communities System - Comprehensive Plan

## 🎯 الرؤية العامة | Vision

نظام مجتمعات داخلية متطور يجمع بين:
- **Knowledge Base** شبه Notion
- **Secure Vault** لحفظ المعلومات الحساسة
- **Collaboration** مع الفريق
- **Rich Content** (نصوص، ملفات، صوت، صور)
- **Advanced Permissions** صلاحيات متقدمة
- **Real-time Notifications** إشعارات فورية

---

## 📊 هيكل النظام | System Architecture

### 1. **Communities (المجتمعات)**
```
Community
├── Basic Info (name, description, icon, color)
├── Permissions (who can view/edit/admin)
├── Members (users with roles)
├── Posts (المنشورات)
├── Files (الملفات المشتركة)
├── Vault Items (المعلومات الحساسة)
└── Categories/Tags (للتنظيم)
```

### 2. **Posts (المنشورات)**
```
Post
├── Content (rich text with markdown)
├── Attachments (files, images)
├── Voice Notes (تسجيلات صوتية)
├── Comments (التعليقات)
├── Reactions (👍, ❤️, 🎉)
├── Mentions (@user)
├── Tags/Categories
├── Pin/Featured flag
└── Version History
```

### 3. **Vault (الخزنة الآمنة)**
```
Vault Item
├── Type (API Key, Password, Secret, Certificate)
├── Encrypted Content
├── Access Log (من شاف إيه ومتى)
├── Expiry Date
├── Access Permissions
└── Audit Trail
```

### 4. **Permissions System**
```
Roles per Community:
├── Owner (مالك)
├── Admin (مشرف)
├── Moderator (مراقب)
├── Editor (محرر)
├── Contributor (مساهم)
└── Viewer (مشاهد)

Permissions:
├── view_community
├── create_post
├── edit_post
├── delete_post
├── comment
├── upload_files
├── access_vault
├── manage_members
├── manage_settings
└── delete_community
```

---

## 🗄️ Database Schema

### 1. **communities** table
```sql
CREATE TABLE communities (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  color VARCHAR(20),
  visibility ENUM('public', 'private', 'secret') DEFAULT 'private',
  
  created_by VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  is_archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMP NULL,
  
  settings JSON,
  
  INDEX idx_created_by (created_by),
  INDEX idx_visibility (visibility),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
```

### 2. **community_members** table
```sql
CREATE TABLE community_members (
  id VARCHAR(50) PRIMARY KEY,
  community_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  
  role ENUM('owner', 'admin', 'moderator', 'editor', 'contributor', 'viewer') DEFAULT 'viewer',
  
  permissions JSON,
  
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_active_at TIMESTAMP NULL,
  
  is_muted BOOLEAN DEFAULT FALSE,
  
  UNIQUE KEY unique_member (community_id, user_id),
  INDEX idx_community (community_id),
  INDEX idx_user (user_id),
  INDEX idx_role (role),
  FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 3. **community_posts** table
```sql
CREATE TABLE community_posts (
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
  
  views_count INT DEFAULT 0,
  reactions JSON,
  
  tags JSON,
  mentioned_users JSON,
  
  parent_post_id VARCHAR(50) NULL,
  
  INDEX idx_community (community_id),
  INDEX idx_author (author_id),
  INDEX idx_created (created_at),
  INDEX idx_pinned (is_pinned),
  INDEX idx_parent (parent_post_id),
  FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_post_id) REFERENCES community_posts(id) ON DELETE CASCADE
);
```

### 4. **community_comments** table
```sql
CREATE TABLE community_comments (
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
);
```

### 5. **community_files** table
```sql
CREATE TABLE community_files (
  id VARCHAR(50) PRIMARY KEY,
  community_id VARCHAR(50) NOT NULL,
  post_id VARCHAR(50) NULL,
  
  file_name VARCHAR(500) NOT NULL,
  file_path VARCHAR(1000) NOT NULL,
  file_type VARCHAR(100),
  file_size BIGINT,
  
  uploaded_by VARCHAR(50) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  description TEXT,
  tags JSON,
  
  downloads_count INT DEFAULT 0,
  
  is_public BOOLEAN DEFAULT FALSE,
  
  INDEX idx_community (community_id),
  INDEX idx_post (post_id),
  INDEX idx_uploader (uploaded_by),
  INDEX idx_type (file_type),
  FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE SET NULL,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);
```

### 6. **community_vault** table
```sql
CREATE TABLE community_vault (
  id VARCHAR(50) PRIMARY KEY,
  community_id VARCHAR(50) NOT NULL,
  
  title VARCHAR(300) NOT NULL,
  item_type ENUM('api_key', 'password', 'secret', 'certificate', 'token', 'credentials', 'other') NOT NULL,
  
  encrypted_content TEXT NOT NULL,
  encryption_iv VARCHAR(100),
  
  description TEXT,
  tags JSON,
  
  created_by VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  expires_at TIMESTAMP NULL,
  
  access_count INT DEFAULT 0,
  last_accessed_at TIMESTAMP NULL,
  last_accessed_by VARCHAR(50) NULL,
  
  allowed_roles JSON,
  allowed_users JSON,
  
  INDEX idx_community (community_id),
  INDEX idx_type (item_type),
  INDEX idx_creator (created_by),
  INDEX idx_expires (expires_at),
  FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);
```

### 7. **community_vault_access_log** table
```sql
CREATE TABLE community_vault_access_log (
  id VARCHAR(50) PRIMARY KEY,
  vault_item_id VARCHAR(50) NOT NULL,
  
  user_id VARCHAR(50) NOT NULL,
  action ENUM('view', 'copy', 'edit', 'delete') NOT NULL,
  
  ip_address VARCHAR(50),
  user_agent TEXT,
  
  accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_vault_item (vault_item_id),
  INDEX idx_user (user_id),
  INDEX idx_accessed (accessed_at),
  FOREIGN KEY (vault_item_id) REFERENCES community_vault(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 8. **community_voice_notes** table
```sql
CREATE TABLE community_voice_notes (
  id VARCHAR(50) PRIMARY KEY,
  post_id VARCHAR(50) NULL,
  comment_id VARCHAR(50) NULL,
  
  file_path VARCHAR(1000) NOT NULL,
  duration INT,
  
  transcription TEXT,
  
  created_by VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_post (post_id),
  INDEX idx_comment (comment_id),
  INDEX idx_creator (created_by),
  FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (comment_id) REFERENCES community_comments(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);
```

### 9. **community_categories** table
```sql
CREATE TABLE community_categories (
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
  FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_category_id) REFERENCES community_categories(id) ON DELETE CASCADE
);
```

### 10. **community_activity** table
```sql
CREATE TABLE community_activity (
  id VARCHAR(50) PRIMARY KEY,
  community_id VARCHAR(50) NOT NULL,
  
  user_id VARCHAR(50) NOT NULL,
  action ENUM('created', 'updated', 'deleted', 'commented', 'reacted', 'joined', 'left', 'shared', 'mentioned') NOT NULL,
  
  target_type ENUM('post', 'comment', 'file', 'vault_item', 'member', 'community') NOT NULL,
  target_id VARCHAR(50),
  
  metadata JSON,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_community (community_id),
  INDEX idx_user (user_id),
  INDEX idx_action (action),
  INDEX idx_created (created_at),
  FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 🎨 الصفحات المطلوبة | Required Pages

### Admin Pages:
1. ✅ `/admin/communities` - إدارة المجتمعات
2. ✅ `/admin/communities/new` - إنشاء مجتمع جديد
3. ✅ `/admin/communities/[id]` - تفاصيل المجتمع
4. ✅ `/admin/communities/[id]/settings` - إعدادات المجتمع
5. ✅ `/admin/communities/[id]/members` - إدارة الأعضاء
6. ✅ `/admin/communities/[id]/vault` - إدارة الخزنة
7. ✅ `/admin/communities/[id]/analytics` - التحليلات

### User Pages:
1. ✅ `/communities` - قائمة المجتمعات
2. ✅ `/communities/[id]` - عرض المجتمع
3. ✅ `/communities/[id]/post/[postId]` - عرض المنشور
4. ✅ `/communities/[id]/files` - الملفات
5. ✅ `/communities/[id]/vault` - الخزنة (للمصرح لهم)
6. ✅ `/communities/[id]/members` - الأعضاء

---

## 🔐 نظام الصلاحيات | Permissions Matrix

| Role | View | Post | Comment | Edit Others | Delete Others | Upload Files | Access Vault | Manage Members | Settings |
|------|------|------|---------|-------------|---------------|--------------|--------------|----------------|----------|
| **Owner** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Moderator** | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ | ⚠️ | ❌ |
| **Editor** | ✅ | ✅ | ✅ | ⚠️ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Contributor** | ✅ | ✅ | ✅ | ❌ | ❌ | ⚠️ | ❌ | ❌ | ❌ |
| **Viewer** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

⚠️ = Limited/Conditional access

---

## 🔔 نظام الإشعارات | Notifications System

### Notification Types:
1. **Mentions** - @username
2. **Replies** - رد على تعليق
3. **New Post** - منشور جديد في مجتمع
4. **New Comment** - تعليق على منشور
5. **Reactions** - تفاعل على منشور/تعليق
6. **File Shared** - مشاركة ملف
7. **Vault Access** - وصول لمعلومة حساسة
8. **Member Joined** - عضو جديد
9. **Role Changed** - تغيير صلاحيات
10. **Post Pinned** - تثبيت منشور

### Notification Channels:
- ✅ **In-App** (Real-time with WebSockets optional)
- ✅ **Email** (مع templates احترافية)
- ⚠️ **Browser Push** (Optional future)

---

## 🎯 الميزات المتقدمة | Advanced Features

### 1. **Rich Text Editor**
- Markdown support
- Code syntax highlighting
- Inline images
- Tables
- Checklists
- Embeds (YouTube, Links)

### 2. **Voice Input** 🎤
- Record voice notes
- Attach to posts/comments
- Speech-to-text transcription
- Playback in-app

### 3. **Secure Vault** 🔐
- AES-256 encryption
- Access logging
- Expiry dates
- Role-based access
- Copy protection (watermark user ID)

### 4. **Smart Mentions** @
- @username - mention user
- @all - mention everyone
- @role - mention by role (e.g., @admins)

### 5. **Advanced Search** 🔍
- Full-text search
- Filter by:
  - Author
  - Date range
  - Tags/Categories
  - File type
  - Reactions
- Sort by relevance/date/popularity

### 6. **Analytics Dashboard** 📊
- Most active members
- Popular posts
- Engagement metrics
- Vault access stats
- File downloads
- Growth trends

### 7. **Content Organization**
- Categories/Tags
- Pin important posts
- Feature best content
- Archive old posts
- Folders for files

### 8. **Collaboration**
- Real-time indicators (who's viewing)
- Draft posts
- Co-editing (future)
- Version history

---

## 🔒 Security Measures

### 1. **Vault Encryption**
```typescript
// AES-256-GCM encryption
const encrypt = (data: string, key: string) => {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const tag = cipher.getAuthTag()
  return { encrypted, iv: iv.toString('hex'), tag: tag.toString('hex') }
}
```

### 2. **Access Control**
- Check permissions on every request
- Log all vault access
- Rate limiting on sensitive endpoints
- IP whitelisting (optional)

### 3. **Content Moderation**
- Report system
- Auto-flag inappropriate content
- Admin review queue

---

## 📱 UI/UX Design

### Communities List Page:
```
┌─────────────────────────────────────────────┐
│  🏘️ Communities                     [+ New] │
├─────────────────────────────────────────────┤
│  🔍 Search communities...    [Filter ▼]     │
├─────────────────────────────────────────────┤
│  📌 Pinned                                   │
│  ┌─────────────────────┐                    │
│  │ 🎨 Design Team      │ 234 members        │
│  │ Latest: New brand..│ 2h ago             │
│  └─────────────────────┘                    │
│                                              │
│  📂 Your Communities                         │
│  ┌─────────────────────┐ ┌────────────────┐│
│  │ 💻 Engineering      │ │ 📊 Marketing   ││
│  │ 45 members          │ │ 28 members     ││
│  └─────────────────────┘ └────────────────┘│
└─────────────────────────────────────────────┘
```

### Community Page:
```
┌─────────────────────────────────────────────┐
│  [← Back] 🎨 Design Team           [⋮ Menu] │
├─────────────────────────────────────────────┤
│  [📝 Posts] [📁 Files] [🔐 Vault] [👥 Members]│
├─────────────────────────────────────────────┤
│                                              │
│  [Create Post] 🎤 [Voice] 📎 [Files]        │
│                                              │
│  ┌─────────────────────────────────────────┐│
│  │ 📌 New Brand Guidelines                 ││
│  │ By @john • 2h ago • 45 👁️ • 12 ❤️       ││
│  │                                          ││
│  │ Check out the new brand...              ││
│  │ [Read more]                             ││
│  │                                          ││
│  │ 💬 8 comments                           ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

---

## 📧 Email Templates

### 1. New Mention
```
Subject: @{username} mentioned you in {community_name}
```

### 2. New Post in Community
```
Subject: New post in {community_name}: {post_title}
```

### 3. Vault Item Accessed
```
Subject: 🔐 Vault Alert: {item_name} was accessed
```

### 4. New Member Joined
```
Subject: {username} joined {community_name}
```

---

## 🚀 Implementation Plan

### Phase 1: Core Foundation (Week 1)
- ✅ Database schema + SQL
- ✅ Basic CRUD APIs
- ✅ Communities list page
- ✅ Create community page
- ✅ Permissions system

### Phase 2: Content Creation (Week 2)
- ✅ Posts system
- ✅ Comments system
- ✅ Rich text editor
- ✅ File uploads
- ✅ Voice notes

### Phase 3: Security & Vault (Week 3)
- ✅ Vault encryption
- ✅ Access logging
- ✅ Secure APIs
- ✅ Admin vault management

### Phase 4: Social Features (Week 4)
- ✅ Mentions system
- ✅ Reactions
- ✅ Notifications (in-app)
- ✅ Email notifications

### Phase 5: Advanced Features (Week 5)
- ✅ Search & filters
- ✅ Analytics
- ✅ Categories/tags
- ✅ Activity feed

---

## 📊 Success Metrics

- **Adoption Rate:** % of users in at least 1 community
- **Engagement:** Posts/comments per day
- **Vault Usage:** Secure items stored
- **Retention:** Active users week-over-week
- **Response Time:** Average time to first comment

---

## 🎯 Next Steps

1. ✅ Create SQL schema
2. ✅ Implement database tables
3. ✅ Build core APIs
4. ✅ Create admin pages
5. ✅ Build user pages
6. ✅ Integrate notifications
7. ✅ Add email templates
8. ✅ Implement vault encryption
9. ✅ Add voice input
10. ✅ Deploy & test

---

**🚀 Let's build the future of internal collaboration!**

Created: Oct 22, 2025  
Status: Planning Complete ✅  
Ready for Implementation: YES 🎉
