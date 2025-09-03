"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, X, Clock, Bell } from "lucide-react"

interface ApprovalNotification {
  id: string
  type: "approved" | "rejected" | "pending"
  taskTitle: string
  message: string
  timestamp: string
}

export function TaskApprovalNotifications() {
  const [notifications, setNotifications] = useState<ApprovalNotification[]>([
    {
      id: "1",
      type: "approved",
      taskTitle: "Fix responsive layout issues",
      message: "Your task has been approved by Admin User",
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      type: "pending",
      taskTitle: "Implement dark mode toggle",
      message: "Your task is pending approval",
      timestamp: "1 day ago",
    },
  ])

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  if (notifications.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <Bell className="h-4 w-4" />
        Task Notifications
      </div>
      {notifications.map((notification) => (
        <Card key={notification.id} className="border-l-4 border-l-indigo-500">
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 flex-1">
                {notification.type === "approved" && <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />}
                {notification.type === "rejected" && <X className="h-4 w-4 text-red-500 mt-0.5" />}
                {notification.type === "pending" && <Clock className="h-4 w-4 text-orange-500 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{notification.taskTitle}</p>
                  <p className="text-xs text-slate-600">{notification.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{notification.timestamp}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    notification.type === "approved"
                      ? "default"
                      : notification.type === "rejected"
                        ? "destructive"
                        : "secondary"
                  }
                  className="text-xs"
                >
                  {notification.type}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissNotification(notification.id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
