import * as schema from '../../drizzle/mysql/schema'
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'

// MySQL client configuration
function makeDb() {
  if (!process.env.MYSQL_HOST || !process.env.MYSQL_USER || !process.env.MYSQL_DATABASE) {
    throw new Error(
      'Database misconfiguration: MYSQL_HOST, MYSQL_USER, and MYSQL_DATABASE must be set.'
    )
  }

  const poolConnection = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  })

  return drizzle(poolConnection, { schema, mode: 'default' })
}

export const db = makeDb() as any
export type DB = typeof db
export * as dbSchema from '../../drizzle/mysql/schema'
