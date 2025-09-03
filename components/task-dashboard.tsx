"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Plus,
  Command,
  Inbox,
  Calendar,
  BarChart3,
  Kanban,
  Clock,
  Filter,
  GripVertical,
  CheckCircle2,
  Circle,
  TrendingUp,
  Target,
  Timer,
  ChevronRight,
  PanelRightClose,
  PanelRightOpen,
  User,
  Settings,
  LogOut,
} from "lucide-react"

// Live state sourced from backend
type UITask = {
  id: string
  title: string
  progress: number
  dueDate?: string
  isOverdue: boolean
  assignees: { name: string; avatar?: string }[]
  tags: string[]
  subtasks: { completed: number; total: number }
  isSprint?: boolean
}

type UIActivity = { user: string; action: string; task: string; time: string }

const formatTimeAgo = (iso?: string) => {
  if (!iso) return ""
  const d = new Date(iso)
  const diffMs = Date.now() - d.getTime()
  const diffH = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)))
  return `${diffH}h ago`
}

export function TaskDashboard() {
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)
  const router = useRouter()
  const { user, logout } = useAuth()
  const [tasks, setTasks] = useState<UITask[]>([])
  const [activities, setActivities] = useState<UIActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const dueSoon = tasks
    .filter((t) => !!t.dueDate && new Date(t.dueDate!) >= new Date() && new Date(t.dueDate!) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) && !t.isOverdue)
    .sort((a, b) => new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime())
    .slice(0, 3)

  useEffect(() => {
    let abort = false
    const load = async () => {
      if (!user?.id) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/tasks?assigneeId=${encodeURIComponent(user.id)}`)
        const json = await res.json()
        if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to fetch tasks")
        if (abort) return
        const data = (json.data || []) as any[]
        const ui: UITask[] = data.map((t) => ({
          id: t.id,
          title: t.title,
          progress: t.progress ?? 0,
          dueDate: t.dueDate,
          isOverdue: !!(t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done"),
          assignees: (t.assignees || []).map((a: any) => ({ name: a.name, avatar: a.avatar || "/placeholder-user.jpg" })),
          tags: t.tags || [],
          subtasks: { completed: t.subtasksCompleted || 0, total: t.totalSubtasks || 0 },
        }))
        setTasks(ui)

        // Derive a simple recent activity feed from tasks
        const act: UIActivity[] = data
          .sort((a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)))
          .slice(0, 5)
          .map((t) => ({
            user: (t.assignees?.[0]?.name as string) || "",
            action: t.status === "done" ? "completed" : "updated",
            task: t.title,
            time: formatTimeAgo(t.updatedAt || t.createdAt),
          }))
        setActivities(act)
      } catch (e: any) {
        if (!abort) setError(e?.message || "Failed to load tasks")
      } finally {
        if (!abort) setLoading(false)
      }
    }
    load()
    return () => {
      abort = true
    }
  }, [user?.id])

  const handleTaskClick = (taskId: string) => {
    console.log("[v0] Task clicked:", taskId)
    router.push(`/tasks/${taskId}`)
  }

  const handleNavigation = (path: string) => {
    console.log("[v0] Navigation clicked:", path)
    router.push(path)
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div className="h-screen bg-slate-50 flex">
      {/* Left Navigation Rail */}
      <div className="w-[280px] bg-white border-r border-slate-200 flex flex-col">
        {/* Workspace Switcher */}
        <div className="p-4 border-b border-slate-200">
          <Button variant="ghost" className="w-full justify-between h-10 px-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-500 rounded-md flex items-center justify-center">
                <span className="text-white text-xs font-semibold">T</span>
              </div>
              <span className="font-medium">Taskara</span>
            </div>
          </Button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 p-4 space-y-6">
          <div>
            <button
              onClick={() => handleNavigation("/inbox")}
              className="flex items-center gap-2 mb-3 w-full text-left hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors"
            >
              <Inbox className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-900">Inbox</span>
            </button>
            <button
              onClick={() => handleNavigation("/")}
              className="flex items-center gap-2 mb-3 text-indigo-600 bg-indigo-50 rounded-lg px-2 py-1.5 w-full text-left"
            >
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Today</span>
              <Badge className="ml-auto text-xs bg-indigo-500">{tasks.length}</Badge>
            </button>
            <button
              onClick={() => handleNavigation("/upcoming")}
              className="flex items-center gap-2 mb-3 w-full text-left hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors"
            >
              <Calendar className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-900">Upcoming</span>
            </button>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <button
              onClick={() => handleNavigation("/kanban")}
              className="flex items-center gap-2 mb-3 w-full text-left hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors"
            >
              <Kanban className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-900">Kanban</span>
            </button>
            <button
              onClick={() => handleNavigation("/calendar")}
              className="flex items-center gap-2 mb-3 w-full text-left hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors"
            >
              <Calendar className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-900">Calendar</span>
            </button>
            <button
              onClick={() => handleNavigation("/reports")}
              className="flex items-center gap-2 mb-3 w-full text-left hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors"
            >
              <BarChart3 className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-900">Reports</span>
            </button>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Labels</h3>
            <div className="space-y-2">
              <Badge variant="outline" className="text-xs">
                Design
              </Badge>
              <Badge variant="outline" className="text-xs">
                Backend
              </Badge>
              <Badge variant="outline" className="text-xs">
                Testing
              </Badge>
            </div>
          </div>
        </div>

        {/* User Menu */}
        <div className="p-4 border-t border-slate-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start h-10 px-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user?.avatar || "/placeholder-user.jpg"} />
                    <AvatarFallback className="text-xs">
                      {user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-slate-900 truncate">{user?.name || "User"}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email || "user@example.com"}</p>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleNavigation("/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleNavigation("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleNavigation("/")}
                className="text-xl font-semibold text-slate-900 hover:text-indigo-600 transition-colors"
              >
                Taskara
              </button>
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <span>Taskara</span>
                <ChevronRight className="h-3 w-3" />
                <span>Website Redesign</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Search tasks..." className="pl-10 w-80" />
              </div>
              <Button onClick={() => handleNavigation("/tasks/new")} className="bg-indigo-500 hover:bg-indigo-600">
                <Plus className="h-4 w-4 mr-2" />
                New
              </Button>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Command className="h-3 w-3" />
                <span>⌘K</span>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarImage src="/abstract-geometric-shapes.png" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Center Pane */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Today</h2>
            <div className="flex items-center gap-3 mb-6">
              <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">
                My tasks
              </Badge>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                P0
              </Badge>
              <Badge variant="outline">This week</Badge>
              <Button variant="ghost" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          {loading && (
            <div className="text-sm text-slate-500">Loading tasks…</div>
          )}
          {error && !loading && (
            <div className="text-sm text-red-600">{error}</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <Card
                key={task.id}
                onClick={() => handleTaskClick(task.id)}
                className={`group hover:shadow-md transition-shadow cursor-pointer ${task.isSprint ? "md:col-span-2" : ""}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {task.title}
                    </CardTitle>
                    <GripVertical className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress and Checklist */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">
                        {task.subtasks.completed}/{task.subtasks.total} subtasks
                      </span>
                      <span className="text-slate-900 font-medium">{task.progress}%</span>
                    </div>
                    <Progress value={task.progress} className="h-2" />
                  </div>

                  {/* Due Date */}
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={task.isOverdue ? "destructive" : "outline"}
                      className={task.isOverdue ? "border-red-300 text-red-700" : ""}
                    >
                      Due {task.dueDate}
                    </Badge>

                    {/* Progress Ring */}
                    <div className="relative w-8 h-8">
                      <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                        <circle
                          cx="16"
                          cy="16"
                          r="12"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                          className="text-slate-200"
                        />
                        <circle
                          cx="16"
                          cy="16"
                          r="12"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 12}`}
                          strokeDashoffset={`${2 * Math.PI * 12 * (1 - task.progress / 100)}`}
                          className="text-indigo-500"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-slate-700">
                        {task.progress}
                      </span>
                    </div>
                  </div>

                  {/* Assignees and Tags */}
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {task.assignees.map((assignee, index) => (
                        <Avatar key={index} className="h-6 w-6 border-2 border-white">
                          <AvatarImage src={assignee.avatar || "/placeholder-user.jpg"} />
                          <AvatarFallback className="text-xs">{assignee.name[0]}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <div className="flex gap-1">
                      {task.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Floating Action Button */}
          <Button
            onClick={() => {
              console.log("[v0] Floating button clicked")
              handleNavigation("/tasks/new")
            }}
            size="lg"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-indigo-500 hover:bg-indigo-600 shadow-lg"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Right Insights Rail */}
      <div
        className={`bg-white border-l border-slate-200 transition-all duration-300 ${rightPanelCollapsed ? "w-12" : "w-[320px]"}`}
      >
        <div className="p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
            className="mb-4"
          >
            {rightPanelCollapsed ? <PanelRightOpen className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />}
          </Button>

          {!rightPanelCollapsed && (
            <div className="space-y-6">
              {/* Due Soon (derived from live tasks) */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Due Soon</h3>
                <div className="space-y-2">
                  {dueSoon.length === 0 && (
                    <p className="text-xs text-slate-500">No tasks due in the next 3 days.</p>
                  )}
                  {dueSoon.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleTaskClick(t.id)}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 w-full text-left transition-colors"
                    >
                      <Circle className={`h-4 w-4 ${t.isOverdue ? 'text-red-500' : 'text-slate-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{t.title}</p>
                        <p className="text-xs text-slate-500">Due {t.dueDate}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity Feed */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Activity</h3>
                <div className="space-y-3">
                  {activities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{activity.user[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-600">
                          <span className="font-medium">{activity.user}</span> {activity.action}{" "}
                          <span className="font-medium">{activity.task}</span>
                        </p>
                        <p className="text-xs text-slate-400">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Metrics */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Quick Metrics</h3>

                {/* Mini Chart */}
                <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-600">Tasks Completed</span>
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                  </div>
                  <div className="h-8 flex items-end gap-1">
                    {[40, 65, 45, 80, 60, 90, 75].map((height, index) => (
                      <div
                        key={index}
                        className="flex-1 bg-indigo-500 rounded-sm opacity-80"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* KPI Stats */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm text-slate-600">Tasks Done</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">24</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-slate-600">Cycle Time</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">3.2d</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm text-slate-600">On-time %</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">87%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
