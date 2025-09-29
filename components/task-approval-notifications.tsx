"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, X, Clock, Bell, ExternalLink } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

type ApprovalKind = "approved" | "rejected" | "pending"
interface ApprovalNotification {
  id: string
  type: ApprovalKind
  taskTitle: string
  message: string
  timestamp: string
  read?: boolean
  relatedId?: string
  relatedType?: string
}

export function TaskApprovalNotifications() {
  const [notifications, setNotifications] = useState<ApprovalNotification[]>([])
  const router = useRouter()
  const { user } = useAuth()

  const timeAgo = (iso?: string) => {
    if (!iso) return ""
    const d = new Date(iso)
    const diff = Date.now() - d.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "just now"
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
  }

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
          relatedId?: string;
          relatedType?: string;
        }>
        const mapped: ApprovalNotification[] = items
          .filter(n => (n.type?.includes('task_') || n.type?.includes('timesheet_')) && !n.read)
          .map(n => ({
            id: n.id,
            type: n.type.endsWith('_approved') ? 'approved' : n.type.endsWith('_rejected') ? 'rejected' : 'pending',
            taskTitle: n.title || 'Task Update',
            message: n.message,
            timestamp: n.createdAt,
            read: !!n.read,
            relatedId: n.relatedId,
            relatedType: n.relatedType,
          }))
        if (!abort) setNotifications(mapped)
      } catch {}
    }
    load()
    const interval = window.setInterval(load, 30000)
    return () => {
      abort = true
      window.clearInterval(interval)
    }
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

  const borderByType: Record<ApprovalKind, string> = {
    approved: "border-l-emerald-500",
    rejected: "border-l-rose-500",
    pending: "border-l-amber-500",
  }

  const dotByType: Record<ApprovalKind, string> = {
    approved: "bg-emerald-500",
    rejected: "bg-rose-500",
    pending: "bg-amber-500",
  }

  const badgeVariant = (t: ApprovalKind) =>
    t === 'approved' ? 'default' : t === 'rejected' ? 'destructive' : 'secondary'

  const openRelated = (n: ApprovalNotification) => {
    if (!n.relatedId) return
    if (n.relatedType === 'task') {
      router.push(`/tasks/${n.relatedId}`)
      return
    }
    if (n.relatedType === 'timesheet') {
      if (user?.role === 'admin') router.push(`/admin/timesheets/${n.relatedId}`)
      else router.push('/timesheet')
      return
    }
  }

  if (notifications.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 backdrop-blur px-3 py-2 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Bell className="h-4 w-4" />
          Task Notifications
        </div>
        <Button variant="ghost" size="sm" className="h-7" onClick={markAllAsSeen}>
          Mark all as seen
        </Button>
      </div>

      <div className="max-h-[70vh] overflow-y-auto pr-1 space-y-2">
        {notifications.map((n) => (
          <Card
            key={n.id}
            className={`border-l-4 ${borderByType[n.type]} shadow-sm hover:shadow-md transition-shadow duration-150 rounded-xl`}
          >
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 h-2.5 w-2.5 rounded-full ${dotByType[n.type]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900 truncate">{n.taskTitle}</p>
                    <Badge variant={badgeVariant(n.type) as any} className="text-[10px] px-2 py-0.5 capitalize">
                      {n.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{n.message}</p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                    <Clock className="h-3 w-3" />
                    <span>{timeAgo(n.timestamp)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {n.relatedId && (
                    <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => openRelated(n)}>
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      View
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7"
                    onClick={() => markAsSeen(n.id)}
                  >
                    Mark as seen
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissNotification(n.id)}
                    className="h-6 w-6 p-0"
                    aria-label="Dismiss"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
