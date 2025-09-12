import * as schema from './schema'
import { createClient } from '@libsql/client'
import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql'
import path from 'path'
import fs from 'fs'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

// Dynamic DB client to support Vercel serverless via LibSQL (Turso) or local SQLite
// If LIBSQL_URL is provided, use libsql client (remote, persistent). Otherwise use better-sqlite3 (local dev).

function makeDb() {
  if (process.env.LIBSQL_URL) {
    const client = createClient({
      url: process.env.LIBSQL_URL!,
      authToken: process.env.LIBSQL_AUTH_TOKEN,
    })
    return drizzleLibsql(client, { schema })
  }
  const DB_FILE = process.env.SQLITE_PATH ?? path.join(process.cwd(), 'sqlite', 'data.db')
  const dbDir = path.dirname(DB_FILE)
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }
  // Dynamically require native deps only in local/dev
  const Database = require('better-sqlite3') as typeof import('better-sqlite3')
  const { drizzle: drizzleBetter } = require('drizzle-orm/better-sqlite3') as typeof import('drizzle-orm/better-sqlite3')
  const sqlite = new Database(DB_FILE)
  return drizzleBetter(sqlite, { schema })
}

export const db = makeDb() as any
export type DB = typeof db
export * as dbSchema from './schema'
