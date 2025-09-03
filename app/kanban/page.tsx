"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarDays, Plus, MoreHorizontal, ArrowLeft, FolderOpen } from "lucide-react"
import type { Project } from "@/lib/types"

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Complete overhaul of the company website",
    status: "active",
    priority: "high",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-14",
    createdBy: "admin",
    assignees: ["Sarah Chen", "Marcus Johnson"],
    dueDate: "2024-02-15",
    progress: 68,
    tags: ["Design", "Frontend"],
  },
  {
    id: "2",
    name: "Mobile App Development",
    description: "Native iOS and Android app development",
    status: "active",
    priority: "medium",
    createdAt: "2024-01-05",
    updatedAt: "2024-01-14",
    createdBy: "admin",
    assignees: ["Elena Rodriguez", "David Kim"],
    dueDate: "2024-03-30",
    progress: 45,
    tags: ["Mobile", "Development"],
  },
]

const mockTasks = [
  {
    id: "1",
    projectId: "1",
    title: "Design System Updates",
    description: "Update color palette and typography",
    status: "todo",
    priority: "high",
    assignees: ["Sarah Chen"],
    dueDate: "2024-01-15",
    tags: ["Design", "UI"],
    approvalStatus: "approved",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-14",
    createdBy: "Sarah Chen",
    progress: 25,
  },
  {
    id: "2",
    projectId: "1",
    title: "API Integration",
    description: "Connect frontend with backend services",
    status: "in-progress",
    priority: "high",
    assignees: ["Marcus Johnson"],
    dueDate: "2024-01-18",
    tags: ["Development", "Backend"],
    approvalStatus: "approved",
    createdAt: "2024-01-08",
    updatedAt: "2024-01-14",
    createdBy: "Marcus Johnson",
    progress: 60,
  },
  {
    id: "3",
    projectId: "2",
    title: "User Testing",
    description: "Conduct usability testing sessions",
    status: "review",
    priority: "medium",
    assignees: ["Elena Rodriguez"],
    dueDate: "2024-01-20",
    tags: ["Research", "UX"],
    approvalStatus: "pending",
    createdAt: "2024-01-12",
    updatedAt: "2024-01-14",
    createdBy: "Elena Rodriguez",
    progress: 80,
  },
  {
    id: "4",
    projectId: "2",
    title: "Documentation",
    description: "Update project documentation",
    status: "done",
    priority: "low",
    assignees: ["David Kim"],
    dueDate: "2024-01-12",
    tags: ["Documentation"],
    approvalStatus: "approved",
    createdAt: "2024-01-05",
    updatedAt: "2024-01-12",
    createdBy: "David Kim",
    progress: 100,
  },
]

const columns = [
  { id: "todo", title: "To Do", color: "bg-slate-100" },
  { id: "in-progress", title: "In Progress", color: "bg-blue-50" },
  { id: "review", title: "Review", color: "bg-amber-50" },
  { id: "done", title: "Done", color: "bg-emerald-50" },
]

export default function KanbanPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [tasks, setTasks] = useState(mockTasks)
  const [projects] = useState(mockProjects)
  const [expandedProjects, setExpandedProjects] = useState(new Set(["1", "2"]))

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

  const filteredTasks =
    user?.role === "admin" ? tasks : tasks.filter((task) => task.assignees.includes(user?.name || ""))

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter((task) => task.status === status)
  }

  const getProjectForTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    return projects.find((p) => p.id === task?.projectId)
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
                {getTasksByStatus(column.id).map((task) => {
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
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
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
                          {task.tags.map((tag) => (
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
                            {task.assignees.map((assignee, index) => (
                              <Avatar key={index} className="w-6 h-6 border-2 border-white">
                                <AvatarImage
                                  src={`/abstract-geometric-shapes.png?key=ndkjd&key=r9v2b&height=24&width=24&query=${assignee}`}
                                  alt={assignee}
                                />
                                <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700">
                                  {assignee
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          <span className="text-xs text-gray-700">{task.assignees.join(", ")}</span>
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
