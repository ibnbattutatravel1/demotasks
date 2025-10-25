#!/usr/bin/env tsx
/**
 * Database Schema Comparison Tool
 * Automatically compares remote and local database structures
 * and generates migration SQL to synchronize them
 */

import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Configuration
// ============================================================================

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

interface TableInfo {
  tableName: string;
  engine: string;
  collation: string;
  comment: string;
}

interface ColumnInfo {
  tableName: string;
  columnName: string;
  position: number;
  dataType: string;
  columnType: string;
  isNullable: string;
  columnDefault: string | null;
  extra: string;
  columnKey: string;
  comment: string;
}

interface IndexInfo {
  tableName: string;
  indexName: string;
  columnName: string;
  nonUnique: number;
  seqInIndex: number;
  indexType: string;
}

interface ForeignKeyInfo {
  constraintName: string;
  tableName: string;
  columnName: string;
  referencedTableName: string;
  referencedColumnName: string;
  updateRule: string;
  deleteRule: string;
}

interface SchemaData {
  tables: TableInfo[];
  columns: ColumnInfo[];
  indexes: IndexInfo[];
  foreignKeys: ForeignKeyInfo[];
}

// ============================================================================
// Database Connection Helper
// ============================================================================

async function connectToDatabase(config: DatabaseConfig) {
  try {
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      multipleStatements: true,
    });
    console.log(`✅ Connected to ${config.database} at ${config.host}`);
    return connection;
  } catch (error) {
    console.error(`❌ Failed to connect to ${config.database}:`, error);
    throw error;
  }
}

// ============================================================================
// Schema Extraction Functions
// ============================================================================

async function extractSchema(connection: mysql.Connection): Promise<SchemaData> {
  console.log('📊 Extracting schema information...');

  // Get tables
  const [tables] = await connection.query<any[]>(`
    SELECT 
      TABLE_NAME as tableName,
      ENGINE as engine,
      TABLE_COLLATION as collation,
      TABLE_COMMENT as comment
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_TYPE = 'BASE TABLE'
    ORDER BY TABLE_NAME
  `);

  // Get columns
  const [columns] = await connection.query<any[]>(`
    SELECT 
      TABLE_NAME as tableName,
      COLUMN_NAME as columnName,
      ORDINAL_POSITION as position,
      DATA_TYPE as dataType,
      COLUMN_TYPE as columnType,
      IS_NULLABLE as isNullable,
      COLUMN_DEFAULT as columnDefault,
      EXTRA as extra,
      COLUMN_KEY as columnKey,
      COLUMN_COMMENT as comment
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    ORDER BY TABLE_NAME, ORDINAL_POSITION
  `);

  // Get indexes
  const [indexes] = await connection.query<any[]>(`
    SELECT 
      TABLE_NAME as tableName,
      INDEX_NAME as indexName,
      COLUMN_NAME as columnName,
      NON_UNIQUE as nonUnique,
      SEQ_IN_INDEX as seqInIndex,
      INDEX_TYPE as indexType
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
    ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX
  `);

  // Get foreign keys
  const [foreignKeys] = await connection.query<any[]>(`
    SELECT 
      kcu.CONSTRAINT_NAME as constraintName,
      kcu.TABLE_NAME as tableName,
      kcu.COLUMN_NAME as columnName,
      kcu.REFERENCED_TABLE_NAME as referencedTableName,
      kcu.REFERENCED_COLUMN_NAME as referencedColumnName,
      rc.UPDATE_RULE as updateRule,
      rc.DELETE_RULE as deleteRule
    FROM information_schema.KEY_COLUMN_USAGE kcu
    JOIN information_schema.REFERENTIAL_CONSTRAINTS rc 
      ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
      AND kcu.TABLE_SCHEMA = rc.CONSTRAINT_SCHEMA
    WHERE kcu.TABLE_SCHEMA = DATABASE()
      AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
    ORDER BY kcu.TABLE_NAME, kcu.CONSTRAINT_NAME
  `);

  console.log(`  ✓ Found ${tables.length} tables`);
  console.log(`  ✓ Found ${columns.length} columns`);
  console.log(`  ✓ Found ${indexes.length} indexes`);
  console.log(`  ✓ Found ${foreignKeys.length} foreign keys`);

  return {
    tables: tables as TableInfo[],
    columns: columns as ColumnInfo[],
    indexes: indexes as IndexInfo[],
    foreignKeys: foreignKeys as ForeignKeyInfo[],
  };
}

// ============================================================================
// Schema Comparison Functions
// ============================================================================

interface SchemaDifferences {
  missingTables: string[];
  extraTables: string[];
  missingColumns: Array<{ table: string; column: string; definition: ColumnInfo }>;
  extraColumns: Array<{ table: string; column: string }>;
  modifiedColumns: Array<{ table: string; column: string; remote: ColumnInfo; local: ColumnInfo }>;
  missingIndexes: Array<{ table: string; index: string; columns: string[] }>;
  extraIndexes: Array<{ table: string; index: string }>;
  missingForeignKeys: ForeignKeyInfo[];
  extraForeignKeys: ForeignKeyInfo[];
}

function compareSchemas(remote: SchemaData, local: SchemaData): SchemaDifferences {
  console.log('\n🔍 Comparing schemas...');

  const remoteTables = new Set(remote.tables.map(t => t.tableName));
  const localTables = new Set(local.tables.map(t => t.tableName));

  // Compare tables
  const missingTables = Array.from(localTables).filter(t => !remoteTables.has(t));
  const extraTables = Array.from(remoteTables).filter(t => !localTables.has(t));

  // Compare columns
  const remoteColumnMap = new Map<string, ColumnInfo>();
  remote.columns.forEach(col => {
    remoteColumnMap.set(`${col.tableName}.${col.columnName}`, col);
  });

  const localColumnMap = new Map<string, ColumnInfo>();
  local.columns.forEach(col => {
    localColumnMap.set(`${col.tableName}.${col.columnName}`, col);
  });

  const missingColumns: Array<{ table: string; column: string; definition: ColumnInfo }> = [];
  const modifiedColumns: Array<{ table: string; column: string; remote: ColumnInfo; local: ColumnInfo }> = [];

  localColumnMap.forEach((localCol, key) => {
    const remoteCol = remoteColumnMap.get(key);
    if (!remoteCol) {
      // Only add if the table exists in remote
      if (remoteTables.has(localCol.tableName)) {
        missingColumns.push({
          table: localCol.tableName,
          column: localCol.columnName,
          definition: localCol,
        });
      }
    } else if (
      remoteCol.columnType !== localCol.columnType ||
      remoteCol.isNullable !== localCol.isNullable ||
      remoteCol.columnDefault !== localCol.columnDefault ||
      remoteCol.extra !== localCol.extra
    ) {
      modifiedColumns.push({
        table: localCol.tableName,
        column: localCol.columnName,
        remote: remoteCol,
        local: localCol,
      });
    }
  });

  const extraColumns: Array<{ table: string; column: string }> = [];
  remoteColumnMap.forEach((remoteCol, key) => {
    if (!localColumnMap.has(key) && localTables.has(remoteCol.tableName)) {
      extraColumns.push({
        table: remoteCol.tableName,
        column: remoteCol.columnName,
      });
    }
  });

  // Compare indexes
  const groupIndexes = (indexes: IndexInfo[]) => {
    const grouped = new Map<string, string[]>();
    indexes.forEach(idx => {
      const key = `${idx.tableName}.${idx.indexName}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(idx.columnName);
    });
    return grouped;
  };

  const remoteIndexes = groupIndexes(remote.indexes);
  const localIndexes = groupIndexes(local.indexes);

  const missingIndexes: Array<{ table: string; index: string; columns: string[] }> = [];
  localIndexes.forEach((columns, key) => {
    if (!remoteIndexes.has(key)) {
      const [table, index] = key.split('.');
      if (remoteTables.has(table)) {
        missingIndexes.push({ table, index, columns });
      }
    }
  });

  const extraIndexes: Array<{ table: string; index: string }> = [];
  remoteIndexes.forEach((columns, key) => {
    if (!localIndexes.has(key)) {
      const [table, index] = key.split('.');
      if (localTables.has(table)) {
        extraIndexes.push({ table, index });
      }
    }
  });

  // Compare foreign keys
  const remoteFKMap = new Map(
    remote.foreignKeys.map(fk => [`${fk.tableName}.${fk.constraintName}`, fk])
  );
  const localFKMap = new Map(
    local.foreignKeys.map(fk => [`${fk.tableName}.${fk.constraintName}`, fk])
  );

  const missingForeignKeys = Array.from(localFKMap.values()).filter(
    fk => !remoteFKMap.has(`${fk.tableName}.${fk.constraintName}`) && remoteTables.has(fk.tableName)
  );

  const extraForeignKeys = Array.from(remoteFKMap.values()).filter(
    fk => !localFKMap.has(`${fk.tableName}.${fk.constraintName}`) && localTables.has(fk.tableName)
  );

  return {
    missingTables,
    extraTables,
    missingColumns,
    extraColumns,
    modifiedColumns,
    missingIndexes,
    extraIndexes,
    missingForeignKeys,
    extraForeignKeys,
  };
}

// ============================================================================
// Migration SQL Generation
// ============================================================================

function generateMigrationSQL(differences: SchemaDifferences, remoteSchema: SchemaData): string {
  const sql: string[] = [];

  sql.push('-- ============================================================================');
  sql.push('-- DATABASE SYNCHRONIZATION MIGRATION');
  sql.push(`-- Generated: ${new Date().toISOString()}`);
  sql.push('-- ============================================================================');
  sql.push('-- IMPORTANT: Review this script carefully before executing!');
  sql.push('-- BACKUP your database before running this migration!');
  sql.push('-- ============================================================================\n');

  sql.push('START TRANSACTION;\n');

  // 1. Create missing tables
  if (differences.missingTables.length > 0) {
    sql.push('-- ============================================================================');
    sql.push('-- STEP 1: Create Missing Tables');
    sql.push('-- ============================================================================\n');
    differences.missingTables.forEach(tableName => {
      sql.push(`-- TODO: Add CREATE TABLE statement for: ${tableName}`);
      sql.push(`-- You need to provide the full table definition\n`);
    });
  }

  // 2. Drop extra foreign keys first (to avoid constraint issues)
  if (differences.extraForeignKeys.length > 0) {
    sql.push('-- ============================================================================');
    sql.push('-- STEP 2: Drop Extra Foreign Keys');
    sql.push('-- ============================================================================\n');
    differences.extraForeignKeys.forEach(fk => {
      sql.push(`ALTER TABLE \`${fk.tableName}\` DROP FOREIGN KEY \`${fk.constraintName}\`;`);
    });
    sql.push('');
  }

  // 3. Drop extra indexes
  if (differences.extraIndexes.length > 0) {
    sql.push('-- ============================================================================');
    sql.push('-- STEP 3: Drop Extra Indexes');
    sql.push('-- ============================================================================\n');
    differences.extraIndexes.forEach(idx => {
      if (idx.index !== 'PRIMARY') {
        sql.push(`ALTER TABLE \`${idx.table}\` DROP INDEX \`${idx.index}\`;`);
      }
    });
    sql.push('');
  }

  // 4. Drop extra columns
  if (differences.extraColumns.length > 0) {
    sql.push('-- ============================================================================');
    sql.push('-- STEP 4: Drop Extra Columns');
    sql.push('-- ============================================================================');
    sql.push('-- WARNING: This will delete data! Review carefully!\n');
    differences.extraColumns.forEach(col => {
      sql.push(`-- ALTER TABLE \`${col.table}\` DROP COLUMN \`${col.column}\`;`);
    });
    sql.push('');
  }

  // 5. Add missing columns
  if (differences.missingColumns.length > 0) {
    sql.push('-- ============================================================================');
    sql.push('-- STEP 5: Add Missing Columns');
    sql.push('-- ============================================================================\n');
    differences.missingColumns.forEach(col => {
      const def = col.definition;
      let columnDef = `\`${def.columnName}\` ${def.columnType}`;
      
      if (def.isNullable === 'NO') {
        columnDef += ' NOT NULL';
      }
      
      if (def.columnDefault !== null) {
        columnDef += ` DEFAULT ${def.columnDefault}`;
      }
      
      if (def.extra) {
        columnDef += ` ${def.extra}`;
      }
      
      if (def.comment) {
        columnDef += ` COMMENT '${def.comment.replace(/'/g, "''")}'`;
      }

      sql.push(`ALTER TABLE \`${def.tableName}\` ADD COLUMN ${columnDef};`);
    });
    sql.push('');
  }

  // 6. Modify columns
  if (differences.modifiedColumns.length > 0) {
    sql.push('-- ============================================================================');
    sql.push('-- STEP 6: Modify Columns');
    sql.push('-- ============================================================================\n');
    differences.modifiedColumns.forEach(col => {
      const def = col.local;
      let columnDef = `\`${def.columnName}\` ${def.columnType}`;
      
      if (def.isNullable === 'NO') {
        columnDef += ' NOT NULL';
      }
      
      if (def.columnDefault !== null) {
        columnDef += ` DEFAULT ${def.columnDefault}`;
      }
      
      if (def.extra) {
        columnDef += ` ${def.extra}`;
      }

      sql.push(`-- Remote: ${col.remote.columnType} ${col.remote.isNullable} ${col.remote.columnDefault || ''}`);
      sql.push(`-- Local:  ${col.local.columnType} ${col.local.isNullable} ${col.local.columnDefault || ''}`);
      sql.push(`ALTER TABLE \`${def.tableName}\` MODIFY COLUMN ${columnDef};`);
      sql.push('');
    });
  }

  // 7. Add missing indexes
  if (differences.missingIndexes.length > 0) {
    sql.push('-- ============================================================================');
    sql.push('-- STEP 7: Add Missing Indexes');
    sql.push('-- ============================================================================\n');
    differences.missingIndexes.forEach(idx => {
      if (idx.index !== 'PRIMARY') {
        const columns = idx.columns.map(c => `\`${c}\``).join(', ');
        sql.push(`CREATE INDEX \`${idx.index}\` ON \`${idx.table}\` (${columns});`);
      }
    });
    sql.push('');
  }

  // 8. Add missing foreign keys
  if (differences.missingForeignKeys.length > 0) {
    sql.push('-- ============================================================================');
    sql.push('-- STEP 8: Add Missing Foreign Keys');
    sql.push('-- ============================================================================\n');
    differences.missingForeignKeys.forEach(fk => {
      sql.push(`ALTER TABLE \`${fk.tableName}\``);
      sql.push(`  ADD CONSTRAINT \`${fk.constraintName}\``);
      sql.push(`  FOREIGN KEY (\`${fk.columnName}\`)`);
      sql.push(`  REFERENCES \`${fk.referencedTableName}\` (\`${fk.referencedColumnName}\`)`);
      sql.push(`  ON UPDATE ${fk.updateRule}`);
      sql.push(`  ON DELETE ${fk.deleteRule};`);
      sql.push('');
    });
  }

  sql.push('COMMIT;\n');
  sql.push('-- ============================================================================');
  sql.push('-- Migration Complete!');
  sql.push('-- ============================================================================');

  return sql.join('\n');
}

// ============================================================================
// Report Generation
// ============================================================================

function generateReport(differences: SchemaDifferences): string {
  const lines: string[] = [];

  lines.push('# Database Schema Comparison Report');
  lines.push(`Generated: ${new Date().toISOString()}\n`);

  const totalDifferences =
    differences.missingTables.length +
    differences.extraTables.length +
    differences.missingColumns.length +
    differences.extraColumns.length +
    differences.modifiedColumns.length +
    differences.missingIndexes.length +
    differences.extraIndexes.length +
    differences.missingForeignKeys.length +
    differences.extraForeignKeys.length;

  lines.push(`## Summary`);
  lines.push(`Total Differences Found: **${totalDifferences}**\n`);

  // Tables
  if (differences.missingTables.length > 0 || differences.extraTables.length > 0) {
    lines.push(`### Tables`);
    if (differences.missingTables.length > 0) {
      lines.push(`- **Missing in Remote** (${differences.missingTables.length}):`);
      differences.missingTables.forEach(t => lines.push(`  - ${t}`));
    }
    if (differences.extraTables.length > 0) {
      lines.push(`- **Extra in Remote** (${differences.extraTables.length}):`);
      differences.extraTables.forEach(t => lines.push(`  - ${t}`));
    }
    lines.push('');
  }

  // Columns
  if (differences.missingColumns.length > 0 || differences.extraColumns.length > 0 || differences.modifiedColumns.length > 0) {
    lines.push(`### Columns`);
    if (differences.missingColumns.length > 0) {
      lines.push(`- **Missing in Remote** (${differences.missingColumns.length}):`);
      differences.missingColumns.forEach(c => 
        lines.push(`  - ${c.table}.${c.column} (${c.definition.columnType})`)
      );
    }
    if (differences.extraColumns.length > 0) {
      lines.push(`- **Extra in Remote** (${differences.extraColumns.length}):`);
      differences.extraColumns.forEach(c => lines.push(`  - ${c.table}.${c.column}`));
    }
    if (differences.modifiedColumns.length > 0) {
      lines.push(`- **Modified** (${differences.modifiedColumns.length}):`);
      differences.modifiedColumns.forEach(c => {
        lines.push(`  - ${c.table}.${c.column}`);
        lines.push(`    - Remote: ${c.remote.columnType} ${c.remote.isNullable}`);
        lines.push(`    - Local:  ${c.local.columnType} ${c.local.isNullable}`);
      });
    }
    lines.push('');
  }

  // Indexes
  if (differences.missingIndexes.length > 0 || differences.extraIndexes.length > 0) {
    lines.push(`### Indexes`);
    if (differences.missingIndexes.length > 0) {
      lines.push(`- **Missing in Remote** (${differences.missingIndexes.length}):`);
      differences.missingIndexes.forEach(i => 
        lines.push(`  - ${i.table}.${i.index} (${i.columns.join(', ')})`)
      );
    }
    if (differences.extraIndexes.length > 0) {
      lines.push(`- **Extra in Remote** (${differences.extraIndexes.length}):`);
      differences.extraIndexes.forEach(i => lines.push(`  - ${i.table}.${i.index}`));
    }
    lines.push('');
  }

  // Foreign Keys
  if (differences.missingForeignKeys.length > 0 || differences.extraForeignKeys.length > 0) {
    lines.push(`### Foreign Keys`);
    if (differences.missingForeignKeys.length > 0) {
      lines.push(`- **Missing in Remote** (${differences.missingForeignKeys.length}):`);
      differences.missingForeignKeys.forEach(fk => 
        lines.push(`  - ${fk.tableName}.${fk.columnName} → ${fk.referencedTableName}.${fk.referencedColumnName}`)
      );
    }
    if (differences.extraForeignKeys.length > 0) {
      lines.push(`- **Extra in Remote** (${differences.extraForeignKeys.length}):`);
      differences.extraForeignKeys.forEach(fk => 
        lines.push(`  - ${fk.tableName}.${fk.columnName} → ${fk.referencedTableName}.${fk.referencedColumnName}`)
      );
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ============================================================================
// Main Function
// ============================================================================

async function main() {
  console.log('🚀 Database Schema Comparison Tool\n');

  // Load configuration from environment or prompt
  const remoteConfig: DatabaseConfig = {
    host: process.env.REMOTE_DB_HOST || 'localhost',
    port: parseInt(process.env.REMOTE_DB_PORT || '3306'),
    user: process.env.REMOTE_DB_USER || 'root',
    password: process.env.REMOTE_DB_PASSWORD || '',
    database: process.env.REMOTE_DB_NAME || '',
  };

  const localConfig: DatabaseConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
  };

  console.log('Configuration:');
  console.log(`  Remote: ${remoteConfig.user}@${remoteConfig.host}:${remoteConfig.port}/${remoteConfig.database}`);
  console.log(`  Local:  ${localConfig.user}@${localConfig.host}:${localConfig.port}/${localConfig.database}\n`);

  let remoteConnection: mysql.Connection | null = null;
  let localConnection: mysql.Connection | null = null;

  try {
    // Connect to both databases
    console.log('📡 Connecting to databases...');
    remoteConnection = await connectToDatabase(remoteConfig);
    localConnection = await connectToDatabase(localConfig);

    // Extract schemas
    console.log('\n📊 Extracting remote schema...');
    const remoteSchema = await extractSchema(remoteConnection);

    console.log('\n📊 Extracting local schema...');
    const localSchema = await extractSchema(localConnection);

    // Compare schemas
    const differences = compareSchemas(remoteSchema, localSchema);

    // Generate report
    const report = generateReport(differences);
    const reportPath = path.join(process.cwd(), 'scripts', 'schema-comparison-report.md');
    fs.writeFileSync(reportPath, report);
    console.log(`\n✅ Report saved to: ${reportPath}`);

    // Generate migration SQL
    const migrationSQL = generateMigrationSQL(differences, remoteSchema);
    const migrationPath = path.join(process.cwd(), 'scripts', 'migration-sync.sql');
    fs.writeFileSync(migrationPath, migrationSQL);
    console.log(`✅ Migration SQL saved to: ${migrationPath}`);

    // Print summary
    console.log('\n' + report);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    // Close connections
    if (remoteConnection) await remoteConnection.end();
    if (localConnection) await localConnection.end();
    console.log('\n✅ Done!');
  }
}

// Run the tool
main().catch(console.error);
