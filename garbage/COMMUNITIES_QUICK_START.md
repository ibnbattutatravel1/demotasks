# 🏘️ Communities System - Quick Start Guide

## 🎯 System Overview

**Communities** هو نظام متكامل لإدارة المجتمعات الداخلية مع:
- 📝 Rich Content Sharing (Notion-like)
- 🔐 Secure Vault للمعلومات الحساسة
- 🎤 Voice Notes Integration
- 💬 Comments & Mentions
- 📁 File Sharing
- 🔔 Real-time Notifications
- 👥 Advanced Permission System

---

## 📊 What's Built So Far:

### ✅ Completed:
1. **Database Schema** (10 tables)
2. **Vault Encryption Library** - AES-256-GCM
3. **Voice Input Component** - Full recording + transcription
4. **Communities API** - GET/POST basic endpoints

### ⏳ Next Steps (To Complete):
1. Individual Community APIs
2. Posts & Comments APIs
3. Vault APIs with Encryption
4. Admin Pages (5 pages)
5. User Pages (4 pages)
6. Sidebar Integration
7. Notifications System
8. Email Templates

---

## 🚀 Installation Steps:

### 1. Run SQL Schema:
```bash
mysql -u username -p database < scripts/communities-tables.sql
```

### 2. Add Environment Variable:
```env
# Add to .env
VAULT_MASTER_KEY=your-super-secret-key-change-this-in-production
```

### 3. Install Dependencies (if needed):
```bash
# Most dependencies already installed
# Voice input uses native Web APIs (no extra packages)
```

---

## 📂 File Structure Created:

```
📁 communities/
├── 📄 COMMUNITIES_SYSTEM_PLAN.md (Comprehensive planning doc)
├── 📄 COMMUNITIES_QUICK_START.md (This file)
│
├── 📁 scripts/
│   └── communities-tables.sql (Database schema)
│
├── 📁 lib/
│   └── vault-encryption.ts (Encryption utilities)
│
├── 📁 components/
│   └── voice-input.tsx (Voice recording component)
│
└── 📁 app/api/communities/
    └── route.ts (Main API endpoint)
```

---

## 🎯 API Endpoints Reference:

### Communities:
```typescript
GET    /api/communities                    // List communities
POST   /api/communities                    // Create community (admin)
GET    /api/communities/[id]               // Get community details
PATCH  /api/communities/[id]               // Update community (admin)
DELETE /api/communities/[id]               // Delete community (admin)
```

### Posts:
```typescript
GET    /api/communities/[id]/posts         // List posts
POST   /api/communities/[id]/posts         // Create post
GET    /api/communities/[id]/posts/[postId] // Get post
PATCH  /api/communities/[id]/posts/[postId] // Update post
DELETE /api/communities/[id]/posts/[postId] // Delete post
```

### Comments:
```typescript
GET    /api/communities/[id]/posts/[postId]/comments    // List comments
POST   /api/communities/[id]/posts/[postId]/comments    // Add comment
PATCH  /api/communities/[id]/posts/[postId]/comments/[commentId] // Update
DELETE /api/communities/[id]/posts/[postId]/comments/[commentId] // Delete
```

### Files:
```typescript
GET    /api/communities/[id]/files         // List files
POST   /api/communities/[id]/files         // Upload file
DELETE /api/communities/[id]/files/[fileId] // Delete file
```

### Vault:
```typescript
GET    /api/communities/[id]/vault         // List vault items
POST   /api/communities/[id]/vault         // Create vault item (encrypted)
GET    /api/communities/[id]/vault/[itemId] // Get & decrypt vault item
PATCH  /api/communities/[id]/vault/[itemId] // Update vault item
DELETE /api/communities/[id]/vault/[itemId] // Delete vault item
```

### Members:
```typescript
GET    /api/communities/[id]/members       // List members
POST   /api/communities/[id]/members       // Add member
PATCH  /api/communities/[id]/members/[userId] // Update role
DELETE /api/communities/[id]/members/[userId] // Remove member
```

---

## 🎨 Pages to Build:

### Admin Pages:
```
/admin/communities                    ✅ Priority: HIGH
/admin/communities/new                ✅ Priority: HIGH
/admin/communities/[id]               ✅ Priority: HIGH
/admin/communities/[id]/settings      ⏳ Priority: MEDIUM
/admin/communities/[id]/members       ⏳ Priority: MEDIUM
/admin/communities/[id]/vault         ✅ Priority: HIGH
/admin/communities/[id]/analytics     ⏳ Priority: LOW
```

### User Pages:
```
/communities                          ✅ Priority: HIGH
/communities/[id]                     ✅ Priority: HIGH
/communities/[id]/post/[postId]       ✅ Priority: MEDIUM
/communities/[id]/files               ⏳ Priority: MEDIUM
/communities/[id]/vault               ✅ Priority: HIGH
```

---

## 🔐 Permission System:

### Roles & Their Powers:

| Feature | Owner | Admin | Moderator | Editor | Contributor | Viewer |
|---------|-------|-------|-----------|--------|-------------|--------|
| View Community | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Post | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit Own Post | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit Others Post | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete Post | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Comment | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Upload Files | ✅ | ✅ | ✅ | ✅ | ⚠️ | ❌ |
| Access Vault | ✅ | ✅ | ⚠️ | ❌ | ❌ | ❌ |
| Manage Members | ✅ | ✅ | ⚠️ | ❌ | ❌ | ❌ |
| Community Settings | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete Community | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

⚠️ = Conditional/Limited Access

---

## 🎤 Voice Input Usage:

```tsx
import { VoiceInput } from '@/components/voice-input'

// In your form:
<VoiceInput
  onTranscript={(text) => {
    // Auto-append transcribed text to your input
    setContent(prev => prev + ' ' + text)
  }}
  onRecordingComplete={(audioBlob, duration) => {
    // Upload audio file
    uploadAudio(audioBlob, duration)
  }}
  mode="both" // 'transcript' | 'audio' | 'both'
  maxDuration={300} // 5 minutes
/>
```

---

## 🔐 Vault Encryption Usage:

```typescript
import { encrypt, decrypt } from '@/lib/vault-encryption'

// Encrypting sensitive data:
const { encrypted, iv, tag, salt } = encrypt('my-api-key-12345')

// Store in database:
await db.insert(community_vault).values({
  encrypted_content: encrypted,
  encryption_iv: iv,
  encryption_tag: tag,
  // salt is derived internally
})

// Decrypting:
const decrypted = decrypt(encrypted, iv, tag, salt)
console.log(decrypted) // 'my-api-key-12345'
```

---

## 🔔 Notifications Integration:

### Triggers:
1. **New Post** → Notify all members
2. **Mention** (@username) → Notify mentioned user
3. **Comment** → Notify post author
4. **Vault Access** → Log and notify admins
5. **Member Added** → Notify new member
6. **Role Changed** → Notify user

### Implementation:
```typescript
// Example: Create notification
await db.execute(sql`
  INSERT INTO notifications (
    id, user_id, type, title, message, 
    related_id, related_type, is_read, created_at
  ) VALUES (?, ?, 'community', ?, ?, ?, 'post', FALSE, NOW())
`, [notificationId, userId, 'New Post', 'Check it out!', postId])
```

---

## 📧 Email Templates Needed:

1. **New Community Member**
   - Subject: `You've been added to {community_name}`
   - CTA: View Community

2. **New Post**
   - Subject: `New post in {community_name}: {post_title}`
   - CTA: Read Post

3. **Mentioned in Post**
   - Subject: `@{username} mentioned you in {community_name}`
   - CTA: View Mention

4. **Vault Access Alert**
   - Subject: `🔐 Vault Alert: {item_name} was accessed by {user_name}`
   - CTA: View Access Log

5. **Comment on Your Post**
   - Subject: `{user_name} commented on your post`
   - CTA: View Comment

---

## 🎯 Implementation Priority:

### Phase 1: MVP (Minimum Viable Product) ⏱️ ~4-6 hours
```
✅ Database Schema
✅ Vault Encryption
✅ Voice Input Component
✅ Communities List API
⏳ Community Detail API
⏳ Posts API (Create, List, View)
⏳ Basic Admin Page (List + Create)
⏳ Basic User Page (List + View)
⏳ Sidebar Integration
```

### Phase 2: Core Features ⏱️ ~6-8 hours
```
⏳ Comments System
⏳ File Upload & Management
⏳ Vault CRUD APIs
⏳ Vault Admin Page
⏳ Member Management
⏳ Permissions Enforcement
⏳ Activity Logging
```

### Phase 3: Advanced Features ⏱️ ~6-8 hours
```
⏳ Mentions System (@username)
⏳ Reactions (❤️, 👍, 🎉)
⏳ Categories & Tags
⏳ Search & Filters
⏳ Analytics Dashboard
⏳ Email Notifications
⏳ Voice Notes Upload
```

---

## 🧪 Testing Checklist:

### Communities:
- [ ] Create community (admin only)
- [ ] List communities (user sees only their communities)
- [ ] View community details
- [ ] Update community settings
- [ ] Archive community

### Posts:
- [ ] Create post with markdown
- [ ] Edit post
- [ ] Delete post
- [ ] Pin post
- [ ] View post with comments
- [ ] Search posts

### Vault:
- [ ] Create encrypted vault item
- [ ] View vault item (decrypt)
- [ ] Copy vault item (log access)
- [ ] Check expiry dates
- [ ] Verify role-based access
- [ ] View access log

### Voice:
- [ ] Record voice note
- [ ] Transcribe speech-to-text
- [ ] Upload voice file
- [ ] Play voice note

### Permissions:
- [ ] Owner can do everything
- [ ] Admin can manage most things
- [ ] Viewer can only view and comment
- [ ] Non-members cannot access private communities

---

## 🐛 Known Issues & TODOs:

### High Priority:
- [ ] Complete individual community API endpoints
- [ ] Build admin dashboard pages
- [ ] Build user community view pages
- [ ] Implement mentions parsing (@username)
- [ ] Add email notification system

### Medium Priority:
- [ ] Add rich text editor for posts
- [ ] Implement real-time updates (WebSockets optional)
- [ ] Add image/video previews
- [ ] Implement search functionality
- [ ] Add analytics dashboard

### Low Priority:
- [ ] Add export functionality (PDF/Excel)
- [ ] Implement post templates
- [ ] Add keyboard shortcuts
- [ ] Mobile responsive optimizations
- [ ] Dark mode support

---

## 💡 Pro Tips:

1. **Vault Security:**
   - Always use HTTPS in production
   - Rotate VAULT_MASTER_KEY periodically
   - Never log decrypted vault content
   - Set appropriate expiry dates

2. **Performance:**
   - Use pagination for posts (20 per page)
   - Cache community member lists
   - Index frequently queried fields
   - Lazy-load file previews

3. **UX:**
   - Show "typing..." indicators in comments
   - Auto-save drafts every 30 seconds
   - Highlight @mentions visually
   - Show file upload progress

4. **Permissions:**
   - Always check permissions server-side
   - Cache permission checks (60 seconds)
   - Log all vault access attempts
   - Alert on suspicious activity

---

## 📚 Resources:

- **Encryption:** https://nodejs.org/api/crypto.html
- **Web Speech API:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- **Markdown:** https://marked.js.org/
- **File Upload:** https://nextjs.org/docs/app/building-your-application/routing/route-handlers

---

## 🎉 What's Next?

Now that we have the foundation, we need to:

1. ✅ **Complete Core APIs** - Posts, Comments, Vault, Members
2. ✅ **Build Admin Pages** - Management interface
3. ✅ **Build User Pages** - Community viewing & interaction
4. ✅ **Integrate Notifications** - Real-time alerts
5. ✅ **Add Email System** - Templates for all events
6. ✅ **Connect Sidebar** - Navigation links

---

**Status:** 🟡 In Progress (20% Complete)  
**Estimated Time to MVP:** 4-6 hours  
**Estimated Time to Full System:** 16-20 hours

Let's continue building! 🚀

---

Created: Oct 22, 2025  
Last Updated: Oct 22, 2025  
Version: 1.0
