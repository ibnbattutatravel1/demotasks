# Database Synchronization Guide

Complete guide to sync your remote production database with your local schema.

---

## 🎯 Complete Workflow

### Step 1: Run Schema Comparison

```bash
cd /taskara

# Run the comparison tool
./scripts/run-schema-compare-vps.sh

# Copy generated files from container to host
docker cp taskara-web:/app/scripts/schema-comparison-report.md ./schema-comparison-report.md
docker cp taskara-web:/app/scripts/migration-sync.sql ./migration-sync.sql
```

**Output:**
- `schema-comparison-report.md` - Human-readable report of all differences
- `migration-sync.sql` - SQL script to apply changes

---

### Step 2: Review the Differences

```bash
# View the comparison report
cat schema-comparison-report.md

# Or view the migration SQL
cat migration-sync.sql
```

**Check for:**
- ✓ Missing tables/columns that need to be added
- ✓ Extra columns that will be dropped (data loss!)
- ✓ Modified columns (type changes can cause data loss!)
- ✓ Missing indexes
- ✓ Foreign key constraints

---

### Step 3: Backup Your Database (CRITICAL!)

```bash
# Manual backup
mysqldump -h srv557.hstgr.io \
  -u u744630877_tasks \
  -p'###Taskstasks123' \
  u744630877_tasks > backup-$(date +%Y%m%d).sql

# Verify backup was created
ls -lh backup-*.sql
```

**Keep this backup safe!** You'll need it if something goes wrong.

---

### Step 4: Apply the Migration (Automated)

```bash
cd /taskara

# Make the script executable
chmod +x scripts/sync-database-vps.sh

# Run the synchronization script
./scripts/sync-database-vps.sh
```

**This script will:**
1. ✓ Show you a preview of the migration
2. ✓ Ask for confirmation
3. ✓ Create an automatic backup
4. ✓ Apply the migration SQL
5. ✓ Verify the synchronization
6. ✓ Generate a post-sync report

---

## 🔧 Manual Synchronization (Alternative)

If you prefer to do it manually:

### 1. Create Backup
```bash
mysqldump -h srv557.hstgr.io -u u744630877_tasks -p u744630877_tasks > backup.sql
```

### 2. Review Migration SQL
```bash
cat migration-sync.sql
```

### 3. Apply Migration
```bash
mysql -h srv557.hstgr.io -u u744630877_tasks -p u744630877_tasks < migration-sync.sql
```

### 4. Verify
```bash
# Run comparison again to check
./scripts/run-schema-compare-vps.sh
```

---

## ⚠️ Safety Checklist

Before running the synchronization:

- [ ] **Backup created** - You have a recent database backup
- [ ] **Migration reviewed** - You've read the migration SQL
- [ ] **Data loss checked** - No important columns will be dropped
- [ ] **Type changes verified** - Column type changes won't break data
- [ ] **Tested locally** - Migration works on a test database
- [ ] **Maintenance window** - Users are notified (if needed)
- [ ] **Rollback plan** - You know how to restore from backup

---

## 🚨 Rollback Procedure

If something goes wrong after applying the migration:

### Restore from Backup
```bash
# Stop the application first
docker compose down

# Restore the backup
mysql -h srv557.hstgr.io \
  -u u744630877_tasks \
  -p'###Taskstasks123' \
  u744630877_tasks < backup-YYYYMMDD.sql

# Restart the application
docker compose up -d
```

---

## 📊 Common Scenarios

### Scenario 1: Only Adding New Columns/Tables
**Risk:** Low  
**Action:** Safe to apply directly

### Scenario 2: Dropping Columns
**Risk:** HIGH - Data will be lost!  
**Action:** 
1. Export data from those columns first
2. Verify you don't need that data
3. Apply migration

### Scenario 3: Changing Column Types
**Risk:** Medium - Data might be truncated or lost  
**Action:**
1. Check if existing data fits new type
2. Test conversion on a copy first
3. Apply migration

### Scenario 4: Adding Foreign Keys
**Risk:** Medium - Can fail if data doesn't match  
**Action:**
1. Verify referential integrity first
2. Clean up orphaned records
3. Apply migration

---

## 🔍 Verification Steps

After synchronization:

### 1. Check for Errors
```bash
# View application logs
docker logs taskara-web --tail 100
```

### 2. Run Comparison Again
```bash
./scripts/run-schema-compare-vps.sh
docker cp taskara-web:/app/scripts/schema-comparison-report.md ./report-after.md
cat report-after.md
```

Should show: **"Total Differences Found: 0"**

### 3. Test Application
- [ ] Login works
- [ ] Create/read/update/delete operations work
- [ ] No database errors in logs
- [ ] All features functioning normally

---

## 📝 Example Workflow

```bash
# 1. Compare schemas
cd /taskara
./scripts/run-schema-compare-vps.sh
docker cp taskara-web:/app/scripts/schema-comparison-report.md ./
docker cp taskara-web:/app/scripts/migration-sync.sql ./

# 2. Review
cat schema-comparison-report.md
cat migration-sync.sql

# 3. Sync (with automatic backup)
chmod +x scripts/sync-database-vps.sh
./scripts/sync-database-vps.sh

# 4. Verify
cat schema-comparison-report-after.md
docker logs taskara-web --tail 50

# 5. Test application
curl https://taskara.compumacy.com
```

---

## 🆘 Troubleshooting

### Error: "Access denied"
- Check database credentials in `.env.production`
- Verify user has ALTER, CREATE, DROP permissions

### Error: "Cannot add foreign key constraint"
- Check for orphaned records
- Verify referenced tables exist
- Clean up data first

### Error: "Duplicate column name"
- Migration already partially applied
- Review what's already changed
- Adjust migration SQL accordingly

### Error: "Table doesn't exist"
- Check table names (case-sensitive on Linux)
- Verify database name is correct

---

## 📞 Support

If you encounter issues:

1. **Check the backup** - Make sure it exists and is complete
2. **Review logs** - `docker logs taskara-web`
3. **Check migration SQL** - Look for syntax errors
4. **Test on local copy** - Apply migration to local DB first

---

**Remember: Always backup before making schema changes!** 🔒
