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
  // In Vercel (production serverless), do not allow falling back to local SQLite file.
  // The filesystem is read-only and will cause SQLITE_READONLY on writes.
  if (process.env.VERCEL && !process.env.LIBSQL_URL) {
    throw new Error(
      'Database misconfiguration: LIBSQL_URL is not set in production. Configure Turso/LibSQL env vars in Vercel.'
    )
  }
  if (process.env.LIBSQL_URL) {
    const client = createClient({
      url: process.env.LIBSQL_URL!,
      authToken: process.env.LIBSQL_AUTH_TOKEN,
      // Performance optimizations
      intMode: 'number',
      concurrency: 20, // Allow more concurrent requests
    })
    return drizzleLibsql(client, { schema, logger: false }) // Disable logging in production
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
