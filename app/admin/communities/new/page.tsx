"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Save,
  Users,
  Globe,
  Lock,
  X,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const ICONS = ['🏘️', '💻', '🎨', '📊', '💡', '🚀', '🎯', '⚡', '🔧', '📚', '🎓', '💼', '🏢', '🌟', '🔬', '🎭']
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6', '#f97316', '#84cc16']

export default function CreateCommunityPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState('🏘️')
  const [color, setColor] = useState('#6366f1')
  const [visibility, setVisibility] = useState<'public' | 'private'>('private')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [creating, setCreating] = useState(false)

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/')
    }
  }, [user, router])

  // Load users for member selection
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch('/api/users')
        const json = await res.json()
        if (res.ok && json.success) {
          setUsers(json.data || [])
        }
      } catch (e) {
        console.error('Failed to load users', e)
      }
    }
    if (user?.role === 'admin') {
      loadUsers()
    }
  }, [user])

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({ title: 'Error', description: 'Community name is required', variant: 'destructive' })
      return
    }

    try {
      setCreating(true)
      const res = await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          icon,
          color,
          visibility,
          memberIds: selectedMembers,
          settings: {
            allow_comments: true,
            allow_reactions: true,
            require_approval: false
          }
        })
      })

      const json = await res.json()
      if (res.ok && json.success) {
        toast({ title: 'Success', description: 'Community created successfully' })
        router.push('/admin/communities')
      } else {
        throw new Error(json.error)
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    } finally {
      setCreating(false)
    }
  }

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  if (user?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/communities')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Community</h1>
            <p className="text-slate-600">Set up a new knowledge sharing space</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Community Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Engineering Team"
                  maxLength={200}
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share technical knowledge, code snippets, and collaborate..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Icon</Label>
                  <div className="grid grid-cols-8 gap-2 mt-2">
                    {ICONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setIcon(emoji)}
                        className={`text-2xl p-2 rounded-lg border-2 transition-all ${
                          icon === emoji
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Color</Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {COLORS.map((clr) => (
                      <button
                        key={clr}
                        onClick={() => setColor(clr)}
                        className={`w-full h-10 rounded-lg border-2 transition-all ${
                          color === clr
                            ? 'border-slate-900 scale-110'
                            : 'border-slate-200'
                        }`}
                        style={{ backgroundColor: clr }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visibility */}
          <Card>
            <CardHeader>
              <CardTitle>Visibility & Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Who can see this community?</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    onClick={() => setVisibility('public')}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      visibility === 'public'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Globe className="h-5 w-5 text-emerald-600 mb-2" />
                    <div className="font-medium text-slate-900">Public</div>
                    <div className="text-xs text-slate-600">Any user can share and write</div>
                  </button>

                  <button
                    onClick={() => setVisibility('private')}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      visibility === 'private'
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Lock className="h-5 w-5 text-amber-600 mb-2" />
                    <div className="font-medium text-slate-900">Private</div>
                    <div className="text-xs text-slate-600">Only chosen members can participate</div>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Initial Members</span>
                <Badge variant="outline">{selectedMembers.length} selected</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {users.filter(u => u.role === 'user').map((usr) => (
                  <div
                    key={usr.id}
                    onClick={() => toggleMember(usr.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedMembers.includes(usr.id)
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium text-sm">
                        {usr.initials}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{usr.name}</div>
                        <div className="text-xs text-slate-500">{usr.email}</div>
                      </div>
                    </div>
                    {selectedMembers.includes(usr.id) && (
                      <Badge className="bg-indigo-500">Member</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/communities')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !name.trim()}
              className="bg-indigo-500 hover:bg-indigo-600"
            >
              <Save className="h-4 w-4 mr-2" />
              Create Community
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
