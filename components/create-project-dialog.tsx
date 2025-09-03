"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Check, Plus, Users, Calendar, Flag } from "lucide-react"
import type { Project } from "@/lib/types"

// Mock team members - in real app this would come from API
const mockTeamMembers = [
  { id: "1", name: "Alice Johnson", email: "alice@company.com", initials: "AJ" },
  { id: "2", name: "Bob Smith", email: "bob@company.com", initials: "BS" },
  { id: "3", name: "Charlie Brown", email: "charlie@company.com", initials: "CB" },
  { id: "4", name: "Diana Prince", email: "diana@company.com", initials: "DP" },
  { id: "5", name: "Eve Wilson", email: "eve@company.com", initials: "EW" },
]

interface CreateProjectDialogProps {
  onProjectCreated: (project: Project) => void
  children?: React.ReactNode
}

export function CreateProjectDialog({ onProjectCreated, children }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [isCreating, setIsCreating] = useState(false)

  // Form state
  const [projectName, setProjectName] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [priority, setPriority] = useState("")
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([])
  const [projectOwner, setProjectOwner] = useState("1")
  const [tags, setTags] = useState("")
  const [color, setColor] = useState("indigo")

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({})

  const resetForm = () => {
    setProjectName("")
    setDescription("")
    setStartDate("")
    setDueDate("")
    setPriority("")
    setSelectedTeamMembers([])
    setProjectOwner("1")
    setTags("")
    setColor("indigo")
    setErrors({})
    setStep(1)
  }

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}

    if (!projectName.trim()) {
      newErrors.projectName = "Project name is required"
    }
    if (!priority) {
      newErrors.priority = "Priority is required"
    }
    if (dueDate && startDate && new Date(dueDate) < new Date(startDate)) {
      newErrors.dueDate = "Due date must be after start date"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}

    if (selectedTeamMembers.length === 0) {
      newErrors.teamMembers = "At least one team member is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleTeamMemberToggle = (memberId: string) => {
    setSelectedTeamMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId],
    )
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    }
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep2()) return

    setIsCreating(true)

    try {
      const payload = {
        name: projectName,
        description: description,
        priority: (priority.toLowerCase() as "low" | "medium" | "high"),
        startDate,
        dueDate,
        ownerId: projectOwner,
        teamIds: selectedTeamMembers,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        color,
      }

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create project")
      }

      const created: Project = json.data
      onProjectCreated(created)
      setOpen(false)
      resetForm()
    } catch (error) {
      console.error("[v0] Error creating project:", error)
      setErrors({ submit: "Failed to create project. Please try again." })
    } finally {
      setIsCreating(false)
    }
  }

  const canProceed = step === 1 ? projectName.trim() && priority : selectedTeamMembers.length > 0

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (!newOpen) {
          resetForm()
        }
      }}
    >
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-indigo-500 hover:bg-indigo-600">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Plus className="h-4 w-4 text-indigo-600" />
            </div>
            Create New Project
          </DialogTitle>
          <DialogDescription>
            {step === 1 ? "Set up your project details and timeline" : "Choose your team members and finalize settings"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1 ? "bg-indigo-500 text-white" : "bg-slate-200 text-slate-600"
            }`}
          >
            1
          </div>
          <div className={`flex-1 h-1 rounded ${step >= 2 ? "bg-indigo-500" : "bg-slate-200"}`} />
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 2 ? "bg-indigo-500 text-white" : "bg-slate-200 text-slate-600"
            }`}
          >
            2
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Project Name *</label>
              <Input
                value={projectName}
                onChange={(e) => {
                  setProjectName(e.target.value)
                  if (errors.projectName) {
                    setErrors((prev) => ({ ...prev, projectName: "" }))
                  }
                }}
                placeholder="Enter project name"
                className={errors.projectName ? "border-red-500" : ""}
              />
              {errors.projectName && <p className="text-sm text-red-600 mt-1">{errors.projectName}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your project goals and objectives"
                rows={3}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Start Date
                </label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Due Date
                </label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value)
                    if (errors.dueDate) {
                      setErrors((prev) => ({ ...prev, dueDate: "" }))
                    }
                  }}
                  className={errors.dueDate ? "border-red-500" : ""}
                />
                {errors.dueDate && <p className="text-sm text-red-600 mt-1">{errors.dueDate}</p>}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Flag className="h-4 w-4 inline mr-1" />
                Priority *
              </label>
              <select
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value)
                  if (errors.priority) {
                    setErrors((prev) => ({ ...prev, priority: "" }))
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.priority ? "border-red-500" : "border-slate-300"
                }`}
              >
                <option value="">Select priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              {errors.priority && <p className="text-sm text-red-600 mt-1">{errors.priority}</p>}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tags (Optional)</label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Enter tags separated by commas (e.g., Design, Frontend, UX)"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {/* Project Lead */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Project Lead</label>
              <select
                value={projectOwner}
                onChange={(e) => setProjectOwner(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {mockTeamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Team Members */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                <Users className="h-4 w-4 inline mr-1" />
                Team Members *
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {mockTeamMembers.map((member) => (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTeamMembers.includes(member.id)
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                    onClick={() => handleTeamMemberToggle(member.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`/abstract-geometric-shapes.png?height=32&width=32&query=${member.name}`} />
                        <AvatarFallback>{member.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900">{member.name}</p>
                        <p className="text-sm text-slate-600">{member.email}</p>
                      </div>
                    </div>
                    {selectedTeamMembers.includes(member.id) && <Check className="h-5 w-5 text-indigo-600" />}
                  </div>
                ))}
              </div>
              {selectedTeamMembers.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">
                    {selectedTeamMembers.length} member{selectedTeamMembers.length !== 1 ? "s" : ""} selected
                  </Badge>
                </div>
              )}
              {errors.teamMembers && <p className="text-sm text-red-600 mt-1">{errors.teamMembers}</p>}
            </div>

            {/* Project Color */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Project Color</label>
              <div className="flex gap-2">
                {["indigo", "emerald", "amber", "red", "violet", "cyan"].map((colorOption) => (
                  <button
                    key={colorOption}
                    type="button"
                    onClick={() => setColor(colorOption)}
                    className={`w-8 h-8 rounded-full border-2 transition-all bg-${colorOption}-500 ${
                      color === colorOption ? "border-slate-400 scale-110 ring-2 ring-slate-300" : "border-slate-200 hover:scale-105"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        <DialogFooter>
          <div className="flex gap-3 w-full">
            {step === 2 && (
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            {step === 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canProceed}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600"
              >
                Next: Team Setup
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!canProceed || isCreating}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600"
              >
                {isCreating ? "Creating..." : "Create Project"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
