"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ArrowLeft,
  Send,
  MessageSquare,
  Heart,
  Eye,
  Pin,
  Lock,
  Users,
  Settings,
  Search,
  Plus,
} from "lucide-react"
import { VoiceInput } from "@/components/voice-input"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/format-date"

interface Post {
  id: string
  title?: string
  content: string
  author_name: string
  author_avatar?: string
  author_initials: string
  created_at: string
  is_pinned: boolean
  views_count: number
  comments_count: number
  reactions?: any
}

export default function CommunityViewPage() {
  const router = useRouter()
  const pathname = usePathname()
  const communityId = (pathname?.split('/')?.[2] as string) || ""
  const { user } = useAuth()
  const { toast } = useToast()

  const [community, setCommunity] = useState<any>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [newPost, setNewPost] = useState("")
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/communities/${communityId}`)
        const json = await res.json()
        if (res.ok && json.success) {
          setCommunity(json.data.community)
          setPosts(json.data.posts || [])
        }
      } catch (e) {
        console.error('Failed to load community', e)
        toast({ title: 'Error', description: 'Failed to load community', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    }
    if (user && communityId) {
      load()
    }
  }, [user, communityId, toast])

  const handleCreatePost = async () => {
    if (!newPost.trim()) return

    try {
      setPosting(true)
      const res = await fetch(`/api/communities/${communityId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newPost,
          content_type: 'markdown',
          is_draft: false
        })
      })

      const json = await res.json()
      if (res.ok && json.success) {
        toast({ title: 'Success', description: 'Post created successfully' })
        setNewPost("")
        // Reload posts
        const postsRes = await fetch(`/api/communities/${communityId}/posts`)
        const postsJson = await postsRes.json()
        if (postsJson.success) {
          setPosts(postsJson.data || [])
        }
      } else {
        throw new Error(json.error)
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    } finally {
      setPosting(false)
    }
  }

  const canPost = community?.user_role && community.user_role !== 'viewer'

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading community...</p>
        </div>
      </div>
    )
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Lock className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Community Not Found</h2>
            <p className="text-slate-600 mb-4">This community may be private or doesn't exist.</p>
            <Button onClick={() => router.push('/communities')}>
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
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/communities')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ backgroundColor: community.color + '20' }}
              >
                {community.icon || '🏘️'}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-slate-900">{community.name}</h1>
                  <Badge variant="outline" className="capitalize">
                    {community.user_role || 'Guest'}
                  </Badge>
                  {community.visibility === 'private' && (
                    <Badge variant="outline" className="text-amber-700 border-amber-200">
                      <Lock className="h-3 w-3 mr-1" />
                      Private
                    </Badge>
                  )}
                </div>
                <p className="text-slate-600 mb-2">{community.description}</p>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{community.members_count || 0} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{community.posts_count || 0} posts</span>
                  </div>
                </div>
              </div>
            </div>
            {(community.user_role === 'owner' || community.user_role === 'admin') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/admin/communities/${communityId}/settings`)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Create Post */}
        {canPost && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Textarea
                  placeholder="Share something with the community..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <div className="flex items-center justify-between">
                  <VoiceInput
                    onTranscript={(text) => setNewPost(prev => prev + ' ' + text)}
                    mode="transcript"
                  />
                  <Button
                    onClick={handleCreatePost}
                    disabled={posting || !newPost.trim()}
                    className="bg-indigo-500 hover:bg-indigo-600"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Post
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Posts List */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No posts yet</h3>
                <p className="text-slate-600">
                  {canPost ? 'Be the first to share something!' : 'No posts in this community yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card
                key={post.id}
                className={`hover:shadow-md transition-shadow cursor-pointer ${
                  post.is_pinned ? 'border-indigo-200 bg-indigo-50/30' : ''
                }`}
                onClick={() => router.push(`/communities/${communityId}/post/${post.id}`)}
              >
                <CardContent className="p-6">
                  {post.is_pinned && (
                    <div className="flex items-center gap-2 text-sm text-indigo-600 mb-3">
                      <Pin className="h-4 w-4" />
                      <span className="font-medium">Pinned Post</span>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={post.author_avatar} />
                      <AvatarFallback>{post.author_initials}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-900">{post.author_name}</span>
                        <span className="text-xs text-slate-500">
                          {formatDate(post.created_at, 'short')}
                        </span>
                      </div>
                      
                      {post.title && (
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">{post.title}</h3>
                      )}
                      
                      <p className="text-slate-700 whitespace-pre-wrap line-clamp-3 mb-3">
                        {post.content}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{post.comments_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{post.views_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          <span>{Object.keys(post.reactions || {}).length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
