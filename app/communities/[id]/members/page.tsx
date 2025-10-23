'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  ArrowLeft,
  Users,
  Search,
  Crown,
  Shield,
  Eye,
  Mail,
} from 'lucide-react'
import { formatDate } from '@/lib/format-date'

interface Member {
  id: string
  user_id: string
  user_name: string
  user_email: string
  user_avatar?: string
  role: string
  joined_at: string
}

export default function CommunityMembersPage() {
  const router = useRouter()
  const pathname = usePathname()
  const communityId = (pathname?.split('/')?.[2] as string) || ""
  const { user } = useAuth()

  const [community, setCommunity] = useState<any>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        
        // Load community
        const commRes = await fetch(`/api/communities/${communityId}`)
        const commJson = await commRes.json()
        if (commRes.ok && commJson.success) {
          setCommunity(commJson.data)
        }

        // Load members
        const membersRes = await fetch(`/api/communities/${communityId}/members`)
        const membersJson = await membersRes.json()
        if (membersRes.ok && membersJson.success) {
          setMembers(membersJson.data || [])
        }
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user && communityId) {
      load()
    }
  }, [user, communityId])

  const filteredMembers = members.filter(m =>
    m.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4" />
      case 'admin':
        return <Shield className="h-4 w-4" />
      case 'moderator':
        return <Shield className="h-4 w-4" />
      case 'viewer':
        return <Eye className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'moderator':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'viewer':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading members...</p>
        </div>
      </div>
    )
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Community Not Found</h2>
            <p className="text-slate-600 mb-4">This community may not exist or you don't have access.</p>
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
              onClick={() => router.push(`/communities/${communityId}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Community
            </Button>
          </div>
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ backgroundColor: community.color + '20' }}
            >
              {community.icon || '🏘️'}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">{community.name}</h1>
              <p className="text-slate-600 mb-2">Community Members</p>
              <Badge variant="outline" className="text-sm">
                <Users className="h-3 w-3 mr-1" />
                {members.length} {members.length === 1 ? 'Member' : 'Members'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search members by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        {filteredMembers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {searchQuery ? 'No members found' : 'No members yet'}
              </h3>
              <p className="text-slate-600">
                {searchQuery ? 'Try a different search term' : 'This community doesn\'t have any members yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarImage src={member.user_avatar} />
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold">
                        {member.user_name?.charAt(0)?.toUpperCase() || member.user_email?.charAt(0)?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-slate-900 truncate">
                          {member.user_name || 'Unknown User'}
                        </p>
                        <Badge variant="outline" className={getRoleBadgeClass(member.role)}>
                          <div className="flex items-center gap-1">
                            {getRoleIcon(member.role)}
                            <span className="text-xs capitalize">{member.role}</span>
                          </div>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{member.user_email}</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Joined {formatDate(member.joined_at, 'short')}
                      </p>
                    </div>
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
