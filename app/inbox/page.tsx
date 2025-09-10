"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { Search, ArrowLeft, Inbox, MessageSquare, Clock, User, CheckCircle2, AlertCircle, Filter } from "lucide-react"
type Priority = "high" | "medium" | "low"
type InboxItem = {
  id: string
  type: string
  title: string
  message: string
  timestamp: string
  isRead: boolean
  priority: Priority
  taskId?: string
}

function mapPriorityByType(type: string): Priority {
  switch (type) {
    case "task_assigned":
    case "task_rejected":
    case "deadline_reminder":
      return "high"
    case "task_pending":
    case "task_commented":
      return "medium"
    case "task_approved":
    case "task_completed":
    default:
      return "low"
  }
}

export default function InboxPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState("all")
  const [items, setItems] = useState<InboxItem[]>([])
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    let abort = false
    const load = async () => {
      try {
        const res = await fetch('/api/notifications')
        const json = await res.json()
        if (!res.ok || !json?.success) return
        const mapped: InboxItem[] = (json.data || []).map((n: any) => ({
          id: String(n.id),
          type: String(n.type),
          title: n.title || 'Notification',
          message: n.message || '',
          timestamp: new Date(n.createdAt).toLocaleString(),
          isRead: !!n.read,
          priority: mapPriorityByType(String(n.type)),
          taskId: n.relatedType === 'task' ? String(n.relatedId) : undefined,
        }))
        if (!abort) setItems(mapped)
      } catch {}
    }
    load()
    return () => { abort = true }
  }, [])

  const handleBackToDashboard = () => {
    router.push("/")
  }

  const handleItemClick = async (item: InboxItem) => {
    if (item.taskId) {
      router.push(`/tasks/${item.taskId}`)
    }
    // Optimistically mark as read
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, isRead: true } : i)))
    try { await fetch(`/api/notifications/${encodeURIComponent(item.id)}`, { method: 'PATCH' }) } catch {}
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.message.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter =
      filter === "all" || (filter === "unread" && !item.isRead) || (filter === "priority" && item.priority === "high")
    return matchesSearch && matchesFilter
  })

  const unreadCount = items.filter((item) => !item.isRead).length

  const getIcon = (type: string) => {
    switch (type) {
      case "task_assigned":
        return <User className="h-4 w-4 text-blue-500" />
      case "comment":
        return <MessageSquare className="h-4 w-4 text-green-500" />
      case "task_approved":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "deadline_reminder":
        return <Clock className="h-4 w-4 text-orange-500" />
      case "task_completed":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-slate-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

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
              <Inbox className="h-5 w-5 text-indigo-600" />
              <h1 className="text-xl font-semibold text-slate-900">Inbox</h1>
              {unreadCount > 0 && <Badge className="bg-indigo-500 text-white text-xs">{unreadCount} unread</Badge>}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search notifications..."
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

      {/* Filters */}
      <div className="px-6 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Button variant={filter === "all" ? "default" : "ghost"} size="sm" onClick={() => setFilter("all")}>
            All
          </Button>
          <Button variant={filter === "unread" ? "default" : "ghost"} size="sm" onClick={() => setFilter("unread")}>
            Unread ({unreadCount})
          </Button>
          <Button variant={filter === "priority" ? "default" : "ghost"} size="sm" onClick={() => setFilter("priority")}>
            High Priority
          </Button>
          <Button variant="ghost" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-3">
          {filteredItems.length === 0 ? (
            <Card className="p-8 text-center">
              <Inbox className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No notifications found</h3>
              <p className="text-slate-600">
                {searchQuery ? "Try adjusting your search terms" : "You're all caught up!"}
              </p>
            </Card>
          ) : (
            filteredItems.map((item) => (
              <Card
                key={item.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  !item.isRead ? "bg-blue-50 border-blue-200" : "hover:bg-slate-50"
                }`}
                onClick={() => handleItemClick(item)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">{getIcon(item.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className={`font-medium ${!item.isRead ? "text-slate-900" : "text-slate-700"}`}>
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge variant="outline" className={`text-xs ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </Badge>
                          {!item.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{item.message}</p>
                      <p className="text-xs text-slate-500">{item.timestamp}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
