import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { sql } from 'drizzle-orm'
import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth'
import { decrypt, canAccessVaultItem, isVaultItemExpired } from '@/lib/vault-encryption'

// GET /api/communities/[id]/vault/[itemId] - Get & decrypt vault item
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params

    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const userId = payload.sub

    // Get user's role
    const memberQuery = `SELECT role FROM community_members WHERE community_id = ? AND user_id = ?`
    const memberResult = await db.execute(sql.raw(memberQuery, [id, userId]))
    const member = memberResult.rows?.[0]

    if (!member) {
      return NextResponse.json({ success: false, error: 'Not a member' }, { status: 403 })
    }

    // Get vault item
    const itemQuery = `
      SELECT * FROM community_vault 
      WHERE id = ? AND community_id = ?
    `
    const itemResult = await db.execute(sql.raw(itemQuery, [itemId, id]))
    const item = itemResult.rows?.[0]

    if (!item) {
      return NextResponse.json({ success: false, error: 'Vault item not found' }, { status: 404 })
    }

    // Check expiry
    if (isVaultItemExpired(item.expires_at)) {
      return NextResponse.json({ success: false, error: 'Vault item expired' }, { status: 410 })
    }

    // Check access permissions
    const allowedRoles = item.allowed_roles ? JSON.parse(item.allowed_roles) : []
    const allowedUsers = item.allowed_users ? JSON.parse(item.allowed_users) : []
    
    if (!canAccessVaultItem(member.role, userId, allowedRoles, allowedUsers)) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
    }

    // Decrypt content
    let decryptedContent: string
    try {
      // Note: In production, store salt separately or use a more secure method
      const salt = item.encryption_iv // Using IV as salt for simplicity
      decryptedContent = decrypt(
        item.encrypted_content,
        item.encryption_iv,
        item.encryption_tag,
        salt
      )
    } catch (error) {
      console.error('Decryption failed:', error)
      return NextResponse.json({ success: false, error: 'Failed to decrypt' }, { status: 500 })
    }

    // Log access
    try {
      const logQuery = `
        INSERT INTO community_vault_access_log (
          id, vault_item_id, user_id, action, 
          ip_address, user_agent, accessed_at
        ) VALUES (?, ?, ?, 'view', ?, ?, NOW())
      `
      
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
      const userAgent = req.headers.get('user-agent') || 'unknown'
      
      await db.execute(sql.raw(logQuery, [
        `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        itemId,
        userId,
        ip,
        userAgent
      ]))

      // Update access count
      const updateQuery = `
        UPDATE community_vault 
        SET access_count = access_count + 1,
            last_accessed_at = NOW(),
            last_accessed_by = ?
        WHERE id = ?
      `
      await db.execute(sql.raw(updateQuery, [userId, itemId]))

    } catch (e) {
      console.error('Failed to log access:', e)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: item.id,
        title: item.title,
        item_type: item.item_type,
        content: decryptedContent,
        description: item.description,
        tags: item.tags ? JSON.parse(item.tags) : [],
        created_by: item.created_by,
        created_at: item.created_at,
        expires_at: item.expires_at,
        access_count: item.access_count + 1
      }
    })

  } catch (error) {
    console.error('GET vault item error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch vault item' }, { status: 500 })
  }
}

// DELETE /api/communities/[id]/vault/[itemId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params

    const token = req.cookies.get(AUTH_COOKIE)?.value
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyAuthToken(token).catch(() => null)
    if (!payload?.sub) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const userId = payload.sub

    // Check permissions (owner/admin only)
    const memberQuery = `SELECT role FROM community_members WHERE community_id = ? AND user_id = ?`
    const memberResult = await db.execute(sql.raw(memberQuery, [id, userId]))
    const member = memberResult.rows?.[0]

    if (!member || !['owner', 'admin'].includes(member.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 })
    }

    // Delete vault item
    const deleteQuery = `DELETE FROM community_vault WHERE id = ? AND community_id = ?`
    await db.execute(sql.raw(deleteQuery, [itemId, id]))

    // Log activity
    try {
      const activityQuery = `
        INSERT INTO community_activity (
          id, community_id, user_id, action, target_type, target_id, created_at
        ) VALUES (?, ?, ?, 'deleted', 'vault_item', ?, NOW())
      `
      
      await db.execute(sql.raw(activityQuery, [
        `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        id,
        userId,
        itemId
      ]))
    } catch (e) {
      console.error('Failed to log activity:', e)
    }

    return NextResponse.json({
      success: true,
      message: 'Vault item deleted'
    })

  } catch (error) {
    console.error('DELETE vault item error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete vault item' }, { status: 500 })
  }
}
