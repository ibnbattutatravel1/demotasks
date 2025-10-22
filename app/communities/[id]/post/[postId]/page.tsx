"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ArrowLeft,
  Send,
  Heart,
  MessageSquare,
  Eye,
  Pin,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDate, formatDateTime } from "@/lib/format-date"

interface Comment {
  id: string
  content: string
  author_name: string
  author_avatar?: string
  author_initials: string
  created_at: string
  parent_comment_id?: string
}

export default function PostViewPage() {
  const router = useRouter()
  const pathname = usePathname()
  const parts = pathname?.split('/') || []
  const communityId = parts[2] || ""
  const postId = parts[4] || ""
  const { user } = useAuth()
  const { toast } = useToast()

  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        
        // Get post
        const postRes = await fetch(`/api/communities/${communityId}/posts/${postId}`)
        const postJson = await postRes.json()
        if (postRes.ok && postJson.success) {
          setPost(postJson.data)
        }

        // Get comments
        const commentsRes = await fetch(`/api/communities/${communityId}/posts/${postId}/comments`)
        const commentsJson = await commentsRes.json()
        if (commentsRes.ok && commentsJson.success) {
          setComments(commentsJson.data || [])
        }
      } catch (e) {
        console.error('Failed to load post', e)
      } finally {
        setLoading(false)
      }
    }
    if (user && communityId && postId) {
      load()
    }
  }, [user, communityId, postId])

  const handleComment = async () => {
    if (!newComment.trim()) return

    try {
      setPosting(true)
      const res = await fetch(`/api/communities/${communityId}/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment
        })
      })

      const json = await res.json()
      if (res.ok && json.success) {
        toast({ title: 'Success', description: 'Comment added' })
        setNewComment("")
        
        // Reload comments
        const commentsRes = await fetch(`/api/communities/${communityId}/posts/${postId}/comments`)
        const commentsJson = await commentsRes.json()
        if (commentsJson.success) {
          setComments(commentsJson.data || [])
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading post...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Post Not Found</h2>
            <Button onClick={() => router.push(`/communities/${communityId}`)}>
              Back to Community
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
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/communities/${communityId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Community
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Post */}
        <Card className={post.is_pinned ? 'border-indigo-200 bg-indigo-50/30 mb-6' : 'mb-6'}>
          <CardContent className="p-6">
            {post.is_pinned && (
              <div className="flex items-center gap-2 text-sm text-indigo-600 mb-4">
                <Pin className="h-4 w-4" />
                <span className="font-medium">Pinned Post</span>
              </div>
            )}
            
            <div className="flex items-start gap-3 mb-4">
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarImage src={post.author_avatar} />
                <AvatarFallback>{post.author_initials}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-slate-900">{post.author_name}</span>
                  <span className="text-sm text-slate-500">
                    {formatDateTime(post.created_at)}
                  </span>
                </div>
                
                {post.title && (
                  <h1 className="text-2xl font-bold text-slate-900 mb-3">{post.title}</h1>
                )}
                
                <p className="text-slate-700 whitespace-pre-wrap mb-4">
                  {post.content}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{post.views_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{comments.length}</span>
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

        {/* Add Comment */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="space-y-3">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleComment}
                  disabled={posting || !newComment.trim()}
                  size="sm"
                  className="bg-indigo-500 hover:bg-indigo-600"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Comment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Comments ({comments.length})
          </h2>
          
          {comments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600">No comments yet. Be the first to comment!</p>
              </CardContent>
            </Card>
          ) : (
            comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={comment.author_avatar} />
                      <AvatarFallback>{comment.author_initials}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-900">{comment.author_name}</span>
                        <span className="text-xs text-slate-500">
                          {formatDate(comment.created_at, 'short')}
                        </span>
                      </div>
                      <p className="text-slate-700 whitespace-pre-wrap">{comment.content}</p>
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
