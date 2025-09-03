"use client"

import { useState } from "react"
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

  const handleBackToDashboard = () => {
    router.push("/")
  }

  const handleExport = () => {
    console.log("[v0] Exporting report data...")

    // Create CSV content
    const csvContent = [
      "Report Type,Value,Description",
      `Total Tasks,${reportData.overview.totalTasks},All tasks in the system`,
      `Completed Tasks,${reportData.overview.completedTasks},Successfully completed tasks`,
      `Overdue Tasks,${reportData.overview.overdueTasks},Tasks past their due date`,
      `Active Users,${reportData.overview.activeUsers},Currently active users`,
      `Completion Rate,${reportData.overview.completionRate}%,Overall task completion percentage`,
      `Avg Completion Time,${reportData.overview.avgCompletionTime} days,Average time to complete tasks`,
      "",
      "Weekly Progress",
      "Week,Completed,Created",
      ...reportData.weeklyProgress.map((week) => `${week.week},${week.completed},${week.created}`),
      "",
      "Top Performers",
      "Name,Completed Tasks",
      ...reportData.topPerformers.map((performer) => `${performer.name},${performer.completed}`),
      "",
      "Tasks by Category",
      "Category,Count,Percentage",
      ...reportData.tasksByCategory.map((cat) => `${cat.category},${cat.count},${cat.percentage}%`),
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
                <span className="text-2xl font-bold text-slate-900">{reportData.overview.totalTasks}</span>
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
                <span className="text-2xl font-bold text-green-600">{reportData.overview.completedTasks}</span>
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
                <span className="text-2xl font-bold text-red-600">{reportData.overview.overdueTasks}</span>
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
                <span className="text-2xl font-bold text-blue-600">{reportData.overview.activeUsers}</span>
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
                {reportData.weeklyProgress.map((week, index) => (
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
                {reportData.topPerformers.map((performer, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-semibold">
                      {index + 1}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={performer.avatar || "/placeholder.svg"} />
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
                  <span className="text-3xl font-bold text-indigo-600">{reportData.overview.completionRate}%</span>
                  <p className="text-sm text-slate-500">Overall completion rate</p>
                </div>
                <Progress value={reportData.overview.completionRate} className="h-3" />
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
                  <span className="text-3xl font-bold text-blue-600">{reportData.overview.avgCompletionTime}d</span>
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
                {reportData.tasksByCategory.map((category, index) => (
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
