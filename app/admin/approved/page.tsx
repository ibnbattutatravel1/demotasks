"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Calendar, User, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ApprovedTasksPage() {
  const { user } = useAuth()
  const router = useRouter()

  // Mock approved tasks data
  const approvedTasks = [
    {
      id: 1,
      title: "Redesign user dashboard",
      description: "Update the main dashboard with new UI components",
      assignee: "Sarah Chen",
      assigneeAvatar: "/diverse-woman-portrait.png",
      approvedDate: "2024-01-15",
      dueDate: "2024-01-25",
      priority: "High",
      status: "In Progress",
    },
    {
      id: 2,
      title: "Implement search functionality",
      description: "Add global search across all modules",
      assignee: "Mike Johnson",
      assigneeAvatar: "/thoughtful-man.png",
      approvedDate: "2024-01-14",
      dueDate: "2024-01-30",
      priority: "Medium",
      status: "Completed",
    },
    {
      id: 3,
      title: "Database optimization",
      description: "Optimize queries for better performance",
      assignee: "Alex Rivera",
      assigneeAvatar: "/developer-working.png",
      approvedDate: "2024-01-13",
      dueDate: "2024-02-05",
      priority: "High",
      status: "In Progress",
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700 border-red-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "Low":
        return "bg-green-100 text-green-700 border-green-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700 border-green-200"
      case "In Progress":
        return "bg-blue-100 text-blue-700 border-blue-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
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
                  {approvedTasks.filter((t) => t.status === "In Progress").length}
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
                  {approvedTasks.filter((t) => t.status === "Completed").length}
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
            {approvedTasks.map((task) => (
              <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{task.title}</h3>
                      <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                      <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                    </div>
                    <p className="text-gray-600 mb-4">{task.description}</p>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <img
                          src={task.assigneeAvatar || "/placeholder.svg"}
                          alt={task.assignee}
                          className="w-5 h-5 rounded-full"
                        />
                        <span>{task.assignee}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Approved: {task.approvedDate}</span>
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
