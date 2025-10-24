"use client"

import React, { type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task, Project, Subtask, User as AppUser } from "@/lib/types"
import { formatDate, formatDateTime, isOverdue as checkOverdue, getDaysUntil } from "@/lib/format-date"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  ArrowLeft,
  Calendar,
  Users,
  MessageSquare,
  Paperclip,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  Plus,
  Edit3,
  Flag,
  X,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  User as UserIcon,
  Trash2,
  Edit,
  Download,
  Upload,
  Copy,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VoiceInput } from "@/components/ui/voice-input"

// Data will be loaded from API

const isOverdue = (dueDate: string, completed: boolean) => {
  if (completed) return false
  return checkOverdue(dueDate)
}

const formatDueDate = (dueDate: string) => {
  const diffDays = getDaysUntil(dueDate)

  if (diffDays === 0) return "Due today"
  if (diffDays === 1) return "Due tomorrow"
  if (diffDays === -1) return "Due yesterday"
  if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`
  if (diffDays <= 7) return `Due in ${diffDays} days`

  return formatDate(dueDate, 'short')
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffTime / (1000 * 60))
  const diffSeconds = Math.floor(diffTime / 1000)

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`
  if (diffSeconds >= 0) return "Just now"
  return "Just now"
}

// Truncate description by characters and provide a short preview
const DESCRIPTION_CHAR_LIMIT = 158
const getTruncatedDescription = (text: string, limit: number = DESCRIPTION_CHAR_LIMIT) => {
  if (!text) return { display: "", truncated: false }
  const trimmed = text.trim()
  if (trimmed.length <= limit) return { display: trimmed, truncated: false }
  return { display: trimmed.slice(0, limit).trimEnd() + "…", truncated: true }
}

export default function TaskDetailPage() {
  const router = useRouter()
  const pathname = usePathname()
  const taskId = (pathname?.split('/')?.[2] as string) || ""
  const { user } = useAuth() // Fixed import to use useAuth instead of useUser
  const [task, setTask] = useState<Task | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  // Ticker to force re-render every minute so time-ago labels update
  const [, forceMinuteRerender] = useState(0)
  useEffect(() => {
    const id = setInterval(() => forceMinuteRerender((t) => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])
  const [newComment, setNewComment] = useState("")
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [showAddSubtask, setShowAddSubtask] = useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const [newSubtaskDueDate, setNewSubtaskDueDate] = useState("")
  const [newSubtaskStatus, setNewSubtaskStatus] = useState<"todo" | "in-progress" | "review" | "done">("todo")
  const [newSubtaskAssigneeIds, setNewSubtaskAssigneeIds] = useState<string[]>([])
  const [expandedSubtasks, setExpandedSubtasks] = useState<Record<string, boolean>>({})
  const [subtaskComments, setSubtaskComments] = useState<Record<string, string>>({})
  const [editingSubtask, setEditingSubtask] = useState<string | null>(null)
  const [editSubtaskTitle, setEditSubtaskTitle] = useState("")
  const [editSubtaskDueDate, setEditSubtaskDueDate] = useState("")
  const [editSubtaskAssigneeIds, setEditSubtaskAssigneeIds] = useState<string[]>([])
  const [attachments, setAttachments] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [loadingAttachments, setLoadingAttachments] = useState(true)
  const [editingTask, setEditingTask] = useState(false)
  const [editingAssignees, setEditingAssignees] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<AppUser[]>([])
  const [editTaskTitle, setEditTaskTitle] = useState("")
  const [editTaskDescription, setEditTaskDescription] = useState("")
  const [editTaskDueDate, setEditTaskDueDate] = useState("")
  const [editTaskPriority, setEditTaskPriority] = useState<"low" | "medium" | "high">("medium")
  const [editTaskAssignees, setEditTaskAssignees] = useState<string[]>([])
  const { toast } = useToast()
  // Task-level comments
  const [taskComments, setTaskComments] = useState<Array<{ id: string; userId: string; userName: string; avatar?: string | null; content: string; createdAt: string }>>([])
  const [newTaskComment, setNewTaskComment] = useState("")
  const [hashHandled, setHashHandled] = useState(false)
  // Mentions for task comment composer
  const [taskMentionQuery, setTaskMentionQuery] = useState("")
  const [taskMentionOpen, setTaskMentionOpen] = useState(false)
  const [taskMentionIds, setTaskMentionIds] = useState<string[]>([])

  // Load available users for assignment
  const loadUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users')
      const json = await res.json()
      if (res.ok && json.success) {
        setAvailableUsers(json.data)
      }
    } catch (e) {
      console.error('Failed to load users', e)
    }
  }, [])

  // Load task and project
  useEffect(() => {
    let ignore = false
    const load = async () => {
      try {
        setLoading(true)
        if (!taskId) return
        const res = await fetch(`/api/tasks/${taskId}`)
        const json = await res.json()
        if (ignore) return
        if (res.ok && json.success) {
          const t = json.data as Task
          setTask(t)
          setSubtasks(t.subtasks || [])
          setEditTaskTitle(t.title)
          setEditTaskDescription(t.description)
          setEditTaskDueDate(t.dueDate || "")
          setEditTaskPriority(t.priority)
          setEditTaskAssignees(t.assignees?.map(a => a.id) || [])
          // Load project context lazily from projects list
          try {
            const pres = await fetch('/api/projects')
            const pjson = await pres.json()
            if (pres.ok && pjson.success) {
              const proj = (pjson.data as Project[]).find((p) => p.id === t.projectId) || null
              setProject(proj)
            }
          } catch {}
          // Load task comments
          try {
            const cres = await fetch(`/api/comments?entityType=task&entityId=${encodeURIComponent(taskId)}`)
            const cjson = await cres.json()
            if (cres.ok && cjson.success) {
              setTaskComments(cjson.data || [])
            }
          } catch (e) {
            console.error('Failed to load comments', e)
          }
        }
      } catch (e) {
        console.error('Failed to load task', e)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    loadUsers()
    return () => { ignore = true }
  }, [taskId, loadUsers])

  // Handlers moved to component scope (outside of loadUsers)
  const handleChangeTaskStatus = async (
    status: "planning" | "todo" | "in-progress" | "review" | "done"
  ) => {
    if (!task) return
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to update status')
      await refreshTask()
      toast({ title: 'Status updated', description: `Task marked as ${status}.` })
    } catch (e: any) {
      toast({ title: 'Update failed', description: e?.message || 'Could not update status', variant: 'destructive' })
    }
  }

  const handleChangeSubtaskStatus = async (
    subtaskId: string,
    status: "planning" | "todo" | "in-progress" | "review" | "done"
  ) => {
    try {
      // Sync completed checkbox: true if status is 'done', false otherwise
      const completed = status === 'done'
      const res = await fetch(`/api/subtasks/${subtaskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, completed }),
      })
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to update subtask status')
      await refreshTask()
      toast({ title: 'Subtask updated', description: `Subtask marked as ${status}.` })
    } catch (e: any) {
      toast({ title: 'Update failed', description: e?.message || 'Could not update subtask', variant: 'destructive' })
    }
  }

  const loadTask = useCallback(async () => {
    if (!taskId) return
    try {
      setLoading(true)
      const res = await fetch(`/api/tasks/${taskId}`)
      const json = await res.json()
      if (res.ok && json.success) {
        const t = json.data as Task
        setTask(t)
        setSubtasks(t.subtasks || [])
        setEditTaskTitle(t.title)
        setEditTaskDescription(t.description)
        setEditTaskDueDate(t.dueDate || "")
        setEditTaskPriority(t.priority)
        setEditTaskAssignees(t.assignees?.map(a => a.id) || [])
      }
    } catch (e) {
      console.error('Failed to load task', e)
    } finally {
      setLoading(false)
    }
  }, [taskId])

  const loadAttachments = useCallback(async () => {
    if (!taskId) return
    try {
      setLoadingAttachments(true)
      const res = await fetch(`/api/attachments?entityType=task&entityId=${taskId}`)
      const json = await res.json()
      if (res.ok && json.success) {
        const attachmentsWithUser = json.data.map((att: any) => ({
          ...att,
          uploadedBy: {
            id: att.uploadedById,
            name: att.uploadedByName,
            avatar: null,
            initials: att.uploadedByName.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
          },
        }))
        setAttachments(attachmentsWithUser)
      }
    } catch (error) {
      console.error('Failed to load attachments', error)
    } finally {
      setLoadingAttachments(false)
    }
  }, [taskId])

  useEffect(() => {
    loadTask()
    loadAttachments()
  }, [taskId, loadTask])

  // When navigated with #comments, scroll to comments and mark comment notifications as read
  useEffect(() => {
    if (!taskId) return
    if (typeof window === 'undefined') return
    if (window.location.hash !== '#comments') return
    const el = document.getElementById('comments')
    if (el) {
      // small timeout ensures DOM is ready
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    }
    // mark unread task_commented notifications for this task as read
    ;(async () => {
      try {
        const res = await fetch('/api/notifications')
        const json = await res.json()
        if (!res.ok || !json?.success) return
        const toMark = (json.data || []).filter((n: any) => n?.type === 'task_commented' && n?.relatedType === 'task' && String(n.relatedId) === String(taskId) && !n?.read)
        await Promise.all(
          toMark.map((n: any) => fetch(`/api/notifications/${encodeURIComponent(n.id)}`, { method: 'PATCH' }))
        )
      } catch {}
    })()
    setHashHandled(true)
  }, [taskId, hashHandled])

  const refreshTaskComments = async () => {
    try {
      const cres = await fetch(`/api/comments?entityType=task&entityId=${encodeURIComponent(taskId)}`)
      const cjson = await cres.json()
      if (cres.ok && cjson.success) setTaskComments(cjson.data || [])
    } catch (e) {
      console.error('Failed to refresh comments', e)
    }
  }

  const handleAddTaskComment = async () => {
    if (!task || !user) return
    const content = newTaskComment.trim()
    if (!content) return
    const optimistic = {
      id: `temp-${Date.now()}`,
      userId: user.id,
      userName: user.name || 'You',
      avatar: user.avatar || undefined,
      content,
      createdAt: new Date().toISOString(),
    }
    setTaskComments((prev) => [...prev, optimistic])
    setNewTaskComment("")
    setTaskMentionIds([])
    setTaskMentionQuery("")
    setTaskMentionOpen(false)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType: 'task', entityId: task.id, content, mentions: taskMentionIds }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to add comment')
      await refreshTaskComments()
    } catch (e: any) {
      toast({ title: 'Failed to add comment', description: e.message, variant: 'destructive' })
      // rollback
      setTaskComments((prev) => prev.filter((c) => c.id !== optimistic.id))
      setNewTaskComment(content)
    }
  }

  const handleDeleteTaskComment = async (commentId: string) => {
    const prev = taskComments
    setTaskComments((list) => list.filter((c) => c.id !== commentId))
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete comment')
      toast({ title: 'Comment deleted' })
    } catch (e: any) {
      toast({ title: 'Delete failed', description: e.message, variant: 'destructive' })
      setTaskComments(prev)
    }
  }

  const refreshTask = async () => {
    try {
      if (!taskId) return
      const res = await fetch(`/api/tasks/${taskId}`)
      const json = await res.json()
      if (res.ok && json.success) {
        const t = json.data as Task
        setTask(t)
        setSubtasks(t.subtasks || [])
      }
    } catch (e) {
      console.error('Failed to refresh task', e)
    }
  }

  const handleAddSubtask = async () => {
    if (!task) return
    if (newSubtaskTitle.trim() && newSubtaskDueDate) {
      try {
        const res = await fetch('/api/subtasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            taskId: task.id, 
            title: newSubtaskTitle.trim(), 
            dueDate: newSubtaskDueDate, 
            status: newSubtaskStatus,
            assigneeIds: newSubtaskAssigneeIds
          }),
        })
        if (res.ok) {
          await refreshTask()
          setNewSubtaskTitle("")
          setNewSubtaskDueDate("")
          setNewSubtaskStatus("todo")
          setNewSubtaskAssigneeIds([])
          setShowAddSubtask(false)
        }
      } catch (e) {
        console.error('Add subtask failed', e)
      }
    }
  }

  const toggleSubtaskCompletion = async (subtaskId: string, completed: boolean) => {
    try {
      // When marking as completed, set status to 'done'
      // When unchecking, set status back to 'todo'
      const status = completed ? 'done' : 'todo'
      await fetch(`/api/subtasks/${subtaskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed, status }),
      })
      await refreshTask()
    } catch (e) {
      console.error('Toggle subtask failed', e)
    }
  }

  const toggleSubtaskComments = (subtaskId: string) => {
    setExpandedSubtasks((prev) => ({
      ...prev,
      [subtaskId]: !prev[subtaskId],
    }))
  }

  // Per-subtask mention state
  const [subtaskMentionQuery, setSubtaskMentionQuery] = useState<Record<string, string>>({})
  const [subtaskMentionOpen, setSubtaskMentionOpen] = useState<Record<string, boolean>>({})
  const [subtaskMentionIds, setSubtaskMentionIds] = useState<Record<string, string[]>>({})

  const addSubtaskComment = async (subtaskId: string) => {
    if (!user) return
    const commentText = (subtaskComments[subtaskId] || '').trim()
    if (!commentText) return

    const optimistic = {
      id: `temp-${Date.now()}`,
      userId: user.id,
      user: user.name || 'You',
      avatar: user.avatar || undefined,
      content: commentText,
      createdAt: new Date().toISOString(),
    }

    setSubtasks(
      subtasks.map((subtask) =>
        subtask.id === subtaskId ? { ...subtask, comments: [...subtask.comments, optimistic] } : subtask,
      ),
    )

    setSubtaskComments((prev) => ({ ...prev, [subtaskId]: '' }))
    const mentions = subtaskMentionIds[subtaskId] || []
    setSubtaskMentionIds((prev) => ({ ...prev, [subtaskId]: [] }))
    setSubtaskMentionQuery((prev) => ({ ...prev, [subtaskId]: '' }))
    setSubtaskMentionOpen((prev) => ({ ...prev, [subtaskId]: false }))

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType: 'subtask', entityId: subtaskId, content: commentText, mentions }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to add subtask comment')
      await refreshTask()
    } catch (e: any) {
      toast({ title: 'Failed to add comment', description: e.message, variant: 'destructive' })
      // rollback
      setSubtasks((prev) =>
        prev.map((st) =>
          st.id === subtaskId ? { ...st, comments: st.comments.filter((c) => c.id !== optimistic.id) } : st,
        ),
      )
      setSubtaskComments((prev) => ({ ...prev, [subtaskId]: commentText }))
    }
  }

  // Mention detection helper
  const detectMentionQuery = (text: string) => {
    const m = /(^|\s)@([a-zA-Z0-9._-]{0,30})$/.exec(text)
    return m ? m[2] : ''
  }

  const applyMentionToText = (text: string, query: string, replacement: string) => {
    const needle = '@' + query
    const idx = text.lastIndexOf(needle)
    if (idx === -1) return text + '@' + replacement + ' '
    return text.slice(0, idx) + '@' + replacement + ' ' + text.slice(idx + needle.length)
  }

  const handleEditSubtask = (subtask: Subtask) => {
    setEditingSubtask(subtask.id)
    setEditSubtaskTitle(subtask.title)
    setEditSubtaskDueDate(subtask.dueDate || "")
    setEditSubtaskAssigneeIds(subtask.assigneeIds || [])
  }

  const handleSaveSubtaskEdit = async (subtaskId: string) => {
    if (!editSubtaskTitle.trim()) return
    try {
      await fetch(`/api/subtasks/${subtaskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: editSubtaskTitle.trim(), 
          dueDate: editSubtaskDueDate || null,
          assigneeIds: editSubtaskAssigneeIds
        }),
      })
      setEditingSubtask(null)
      setEditSubtaskTitle("")
      setEditSubtaskDueDate("")
      setEditSubtaskAssigneeIds([])
      await refreshTask()
    } catch (e) {
      console.error('Save subtask edit failed', e)
    }
  }

  const handleCancelSubtaskEdit = () => {
    setEditingSubtask(null)
    setEditSubtaskTitle("")
    setEditSubtaskDueDate("")
    setEditSubtaskAssigneeIds([])
  }

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      await fetch(`/api/subtasks/${subtaskId}`, { method: 'DELETE' })
      await refreshTask()
    } catch (e) {
      console.error('Delete subtask failed', e)
    }
  }

  const handleDuplicateSubtask = async (subtask: Subtask) => {
    try {
      if (!taskId) return
      
      const res = await fetch('/api/subtasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: taskId,
          title: `${subtask.title} (Copy)`,
          description: subtask.description,
          assigneeId: subtask.assigneeId,
          startDate: subtask.startDate,
          dueDate: subtask.dueDate,
          priority: subtask.priority,
          status: 'todo',
        }),
      })
      
      const json = await res.json()
      if (json.success && json.data) {
        setSubtasks([...subtasks, json.data])
        toast({
          title: "Subtask duplicated",
          description: "A copy of this subtask has been created.",
        })
      } else {
        throw new Error(json.error || 'Failed to duplicate subtask')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to duplicate subtask",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0 || !taskId) return

    // Validate file sizes (50MB limit)
    const maxSize = 50 * 1024 * 1024 // 50MB
    const invalidFiles = Array.from(files).filter(file => file.size > maxSize)
    
    if (invalidFiles.length > 0) {
      toast({
        title: "File too large",
        description: `Some files exceed 50MB limit: ${invalidFiles.map(f => f.name).join(', ')}`,
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('entityType', 'task')
        formData.append('entityId', taskId)

        const res = await fetch('/api/attachments', {
          method: 'POST',
          body: formData,
        })

        const json = await res.json()
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Upload failed')
        }

        return json.data
      })

      const uploadedAttachments = await Promise.all(uploadPromises)
      setAttachments((prev) => [...prev, ...uploadedAttachments])

      toast({
        title: "Files uploaded successfully",
        description: `${files.length} file(s) have been attached to the task.`,
      })
    } catch (error: any) {
      console.error("File upload failed:", error)
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your files. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    await handleFileUpload(files)
    event.target.value = ""
  }

  const handleFileDownload = (attachment: any) => {
    // Create a temporary link and trigger download
    const link = document.createElement("a")
    link.href = attachment.url
    link.download = attachment.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Download started",
      description: `Downloading ${attachment.name}...`,
    })
  }

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      const res = await fetch(`/api/attachments/${attachmentId}`, {
        method: 'DELETE',
      })

      const json = await res.json()
      if (res.ok && json.success) {
        setAttachments((prev) => prev.filter((att) => att.id !== attachmentId))
        toast({
          title: "Attachment deleted",
          description: "The attachment has been removed from the task.",
        })
      } else {
        throw new Error(json.error || 'Failed to delete attachment')
      }
    } catch (error: any) {
      console.error('Failed to delete attachment', error)
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete attachment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditTask = () => {
    setEditingTask(true)
    if (task) {
      setEditTaskTitle(task.title)
      setEditTaskDescription(task.description)
      setEditTaskDueDate(task.dueDate || "")
      setEditTaskPriority(task.priority)
    }
  }

  const handleSaveTaskEdit = async () => {
    if (!task) return
    if (editTaskTitle.trim()) {
      try {
        const updates = {
          title: editTaskTitle.trim(),
          description: editTaskDescription.trim(),
          dueDate: editTaskDueDate || null,
          priority: editTaskPriority,
          assigneeIds: editTaskAssignees,
        }
        
        const res = await fetch(`/api/tasks/${task.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        })
        
        if (res.ok) {
          setEditingTask(false)
          setEditingAssignees(false)
          toast({ title: 'Task updated', description: 'Task has been successfully updated.' })
          await refreshTask()
        }
      } catch (e) {
        console.error('Update task failed', e)
        toast({
          title: 'Update failed',
          description: 'Failed to update task. Please try again.',
          variant: 'destructive',
        })
      }
    }
  }

  const handleCancelTaskEdit = () => {
    setEditingTask(false)
    setEditingAssignees(false)
    if (task) {
      setEditTaskTitle(task.title)
      setEditTaskDescription(task.description)
      setEditTaskDueDate(task.dueDate || "")
      setEditTaskPriority(task.priority)
      setEditTaskAssignees(task.assignees?.map(a => a.id) || [])
    }
  }

  const handleDuplicateTask = async () => {
    try {
      if (!task || !user?.id) return
      
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: task.projectId,
          title: `${task.title} (Copy)`,
          description: task.description,
          assigneeIds: task.assignees?.map((a: any) => a.id) || [],
          startDate: task.startDate,
          dueDate: task.dueDate,
          priority: task.priority,
          status: 'todo',
          createdById: user.id,
        }),
      })
      
      const json = await res.json()
      if (json.success && json.data) {
        toast({
          title: "Task duplicated",
          description: "A copy of this task has been created.",
        })
        // Redirect to the new task
        router.push(`/tasks/${json.data.id}`)
      } else {
        throw new Error(json.error || 'Failed to duplicate task')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to duplicate task",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTask = async () => {
    if (user?.role !== "admin") {
      // For standard users, send deletion request to admin for approval
      if (confirm("Your task deletion request will be sent to an administrator for approval. Continue?")) {
        try {
          if (!taskId || !user?.id) return
          const res = await fetch(`/api/tasks/${taskId}?userId=${user.id}`, { method: 'DELETE' })
          const json = await res.json()
          
          if (json.success && json.pending) {
            toast({
              title: "Deletion request sent",
              description: "Your request to delete this task has been sent to an administrator for approval.",
            })
          } else if (json.success) {
            toast({ 
              title: 'Task deleted', 
              description: 'Task has been deleted.', 
              variant: 'destructive' 
            })
            router.back()
          } else {
            throw new Error(json.error || 'Failed to send deletion request')
          }
        } catch (e: any) {
          console.error('Delete task request failed', e)
          toast({
            title: "Request failed",
            description: e.message || "Failed to send deletion request. Please try again.",
            variant: "destructive",
          })
        }
      }
    } else {
      // Admins can delete immediately
      if (confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
        try {
          if (!taskId) return
          await fetch(`/api/tasks/${taskId}?userId=${user?.id}`, { method: 'DELETE' })
          toast({ title: 'Task deleted', description: 'Task has been permanently deleted.', variant: 'destructive' })
          router.back()
        } catch (e) {
          console.error('Delete task failed', e)
          toast({
            title: "Deletion failed",
            description: "Failed to delete task. Please try again.",
            variant: "destructive",
          })
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => {
                if (window.history.length > 1) {
                  router.back()
                } else {
                  router.push('/dashboard')
                }
              }}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="h-6 w-px bg-slate-300" />
              <div>
                {editingTask ? (
                  <React.Fragment>
                    <Input
                      value={editTaskTitle}
                      onChange={(e) => setEditTaskTitle(e.target.value)}
                      className="text-xl font-semibold"
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={handleSaveTaskEdit} className="bg-indigo-500 hover:bg-indigo-600">
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelTaskEdit}>
                        Cancel
                      </Button>
                    </div>
                  </React.Fragment>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-slate-900">{task?.title || "Task"}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={
                          (task?.priority || "medium") === "high"
                            ? "destructive"
                            : (task?.priority || "medium") === "medium"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {task?.priority}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-500">Status:</span>
                        <select
                          className="h-7 text-xs border border-slate-300 rounded-md px-2 bg-white"
                          value={task?.status || 'todo'}
                          onChange={(e) => handleChangeTaskStatus(e.target.value as any)}
                        >
                          <option value="planning">Planning</option>
                          <option value="todo">To Do</option>
                          <option value="in-progress">In Progress</option>
                          <option value="review">Review</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                      {task?.createdBy && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-600">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={task.createdBy.avatar || "/placeholder-user.jpg"} />
                            <AvatarFallback className="text-[10px]">{task.createdBy.initials || (task.createdBy.name?.[0] || 'U')}</AvatarFallback>
                          </Avatar>
                          <span>
                            Created by <span className="font-medium text-slate-900">{task.createdBy.name}</span>
                          </span>
                          <span>•</span>
                          <span>{task?.createdAt ? formatTimeAgo(task.createdAt) : ''}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!editingTask && (
                <>
                  <Button variant="outline" size="sm" onClick={handleEditTask}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => setEditingTask(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Task
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDuplicateTask}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate Task
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleDeleteTask} className="text-red-600 focus:text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        {user?.role === "admin" ? "Delete Task" : "Request Deletion"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Top Row - Project Context (40%) and Description (60%) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          {/* Project Context Card - 40% */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-slate-600" />
                Project Context
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-1">{project?.name || 'Project'}</h3>
                  {project?.description && (
                    <p className="text-slate-600 text-sm mb-3">{project.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    {typeof project?.progress === 'number' && <span>Progress: {project.progress}%</span>}
                    {project?.dueDate && (
                      <>
                        <span>•</span>
                        <span>Due: {project.dueDate}</span>
                      </>
                    )}
                  </div>
                </div>
                {project?.status && <Badge variant="secondary">{project.status}</Badge>}
              </div>
            </CardContent>
          </Card>

          {/* Task Description - 60% */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent className="h-full">
              {editingTask ? (
                <Textarea
                  value={editTaskDescription}
                  onChange={(e) => setEditTaskDescription(e.target.value)}
                  placeholder="Task description..."
                  className="min-h-[150px] resize-none"
                />
              ) : (
                <div className="text-slate-700 leading-relaxed">
                  <Dialog>
                    {(() => {
                      const { display, truncated } = getTruncatedDescription(task?.description || "")
                      return (
                        <>
                          <p className="whitespace-pre-wrap break-words">
                            {display}
                            {truncated && (
                              <>
                                {" "}
                                <DialogTrigger asChild>
                                  <Button variant="link" className="px-0 h-auto align-baseline text-indigo-600">
                                    Read more
                                  </Button>
                                </DialogTrigger>
                              </>
                            )}
                          </p>
                          <DialogContent className="sm:max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Description</DialogTitle>
                              <DialogDescription>Full task description</DialogDescription>
                            </DialogHeader>
                            <div className="max-h-[70vh] overflow-y-auto whitespace-pre-wrap break-words text-slate-700">
                              {task?.description || "No description"}
                            </div>
                          </DialogContent>
                        </>
                      )
                    })()}
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Layout - Content + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area - Comments and Subtasks */}
          <div className="lg:col-span-2 space-y-6">

            {/* Comments */}
            <Card id="comments">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-slate-600" />
                  Comments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {taskComments.length === 0 && (
                    <p className="text-sm text-slate-500">No comments yet.</p>
                  )}
                  {taskComments.map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={c.avatar || "/placeholder-user.jpg"} />
                        <AvatarFallback className="text-xs">{(c.userName || 'U')[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-slate-900">{c.userName}</span>
                          <span className="text-xs text-slate-500">{formatTimeAgo(c.createdAt)}</span>
                        </div>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{c.content}</p>
                      </div>
                      {(user?.role === 'admin' || user?.id === c.userId) && (
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteTaskComment(c.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-start gap-3">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">{(user?.name || 'U').split(' ').map((n) => n[0]).join('').toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2 relative">
                    <div className="relative">
                      <Textarea
                        placeholder="Write a comment..."
                        value={newTaskComment}
                        onChange={(e) => {
                          const val = e.target.value
                          setNewTaskComment(val)
                          const q = detectMentionQuery(val)
                          setTaskMentionQuery(q)
                          setTaskMentionOpen(!!q)
                        }}
                        className="min-h-[60px] pr-12"
                      />
                      <div className="absolute right-2 top-2">
                        <VoiceInput onTranscript={(text) => {
                          const newText = newTaskComment ? `${newTaskComment} ${text}` : text
                          setNewTaskComment(newText)
                        }} />
                      </div>
                    </div>
                    {taskMentionOpen && taskMentionQuery && (
                      <div className="absolute z-10 left-0 right-0 bottom-full mb-2 bg-white border border-slate-200 rounded-md shadow-md max-h-56 overflow-auto">
                        <div className="p-2 text-xs text-slate-500">Mention someone</div>
                        <div>
                          {availableUsers
                            .filter((u) =>
                              (u.name || '').toLowerCase().includes(taskMentionQuery.toLowerCase()) ||
                              (u.email || '').toLowerCase().includes(taskMentionQuery.toLowerCase())
                            )
                            .slice(0, 8)
                            .map((u) => (
                              <button
                                key={u.id}
                                type="button"
                                onClick={() => {
                                  setNewTaskComment((prev) => applyMentionToText(prev, taskMentionQuery, u.name || u.email || 'user'))
                                  setTaskMentionIds((prev) => (prev.includes(u.id) ? prev : [...prev, u.id]))
                                  setTaskMentionOpen(false)
                                  setTaskMentionQuery("")
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={u.avatar || '/placeholder.svg'} />
                                  <AvatarFallback className="text-[10px]">{u.initials}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{u.name}</span>
                                <span className="text-xs text-slate-500 ml-2">@{u.email}</span>
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end">
                      <Button size="sm" onClick={handleAddTaskComment} disabled={!newTaskComment.trim()}>
                        Add Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subtasks */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Subtasks</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setShowAddSubtask(!showAddSubtask)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {showAddSubtask && (
                  <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-3">
                    <Input
                      placeholder="Enter subtask title..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      className="bg-white"
                    />
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-slate-500" />
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between bg-white"
                          >
                            {newSubtaskAssigneeIds.length > 0
                              ? `${newSubtaskAssigneeIds.length} assignee${newSubtaskAssigneeIds.length > 1 ? 's' : ''} selected`
                              : "Select assignees..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <Command>
                            <CommandInput placeholder="Search users..." />
                            <CommandEmpty>No users found.</CommandEmpty>
                            <CommandGroup className="max-h-[200px] overflow-y-auto">
                              {availableUsers.map((user) => (
                                <CommandItem
                                  key={user.id}
                                  onSelect={() => {
                                    setNewSubtaskAssigneeIds(prev =>
                                      prev.includes(user.id)
                                        ? prev.filter(id => id !== user.id)
                                        : [...prev, user.id]
                                    )
                                  }}
                                >
                                  <div className="flex items-center gap-2 w-full">
                                    <Check
                                      className={cn(
                                        "h-4 w-4",
                                        newSubtaskAssigneeIds.includes(user.id) ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={user.avatar || "/placeholder.svg"} />
                                      <AvatarFallback className="text-xs">
                                        {user.initials}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="flex-1">{user.name}</span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    {newSubtaskAssigneeIds.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {newSubtaskAssigneeIds.map(id => {
                          const user = availableUsers.find(u => u.id === id)
                          return user ? (
                            <div key={id} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              <Avatar className="h-4 w-4">
                                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="text-[10px]">
                                  {user.initials}
                                </AvatarFallback>
                              </Avatar>
                              <span>{user.name}</span>
                              <button
                                onClick={() => setNewSubtaskAssigneeIds(prev => prev.filter(assigneeId => assigneeId !== id))}
                                className="ml-1 hover:text-blue-600"
                              >
                                ×
                              </button>
                            </div>
                          ) : null
                        })}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <Input
                        type="date"
                        value={newSubtaskDueDate}
                        onChange={(e) => setNewSubtaskDueDate(e.target.value)}
                        className="bg-white flex-1"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-600">Status</span>
                      <select
                        className="h-9 text-sm border border-slate-300 rounded-md px-2 bg-white"
                        value={newSubtaskStatus}
                        onChange={(e) => setNewSubtaskStatus(e.target.value as any)}
                      >
                        <option value="planning">Planning</option>
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleAddSubtask}
                        className="bg-indigo-500 hover:bg-indigo-600"
                        disabled={!newSubtaskTitle.trim() || !newSubtaskDueDate}
                      >
                        Add Subtask
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddSubtask(false)
                          setNewSubtaskTitle("")
                          setNewSubtaskDueDate("")
                          setNewSubtaskStatus("todo")
                          setNewSubtaskAssigneeIds([])
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {subtasks.map((subtask) => (
                  <div key={subtask.id} className="border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3 p-3 hover:bg-slate-50">
                      <button onClick={() => toggleSubtaskCompletion(subtask.id, !subtask.completed)}>
                        {subtask.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                        )}
                      </button>
                      <div className="flex-1">
                        {editingSubtask === subtask.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editSubtaskTitle}
                              onChange={(e) => setEditSubtaskTitle(e.target.value)}
                              className="text-sm"
                              autoFocus
                            />
                            <div className="flex items-center gap-2">
                              <UserIcon className="h-4 w-4 text-slate-500" />
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between bg-white text-sm"
                                  >
                                    {editSubtaskAssigneeIds.length > 0
                                      ? `${editSubtaskAssigneeIds.length} assignee${editSubtaskAssigneeIds.length > 1 ? 's' : ''} selected`
                                      : "Select assignees..."
                                    }
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0">
                                  <Command>
                                    <CommandInput placeholder="Search users..." />
                                    <CommandEmpty>No users found.</CommandEmpty>
                                    <CommandGroup className="max-h-[200px] overflow-y-auto">
                                      {availableUsers.map((user) => (
                                        <CommandItem
                                          key={user.id}
                                          onSelect={() => {
                                            setEditSubtaskAssigneeIds(prev =>
                                              prev.includes(user.id)
                                                ? prev.filter(id => id !== user.id)
                                                : [...prev, user.id]
                                            )
                                          }}
                                        >
                                          <div className="flex items-center gap-2 w-full">
                                            <Check
                                              className={cn(
                                                "h-4 w-4",
                                                editSubtaskAssigneeIds.includes(user.id) ? "opacity-100" : "opacity-0"
                                              )}
                                            />
                                            <Avatar className="h-6 w-6">
                                              <AvatarImage src={user.avatar || "/placeholder.svg"} />
                                              <AvatarFallback className="text-xs">
                                                {user.initials}
                                              </AvatarFallback>
                                            </Avatar>
                                            <span className="flex-1">{user.name}</span>
                                          </div>
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            </div>
                            {editSubtaskAssigneeIds.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {editSubtaskAssigneeIds.map(id => {
                                  const user = availableUsers.find(u => u.id === id)
                                  return user ? (
                                    <div key={id} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                      <Avatar className="h-4 w-4">
                                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                                        <AvatarFallback className="text-[10px]">
                                          {user.initials}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span>{user.name}</span>
                                      <button
                                        onClick={() => setEditSubtaskAssigneeIds(prev => prev.filter(assigneeId => assigneeId !== id))}
                                        className="ml-1 hover:text-blue-600"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ) : null
                                })}
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-slate-500" />
                              <Input
                                type="date"
                                value={editSubtaskDueDate}
                                onChange={(e) => setEditSubtaskDueDate(e.target.value)}
                                className="text-sm flex-1"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSaveSubtaskEdit(subtask.id)}
                                className="bg-indigo-500 hover:bg-indigo-600"
                              >
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancelSubtaskEdit}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <span
                              className={`block ${subtask.completed ? "line-through text-slate-500" : "text-slate-900"}`}
                            >
                              {subtask.title}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="h-3 w-3 text-slate-400" />
                              <span
                                className={`text-xs ${
                                  subtask.dueDate && isOverdue(subtask.dueDate, subtask.completed)
                                    ? "text-red-600 font-medium"
                                    : subtask.completed
                                      ? "text-slate-400"
                                      : "text-slate-500"
                                }`}
                              >
                                {subtask.dueDate ? formatDueDate(subtask.dueDate) : "No due date"}
                              </span>
                              <div className="flex items-center gap-1 ml-2">
                                <span className="text-[10px] text-slate-500">Status</span>
                                <select
                                  className="h-6 text-[10px] border border-slate-300 rounded px-1 bg-white"
                                  value={subtask.status || 'todo'}
                                  onChange={(e) => handleChangeSubtaskStatus(subtask.id, e.target.value as any)}
                                >
                                  <option value="planning">Planning</option>
                                  <option value="todo">To Do</option>
                                  <option value="in-progress">In Progress</option>
                                  <option value="review">Review</option>
                                  <option value="done">Done</option>
                                </select>
                              </div>
                              {subtask.dueDate && isOverdue(subtask.dueDate, subtask.completed) && (
                                <Badge
                                  variant="outline"
                                  className="bg-red-50 text-red-700 border-red-200 text-xs px-1 py-0"
                                >
                                  Overdue
                                </Badge>
                              )}
                              {subtask.assignees && subtask.assignees.length > 0 && (
                                <div className="flex items-center gap-1 ml-2">
                                  <UserIcon className="h-3 w-3 text-slate-400" />
                                  <div className="flex items-center gap-1">
                                    {subtask.assignees.slice(0, 3).map((assignee, index) => (
                                      <React.Fragment key={assignee.id}>
                                        {index > 0 && <span className="text-xs text-slate-400">,</span>}
                                        <span className="text-xs text-slate-500">{assignee.name}</span>
                                      </React.Fragment>
                                    ))}
                                    {subtask.assignees.length > 3 && (
                                      <span className="text-xs text-slate-400">+{subtask.assignees.length - 3} more</span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      {editingSubtask !== subtask.id && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSubtaskComments(subtask.id)}
                            className="flex items-center gap-1"
                          >
                            <MessageSquare className="h-4 w-4" />
                            <span className="text-xs">{subtask.comments?.length || 0}</span>
                            {expandedSubtasks[subtask.id] ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleEditSubtask(subtask)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit subtask
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicateSubtask(subtask)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteSubtask(subtask.id)} variant="destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete subtask
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      )}
                    </div>

                    {expandedSubtasks[subtask.id] && (
                      <div className="border-t border-slate-200 p-4 bg-slate-50">
                        <div className="space-y-3">
                          {subtask.comments?.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={comment.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="text-xs">{comment.user[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-slate-900">{comment.user}</span>
                                  <span className="text-xs text-slate-500">{formatTimeAgo(comment.createdAt)}</span>
                                </div>
                                <p className="text-sm text-slate-700">{comment.content}</p>
                              </div>
                            </div>
                          ))}

                          <div className="flex gap-3 pt-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">CU</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2 relative">
                              <div className="relative">
                                <Textarea
                                  placeholder="Add a comment to this subtask..."
                                  value={subtaskComments[subtask.id] || ""}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    setSubtaskComments((prev) => ({ ...prev, [subtask.id]: val }))
                                    const q = detectMentionQuery(val)
                                    setSubtaskMentionQuery((prev) => ({ ...prev, [subtask.id]: q }))
                                    setSubtaskMentionOpen((prev) => ({ ...prev, [subtask.id]: !!q }))
                                  }}
                                  className="min-h-[60px] bg-white text-sm pr-12"
                                />
                                <div className="absolute right-2 top-2">
                                  <VoiceInput onTranscript={(text) => {
                                    const currentText = subtaskComments[subtask.id] || ""
                                    const newText = currentText ? `${currentText} ${text}` : text
                                    setSubtaskComments((prev) => ({ ...prev, [subtask.id]: newText }))
                                  }} />
                                </div>
                              </div>
                              {subtaskMentionOpen[subtask.id] && subtaskMentionQuery[subtask.id] && (
                                <div className="absolute z-10 left-0 right-0 bottom-full mb-2 bg-white border border-slate-200 rounded-md shadow-md max-h-56 overflow-auto">
                                  <div className="p-2 text-xs text-slate-500">Mention someone</div>
                                  <div>
                                    {availableUsers
                                      .filter((u) =>
                                        (u.name || '').toLowerCase().includes(subtaskMentionQuery[subtask.id].toLowerCase()) ||
                                        (u.email || '').toLowerCase().includes(subtaskMentionQuery[subtask.id].toLowerCase())
                                      )
                                      .slice(0, 8)
                                      .map((u) => (
                                        <button
                                          key={u.id}
                                          type="button"
                                          onClick={() => {
                                            setSubtaskComments((prev) => ({
                                              ...prev,
                                              [subtask.id]: applyMentionToText(prev[subtask.id] || '', subtaskMentionQuery[subtask.id], u.name || u.email || 'user')
                                            }))
                                            setSubtaskMentionIds((prev) => ({
                                              ...prev,
                                              [subtask.id]: prev[subtask.id]?.includes(u.id)
                                                ? prev[subtask.id]
                                                : [...(prev[subtask.id] || []), u.id],
                                            }))
                                            setSubtaskMentionOpen((prev) => ({ ...prev, [subtask.id]: false }))
                                            setSubtaskMentionQuery((prev) => ({ ...prev, [subtask.id]: '' }))
                                          }}
                                          className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                                        >
                                          <Avatar className="h-5 w-5">
                                            <AvatarImage src={u.avatar || '/placeholder.svg'} />
                                            <AvatarFallback className="text-[10px]">{u.initials}</AvatarFallback>
                                          </Avatar>
                                          <span className="text-sm">{u.name}</span>
                                          <span className="text-xs text-slate-500 ml-2">@{u.email}</span>
                                        </button>
                                      ))}
                                  </div>
                                </div>
                              )}
                              <Button
                                size="sm"
                                onClick={() => addSubtaskComment(subtask.id)}
                                disabled={!subtaskComments[subtask.id]?.trim()}
                                className="bg-indigo-500 hover:bg-indigo-600"
                              >
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Comment
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Details and Attachments */}
          <div className="lg:col-span-1 space-y-6">
            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Due Date</p>
                    {editingTask ? (
                      <Input
                        type="date"
                        value={editTaskDueDate}
                        onChange={(e) => setEditTaskDueDate(e.target.value)}
                        className="mt-1 h-8 text-sm"
                      />
                    ) : (
                      <p className="text-sm text-slate-600">{task?.dueDate ? formatDate(task.dueDate) : '—'}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Flag className="h-4 w-4 text-slate-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Priority</p>
                    {editingTask ? (
                      <Select value={editTaskPriority} onValueChange={(v) => setEditTaskPriority(v as "low" | "medium" | "high")}>
                        <SelectTrigger className="mt-1 h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-slate-600">{task?.priority || 'medium'}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <UserIcon className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Created By</p>
                    {task?.createdBy ? (
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-600">{task.createdBy.name}</span>
                        {task.createdBy.email && (
                          <span className="text-xs text-slate-500">{task.createdBy.email}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-4 w-4 text-slate-500 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900">Assignees</p>
                      {editingTask && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-xs"
                          onClick={() => setEditingAssignees(!editingAssignees)}
                        >
                          {editingAssignees ? 'Done' : 'Edit'}
                        </Button>
                      )}
                    </div>
                    
                    {editingAssignees ? (
                      <div className="mt-1 space-y-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="w-full justify-between"
                            >
                              Add assignee...
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0">
                            <Command>
                              <CommandInput placeholder="Search users..." />
                              <CommandEmpty>No users found.</CommandEmpty>
                              <CommandGroup className="max-h-[200px] overflow-y-auto">
                                {availableUsers.map((user) => (
                                  <CommandItem
                                    key={user.id}
                                    onSelect={() => {
                                      setEditTaskAssignees(prev => 
                                        prev.includes(user.id)
                                          ? prev.filter(id => id !== user.id)
                                          : [...prev, user.id]
                                      )
                                    }}
                                  >
                                    <div className="flex items-center gap-2 w-full">
                                      <Check
                                        className={cn(
                                          "h-4 w-4",
                                          editTaskAssignees.includes(user.id) ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                                        <AvatarFallback className="text-xs">
                                          {user.initials}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="flex-1">{user.name}</span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          {editTaskAssignees.map(userId => {
                            const user = availableUsers.find(u => u.id === userId)
                            if (!user) return null
                            return (
                              <div key={user.id} className="flex items-center gap-1 bg-slate-100 rounded-full pl-2 pr-1 py-1">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={user.avatar || "/placeholder.svg"} />
                                  <AvatarFallback className="text-xs">
                                    {user.initials}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs">{user.name}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 rounded-full"
                                  onClick={() => setEditTaskAssignees(prev => prev.filter(id => id !== user.id))}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="flex -space-x-2 mt-1">
                        {(task?.assignees?.length ? task.assignees : []).map((assignee, index) => (
                          <Tooltip key={assignee.id || index}>
                            <TooltipTrigger asChild>
                              <Avatar
                                className="h-6 w-6 border-2 border-white cursor-pointer"
                                title={assignee.name}
                              >
                                <AvatarImage src={assignee.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="text-xs">{assignee.initials}</AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="flex flex-col items-start gap-0.5">
                              <span className="text-xs font-medium leading-tight">{assignee.name}</span>
                              {assignee.email && (
                                <span className="text-[10px] leading-tight text-primary-foreground/80">
                                  {assignee.email}
                                </span>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        ))}
                        {!task?.assignees?.length && (
                          <span className="text-sm text-slate-400">No assignees</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attachments */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Paperclip className="h-5 w-5 text-slate-600" />
                    Attachments
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      disabled={isUploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploading ? 'Uploading...' : 'Upload'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingAttachments ? (
                  <div className="text-sm text-slate-500">Loading attachments...</div>
                ) : attachments.length === 0 ? (
                  <p className="text-sm text-slate-400">No attachments yet.</p>
                ) : (
                  <div className="space-y-3">
                    {attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Paperclip className="h-4 w-4 text-slate-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{attachment.name}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span>{attachment.size}</span>
                              <span>•</span>
                              <span>by {attachment.uploadedBy?.name || 'Unknown'}</span>
                              <span>•</span>
                              <span>{formatTimeAgo(attachment.uploadedAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFileDownload(attachment)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAttachment(attachment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
