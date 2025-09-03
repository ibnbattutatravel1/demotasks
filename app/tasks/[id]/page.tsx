"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Task, Project, Subtask } from "@/lib/types"
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
  User,
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

// Data will be loaded from API

const isOverdue = (dueDate: string, completed: boolean) => {
  if (completed) return false
  const today = new Date()
  const due = new Date(dueDate)
  return due < today
}

const formatDueDate = (dueDate: string) => {
  const date = new Date(dueDate)
  const today = new Date()
  const diffTime = date.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Due today"
  if (diffDays === 1) return "Due tomorrow"
  if (diffDays === -1) return "Due yesterday"
  if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`
  if (diffDays <= 7) return `Due in ${diffDays} days`

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60))

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  return "Just now"
}

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth() // Fixed import to use useAuth instead of useUser
  const [task, setTask] = useState<Task | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [showAddSubtask, setShowAddSubtask] = useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const [newSubtaskDueDate, setNewSubtaskDueDate] = useState("")
  const [expandedSubtasks, setExpandedSubtasks] = useState<Record<string, boolean>>({})
  const [subtaskComments, setSubtaskComments] = useState<Record<string, string>>({})
  const [editingSubtask, setEditingSubtask] = useState<string | null>(null)
  const [editSubtaskTitle, setEditSubtaskTitle] = useState("")
  const [editSubtaskDueDate, setEditSubtaskDueDate] = useState("")
  const [attachments, setAttachments] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [editingTask, setEditingTask] = useState(false)
  const [editTaskTitle, setEditTaskTitle] = useState("")
  const [editTaskDescription, setEditTaskDescription] = useState("")
  const [editTaskDueDate, setEditTaskDueDate] = useState("")
  const [editTaskPriority, setEditTaskPriority] = useState<"low" | "medium" | "high">("medium")
  const { toast } = useToast()

  // Load task and project
  useEffect(() => {
    let ignore = false
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/tasks/${params.id}`)
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
          // Load project context lazily from projects list
          try {
            const pres = await fetch('/api/projects')
            const pjson = await pres.json()
            if (pres.ok && pjson.success) {
              const proj = (pjson.data as Project[]).find((p) => p.id === t.projectId) || null
              setProject(proj)
            }
          } catch {}
        }
      } catch (e) {
        console.error('Failed to load task', e)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [params.id])

  const refreshTask = async () => {
    try {
      const res = await fetch(`/api/tasks/${params.id}`)
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
          body: JSON.stringify({ taskId: task.id, title: newSubtaskTitle.trim(), dueDate: newSubtaskDueDate, tags: [] }),
        })
        if (res.ok) {
          await refreshTask()
          setNewSubtaskTitle("")
          setNewSubtaskDueDate("")
          setShowAddSubtask(false)
        }
      } catch (e) {
        console.error('Add subtask failed', e)
      }
    }
  }

  const toggleSubtaskCompletion = async (subtaskId: string, completed: boolean) => {
    try {
      await fetch(`/api/subtasks/${subtaskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
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

  const addSubtaskComment = (subtaskId: string) => {
    const commentText = subtaskComments[subtaskId]?.trim()
    if (!commentText) return

    const newComment = {
      id: `comment-${Date.now()}`,
      userId: "current-user-id",
      user: "Current User",
      avatar: "/placeholder.svg",
      content: commentText,
      createdAt: new Date().toISOString(),
    }

    setSubtasks(
      subtasks.map((subtask) =>
        subtask.id === subtaskId ? { ...subtask, comments: [...subtask.comments, newComment] } : subtask,
      ),
    )

    setSubtaskComments((prev) => ({
      ...prev,
      [subtaskId]: "",
    }))
  }

  const handleEditSubtask = (subtask: Subtask) => {
    setEditingSubtask(subtask.id)
    setEditSubtaskTitle(subtask.title)
    setEditSubtaskDueDate(subtask.dueDate || "")
  }

  const handleSaveSubtaskEdit = async (subtaskId: string) => {
    if (!editSubtaskTitle.trim()) return
    try {
      await fetch(`/api/subtasks/${subtaskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editSubtaskTitle.trim(), dueDate: editSubtaskDueDate || null }),
      })
      setEditingSubtask(null)
      setEditSubtaskTitle("")
      setEditSubtaskDueDate("")
      await refreshTask()
    } catch (e) {
      console.error('Save subtask edit failed', e)
    }
  }

  const handleCancelSubtaskEdit = () => {
    setEditingSubtask(null)
    setEditSubtaskTitle("")
    setEditSubtaskDueDate("")
  }

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      await fetch(`/api/subtasks/${subtaskId}`, { method: 'DELETE' })
      await refreshTask()
    } catch (e) {
      console.error('Delete subtask failed', e)
    }
  }

  const handleDuplicateSubtask = (subtask: Subtask) => {
    const duplicatedSubtask: Subtask = {
      ...subtask,
      id: `subtask-${Date.now()}`,
      title: `${subtask.title} (Copy)`,
      completed: false,
      createdAt: new Date().toISOString(),
      comments: [],
    }
    setSubtasks([...subtasks, duplicatedSubtask])
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      // Simulate file upload process
      for (const file of Array.from(files)) {
        const newAttachment = {
          id: `attachment-${Date.now()}-${Math.random()}`,
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          url: URL.createObjectURL(file), // In real app, this would be the uploaded file URL
          type: file.type,
          uploadedAt: new Date().toISOString(),
          uploadedById: "current-user-id",
          uploadedBy: {
            id: "current-user-id",
            name: "Current User",
            avatar: "/placeholder.svg",
            initials: "CU",
          },
        }

        setAttachments((prev) => [...prev, newAttachment])
      }

      toast({
        title: "Files uploaded successfully",
        description: `${files.length} file(s) have been uploaded to the task.`,
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset the input
      event.target.value = ""
    }
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

  const handleDeleteAttachment = (attachmentId: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== attachmentId))
    toast({
      title: "Attachment deleted",
      description: "The attachment has been removed from the task.",
    })
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
        const res = await fetch(`/api/tasks/${task.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: editTaskTitle.trim(), description: editTaskDescription.trim(), dueDate: editTaskDueDate || null, priority: editTaskPriority }),
        })
        if (res.ok) {
          setEditingTask(false)
          toast({ title: 'Task updated', description: 'Task has been successfully updated.' })
          await refreshTask()
        }
      } catch (e) {
        console.error('Update task failed', e)
      }
    }
  }

  const handleCancelTaskEdit = () => {
    setEditingTask(false)
    if (task) {
      setEditTaskTitle(task.title)
      setEditTaskDescription(task.description)
      setEditTaskDueDate(task.dueDate || "")
      setEditTaskPriority(task.priority)
    }
  }

  const handleDuplicateTask = () => {
    toast({
      title: "Task duplicated",
      description: "A copy of this task has been created.",
    })
  }

  const handleDeleteTask = async () => {
    if (user?.role !== "admin") {
      // For standard users, send deletion request to admin for approval
      if (confirm("Your task deletion request will be sent to an administrator for approval. Continue?")) {
        toast({
          title: "Deletion request sent",
          description: "Your request to delete this task has been sent to an administrator for approval.",
        })
        console.log("[v0] Task deletion request sent to admin for approval")
      }
    } else {
      // Admins can delete immediately
      if (confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
        try {
          await fetch(`/api/tasks/${params.id}`, { method: 'DELETE' })
          toast({ title: 'Task deleted', description: 'Task has been permanently deleted.', variant: 'destructive' })
          router.back()
        } catch (e) {
          console.error('Delete task failed', e)
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
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="h-6 w-px bg-slate-300" />
              <div>
                {editingTask ? (
                  <div className="space-y-2">
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
                  </div>
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
                      <Badge variant={task?.status === "completed" ? "default" : "secondary"}>
                        {task?.status}
                      </Badge>
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

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Context Card */}
            <Card>
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

            {/* Task Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                {editingTask ? (
                  <div className="space-y-4">
                    <Textarea
                      value={editTaskDescription}
                      onChange={(e) => setEditTaskDescription(e.target.value)}
                      placeholder="Task description..."
                      className="min-h-[100px]"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">Due Date</label>
                        <Input
                          type="date"
                          value={editTaskDueDate}
                          onChange={(e) => setEditTaskDueDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">Priority</label>
                        <Select value={editTaskPriority} onValueChange={setEditTaskPriority}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-700 leading-relaxed">{task?.description}</p>
                )}
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
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <Input
                        type="date"
                        value={newSubtaskDueDate}
                        onChange={(e) => setNewSubtaskDueDate(e.target.value)}
                        className="bg-white flex-1"
                      />
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
                              {subtask.dueDate && isOverdue(subtask.dueDate, subtask.completed) && (
                                <Badge
                                  variant="outline"
                                  className="bg-red-50 text-red-700 border-red-200 text-xs px-1 py-0"
                                >
                                  Overdue
                                </Badge>
                              )}
                              {subtask.assignee && (
                                <div className="flex items-center gap-1 ml-2">
                                  <User className="h-3 w-3 text-slate-400" />
                                  <span className="text-xs text-slate-500">{subtask.assignee.name}</span>
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
                            <div className="flex-1 space-y-2">
                              <Textarea
                                placeholder="Add a comment to this subtask..."
                                value={subtaskComments[subtask.id] || ""}
                                onChange={(e) =>
                                  setSubtaskComments((prev) => ({
                                    ...prev,
                                    [subtask.id]: e.target.value,
                                  }))
                                }
                                className="min-h-[60px] bg-white text-sm"
                              />
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

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Due Date</p>
                    <p className="text-sm text-slate-600">{task?.dueDate || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Flag className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Priority</p>
                    <p className="text-sm text-slate-600">{task?.priority || 'medium'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Created By</p>
                    <p className="text-sm text-slate-600">{task?.createdBy?.name || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Assignees</p>
                    <div className="flex -space-x-2 mt-1">
                      {(task?.assignees || []).map((assignee, index) => (
                        <Avatar key={index} className="h-6 w-6 border-2 border-white">
                          <AvatarImage src={assignee.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">{assignee.initials}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(task?.tags || []).map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Attachments */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Attachments</CardTitle>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept="*/*"
                    />
                    <label htmlFor="file-upload">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isUploading}
                        className="cursor-pointer bg-transparent"
                        asChild
                      >
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          {isUploading ? "Uploading..." : "Upload"}
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 group">
                    <Paperclip className="h-4 w-4 text-slate-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{attachment.name}</p>
                      <p className="text-xs text-slate-500">
                        {attachment.size} • Uploaded by {attachment.uploadedBy.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFileDownload(attachment)}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleFileDownload(attachment)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteAttachment(attachment.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                {attachments.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Paperclip className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No attachments yet</p>
                    <p className="text-xs">Upload files to share with your team</p>
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
