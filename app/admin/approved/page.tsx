"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Calendar, User, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

export default function ApprovedTasksPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let abort = false
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch("/api/tasks")
        const json = await res.json()
        if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to fetch tasks")
        if (!abort) setTasks(json.data || [])
      } catch (e: any) {
        if (!abort) setError(e?.message || "Failed to load tasks")
      } finally {
        if (!abort) setLoading(false)
      }
    }
    load()
    return () => { abort = true }
  }, [])

  const approvedTasks = useMemo(() => {
    return (tasks || []).filter((t: any) => t.approvalStatus === "approved")
  }, [tasks])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
      case "high":
        return "bg-red-100 text-red-700 border-red-200"
      case "Medium":
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "Low":
      case "low":
        return "bg-green-100 text-green-700 border-green-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
      case "done":
        return "bg-green-100 text-green-700 border-green-200"
      case "In Progress":
      case "in-progress":
        return "bg-blue-100 text-blue-700 border-blue-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const formatStatusLabel = (status: string) => {
    if (status === "in-progress") return "In Progress"
    if (status === "done") return "Completed"
    if (status === "todo") return "Todo"
    if (status === "review") return "Review"
    return status
  }

  const formatPriorityLabel = (p: string) => {
    if (p === "high") return "High"
    if (p === "medium") return "Medium"
    if (p === "low") return "Low"
    return p
  }

  if (user?.role !== "admin") {
    return <div>Access denied</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Approved Tasks</h1>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
        )}
        {loading && (
          <div className="mb-6 text-sm text-gray-500">Loading approved tasks…</div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{approvedTasks.length}</p>
                <p className="text-gray-600 text-sm">Total Approved</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {approvedTasks.filter((t: any) => t.status === "in-progress").length}
                </p>
                <p className="text-gray-600 text-sm">In Progress</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {approvedTasks.filter((t: any) => t.status === "done").length}
                </p>
                <p className="text-gray-600 text-sm">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Approved Tasks</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {approvedTasks.map((task: any) => (
              <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{task.title}</h3>
                      <Badge className={getPriorityColor(task.priority)}>{formatPriorityLabel(task.priority)}</Badge>
                      <Badge className={getStatusColor(task.status)}>{formatStatusLabel(task.status)}</Badge>
                    </div>
                    <p className="text-gray-600 mb-4">{task.description}</p>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <img
                          src={(task.assignees?.[0]?.avatar) || "/placeholder-user.jpg"}
                          alt={task.assignees?.[0]?.name || "Assignee"}
                          className="w-5 h-5 rounded-full"
                        />
                        <span>{task.assignees?.[0]?.name || "Unassigned"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Approved: {task.approvedAt ? String(task.approvedAt).split("T")[0] : "-"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {task.dueDate}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push(`/tasks/${task.id}`)}>
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
