"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Calendar,
  Users,
  Clock,
  TrendingUp,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Plus,
  Edit,
  Copy,
  Trash2,
} from "lucide-react"
import type { Project, Task } from "@/lib/types"

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tasksByProject, setTasksByProject] = useState<Record<string, Task[]>>({})
  const [loadingProjectTasks, setLoadingProjectTasks] = useState<Record<string, boolean>>({})
  const router = useRouter()
  const { user } = useAuth()

  const loadProjects = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/projects')
      const json = await res.json()
      if (res.ok && json.success) {
        setProjects(json.data as Project[])
      } else {
        console.error('Failed to load projects:', json.error)
      }
    } catch (e) {
      console.error('Failed to load projects', e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const filteredProjects = projects.filter((project) => {
    const searchMatch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
    const statusMatch = statusFilter === "all" || project.status === statusFilter
    const priorityMatch = priorityFilter === "all" || project.priority === priorityFilter
    return searchMatch && statusMatch && priorityMatch
  })

  const getTasksForProject = (projectId: string) => {
    return tasksByProject[projectId] || []
  }

  const loadTasksForProject = async (projectId: string) => {
    if (loadingProjectTasks[projectId]) return
    setLoadingProjectTasks((s) => ({ ...s, [projectId]: true }))
    try {
      const res = await fetch(`/api/tasks?projectId=${encodeURIComponent(projectId)}`)
      const json = await res.json()
      if (res.ok && json.success) {
        setTasksByProject((prev) => ({
          ...prev,
          [projectId]: json.data.map((t: any) => ({
            ...t,
            status: t.status || 'todo',
            priority: t.priority || 'medium',
            assignees: t.assignees || [],
            tags: t.tags || [],
            subtasks: t.subtasks || []
          }))
        }))
      } else {
        console.error('Failed to load tasks:', json.error)
      }
    } catch (e) {
      console.error('Failed to load tasks for project', projectId, e)
    } finally {
      setLoadingProjectTasks((s) => ({ ...s, [projectId]: false }))
    }
  }

  const toggleProject = (projectId: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev)
      if (next.has(projectId)) {
        next.delete(projectId)
      } else {
        next.add(projectId)
        if (!tasksByProject[projectId]) {
          void loadTasksForProject(projectId)
        }
      }
      return next
    })
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

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`)
  }

  const handleEditProject = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation()
    router.push(`/projects/${projectId}/edit`)
  }

  const handleDuplicateProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation()
    const project = projects.find((p) => p.id === projectId)
    if (!project) return

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...project,
          name: `${project.name} (Copy)`,
          id: undefined // Let the server generate a new ID
        })
      })

      if (res.ok) {
        await loadProjects()
      } else {
        const error = await res.json()
        console.error('Failed to duplicate project:', error)
        alert('Failed to duplicate project. Please try again.')
      }
    } catch (error) {
      console.error('Error duplicating project:', error)
      alert('An error occurred while duplicating the project.')
    }
  }

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation()
    const project = projects.find((p) => p.id === projectId)
    if (!project) return

    if (!confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        await loadProjects()
      } else {
        const error = await res.json()
        console.error('Failed to delete project:', error)
        alert('Failed to delete project. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('An error occurred while deleting the project.')
    }
  }
  

  const getFilterLabel = () => {
    const activeFilters = []
    if (statusFilter !== "all") {
      activeFilters.push(
        statusFilter === "active"
          ? "Active"
          : statusFilter === "review"
            ? "In Review"
            : statusFilter === "planning"
              ? "Planning"
              : "Completed",
      )
    }
    if (priorityFilter !== "all") {
      activeFilters.push(
        priorityFilter === "high" ? "High Priority" : priorityFilter === "medium" ? "Medium Priority" : "Low Priority",
      )
    }
    return activeFilters.length > 0 ? activeFilters.join(", ") : "Filter"
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
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
            <div className="border-l border-slate-200 h-6" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search projects..."
                className="pl-10 w-80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={statusFilter !== "all" || priorityFilter !== "all" ? "default" : "outline"} size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  {getFilterLabel()}
                  {(statusFilter !== "all" || priorityFilter !== "all") && (
                    <Badge variant="secondary" className="ml-2 h-4 px-1 text-xs">
                      {(statusFilter !== "all" ? 1 : 0) + (priorityFilter !== "all" ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1 text-sm font-medium text-slate-700">Status</div>
                <DropdownMenuItem
                  onClick={() => setStatusFilter("all")}
                  className={statusFilter === "all" ? "bg-indigo-50 text-indigo-700" : ""}
                >
                  {statusFilter === "all" && "✓ "}All Status
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter("active")}
                  className={statusFilter === "active" ? "bg-indigo-50 text-indigo-700" : ""}
                >
                  {statusFilter === "active" && "✓ "}Active
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter("review")}
                  className={statusFilter === "review" ? "bg-indigo-50 text-indigo-700" : ""}
                >
                  {statusFilter === "review" && "✓ "}In Review
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter("planning")}
                  className={statusFilter === "planning" ? "bg-indigo-50 text-indigo-700" : ""}
                >
                  {statusFilter === "planning" && "✓ "}Planning
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter("completed")}
                  className={statusFilter === "completed" ? "bg-indigo-50 text-indigo-700" : ""}
                >
                  {statusFilter === "completed" && "✓ "}Completed
                </DropdownMenuItem>
                <div className="border-t border-slate-200 my-1" />
                <div className="px-2 py-1 text-sm font-medium text-slate-700">Priority</div>
                <DropdownMenuItem
                  onClick={() => setPriorityFilter("all")}
                  className={priorityFilter === "all" ? "bg-indigo-50 text-indigo-700" : ""}
                >
                  {priorityFilter === "all" && "✓ "}All Priority
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setPriorityFilter("high")}
                  className={priorityFilter === "high" ? "bg-indigo-50 text-indigo-700" : ""}
                >
                  {priorityFilter === "high" && "✓ "}High Priority
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setPriorityFilter("medium")}
                  className={priorityFilter === "medium" ? "bg-indigo-50 text-indigo-700" : ""}
                >
                  {priorityFilter === "medium" && "✓ "}Medium Priority
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setPriorityFilter("low")}
                  className={priorityFilter === "low" ? "bg-indigo-50 text-indigo-700" : ""}
                >
                  {priorityFilter === "low" && "✓ "}Low Priority
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Showing Projects</p>
                  <p className="text-2xl font-bold text-slate-900">{filteredProjects.length}</p>
                </div>
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Grid3X3 className="h-4 w-4 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Projects</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {filteredProjects.filter((p) => p.status === "active").length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Avg Progress</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {filteredProjects.length > 0
                      ? Math.round(filteredProjects.reduce((acc, p) => acc + p.progress, 0) / filteredProjects.length)
                      : 0}
                    %
                  </p>
                </div>
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {filteredProjects.reduce((acc, project) => acc + getTasksForProject(project.id).length, 0)}
                  </p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const projectTasks = getTasksForProject(project.id)
              const completedTasks = projectTasks.filter((t) => t.status === "done").length
              const isExpanded = expandedProjects.has(project.id)

              return (
                <Card
                  key={project.id}
                  className="group hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleProjectClick(project.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleProject(project.id)
                              if (!expandedProjects.has(project.id)) {
                                // about to expand -> ensure tasks are loaded
                                void loadTasksForProject(project.id)
                              }
                            }}
                          >
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </Button>
                          <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {project.name}
                          </CardTitle>
                        </div>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">{project.description}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={(e) => handleEditProject(e, project.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Project
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleDuplicateProject(e, project.id)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate Project
                          </DropdownMenuItem>
                          {user?.role === "admin" && (
                            <DropdownMenuItem
                              onClick={(e) => handleDeleteProject(e, project.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Project
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">
                          {completedTasks}/{projectTasks.length} tasks completed
                        </span>
                        <span className="text-slate-900 font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>

                    {/* Status and Priority */}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                      <Badge variant={project.priority === "high" ? "destructive" : "secondary"}>
                        {project.priority}
                      </Badge>
                    </div>

                    {/* Project Lead */}
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="font-medium">Lead:</span>
                      <span className="text-slate-900">{project.owner?.name || ""}</span>
                    </div>

                    {/* Due Date and Team */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="h-4 w-4" />
                        <span>Due {project.dueDate}</span>
                      </div>
                      <div className="flex -space-x-2">
                        {(project.team || []).slice(0, 3).map((member, index) => (
                          <Avatar key={index} className="h-6 w-6 border-2 border-white">
                            <AvatarImage src={member.avatar || "/placeholder-user.jpg"} />
                            <AvatarFallback className="text-xs">{member.initials}</AvatarFallback>
                          </Avatar>
                        ))}
                        {(project.team || []).length > 3 && (
                          <div className="h-6 w-6 bg-slate-100 border-2 border-white rounded-full flex items-center justify-center">
                            <span className="text-xs text-slate-600">+{(project.team || []).length - 3}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {project.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <h4 className="text-sm font-medium text-slate-900 mb-2">Tasks ({projectTasks.length})</h4>
                        {loadingProjectTasks[project.id] ? (
                          <div className="text-sm text-slate-500">Loading tasks...</div>
                        ) : projectTasks.length === 0 ? (
                          <div className="text-sm text-slate-500">No tasks</div>
                        ) : (
                          <div className="space-y-2">
                            {projectTasks.map((task) => (
                              <div
                                key={task.id}
                                className="flex items-center justify-between p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router.push(`/tasks/${task.id}`)
                                }}
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-slate-900">{task.title}</p>
                                  <p className="text-xs text-slate-600">{task.description}</p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {task.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-200">
                {filteredProjects.map((project) => {
                  const projectTasks = getTasksForProject(project.id)
                  const completedTasks = projectTasks.filter((t) => t.status === "done").length
                  return (
                    <div key={project.id} className="p-4 hover:bg-slate-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button
                            className="h-6 w-6 flex items-center justify-center rounded hover:bg-slate-100"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleProject(project.id)
                              if (!expandedProjects.has(project.id)) {
                                void loadTasksForProject(project.id)
                              }
                            }}
                          >
                            {expandedProjects.has(project.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900">{project.name}</span>
                              <Badge variant="outline" className={getStatusColor(project.status)}>
                                {project.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 line-clamp-1">{project.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-sm text-slate-600">
                            <span className="font-medium">
                              {completedTasks}/{projectTasks.length}
                            </span>
                            <span className="ml-1">tasks</span>
                          </div>
                          <div className="w-48">
                            <Progress value={project.progress} className="h-2" />
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={(e) => handleEditProject(e, project.id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Project
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => handleDuplicateProject(e, project.id)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate Project
                              </DropdownMenuItem>
                              {user?.role === "admin" && (
                                <DropdownMenuItem
                                  onClick={(e) => handleDeleteProject(e, project.id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Project
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      {expandedProjects.has(project.id) && (
                        <div className="mt-3 pl-10">
                          {loadingProjectTasks[project.id] ? (
                            <div className="text-sm text-slate-500">Loading tasks...</div>
                          ) : projectTasks.length === 0 ? (
                            <div className="text-sm text-slate-500">No tasks</div>
                          ) : (
                            <div className="space-y-2">
                              {projectTasks.map((task) => (
                                <div
                                  key={task.id}
                                  className="flex items-center justify-between p-2 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    router.push(`/tasks/${task.id}`)
                                  }}
                                >
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-900">{task.title}</p>
                                    <p className="text-xs text-slate-600 line-clamp-1">{task.description}</p>
                                  </div>
                                  <Badge variant="outline" className="text-xs">{task.status}</Badge>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
