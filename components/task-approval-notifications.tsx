"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, X, Clock, Bell } from "lucide-react"

type ApprovalType = "approved" | "rejected" | "pending"
interface ApprovalNotification {
  id: string
  type: ApprovalType
  taskTitle: string
  message: string
  timestamp: string
  read?: boolean
}

export function TaskApprovalNotifications() {
  const [notifications, setNotifications] = useState<ApprovalNotification[]>([])

  useEffect(() => {
    let abort = false
    const load = async () => {
      try {
        const res = await fetch('/api/notifications')
        const json = await res.json()
        if (!res.ok || !json?.success) return
        const items = (json.data || []) as Array<{
          id: string;
          type: string;
          title: string;
          message: string;
          createdAt: string;
          read?: boolean;
        }>
        const mapped: ApprovalNotification[] = items
          .filter(n => (n.type?.includes('task_') || n.type?.includes('timesheet_')) && !n.read)
          .map(n => ({
            id: n.id,
            type: n.type.endsWith('_approved') ? 'approved' : n.type.endsWith('_rejected') ? 'rejected' : 'pending',
            taskTitle: n.title || 'Task Update',
            message: n.message,
            timestamp: new Date(n.createdAt).toLocaleString(),
            read: !!n.read,
          }))
        if (!abort) setNotifications(mapped)
      } catch {}
    }
    load()
    return () => { abort = true }
  }, [])

  const dismissNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    try { await fetch(`/api/notifications/${encodeURIComponent(id)}`, { method: 'PATCH' }) } catch {}
  }

  const markAsSeen = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    try { await fetch(`/api/notifications/${encodeURIComponent(id)}`, { method: 'PATCH' }) } catch {}
  }

  const markAllAsSeen = async () => {
    const ids = notifications.map((n) => n.id)
    setNotifications([])
    try {
      await Promise.all(ids.map((id) => fetch(`/api/notifications/${encodeURIComponent(id)}`, { method: 'PATCH' })))
    } catch {}
  }

  if (notifications.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Bell className="h-4 w-4" />
          Task Notifications
        </div>
        <Button variant="ghost" size="sm" className="h-7" onClick={markAllAsSeen}>
          Mark all as seen
        </Button>
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
                  variant="outline"
                  size="sm"
                  className="h-7"
                  onClick={() => markAsSeen(notification.id)}
                >
                  Mark as seen
                </Button>
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
