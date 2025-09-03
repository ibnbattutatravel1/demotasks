"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Check } from "lucide-react"

// Mock team members - in real app this would come from API
const mockTeamMembers = [
  { id: "1", name: "Alice Johnson", email: "alice@company.com", initials: "AJ" },
  { id: "2", name: "Bob Smith", email: "bob@company.com", initials: "BS" },
  { id: "3", name: "Charlie Brown", email: "charlie@company.com", initials: "CB" },
  { id: "4", name: "Diana Prince", email: "diana@company.com", initials: "DP" },
  { id: "5", name: "Eve Wilson", email: "eve@company.com", initials: "EW" },
]

export default function NewProjectPage() {
  const router = useRouter()

  const [projectName, setProjectName] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [priority, setPriority] = useState("")
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([])
  const [projectOwner, setProjectOwner] = useState("1") // Default to first user
  const [tags, setTags] = useState("")
  const [color, setColor] = useState("#6366f1") // Default indigo
  const [isCreating, setIsCreating] = useState(false)

  const handleTeamMemberToggle = (memberId: string) => {
    setSelectedTeamMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId],
    )
  }

  const handleSubmit = async () => {
    setIsCreating(true)

    const newProjectId = Date.now().toString()
    const selectedMembers = mockTeamMembers.filter((member) => selectedTeamMembers.includes(member.id))
    const owner = mockTeamMembers.find((member) => member.id === projectOwner)

    const newProject = {
      id: newProjectId,
      name: projectName,
      description: description,
      status: "planning",
      priority: priority.toLowerCase(),
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      startDate: startDate,
      dueDate: dueDate,
      progress: 0,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),

      // Team information
      ownerId: projectOwner,
      owner: owner,
      assignees: selectedMembers.map((member) => member.name),
      team: selectedMembers,

      // Project settings
      color: color,
      actualHours: 0,

      // Task tracking
      tasks: [],
      tasksCompleted: 0,
      totalTasks: 0,
    }

    console.log("[v0] Creating project:", newProject)

    // Save to localStorage
    const existingProjects = JSON.parse(localStorage.getItem("projects") || "[]")
    existingProjects.push(newProject)
    localStorage.setItem("projects", JSON.stringify(existingProjects))

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsCreating(false)
    router.push(`/projects/${newProjectId}`)
  }

  const canCreate = projectName.trim() && priority && selectedTeamMembers.length > 0

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Create New Project</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Project Name *</label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                  className="text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your project goals and objectives"
                  rows={3}
                  className="text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Due Date</label>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Priority *</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* Team Assignment */}
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">Team Members *</label>
                <div className="space-y-3">
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
                <p className="text-sm text-slate-600 mt-2">
                  Selected: {selectedTeamMembers.length} team member{selectedTeamMembers.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Project Settings */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tags (Optional)</label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Enter tags separated by commas (e.g., Design, Frontend, UX)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Project Color</label>
                <div className="flex gap-2">
                  {["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"].map((colorOption) => (
                    <button
                      key={colorOption}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        color === colorOption ? "border-slate-400" : "border-slate-200"
                      }`}
                      style={{ backgroundColor: colorOption }}
                      onClick={() => setColor(colorOption)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-200 mt-6">
              <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1 bg-transparent">
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!canCreate || isCreating}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600"
              >
                {isCreating ? "Creating Project..." : "Create Project"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
