# Docker File Uploads Configuration

## Overview
This document explains how file uploads work with Docker volumes in the Taskara application.

## Docker Volume Configuration

### Current Setup
The `docker-compose.yml` already has the upload volume configured:

```yaml
volumes:
  - /opt/uploads:/app/public/uploads
```

This maps the host directory `/opt/uploads` to the container's `/app/public/uploads`.

## Upload Directory Structure

The application automatically creates these subdirectories:

```
/opt/uploads/
├── avatars/          # User profile pictures
├── attachments/      # General attachments
├── projects/         # Project-specific files
│   └── [project-id]/ # Files per project
├── communities/      # Community files
│   └── [community-id]/ # Files per community
└── questionnaires/   # Questionnaire attachments
    └── [questionnaire-id]/ # Files per questionnaire
```

## Automatic Directory Creation

### On Docker Startup
The `scripts/init-upload-dirs.js` script runs automatically when the container starts and creates all necessary directories.

### On File Upload
Each upload API route also creates directories as needed using:
```typescript
if (!existsSync(uploadDir)) {
  await mkdir(uploadDir, { recursive: true })
}
```

## File Upload APIs

### 1. Projects Documents
**Endpoint:** `POST /api/projects/[id]/documents`
- **Storage:** `/uploads/projects/[project-id]/`
- **Access:** Project team members and admins
- **Features:** Multiple file upload support

### 2. Communities Files
**Endpoint:** `POST /api/communities/[id]/files`
- **Storage:** `/uploads/communities/[community-id]/`
- **Access:** Community members (based on role)
- **Features:** Activity logging, notifications

### 3. Questionnaires Attachments
**Endpoint:** `POST /api/questionnaires/upload`
- **Storage:** `/uploads/questionnaires/[questionnaire-id]/`
- **Access:** Authenticated users
- **Features:** Question-specific file uploads

## File Serving

### Public Access
Files are served through: `GET /api/uploads/[...path]`

**Example URLs:**
- `https://taskara.compumacy.com/api/uploads/projects/proj_123/document.pdf`
- `https://taskara.compumacy.com/api/uploads/communities/comm_456/image.png`
- `https://taskara.compumacy.com/api/uploads/questionnaires/quest_789/file.xlsx`

### Supported File Types

#### Images
- PNG, JPG, JPEG, GIF, WebP, SVG, ICO, BMP

#### Documents
- PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV

#### Archives
- ZIP, RAR, 7Z, TAR, GZ

#### Media
- MP3, MP4, AVI, MOV, WAV

#### Code
- JSON, XML, JS, CSS, HTML

### Response Headers
```
Content-Type: [appropriate MIME type]
Content-Disposition: inline; filename="[original-filename]"
Cache-Control: public, max-age=31536000, immutable
Access-Control-Allow-Origin: *
```

## VPS Setup Instructions

### 1. Create Upload Directory on Host
```bash
ssh root@65.181.118.82
mkdir -p /opt/uploads
chmod 755 /opt/uploads
```

### 2. Deploy with Docker Compose
```bash
cd /path/to/taskara
docker-compose up -d
```

The container will automatically:
1. Mount `/opt/uploads` to `/app/public/uploads`
2. Run `init-upload-dirs.js` to create subdirectories
3. Start the Next.js application

### 3. Verify Setup
```bash
# Check if directories were created
ls -la /opt/uploads/

# Should show:
# avatars/
# attachments/
# projects/
# communities/
# questionnaires/
```

## File Sharing Links

All uploaded files are accessible via direct URLs:

### Format
```
https://taskara.compumacy.com/api/uploads/[category]/[id]/[filename]
```

### Examples
```
# Project document
https://taskara.compumacy.com/api/uploads/projects/proj_abc123/report.pdf

# Community image
https://taskara.compumacy.com/api/uploads/communities/comm_xyz789/photo.jpg

# Questionnaire attachment
https://taskara.compumacy.com/api/uploads/questionnaires/quest_123/data.xlsx
```

### Sharing
These URLs can be:
- ✅ Shared directly with users
- ✅ Embedded in emails
- ✅ Used in external applications
- ✅ Cached by browsers (1 year cache)

## Security Considerations

### File Upload
- ✅ Authentication required for all uploads
- ✅ Permission checks based on user role
- ✅ File size limits enforced by Next.js
- ✅ Filename sanitization to prevent path traversal

### File Access
- ⚠️ Currently public access via direct URL
- Consider implementing access control if needed for sensitive files

## Backup Recommendations

### Regular Backups
```bash
# Backup uploads directory
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz /opt/uploads/

# Or use rsync
rsync -avz /opt/uploads/ /backup/location/
```

### Automated Backup Script
```bash
#!/bin/bash
# Add to crontab: 0 2 * * * /path/to/backup-uploads.sh

BACKUP_DIR="/backup/uploads"
DATE=$(date +%Y%m%d)
tar -czf $BACKUP_DIR/uploads-$DATE.tar.gz /opt/uploads/

# Keep only last 30 days
find $BACKUP_DIR -name "uploads-*.tar.gz" -mtime +30 -delete
```

## Troubleshooting

### Files Not Uploading
1. Check directory permissions:
   ```bash
   ls -la /opt/uploads/
   chmod -R 755 /opt/uploads/
   ```

2. Check container logs:
   ```bash
   docker logs taskara-web
   ```

3. Verify volume mount:
   ```bash
   docker inspect taskara-web | grep -A 5 Mounts
   ```

### Files Not Accessible
1. Check if file exists:
   ```bash
   ls -la /opt/uploads/[category]/[id]/
   ```

2. Test direct access:
   ```bash
   curl https://taskara.compumacy.com/api/uploads/[path]
   ```

3. Check Nginx logs:
   ```bash
   docker logs nginx-proxy
   ```

## Performance Optimization

### Nginx Caching (Optional)
Add to Nginx config for better performance:

```nginx
location /api/uploads/ {
    proxy_pass http://taskara-web:3000;
    proxy_cache uploads_cache;
    proxy_cache_valid 200 1y;
    proxy_cache_key $uri;
    add_header X-Cache-Status $upstream_cache_status;
}
```

## Summary

✅ **Automatic directory creation** on container startup
✅ **Docker volume** persists files across container restarts  
✅ **Multiple upload types** supported (projects, communities, questionnaires)
✅ **Direct file sharing** via public URLs
✅ **Comprehensive MIME types** for all common file formats
✅ **Production ready** with proper headers and caching

All file uploads will work seamlessly in the Docker environment with the existing volume configuration at `/opt/uploads`.
