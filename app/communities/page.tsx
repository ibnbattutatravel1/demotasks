"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Search,
  Users,
  FileText,
  Lock,
  Globe,
  ArrowLeft,
  Eye,
  MessageSquare,
  TrendingUp,
} from "lucide-react"

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
  user_joined_at?: string
}

export default function CommunitiesPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/communities')
        const json = await res.json()
        if (res.ok && json.success) {
          setCommunities(json.data || [])
        }
      } catch (e) {
        console.error('Failed to load communities', e)
      } finally {
        setLoading(false)
      }
    }
    if (user) {
      load()
    }
  }, [user])

  const filtered = communities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  )

  const myCommunities = filtered.filter(c => c.user_role)
  const publicCommunities = filtered.filter(c => !c.user_role && c.visibility === 'public')

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Communities</h1>
            <p className="text-slate-600">Collaborate, share knowledge, and stay connected</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600">Your Communities</p>
                  <p className="text-2xl font-bold text-indigo-600">{myCommunities.length}</p>
                </div>
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600">Total Posts</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {myCommunities.reduce((sum, c) => sum + (c.posts_count || 0), 0)}
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
                  <p className="text-xs text-slate-600">Active Members</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {myCommunities.reduce((sum, c) => sum + (c.members_count || 0), 0)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
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

        {/* My Communities */}
        {myCommunities.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">My Communities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myCommunities.map((community) => (
                <Card
                  key={community.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/communities/${community.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: community.color + '20' }}
                      >
                        {community.icon || '🏘️'}
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {community.user_role}
                      </Badge>
                    </div>

                    <h3 className="font-semibold text-lg text-slate-900 mb-2">{community.name}</h3>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {community.description || 'No description'}
                    </p>

                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{community.members_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{community.posts_count || 0}</span>
                        </div>
                      </div>
                      {community.visibility === 'private' && (
                        <Lock className="h-4 w-4 text-amber-500" />
                      )}
                      {community.visibility === 'public' && (
                        <Globe className="h-4 w-4 text-emerald-500" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Public Communities */}
        {publicCommunities.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Discover Communities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {publicCommunities.map((community) => (
                <Card
                  key={community.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/communities/${community.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: community.color + '20' }}
                      >
                        {community.icon || '🏘️'}
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        <Globe className="h-3 w-3 mr-1" />
                        Public
                      </Badge>
                    </div>

                    <h3 className="font-semibold text-lg text-slate-900 mb-2">{community.name}</h3>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {community.description || 'No description'}
                    </p>

                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{community.members_count || 0} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{community.posts_count || 0} posts</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No communities found</h3>
              <p className="text-slate-600">
                {search ? 'Try adjusting your search' : 'You are not a member of any communities yet'}
              </p>
            </CardContent>
          </Card>
        )}

        {loading && (
          <div className="text-center py-12 text-slate-500">Loading communities...</div>
        )}
      </div>
    </div>
  )
}
