"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Project, Task } from "@/lib/types"

export function CreateTaskDialog({
  projects,
  currentUserId,
  open,
  onOpenChange,
  onCreated,
}: {
  projects: Project[]
  currentUserId: string | undefined
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreated: (task: Task) => void
}) {
  const [projectId, setProjectId] = useState<string>("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [dueDate, setDueDate] = useState<string>("")
  const [assignToMe, setAssignToMe] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    if (open) {
      // default to first project
      if (!projectId && projects.length) setProjectId(projects[0].id)
      setError("")
    }
  }, [open, projects, projectId])

  const canSubmit = projectId && title && priority && currentUserId

  const handleCreate = async () => {
    if (!canSubmit) return
    setIsSubmitting(true)
    setError("")
    try {
      const payload = {
        projectId,
        title,
        description,
        status: "todo" as const,
        priority,
        dueDate: dueDate || undefined,
        createdById: currentUserId as string,
        approvalStatus: "pending" as const,
        assigneeIds: assignToMe && currentUserId ? [currentUserId] : [],
        tags: [] as string[],
        progress: 0,
        subtasks: [] as any[],
      }
      const res = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create task")
      }
      onCreated(json.data as Task)
      onOpenChange(false)
      // reset
      setTitle("")
      setDescription("")
      setPriority("medium")
      setDueDate("")
      setAssignToMe(true)
    } catch (e: any) {
      setError(e.message || "Failed to create task")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>Create a new task in a project</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
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
            <div className="space-y-2">
              <Label>Due date</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input id="assign" type="checkbox" className="w-4 h-4" checked={assignToMe} onChange={(e) => setAssignToMe(e.target.checked)} />
            <Label htmlFor="assign">Assign to me</Label>
          </div>

          {error && (
            <div className="p-2 rounded border border-red-200 bg-red-50 text-sm text-red-600">{error}</div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!canSubmit || isSubmitting}>{isSubmitting ? "Creating..." : "Create Task"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
