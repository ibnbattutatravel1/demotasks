import { NextRequest, NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'

export async function GET() {
  try {
    const users = await db.select({
      id: dbSchema.users.id,
      name: dbSchema.users.name,
      email: dbSchema.users.email,
      avatar: dbSchema.users.avatar,
      initials: dbSchema.users.initials,
      role: dbSchema.users.role,
    }).from(dbSchema.users)
    
    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    console.error('Failed to fetch users', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
