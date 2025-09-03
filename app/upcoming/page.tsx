"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context"
import { Search, ArrowLeft, Calendar, Clock, AlertTriangle, ChevronRight, FolderOpen } from "lucide-react"
import type { Project, Task, Subtask } from "@/lib/types"

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Complete website overhaul",
    status: "active",
    priority: "high",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-14",
    createdBy: "admin",
    assignees: ["Alice Johnson", "Bob Smith"],
    dueDate: "2024-02-15",
    progress: 68,
    tags: ["Design", "Frontend"],
  },
  {
    id: "2",
    name: "Mobile App Development",
    description: "iOS and Android app development",
    status: "active",
    priority: "medium",
    createdAt: "2024-01-05",
    updatedAt: "2024-01-14",
    createdBy: "admin",
    assignees: ["Charlie Brown", "Diana Wilson"],
    dueDate: "2024-03-30",
    progress: 45,
    tags: ["Mobile", "Development"],
  },
]

const upcomingTasks: Task[] = [
  {
    id: "1",
    projectId: "1",
    title: "Design system components",
    description: "Complete the remaining components for the design system",
    status: "in-progress",
    priority: "high",
    assignees: ["Alice Johnson", "Bob Smith"],
    dueDate: "2024-01-15",
    tags: ["Design", "High Priority"],
    approvalStatus: "approved",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-14",
    createdBy: "Alice Johnson",
    progress: 75,
  },
  {
    id: "2",
    projectId: "2",
    title: "Mobile app UI improvements",
    description: "Enhance the mobile user interface based on user feedback",
    status: "todo",
    priority: "medium",
    assignees: ["Charlie Brown"],
    dueDate: "2024-01-18",
    tags: ["Mobile", "UI"],
    approvalStatus: "approved",
    createdAt: "2024-01-08",
    updatedAt: "2024-01-14",
    createdBy: "Charlie Brown",
    progress: 30,
  },
  {
    id: "3",
    projectId: "1",
    title: "API integration testing",
    description: "Complete testing of all API endpoints",
    status: "review",
    priority: "high",
    assignees: ["Diana Wilson"],
    dueDate: "2024-01-12",
    tags: ["Backend", "Testing"],
    approvalStatus: "pending",
    createdAt: "2024-01-05",
    updatedAt: "2024-01-14",
    createdBy: "Diana Wilson",
    progress: 45,
  },
]

const mockSubtasks: Subtask[] = [
  {
    id: "1",
    taskId: "1",
    title: "Button component",
    description: "Create button variants",
    status: "done",
    priority: "medium",
    assignees: ["Alice Johnson"],
    dueDate: "2024-01-14",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-14",
    createdBy: "Alice Johnson",
    progress: 100,
  },
  {
    id: "2",
    taskId: "1",
    title: "Input component",
    description: "Create input variants",
    status: "in-progress",
    priority: "medium",
    assignees: ["Bob Smith"],
    dueDate: "2024-01-15",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-14",
    createdBy: "Bob Smith",
    progress: 60,
  },
  {
    id: "3",
    taskId: "2",
    title: "Navigation redesign",
    description: "Improve mobile navigation",
    status: "todo",
    priority: "high",
    assignees: ["Charlie Brown"],
    dueDate: "2024-01-18",
    createdAt: "2024-01-08",
    updatedAt: "2024-01-14",
    createdBy: "Charlie Brown",
    progress: 0,
  },
]

export default function UpcomingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [timeFilter, setTimeFilter] = useState("all")
  const router = useRouter()
  const { user } = useAuth()

  const handleBackToDashboard = () => {
    router.push("/")
  }

  const handleTaskClick = (taskId: string) => {
    router.push(`/tasks/${taskId}`)
  }

  const getProjectForTask = (taskId: string) => {
    const task = upcomingTasks.find((t) => t.id === taskId)
    return mockProjects.find((p) => p.id === task?.projectId)
  }

  const getSubtasksForTask = (taskId: string) => {
    return mockSubtasks.filter((subtask) => subtask.taskId === taskId)
  }

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const isOverdue = (dueDate: string) => {
    return getDaysUntilDue(dueDate) < 0
  }

  const filteredTasks = upcomingTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = priorityFilter === "all" || task.priority.toLowerCase() === priorityFilter
    const daysUntilDue = getDaysUntilDue(task.dueDate)
    const matchesTime =
      timeFilter === "all" ||
      (timeFilter === "overdue" && isOverdue(task.dueDate)) ||
      (timeFilter === "this_week" && daysUntilDue <= 7 && daysUntilDue >= 0) ||
      (timeFilter === "urgent" && daysUntilDue <= 3 && daysUntilDue >= 0)
    return matchesSearch && matchesPriority && matchesTime
  })

  const getDueDateDisplay = (dueDate: string) => {
    const daysUntilDue = getDaysUntilDue(dueDate)

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
        text: `Due ${dueDate}`,
        className: "text-slate-600",
        badge: "outline",
      }
    }
  }

  const overdueTasks = upcomingTasks.filter((task) => isOverdue(task.dueDate)).length
  const urgentTasks = upcomingTasks.filter((task) => {
    const days = getDaysUntilDue(task.dueDate)
    return days <= 3 && days >= 0
  }).length
  const thisWeekTasks = upcomingTasks.filter((task) => {
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
                {upcomingTasks.length} tasks
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
              <AvatarImage src={user?.role === "admin" ? "/diverse-woman-portrait.png" : "/thoughtful-man.png"} />
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
          {filteredTasks.length === 0 ? (
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
                  const dueDateInfo = getDueDateDisplay(task.dueDate)
                  const project = getProjectForTask(task.id)
                  const subtasks = getSubtasksForTask(task.id)
                  const completedSubtasks = subtasks.filter((s) => s.status === "done").length
                  const taskIsOverdue = isOverdue(task.dueDate)

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
                                  {task.assignees.map((assignee, index) => (
                                    <Avatar key={index} className="h-6 w-6 border-2 border-white">
                                      <AvatarImage
                                        src={`/abstract-geometric-shapes.png?height=24&width=24&query=${assignee}`}
                                      />
                                      <AvatarFallback className="text-xs">
                                        {assignee
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                </div>
                                <div className="flex gap-1">
                                  {task.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-slate-400" />
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
