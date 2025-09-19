"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Camera, Save, Mail, User, Shield } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: user?.name || "",
    avatar: user?.avatar || "",
  })

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, avatarUrl: formData.avatar || undefined }),
      })
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to update profile")

      toast({ title: "Profile Updated", description: "Your profile has been updated." })
      // Refresh auth context
      window.location.reload()
    } catch (e: any) {
      toast({ title: "Update failed", description: e?.message || "Could not update profile", variant: "destructive" })
    } finally {
      setIsSaving(false)
      setIsEditing(false)
    }
  }

  const handleCameraClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setIsSaving(true)
      const fd = new FormData()
      fd.append("avatarFile", file)
      fd.append("name", formData.name)
      const res = await fetch("/api/profile", { method: "PUT", body: fd })
      const json = await res.json()
      if (!res.ok || !json?.success) throw new Error(json?.error || "Failed to upload avatar")
      setFormData((prev) => ({ ...prev, avatar: json.data?.avatar || prev.avatar }))
      toast({ title: "Avatar updated", description: "Your profile picture has been changed." })
      window.location.reload()
    } catch (e: any) {
      toast({ title: "Upload failed", description: e?.message || "Could not upload avatar", variant: "destructive" })
    } finally {
      setIsSaving(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      avatar: user?.avatar || "",
    })
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600" />
            <span className="text-xl font-semibold text-slate-900">Profile Settings</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Personal Information</span>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={isEditing ? formData.avatar : user?.avatar} />
                  <AvatarFallback className="text-lg">
                    {(isEditing ? formData.name : user?.name)?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-white"
                    onClick={handleCameraClick}
                    disabled={isSaving}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {/* Hidden file input for avatar upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFileSelected}
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">{isEditing ? formData.name : user?.name}</h3>
                <p className="text-sm text-slate-600">{user?.email}</p>
                <Badge variant="outline" className="mt-1 capitalize">
                  <Shield className="h-3 w-3 mr-1" />
                  {user?.role} Account
                </Badge>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={isEditing ? formData.name : user?.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-slate-50" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input id="email" value={user?.email || ""} disabled className="pl-10 bg-slate-50 text-slate-500" />
                </div>
                <p className="text-xs text-slate-500">
                  Email address cannot be changed. Contact support if you need to update your email.
                </p>
              </div>

              {isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="avatar"
                      value={formData.avatar}
                      onChange={(e) => handleInputChange("avatar", e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                    />
                    <Button type="button" variant="outline" onClick={handleSave} disabled={isSaving}>
                      Upload
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Paste an image URL and click Upload, or use the camera button to upload a file.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Account Type</Label>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-md">
                  <Shield className="h-4 w-4 text-slate-600" />
                  <span className="text-sm text-slate-700 capitalize">{user?.role} Account</span>
                  <Badge variant="secondary" className="ml-auto">
                    {user?.role === "admin" ? "Full Access" : "Standard Access"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">Account type is managed by your administrator.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <h4 className="font-medium text-red-900">Delete Account</h4>
                  <p className="text-sm text-red-700">Permanently delete your account and all associated data.</p>
                </div>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
