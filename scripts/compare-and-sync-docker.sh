#!/bin/bash
# Database Schema Comparison and Sync Script
# Works entirely through Docker - no MySQL client needed on host

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔄 Database Schema Comparison & Sync Tool (Docker Edition)${NC}"
echo ""

# Database credentials
REMOTE_HOST="srv557.hstgr.io"
REMOTE_USER="u744630877_tasks"
REMOTE_PASS='###Taskstasks123'
REMOTE_DB="u744630877_tasks"

LOCAL_DB="u744630877_tasks"

# Step 1: Export remote schema using Docker MySQL client
echo -e "${YELLOW}📥 Exporting remote database schema...${NC}"
docker exec mysql sh -c "MYSQL_PWD='$REMOTE_PASS' mysqldump -h $REMOTE_HOST -u $REMOTE_USER \
  --no-data --routines --triggers --skip-comments \
  $REMOTE_DB" > remote-schema.sql 2>&1

if [ $? -eq 0 ] && [ -s remote-schema.sql ]; then
    REMOTE_SIZE=$(du -h remote-schema.sql | cut -f1)
    echo -e "${GREEN}✅ Remote schema exported: remote-schema.sql ($REMOTE_SIZE)${NC}"
else
    echo -e "${RED}❌ Failed to export remote schema${NC}"
    echo "Error output:"
    cat remote-schema.sql
    exit 1
fi

# Step 2: Export local schema (from Docker MySQL)
echo -e "${YELLOW}📥 Exporting local database schema...${NC}"

# First, let's find the correct MySQL password from environment
LOCAL_PASS=$(docker exec taskara-web sh -c 'echo $DB_PASSWORD' 2>/dev/null || echo "")

if [ -z "$LOCAL_PASS" ]; then
    echo -e "${YELLOW}Trying common passwords...${NC}"
    # Try common passwords
    for pass in "root" "password" "" "mysql"; do
        if docker exec mysql sh -c "mysql -u root -p'$pass' -e 'SELECT 1' 2>/dev/null" > /dev/null 2>&1; then
            LOCAL_PASS="$pass"
            echo -e "${GREEN}Found password!${NC}"
            break
        fi
    done
fi

if [ -z "$LOCAL_PASS" ]; then
    echo -e "${RED}❌ Could not determine local MySQL password${NC}"
    echo -e "${YELLOW}Please enter the MySQL root password:${NC}"
    read -s LOCAL_PASS
fi

docker exec mysql sh -c "MYSQL_PWD='$LOCAL_PASS' mysqldump -u root \
  --no-data --routines --triggers --skip-comments \
  $LOCAL_DB" > local-schema.sql 2>&1

if [ $? -eq 0 ] && [ -s local-schema.sql ]; then
    LOCAL_SIZE=$(du -h local-schema.sql | cut -f1)
    echo -e "${GREEN}✅ Local schema exported: local-schema.sql ($LOCAL_SIZE)${NC}"
else
    echo -e "${RED}❌ Failed to export local schema${NC}"
    echo "Error output:"
    cat local-schema.sql
    exit 1
fi

# Step 3: Compare schemas
echo ""
echo -e "${BLUE}🔍 Comparing schemas...${NC}"
echo ""

if diff -u remote-schema.sql local-schema.sql > schema-diff.txt; then
    echo -e "${GREEN}✅ Schemas are identical! No sync needed.${NC}"
    rm schema-diff.txt
    exit 0
else
    echo -e "${YELLOW}⚠️  Differences found between remote and local schemas${NC}"
    DIFF_LINES=$(wc -l < schema-diff.txt)
    echo -e "${BLUE}Total differences: $DIFF_LINES lines${NC}"
    echo ""
    
    # Show preview
    echo -e "${BLUE}Preview of differences (first 50 lines):${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    head -n 50 schema-diff.txt
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi

# Step 4: Ask for confirmation
echo ""
echo -e "${YELLOW}Do you want to sync the remote database to match local schema?${NC}"
echo -e "${RED}⚠️  This will modify your PRODUCTION database at $REMOTE_HOST${NC}"
echo -e "${YELLOW}⚠️  This will DROP ALL TABLES and recreate them (structure only)${NC}"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}❌ Sync cancelled.${NC}"
    echo -e "${BLUE}Files saved:${NC}"
    echo "  - remote-schema.sql"
    echo "  - local-schema.sql"
    echo "  - schema-diff.txt"
    exit 0
fi

# Step 5: Create backup
echo ""
echo -e "${BLUE}💾 Creating backup of remote database (with data)...${NC}"
BACKUP_FILE="backup-remote-$(date +%Y%m%d-%H%M%S).sql"

docker exec mysql sh -c "MYSQL_PWD='$REMOTE_PASS' mysqldump -h $REMOTE_HOST -u $REMOTE_USER \
  $REMOTE_DB" > "$BACKUP_FILE" 2>&1

if [ $? -eq 0 ] && [ -s "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✅ Backup created: $BACKUP_FILE ($BACKUP_SIZE)${NC}"
else
    echo -e "${RED}❌ Backup failed! Aborting sync.${NC}"
    exit 1
fi

# Step 6: Drop all tables in remote
echo ""
echo -e "${BLUE}🔄 Synchronizing remote database schema...${NC}"
echo -e "${YELLOW}Step 1: Getting list of tables...${NC}"

TABLES=$(docker exec mysql sh -c "MYSQL_PWD='$REMOTE_PASS' mysql -h $REMOTE_HOST -u $REMOTE_USER \
  -N -B -e \"SELECT GROUP_CONCAT(table_name) FROM information_schema.tables \
  WHERE table_schema='$REMOTE_DB'\" $REMOTE_DB" 2>&1)

if [ ! -z "$TABLES" ] && [[ ! "$TABLES" =~ "ERROR" ]]; then
    echo -e "${YELLOW}Step 2: Dropping existing tables...${NC}"
    docker exec mysql sh -c "MYSQL_PWD='$REMOTE_PASS' mysql -h $REMOTE_HOST -u $REMOTE_USER \
      -e \"SET FOREIGN_KEY_CHECKS=0; DROP TABLE IF EXISTS $TABLES; SET FOREIGN_KEY_CHECKS=1;\" \
      $REMOTE_DB" 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Tables dropped${NC}"
    else
        echo -e "${RED}❌ Failed to drop tables${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}No tables to drop or error occurred${NC}"
fi

# Step 7: Apply local schema to remote
echo -e "${YELLOW}Step 3: Applying local schema to remote...${NC}"
docker exec -i mysql sh -c "MYSQL_PWD='$REMOTE_PASS' mysql -h $REMOTE_HOST -u $REMOTE_USER $REMOTE_DB" < local-schema.sql 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Schema applied successfully${NC}"
else
    echo -e "${RED}❌ Failed to apply schema${NC}"
    echo -e "${YELLOW}To restore from backup:${NC}"
    echo "  docker exec -i mysql sh -c \"MYSQL_PWD='$REMOTE_PASS' mysql -h $REMOTE_HOST -u $REMOTE_USER $REMOTE_DB\" < $BACKUP_FILE"
    exit 1
fi

# Step 8: Verify
echo ""
echo -e "${BLUE}🔍 Verifying synchronization...${NC}"

docker exec mysql sh -c "MYSQL_PWD='$REMOTE_PASS' mysqldump -h $REMOTE_HOST -u $REMOTE_USER \
  --no-data --routines --triggers --skip-comments \
  $REMOTE_DB" > remote-schema-after.sql 2>&1

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
echo "  ✓ Remote schema backed up: $BACKUP_FILE ($BACKUP_SIZE)"
echo "  ✓ Schema synchronized from local to remote"
echo "  ✓ Verification completed"
echo ""
echo -e "${RED}⚠️  IMPORTANT: This only synced the STRUCTURE, not the DATA!${NC}"
echo -e "${RED}   Your data is in the backup file: $BACKUP_FILE${NC}"
echo ""
echo -e "${BLUE}📁 Files created:${NC}"
echo "  - $BACKUP_FILE (full backup with data)"
echo "  - remote-schema.sql (old structure)"
echo "  - local-schema.sql (new structure)"
echo "  - schema-diff.txt (differences)"
echo ""
