"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Plus,
  Search,
  Users,
  FileText,
  Lock,
  MoreVertical,
  ArrowLeft,
  Eye,
  Settings,
  Archive,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

interface Community {
  id: string
  name: string
  description: string
  icon: string
  color: string
  visibility: string
  members_count: number
  posts_count: number
  user_role?: string
  created_at: string
  creator_name?: string
}

export default function AdminCommunitiesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/')
    }
  }, [user, router])

  // Load communities
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/communities')
        const json = await res.json()
        
        console.log('🔍 Communities API Response:', {
          status: res.status,
          ok: res.ok,
          success: json.success,
          dataType: typeof json.data,
          dataIsArray: Array.isArray(json.data),
          dataLength: json.data?.length || 0,
          firstItem: json.data?.[0] || null
        })
        
        if (res.ok && json.success) {
          setCommunities(json.data || [])
        } else {
          console.error('❌ API Error:', json.error)
        }
      } catch (e) {
        console.error('Failed to load communities', e)
        toast({ title: 'Error', description: 'Failed to load communities', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    }
    if (user?.role === 'admin') {
      load()
    }
  }, [user, toast])

  // Filter
  const filtered = communities.filter(c => {
    if (!c || !c.name) return false
    const searchLower = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(searchLower) ||
      (c.description && c.description.toLowerCase().includes(searchLower))
    )
  })

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    try {
      const res = await fetch(`/api/communities/${id}`, { method: 'DELETE' })
      const json = await res.json()
      
      if (res.ok && json.success) {
        setCommunities(prev => prev.filter(c => c.id !== id))
        toast({ title: 'Success', description: 'Community deleted' })
      } else {
        throw new Error(json.error)
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    }
  }

  if (user?.role !== 'admin') {
    return null
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
              onClick={() => router.push('/admin')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Communities</h1>
              <p className="text-slate-600">Manage internal knowledge bases and collaboration spaces</p>
            </div>
            <Button
              onClick={() => router.push('/admin/communities/new')}
              className="bg-indigo-500 hover:bg-indigo-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Community
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600">Total Communities</p>
                  <p className="text-2xl font-bold text-indigo-600">{communities.length}</p>
                </div>
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600">Total Members</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {communities.reduce((sum, c) => sum + (c.members_count || 0), 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600">Total Posts</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {communities.reduce((sum, c) => sum + (c.posts_count || 0), 0)}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600">Private Communities</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {communities.filter(c => c.visibility === 'private').length}
                  </p>
                </div>
                <Lock className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search communities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Communities Grid */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No communities found</h3>
              <p className="text-slate-600 mb-4">
                {search ? 'Try adjusting your search' : 'Create your first community to get started'}
              </p>
              {!search && (
                <Button onClick={() => router.push('/admin/communities/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Community
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((community) => (
              <Card
                key={community.id}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => router.push(`/admin/communities/${community.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: community.color + '20' }}
                    >
                      {community.icon || '🏘️'}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/admin/communities/${community.id}`)
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/admin/communities/${community.id}/settings`)
                        }}>
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(community.id, community.name)
                          }}
                          className="text-red-600"
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <h3 className="font-semibold text-lg text-slate-900 mb-2">{community.name}</h3>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {community.description || 'No description'}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3 text-slate-500">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{community.members_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{community.posts_count || 0}</span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        community.visibility === 'public'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : community.visibility === 'private'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-50 text-slate-700'
                      }
                    >
                      {community.visibility}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
