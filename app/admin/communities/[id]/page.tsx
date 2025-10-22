"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Users,
  FileText,
  Settings,
  Lock,
  Calendar,
  Eye,
  MessageSquare,
  TrendingUp,
} from "lucide-react"
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
  created_at: string
  creator_name?: string
  settings?: any
}

interface Post {
  id: string
  title?: string
  content: string
  author_id: string
  author_name?: string
  created_at: string
  views_count: number
  is_pinned: boolean
}

interface Member {
  id: string
  user_id: string
  user_name?: string
  user_email?: string
  role: string
  joined_at: string
}

export default function AdminCommunityDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const communityId = params.id as string

  const [community, setCommunity] = useState<Community | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/')
    }
  }, [user, router])

  // Load community details
  useEffect(() => {
    const loadCommunity = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/communities/${communityId}`)
        const json = await res.json()
        
        if (res.ok && json.success) {
          setCommunity(json.data)
        } else {
          toast({ 
            title: 'Error', 
            description: json.error || 'Failed to load community',
            variant: 'destructive' 
          })
        }
      } catch (e) {
        console.error('Failed to load community', e)
        toast({ 
          title: 'Error', 
          description: 'Failed to load community', 
          variant: 'destructive' 
        })
      } finally {
        setLoading(false)
      }
    }

    if (user?.role === 'admin' && communityId) {
      loadCommunity()
    }
  }, [user, communityId, toast])

  // Load posts
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const res = await fetch(`/api/communities/${communityId}/posts`)
        const json = await res.json()
        
        if (res.ok && json.success) {
          setPosts(json.data || [])
        }
      } catch (e) {
        console.error('Failed to load posts', e)
      }
    }

    if (user?.role === 'admin' && communityId) {
      loadPosts()
    }
  }, [user, communityId])

  // Load members
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const res = await fetch(`/api/communities/${communityId}/members`)
        const json = await res.json()
        
        if (res.ok && json.success) {
          setMembers(json.data || [])
        }
      } catch (e) {
        console.error('Failed to load members', e)
      }
    }

    if (user?.role === 'admin' && communityId) {
      loadMembers()
    }
  }, [user, communityId])

  if (user?.role !== 'admin') {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading community...</p>
        </div>
      </div>
    )
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Community not found</h3>
            <p className="text-slate-600 mb-4">
              The community you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => router.push('/admin/communities')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Communities
            </Button>
          </CardContent>
        </Card>
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
              onClick={() => router.push('/admin/communities')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                style={{ backgroundColor: community.color + '20' }}
              >
                {community.icon || '🏘️'}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{community.name}</h1>
                <p className="text-slate-600 max-w-2xl">{community.description || 'No description'}</p>
                <div className="flex items-center gap-3 mt-3">
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
                    <Lock className="h-3 w-3 mr-1" />
                    {community.visibility}
                  </Badge>
                  <span className="text-sm text-slate-500">
                    Created {new Date(community.created_at).toLocaleDateString()}
                  </span>
                  {community.creator_name && (
                    <span className="text-sm text-slate-500">
                      by {community.creator_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => router.push(`/communities/${communityId}`)}
                variant="outline"
              >
                <Eye className="h-4 w-4 mr-2" />
                View as User
              </Button>
              <Button
                onClick={() => router.push(`/admin/communities/${communityId}/settings`)}
                variant="outline"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600">Members</p>
                  <p className="text-2xl font-bold text-blue-600">{members.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600">Posts</p>
                  <p className="text-2xl font-bold text-emerald-600">{posts.length}</p>
                </div>
                <FileText className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600">Total Views</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {posts.reduce((sum, p) => sum + (p.views_count || 0), 0)}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600">Activity</p>
                  <p className="text-2xl font-bold text-orange-600">
                    <TrendingUp className="h-6 w-6" />
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="posts" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
              <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="posts" className="space-y-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Posts Management</p>
                    <p className="text-xs text-blue-600">
                      Users can create posts from the community page. As admin, you can view and moderate all posts here.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {posts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No posts yet</h3>
                  <p className="text-slate-600 mb-4">This community doesn't have any posts yet.</p>
                  <Button onClick={() => router.push(`/communities/${communityId}`)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Community as User
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          {post.title && (
                            <h3 className="font-semibold text-lg text-slate-900 mb-2">
                              {post.title}
                            </h3>
                          )}
                          <p className="text-slate-600 line-clamp-2">{post.content}</p>
                        </div>
                        {post.is_pinned && (
                          <Badge variant="outline" className="ml-4">Pinned</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>{post.author_name || 'Unknown'}</span>
                        <span>•</span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{post.views_count || 0} views</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Members Management</p>
                      <p className="text-xs text-green-600">
                        Manage community members and their roles. You can add or remove members as needed.
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => {
                      toast({
                        title: 'Add Member',
                        description: 'Member management UI coming soon. Use API directly for now.',
                      })
                    }}
                    size="sm"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </div>
              </CardContent>
            </Card>

            {members.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No members yet</h3>
                  <p className="text-slate-600 mb-4">This community doesn't have any members yet.</p>
                  <Button 
                    onClick={() => {
                      toast({
                        title: 'Add Member',
                        description: 'Use the "Add Member" button above to invite users.',
                      })
                    }}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Add First Member
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Members ({members.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {member.user_name || member.user_email || 'Unknown User'}
                          </p>
                          <p className="text-sm text-slate-500">
                            Joined {new Date(member.joined_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={
                              member.role === 'owner'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : member.role === 'admin'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-slate-50 text-slate-700'
                            }
                          >
                            {member.role}
                          </Badge>
                          {member.role !== 'owner' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                toast({
                                  title: 'Edit Member',
                                  description: 'Member editing coming soon.',
                                })
                              }}
                            >
                              Edit
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Community Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">ID:</span>
                      <span className="font-mono text-slate-900">{community.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Visibility:</span>
                      <span className="text-slate-900">{community.visibility}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Created:</span>
                      <span className="text-slate-900">
                        {new Date(community.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button
                    onClick={() => router.push(`/admin/communities/${communityId}/settings`)}
                    className="w-full"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
