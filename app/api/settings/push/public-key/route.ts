import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY
    if (!VAPID_PUBLIC_KEY) return NextResponse.json({ success: true, data: null })
    return NextResponse.json({ success: true, data: { key: VAPID_PUBLIC_KEY } })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to read key' }, { status: 500 })
  }
}
