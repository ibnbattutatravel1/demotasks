# Upload URL Fix - Deployment Guide

## Problem
Upload URLs were being stored as `/uploads/...` instead of `/api/uploads/...`, causing 404 errors when accessing uploaded files.

## Changes Made

### Code Changes
1. **Project Documents** (`app/api/projects/[id]/documents/route.ts`)
   - Changed URL format from `/uploads/projects/...` to `/api/uploads/projects/...`

2. **Questionnaires Upload** (`app/api/questionnaires/upload/route.ts`)
   - Changed URL format from `/uploads/questionnaires/...` to `/api/uploads/questionnaires/...`

3. **Community Files** (`app/api/communities/[id]/files/route.ts`)
   - Changed URL format from `/uploads/communities/...` to `/api/uploads/communities/...`

4. **Communities API** (`app/api/communities/route.ts`)
   - Fixed SQL DISTINCT/ORDER BY compatibility issue by adding `cm.user_id` to SELECT list

## Deployment Steps

### 1. Fix Existing Database Records
Run the SQL migration to fix existing URLs in the database:

```bash
# On VPS, connect to MySQL
docker exec -i taskara-db mysql -u root -p demotasks < fix-upload-urls.sql
```

Or manually:
```sql
-- Fix project documents
UPDATE project_documents 
SET url = CONCAT('/api', url) 
WHERE url LIKE '/uploads/%' AND url NOT LIKE '/api/uploads/%';

-- Fix community files
UPDATE community_files 
SET file_path = CONCAT('/api', file_path) 
WHERE file_path LIKE '/uploads/%' AND file_path NOT LIKE '/api/uploads/%';
```

### 2. Rebuild and Deploy
```bash
# On VPS at /taskara
docker compose down
docker compose build --no-cache
docker compose up -d

# Check logs
docker compose logs -f web
```

### 3. Verify
- Test uploading new files in projects
- Test uploading new files in communities
- Test uploading questionnaire attachments
- Verify old uploaded files are now accessible

## Technical Details

### Why This Fix Works
- Next.js serves API routes at `/api/*`
- The catch-all route `/api/uploads/[...path]/route.ts` handles file serving
- URLs must match the API route pattern to work correctly

### File Storage
- Files are physically stored in `/app/public/uploads/` (inside container)
- Mounted from `/opt/uploads` on the host via Docker volume
- Served through Next.js API route for proper authentication/access control

## Rollback
If issues occur, revert the database changes:
```sql
-- Revert project documents
UPDATE project_documents 
SET url = REPLACE(url, '/api/uploads/', '/uploads/') 
WHERE url LIKE '/api/uploads/%';

-- Revert community files
UPDATE community_files 
SET file_path = REPLACE(file_path, '/api/uploads/', '/uploads/') 
WHERE file_path LIKE '/api/uploads/%';
```

Then redeploy the previous version.
