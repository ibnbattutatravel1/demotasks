"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, User, Flag, Clock, Plus, X, AlertCircle, CheckCircle2, FolderOpen } from "lucide-react"
type ProjectOption = { id: string; name: string; color?: string }
type UserOption = { id: string; name: string; avatar?: string }

export default function NewTaskPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [projectId, setProjectId] = useState("") // Added project selection
  const [priority, setPriority] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [assignees, setAssignees] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [users, setUsers] = useState<UserOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [projectFilter, setProjectFilter] = useState("")
  const [assigneeFilter, setAssigneeFilter] = useState("")

  useEffect(() => {
    let abort = false
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const [projRes, usersRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/users'),
        ])
        const projJson = await projRes.json()
        const usersJson = await usersRes.json()
        if (!projRes.ok || !projJson?.success) throw new Error(projJson?.error || 'Failed to fetch projects')
        if (!usersRes.ok || !usersJson?.success) throw new Error(usersJson?.error || 'Failed to fetch users')
        const projList: ProjectOption[] = (projJson.data || []).map((p: any) => ({ id: p.id, name: p.name, color: p.color }))
        const userList: UserOption[] = (usersJson.data || []).map((u: any) => ({ id: u.id, name: u.name, avatar: u.avatar || undefined }))
        if (!abort) {
          setProjects(projList)
          setUsers(userList)
        }
      } catch (e: any) {
        if (!abort) setError(e?.message || 'Failed to load data')
      } finally {
        if (!abort) setLoading(false)
      }
    }
    load()
    return () => { abort = true }
  }, [])

  const filteredProjects = useMemo(() => {
    const q = projectFilter.trim().toLowerCase()
    if (!q) return projects
    return projects.filter(p => p.name.toLowerCase().includes(q))
  }, [projects, projectFilter])

  const filteredUsers = useMemo(() => {
    const q = assigneeFilter.trim().toLowerCase()
    if (!q) return users
    return users.filter(u => u.name.toLowerCase().includes(q))
  }, [users, assigneeFilter])

  const handleSave = async () => {
    if (!projectId || !title.trim() || !priority) {
      console.log("Validation error: title, project and priority are required")
      setFormError("Please fill in title, project and priority.")
      return
    }

    if (!user?.id) {
      console.log("No authenticated user; cannot create task")
      setFormError("You must be signed in to create a task.")
      return
    }

    // Description is optional or can be short
    // if (description.trim().length < 10) {
    //   setFormError("Description must be at least 10 characters long.")
    //   return
    // }

    setIsSubmitting(true)
    try {
      const body: any = {
        projectId,
        title: title.trim(),
        description: description ?? '',
        priority,
        dueDate: dueDate || undefined,
        createdById: user.id,
        approvalStatus: user.role === 'admin' ? 'approved' : 'pending',
        assigneeIds: assignees,
        tags,
      }
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to create task')

      // Navigate to project details
      router.push(`/projects/${projectId}`)
    } catch (e) {
      console.error(e)
      setFormError((e as any)?.message || 'Failed to create task')
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="hover:bg-slate-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-semibold text-slate-900">Create New Task</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-indigo-500 hover:bg-indigo-600"
              disabled={!title.trim() || !projectId || !priority || isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        {formError && (
          <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">{formError}</div>
        )}
        {(!title.trim() || !projectId || !priority) && (
          <div className="mb-4 p-3 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-sm">
            <strong>Required fields:</strong> Please fill in Title, Project, and Priority to create the task.
          </div>
        )}
        {user?.role !== "admin" && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-orange-900 mb-1">Approval Required</h3>
                  <p className="text-sm text-orange-800">
                    Tasks created by users require admin approval before they become active. You'll be notified once
                    your task is reviewed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {user?.role === "admin" && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-green-900 mb-1">Auto-Approval Enabled</h3>
                  <p className="text-sm text-green-800">
                    As an admin, your tasks will be automatically approved and become active immediately.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Task Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Project *</label>
                  <Input
                    value={projectFilter}
                    onChange={(e) => setProjectFilter(e.target.value)}
                    placeholder="Filter projects…"
                    className="mb-2"
                  />
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder={loading ? 'Loading projects…' : 'Select a project'} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredProjects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4 text-slate-500" />
                            {project.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Task Title *</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter task title..."
                    className="text-base"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Description</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the task..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Priority</label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          <div className="flex items-center gap-2">
                            <Flag className="h-4 w-4 text-slate-400" />
                            Low
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center gap-2">
                            <Flag className="h-4 w-4 text-yellow-500" />
                            Medium
                          </div>
                        </SelectItem>
                        <SelectItem value="high">
                          <div className="flex items-center gap-2">
                            <Flag className="h-4 w-4 text-red-500" />
                            High
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Due Date</label>
                    <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="hover:bg-slate-300 rounded-full p-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyPress={(e) => e.key === "Enter" && addTag()}
                    />
                    <Button onClick={addTag} variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Assignment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Input
                    value={assigneeFilter}
                    onChange={(e) => setAssigneeFilter(e.target.value)}
                    placeholder="Filter team…"
                    className="mb-2"
                  />
                  {error && (
                    <div className="text-xs text-red-600">{error}</div>
                  )}
                  {filteredUsers.map((u) => {
                    const selected = assignees.includes(u.id)
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setAssignees((prev) =>
                            prev.includes(u.id) ? prev.filter((id) => id !== u.id) : [...prev, u.id],
                          )
                        }}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 ${selected ? 'bg-slate-50 border border-slate-200' : ''}`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={u.avatar || '/placeholder-user.jpg'} />
                          <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium">{u.name}</p>
                          <p className="text-xs text-slate-500">{selected ? 'Selected' : 'Tap to assign'}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Project</span>
                    <span className="font-medium">{projectId ? (projects.find((p) => p.id === projectId)?.name || 'Unknown') : "Not selected"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Created by</span>
                    <span className="font-medium">{user?.name || "You"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Created</span>
                    <span className="font-medium">Just now</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Due</span>
                    <span className="font-medium">{dueDate ? new Date(dueDate).toLocaleDateString() : "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Status</span>
                    <Badge
                      variant="outline"
                      className={user?.role === "admin" ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"}
                    >
                      {user?.role === "admin" ? "Will be approved" : "Needs approval"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
