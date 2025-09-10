"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { ArrowLeft, Calendar, Users, Flag, Tag, Plus, X } from "lucide-react"


export default function NewTaskPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const { user } = useAuth()
  const projectId = (pathname?.split('/')?.[2] as string) || ""

  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    startDate: "",
    dueDate: "",
    assignees: [] as string[], // user IDs
    tags: [] as string[],
  })

  const [newTag, setNewTag] = useState("")
  const [team, setTeam] = useState<Array<{ id: string; name: string; avatar?: string; initials?: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let abort = false
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/projects')
        const json = await res.json()
        if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to fetch projects')
        const proj = (json.data || []).find((p: any) => p.id === projectId)
        if (!proj) throw new Error('Project not found')
        if (!abort) setTeam(proj.team || [])
      } catch (e: any) {
        if (!abort) setError(e?.message || 'Failed to load project')
      } finally {
        if (!abort) setLoading(false)
      }
    }
    load()
    return () => { abort = true }
  }, [projectId])

  const handleAssigneeToggle = (assigneeId: string) => {
    setTaskData((prev) => ({
      ...prev,
      assignees: prev.assignees.includes(assigneeId)
        ? prev.assignees.filter((a) => a !== assigneeId)
        : [...prev.assignees, assigneeId],
    }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !taskData.tags.includes(newTag.trim())) {
      setTaskData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTaskData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskData.title.trim()) {
      toast({ title: 'Error', description: 'Task title is required', variant: 'destructive' })
      return
    }
    if (!user?.id) {
      toast({ title: 'Error', description: 'You must be signed in to create a task', variant: 'destructive' })
      return
    }
    setIsSubmitting(true)
    try {
      const body = {
        projectId,
        title: taskData.title.trim(),
        description: taskData.description,
        status: 'todo' as const,
        priority: taskData.priority,
        assigneeIds: taskData.assignees,
        startDate: taskData.startDate || undefined,
        dueDate: taskData.dueDate || undefined,
        tags: taskData.tags,
        approvalStatus: user.role === 'admin' ? 'approved' as const : 'pending' as const,
        createdById: user.id,
        progress: 0,
      }
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to create task')
      toast({ title: 'Success', description: 'Task created successfully!' })
      router.push(`/projects/${projectId}`)
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to create task', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200"
      case "medium":
        return "text-amber-600 bg-amber-50 border-amber-200"
      case "low":
        return "text-green-600 bg-green-50 border-green-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/projects/${projectId}`)}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Project
            </Button>
            <div className="border-l border-slate-200 h-6" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Create New Task</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {error && (
          <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
        )}
        {loading && (
          <div className="mb-4 text-sm text-slate-500">Loading team…</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5" />
                Task Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Task Title *</label>
                <Input
                  value={taskData.title}
                  onChange={(e) => setTaskData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title..."
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Description</label>
                <Textarea
                  value={taskData.description}
                  onChange={(e) => setTaskData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the task in detail..."
                  rows={4}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Priority</label>
                  <Select
                    value={taskData.priority}
                    onValueChange={(value: "low" | "medium" | "high") =>
                      setTaskData((prev) => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          Low Priority
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-amber-500" />
                          Medium Priority
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          High Priority
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Start Date</label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={taskData.startDate}
                      onChange={(e) => setTaskData((prev) => ({ ...prev, startDate: e.target.value }))}
                      className="w-full"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Due Date</label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={taskData.dueDate}
                      onChange={(e) => setTaskData((prev) => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignees */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Assign Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {team.map((member) => (
                  <div key={member.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50">
                    <Checkbox
                      checked={taskData.assignees.includes(member.id)}
                      onCheckedChange={(checked) => handleAssigneeToggle(member.id)}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar || "/placeholder-user.jpg"} />
                      <AvatarFallback className="text-xs">{member.initials || (member.name?.[0] || 'U')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{member.name}</p>
                      <p className="text-sm text-slate-600">Team Member</p>
                    </div>
                  </div>
                ))}
              </div>

              {taskData.assignees.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">Selected Assignees:</p>
                  <div className="flex flex-wrap gap-2">
                    {taskData.assignees.map((assigneeId) => {
                      const m = team.find(t => t.id === assigneeId)
                      return (
                        <Badge key={assigneeId} variant="secondary" className="bg-blue-100 text-blue-800">
                          {m?.name || assigneeId}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {taskData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {taskData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:bg-slate-300 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Task Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Priority</p>
                  <Badge variant="outline" className={getPriorityColor(taskData.priority)}>
                    {taskData.priority} priority
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Start Date</p>
                  <p className="font-medium text-slate-900">{taskData.startDate || "No start date set"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Due Date</p>
                  <p className="font-medium text-slate-900">{taskData.dueDate || "No due date set"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Assignees</p>
                  <p className="font-medium text-slate-900">
                    {taskData.assignees.length} team member{taskData.assignees.length !== 1 ? "s" : ""} assigned
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600">Tags</p>
                <p className="font-medium text-slate-900">
                  {taskData.tags.length} tag{taskData.tags.length !== 1 ? "s" : ""} added
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push(`/projects/${projectId}`)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-indigo-500 hover:bg-indigo-600">
              Create Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
