"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, ArrowLeft, Mail, Calendar, MoreVertical, Edit, UserX } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EditUserDialog } from "@/components/edit-user-dialog"

interface TeamMember {
  id: string
  name: string
  email: string
  avatar: string
  role: string
  status: string
  tasksAssigned: number
  tasksCompleted: number
  joinDate: string
  lastActive: string
}

export default function TeamManagementPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<TeamMember | null>(null)
  const [newMemberName, setNewMemberName] = useState("")
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [newMemberRole, setNewMemberRole] = useState<"admin" | "user">("user")
  const [newMemberPassword, setNewMemberPassword] = useState("")
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let abort = false
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const [usersRes, tasksRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/tasks"),
        ])
        const usersJson = await usersRes.json()
        const tasksJson = await tasksRes.json()
        if (!usersRes.ok || !usersJson?.success) throw new Error(usersJson?.error || "Failed to fetch users")
        if (!tasksRes.ok || !tasksJson?.success) throw new Error(tasksJson?.error || "Failed to fetch tasks")

        const users = (usersJson.data || []) as Array<{
          id: string; name: string; email: string; avatar?: string; initials: string; role: string; status?: 'Active' | 'Away' | 'Inactive'
        }>
        const tasks = (tasksJson.data || []) as Array<{
          id: string; status: string; createdAt: string; updatedAt?: string; completedAt?: string; assignees: Array<{ id: string }>
        }>

        const stats = new Map<string, { assigned: number; completed: number; lastActive?: string }>()
        for (const u of users) {
          stats.set(u.id, { assigned: 0, completed: 0, lastActive: undefined })
        }
        for (const t of tasks) {
          const ts = (t.updatedAt || t.completedAt || t.createdAt)
          for (const a of t.assignees || []) {
            const cur = stats.get(a.id) || { assigned: 0, completed: 0, lastActive: undefined }
            cur.assigned += 1
            if (t.status === "done") cur.completed += 1
            if (!cur.lastActive || (ts && ts > cur.lastActive)) cur.lastActive = ts
            stats.set(a.id, cur)
          }
        }

        const mapped: TeamMember[] = users.map((u) => {
          const s = stats.get(u.id) || { assigned: 0, completed: 0, lastActive: undefined }
          return {
            id: u.id,
            name: u.name,
            email: u.email,
            avatar: u.avatar || "",
            role: u.role === "admin" ? "Admin" : "User",
            status: u.status ?? (s.assigned > 0 ? "Active" : "Inactive"),
            tasksAssigned: s.assigned,
            tasksCompleted: s.completed,
            joinDate: "-",
            lastActive: s.lastActive ? s.lastActive.split("T")[0] : "-",
          }
        })
        if (!abort) setTeamMembers(mapped)
      } catch (e: any) {
        if (!abort) setError(e?.message || "Failed to load team data")
      } finally {
        if (!abort) setLoading(false)
      }
    }
    load()
    return () => { abort = true }
  }, [])

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (user?.role !== "admin") {
      alert("Only administrators can delete users.")
      return
    }

    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone and will remove all their data.`)) {
      return
    }

    try {
      const res = await fetch(`/api/users/${encodeURIComponent(userId)}`, { method: "DELETE" })
      const json = await res.json()
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || "Failed to delete user")
      }
      setTeamMembers((prev) => prev.filter((member) => member.id !== userId))
      alert(`User "${userName}" has been deleted`)
    } catch (e: any) {
      alert(e?.message || "Failed to delete user")
    }
  }

  const handleEditUser = (userId: string) => {
    const userToEdit = teamMembers.find((member) => member.id === userId)
    if (userToEdit) {
      setSelectedUser(userToEdit)
      setShowEditUserModal(true)
    }
  }

  const handleUserUpdated = (updatedUser: TeamMember) => {
    setTeamMembers((prev) => prev.map((member) => (member.id === updatedUser.id ? updatedUser : member)))
    console.log("[v0] User updated:", updatedUser)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700 border-green-200"
      case "Away":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "Inactive":
        return "bg-gray-100 text-gray-700 border-gray-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  if (user?.role !== "admin") {
    return <div>Access denied</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}
        {loading && (
          <div className="mb-6 text-sm text-gray-500">Loading team…</div>
        )}
          <Button className="bg-indigo-500 hover:bg-indigo-600" onClick={() => setShowAddMemberModal(true)}>
            <Users className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
                <p className="text-gray-600 text-sm">Total Members</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {teamMembers.filter((m) => m.status === "Active").length}
                </p>
                <p className="text-gray-600 text-sm">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {teamMembers.reduce((sum, member) => sum + member.tasksAssigned, 0)}
                </p>
                <p className="text-gray-600 text-sm">Active Tasks</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-mint-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-mint-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {teamMembers.reduce((sum, member) => sum + member.tasksCompleted, 0)}
                </p>
                <p className="text-gray-600 text-sm">Completed Tasks</p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {teamMembers.map((member) => (
              <div key={member.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={member.avatar || "/placeholder-user.jpg"}
                      alt={member.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                        <Badge className={getStatusColor(member.status)}>{member.status}</Badge>
                      </div>
                      <p className="text-gray-600 text-sm">{member.role}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{member.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">{member.tasksAssigned}</p>
                      <p className="text-xs text-gray-500">Active Tasks</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">{member.tasksCompleted}</p>
                      <p className="text-xs text-gray-500">Completed</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{member.lastActive}</span>
                      </div>
                      <p className="text-xs text-gray-500">Last Active</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleEditUser(member.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteUser(member.id, member.name)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New Team Member</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <Input
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Enter member name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <Select value={newMemberRole} onValueChange={(value: "admin" | "user") => setNewMemberRole(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password (optional)</label>
                <Input
                  type="password"
                  value={newMemberPassword}
                  onChange={(e) => setNewMemberPassword(e.target.value)}
                  placeholder="Set initial password (min 8 characters)"
                />
                <p className="text-xs text-gray-500 mt-1">If left blank, the user will not have a password set.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddMemberModal(false)
                  setNewMemberName("")
                  setNewMemberEmail("")
                  setNewMemberRole("user")
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const body: any = {
                      name: newMemberName.trim(),
                      email: newMemberEmail.trim(),
                    }
                    body.role = newMemberRole
                    const pwd = newMemberPassword.trim()
                    if (pwd) {
                      if (pwd.length < 8) {
                        alert('Password must be at least 8 characters')
                        return
                      }
                      body.password = pwd
                    }
                    const res = await fetch('/api/users', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(body),
                    })
                    const json = await res.json()
                    if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed to create user')
                    const u = json.data as { id: string; name: string; email: string; avatar?: string; role: 'admin' | 'user' }
                    const newMember: TeamMember = {
                      id: u.id,
                      name: u.name,
                      email: u.email,
                      avatar: u.avatar || '',
                      role: u.role === 'admin' ? 'Admin' : 'User',
                      status: 'Inactive',
                      tasksAssigned: 0,
                      tasksCompleted: 0,
                      joinDate: '-',
                      lastActive: '-',
                    }
                    setTeamMembers((prev) => [newMember, ...prev])
                    setShowAddMemberModal(false)
                    setNewMemberName("")
                    setNewMemberEmail("")
                    setNewMemberRole("user")
                    setNewMemberPassword("")
                  } catch (e: any) {
                    alert(e?.message || 'Failed to add member')
                  }
                }}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600"
              >
                Add Member
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Dialog */}
      <EditUserDialog
        user={selectedUser}
        open={showEditUserModal}
        onOpenChange={setShowEditUserModal}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  )
}
