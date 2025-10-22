"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  AlertCircle,
  Filter,
  ChevronDown,
  BarChart3,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate, formatDateTime } from "@/lib/format-date"

interface Response {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  userInitials: string
  status: string
  submittedAt?: string
  reviewedAt?: string
  isLate: boolean
  hasCriticalFeedback: boolean
}

export default function QuestionnaireResponsesPage() {
  const router = useRouter()
  const pathname = usePathname()
  const questionnaireId = (pathname?.split('/')?.[3] as string) || ""
  const { user } = useAuth()

  const [questionnaire, setQuestionnaire] = useState<any>(null)
  const [responses, setResponses] = useState<Response[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/')
    }
  }, [user, router])

  // Load responses
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/admin/questionnaires/${questionnaireId}/responses`)
        const json = await res.json()
        if (res.ok && json.success) {
          setQuestionnaire(json.questionnaire)
          setResponses(json.responses || [])
        }
      } catch (e) {
        console.error('Failed to load responses', e)
      } finally {
        setLoading(false)
      }
    }
    if (user?.role === 'admin' && questionnaireId) {
      load()
    }
  }, [user, questionnaireId])

  // Filtered responses
  const filtered = responses.filter(r => {
    const matchesSearch = r.userName.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-700">Submitted</Badge>
      case 'approved':
        return <Badge className="bg-emerald-100 text-emerald-700">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>
      case 'returned':
        return <Badge className="bg-orange-100 text-orange-700">Returned</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin/questionnaires')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">Responses</h1>
                <p className="text-sm text-slate-600">{questionnaire?.title || 'Loading...'}</p>
              </div>
            </div>
            <Button
              onClick={() => router.push(`/admin/questionnaires/${questionnaireId}/stats`)}
              variant="outline"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View Statistics
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by user name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    {statusFilter === 'all' ? 'All Status' : statusFilter}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Status</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setStatusFilter('pending')}>Pending</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('submitted')}>Submitted</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('approved')}>Approved</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('rejected')}>Rejected</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('returned')}>Returned</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Responses List */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading responses...</div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No responses found</h3>
              <p className="text-slate-600">
                {search || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No responses submitted yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <Card
                key={r.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/admin/questionnaires/${questionnaireId}/responses/${r.userId}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={r.userAvatar} />
                        <AvatarFallback>{r.userInitials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-slate-900">{r.userName}</p>
                          {getStatusBadge(r.status)}
                          {r.isLate && (
                            <Badge variant="outline" className="text-red-600 border-red-200">
                              Late
                            </Badge>
                          )}
                          {r.hasCriticalFeedback && (
                            <Badge className="bg-red-500 text-white">
                              Critical Feedback
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          {r.submittedAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Submitted {formatDate(r.submittedAt, 'short')}
                            </span>
                          )}
                          {r.reviewedAt && (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Reviewed {formatDate(r.reviewedAt, 'short')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
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
