"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Check } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function NewProjectPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [projectName, setProjectName] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [priority, setPriority] = useState("")
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([])
  const [projectOwner, setProjectOwner] = useState("")
  const [tags, setTags] = useState("")
  const [color, setColor] = useState("#6366f1") // Default indigo
  const [isCreating, setIsCreating] = useState(false)
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string; avatar?: string; initials?: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let abort = false
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/users')
        const json = await res.json()
        if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to fetch users')
        const list = (json.data || []) as Array<{ id: string; name: string; email: string; avatar?: string; initials?: string }>
        if (!abort) {
          setUsers(list)
          // default owner: current user if present, otherwise first user
          const defaultOwner = user?.id && list.find(u => u.id === user.id) ? user.id : (list[0]?.id || '')
          setProjectOwner(defaultOwner)
        }
      } catch (e: any) {
        if (!abort) setError(e?.message || 'Failed to load users')
      } finally {
        if (!abort) setLoading(false)
      }
    }
    load()
    return () => { abort = true }
  }, [user?.id])

  const handleTeamMemberToggle = (memberId: string) => {
    setSelectedTeamMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId],
    )
  }

  const handleSubmit = async () => {
    if (!projectName.trim() || !priority || !projectOwner || selectedTeamMembers.length === 0) {
      toast({ title: 'Missing fields', description: 'Project name, priority, owner and at least one team member are required.', variant: 'destructive' })
      return
    }
    setIsCreating(true)
    try {
      const body = {
        name: projectName.trim(),
        description,
        priority: priority.toLowerCase() as 'low' | 'medium' | 'high',
        startDate: startDate || undefined,
        dueDate: dueDate || undefined,
        ownerId: projectOwner,
        teamIds: selectedTeamMembers,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        color,
      }
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to create project')
      const created = json.data as { id: string }
      toast({ title: 'Project created', description: 'Your project has been created successfully.' })
      router.push(`/projects/${created.id}`)
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Failed to create project', variant: 'destructive' })
    } finally {
      setIsCreating(false)
    }
  }

  const canCreate = projectName.trim() && priority && selectedTeamMembers.length > 0 && projectOwner

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
            {error && (
              <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
            )}
            {loading && (
              <div className="mb-4 text-sm text-slate-500">Loading users…</div>
            )}
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
                  {users.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">Team Members *</label>
                <div className="space-y-3">
                  {users.map((member) => (
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
                          <AvatarImage src={member.avatar || "/placeholder-user.jpg"} />
                          <AvatarFallback>{member.initials || (member.name?.[0] || 'U')}</AvatarFallback>
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
