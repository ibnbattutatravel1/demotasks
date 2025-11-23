"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import {
  Search,
  ArrowLeft,
  Star,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  Calendar,
  FolderOpen,
} from "lucide-react"
import type { Project, Task } from "@/lib/types"
import { formatDate } from "@/lib/format-date"

// Data loads from backend

export default function MyCreatedPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const router = useRouter()
  const { user } = useAuth()

  // backend data
  const [projects, setProjects] = useState<Project[]>([])
  const [createdTasks, setCreatedTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return
    let abort = false
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const [pres, tres] = await Promise.all([
          fetch('/api/projects'),
          fetch(`/api/tasks?createdById=${encodeURIComponent(user.id)}`),
        ])
        const pjson = await pres.json()
        const tjson = await tres.json()
        if (abort) return
        if (!pres.ok || !pjson?.success) throw new Error(pjson?.error || 'Failed to fetch projects')
        if (!tres.ok || !tjson?.success) throw new Error(tjson?.error || 'Failed to fetch tasks')
        setProjects(pjson.data || [])
        setCreatedTasks(tjson.data || [])
      } catch (e: any) {
        if (!abort) setError(e?.message || 'Failed to load data')
      } finally {
        if (!abort) setLoading(false)
      }
    }
    load()
    return () => { abort = true }
  }, [user?.id])

  const handleBackToDashboard = () => {
    router.push("/")
  }

  const handleTaskClick = (taskId: string) => {
    router.push(`/tasks/${taskId}`)
  }

  const handleCreateTask = () => {
    router.push("/projects")
  }

  const getProjectForTask = (projectId: string) => {
    return projects.find((p) => p.id === projectId)
  }

  const filteredTasks = createdTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.approvalStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-orange-100 text-orange-800">Pending Approval</Badge>
      case "approved":
        return <Badge className="bg-blue-100 text-blue-800">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-orange-500" />
      case "approved":
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />
      case "rejected":
        return <X className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-slate-500" />
    }
  }

  const statusCounts = {
    all: createdTasks.length,
    pending: createdTasks.filter((t) => t.approvalStatus === "pending").length,
    approved: createdTasks.filter((t) => t.approvalStatus === "approved").length,
    rejected: createdTasks.filter((t) => t.approvalStatus === "rejected").length,
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBackToDashboard}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-indigo-600" />
              <h1 className="text-xl font-semibold text-slate-900">Tasks Created by Me</h1>
              <Badge variant="outline" className="text-xs">
                {createdTasks.length} total
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-full max-w-xs sm:max-w-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search my tasks..."
                className="pl-10 w-full sm:w-64 lg:w-80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={handleCreateTask} className="bg-indigo-500 hover:bg-indigo-600">
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.role === "admin" ? "/diverse-woman-portrait.png" : "/thoughtful-man.png"} />
              <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Button
            variant={statusFilter === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            All ({statusCounts.all})
          </Button>
          <Button
            variant={statusFilter === "pending" ? "default" : "ghost"}
            size="sm"
            onClick={() => setStatusFilter("pending")}
          >
            Pending ({statusCounts.pending})
          </Button>
          <Button
            variant={statusFilter === "approved" ? "default" : "ghost"}
            size="sm"
            onClick={() => setStatusFilter("approved")}
          >
            Approved ({statusCounts.approved})
          </Button>
          <Button
            variant={statusFilter === "rejected" ? "default" : "ghost"}
            size="sm"
            onClick={() => setStatusFilter("rejected")}
          >
            Rejected ({statusCounts.rejected})
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {filteredTasks.length === 0 ? (
            <Card className="p-8 text-center">
              <Star className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No tasks found</h3>
              <p className="text-slate-600 mb-4">
                {searchQuery ? "Try adjusting your search terms" : "You haven't created any tasks yet"}
              </p>
              <Button onClick={handleCreateTask} className="bg-indigo-500 hover:bg-indigo-600">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Task
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredTasks.map((task) => {
                const project = getProjectForTask(task.projectId)

                return (
                  <Card
                    key={task.id}
                    className="cursor-pointer transition-all hover:shadow-md"
                    onClick={() => handleTaskClick(task.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(task.approvalStatus)}
                            {project && (
                              <div className="flex items-center gap-2">
                                <FolderOpen className="h-3 w-3 text-indigo-600" />
                                <span className="text-xs text-indigo-600 font-medium">{project.name}</span>
                                <span className="text-slate-400">•</span>
                              </div>
                            )}
                            <CardTitle className="text-base font-semibold text-slate-900">{task.title}</CardTitle>
                          </div>
                          <p className="text-sm text-slate-600 mb-3">{task.description}</p>
                        </div>
                        {getStatusBadge(task.approvalStatus)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Progress for approved/in-progress tasks */}
                      {task.approvalStatus === "approved" && task.progress !== undefined && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Progress</span>
                            <span className="text-slate-900 font-medium">{task.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-indigo-500 h-2 rounded-full transition-all"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Rejection reason */}
                      {task.approvalStatus === "rejected" && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800">
                            <strong>Rejection reason:</strong> Similar functionality already exists in the current
                            system
                          </p>
                        </div>
                      )}

                      {/* Assignees */}
                      {task.assignees && task.assignees.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-600">Assigned to:</span>
                          <div className="flex -space-x-2">
                            {task.assignees.map((a) => (
                              <Avatar key={a.id} className="h-6 w-6 border-2 border-white">
                                <AvatarImage src={a.avatar || "/placeholder-user.jpg"} />
                                <AvatarFallback className="text-xs">{a.initials || (a.name?.[0] || 'U')}</AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Created {formatDate(task.createdAt, 'short')}</span>
                          </div>
                        </div>
                        <Badge variant={task.priority === "high" ? "destructive" : "secondary"} className="text-xs">
                          {task.priority}
                        </Badge>
                      </div>

                      {/* Tags */}
                      <div className="flex gap-1 flex-wrap">
                        {task.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
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
