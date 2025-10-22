"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Calendar,
  Users,
  Clock,
  MoreHorizontal,
  Plus,
  Filter,
  Grid3X3,
  List,
  CheckCircle2,
  Circle,
  AlertCircle,
  Edit,
  Copy,
  Trash2,
  FileText,
} from "lucide-react"
import type { Project, Task, TeamMember } from "@/lib/types"
import { formatDate } from "@/lib/format-date"

export default function ProjectDetailPage() {
  const router = useRouter()
  const pathname = usePathname()
  const projectId = (pathname?.split('/')?.[2] as string) || ""
  const { user } = useAuth()
  const { toast } = useToast()

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [projectTasks, setProjectTasks] = useState<Task[]>([])

  useEffect(() => {
    let abort = false
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const [projRes, tasksRes] = await Promise.all([
          fetch('/api/projects'),
          fetch(`/api/tasks?projectId=${encodeURIComponent(projectId)}`),
        ])
        const projJson = await projRes.json()
        const tasksJson = await tasksRes.json()
        if (!projRes.ok || !projJson?.success) throw new Error(projJson?.error || 'Failed to fetch project')
        if (!tasksRes.ok || !tasksJson?.success) throw new Error(tasksJson?.error || 'Failed to fetch tasks')

        const p = (projJson.data || []).find((x: any) => x.id === projectId)
        if (!p) throw new Error('Project not found')

        const mappedProject: Project = {
          id: p.id,
          name: p.name,
          description: p.description ?? '',
          status: p.status,
          priority: p.priority,
          startDate: p.startDate,
          dueDate: p.dueDate,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          completedAt: p.completedAt,
          progress: p.progress ?? 0,
          tasks: [],
          tasksCompleted: 0,
          totalTasks: 0,
          ownerId: p.ownerId,
          owner: p.owner,
          team: p.team || [],
          tags: p.tags || [],
          color: p.color || '#6366f1',
        }

        const tasks: Task[] = (tasksJson.data || []).map((t: any) => ({
          id: t.id,
          projectId: t.projectId,
          title: t.title,
          description: t.description || '',
          status: t.status,
          priority: t.priority,
          startDate: t.startDate || t.createdAt,
          dueDate: t.dueDate || '',
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
          completedAt: t.completedAt,
          assigneeId: undefined,
          assignee: undefined,
          assignees: (t.assignees || []).map((a: any) => ({ id: a.id, name: a.name, avatar: a.avatar, initials: a.initials } as TeamMember)),
          createdById: t.createdById,
          createdBy: t.createdBy ? ({ id: t.createdBy.id, name: t.createdBy.name, avatar: t.createdBy.avatar, initials: t.createdBy.initials } as TeamMember) : ({ id: t.createdById, name: `User ${t.createdById}`, initials: (t.createdById?.[0] || 'U') } as TeamMember),
          approvalStatus: t.approvalStatus,
          approvedAt: t.approvedAt,
          approvedById: t.approvedById,
          rejectionReason: t.rejectionReason,
          progress: t.progress ?? 0,
          subtasks: t.subtasks || [],
          subtasksCompleted: t.subtasksCompleted ?? 0,
          totalSubtasks: t.totalSubtasks ?? 0,
          tags: t.tags || [],
          comments: t.comments || [],
          attachments: t.attachments || [],
        }))

        if (!abort) {
          setProject(mappedProject)
          setProjectTasks(tasks)
        }
      } catch (e: any) {
        if (!abort) setError(e?.message || 'Failed to load project')
      } finally {
        if (!abort) setLoading(false)
      }
    }
    load()
    return () => { abort = true }
  }, [projectId])

  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")

  // Handler for inline status change
  const handleChangeProjectStatus = async (status: "planning" | "active" | "on-hold" | "completed" | "archived") => {
    if (!project) return
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to update status')
      
      // Update local state
      setProject({ ...project, status })
      toast({ title: 'Status updated', description: `Project marked as ${status}.` })
    } catch (e: any) {
      toast({ title: 'Update failed', description: e?.message || 'Could not update status', variant: 'destructive' })
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>
  }

  if (!project) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Project not found</div>
  }

  const filteredTasks = projectTasks.filter((task) => {
    const statusMatch = statusFilter === "all" || task.status === statusFilter
    const priorityMatch = priorityFilter === "all" || task.priority === priorityFilter
    return statusMatch && priorityMatch
  })

  const completedTasks = projectTasks.filter((task) => task.status === "done")
  const inProgressTasks = projectTasks.filter((task) => task.status === "in-progress")
  const todoTasks = projectTasks.filter((task) => task.status === "todo")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case "in-progress":
        return <AlertCircle className="h-4 w-4 text-blue-600" />
      default:
        return <Circle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "review":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "planning":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "completed":
        return "bg-green-50 text-green-700 border-green-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  // Truncate description by characters and provide a short preview
  const DESCRIPTION_CHAR_LIMIT = 158
  const getTruncatedDescription = (text: string, limit: number = DESCRIPTION_CHAR_LIMIT) => {
    if (!text) return { display: "", truncated: false }
    const trimmed = text.trim()
    if (trimmed.length <= limit) return { display: trimmed, truncated: false }
    return { display: trimmed.slice(0, limit).trimEnd() + "…", truncated: true }
  }

  const handleEditProject = () => {
    router.push(`/projects/${projectId}/edit`)
  }

  const handleDuplicateProject = () => {
    console.log("[v0] Duplicating project:", project.name)
    const newProject: Project = {
      ...project,
      id: `${Date.now()}`,
      name: `${project.name} (Copy)`,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      progress: 0,
    }

    const existingProjects = JSON.parse(localStorage.getItem("projects") || "[]")
    existingProjects.push(newProject)
    localStorage.setItem("projects", JSON.stringify(existingProjects))

    alert(`Project "${project.name}" has been duplicated successfully!`)
    router.push(`/projects/${newProject.id}`)
  }

  const handleDeleteProject = () => {
    if (user?.role !== "admin") {
      alert("Only administrators can delete projects.")
      return
    }

    if (confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      console.log("[v0] Deleting project:", project.name)
      const existingProjects = JSON.parse(localStorage.getItem("projects") || "[]")
      const updatedProjects = existingProjects.filter((p: Project) => p.id !== projectId)
      localStorage.setItem("projects", JSON.stringify(updatedProjects))

      alert(`Project "${project.name}" has been deleted successfully!`)
      router.push("/projects")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/projects")}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1 text-sm font-medium text-slate-700">Status</div>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Status</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("todo")}>To Do</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("in-progress")}>In Progress</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("done")}>Completed</DropdownMenuItem>
                <div className="border-t border-slate-200 my-1" />
                <div className="px-2 py-1 text-sm font-medium text-slate-700">Priority</div>
                <DropdownMenuItem onClick={() => setPriorityFilter("all")}>All Priority</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriorityFilter("high")}>High Priority</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriorityFilter("medium")}>Medium Priority</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriorityFilter("low")}>Low Priority</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              onClick={() => router.push(`/projects/${projectId}/workspace`)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Workspace
            </Button>
            <Button
              className="bg-indigo-500 hover:bg-indigo-600"
              onClick={() => router.push(`/projects/${projectId}/tasks/new`)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleEditProject}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Project
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => alert('Duplicate not implemented yet with backend')}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate Project
                </DropdownMenuItem>
                {user?.role === "admin" && (
                  <DropdownMenuItem onClick={() => alert('Delete project API not implemented')} className="text-red-600 focus:text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Project
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="space-y-6">
          {/* Project Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl">{project.name}</CardTitle>
                  <p className="text-slate-600 mt-2">{project.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Overall Progress</span>
                  <span className="text-sm font-bold text-slate-900">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-3" />
              </div>

              {/* Project Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>Due Date</span>
                  </div>
                  <p className="font-medium text-slate-900">{formatDate(project.dueDate)}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="h-4 w-4" />
                    <span>Status</span>
                  </div>
                  {user?.role === 'admin' ? (
                    <select
                      className="h-9 text-sm border border-slate-300 rounded-md px-2 bg-white font-medium"
                      value={project.status}
                      onChange={(e) => handleChangeProjectStatus(e.target.value as any)}
                    >
                      <option value="planning">Planning</option>
                      <option value="active">Active</option>
                      <option value="on-hold">On Hold</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </select>
                  ) : (
                    <Badge variant="outline" className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users className="h-4 w-4" />
                    <span>Project Lead</span>
                  </div>
                  <p className="font-medium text-slate-900">{project.owner?.name || '-'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users className="h-4 w-4" />
                    <span>Team Members</span>
                  </div>
                  <div className="flex -space-x-2">
                    {project.team && project.team.length > 0 ? (
                      <TooltipProvider>
                        {project.team.slice(0, 6).map((member) => (
                          <Tooltip key={member.id}>
                            <TooltipTrigger asChild>
                              <Avatar className="h-8 w-8 border-2 border-white cursor-pointer hover:z-10 hover:scale-110 transition-transform">
                                <AvatarImage src={member.avatar || "/placeholder-user.jpg"} />
                                <AvatarFallback className="text-xs">{member.initials || (member.name?.[0] || 'U')}</AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent className="p-0 border-0 shadow-lg">
                              <div className="bg-white rounded-lg p-3 min-w-[200px]">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-12 w-12">
                                    <AvatarImage src={member.avatar || "/placeholder-user.jpg"} />
                                    <AvatarFallback>{member.initials || (member.name?.[0] || 'U')}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-slate-900 truncate">{member.name}</p>
                                    <p className="text-xs text-slate-500 truncate">{member.email || 'No email'}</p>
                                  </div>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </TooltipProvider>
                    ) : (
                      <span className="text-sm text-slate-500">No team members assigned</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Tags</span>
                <div className="flex flex-wrap gap-2">
                  {project.tags.length > 0 ? (
                    project.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">No tags added</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Task Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Completed Tasks</p>
                    <p className="text-2xl font-bold text-green-600">{completedTasks.length}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">In Progress</p>
                    <p className="text-2xl font-bold text-blue-600">{inProgressTasks.length}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">To Do</p>
                    <p className="text-2xl font-bold text-gray-600">{todoTasks.length}</p>
                  </div>
                  <Circle className="h-8 w-8 text-gray-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tasks Section */}
          <div className="space-y-4">
            {/* View Toggle */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Project Tasks ({filteredTasks.length})</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tasks Display */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/tasks/${task.id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <CardTitle className="text-base">{task.title}</CardTitle>
                        </div>
                        <Badge variant={task.priority === "high" ? "destructive" : "secondary"} className="text-xs">
                          {task.priority}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm text-slate-600">
                        <Dialog>
                          {(() => {
                            const { display, truncated } = getTruncatedDescription(task.description || "")
                            return (
                              <>
                                <p className="whitespace-pre-wrap break-words">
                                  {display}
                                  {truncated && (
                                    <>
                                      {" "}
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="link"
                                          className="px-0 h-auto align-baseline text-indigo-600"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          Read more
                                        </Button>
                                      </DialogTrigger>
                                    </>
                                  )}
                                </p>
                                <DialogContent className="sm:max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Description</DialogTitle>
                                    <DialogDescription>Full task description</DialogDescription>
                                  </DialogHeader>
                                  <div className="max-h-[70vh] overflow-y-auto whitespace-pre-wrap break-words text-slate-700">
                                    {task.description || "No description"}
                                  </div>
                                </DialogContent>
                              </>
                            )
                          })()}
                        </Dialog>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {task.assignees.slice(0, 2).map((member) => (
                            <Avatar key={member.id} className="h-6 w-6 border-2 border-white">
                              <AvatarImage src={member.avatar || "/placeholder-user.jpg"} />
                              <AvatarFallback className="text-xs">{member.initials || (member.name?.[0] || 'U')}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <span className="text-xs text-slate-500">{formatDate(task.dueDate, 'short')}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-200">
                    {filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/tasks/${task.id}`)
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            {getStatusIcon(task.status)}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-slate-900">{task.title}</h3>
                              <div className="text-sm text-slate-600 mt-1">
                                <Dialog>
                                  {(() => {
                                    const { display, truncated } = getTruncatedDescription(task.description || "")
                                    return (
                                      <>
                                        <p className="whitespace-pre-wrap break-words">
                                          {display}
                                          {truncated && (
                                            <>
                                              {" "}
                                              <DialogTrigger asChild>
                                                <Button
                                                  variant="link"
                                                  className="px-0 h-auto align-baseline text-indigo-600"
                                                  onClick={(e) => e.stopPropagation()}
                                                >
                                                  Read more
                                                </Button>
                                              </DialogTrigger>
                                            </>
                                          )}
                                        </p>
                                        <DialogContent className="sm:max-w-2xl">
                                          <DialogHeader>
                                            <DialogTitle>Description</DialogTitle>
                                            <DialogDescription>Full task description</DialogDescription>
                                          </DialogHeader>
                                          <div className="max-h-[70vh] overflow-y-auto whitespace-pre-wrap break-words text-slate-700">
                                            {task.description || "No description"}
                                          </div>
                                        </DialogContent>
                                      </>
                                    )
                                  })()}
                                </Dialog>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex -space-x-2">
                              {task.assignees.slice(0, 2).map((member) => (
                                <Avatar key={member.id} className="h-6 w-6 border-2 border-white">
                                  <AvatarImage src={member.avatar || "/placeholder-user.jpg"} />
                                  <AvatarFallback className="text-xs">{member.initials || (member.name?.[0] || 'U')}</AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                            <Badge variant={task.priority === "high" ? "destructive" : "secondary"} className="text-xs">
                              {task.priority}
                            </Badge>
                            <span className="text-xs text-slate-500 min-w-0">{formatDate(task.dueDate, 'short')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Team Members Section */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              {project.team && project.team.length > 0 ? (
                <div className="space-y-4">
                  {project.team.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar || "/placeholder-user.jpg"} />
                          <AvatarFallback>{member.initials || (member.name?.[0] || 'U')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-slate-900">{member.name}</p>
                          <p className="text-sm text-slate-600">Team Member</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">
                          {projectTasks.filter((task) => task.assignees.some((a) => a.id === member.id)).length} tasks
                        </p>
                        <p className="text-xs text-slate-500">assigned</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No team members assigned yet</p>
                  <Button variant="outline" className="mt-4 bg-transparent">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Team Members
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
