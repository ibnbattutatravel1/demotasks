"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context"
import { Search, ArrowLeft, Calendar, Clock, AlertTriangle, ChevronRight, FolderOpen } from "lucide-react"
import type { Project } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

export default function UpcomingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [timeFilter, setTimeFilter] = useState("all")
  const router = useRouter()
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const [projRes, taskRes] = await Promise.all([
          fetch('/api/projects'),
          fetch(user?.role === 'admin' ? '/api/tasks' : `/api/tasks?assigneeId=${encodeURIComponent(user?.id || '')}`),
        ])
        const projJson = await projRes.json()
        if (projRes.ok && projJson.success) setProjects(projJson.data as Project[])
        const taskJson = await taskRes.json()
        if (taskRes.ok && taskJson.success) setTasks(taskJson.data as any[])
      } catch (e) {
        console.error('Failed to load upcoming data', e)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user?.id, user?.role])

  const handleBackToDashboard = () => {
    router.push("/")
  }

  const handleTaskClick = (taskId: string) => {
    router.push(`/tasks/${taskId}`)
  }

  const getProjectForTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    return projects.find((p) => p.id === task?.projectId)
  }

  const getSubtasksForTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    return (task?.subtasks || []) as any[]
  }

  const patchTask = async (id: string, payload: Partial<{ status: 'todo' | 'in-progress' | 'review' | 'done'; priority: 'low' | 'medium' | 'high' }>) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update task')
    return json.data
  }

  const postActivity = async (taskId: string, message: string) => {
    try {
      if (!user) return
      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'task',
          entityId: taskId,
          userId: user.id,
          userName: user.name || 'User',
          avatar: user.avatar || null,
          content: message,
        }),
      })
    } catch {}
  }

  const updateTaskLocal = (id: string, changes: any) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...changes } : t)))
  }

  const handleChangeStatus = async (taskId: string, status: 'todo' | 'in-progress' | 'review' | 'done') => {
    const prev = tasks.find((t) => t.id === taskId)
    if (!prev) return
    updateTaskLocal(taskId, { status })
    try {
      const updated = await patchTask(taskId, { status })
      setTasks((prevList) => prevList.map((t) => (t.id === taskId ? { ...t, ...updated } : t)))
      toast({ title: 'Status updated', description: `${prev.title} → ${status}` })
      postActivity(taskId, `changed status to "${status}"`)
    } catch (e: any) {
      updateTaskLocal(taskId, { status: prev.status })
      toast({ title: 'Update failed', description: e.message, variant: 'destructive' as any })
    }
  }

  const handleChangePriority = async (taskId: string, priority: 'low' | 'medium' | 'high') => {
    const prev = tasks.find((t) => t.id === taskId)
    if (!prev) return
    updateTaskLocal(taskId, { priority })
    try {
      const updated = await patchTask(taskId, { priority })
      setTasks((prevList) => prevList.map((t) => (t.id === taskId ? { ...t, ...updated } : t)))
      toast({ title: 'Priority updated', description: `${prev.title} → ${priority}` })
      postActivity(taskId, `updated priority to "${priority}"`)
    } catch (e: any) {
      updateTaskLocal(taskId, { priority: prev.priority })
      toast({ title: 'Update failed', description: e.message, variant: 'destructive' as any })
    }
  }

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const isOverdue = (task: any) => {
    if (task.status === 'done') return false
    return getDaysUntilDue(task.dueDate) < 0
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = priorityFilter === "all" || task.priority.toLowerCase() === priorityFilter
    const daysUntilDue = getDaysUntilDue(task.dueDate)
    const matchesTime =
      timeFilter === "all" ||
      (timeFilter === "overdue" && isOverdue(task)) ||
      (timeFilter === "this_week" && daysUntilDue <= 7 && daysUntilDue >= 0) ||
      (timeFilter === "urgent" && daysUntilDue <= 3 && daysUntilDue >= 0)
    return matchesSearch && matchesPriority && matchesTime
  })

  const getDueDateDisplay = (task: any) => {
    const daysUntilDue = getDaysUntilDue(task.dueDate)
    
    // Don't show overdue for completed tasks
    if (task.status === 'done') {
      return {
        text: `Completed`,
        className: "text-green-600",
        badge: "outline",
      }
    }

    if (daysUntilDue < 0) {
      return {
        text: `${Math.abs(daysUntilDue)} days overdue`,
        className: "text-red-600 font-medium",
        badge: "destructive",
      }
    } else if (daysUntilDue === 0) {
      return {
        text: "Due today",
        className: "text-orange-600 font-medium",
        badge: "default",
      }
    } else if (daysUntilDue === 1) {
      return {
        text: "Due tomorrow",
        className: "text-orange-600 font-medium",
        badge: "default",
      }
    } else if (daysUntilDue <= 7) {
      return {
        text: `Due in ${daysUntilDue} days`,
        className: "text-blue-600",
        badge: "secondary",
      }
    } else {
      return {
        text: `Due ${task.dueDate}`,
        className: "text-slate-600",
        badge: "outline",
      }
    }
  }

  const overdueTasks = tasks.filter((task) => isOverdue(task)).length
  const urgentTasks = tasks.filter((task) => {
    if (task.status === 'done') return false
    const days = getDaysUntilDue(task.dueDate)
    return days <= 3 && days >= 0
  }).length
  const thisWeekTasks = tasks.filter((task) => {
    if (task.status === 'done') return false
    const days = getDaysUntilDue(task.dueDate)
    return days <= 7 && days >= 0
  }).length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBackToDashboard}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              <h1 className="text-xl font-semibold text-slate-900">Upcoming Tasks</h1>
              <Badge variant="outline" className="text-xs">
                {tasks.length} tasks
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search upcoming tasks..."
                className="pl-10 w-80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar || "/placeholder-user.jpg"} />
              <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-6 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-slate-900">{overdueTasks} Overdue</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium text-slate-900">{urgentTasks} Due Soon</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-slate-900">{thisWeekTasks} This Week</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Time:</span>
            <Button variant={timeFilter === "all" ? "default" : "ghost"} size="sm" onClick={() => setTimeFilter("all")}>
              All
            </Button>
            <Button
              variant={timeFilter === "overdue" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeFilter("overdue")}
            >
              Overdue
            </Button>
            <Button
              variant={timeFilter === "urgent" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeFilter("urgent")}
            >
              Urgent
            </Button>
            <Button
              variant={timeFilter === "this_week" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeFilter("this_week")}
            >
              This Week
            </Button>
          </div>
          <div className="border-l border-slate-200 pl-3 flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Priority:</span>
            <Button
              variant={priorityFilter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setPriorityFilter("all")}
            >
              All
            </Button>
            <Button
              variant={priorityFilter === "high" ? "default" : "ghost"}
              size="sm"
              onClick={() => setPriorityFilter("high")}
            >
              High
            </Button>
            <Button
              variant={priorityFilter === "medium" ? "default" : "ghost"}
              size="sm"
              onClick={() => setPriorityFilter("medium")}
            >
              Medium
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <Card className="p-8 text-center">
              <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Loading...</h3>
            </Card>
          ) : filteredTasks.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No upcoming tasks found</h3>
              <p className="text-slate-600">
                {searchQuery ? "Try adjusting your search terms or filters" : "You're all caught up!"}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredTasks
                .sort((a, b) => getDaysUntilDue(a.dueDate) - getDaysUntilDue(b.dueDate))
                .map((task) => {
                  const dueDateInfo = getDueDateDisplay(task)
                  const project = getProjectForTask(task.id)
                  const subtasks = getSubtasksForTask(task.id)
                  const completedSubtasks = subtasks.filter((s: any) => !!s.completed).length
                  const taskIsOverdue = isOverdue(task)

                  return (
                    <Card
                      key={task.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        taskIsOverdue ? "border-red-200 bg-red-50" : ""
                      }`}
                      onClick={() => handleTaskClick(task.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {project && (
                                <div className="flex items-center gap-2">
                                  <FolderOpen className="h-4 w-4 text-indigo-600" />
                                  <span className="text-sm text-indigo-600 font-medium">{project.name}</span>
                                  <span className="text-slate-400">•</span>
                                </div>
                              )}
                              <h3 className="text-lg font-semibold text-slate-900">{task.title}</h3>
                              <Badge variant={dueDateInfo.badge as any} className="text-xs">
                                {dueDateInfo.text}
                              </Badge>
                              <Badge
                                variant={task.priority === "high" ? "destructive" : "secondary"}
                                className="text-xs"
                              >
                                {task.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 mb-4">{task.description}</p>

                            {/* Progress */}
                            <div className="mb-4">
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-slate-600">
                                  {subtasks.length > 0
                                    ? `${completedSubtasks}/${subtasks.length} subtasks completed`
                                    : "Task progress"}
                                </span>
                                <span className="text-slate-900 font-medium">{task.progress}%</span>
                              </div>
                              <Progress value={task.progress} className="h-2" />
                            </div>

                            {/* Assignees and Tags */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex -space-x-2">
                                  {task.assignees.map((assignee: any, index: number) => (
                                    <Avatar key={index} className="h-6 w-6 border-2 border-white">
                                      <AvatarImage src={assignee?.avatar || 
                                        `/abstract-geometric-shapes.png?height=24&width=24&query=${encodeURIComponent(assignee?.name || assignee?.id || 'user')}`}
                                      />
                                      <AvatarFallback className="text-xs">
                                        {(assignee?.initials || assignee?.name?.split(" ")?.map((n: string) => n[0]).join("") || "U").toString()}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                </div>
                                <div className="flex gap-1">
                                  {task.tags.map((tag: string, index: number) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button aria-label="Task actions" variant="ghost" size="icon" className="h-7 w-7 p-0">
                                      <ChevronRight className="h-4 w-4 text-slate-400" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-44">
                                    <DropdownMenuLabel>Change status</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleChangeStatus(task.id, 'todo')}>To Do</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleChangeStatus(task.id, 'in-progress')}>In Progress</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleChangeStatus(task.id, 'review')}>Review</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleChangeStatus(task.id, 'done')}>Done</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel>Priority</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleChangePriority(task.id, 'low')}>Low</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleChangePriority(task.id, 'medium')}>Medium</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleChangePriority(task.id, 'high')}>High</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
