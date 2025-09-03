"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
} from "lucide-react"
import type { Project, Task } from "@/lib/types"

// Mock data - in real app this would come from API
const mockProject: Project = {
  id: "1",
  name: "Website Redesign",
  description:
    "Complete overhaul of the company website with modern design and improved UX. This project involves redesigning the entire user interface, improving the user experience, and implementing new features to enhance customer engagement.",
  status: "active",
  priority: "high",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-14",
  createdBy: "admin",
  assignees: ["Alice Johnson", "Bob Smith", "Charlie Brown"],
  dueDate: "2024-02-15",
  progress: 68,
  tags: ["Design", "Frontend", "UX"],
}

const mockTasks: Task[] = [
  {
    id: "1",
    projectId: "1",
    title: "Design System Creation",
    description: "Create comprehensive design system with components, colors, and typography",
    status: "done",
    priority: "high",
    assignees: ["Alice Johnson"],
    dueDate: "2024-01-15",
    tags: ["Design", "System"],
    approvalStatus: "approved",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-15",
    createdBy: "Alice Johnson",
    progress: 100,
  },
  {
    id: "2",
    projectId: "1",
    title: "Homepage Layout Design",
    description: "Design new homepage layout with improved navigation and hero section",
    status: "in-progress",
    priority: "high",
    assignees: ["Bob Smith", "Alice Johnson"],
    dueDate: "2024-01-20",
    tags: ["Design", "Homepage"],
    approvalStatus: "approved",
    createdAt: "2024-01-05",
    updatedAt: "2024-01-14",
    createdBy: "Bob Smith",
    progress: 60,
  },
  {
    id: "3",
    projectId: "1",
    title: "Mobile Responsiveness",
    description: "Ensure all pages are fully responsive across different device sizes",
    status: "todo",
    priority: "medium",
    assignees: ["Charlie Brown"],
    dueDate: "2024-01-25",
    tags: ["Mobile", "Responsive"],
    approvalStatus: "pending",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-14",
    createdBy: "Charlie Brown",
    progress: 0,
  },
]

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const { user } = useAuth()

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [projectTasks, setProjectTasks] = useState<Task[]>([])

  useEffect(() => {
    // Load project from localStorage
    const projects = JSON.parse(localStorage.getItem("projects") || "[]")
    const foundProject = projects.find((p: Project) => p.id === projectId)

    if (foundProject) {
      setProject(foundProject)
    } else {
      // Fallback to mock project if not found
      setProject(mockProject)
    }

    const allTasks = JSON.parse(localStorage.getItem("tasks") || "[]")
    const tasksForProject = allTasks.filter((task: Task) => task.projectId === projectId)

    // If no tasks in localStorage, fall back to mockTasks for this project
    if (tasksForProject.length === 0) {
      const mockTasksForProject = mockTasks.filter((task) => task.projectId === projectId)
      setProjectTasks(mockTasksForProject)
    } else {
      setProjectTasks(tasksForProject)
    }

    setLoading(false)
  }, [projectId])

  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")

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
            <div className="border-l border-slate-200 h-6" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
            </div>
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
                <DropdownMenuItem onClick={handleDuplicateProject}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate Project
                </DropdownMenuItem>
                {user?.role === "admin" && (
                  <DropdownMenuItem onClick={handleDeleteProject} className="text-red-600 focus:text-red-600">
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
                  <p className="font-medium text-slate-900">{project.dueDate || "Not set"}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="h-4 w-4" />
                    <span>Status</span>
                  </div>
                  <Badge variant="outline" className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users className="h-4 w-4" />
                    <span>Project Lead</span>
                  </div>
                  <p className="font-medium text-slate-900">{project.createdBy}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users className="h-4 w-4" />
                    <span>Team Members</span>
                  </div>
                  <div className="flex -space-x-2">
                    {project.assignees.length > 0 ? (
                      project.assignees.map((member, index) => (
                        <Avatar key={index} className="h-8 w-8 border-2 border-white">
                          <AvatarImage
                            src={`/abstract-geometric-shapes.png?key=mv5rd&height=32&width=32&query=${member}`}
                          />
                          <AvatarFallback className="text-xs">
                            {member
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      ))
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
                      <p className="text-sm text-slate-600 line-clamp-2">{task.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {task.assignees.slice(0, 2).map((member, index) => (
                            <Avatar key={index} className="h-6 w-6 border-2 border-white">
                              <AvatarImage
                                src={`/abstract-geometric-shapes.png?key=mv5rd&height=24&width=24&query=${member}`}
                              />
                              <AvatarFallback className="text-xs">
                                {member
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <span className="text-xs text-slate-500">{task.dueDate}</span>
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
                        onClick={() => router.push(`/tasks/${task.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            {getStatusIcon(task.status)}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-slate-900">{task.title}</h3>
                              <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex -space-x-2">
                              {task.assignees.slice(0, 2).map((member, index) => (
                                <Avatar key={index} className="h-6 w-6 border-2 border-white">
                                  <AvatarImage
                                    src={`/abstract-geometric-shapes.png?key=ao24f&height=24&width=24&query=${member}`}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {member
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                            <Badge variant={task.priority === "high" ? "destructive" : "secondary"} className="text-xs">
                              {task.priority}
                            </Badge>
                            <span className="text-xs text-slate-500 min-w-0">{task.dueDate}</span>
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
              {project.assignees.length > 0 ? (
                <div className="space-y-4">
                  {project.assignees.map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={`/abstract-geometric-shapes.png?key=ao24f&height=40&width=40&query=${member}`}
                          />
                          <AvatarFallback>
                            {member
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-slate-900">{member}</p>
                          <p className="text-sm text-slate-600">Team Member</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">
                          {projectTasks.filter((task) => task.assignees.includes(member)).length} tasks
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
