/**
 * Vault Encryption Library
 * AES-256-GCM encryption for secure storage of sensitive data
 */

import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const TAG_LENGTH = 16
const SALT_LENGTH = 64
const KEY_LENGTH = 32

/**
 * Generate encryption key from master password
 */
export function generateKey(masterPassword: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(masterPassword, salt, 100000, KEY_LENGTH, 'sha512')
}

/**
 * Encrypt data
 */
export function encrypt(
  data: string,
  masterKey?: string
): { encrypted: string; iv: string; tag: string; salt: string } {
  try {
    // Use environment variable or provided key
    const masterPassword = masterKey || process.env.VAULT_MASTER_KEY || 'default-key-change-in-production'
    
    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH)
    const iv = crypto.randomBytes(IV_LENGTH)
    
    // Derive key from password
    const key = generateKey(masterPassword, salt)
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    
    // Encrypt
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    // Get authentication tag
    const tag = cipher.getAuthTag()
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      salt: salt.toString('hex'),
    }
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypt data
 */
export function decrypt(
  encrypted: string,
  iv: string,
  tag: string,
  salt: string,
  masterKey?: string
): string {
  try {
    // Use environment variable or provided key
    const masterPassword = masterKey || process.env.VAULT_MASTER_KEY || 'default-key-change-in-production'
    
    // Convert hex strings to buffers
    const ivBuffer = Buffer.from(iv, 'hex')
    const tagBuffer = Buffer.from(tag, 'hex')
    const saltBuffer = Buffer.from(salt, 'hex')
    
    // Derive key from password
    const key = generateKey(masterPassword, saltBuffer)
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer)
    decipher.setAuthTag(tagBuffer)
    
    // Decrypt
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data - incorrect key or corrupted data')
  }
}

/**
 * Hash sensitive data for comparison (one-way)
 */
export function hashData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex')
}

/**
 * Generate secure random token
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Mask sensitive data for display (show only last 4 chars)
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (!data || data.length <= visibleChars) return data
  const masked = '*'.repeat(data.length - visibleChars)
  return masked + data.slice(-visibleChars)
}

/**
 * Validate vault item access
 */
export function canAccessVaultItem(
  userRole: string,
  userId: string,
  allowedRoles: string[],
  allowedUsers: string[]
): boolean {
  // Check if user's role is allowed
  if (allowedRoles && allowedRoles.includes(userRole)) {
    return true
  }
  
  // Check if user ID is explicitly allowed
  if (allowedUsers && allowedUsers.includes(userId)) {
    return true
  }
  
  return false
}

/**
 * Check if vault item is expired
 */
export function isVaultItemExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return false
  return new Date() > new Date(expiresAt)
}

/**
 * Sanitize vault item for display (remove sensitive fields)
 */
export function sanitizeVaultItem(item: any): any {
  const { encrypted_content, encryption_iv, encryption_tag, ...safe } = item
  return {
    ...safe,
    hasContent: !!encrypted_content,
    contentLength: encrypted_content ? encrypted_content.length : 0,
  }
}
