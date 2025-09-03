"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarDays, Plus, MoreHorizontal, ArrowLeft, FolderOpen } from "lucide-react"
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


const columns = [
  { id: "todo", title: "To Do", color: "bg-slate-100" },
  { id: "in-progress", title: "In Progress", color: "bg-blue-50" },
  { id: "review", title: "Review", color: "bg-amber-50" },
  { id: "done", title: "Done", color: "bg-emerald-50" },
]

export default function KanbanPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [tasks, setTasks] = useState<any[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        // fetch projects
        const [projRes, taskRes] = await Promise.all([
          fetch('/api/projects'),
          fetch(user?.role === 'admin' ? '/api/tasks' : `/api/tasks?assigneeId=${encodeURIComponent(user?.id || '')}`),
        ])
        const projJson = await projRes.json()
        if (projRes.ok && projJson.success) setProjects(projJson.data as Project[])
        const taskJson = await taskRes.json()
        if (taskRes.ok && taskJson.success) setTasks(taskJson.data as any[])
      } catch (e) {
        console.error('Failed to load kanban data', e)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user?.id, user?.role])

  const handleAddTask = () => {
    router.push("/tasks/new")
  }

  const handleBackToDashboard = () => {
    router.push("/")
  }

  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects)
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId)
    } else {
      newExpanded.add(projectId)
    }
    setExpandedProjects(newExpanded)
  }

  const filteredTasks = tasks

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter((task) => task.status === status)
  }

  const getProjectForTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    return projects.find((p) => p.id === task?.projectId)
  }

  const patchTask = async (id: string, payload: Partial<{ status: string; priority: string }>) => {
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
      // sync server-computed fields (e.g., progress)
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-amber-100 text-amber-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getApprovalBadge = (status?: string) => {
    if (!status || user?.role !== "admin") return null

    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-200">
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="text-green-600 border-green-200">
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="text-red-600 border-red-200">
            Rejected
          </Badge>
        )
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Due today"
    if (diffDays === 1) return "Due tomorrow"
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`
    return `${diffDays} days left`
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleBackToDashboard}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Kanban Board</h1>
                <p className="text-gray-600">
                  {user?.role === "admin" ? "" : "Track your assigned tasks across projects"}
                </p>
              </div>
            </div>
            <Button onClick={handleAddTask} className="bg-indigo-500 hover:bg-indigo-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="flex flex-col">
              {/* Column Header */}
              <div className={`${column.color} rounded-t-2xl p-4 border-b border-gray-200`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{column.title}</h3>
                  <Badge variant="secondary" className="bg-white/80">
                    {getTasksByStatus(column.id).length}
                  </Badge>
                </div>
              </div>

              {/* Column Content */}
              <div className="bg-white rounded-b-2xl p-4 min-h-[600px] space-y-4 border-l border-r border-b border-gray-200">
                {isLoading ? (
                  <div className="text-sm text-gray-500">Loading...</div>
                ) : getTasksByStatus(column.id).map((task) => {
                  const project = getProjectForTask(task.id)
                  return (
                    <Card
                      key={task.id}
                      className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200 rounded-2xl"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {project && (
                              <div className="flex items-center gap-2 mb-2">
                                <FolderOpen className="w-3 h-3 text-indigo-600" />
                                <span className="text-xs text-indigo-600 font-medium">{project.name}</span>
                              </div>
                            )}
                            <CardTitle className="text-sm font-semibold text-gray-900 leading-tight">
                              {task.title}
                            </CardTitle>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-label="Task actions" variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreHorizontal className="w-4 h-4" />
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
                        <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                      </CardHeader>

                      <CardContent className="pt-0 space-y-3">
                        {/* Priority and Approval Status */}
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>{task.priority}</Badge>
                          {getApprovalBadge(task.approvalStatus)}
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {task.tags.map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-xs bg-gray-50">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Due Date */}
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <CalendarDays className="w-3 h-3" />
                          <span className={task.dueDate < new Date().toISOString().split("T")[0] ? "text-red-600" : ""}>
                            {formatDate(task.dueDate)}
                          </span>
                        </div>

                        {/* Assignees */}
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1">
                            {task.assignees.map((assignee: any, index: number) => (
                              <Avatar key={index} className="w-6 h-6 border-2 border-white">
                                <AvatarImage
                                  src={assignee?.avatar || `/abstract-geometric-shapes.png?height=24&width=24&query=${encodeURIComponent(assignee?.name || assignee?.id || 'user')}`}
                                  alt={assignee?.name || 'User'}
                                />
                                <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700">
                                  {(assignee?.initials || assignee?.name?.split(" ")?.map((n: string) => n[0]).join("") || "U").toString()}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          <span className="text-xs text-gray-700">{task.assignees.map((a: any) => a?.name || a?.id).join(", ")}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}

                {/* Add Task Button for Column */}
                <Button
                  onClick={handleAddTask}
                  variant="ghost"
                  className="w-full border-2 border-dashed border-gray-300 hover:border-indigo-300 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 h-12 rounded-2xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
