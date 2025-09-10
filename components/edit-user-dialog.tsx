"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Edit, Mail, User, Shield, Calendar } from "lucide-react"

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

interface EditUserDialogProps {
  user: TeamMember | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserUpdated: (updatedUser: TeamMember) => void
}

export function EditUserDialog({ user, open, onOpenChange, onUserUpdated }: EditUserDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "",
    status: user?.status || "Active",
    avatar: user?.avatar || "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
      })
    }
  }, [user])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    if (!formData.role.trim()) {
      newErrors.role = "Role is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleSubmit = async () => {
    if (!validateForm() || !user) return

    setIsUpdating(true)

    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        avatar: formData.avatar,
        status: formData.status as 'Active' | 'Away' | 'Inactive',
      }
      const roleLower = (formData.role || '').toLowerCase()
      if (roleLower === 'admin' || roleLower === 'user') payload.role = roleLower

      const res = await fetch(`/api/users/${encodeURIComponent(user.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'Failed to update user')
      }

      const saved = json.data as { id: string; name: string; email: string; avatar?: string; role: 'admin' | 'user'; status?: 'Active' | 'Away' | 'Inactive' }
      const updatedUser: TeamMember = {
        ...user,
        name: saved.name,
        email: saved.email,
        role: saved.role === 'admin' ? 'Admin' : 'User',
        status: saved.status ?? formData.status,
        avatar: saved.avatar || '',
      }

      onUserUpdated(updatedUser)
      onOpenChange(false)
    } catch (error: any) {
      console.error("Update user error:", error)
      setErrors({ submit: error?.message || "Failed to update user. Please try again." })
    } finally {
      setIsUpdating(false)
    }
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

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Edit className="h-4 w-4 text-indigo-600" />
            </div>
            Edit User
          </DialogTitle>
          <DialogDescription>
            Update user information and settings. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Avatar and Current Info */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={formData.avatar || user.avatar} />
              <AvatarFallback>{formData.name.charAt(0) || user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-900">{user.name}</h3>
                <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Joined {user.joinDate}</span>
                </div>
                <div>
                  <span>{user.tasksCompleted} tasks completed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                Full Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter full name"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Mail className="h-4 w-4 inline mr-1" />
                Email Address *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter email address"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Shield className="h-4 w-4 inline mr-1" />
                Account Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Active">Active</option>
                <option value="Away">Away</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Avatar URL (Optional)</label>
              <Input
                value={formData.avatar}
                onChange={(e) => handleInputChange("avatar", e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
              <p className="text-xs text-slate-500 mt-1">
                Enter a URL for the user's profile picture or leave blank to use initials.
              </p>
            </div>
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex gap-3 w-full">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isUpdating}
              className="flex-1 bg-indigo-500 hover:bg-indigo-600"
            >
              {isUpdating ? "Updating..." : "Update User"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
