import { NextResponse } from 'next/server'
import { db, dbSchema } from '@/lib/db/client'
import { eq, inArray } from 'drizzle-orm'

export async function GET() {
  try {
    // Get all timesheets
    const timesheets = await db.select().from(dbSchema.timesheets)
    
    // Get all entries
    const entries = await db.select().from(dbSchema.timesheetEntries)
    
    // Get all users
    const userIds = [...new Set(timesheets.map((t: any) => t.userId))]
    const users = userIds.length > 0 
      ? await db.select().from(dbSchema.users).where(inArray(dbSchema.users.id, userIds as string[]))
      : []
    const usersMap = new Map(users.map((u: any) => [u.id, u]))
    
    // Calculate overall stats
    const totalSubmitted = timesheets.filter(t => t.status === 'submitted' || t.status === 'approved' || t.status === 'rejected').length
    const totalApproved = timesheets.filter(t => t.status === 'approved').length
    const totalRejected = timesheets.filter(t => t.status === 'rejected').length
    const totalReturned = timesheets.filter(t => t.status === 'returned').length
    
    // Calculate total hours from approved timesheets
    const approvedTimesheetIds = timesheets.filter(t => t.status === 'approved').map(t => t.id)
    const approvedEntries = entries.filter(e => approvedTimesheetIds.includes(e.timesheetId))
    const totalHoursApproved = approvedEntries.reduce((sum, e) => sum + Number(e.hours || 0), 0)
    const averageHoursPerMonth = totalApproved > 0 ? totalHoursApproved / totalApproved : 0
    
    // Calculate per-user stats
    const userStatsMap = new Map<string, any>()
    
    for (const timesheet of timesheets) {
      const user = usersMap.get(timesheet.userId)
      if (!user) continue
      
      if (!userStatsMap.has(timesheet.userId)) {
        userStatsMap.set(timesheet.userId, {
          userId: timesheet.userId,
          userName: user.name,
          userEmail: user.email,
          approved: 0,
          rejected: 0,
          returned: 0,
          totalHours: 0,
          months: []
        })
      }
      
      const userStat = userStatsMap.get(timesheet.userId)
      
      // Count statuses
      if (timesheet.status === 'approved') userStat.approved++
      if (timesheet.status === 'rejected') userStat.rejected++
      if (timesheet.status === 'returned') userStat.returned++
      
      // Calculate hours for this timesheet
      const timesheetEntries = entries.filter(e => e.timesheetId === timesheet.id)
      const monthHours = timesheetEntries.reduce((sum, e) => sum + Number(e.hours || 0), 0)
      
      if (timesheet.status === 'approved') {
        userStat.totalHours += monthHours
      }
      
      // Add month detail
      userStat.months.push({
        month: timesheet.month,
        status: timesheet.status,
        hours: monthHours
      })
    }
    
    // Calculate averages and sort months
    const userStats = Array.from(userStatsMap.values()).map(user => ({
      ...user,
      averageHours: user.approved > 0 ? user.totalHours / user.approved : 0,
      months: user.months.sort((a: any, b: any) => b.month.localeCompare(a.month)) // Most recent first
    }))
    
    // Sort users by total hours descending
    userStats.sort((a, b) => b.totalHours - a.totalHours)
    
    const data = {
      totalSubmitted,
      totalApproved,
      totalRejected,
      totalReturned,
      totalHoursApproved,
      averageHoursPerMonth,
      userStats
    }
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('GET /api/admin/timesheets/stats error', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 })
  }
}
