'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Heart, ThumbsUp, Smile } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PostReactionsProps {
  communityId: string
  postId: string
  className?: string
}

export function PostReactions({ communityId, postId, className }: PostReactionsProps) {
  const { toast } = useToast()
  const [reactions, setReactions] = useState<any[]>([])
  const [userReactions, setUserReactions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadReactions()
  }, [postId])

  const loadReactions = async () => {
    try {
      const res = await fetch(`/api/communities/${communityId}/posts/${postId}/reactions`)
      const json = await res.json()
      if (json.success) {
        setReactions(json.data.reactions || [])
        setUserReactions(json.data.userReactions || [])
      }
    } catch (error) {
      console.error('Failed to load reactions:', error)
    }
  }

  const handleReaction = async (reactionType: string) => {
    if (loading) return
    
    setLoading(true)
    try {
      const res = await fetch(`/api/communities/${communityId}/posts/${postId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction_type: reactionType }),
      })

      const json = await res.json()
      if (json.success) {
        loadReactions()
      } else {
        throw new Error(json.error)
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to react',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getReactionIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <ThumbsUp className="h-4 w-4" />
      case 'love':
        return <Heart className="h-4 w-4" />
      case 'celebrate':
        return <Smile className="h-4 w-4" />
      default:
        return <ThumbsUp className="h-4 w-4" />
    }
  }

  const getReactionCount = (type: string) => {
    const reaction = reactions.find(r => r.reaction_type === type)
    return reaction?.count || 0
  }

  const isReacted = (type: string) => {
    return userReactions.includes(type)
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleReaction('like')}
        className={cn(
          'gap-1',
          isReacted('like') && 'text-blue-600 bg-blue-50'
        )}
        disabled={loading}
      >
        {getReactionIcon('like')}
        {getReactionCount('like') > 0 && (
          <span className="text-xs">{getReactionCount('like')}</span>
        )}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleReaction('love')}
        className={cn(
          'gap-1',
          isReacted('love') && 'text-red-600 bg-red-50'
        )}
        disabled={loading}
      >
        {getReactionIcon('love')}
        {getReactionCount('love') > 0 && (
          <span className="text-xs">{getReactionCount('love')}</span>
        )}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleReaction('celebrate')}
        className={cn(
          'gap-1',
          isReacted('celebrate') && 'text-yellow-600 bg-yellow-50'
        )}
        disabled={loading}
      >
        {getReactionIcon('celebrate')}
        {getReactionCount('celebrate') > 0 && (
          <span className="text-xs">{getReactionCount('celebrate')}</span>
        )}
      </Button>
    </div>
  )
}
