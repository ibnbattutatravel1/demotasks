"use client"

import { useState } from "react"
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

// Mock projects data
const mockProjects = [
  { id: "1", name: "Website Redesign", color: "indigo" },
  { id: "2", name: "Mobile App Development", color: "emerald" },
  { id: "3", name: "Marketing Campaign", color: "purple" },
  { id: "4", name: "Database Migration", color: "orange" },
]

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

  const handleSave = async () => {
    if (!projectId) {
      console.log("[v0] Error: Project selection is required")
      return
    }

    setIsSubmitting(true)

    const taskData = {
      title,
      description,
      projectId, // Include project ID in task data
      priority,
      dueDate,
      assignees,
      tags,
      createdBy: user?.name || "Unknown User",
      createdAt: new Date().toISOString(),
      status: user?.role === "admin" ? "approved" : "pending_approval",
    }

    console.log("[v0] Creating new task:", taskData)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (user?.role === "admin") {
      console.log("[v0] Task created and auto-approved (admin user)")
    } else {
      console.log("[v0] Task created and sent for approval (regular user)")
    }

    setIsSubmitting(false)

    const selectedProject = mockProjects.find((p) => p.id === projectId)
    if (selectedProject) {
      router.push(`/projects/${projectId}`)
    } else {
      router.push("/")
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
              disabled={!title.trim() || !projectId || isSubmitting} // Added project validation
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
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
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProjects.map((project) => (
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
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/diverse-woman-portrait.png" />
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Alice Johnson</p>
                      <p className="text-xs text-slate-500">Designer</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/thoughtful-man.png" />
                      <AvatarFallback>B</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Bob Smith</p>
                      <p className="text-xs text-slate-500">Developer</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Assignee
                  </Button>
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
                    <span className="font-medium">
                      {projectId ? mockProjects.find((p) => p.id === projectId)?.name : "Not selected"}
                    </span>
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
