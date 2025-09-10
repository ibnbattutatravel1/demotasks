import Database from 'better-sqlite3'
import path from 'path'

const DB_FILE = process.env.SQLITE_PATH ?? path.join(process.cwd(), 'sqlite', 'data.db')

function columnExists(db: Database.Database, table: string, column: string) {
  const stmt = db.prepare(`PRAGMA table_info(${table});`)
  const rows = stmt.all() as Array<{ name: string }>
  return rows.some((r) => r.name === column)
}

function main() {
  const db = new Database(DB_FILE)
  const exists = columnExists(db, 'users', 'status')
  if (exists) {
    console.log('status column already exists')
    return
  }
  db.prepare('ALTER TABLE users ADD COLUMN status TEXT').run()
  console.log('Added users.status column')
}

main()
