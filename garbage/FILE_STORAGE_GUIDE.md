# 📁 File Storage System Guide

## 🎯 Overview
This project now uses a **proper file storage system** instead of storing files as base64 in the database.

## ✅ What Changed?

### Before (❌ Bad)
- Files were converted to base64 strings
- Stored directly in MySQL database
- Database became huge and slow
- Risk of database collapse

### After (✅ Good)
- Files are saved in `public/uploads/` directory
- Only file **URLs** are stored in database
- Database remains small and fast
- Scalable and maintainable

---

## 📂 Directory Structure

```
public/
└── uploads/
    ├── avatars/          # User profile pictures
    │   └── [uuid].jpg/png
    └── attachments/      # Task/project attachments
        └── [uuid].pdf/docx/etc
```

---

## 🔧 Setup Instructions

### 1. Add Environment Variable

Add this to your `.env` file:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production, change to your actual domain:
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 2. Create Upload Directories

The system will automatically create directories when needed, but you can create them manually:

```bash
mkdir -p public/uploads/avatars
mkdir -p public/uploads/attachments
```

### 3. Set Permissions (Linux/Mac only)

```bash
chmod 755 public/uploads
chmod 755 public/uploads/avatars
chmod 755 public/uploads/attachments
```

---

## 🚀 How It Works

### Profile Pictures

When a user uploads an avatar:
1. File is received from form data
2. Saved to `public/uploads/avatars/[uuid].ext`
3. URL like `/uploads/avatars/abc123.jpg` is stored in database
4. Browser accesses image via `http://localhost:3000/uploads/avatars/abc123.jpg`

### Task Attachments

When a user uploads a file:
1. File is received from form data
2. Saved to `public/uploads/attachments/[uuid].ext`
3. URL like `/uploads/attachments/xyz789.pdf` is stored in database
4. User can download via direct link

---

## 📝 API Changes

### `/api/profile` (PUT)
- **Before**: Stored base64 in `users.avatar`
- **After**: Stores URL like `http://localhost:3000/uploads/avatars/[uuid].jpg`

### `/api/attachments` (POST)
- **Before**: Stored base64 in `attachments.url`
- **After**: Stores URL like `http://localhost:3000/uploads/attachments/[uuid].pdf`

---

## 🛡️ Security Features

1. **File Size Limits**
   - Avatars: 10MB max
   - Attachments: 50MB max

2. **Unique Filenames**
   - Uses UUID to prevent conflicts
   - Original filename preserved in database

3. **File Type Validation**
   - Extension preserved from original file
   - MIME type stored in database

---

## 🌐 Production Deployment

### Option 1: Same Server (Current Setup)
- Files stored on same server in `public/uploads/`
- Works out of the box
- Good for small to medium projects

### Option 2: Cloud Storage (Recommended for Scale)

For larger projects, consider:
- **AWS S3**: Best for AWS ecosystem
- **Cloudinary**: Great for images with transformations
- **Azure Blob Storage**: Good for Microsoft stack
- **Google Cloud Storage**: Integrated with Google services

To migrate to cloud storage:
1. Update `lib/file-storage.ts`
2. Add cloud provider SDK
3. Update `saveFile()` and `saveImageFromUrl()` functions

---

## 🔄 Migration from Old Data

If you have existing base64 data in database:

### 1. Create Migration Script

```typescript
// scripts/migrate-files.ts
import { db, dbSchema } from './lib/db/client'
import { writeFile } from 'fs/promises'
import path from 'path'

async function migrateFiles() {
  // Migrate avatars
  const users = await db.select().from(dbSchema.users)
  for (const user of users) {
    if (user.avatar?.startsWith('data:')) {
      // Extract base64 and save as file
      // Update database with new URL
    }
  }
  
  // Migrate attachments
  const attachments = await db.select().from(dbSchema.attachments)
  for (const attachment of attachments) {
    if (attachment.url?.startsWith('data:')) {
      // Extract base64 and save as file
      // Update database with new URL
    }
  }
}
```

### 2. Run Migration

```bash
npx tsx scripts/migrate-files.ts
```

---

## 📊 Database Size Comparison

### Example with 100 users and 500 attachments:

| Storage Method | Database Size | Disk Space |
|---------------|---------------|------------|
| **Base64 (Old)** | ~2.5 GB | 0 GB |
| **File System (New)** | ~50 MB | ~2 GB |

✅ Database is 50x smaller!
✅ Much faster queries
✅ Easier backups
✅ Scalable storage

---

## 🐛 Troubleshooting

### Issue: Files not uploading

1. Check directory permissions
2. Verify `NEXT_PUBLIC_APP_URL` in `.env`
3. Check disk space

### Issue: Images not displaying

1. Verify file exists in `public/uploads/`
2. Check URL format in database
3. Verify Next.js is serving static files correctly

### Issue: "File too large" error

Adjust limits in API routes:
```typescript
const maxSize = 50 * 1024 * 1024 // 50MB
```

---

## 📞 Support

If you encounter issues:
1. Check console logs
2. Verify file permissions
3. Check `.env` configuration
4. Review this guide

---

## 🎉 Benefits Summary

✅ **Performance**: 50x smaller database
✅ **Scalability**: Easy to move to cloud storage
✅ **Maintainability**: Clear separation of concerns
✅ **Cost**: Lower database hosting costs
✅ **Speed**: Faster queries and backups
✅ **Flexibility**: Easy to add CDN later

---

**Created**: 2025-10-01
**Version**: 1.0
**Status**: ✅ Production Ready
