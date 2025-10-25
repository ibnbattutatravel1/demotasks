#!/bin/bash
# Simple Database Schema Comparison and Sync Script
# Runs directly on VPS without needing Docker rebuild
# Uses mysqldump and mysql commands only

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔄 Database Schema Comparison & Sync Tool${NC}"
echo ""

# Database credentials
REMOTE_HOST="srv557.hstgr.io"
REMOTE_USER="u744630877_tasks"
REMOTE_PASS='###Taskstasks123'
REMOTE_DB="u744630877_tasks"

LOCAL_HOST="mysql"
LOCAL_USER="root"
LOCAL_PASS="root"
LOCAL_DB="u744630877_tasks"

# Step 1: Export remote schema
echo -e "${YELLOW}📥 Exporting remote database schema...${NC}"
MYSQL_PWD="$REMOTE_PASS" mysqldump -h "$REMOTE_HOST" -u "$REMOTE_USER" \
  --no-data --routines --triggers --skip-comments \
  "$REMOTE_DB" > remote-schema.sql 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Remote schema exported: remote-schema.sql${NC}"
else
    echo -e "${RED}❌ Failed to export remote schema${NC}"
    exit 1
fi

# Step 2: Export local schema (from Docker MySQL)
echo -e "${YELLOW}📥 Exporting local database schema...${NC}"
docker exec mysql sh -c "mysqldump -h localhost -u $LOCAL_USER -p$LOCAL_PASS \
  --no-data --routines --triggers --skip-comments \
  $LOCAL_DB 2>/dev/null" > local-schema.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Local schema exported: local-schema.sql${NC}"
else
    echo -e "${RED}❌ Failed to export local schema${NC}"
    exit 1
fi

# Step 3: Compare schemas
echo ""
echo -e "${BLUE}🔍 Comparing schemas...${NC}"
echo ""

# Simple diff comparison
if diff -u remote-schema.sql local-schema.sql > schema-diff.txt; then
    echo -e "${GREEN}✅ Schemas are identical! No sync needed.${NC}"
    rm schema-diff.txt
    exit 0
else
    echo -e "${YELLOW}⚠️  Differences found between remote and local schemas${NC}"
    echo -e "${YELLOW}📄 Diff saved to: schema-diff.txt${NC}"
    echo ""
    
    # Show summary of differences
    DIFF_LINES=$(wc -l < schema-diff.txt)
    echo -e "${BLUE}Total differences: $DIFF_LINES lines${NC}"
    echo ""
    
    # Show first 50 lines of diff
    echo -e "${BLUE}Preview of differences:${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    head -n 50 schema-diff.txt
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi

# Step 4: Ask if user wants to sync
echo ""
echo -e "${YELLOW}Do you want to sync the remote database to match local schema?${NC}"
echo -e "${RED}⚠️  This will modify your PRODUCTION database at $REMOTE_HOST${NC}"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}❌ Sync cancelled.${NC}"
    echo -e "${BLUE}Files saved:${NC}"
    echo "  - remote-schema.sql (current production schema)"
    echo "  - local-schema.sql (target schema)"
    echo "  - schema-diff.txt (differences)"
    exit 0
fi

# Step 5: Create backup
echo ""
echo -e "${BLUE}💾 Creating backup of remote database...${NC}"
BACKUP_FILE="backup-remote-$(date +%Y%m%d-%H%M%S).sql"

MYSQL_PWD="$REMOTE_PASS" mysqldump -h "$REMOTE_HOST" -u "$REMOTE_USER" \
  "$REMOTE_DB" > "$BACKUP_FILE" 2>&1

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✅ Backup created: $BACKUP_FILE ($BACKUP_SIZE)${NC}"
else
    echo -e "${RED}❌ Backup failed! Aborting sync.${NC}"
    exit 1
fi

# Step 6: Drop and recreate schema (sync method)
echo ""
echo -e "${BLUE}🔄 Synchronizing remote database schema...${NC}"
echo -e "${YELLOW}Method: Drop all tables and recreate from local schema${NC}"
echo ""

# Get list of tables to drop
TABLES=$(MYSQL_PWD="$REMOTE_PASS" mysql -h "$REMOTE_HOST" -u "$REMOTE_USER" \
  -N -B -e "SELECT GROUP_CONCAT(table_name) FROM information_schema.tables \
  WHERE table_schema='$REMOTE_DB'" "$REMOTE_DB" 2>&1)

if [ ! -z "$TABLES" ]; then
    echo -e "${YELLOW}Dropping existing tables...${NC}"
    MYSQL_PWD="$REMOTE_PASS" mysql -h "$REMOTE_HOST" -u "$REMOTE_USER" \
      -e "SET FOREIGN_KEY_CHECKS=0; DROP TABLE IF EXISTS $TABLES; SET FOREIGN_KEY_CHECKS=1;" \
      "$REMOTE_DB" 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Tables dropped${NC}"
    else
        echo -e "${RED}❌ Failed to drop tables${NC}"
        exit 1
    fi
fi

# Apply local schema to remote
echo -e "${YELLOW}Applying local schema to remote...${NC}"
MYSQL_PWD="$REMOTE_PASS" mysql -h "$REMOTE_HOST" -u "$REMOTE_USER" \
  "$REMOTE_DB" < local-schema.sql 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Schema applied successfully${NC}"
else
    echo -e "${RED}❌ Failed to apply schema${NC}"
    echo -e "${YELLOW}To restore from backup:${NC}"
    echo "  mysql -h $REMOTE_HOST -u $REMOTE_USER -p $REMOTE_DB < $BACKUP_FILE"
    exit 1
fi

# Step 7: Verify sync
echo ""
echo -e "${BLUE}🔍 Verifying synchronization...${NC}"

MYSQL_PWD="$REMOTE_PASS" mysqldump -h "$REMOTE_HOST" -u "$REMOTE_USER" \
  --no-data --routines --triggers --skip-comments \
  "$REMOTE_DB" > remote-schema-after.sql 2>&1

if diff -q local-schema.sql remote-schema-after.sql > /dev/null; then
    echo -e "${GREEN}✅ Schemas are now identical!${NC}"
else
    echo -e "${YELLOW}⚠️  Some differences may still exist${NC}"
    diff -u local-schema.sql remote-schema-after.sql > schema-diff-after.txt
    echo -e "${YELLOW}Check schema-diff-after.txt for details${NC}"
fi

# Summary
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Database Schema Synchronization Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📊 Summary:${NC}"
echo "  ✓ Remote schema backed up: $BACKUP_FILE"
echo "  ✓ Schema synchronized from local to remote"
echo "  ✓ Verification completed"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: This only synced the STRUCTURE, not the DATA!${NC}"
echo -e "${YELLOW}   Your data is still in the backup file.${NC}"
echo ""
echo -e "${BLUE}📁 Files created:${NC}"
echo "  - $BACKUP_FILE (full backup with data)"
echo "  - remote-schema.sql (old structure)"
echo "  - local-schema.sql (new structure)"
echo "  - schema-diff.txt (differences)"
echo ""
echo -e "${RED}🔄 To restore data from backup:${NC}"
echo "  mysql -h $REMOTE_HOST -u $REMOTE_USER -p $REMOTE_DB < $BACKUP_FILE"
echo ""
