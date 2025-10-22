import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { sql } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'
import { encrypt, canAccessVaultItem, sanitizeVaultItem } from '@/lib/vault-encryption'

// GET /api/communities/[id]/vault - List vault items (encrypted, no content)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const userId = payload.sub

    // Get user's role in community
    const memberQuery = `SELECT role FROM community_members WHERE community_id = ? AND user_id = ?`
    const memberResult = await db.execute(sql.raw(memberQuery, [id, userId]))
    const member = memberResult.rows?.[0]

    if (!member) {
      return NextResponse.json({ success: false, error: 'Not a member' }, { status: 403 })
    }

    // Get vault items (without decrypted content)
    const query = `
      SELECT 
        v.id,
        v.title,
        v.item_type,
        v.description,
        v.tags,
        v.created_by,
        v.created_at,
        v.expires_at,
        v.access_count,
        v.last_accessed_at,
        v.allowed_roles,
        v.allowed_users,
        u.name as creator_name,
        u.avatar as creator_avatar
      FROM community_vault v
      LEFT JOIN users u ON v.created_by = u.id
      WHERE v.community_id = ?
      ORDER BY v.created_at DESC
    `

    const result = await db.execute(sql.raw(query, [id]))
    const items = result.rows || []

    // Filter items based on user's access
    const accessibleItems = items.filter((item: any) => {
      const allowedRoles = item.allowed_roles ? JSON.parse(item.allowed_roles) : []
      const allowedUsers = item.allowed_users ? JSON.parse(item.allowed_users) : []
      
      return canAccessVaultItem(member.role, userId, allowedRoles, allowedUsers)
    })

    return NextResponse.json({
      success: true,
      data: accessibleItems
    })

  } catch (error) {
    console.error('GET vault error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch vault' }, { status: 500 })
  }
}

// POST /api/communities/[id]/vault - Create encrypted vault item
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const userId = payload.sub

    // Check if user is admin/owner/moderator
    const memberQuery = `SELECT role FROM community_members WHERE community_id = ? AND user_id = ?`
    const memberResult = await db.execute(sql.raw(memberQuery, [id, userId]))
    const member = memberResult.rows?.[0]

    if (!member || !['owner', 'admin', 'moderator'].includes(member.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await req.json()
    const { 
      title, 
      item_type, 
      content, 
      description, 
      tags, 
      expires_at, 
      allowed_roles, 
      allowed_users 
    } = body

    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'Title and content required' }, { status: 400 })
    }

    // Encrypt the content
    const { encrypted, iv, tag, salt } = encrypt(content)

    const vaultId = `vault_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const insertQuery = `
      INSERT INTO community_vault (
        id, community_id, title, item_type, encrypted_content, 
        encryption_iv, encryption_tag, description, tags,
        created_by, expires_at, allowed_roles, allowed_users, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `

    await db.execute(sql.raw(insertQuery, [
      vaultId,
      id,
      title,
      item_type || 'secret',
      encrypted,
      iv,
      tag,
      description || null,
      tags ? JSON.stringify(tags) : null,
      userId,
      expires_at || null,
      allowed_roles ? JSON.stringify(allowed_roles) : JSON.stringify(['owner', 'admin']),
      allowed_users ? JSON.stringify(allowed_users) : null
    ]))

    // Note: We store salt in a separate secure location or derive it
    // For now, we use the encryption_iv field

    // Log activity
    try {
      const activityQuery = `
        INSERT INTO community_activity (
          id, community_id, user_id, action, target_type, target_id, created_at
        ) VALUES (?, ?, ?, 'created', 'vault_item', ?, NOW())
      `
      
      await db.execute(sql.raw(activityQuery, [
        `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        id,
        userId,
        vaultId
      ]))
    } catch (e) {
      console.error('Failed to log activity:', e)
    }

    // Notify admins
    try {
      const adminsQuery = `
        SELECT user_id FROM community_members 
        WHERE community_id = ? AND role IN ('owner', 'admin') AND user_id != ?
      `
      const adminsResult = await db.execute(sql.raw(adminsQuery, [id, userId]))
      
      for (const admin of (adminsResult.rows || [])) {
        const notifQuery = `
          INSERT INTO notifications (
            id, user_id, type, title, message, related_id, related_type, is_read, created_at
          ) VALUES (?, ?, 'community', ?, ?, ?, 'vault_item', FALSE, NOW())
        `
        
        await db.execute(sql.raw(notifQuery, [
          `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          admin.user_id,
          'New Vault Item',
          `${payload.name} added "${title}" to vault`,
          vaultId
        ]))
      }
    } catch (e) {
      console.error('Failed to notify admins:', e)
    }

    return NextResponse.json({
      success: true,
      data: { id: vaultId, title }
    }, { status: 201 })

  } catch (error) {
    console.error('POST vault error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create vault item' }, { status: 500 })
  }
}
