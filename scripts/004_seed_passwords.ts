import { db, dbSchema } from '@/lib/db/client'
import { eq } from 'drizzle-orm'
import { hash } from 'bcryptjs'
import { randomUUID } from 'crypto'

async function upsertUser(email: string, name: string, role: 'admin' | 'user', password: string, avatar?: string) {
  const rows = await db.select().from(dbSchema.users).where(eq(dbSchema.users.email, email)).limit(1)
  const passwordHash = await hash(password, 10)
  if (rows[0]) {
    await db
      .update(dbSchema.users)
      .set({ passwordHash })
      .where(eq(dbSchema.users.email, email))
  } else {
    await db.insert(dbSchema.users).values({
      id: randomUUID(),
      name,
      email,
      avatar,
      initials: name.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase(),
      role,
      passwordHash,
    })
  }
}

async function main() {
  await upsertUser('admin@taskara.com', 'Admin User', 'admin', 'admin123', '/placeholder-user.jpg')
  await upsertUser('user@taskara.com', 'Regular User', 'user', 'user123', '/placeholder-user.jpg')
  console.log('Seeded/updated user passwords')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
