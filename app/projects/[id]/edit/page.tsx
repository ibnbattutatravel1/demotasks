"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

type Project = {
  id: string
  name: string
  description: string
  status: string
  priority: string
  startDate: string
  dueDate: string
  tags: string[]
  color: string
  ownerId: string
  team: Array<{ id: string; name: string }>
}

export default function EditProjectPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const { toast } = useToast()

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [projectName, setProjectName] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [priority, setPriority] = useState("")
  const [status, setStatus] = useState("")
  const [tags, setTags] = useState("")
  const [color, setColor] = useState("")
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([])
  const [ownerId, setOwnerId] = useState("")
  const [teamIds, setTeamIds] = useState<string[]>([])

  // Load project data
  useEffect(() => {
    const loadProject = async () => {
      try {
        const [resProject, resUsers] = await Promise.all([
          fetch(`/api/projects/${projectId}`),
          fetch(`/api/users`),
        ])
        const [jsonProject, jsonUsers] = await Promise.all([
          resProject.json(),
          resUsers.json(),
        ])

        if (resUsers.ok && jsonUsers.success) {
          setUsers((jsonUsers.data || []).map((u: any) => ({ id: u.id, name: u.name || u.email || u.id })))
        }

        if (resProject.ok && jsonProject.success) {
          const p = jsonProject.data
          setProject(p)
          setProjectName(p.name || "")
          setDescription(p.description || "")
          // تحويل التواريخ من ISO string إلى YYYY-MM-DD للـ input date
          setStartDate(p.startDate ? p.startDate.split('T')[0] : "")
          setDueDate(p.dueDate ? p.dueDate.split('T')[0] : "")
          setPriority(p.priority || "medium")
          setStatus(p.status || "planning")
          setTags((p.tags || []).join(", "))
          setColor(p.color || "#6366f1")
          setOwnerId(p.ownerId || "")
          setTeamIds(Array.isArray(p.team) ? p.team.map((m: any) => m.id) : [])
        } else {
          toast({ title: "Error", description: (jsonProject && jsonProject.error) || "Failed to load project", variant: "destructive" })
        }
      } catch (error) {
        console.error("Failed to load project", error)
        toast({ title: "Error", description: "Failed to load project", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    if (projectId) loadProject()
  }, [projectId, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project) return

    setSaving(true)
    try {
      const payload = {
        name: projectName.trim(),
        description: description.trim(),
        startDate,
        dueDate,
        priority,
        status,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        color,
        ownerId: ownerId || project.ownerId,
        teamIds,
      }

      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (res.ok && json.success) {
        toast({ title: "Success", description: "Project updated successfully" })
        router.push(`/projects/${projectId}`)
      } else {
        toast({ title: "Error", description: json.error || "Failed to update project", variant: "destructive" })
      }
    } catch (error) {
      console.error("Failed to update project", error)
      toast({ title: "Error", description: "Failed to update project", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-600">Loading project...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-600">Project not found</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">Edit Project</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Project Name</label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your project"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Due Date</label>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={color || "#6366f1"} onChange={(e) => setColor(e.target.value)} />
                    <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="#6366f1" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="review">In Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tags</label>
                  <Input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Enter tags separated by commas"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Project Lead</label>
                  <select
                    value={ownerId}
                    onChange={(e) => setOwnerId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select a lead</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Team Members</label>
                  <div className="max-h-40 overflow-auto border rounded-md p-2 space-y-2">
                    {users.map((u) => {
                      const checked = teamIds.includes(u.id)
                      return (
                        <label key={u.id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={checked}
                            onChange={(e) => {
                              const isChecked = e.target.checked
                              setTeamIds((prev) =>
                                isChecked ? Array.from(new Set([...prev, u.id])) : prev.filter((id) => id !== u.id)
                              )
                            }}
                          />
                          <span>{u.name}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="bg-indigo-500 hover:bg-indigo-600 text-white">
                  {saving ? "Updating..." : "Update Project"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
