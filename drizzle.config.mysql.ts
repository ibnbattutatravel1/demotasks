import type { Config } from 'drizzle-kit'

export default {
  schema: './lib/db/schema-mysql.ts',
  out: './drizzle/mysql',
  dialect: 'mysql',
  dbCredentials: {
    host: process.env.MYSQL_HOST || 'srv557.hstgr.io',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'u744630877_tasks',
    password: process.env.MYSQL_PASSWORD || '###Taskstasks123',
    database: process.env.MYSQL_DATABASE || 'u744630877_tasks',
  },
  verbose: true,
  strict: true,
} satisfies Config
