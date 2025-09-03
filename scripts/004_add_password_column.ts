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
  const exists = columnExists(db, 'users', 'password_hash')
  if (exists) {
    console.log('password_hash already exists')
    return
  }
  db.prepare('ALTER TABLE users ADD COLUMN password_hash TEXT').run()
  console.log('Added password_hash column')
}

main()
