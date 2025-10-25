#!/bin/bash
# Database Synchronization Script for VPS
# This script applies the migration SQL to sync your remote database

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔄 Database Synchronization Tool${NC}"
echo ""

# Step 1: Check if migration file exists
if [ ! -f "migration-sync.sql" ]; then
    echo -e "${RED}❌ Error: migration-sync.sql not found!${NC}"
    echo -e "${YELLOW}Please run the schema comparison first:${NC}"
    echo "  ./scripts/run-schema-compare-vps.sh"
    echo "  docker cp taskara-web:/app/scripts/migration-sync.sql ./migration-sync.sql"
    exit 1
fi

echo -e "${YELLOW}📋 Migration file found: migration-sync.sql${NC}"
echo ""

# Step 2: Show preview of migration
echo -e "${BLUE}📄 Preview of migration SQL (first 50 lines):${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
head -n 50 migration-sync.sql
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 3: Confirm before proceeding
echo -e "${RED}⚠️  WARNING: This will modify your PRODUCTION database!${NC}"
echo -e "${YELLOW}Database: srv557.hstgr.io/u744630877_tasks${NC}"
echo ""
echo -e "${YELLOW}Before proceeding, make sure you have:${NC}"
echo "  ✓ Reviewed the migration SQL file"
echo "  ✓ Backed up your database"
echo "  ✓ Tested on a development database"
echo ""
read -p "Do you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}❌ Synchronization cancelled.${NC}"
    exit 0
fi

# Step 4: Create backup first
echo ""
echo -e "${BLUE}💾 Creating database backup...${NC}"

BACKUP_FILE="backup-$(date +%Y%m%d-%H%M%S).sql"

# Read database credentials from .env.production or prompt
if [ -f ".env.production" ]; then
    source .env.production
    DB_HOST=${REMOTE_DB_HOST:-"srv557.hstgr.io"}
    DB_USER=${REMOTE_DB_USER:-"u744630877_tasks"}
    DB_PASS=${REMOTE_DB_PASSWORD}
    DB_NAME=${REMOTE_DB_NAME:-"u744630877_tasks"}
else
    echo -e "${YELLOW}Enter database credentials:${NC}"
    read -p "Host [srv557.hstgr.io]: " DB_HOST
    DB_HOST=${DB_HOST:-srv557.hstgr.io}
    
    read -p "User [u744630877_tasks]: " DB_USER
    DB_USER=${DB_USER:-u744630877_tasks}
    
    read -sp "Password: " DB_PASS
    echo ""
    
    read -p "Database [u744630877_tasks]: " DB_NAME
    DB_NAME=${DB_NAME:-u744630877_tasks}
fi

# Create backup
echo -e "${YELLOW}Creating backup: $BACKUP_FILE${NC}"
mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backup created successfully: $BACKUP_FILE${NC}"
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}   Size: $BACKUP_SIZE${NC}"
else
    echo -e "${RED}❌ Backup failed! Aborting synchronization.${NC}"
    exit 1
fi

# Step 5: Apply migration
echo ""
echo -e "${BLUE}🚀 Applying migration to database...${NC}"
echo -e "${YELLOW}This may take a few moments...${NC}"

mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < migration-sync.sql 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migration applied successfully!${NC}"
else
    echo -e "${RED}❌ Migration failed!${NC}"
    echo -e "${YELLOW}To restore from backup, run:${NC}"
    echo "  mysql -h $DB_HOST -u $DB_USER -p $DB_NAME < $BACKUP_FILE"
    exit 1
fi

# Step 6: Verify synchronization
echo ""
echo -e "${BLUE}🔍 Verifying synchronization...${NC}"
echo -e "${YELLOW}Running comparison again to check for remaining differences...${NC}"

# Run comparison again
docker exec taskara-web npm run db:compare > /dev/null 2>&1 || true
docker cp taskara-web:/app/scripts/schema-comparison-report.md ./schema-comparison-report-after.md 2>/dev/null || true

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Database Synchronization Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📊 Summary:${NC}"
echo "  ✓ Backup created: $BACKUP_FILE ($BACKUP_SIZE)"
echo "  ✓ Migration applied: migration-sync.sql"
echo "  ✓ Database synchronized"
echo ""
echo -e "${YELLOW}📁 Files:${NC}"
echo "  - Backup: $BACKUP_FILE"
echo "  - Migration: migration-sync.sql"
echo "  - Report (before): schema-comparison-report.md"
echo "  - Report (after): schema-comparison-report-after.md"
echo ""
echo -e "${BLUE}🔍 Next steps:${NC}"
echo "  1. Check schema-comparison-report-after.md for any remaining differences"
echo "  2. Test your application to ensure everything works"
echo "  3. Keep the backup file safe for at least a few days"
echo ""
