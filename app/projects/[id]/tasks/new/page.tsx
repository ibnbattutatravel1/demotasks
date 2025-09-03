"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Calendar, Users, Flag, Tag, Plus, X } from "lucide-react"

// Mock data for project and team members
const mockProject = {
  id: "1",
  name: "Website Redesign",
  assignees: ["Alice Johnson", "Bob Smith", "Charlie Brown", "Diana Prince", "Eve Wilson"],
}

export default function NewTaskPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const projectId = params.id as string

  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    startDate: "",
    dueDate: "",
    assignees: [] as string[],
    tags: [] as string[],
  })

  const [newTag, setNewTag] = useState("")

  const handleAssigneeToggle = (assignee: string) => {
    setTaskData((prev) => ({
      ...prev,
      assignees: prev.assignees.includes(assignee)
        ? prev.assignees.filter((a) => a !== assignee)
        : [...prev.assignees, assignee],
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!taskData.title.trim()) {
      toast({
        title: "Error",
        description: "Task title is required",
        variant: "destructive",
      })
      return
    }

    const newTask = {
      id: `task-${Date.now()}`,
      projectId: projectId,
      title: taskData.title,
      description: taskData.description,
      status: "todo" as const,
      priority: taskData.priority,
      assignees: taskData.assignees,
      startDate: taskData.startDate,
      dueDate: taskData.dueDate,
      tags: taskData.tags,
      approvalStatus: "pending" as const,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      createdBy: "Current User", // In real app, this would come from auth context
      progress: 0,
    }

    // Save to localStorage
    const existingTasks = JSON.parse(localStorage.getItem("tasks") || "[]")
    existingTasks.push(newTask)
    localStorage.setItem("tasks", JSON.stringify(existingTasks))

    console.log("[v0] Task created and saved:", newTask)

    toast({
      title: "Success",
      description: "Task created successfully!",
    })

    // Navigate back to project page
    router.push(`/projects/${projectId}`)
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
                {mockProject.assignees.map((member) => (
                  <div key={member} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50">
                    <Checkbox
                      checked={taskData.assignees.includes(member)}
                      onCheckedChange={() => handleAssigneeToggle(member)}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`/abstract-geometric-shapes.png?height=32&width=32&query=${member}`} />
                      <AvatarFallback className="text-xs">
                        {member
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{member}</p>
                      <p className="text-sm text-slate-600">Team Member</p>
                    </div>
                  </div>
                ))}
              </div>

              {taskData.assignees.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">Selected Assignees:</p>
                  <div className="flex flex-wrap gap-2">
                    {taskData.assignees.map((assignee) => (
                      <Badge key={assignee} variant="secondary" className="bg-blue-100 text-blue-800">
                        {assignee}
                      </Badge>
                    ))}
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
            <Button type="submit" className="bg-indigo-500 hover:bg-indigo-600">
              Create Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
