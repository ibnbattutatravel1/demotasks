"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Filter,
  ChevronDown,
} from "lucide-react"

const reportData = {
  overview: {
    totalTasks: 156,
    completedTasks: 89,
    overdueTasks: 12,
    activeUsers: 24,
    completionRate: 57,
    avgCompletionTime: 3.2,
  },
  weeklyProgress: [
    { week: "Week 1", completed: 18, created: 25 },
    { week: "Week 2", completed: 22, created: 20 },
    { week: "Week 3", completed: 15, created: 28 },
    { week: "Week 4", completed: 34, created: 30 },
  ],
  topPerformers: [
    { name: "Alice Johnson", completed: 24, avatar: "/diverse-woman-portrait.png" },
    { name: "Bob Smith", completed: 19, avatar: "/thoughtful-man.png" },
    { name: "Charlie Brown", completed: 16, avatar: "/developer-working.png" },
  ],
  tasksByCategory: [
    { category: "Design", count: 45, percentage: 29 },
    { category: "Development", count: 38, percentage: 24 },
    { category: "Testing", count: 32, percentage: 21 },
    { category: "Planning", count: 25, percentage: 16 },
    { category: "Other", count: 16, percentage: 10 },
  ],
}

export default function ReportsPage() {
  const router = useRouter()
  const [selectedPeriod, setSelectedPeriod] = useState("This Month")
  const [showFilterOptions, setShowFilterOptions] = useState(false)
  const [reportDataReal, setReportDataReal] = useState<typeof reportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let abort = false
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/tasks')
        const json = await res.json()
        if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to fetch tasks')
        const tasks: any[] = json.data || []

        // Helpers
        const parseDate = (s?: string | null) => (s ? new Date(s) : null)
        const isDone = (t: any) => t.status === 'done'
        const today = new Date()
        const clampStart = (d: Date) => { const x = new Date(d); x.setHours(0,0,0,0); return x }
        const clampEnd = (d: Date) => { const x = new Date(d); x.setHours(23,59,59,999); return x }
        const startOfWeek = (d: Date) => { const x = new Date(d); const day = x.getDay(); x.setDate(x.getDate() - day); return clampStart(x) }
        const endOfWeek = (d: Date) => { const x = new Date(d); const day = x.getDay(); x.setDate(x.getDate() + (6 - day)); return clampEnd(x) }

        // Period range from selectedPeriod
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth()
        let periodStart: Date
        let periodEnd: Date
        switch (selectedPeriod) {
          case 'This Week': {
            periodStart = startOfWeek(now)
            periodEnd = endOfWeek(now)
            break
          }
          case 'This Month': {
            periodStart = clampStart(new Date(year, month, 1))
            periodEnd = clampEnd(new Date(year, month + 1, 0))
            break
          }
          case 'Last Month': {
            const m = month - 1
            const y = m < 0 ? year - 1 : year
            const mm = (m + 12) % 12
            periodStart = clampStart(new Date(y, mm, 1))
            periodEnd = clampEnd(new Date(y, mm + 1, 0))
            break
          }
          case 'This Quarter': {
            const q = Math.floor(month / 3)
            const qs = q * 3
            periodStart = clampStart(new Date(year, qs, 1))
            periodEnd = clampEnd(new Date(year, qs + 3, 0))
            break
          }
          case 'This Year':
          default: {
            periodStart = clampStart(new Date(year, 0, 1))
            periodEnd = clampEnd(new Date(year, 11, 31))
            break
          }
        }

        const inRange = (d: Date | null) => !!d && d >= periodStart && d <= periodEnd

        // Derive sets
        const tasksCreatedInRange = tasks.filter(t => inRange(parseDate(t.createdAt)))
        const tasksCompletedInRange = tasks.filter(t => inRange(parseDate(t.completedAt)))
        const tasksDueInRange = tasks.filter(t => inRange(parseDate(t.dueDate)))
        // Any task relevant to period (created/completed/due inside)
        const tasksInPeriod = tasks.filter(t =>
          inRange(parseDate(t.createdAt)) || inRange(parseDate(t.completedAt)) || inRange(parseDate(t.dueDate))
        )

        // Overview
        const totalTasks = tasksCreatedInRange.length
        const completedTasks = tasksCompletedInRange.length
        const overdueTasks = tasksDueInRange.filter(t => parseDate(t.dueDate)! < today && !isDone(t)).length
        const assigneeIds = new Set<string>()
        tasksInPeriod.forEach(t => (t.assignees || []).forEach((u: any) => u?.id && assigneeIds.add(u.id)))
        const activeUsers = assigneeIds.size
        const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0

        // Avg completion time (for tasks completed in range)
        const doneWithTimes = tasksCompletedInRange
          .map(t => ({ createdAt: parseDate(t.createdAt), completedAt: parseDate(t.completedAt) }))
          .filter(d => d.createdAt && d.completedAt) as Array<{ createdAt: Date; completedAt: Date }>
        const avgCompletionTime = doneWithTimes.length
          ? Number(((doneWithTimes.reduce((s, d) => s + ((d.completedAt.getTime() - d.createdAt.getTime()) / 86400000), 0)) / doneWithTimes.length).toFixed(1))
          : 0

        // Weekly progress: 4 buckets ending at periodEnd
        const weeks: { label: string; start: Date; end: Date }[] = []
        let cursor = startOfWeek(periodEnd)
        for (let i = 0; i < 4; i++) {
          const start = startOfWeek(cursor)
          const end = endOfWeek(cursor)
          weeks.unshift({ label: `Week ${4 - i}`, start, end })
          // step back 7 days
          cursor = new Date(start)
          cursor.setDate(cursor.getDate() - 7)
        }
        const weeklyProgress = weeks.map(w => ({
          week: w.label,
          completed: tasks.filter(t => inRange(parseDate(t.completedAt)) && parseDate(t.completedAt)! >= w.start && parseDate(t.completedAt)! <= w.end).length,
          created: tasks.filter(t => inRange(parseDate(t.createdAt)) && parseDate(t.createdAt)! >= w.start && parseDate(t.createdAt)! <= w.end).length,
        }))

        // Top performers by completed tasks within range
        const completedByUser = new Map<string, { name: string; completed: number; avatar?: string }>()
        tasksCompletedInRange.forEach(t => {
          (t.assignees || []).forEach((u: any) => {
            if (!u?.name) return
            const rec = completedByUser.get(u.name) || { name: u.name, completed: 0, avatar: u.avatar }
            rec.completed += 1
            if (!rec.avatar && u.avatar) rec.avatar = u.avatar
            completedByUser.set(u.name, rec)
          })
        })
        const topPerformers = Array.from(completedByUser.values()).sort((a, b) => b.completed - a.completed).slice(0, 5)

        // Tasks by Category from tags (fallback to priority), using tasks created in range
        const counts = new Map<string, number>()
        tasksCreatedInRange.forEach(t => {
          const tags: string[] = t.tags && t.tags.length ? t.tags : [t.priority || 'Other']
          tags.forEach(tag => counts.set(tag, (counts.get(tag) || 0) + 1))
        })
        const totalCount = Array.from(counts.values()).reduce((s, n) => s + n, 0) || 1
        const tasksByCategory = Array.from(counts.entries()).map(([category, count]) => ({
          category,
          count,
          percentage: Math.round((count / totalCount) * 100),
        })).sort((a, b) => b.count - a.count).slice(0, 6)

        const computed = {
          overview: { totalTasks, completedTasks, overdueTasks, activeUsers, completionRate, avgCompletionTime },
          weeklyProgress,
          topPerformers,
          tasksByCategory,
        } as typeof reportData

        if (!abort) setReportDataReal(computed)
      } catch (e: any) {
        if (!abort) setError(e?.message || 'Failed to load reports')
      } finally {
        if (!abort) setLoading(false)
      }
    }
    load()
    return () => { abort = true }
  }, [selectedPeriod])

  const handleBackToDashboard = () => {
    router.push("/")
  }

  const handleExport = () => {
    console.log("[v0] Exporting report data...")
    const r = report
    // Create CSV content
    const csvContent = [
      "Report Type,Value,Description",
      `Total Tasks,${r.overview.totalTasks},All tasks in the system`,
      `Completed Tasks,${r.overview.completedTasks},Successfully completed tasks`,
      `Overdue Tasks,${r.overview.overdueTasks},Tasks past their due date`,
      `Active Users,${r.overview.activeUsers},Currently active users`,
      `Completion Rate,${r.overview.completionRate}%,Overall task completion percentage`,
      `Avg Completion Time,${r.overview.avgCompletionTime} days,Average time to complete tasks`,
      "",
      "Weekly Progress",
      "Week,Completed,Created",
      ...r.weeklyProgress.map((week) => `${week.week},${week.completed},${week.created}`),
      "",
      "Top Performers",
      "Name,Completed Tasks",
      ...r.topPerformers.map((performer) => `${performer.name},${performer.completed}`),
      "",
      "Tasks by Category",
      "Category,Count,Percentage",
      ...r.tasksByCategory.map((cat) => `${cat.category},${cat.count},${cat.percentage}%`),
    ].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `task-report-${selectedPeriod.toLowerCase().replace(" ", "-")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    console.log("[v0] Report exported successfully")
  }

  const handleFilter = () => {
    console.log("[v0] Opening filter options...")
    setShowFilterOptions(!showFilterOptions)
  }

  const handlePeriodChange = (period: string) => {
    console.log("[v0] Changing period to:", period)
    setSelectedPeriod(period)
  }

  const periodOptions = ["This Week", "This Month", "Last Month", "This Quarter", "This Year"]

  const report = reportDataReal ?? reportData

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBackToDashboard} className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              <h1 className="text-xl font-semibold text-slate-900">Reports & Analytics</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleFilter}>
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {selectedPeriod}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {periodOptions.map((period) => (
                  <DropdownMenuItem
                    key={period}
                    onClick={() => handlePeriodChange(period)}
                    className={selectedPeriod === period ? "bg-indigo-50 text-indigo-600" : ""}
                  >
                    {period}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {error && (
          <div className="mt-3 mx-6 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
        )}
        {loading && (
          <div className="mt-3 mx-6 text-sm text-slate-500">Loading report…</div>
        )}

        {showFilterOptions && (
          <div className="mt-4 p-4 bg-slate-50 rounded-lg border">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">Status:</label>
                <select className="px-3 py-1 border border-slate-300 rounded-md text-sm">
                  <option>All</option>
                  <option>Completed</option>
                  <option>In Progress</option>
                  <option>Overdue</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">Category:</label>
                <select className="px-3 py-1 border border-slate-300 rounded-md text-sm">
                  <option>All Categories</option>
                  <option>Design</option>
                  <option>Development</option>
                  <option>Testing</option>
                  <option>Planning</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">User:</label>
                <select className="px-3 py-1 border border-slate-300 rounded-md text-sm">
                  <option>All Users</option>
                  <option>Alice Johnson</option>
                  <option>Bob Smith</option>
                  <option>Charlie Brown</option>
                </select>
              </div>
              <Button size="sm" onClick={() => setShowFilterOptions(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-900">{report.overview.totalTasks}</span>
                <CheckCircle2 className="h-5 w-5 text-indigo-500" />
              </div>
              <p className="text-xs text-slate-500 mt-1">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-600">{report.overview.completedTasks}</span>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-xs text-slate-500 mt-1">+8% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-red-600">{report.overview.overdueTasks}</span>
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-xs text-slate-500 mt-1">-3% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">{report.overview.activeUsers}</span>
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-xs text-slate-500 mt-1">+5% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Weekly Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.weeklyProgress.map((week, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{week.week}</span>
                      <span className="text-slate-900 font-medium">
                        {week.completed}/{week.created} completed
                      </span>
                    </div>
                    <div className="flex gap-1 h-8">
                      <div
                        className="bg-green-500 rounded-sm"
                        style={{ width: `${(week.completed / week.created) * 100}%` }}
                      />
                      <div
                        className="bg-slate-200 rounded-sm"
                        style={{ width: `${((week.created - week.completed) / week.created) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.topPerformers.map((performer, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-semibold">
                      {index + 1}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={performer.avatar || "/placeholder-user.jpg"} />
                      <AvatarFallback>{performer.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{performer.name}</p>
                      <p className="text-xs text-slate-500">{performer.completed} tasks completed</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {performer.completed}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Completion Rate */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <span className="text-3xl font-bold text-indigo-600">{report.overview.completionRate}%</span>
                  <p className="text-sm text-slate-500">Overall completion rate</p>
                </div>
                <Progress value={report.overview.completionRate} className="h-3" />
                <div className="flex items-center justify-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">+5% from last month</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Completion Time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Avg. Completion Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <span className="text-3xl font-bold text-blue-600">{report.overview.avgCompletionTime}d</span>
                  <p className="text-sm text-slate-500">Average days to complete</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-slate-600">Within target range</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tasks by Category */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Tasks by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.tasksByCategory.map((category, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{category.category}</span>
                      <span className="text-slate-900 font-medium">{category.count}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${category.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
