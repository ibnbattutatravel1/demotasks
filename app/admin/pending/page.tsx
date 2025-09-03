"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, User, ArrowLeft, Check, X, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function PendingTasksPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [pendingTasks, setPendingTasks] = useState([
    {
      id: 4,
      title: "Mobile app optimization",
      description: "Improve app performance and reduce loading times",
      assignee: "Emma Wilson",
      assigneeAvatar: "/professional-woman.png",
      submittedDate: "2024-01-16",
      dueDate: "2024-02-10",
      priority: "High",
      status: "Pending Approval",
      type: "creation", // creation or deletion
    },
    {
      id: 5,
      title: "User feedback system",
      description: "Implement feedback collection and analysis",
      assignee: "David Kim",
      assigneeAvatar: "/diverse-team-manager.png",
      submittedDate: "2024-01-15",
      dueDate: "2024-02-15",
      priority: "Medium",
      status: "Pending Approval",
      type: "creation",
    },
    {
      id: 6,
      title: "Legacy API cleanup",
      description: "Remove deprecated API endpoints",
      assignee: "Sarah Chen",
      assigneeAvatar: "/diverse-woman-portrait.png",
      submittedDate: "2024-01-17",
      dueDate: "2024-01-30",
      priority: "Low",
      status: "Pending Deletion",
      type: "deletion",
    },
  ])

  const handleApprove = (taskId: number) => {
    setPendingTasks((tasks) => tasks.filter((task) => task.id !== taskId))
    // In a real app, this would make an API call
    console.log(`[v0] Task ${taskId} approved`)
  }

  const handleReject = (taskId: number) => {
    setPendingTasks((tasks) => tasks.filter((task) => task.id !== taskId))
    // In a real app, this would make an API call
    console.log(`[v0] Task ${taskId} rejected`)
  }

  const handleApproveDeletion = (taskId: number) => {
    setPendingTasks((tasks) => tasks.filter((task) => task.id !== taskId))
    console.log(`[v0] Task deletion approved for task ${taskId}`)
  }

  const handleRejectDeletion = (taskId: number) => {
    setPendingTasks((tasks) => tasks.filter((task) => task.id !== taskId))
    console.log(`[v0] Task deletion rejected for task ${taskId}`)
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Pending Approval</h1>
            <p className="text-gray-600 mt-1">Tasks waiting for your approval</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingTasks.length}</p>
                <p className="text-gray-600 text-sm">Pending Tasks</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingTasks.filter((t) => t.priority === "High").length}
                </p>
                <p className="text-gray-600 text-sm">High Priority</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Tasks Awaiting Approval</h2>
          </div>
          {pendingTasks.length === 0 ? (
            <div className="p-12 text-center">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending tasks</h3>
              <p className="text-gray-600">All tasks have been reviewed</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {pendingTasks.map((task) => (
                <div key={task.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{task.title}</h3>
                        <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        <Badge
                          className={
                            task.type === "deletion"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : "bg-orange-100 text-orange-700 border-orange-200"
                          }
                        >
                          {task.type === "deletion" ? "Deletion Request" : task.status}
                        </Badge>
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
                          <span>Submitted: {task.submittedDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Due: {task.dueDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/tasks/${task.id}`)}>
                        View Details
                      </Button>
                      {task.type === "deletion" ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApproveDeletion(task.id)}
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Approve Deletion
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectDeletion(task.id)}
                            className="text-gray-600 border-gray-200 hover:bg-gray-50"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(task.id)}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(task.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
