'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatDate } from '@/lib/format-date'
import { CommunityMembersManager } from '@/components/community-members-manager'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { 
  Settings, 
  Save, 
  Trash2, 
  Archive, 
  AlertTriangle,
  Lock,
  Globe,
  Users,
  ChevronLeft
} from 'lucide-react'

interface Community {
  id: string
  name: string
  description: string
  icon: string
  color: string
  visibility: 'public' | 'private' | 'hidden'
  is_archived: boolean
  settings: any
}

export default function CommunitySettingsPage() {
  const router = useRouter()
  const params = useParams()
  const communityId = params.id as string
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [community, setCommunity] = useState<Community | null>(null)
  const [members, setMembers] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    color: '#6366f1',
    visibility: 'public' as 'public' | 'private' | 'hidden',
    allow_comments: true,
    allow_reactions: true,
    require_approval: false,
  })

  const fetchCommunity = async () => {
    try {
      const res = await fetch(`/api/communities/${communityId}`)
      const data = await res.json()
      
      if (data.success) {
        const comm = data.data.community
        setCommunity(comm)
        const settings = typeof comm.settings === 'string' ? JSON.parse(comm.settings) : comm.settings
        setFormData({
          name: comm.name || '',
          description: comm.description || '',
          icon: comm.icon || '🏘️',
          color: comm.color || '#6366f1',
          visibility: comm.visibility || 'public',
          allow_comments: settings?.allow_comments ?? true,
          allow_reactions: settings?.allow_reactions ?? true,
          require_approval: settings?.require_approval ?? false,
        })
      }
    } catch (error) {
      console.error('Error fetching community:', error)
      toast({
        title: 'Error',
        description: 'Failed to load community settings',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/communities/${communityId}/members`)
      const data = await res.json()
      if (data.success) {
        setMembers(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  useEffect(() => {
    fetchCommunity()
    fetchMembers()
  }, [communityId])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/communities/${communityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
          color: formData.color,
          visibility: formData.visibility,
          settings: {
            allow_comments: formData.allow_comments,
            allow_reactions: formData.allow_reactions,
            require_approval: formData.require_approval,
          }
        }),
      })

      const data = await res.json()
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Community settings updated successfully',
        })
        fetchCommunity()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update settings',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleArchive = async () => {
    if (!confirm('Are you sure you want to archive this community? It will be hidden from all users.')) {
      return
    }

    try {
      const res = await fetch(`/api/communities/${communityId}`, {
        method: 'DELETE',
      })

      const data = await res.json()
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Community archived successfully',
        })
        router.push('/admin/communities')
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to archive community',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!community) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-slate-900 font-medium mb-2">Community not found</p>
          <Button onClick={() => router.push('/admin/communities')}>
            Back to Communities
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/admin/communities/${communityId}`)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Community Settings</h1>
              <p className="text-slate-600">Manage your community configuration and preferences</p>
            </div>
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: formData.color + '20' }}
            >
              {formData.icon}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Update your community's basic details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Community Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter community name"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your community"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="icon">Icon (Emoji)</Label>
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      placeholder="🏘️"
                      maxLength={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select
                    value={formData.visibility}
                    onValueChange={(value: any) => setFormData({ ...formData, visibility: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Public - Anyone can join
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Private - Invite only
                        </div>
                      </SelectItem>
                      <SelectItem value="hidden">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Hidden - Members only
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Permissions */}
            <Card>
              <CardHeader>
                <CardTitle>Permissions & Features</CardTitle>
                <CardDescription>Control what members can do in your community</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allow_comments">Allow Comments</Label>
                    <p className="text-sm text-slate-600">Members can comment on posts</p>
                  </div>
                  <Switch
                    id="allow_comments"
                    checked={formData.allow_comments}
                    onCheckedChange={(checked) => setFormData({ ...formData, allow_comments: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allow_reactions">Allow Reactions</Label>
                    <p className="text-sm text-slate-600">Members can react to posts</p>
                  </div>
                  <Switch
                    id="allow_reactions"
                    checked={formData.allow_reactions}
                    onCheckedChange={(checked) => setFormData({ ...formData, allow_reactions: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="require_approval">Require Post Approval</Label>
                    <p className="text-sm text-slate-600">Moderators must approve posts</p>
                  </div>
                  <Switch
                    id="require_approval"
                    checked={formData.require_approval}
                    onCheckedChange={(checked) => setFormData({ ...formData, require_approval: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Card>
              <CardContent className="pt-6">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full"
                  size="lg"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>

            {/* Members Management */}
            <Card>
              <CardHeader>
                <CardTitle>Members Management</CardTitle>
                <CardDescription>Add or remove members from this community</CardDescription>
              </CardHeader>
              <CardContent>
                <CommunityMembersManager
                  communityId={communityId}
                  members={members}
                  onMembersUpdate={fetchMembers}
                  currentUserRole="owner"
                />
              </CardContent>
            </Card>
          </div>

          {/* Danger Zone */}
          <div className="space-y-6">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-900">Danger Zone</CardTitle>
                <CardDescription className="text-red-700">
                  Irreversible actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                    <Archive className="h-4 w-4" />
                    Archive Community
                  </h3>
                  <p className="text-sm text-red-700 mb-3">
                    This will hide the community from all users. You can restore it later.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={handleArchive}
                    className="w-full"
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive Community
                  </Button>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Community
                  </h3>
                  <p className="text-sm text-red-700 mb-3">
                    Permanently delete this community and all its data. This action cannot be undone.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      toast({
                        title: 'Not Implemented',
                        description: 'Permanent deletion requires additional confirmation',
                      })
                    }}
                    className="w-full"
                    disabled
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Permanently
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Status:</span>
                  <Badge variant={community.is_archived ? 'secondary' : 'default'}>
                    {community.is_archived ? 'Archived' : 'Active'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Visibility:</span>
                  <Badge variant="outline">{formData.visibility}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">ID:</span>
                  <code className="text-xs bg-slate-100 px-2 py-1 rounded">{communityId}</code>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
