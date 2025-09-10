"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { ArrowLeft } from "lucide-react"

export default function NewEventPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [eventTitle, setEventTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [eventType, setEventType] = useState("meeting")
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([])
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([])
  const [projectId, setProjectId] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [assignees, setAssignees] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        const projList = (projJson.data || []).map((p: any) => ({ id: p.id, name: p.name }))
        const userList = (usersJson.data || []).map((u: any) => ({ id: u.id, name: u.name }))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) {
      setError('You must be signed in to create an event.')
      return
    }
    if (!projectId || !eventTitle.trim() || !date) {
      setError('Project, Title, and Date are required.')
      return
    }
    setIsSubmitting(true)
    try {
      const body: any = {
        projectId,
        title: eventTitle.trim(),
        description: description ? `${description}\n\nTime: ${startTime || '—'} - ${endTime || '—'}\nType: ${eventType}` : `Time: ${startTime || '—'} - ${endTime || '—'}\nType: ${eventType}`,
        priority,
        startDate: date,
        dueDate: date,
        createdById: user.id,
        approvalStatus: user.role === 'admin' ? 'approved' : 'pending',
        assigneeIds: assignees,
        tags: eventType ? [eventType] : [],
      }
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to create event')
      router.push('/calendar')
    } catch (err: any) {
      setError(err?.message || 'Failed to create event')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">Create New Event</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Event Title</label>
                <Input
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your event"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Start Time</label>
                  <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">End Time</label>
                  <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Event Type</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="meeting">Meeting</option>
                  <option value="task">Task</option>
                  <option value="reminder">Reminder</option>
                  <option value="deadline">Deadline</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Project</label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder={loading ? 'Loading…' : 'Select a project'} />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Assign To</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {users.map((u) => (
                    <label key={u.id} className="flex items-center gap-2 p-2 rounded border border-slate-200">
                      <input
                        type="checkbox"
                        checked={assignees.includes(u.id)}
                        onChange={(e) => {
                          setAssignees((prev) =>
                            e.target.checked ? [...prev, u.id] : prev.filter((id) => id !== u.id),
                          )
                        }}
                      />
                      <span className="text-sm">{u.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 bg-indigo-500 hover:bg-indigo-600">
                  Create Event
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
