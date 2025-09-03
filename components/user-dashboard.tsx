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
import type { Project, Task } from "@/lib/types"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import {
  Search,
  Plus,
  ChevronDown,
  Inbox,
  Calendar,
  Clock,
  Filter,
  CheckCircle2,
  Circle,
  ChevronRight,
  PanelRightClose,
  PanelRightOpen,
  User,
  Star,
  FolderOpen,
  ChevronUp,
  Eye,
  LogOut,
  Settings,
  MapPin,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"

// Projects will be loaded from the API at runtime
const mockUserProjects: Project[] = [
  {
    id: "660e8400-e29b-41d4-a716-446655440001",
    name: "Website Redesign",
    description: "Complete overhaul of the company website with modern design and improved UX",
    status: "in-progress",
    priority: "high",
    dueDate: "2024-02-15",
    createdAt: "2024-01-01",
    progress: 68,
    tasksCompleted: 1,
    totalTasks: 2,
    ownerId: "550e8400-e29b-41d4-a716-446655440001",
    owner: {
      id: "550e8400-e29b-41d4-a716-446655440001",
      name: "Sarah Chen",
      avatar: "/diverse-woman-portrait.png",
      initials: "SC",
    },
    team: [
      {
        id: "550e8400-e29b-41d4-a716-446655440005",
        name: "Alice Johnson",
        avatar: "/diverse-woman-portrait.png",
        initials: "AJ",
      },
      { id: "550e8400-e29b-41d4-a716-446655440006", name: "Bob Smith", avatar: "/thoughtful-man.png", initials: "BS" },
    ],
    tags: ["Design", "Frontend", "UX"],
    color: "indigo",
    tasks: [
      {
        id: "770e8400-e29b-41d4-a716-446655440001",
        projectId: "660e8400-e29b-41d4-a716-446655440001",
        title: "Design System Updates",
        description: "Update color palette and typography",
        status: "done",
        priority: "high",
        dueDate: "2024-01-15",
        createdAt: "2024-01-01",
        progress: 100,
        assignees: [
          {
            id: "550e8400-e29b-41d4-a716-446655440006",
            name: "Bob Smith",
            avatar: "/thoughtful-man.png",
            initials: "BS",
          },
        ],
        createdById: "550e8400-e29b-41d4-a716-446655440001",
        createdBy: {
          id: "550e8400-e29b-41d4-a716-446655440001",
          name: "Sarah Chen",
          avatar: "/diverse-woman-portrait.png",
          initials: "SC",
        },
        approvalStatus: "approved",
        subtasks: [],
        subtasksCompleted: 4,
        totalSubtasks: 4,
        tags: ["Design", "UI"],
        comments: [
          {
            id: "1",
            userId: "550e8400-e29b-41d4-a716-446655440006",
            user: "Bob Smith",
            avatar: "/thoughtful-man.png",
            content: "Completed all button variants",
            createdAt: "2024-01-14",
          },
        ],
        attachments: [],
      },
      {
        id: "770e8400-e29b-41d4-a716-446655440002",
        projectId: "660e8400-e29b-41d4-a716-446655440001",
        title: "Homepage Redesign",
        description: "Complete redesign of the homepage layout",
        status: "in-progress",
        priority: "high",
        dueDate: "2024-01-18",
        createdAt: "2024-01-02",
        progress: 60,
        assignees: [
          {
            id: "550e8400-e29b-41d4-a716-446655440006",
            name: "Bob Smith",
            avatar: "/thoughtful-man.png",
            initials: "BS",
          },
        ],
        createdById: "550e8400-e29b-41d4-a716-446655440001",
        createdBy: {
          id: "550e8400-e29b-41d4-a716-446655440001",
          name: "Sarah Chen",
          avatar: "/diverse-woman-portrait.png",
          initials: "SC",
        },
        approvalStatus: "approved",
        subtasks: [],
        subtasksCompleted: 3,
        totalSubtasks: 5,
        tags: ["Design", "Frontend"],
        comments: [
          {
            id: "2",
            userId: "550e8400-e29b-41d4-a716-446655440005",
            user: "Alice Johnson",
            avatar: "/diverse-woman-portrait.png",
            content: "Working on mobile responsive design",
            createdAt: "2024-01-16",
          },
        ],
        attachments: [],
      },
    ],
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440002",
    name: "Mobile App Development",
    description: "Native iOS and Android app for customer engagement",
    status: "planning",
    priority: "medium",
    dueDate: "2024-03-30",
    createdAt: "2024-01-05",
    progress: 25,
    tasksCompleted: 0,
    totalTasks: 1,
    ownerId: "550e8400-e29b-41d4-a716-446655440002",
    owner: {
      id: "550e8400-e29b-41d4-a716-446655440002",
      name: "Marcus Johnson",
      avatar: "/thoughtful-man.png",
      initials: "MJ",
    },
    team: [
      {
        id: "550e8400-e29b-41d4-a716-446655440006",
        name: "Bob Smith",
        avatar: "/thoughtful-man.png",
        initials: "BS",
      },
    ],
    tags: ["Mobile", "iOS", "Android"],
    color: "emerald",
    tasks: [
      {
        id: "770e8400-e29b-41d4-a716-446655440003",
        projectId: "660e8400-e29b-41d4-a716-446655440002",
        title: "Mobile UI Components",
        description: "Create reusable UI components for mobile app",
        status: "in-progress",
        priority: "medium",
        dueDate: "2024-01-25",
        createdAt: "2024-01-10",
        progress: 30,
        assignees: [
          {
            id: "550e8400-e29b-41d4-a716-446655440006",
            name: "Bob Smith",
            avatar: "/thoughtful-man.png",
            initials: "BS",
          },
        ],
        createdById: "550e8400-e29b-41d4-a716-446655440002",
        createdBy: {
          id: "550e8400-e29b-41d4-a716-446655440002",
          name: "Marcus Johnson",
          avatar: "/thoughtful-man.png",
          initials: "MJ",
        },
        approvalStatus: "approved",
        subtasks: [],
        subtasksCompleted: 1,
        totalSubtasks: 6,
        tags: ["Mobile", "UI"],
        comments: [
          {
            id: "3",
            userId: "550e8400-e29b-41d4-a716-446655440006",
            user: "Bob Smith",
            avatar: "/thoughtful-man.png",
            content: "Started with button components",
            createdAt: "2024-01-15",
          },
        ],
        attachments: [],
      },
    ],
  },
]

const myCreatedTasks = [
  {
    id: "770e8400-e29b-41d4-a716-446655440004",
    projectId: "660e8400-e29b-41d4-a716-446655440001",
    projectName: "Website Redesign",
    title: "Implement dark mode toggle",
    status: "pending" as const,
    createdAt: "2024-01-14",
    description: "Add dark mode support across all components",
    tags: ["Frontend", "Feature"],
    approvalStatus: "pending" as const,
  },
  {
    id: "770e8400-e29b-41d4-a716-446655440005",
    projectId: "660e8400-e29b-41d4-a716-446655440001",
    projectName: "Website Redesign",
    title: "Fix responsive layout issues",
    status: "approved" as const,
    createdAt: "2024-01-12",
    description: "Resolve mobile layout problems on dashboard",
    tags: ["Frontend", "Bug Fix"],
    approvalStatus: "approved" as const,
    approvedAt: "2024-01-13",
  },
]

const activities = [
  { action: "completed", task: "Design System Updates", project: "Website Redesign", time: "2 hours ago" },
  { action: "commented on", task: "Homepage Redesign", project: "Website Redesign", time: "4 hours ago" },
  { action: "created", task: "Implement dark mode toggle", project: "Website Redesign", time: "1 day ago" },
]

const userCalendarEvents = [
  {
    id: "1",
    title: "Design Review Meeting",
    type: "meeting",
    date: "2024-01-18",
    time: "10:00 AM",
    duration: "1 hour",
    attendees: ["Sarah Chen", "Alice Johnson"],
    location: "Conference Room A",
    project: "Website Redesign",
    color: "indigo",
  },
  {
    id: "2",
    title: "Homepage Redesign",
    type: "task",
    date: "2024-01-18",
    time: "Due",
    priority: "high",
    project: "Website Redesign",
    progress: 60,
    color: "indigo",
  },
  {
    id: "3",
    title: "Mobile UI Components",
    type: "task",
    date: "2024-01-25",
    time: "Due",
    priority: "medium",
    project: "Mobile App Development",
    progress: 30,
    color: "emerald",
  },
  {
    id: "4",
    title: "Sprint Planning",
    type: "meeting",
    date: "2024-01-22",
    time: "2:00 PM",
    duration: "2 hours",
    attendees: ["Marcus Johnson", "Elena Rodriguez"],
    location: "Virtual",
    project: "Mobile App Development",
    color: "emerald",
  },
]

export function UserDashboard() {
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)
  const [activeFilter, setActiveFilter] = useState("all")
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({})
  const [currentDate, setCurrentDate] = useState(new Date())
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [myTasks, setMyTasks] = useState<Task[]>([])
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [createTaskOpen, setCreateTaskOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user, logout } = useAuth()

  // Load projects from API
  useEffect(() => {
    let ignore = false
    const load = async () => {
      try {
        setLoadingProjects(true)
        const res = await fetch('/api/projects')
        const json = await res.json()
        if (!ignore && res.ok && json.success) {
          setProjects(json.data as Project[])
        }
      } catch (e) {
        console.error('Failed to load projects', e)
      } finally {
        if (!ignore) setLoadingProjects(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  // Load my tasks from API
  useEffect(() => {
    if (!user?.id) return
    let ignore = false
    const load = async () => {
      try {
        setLoadingTasks(true)
        const res = await fetch(`/api/tasks?assigneeId=${encodeURIComponent(user.id)}`)
        const json = await res.json()
        if (!ignore && res.ok && json.success) {
          setMyTasks(json.data as Task[])
        }
      } catch (e) {
        console.error('Failed to load tasks', e)
      } finally {
        if (!ignore) setLoadingTasks(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [user?.id])

  const handleTaskClick = (taskId: string) => {
    router.push(`/tasks/${taskId}`)
  }

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`)
  }

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  const handleCreateTask = () => {
    setCreateTaskOpen(true)
  }

  const getMyTasks = () => {
    return myTasks
  }

  const filteredTasks = getMyTasks().filter((task) => {
    if (activeFilter === "all") return true
    if (activeFilter === "in_progress") return task.status === "in-progress"
    if (activeFilter === "completed") return task.status === "done"
    return true
  })

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

  const handleDashboardNavigation = () => {
    router.push("/")
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getUpcomingEvents = () => {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

    return userCalendarEvents
      .filter((event) => {
        const eventDate = new Date(event.date)
        return eventDate >= today && eventDate <= nextWeek
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 4)
  }

  const getTodaysEvents = () => {
    const today = new Date().toISOString().split("T")[0]
    return userCalendarEvents.filter((event) => event.date === today)
  }

  return (
    <div className="h-screen bg-slate-50 flex">
      {/* Left Navigation Rail */}
      <div className="w-[280px] bg-white border-r border-slate-200 flex flex-col">
        {/* Workspace Switcher */}
        <div className="p-4 border-b border-slate-200">
          <Button variant="ghost" className="w-full justify-between h-10 px-3" onClick={handleDashboardNavigation}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-500 rounded-md flex items-center justify-center">
                <span className="text-white text-xs font-semibold">T</span>
              </div>

        {/* Create Task Dialog */}
        <CreateTaskDialog
          projects={projects}
          currentUserId={user?.id}
          open={createTaskOpen}
          onOpenChange={(v) => setCreateTaskOpen(v)}
          onCreated={async () => {
            // refresh my tasks
            if (user?.id) {
              try {
                const res = await fetch(`/api/tasks?assigneeId=${encodeURIComponent(user.id)}`)
                const json = await res.json()
                if (res.ok && json.success) setMyTasks(json.data as Task[])
              } catch {}
            }
          }}
        />
              <span className="font-medium">Taskara</span>
            </div>
          </Button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 p-4 space-y-6">
          <div>
            <button
              onClick={() => handleNavigation("/projects")}
              className="flex items-center gap-2 mb-3 w-full text-left hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors"
            >
              <FolderOpen className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-900">My Projects</span>
              <Badge variant="outline" className="ml-auto text-xs">
                {projects.length}
              </Badge>
            </button>
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
              <span className="text-sm font-medium">My Tasks</span>
              <Badge className="ml-auto text-xs bg-indigo-500">
                {getMyTasks().filter((t) => t.status === "in-progress").length}
              </Badge>
            </button>
            <button
              onClick={() => handleNavigation("/my-created")}
              className="flex items-center gap-2 mb-3 w-full text-left hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors"
            >
              <Star className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-900">Created by Me</span>
              <Badge variant="outline" className="ml-auto text-xs">
                {myCreatedTasks.length}
              </Badge>
            </button>
            <button
              onClick={() => handleNavigation("/calendar")}
              className="flex items-center gap-2 mb-3 w-full text-left hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors"
            >
              <Calendar className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-900">Calendar</span>
            </button>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Quick Filters</h3>
            <div className="space-y-2">
              <Button
                variant={activeFilter === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveFilter("all")}
                className="w-full justify-start h-8"
              >
                All Tasks
              </Button>
              <Button
                variant={activeFilter === "in_progress" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveFilter("in_progress")}
                className="w-full justify-start h-8"
              >
                In Progress
              </Button>
              <Button
                variant={activeFilter === "completed" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveFilter("completed")}
                className="w-full justify-start h-8"
              >
                Completed
              </Button>
            </div>
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
                <span>My Tasks</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <RoleSwitcher />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Search my projects and tasks..." className="pl-10 w-80" />
              </div>
              <Button onClick={handleCreateTask} className="bg-indigo-500 hover:bg-indigo-600">
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar || "/thoughtful-man.png"} />
                      <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
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

        {/* Center Pane */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-8">
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-indigo-500" />
                    <CardTitle className="text-lg font-semibold text-slate-900">My Calendar</CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNavigation("/calendar")}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    View Full Calendar
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                <p className="text-sm text-slate-600">{formatDate(currentDate)}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Today's Events */}
                  <div>
                    <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      Today's Schedule
                    </h4>
                    <div className="space-y-2">
                      {getTodaysEvents().length > 0 ? (
                        getTodaysEvents().map((event) => (
                          <div
                            key={event.id}
                            className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                            onClick={() => (event.type === "task" ? handleTaskClick(event.id) : undefined)}
                          >
                            <div className={`w-3 h-3 bg-${event.color}-500 rounded-full flex-shrink-0`}></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">{event.title}</p>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span>{event.time}</span>
                                {event.location && (
                                  <>
                                    <span>•</span>
                                    <MapPin className="h-3 w-3" />
                                    <span>{event.location}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            {event.type === "task" && event.progress !== undefined && (
                              <div className="text-xs text-slate-600">{event.progress}%</div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-slate-500">No events scheduled for today</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upcoming Events */}
                  <div>
                    <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      Upcoming This Week
                    </h4>
                    <div className="space-y-2">
                      {getUpcomingEvents().map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                          onClick={() => (event.type === "task" ? handleTaskClick(event.id) : undefined)}
                        >
                          <div className={`w-3 h-3 bg-${event.color}-500 rounded-full flex-shrink-0`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{event.title}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span>
                                {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                              <span>•</span>
                              <span>{event.time}</span>
                              {event.type === "meeting" && event.duration && (
                                <>
                                  <span>•</span>
                                  <span>{event.duration}</span>
                                </>
                              )}
                            </div>
                            <p className="text-xs text-slate-400">{event.project}</p>
                          </div>
                          {event.type === "task" && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                event.priority === "high"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-orange-50 text-orange-700 border-orange-200"
                              }`}
                            >
                              {event.priority}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">My Projects & Tasks</h2>
            <div className="flex items-center gap-3 mb-6">
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                {projects.length} projects
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {myTasks.filter((t) => t.status === "in-progress").length} active tasks
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {myTasks.filter((t) => t.status === "done").length} completed
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Badge
                    variant={activeFilter !== "all" ? "default" : "outline"}
                    className="flex items-center gap-1 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <Filter className="h-3 w-3" />
                    {activeFilter === "all"
                      ? "All Tasks"
                      : activeFilter === "in_progress"
                        ? "In Progress"
                        : "Completed"}
                    <ChevronDown className="h-3 w-3" />
                  </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel>Filter Tasks</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setActiveFilter("all")}
                    className="flex items-center justify-between"
                  >
                    <span>All Tasks</span>
                    {activeFilter === "all" && <div className="w-2 h-2 bg-indigo-500 rounded-full" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setActiveFilter("in_progress")}
                    className="flex items-center justify-between"
                  >
                    <span>In Progress</span>
                    {activeFilter === "in_progress" && <div className="w-2 h-2 bg-indigo-500 rounded-full" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setActiveFilter("completed")}
                    className="flex items-center justify-between"
                  >
                    <span>Completed</span>
                    {activeFilter === "completed" && <div className="w-2 h-2 bg-indigo-500 rounded-full" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            {projects.map((project) => {
              const myTasksInProject = myTasks.filter((task) =>
                task.projectId === project.id && task.assignees?.some((a) => a.id === (user?.id || "")),
              )
              const filteredProjectTasks = myTasksInProject.filter((task) => {
                if (activeFilter === "all") return true
                if (activeFilter === "in_progress") return task.status === "in-progress"
                if (activeFilter === "completed") return task.status === "done"
                return true
              })

              if (filteredProjectTasks.length === 0) return null

              return (
                <Card key={project.id} className="group">
                  <CardHeader className="pb-3">
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
                        </div>
                        <p className="text-sm text-slate-600 mb-3 ml-8">{project.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500 ml-8">
                          <span>Due: {project.dueDate}</span>
                          <span>Lead: {project.owner.name}</span>
                          <span>{myTasksInProject.length} assigned to me</span>
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
                      </div>
                    </div>
                  </CardHeader>

                  {expandedProjects[project.id] && (
                    <CardContent className="pt-0">
                      <div className="ml-8 space-y-3 border-l-2 border-slate-200 pl-4">
                        {filteredProjectTasks.map((task) => (
                          <Card
                            key={task.id}
                            onClick={() => handleTaskClick(task.id)}
                            className="group hover:shadow-sm transition-shadow cursor-pointer bg-slate-50"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">
                                      {task.title}
                                    </h4>
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
                                  </div>
                                  <p className="text-xs text-slate-600 mb-2">{task.description}</p>
                                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                                    <span>Due: {task.dueDate}</span>
                                    <span>
                                      {task.subtasksCompleted}/{task.totalSubtasks} subtasks
                                    </span>
                                    <span>{task.comments.length} comments</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex gap-1">
                                      {task.tags.map((tag, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-slate-600">{task.progress}%</span>
                                      <Progress value={task.progress} className="w-16 h-1" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>

          {/* Created Tasks Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Tasks I Created</h3>
            <div className="space-y-3">
              {myCreatedTasks.map((task) => (
                <Card key={task.id} className="group hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-slate-900">{task.title}</h4>
                          <Badge variant="outline" className="text-xs bg-slate-100 text-slate-600">
                            {task.projectName}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{task.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>Created {task.createdAt}</span>
                          {task.approvedAt && <span>Approved {task.approvedAt}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={task.approvalStatus === "approved" ? "default" : "secondary"}
                          className={
                            task.approvalStatus === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-100 text-orange-800"
                          }
                        >
                          {task.approvalStatus === "approved" ? "Approved" : "Pending Approval"}
                        </Badge>
                        <div className="flex gap-1">
                          {task.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Floating Action Button */}
          <Button
            onClick={handleCreateTask}
            size="lg"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-indigo-500 hover:bg-indigo-600 shadow-lg"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Right Panel - My Activity */}
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
                <h3 className="font-semibold text-slate-900 mb-3">My Activity</h3>
                <div className="space-y-3">
                  {activities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-600">
                          You {activity.action} <span className="font-medium">{activity.task}</span> in{" "}
                          <span className="font-medium">{activity.project}</span>
                        </p>
                        <p className="text-xs text-slate-400">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-3">My Stats</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-indigo-500" />
                      <span className="text-sm text-slate-600">My Projects</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{projects.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Bell className="h-5 w-5" />
                    </Button>
                    <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700" onClick={handleCreateTask}>
                      New Task
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-slate-600">Completed</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{myTasks.filter((t) => t.status === "done").length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Circle className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-slate-600">In Progress</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{myTasks.filter((t) => t.status === "in-progress").length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-slate-600">Created</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{myCreatedTasks.length}</span>
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
