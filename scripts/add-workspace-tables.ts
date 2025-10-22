/**
 * Migration script to add workspace tables (project_notes and project_documents)
 * Run with: npx tsx scripts/add-workspace-tables.ts
 */

import { db } from '../lib/db/client'
import { sql } from 'drizzle-orm'

async function addWorkspaceTables() {
  console.log('🚀 Adding workspace tables to database...')

  try {
    // Create project_notes table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS project_notes (
        id VARCHAR(191) PRIMARY KEY,
        project_id VARCHAR(191) NOT NULL,
        title VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
        created_by_id VARCHAR(191) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)
    console.log('✅ Created project_notes table')

    // Create project_documents table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS project_documents (
        id VARCHAR(191) PRIMARY KEY,
        project_id VARCHAR(191) NOT NULL,
        name VARCHAR(500) NOT NULL,
        size INT NOT NULL,
        type VARCHAR(100) NOT NULL,
        url VARCHAR(1000) NOT NULL,
        uploaded_by_id VARCHAR(191) NOT NULL,
        uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)
    console.log('✅ Created project_documents table')

    // Create indexes for better query performance
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_project_notes_project_id ON project_notes(project_id)
    `)
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_project_notes_created_by ON project_notes(created_by_id)
    `)
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_project_notes_pinned ON project_notes(is_pinned)
    `)
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_project_documents_project_id ON project_documents(project_id)
    `)
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_project_documents_uploaded_by ON project_documents(uploaded_by_id)
    `)
    
    console.log('✅ Created indexes')

    console.log('✨ Migration completed successfully!')
    console.log('')
    console.log('📝 New features available:')
    console.log('   - Project Notes (collaborative workspace for team notes)')
    console.log('   - Project Documents (file sharing and management)')
    console.log('')
    console.log('🔐 Permissions:')
    console.log('   - Admin & Project Lead: Full control (create, edit, delete all)')
    console.log('   - Team Members: Can create and edit own items')
    console.log('')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

// Run the migration
addWorkspaceTables()
  .then(() => {
    console.log('Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Failed:', error)
    process.exit(1)
  })
