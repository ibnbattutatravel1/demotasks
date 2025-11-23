"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { RoleSwitcher } from "@/components/role-switcher"
import { useToast } from "@/hooks/use-toast"
import type { Project } from "@/lib/types"
import {
  Search,
  ChevronDown,
  Calendar,
  BarChart3,
  Kanban,
  Filter,
  CheckCircle2,
  ChevronRight,
  PanelRightClose,
  PanelRightOpen,
  Users,
  AlertTriangle,
  Check,
  X,
  Eye,
  FolderOpen,
  Plus,
  ChevronUp,
  LogOut,
  Settings,
  User,
  Inbox,
  Clock,
  FileText,
  Video,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { CreateProjectDialog } from "@/components/create-project-dialog"
import { formatDateOnly, isOverdue } from "@/lib/format-date"
import { GanttChart } from "@/components/gantt-chart"

type TeamStat = { name: string; tasksCreated: number; tasksCompleted: number; avatar?: string }

export function AdminDashboard() {
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [teamStats, setTeamStats] = useState<TeamStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState("all")
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({})
  const [query, setQuery] = useState("")
  const [submittedTimesheetsCount, setSubmittedTimesheetsCount] = useState(0)
  const [notifications, setNotifications] = useState<any[]>([])
  const [questionnairesCount, setQuestionnairesCount] = useState(0)
  const [upcomingMeetingsCount, setUpcomingMeetingsCount] = useState(0)
  const router = useRouter()
  const { toast } = useToast()
  const { user, logout } = useAuth()

  // Truncate description with 158-char preview
  const DESCRIPTION_CHAR_LIMIT = 158
  const getTruncatedDescription = (text: string, limit: number = DESCRIPTION_CHAR_LIMIT) => {
    if (!text) return { display: "", truncated: false }
    const trimmed = String(text).trim()
    if (trimmed.length <= limit) return { display: trimmed, truncated: false }
    return { display: trimmed.slice(0, limit) + "…", truncated: true }
  }

  // Load notifications for admin inbox badge
  useEffect(() => {
    let ignore = false
    const load = async () => {
      try {
        const res = await fetch('/api/notifications')
        const json = await res.json()
        if (!ignore && res.ok && json.success) {
          setNotifications(json.data || [])
        }
      } catch (e) {
        console.error('Failed to load notifications', e)
      }
    }
    load()
    const interval = window.setInterval(load, 30000)
    return () => {
      ignore = true
      window.clearInterval(interval)
    }
  }, [])

  // Load submitted timesheets count
  useEffect(() => {
    const loadTimesheetsCount = async () => {
      try {
        const res = await fetch('/api/admin/timesheets?status=submitted')
        const json = await res.json()
        if (res.ok && json?.success) {
          setSubmittedTimesheetsCount(json.data?.length || 0)
        }
      } catch (e) {
        console.error('Failed to load timesheets count', e)
      }
    }
    loadTimesheetsCount()
  }, [])

  // Load projects and compose tasks per project
  useEffect(() => {
    let abort = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        // OPTIMIZED: Fetch both in parallel (was N+1 problem)
        const [projRes, allTasksRes] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/tasks") // Fetch ALL tasks once instead of per-project
        ])
        
        const projJson = await projRes.json()
        const allTasksJson = await allTasksRes.json()
        
        if (!projRes.ok || !projJson?.success) throw new Error(projJson?.error || "Failed to fetch projects")
        if (!allTasksRes.ok || !allTasksJson?.success) throw new Error(allTasksJson?.error || "Failed to fetch tasks")
        
        const projs: Project[] = projJson.data || []
        const allTasks: any[] = allTasksJson.data || []

        // Group tasks by project in JavaScript (fast!)
        const tasksByProject = new Map<string, any[]>()
        for (const task of allTasks) {
          const projectId = task.projectId || task.project?.id
          if (!projectId) continue
          if (!tasksByProject.has(projectId)) {
            tasksByProject.set(projectId, [])
          }
          tasksByProject.get(projectId)!.push(task)
        }

        // Compose projects with tasks and counts
        const withTasks: Project[] = projs.map((p) => {
          const tlist = tasksByProject.get(p.id) || []
          const tasksCompleted = tlist.filter((t: any) => t.status === "done").length
          const totalTasks = tlist.length
          return {
            ...p,
            tasks: tlist,
            tasksCompleted,
            totalTasks,
          } as Project
        })
        if (!abort) setProjects(withTasks)

        // Build team stats across all tasks (already have them!)
        const byUser = new Map<string, TeamStat>()
        for (const t of allTasks) {
          // createdBy
          if (t.createdBy?.name) {
            const key = `created:${t.createdBy.name}`
            const prev = byUser.get(key) || { name: t.createdBy.name, tasksCreated: 0, tasksCompleted: 0, avatar: t.createdBy.avatar }
            prev.tasksCreated += 1
            if (t.status === "done") prev.tasksCompleted += 1
            byUser.set(key, prev)
          }
          // assignees
          for (const a of t.assignees || []) {
            const key = `assignee:${a.name}`
            const prev = byUser.get(key) || { name: a.name, tasksCreated: 0, tasksCompleted: 0, avatar: a.avatar }
            if (t.status === "done") prev.tasksCompleted += 1
            byUser.set(key, prev)
          }
        }
        const aggregated = Array.from(new Map<string, TeamStat>(
          Array.from(byUser.values()).map((s) => [s.name, s])
        ).values())
        if (!abort) setTeamStats(aggregated)
      } catch (e: any) {
        if (!abort) setError(e?.message || "Failed to load admin data")
      } finally {
        if (!abort) setLoading(false)
      }
    }
    load()
    return () => { abort = true }
  }, [])

  // Load questionnaires count
  useEffect(() => {
    let ignore = false
    const load = async () => {
      try {
        const res = await fetch('/api/admin/questionnaires')
        const json = await res.json()
        if (!ignore && res.ok && json.success) {
          const pending = json.data?.filter((q: any) => q.status === 'draft' || q.status === 'published').length || 0
          setQuestionnairesCount(pending)
        }
      } catch (e) {
        console.error('Failed to load questionnaires count', e)
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  // Load upcoming meetings count
  useEffect(() => {
    let ignore = false
    const load = async () => {
      try {
        const res = await fetch('/api/meetings')
        const json = await res.json()
        if (!ignore && res.ok && json.success) {
          // Count upcoming meetings (not cancelled, not completed, and in future)
          const now = new Date()
          const upcoming = (json.data || []).filter((m: any) => {
            const startTime = new Date(m.startTime)
            return startTime > now && m.status === 'scheduled'
          })
          setUpcomingMeetingsCount(upcoming.length)
        }
      } catch (e) {
        console.error('Failed to load meetings count', e)
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`)
  }

  const handleTaskClick = (taskId: string) => {
    router.push(`/tasks/${taskId}`)
  }

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  const handleApproveTask = async (taskId: string) => {
    try {
      const now = new Date().toISOString()
      await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalStatus: 'approved', approvedAt: now, approvedById: user?.id ?? null }),
      })
      // Optimistically update UI
      setProjects((prevProjects) =>
        prevProjects.map((project) => ({
          ...project,
          tasks: project.tasks.map((task) =>
            task.id === taskId
              ? { ...task, approvalStatus: 'approved' as const, approvedAt: now, approvedById: user?.id ?? undefined }
              : task,
          ),
        })),
      )

      const task = projects.flatMap((p) => p.tasks).find((t) => t.id === taskId)
      if (task) {
        toast({
          title: 'Task Approved',
          description: `"${task.title}" has been approved and assigned to ${task.assignees[0]?.name || 'team member'}.`,
          variant: 'default',
        })
      }
    } catch (e: any) {
      toast({ title: 'Failed to approve task', description: e?.message || 'Please try again', variant: 'destructive' })
    }
  }

  const handleRejectTask = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalStatus: 'rejected', approvedAt: null, approvedById: null, rejectionReason: 'Needs more details' }),
      })
      // Optimistically update UI
      setProjects((prevProjects) =>
        prevProjects.map((project) => ({
          ...project,
          tasks: project.tasks.map((task) =>
            task.id === taskId
              ? { ...task, approvalStatus: 'rejected' as const, rejectionReason: 'Needs more details', approvedAt: undefined, approvedById: undefined }
              : task,
          ),
        })),
      )

      const task = projects.flatMap((p) => p.tasks).find((t) => t.id === taskId)
      if (task) {
        toast({
          title: 'Task Rejected',
          description: `"${task.title}" has been rejected and returned to ${task.createdBy.name}.`,
          variant: 'destructive',
        })
      }
    } catch (e: any) {
      toast({ title: 'Failed to reject task', description: e?.message || 'Please try again', variant: 'destructive' })
    }
  }

  const getPendingTasks = () => {
    return projects.flatMap((project) =>
      project.tasks
        .filter((task) => task.approvalStatus === "pending")
        .map((task) => ({ ...task, projectName: project.name, projectColor: project.color })),
    )
  }

  const getApprovedTasks = () => {
    return projects.flatMap((project) =>
      project.tasks
        .filter((task) => task.approvalStatus === "approved" && task.status !== "done")
        .map((task) => ({ ...task, projectName: project.name, projectColor: project.color })),
    )
  }

  const filteredPendingTasks = getPendingTasks().filter((task) => {
    const q = query.trim().toLowerCase()
    const priorityOk =
      activeFilter === "all" ||
      (activeFilter === "high" && task.priority === "high") ||
      (activeFilter === "medium" && task.priority === "medium") ||
      (activeFilter === "low" && task.priority === "low")
    const queryOk =
      !q ||
      task.title.toLowerCase().includes(q) ||
      (task.projectName || "").toLowerCase().includes(q)
    return priorityOk && queryOk
  })

  const filteredProjects = projects.filter((project) => {
    const q = query.trim().toLowerCase()
    const priorityOk = activeFilter === "all" || project.tasks.some((task: any) => task.priority === activeFilter)
    const queryOk =
      !q ||
      project.name.toLowerCase().includes(q) ||
      project.tasks.some((task: any) => String(task.title || "").toLowerCase().includes(q))
    return priorityOk && queryOk
  })

  const projectTimelineItems = filteredProjects.map((project) => ({
    id: project.id,
    label: project.name,
    startDate: project.startDate,
    endDate: project.dueDate || project.completedAt || project.startDate,
    color: project.color || "#6366f1",
    members: (project.team || []).map((member) => ({
      id: member.id,
      name: member.name,
      avatar: (member as any).avatar,
      initials: (member as any).initials,
    })),
  }))

  const allTasks = projects.flatMap((project) => project.tasks || [])
  const overdueTasks = allTasks.filter(
    (t: any) => t.dueDate && isOverdue(t.dueDate) && t.status !== "done",
  )
  const overdueHighPriority = overdueTasks.filter((t: any) => t.priority === "high").length

  const totalTasks = allTasks.length
  const totalCompletedTasks = allTasks.filter((t: any) => t.status === "done").length
  const activeCompletionRate = totalTasks ? Math.round((totalCompletedTasks / totalTasks) * 100) : 0

  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }))
  }

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
      variant: "default",
    })
  }

  const handleProjectCreated = (project: Project) => {
    setProjects((prev) => [...prev, project])
    toast({
      title: "Project Created",
      description: `${project.name} has been created successfully.`,
      variant: "default",
    })
  }

  const handleDashboardNavigation = () => {
    router.push("/")
  }

  return (
    <div className="h-screen bg-slate-50 flex gap-4">
      {/* Left Navigation Rail */}
      <div className="w-[280px] bg-white border-r border-slate-200 flex flex-col">
        {/* Workspace Switcher */}
        <div className="p-4 border-b border-slate-200">
          <Button variant="ghost" className="w-full justify-between h-10 px-3" onClick={handleDashboardNavigation}>
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
              <Badge
                variant={(notifications || []).some((n: any) => !n?.read) ? "default" : "outline"}
                className="ml-auto text-xs"
              >
                {(notifications || []).filter((n: any) => !n?.read).length}
              </Badge>
            </button>
            <button
              onClick={() => handleNavigation("/projects")}
              className="flex items-center gap-2 mb-3 w-full text-left hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors"
            >
              <FolderOpen className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-900">Projects</span>
              <Badge className="ml-auto text-xs bg-indigo-500">{projects.length}</Badge>
            </button>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <button
              onClick={() => handleNavigation("/admin/pending")}
              className="flex items-center gap-2 mb-3 text-indigo-600 bg-indigo-50 rounded-lg px-2 py-1.5 w-full text-left"
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Pending Approval</span>
              <Badge className="ml-auto text-xs bg-orange-500">{filteredPendingTasks.length}</Badge>
            </button>
            <button
              onClick={() => handleNavigation("/admin/approved")}
              className="flex items-center gap-2 mb-3 w-full text-left hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors"
            >
              <CheckCircle2 className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-900">Approved Tasks</span>
            </button>
            <button
              onClick={() => handleNavigation("/admin/team")}
              className="flex items-center gap-2 mb-3 w-full text-left hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors"
            >
              <Users className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-900">Team Overview</span>
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
              onClick={() => handleNavigation("/meetings")}
              className="flex items-center gap-2 mb-3 w-full text-left hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors"
            >
              <Video className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-900">Meetings</span>
              {upcomingMeetingsCount > 0 && (
                <Badge variant="default" className="ml-auto text-xs bg-blue-500">
                  {upcomingMeetingsCount}
                </Badge>
              )}
            </button>
            <button
              onClick={() => handleNavigation("/reports")}
              className="flex items-center gap-2 mb-3 w-full text-left hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors"
            >
              <BarChart3 className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-900">Reports</span>
            </button>
            <button
              onClick={() => handleNavigation("/admin/timesheets")}
              className="flex items-center gap-2 mb-3 w-full text-left hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors"
            >
              <Calendar className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-900">Timesheets</span>
            </button>
            <button
              onClick={() => handleNavigation("/admin/questionnaires")}
              className="flex items-center gap-2 mb-3 w-full text-left hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors"
            >
              <FileText className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-900">Questionnaires</span>
              {questionnairesCount > 0 ? (
                <Badge variant="outline" className="ml-auto text-xs bg-blue-50 text-blue-700 border-blue-200">
                  {questionnairesCount}
                </Badge>
              ) : (
                <Badge variant="outline" className="ml-auto text-xs bg-red-50 text-red-600 border-red-200">
                  New
                </Badge>
              )}
            </button>
            <button
              onClick={() => handleNavigation("/admin/communities")}
              className="flex items-center gap-2 mb-3 w-full text-left hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors"
            >
              <Users className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-900">Communities</span>
              <Badge variant="outline" className="ml-auto text-xs bg-purple-50 text-purple-600 border-purple-200">
                New
              </Badge>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <span>Taskara</span>
                <ChevronRight className="h-3 w-3" />
                <span>Admin Panel</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <RoleSwitcher />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search projects and tasks..."
                  className="pl-10 w-80"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <CreateProjectDialog onProjectCreated={handleProjectCreated}>
                <Button className="bg-indigo-500 hover:bg-indigo-600">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </CreateProjectDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar || "/placeholder-user.jpg"} />
                      <AvatarFallback>{user?.name?.charAt(0) || "A"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">{user?.role} Account</p>
                    </div>
                  </DropdownMenuLabel>
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
        </div>

        {/* Dashboard Metrics */}
        <div className="p-6 space-y-6">
          {loading && <div className="text-sm text-slate-500">Loading data…</div>}
          {error && !loading && <div className="text-sm text-red-600">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="py-2 px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Projects</p>
                    <p className="text-2xl font-bold text-slate-900">{projects.length}</p>
                  </div>
                  <FolderOpen className="h-8 w-8 text-indigo-500" />
                </div>
                <div className="mt-2 flex items-center text-xs text-slate-500">
                  <span className="text-green-600">
                    {projects.filter((p) => p.status === "in-progress").length} active
                  </span>
                  <span className="mx-1">•</span>
                  <span>{projects.filter((p) => p.status === "planning").length} planning</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-2 px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Active Tasks</p>
                    <p className="text-2xl font-bold text-blue-600">{getApprovedTasks().length}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-blue-500" />
                </div>
                <div className="mt-2 flex items-center text-xs text-slate-500">
                  <span className="text-green-600">
                    {projects.flatMap((p) => p.tasks).filter((t) => t.status === "done").length} completed
                  </span>
                  <span className="mx-1">•</span>
                  <span className="text-slate-600">{activeCompletionRate}% completion rate</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-2 px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Overdue Tasks</p>
                    <p className="text-2xl font-bold text-red-600">{overdueTasks.length}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <div className="mt-2 flex items-center text-xs text-slate-500">
                  <span className="text-red-600">
                    {overdueHighPriority} high priority
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-2 px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Team Members</p>
                    <p className="text-2xl font-bold text-purple-600">{teamStats.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
                <div className="mt-2 flex items-center text-xs text-slate-500">
                  <span>
                    {teamStats.reduce((acc, m) => acc + m.tasksCompleted, 0)} tasks completed
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 px-6">
              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleNavigation("/admin/pending")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Review Pending Tasks</h3>
                      <p className="text-sm text-slate-600">{filteredPendingTasks.length} tasks awaiting approval</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleNavigation("/admin/timesheets")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Review Timesheets</h3>
                      <p className="text-sm text-slate-600">{submittedTimesheetsCount} submitted timesheets</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleNavigation("/admin/team")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Manage Team</h3>
                      <p className="text-sm text-slate-600">View team performance and settings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleNavigation("/reports")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">View Reports</h3>
                      <p className="text-sm text-slate-600">Analytics and performance metrics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

          <div className="mb-6 px-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Project Overview</h2>
            <div className="flex items-center gap-3 mb-4">
              <Badge
                variant="outline"
                className={`bg-${filteredProjects.length > 0 ? filteredProjects[0].color : "indigo"}-50 text-${filteredProjects.length > 0 ? filteredProjects[0].color : "indigo"}-700 border-${filteredProjects.length > 0 ? filteredProjects[0].color : "indigo"}-200`}
              >
                {filteredProjects.length} {activeFilter !== "all" ? `${activeFilter} priority` : "active"} projects
              </Badge>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                {filteredPendingTasks.length} pending approval
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {getApprovedTasks().length} in progress
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Badge
                    variant={activeFilter !== "all" ? "default" : "outline"}
                    className="flex items-center gap-1 cursor-pointer hover:bg-slate-100"
                  >
                    <Filter className="h-3 w-3" />
                    {activeFilter === "all"
                      ? "All Priorities"
                      : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Priority`}
                    <ChevronDown className="h-3 w-3" />
                  </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setActiveFilter("all")}>
                    <div className="flex items-center gap-2">
                      {activeFilter === "all" && <Check className="h-4 w-4" />}
                      <span className={activeFilter !== "all" ? "ml-6" : ""}>All Priorities</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveFilter("high")}>
                    <div className="flex items-center gap-2">
                      {activeFilter === "high" && <Check className="h-4 w-4" />}
                      <span className={activeFilter !== "high" ? "ml-6" : ""}>High Priority</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveFilter("medium")}>
                    <div className="flex items-center gap-2">
                      {activeFilter === "medium" && <Check className="h-4 w-4" />}
                      <span className={activeFilter !== "medium" ? "ml-6" : ""}>Medium Priority</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveFilter("low")}>
                    <div className="flex items-center gap-2">
                      {activeFilter === "low" && <Check className="h-4 w-4" />}
                      <span className={activeFilter !== "low" ? "ml-6" : ""}>Low Priority</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-800">
                Project Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <GanttChart items={projectTimelineItems} />
            </CardContent>
          </Card>

          <div className="space-y-4 px-6">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <Card key={project.id} className="group">
                  <CardHeader className="pb-2 px-4 pt-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <button
                            onClick={() => toggleProjectExpansion(project.id)}
                            className="flex items-center gap-2 hover:bg-slate-50 rounded-lg px-2 py-1 -ml-2"
                          >
                            {expandedProjects[project.id] ? (
                              <ChevronUp className="h-4 w-4 text-slate-500" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-slate-500" />
                            )}
                            <FolderOpen className="h-5 w-5 text-slate-600" />
                            <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {project.name}
                            </CardTitle>
                          </button>
                          <Badge
                            variant="outline"
                            className={`bg-${project.color}-50 text-${project.color}-700 border-${project.color}-200`}
                          >
                            {project.status}
                          </Badge>
                          <Badge variant={project.priority === "high" ? "destructive" : "secondary"}>
                            {project.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-3 ml-8">{project.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500 ml-8">
                          <span>Due: {formatDateOnly(project.dueDate)}</span>
                          <span>Lead: {project.owner.name}</span>
                          <span>
                            {project.tasksCompleted}/{project.totalTasks} tasks completed
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-4">
                          <div className="text-sm font-medium text-slate-900">{project.progress}%</div>
                          <Progress value={project.progress} className="w-20 h-2" />
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleProjectClick(project.id)}>
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleNavigation(`/projects/${project.id}/workspace`)}>
                          <FolderOpen className="h-3 w-3 mr-1" />
                          Workspace
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {expandedProjects[project.id] && (
                    <CardContent className="pt-0 px-4 pb-3">
                      <div className="ml-8 space-y-2 border-l-2 border-slate-200 pl-4">
                        {project.tasks.map((task) => (
                          <div key={task.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-slate-900">{task.title}</h4>
                                <Badge
                                  variant="outline"
                                  className={
                                    task.status === "done"
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : task.status === "in-progress"
                                        ? "bg-blue-50 text-blue-700 border-blue-200"
                                        : "bg-slate-50 text-slate-700 border-slate-200"
                                  }
                                >
                                  {task.status}
                                </Badge>
                                {task.approvalStatus === "pending" && (
                                  <Badge className="bg-orange-100 text-orange-800">Pending Approval</Badge>
                                )}
                              </div>
                              {/* Task description with 158-char preview and Read more dialog */}
                              <div className="text-xs text-slate-600 mb-2">
                                {(() => {
                                  const { display, truncated } = getTruncatedDescription(task.description || "")
                                  return (
                                    <>
                                      <p className="whitespace-pre-wrap break-words">{display}</p>
                                      {truncated && (
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button variant="link" size="sm" className="h-6 px-0 text-indigo-600">Read more</Button>
                                          </DialogTrigger>
                                          <DialogContent className="sm:max-w-lg">
                                            <DialogHeader>
                                              <DialogTitle className="text-base">{task.title}</DialogTitle>
                                              <DialogDescription>Full task description</DialogDescription>
                                            </DialogHeader>
                                            <div className="max-h-[70vh] overflow-y-auto whitespace-pre-wrap break-words text-slate-700">
                                              {task.description || "No description"}
                                            </div>
                                          </DialogContent>
                                        </Dialog>
                                      )}
                                    </>
                                  )
                                })()}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span>Due: {formatDateOnly(task.dueDate)}</span>
                                <span>Progress: {task.progress}%</span>
                                <span>
                                  {task.subtasksCompleted}/{task.totalSubtasks} subtasks
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2 mr-2">
                                {task.assignees.map((assignee, index) => (
                                  <Tooltip key={index}>
                                    <TooltipTrigger asChild>
                                      <Avatar className="h-6 w-6 border-2 border-white cursor-default">
                                        <AvatarImage src={assignee.avatar || "/placeholder-user.jpg"} />
                                        <AvatarFallback className="text-xs">
                                          {assignee.initials || (assignee.name?.slice(0,2) || "U").toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      <div className="text-xs">
                                        <div className="font-medium text-slate-900">{assignee.name || "User"}</div>
                                        <div className="text-slate-500">Assignee</div>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                ))}
                              </div>
                              {task.approvalStatus === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApproveTask(task.id)}
                                    className="h-7 bg-green-600 hover:bg-green-700 text-xs"
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleRejectTask(task.id)}
                                    className="h-7 text-xs"
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleTaskClick(task.id)}
                                className="h-7 text-xs"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Filter className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No projects match the current filter</h3>
                  <p className="text-slate-600 mb-4">
                    Try selecting a different priority filter or clear all filters to see all projects.
                  </p>
                  <Button variant="outline" onClick={() => setActiveFilter("all")}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      
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
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Team Performance</h3>
                <div className="space-y-3">
                  {teamStats.map((member, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar || "/placeholder-user.jpg"} />
                        <AvatarFallback className="text-xs">{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{member.name}</p>
                        <p className="text-xs text-slate-500">
                          {member.tasksCompleted}/{member.tasksCreated} completed
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Admin Metrics</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-indigo-500" />
                      <span className="text-sm text-slate-600">Active Projects</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{projects.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-slate-600">Pending Approval</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{filteredPendingTasks.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-slate-600">In Progress</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{getApprovedTasks().length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-slate-600">Team Members</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{teamStats.length}</span>
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
