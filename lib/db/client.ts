import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import path from 'path'
import fs from 'fs'

const DB_FILE = process.env.SQLITE_PATH ?? path.join(process.cwd(), 'sqlite', 'data.db')

// Ensure database directory exists
const dbDir = path.dirname(DB_FILE)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

// Create a connection
const sqlite = new Database(DB_FILE)

// Initialize Drizzle with the schema for type-safety
export const db = drizzle(sqlite, { schema })

export type DB = typeof db
export * as dbSchema from './schema'
