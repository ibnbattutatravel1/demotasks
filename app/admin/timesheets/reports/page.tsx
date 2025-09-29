"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, CheckCircle, XCircle, TrendingUp, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TimesheetStats {
  totalSubmitted: number
  totalApproved: number
  totalRejected: number
  totalReturned: number
  totalHoursApproved: number
  averageHoursPerMonth: number
  userStats: Array<{
    userId: string
    userName: string
    userEmail: string
    approved: number
    rejected: number
    returned: number
    totalHours: number
    averageHours: number
    months: Array<{
      month: string
      status: string
      hours: number
    }>
  }>
}

export default function TimesheetReportsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [stats, setStats] = useState<TimesheetStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedUser, setExpandedUser] = useState<string | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/admin/timesheets/stats')
        const json = await res.json()
        if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to load stats')
        setStats(json.data)
      } catch (e: any) {
        toast({ title: "Error", description: e?.message || "Failed to load", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [toast])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading reports...</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">No data available</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b bg-white border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-xl font-semibold text-slate-900">Timesheet Reports & Analytics</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="py-4 px-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Submitted</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalSubmitted}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4 px-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalApproved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4 px-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats.totalRejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4 px-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Hours</p>
                  <p className="text-2xl font-bold text-indigo-600">{stats.totalHoursApproved.toFixed(1)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4 px-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Avg/Month</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.averageHoursPerMonth.toFixed(1)}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.userStats.map((user) => (
                <div key={user.userId} className="border rounded-lg p-4 bg-white">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedUser(expandedUser === user.userId ? null : user.userId)}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{user.userName}</h3>
                      <p className="text-sm text-slate-500">{user.userEmail}</p>
                    </div>
                    <div className="flex items-center gap-6 mr-4">
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Approved</p>
                        <p className="text-lg font-bold text-green-600">{user.approved}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Rejected</p>
                        <p className="text-lg font-bold text-red-600">{user.rejected}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Total Hours</p>
                        <p className="text-lg font-bold text-indigo-600">{user.totalHours.toFixed(1)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Avg/Month</p>
                        <p className="text-lg font-bold text-purple-600">{user.averageHours.toFixed(1)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Month Details */}
                  {expandedUser === user.userId && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">Monthly Breakdown</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {user.months.map((month) => (
                          <div key={month.month} className="p-3 rounded-md bg-slate-50 border">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-slate-900">{month.month}</p>
                                <p className="text-xs text-slate-500 capitalize">{month.status}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-slate-900">{month.hours.toFixed(1)}</p>
                                <p className="text-xs text-slate-500">hours</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {stats.userStats.length === 0 && (
                <div className="text-center text-slate-500 py-8">No user data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
