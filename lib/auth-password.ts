import { randomBytes, createHash } from 'node:crypto'
import { db } from '@/lib/db/client'
import { sql } from 'drizzle-orm'

export interface ResetTokenRecord {
  id: string
  userId: string
  token: string // plain token to send via email (not stored in DB)
  expiresAt: string // ISO
}

async function ensureResetTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id varchar(191) NOT NULL,
      user_id varchar(191) NOT NULL,
      token_hash varchar(255) NOT NULL,
      expires_at datetime NOT NULL,
      used_at datetime DEFAULT NULL,
      created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_user (user_id),
      INDEX idx_expires (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export async function createPasswordResetToken(userId: string, ttlMinutes = 60): Promise<ResetTokenRecord> {
  await ensureResetTable()
  const tokenBytes = randomBytes(32)
  const token = tokenBytes.toString('base64url')
  const tokenHash = hashToken(token)
  const id = randomBytes(16).toString('hex')
  const expires = new Date(Date.now() + ttlMinutes * 60_000)
  const expiresAt = expires.toISOString().slice(0, 19).replace('T', ' ')

  await db.execute(sql`
    INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at)
    VALUES (${id}, ${userId}, ${tokenHash}, ${expiresAt})
  `)

  return { id, userId, token, expiresAt: new Date(expiresAt).toISOString() }
}

export async function verifyAndConsumeResetToken(token: string): Promise<{ ok: boolean; userId?: string; error?: string }> {
  await ensureResetTable()
  const tokenHash = hashToken(token)
  const rows = await db.execute(sql`
    SELECT id, user_id, expires_at, used_at
    FROM password_reset_tokens
    WHERE token_hash = ${tokenHash}
    LIMIT 1
  `) as any

  const rec = rows?.rows?.[0] || rows?.[0]
  if (!rec) return { ok: false, error: 'Invalid token' }
  if (rec.used_at) return { ok: false, error: 'Token already used' }
  if (new Date(rec.expires_at).getTime() <= Date.now()) return { ok: false, error: 'Token expired' }

  // consume token
  await db.execute(sql`
    UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ${rec.id}
  `)

  return { ok: true, userId: rec.user_id as string }
}
