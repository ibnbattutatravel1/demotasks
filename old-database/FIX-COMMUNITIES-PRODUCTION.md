# Fix for Communities 500 Error on Production

## Problem
The communities feature is failing on production (https://taskara.compumacy.com/admin/communities) with a 500 error because the community tables are missing from the MySQL database.

## Root Cause
The community tables were defined in the SQLite schema but were never added to the MySQL schema (`lib/db/schema-mysql.ts`). The production server uses MySQL while development uses SQLite.

## Solution Applied

### 1. Updated MySQL Schema
Added all 10 community tables to `lib/db/schema-mysql.ts`:
- `communities`
- `community_members`
- `community_posts`
- `community_comments`
- `community_files`
- `community_vault`
- `community_vault_access_log`
- `community_voice_notes`
- `community_categories`
- `community_activity`

### 2. Created Migration SQL
Created `scripts/migrate-to-mysql/add-community-tables.sql` with all table definitions.

## How to Apply the Fix on Production

### Option 1: Run the SQL Migration (Recommended)
```bash
# SSH into your VPS
ssh root@65.181.118.82

# Navigate to the project directory
cd /path/to/your/project

# Run the migration SQL file
mysql -u your_mysql_user -p your_database_name < scripts/migrate-to-mysql/add-community-tables.sql
```

### Option 2: Use Drizzle Push (Alternative)
```bash
# SSH into your VPS
ssh root@65.181.118.82

# Navigate to the project directory
cd /path/to/your/project

# Install dependencies if needed
npm install

# Push schema changes to MySQL
npx drizzle-kit push:mysql
```

### Option 3: Manual SQL Execution
1. Connect to your MySQL database
2. Copy the contents of `scripts/migrate-to-mysql/add-community-tables.sql`
3. Execute the SQL statements

## Verification

After applying the migration, verify the fix:

1. Visit https://taskara.compumacy.com/admin/communities
2. The page should load without 500 errors
3. Communities should be visible (if any exist)

## Additional Notes

- The schema changes are backward compatible
- No data loss will occur
- All tables use `IF NOT EXISTS` to prevent errors if tables already exist
- Foreign key constraints are properly set up
- Indexes are added for performance

## Files Modified

1. `lib/db/schema-mysql.ts` - Added community table definitions
2. `scripts/migrate-to-mysql/add-community-tables.sql` - Migration SQL file (new)
3. `FIX-COMMUNITIES-PRODUCTION.md` - This documentation (new)

## Related Issues Fixed

This also fixes the datetime format issue for meetings that was resolved in a previous commit by adding `toMySQLDatetime()` conversion functions.
