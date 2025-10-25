# Database Schema Comparison Tool

Automated tool to compare and synchronize database structures between remote (production) and local (development) databases.

---

## 🚀 Quick Start

### 1. Add Database Credentials to `.env`

Add these variables to your `.env` file:

```env
# Remote Database (Production)
REMOTE_DB_HOST=your_remote_host_or_ip
REMOTE_DB_PORT=3306
REMOTE_DB_USER=your_username
REMOTE_DB_PASSWORD=your_password
REMOTE_DB_NAME=u744630877_tasks

# Local Database (Development)
# If not specified, will use your existing DB_* variables
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_local_password
DB_NAME=u744630877_tasks
```

### 2. Run the Comparison

```bash
npm run db:compare
```

This will:
- ✅ Connect to both remote and local databases
- ✅ Extract complete schema information
- ✅ Compare all tables, columns, indexes, and foreign keys
- ✅ Generate a detailed comparison report: `scripts/schema-comparison-report.md`
- ✅ Generate migration SQL: `scripts/migration-sync.sql`

---

## 📊 What It Compares

The tool analyzes and compares:

### Tables
- Missing tables (exist in local but not in remote)
- Extra tables (exist in remote but not in local)

### Columns
- Missing columns
- Extra columns
- Modified columns (type, nullable, default value, etc.)

### Indexes
- Missing indexes
- Extra indexes
- Index definitions

### Foreign Keys
- Missing foreign key constraints
- Extra foreign key constraints
- Constraint rules (ON UPDATE, ON DELETE)

---

## 📁 Output Files

After running the tool, you'll get:

### 1. `scripts/schema-comparison-report.md`
A human-readable Markdown report showing:
- Summary of all differences
- Detailed breakdown by category
- Side-by-side comparisons for modified columns

### 2. `scripts/migration-sync.sql`
A ready-to-execute SQL migration script that will:
- Create missing tables
- Add missing columns
- Modify changed columns
- Add missing indexes
- Add missing foreign keys
- Drop extra elements (commented out for safety)

---

## ⚠️ Important Safety Notes

### Before Running Migration SQL:

1. **BACKUP YOUR DATABASE FIRST!**
   ```bash
   mysqldump -h [HOST] -u [USER] -p[PASSWORD] [DATABASE] > backup-$(date +%Y%m%d).sql
   ```

2. **Review the migration SQL carefully**
   - Check all DROP statements (they delete data!)
   - Verify column modifications won't cause data loss
   - Ensure foreign key constraints are valid

3. **Test on a copy first**
   - Apply the migration to a test database
   - Verify your application still works
   - Check data integrity

4. **Apply in stages**
   - Don't run the entire script at once
   - Execute section by section
   - Verify each step before proceeding

---

## 🔧 Usage Examples

### Basic Comparison
```bash
npm run db:compare
```

### With Custom Environment Variables
```bash
REMOTE_DB_HOST=65.181.118.82 \
REMOTE_DB_USER=root \
REMOTE_DB_PASSWORD=mypass \
REMOTE_DB_NAME=u744630877_tasks \
npm run db:compare
```

### Compare and Review
```bash
npm run db:sync
# This runs the comparison and reminds you to review the SQL
```

---

## 📖 Understanding the Output

### Example Report Section:

```markdown
### Columns
- **Missing in Remote** (3):
  - users.profile_image (varchar(255))
  - tasks.priority (enum('low','medium','high'))
  - projects.archived_at (datetime)

- **Modified** (2):
  - users.email
    - Remote: varchar(100) NO
    - Local:  varchar(255) NO
  - tasks.status
    - Remote: varchar(20) YES
    - Local:  enum('pending','in_progress','completed') NO
```

This tells you:
- 3 columns exist in your local schema but not in remote
- 2 columns have different definitions between remote and local

---

## 🛠️ Troubleshooting

### Connection Issues

**Error: "Access denied for user"**
- Check your database credentials in `.env`
- Verify the user has SELECT permissions on `information_schema`

**Error: "Unknown database"**
- Verify the database name is correct
- Check if the database exists: `SHOW DATABASES;`

**Error: "Can't connect to MySQL server"**
- Check if the host/IP is correct
- Verify the port (default: 3306)
- Check firewall rules
- Ensure MySQL is running

### Missing Dependencies

If you get module errors, install dependencies:
```bash
npm install
```

---

## 🎯 Common Scenarios

### Scenario 1: Production DB is Behind
Your local schema has new features that production doesn't have yet.

**Solution:**
1. Run `npm run db:compare`
2. Review `migration-sync.sql`
3. Apply the migration to production

### Scenario 2: Production DB Has Manual Changes
Someone made manual changes to production that aren't in your code.

**Solution:**
1. Run `npm run db:compare`
2. Review the "Extra" items in the report
3. Decide whether to:
   - Update your local schema to match
   - Remove the extra items from production

### Scenario 3: Column Type Mismatch
A column has different types in remote vs local.

**Solution:**
1. Check the "Modified" section in the report
2. Verify which definition is correct
3. Update the appropriate database
4. **Be careful**: Type changes can cause data loss!

---

## 🔄 Workflow Recommendation

### Regular Synchronization Workflow:

1. **Before deploying new features:**
   ```bash
   npm run db:compare
   ```

2. **Review the differences:**
   - Check `scripts/schema-comparison-report.md`
   - Understand what will change

3. **Backup production:**
   ```bash
   mysqldump -h [HOST] -u [USER] -p [DB] > backup.sql
   ```

4. **Apply migration:**
   ```bash
   mysql -h [HOST] -u [USER] -p [DB] < scripts/migration-sync.sql
   ```

5. **Verify:**
   ```bash
   npm run db:compare
   # Should show no differences
   ```

---

## 📝 Notes

- The tool is **read-only** - it never modifies your databases automatically
- All changes must be manually reviewed and applied
- The generated SQL is a starting point - you may need to customize it
- Always test migrations on a non-production database first
- Keep your Drizzle schema files (`lib/db/schema-mysql.ts`) up to date

---

## 🆘 Need Help?

If you encounter issues:

1. Check the console output for detailed error messages
2. Verify your database credentials
3. Ensure both databases are accessible
4. Check that you have proper permissions
5. Review the generated report for clues

---

## 🔗 Related Scripts

- `npm run db:studio:mysql` - Open Drizzle Studio for MySQL
- `npm run test:mysql` - Test MySQL connection
- `npm run migrate:mysql:setup` - Push Drizzle schema to MySQL
- `npm run db:generate` - Generate Drizzle migrations

---

**Remember: Always backup before making schema changes!** 🔒
