"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Search,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Filter,
  ChevronDown,
  AlertTriangle,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate, formatDateTime } from "@/lib/format-date"

interface UserQuestionnaire {
  id: string
  title: string
  description?: string
  instructions?: string
  deadline: string
  isMandatory: boolean
  status: string // 'pending' | 'submitted' | 'approved' | 'rejected' | 'returned'
  submittedAt?: string
  reviewedAt?: string
  adminNotes?: string
  isLate: boolean
  hasUnreadFeedback: boolean
  criticalFeedbackCount: number
}

export default function UserQuestionnairesPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [questionnaires, setQuestionnaires] = useState<UserQuestionnaire[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Load questionnaires
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/questionnaires')
        const json = await res.json()
        if (res.ok && json.success) {
          setQuestionnaires(json.data || [])
        }
      } catch (e) {
        console.error('Failed to load questionnaires', e)
      } finally {
        setLoading(false)
      }
    }
    if (user) {
      load()
    }
  }, [user])

  // Filtered questionnaires
  const filtered = questionnaires.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Stats
  const stats = {
    pending: questionnaires.filter(q => q.status === 'pending').length,
    submitted: questionnaires.filter(q => q.status === 'submitted').length,
    approved: questionnaires.filter(q => q.status === 'approved').length,
    returned: questionnaires.filter(q => q.status === 'returned').length,
  }

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

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date()
  }

  const getTimeUntilDeadline = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diff = deadlineDate.getTime() - now.getTime()
    
    if (diff < 0) return 'Overdue'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h remaining`
    if (hours > 0) return `${hours}h remaining`
    return 'Due soon'
  }

  const handleNavigate = (q: UserQuestionnaire) => {
    if (q.status === 'pending' || q.status === 'returned') {
      router.push(`/questionnaires/${q.id}`)
    } else {
      router.push(`/questionnaires/responses/${q.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">My Questionnaires</h1>
            <p className="text-slate-600">Complete required surveys and questionnaires</p>
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
                  <p className="text-xs text-slate-600">Pending</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600">Submitted</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.submitted}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600">Approved</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.approved}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600">Returned</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.returned}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search questionnaires..."
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
                  <DropdownMenuItem onClick={() => setStatusFilter('returned')}>Returned</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('rejected')}>Rejected</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Questionnaires List */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No questionnaires found</h3>
              <p className="text-slate-600">
                {search || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'You have no questionnaires at the moment'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((q) => (
              <Card
                key={q.id}
                className={`hover:shadow-md transition-shadow cursor-pointer ${
                  q.status === 'returned' ? 'border-orange-200 bg-orange-50/30' : ''
                } ${q.status === 'pending' && isOverdue(q.deadline) ? 'border-red-200 bg-red-50/30' : ''}`}
                onClick={() => handleNavigate(q)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{q.title}</h3>
                        {getStatusBadge(q.status)}
                        {q.isMandatory && (
                          <Badge variant="outline" className="text-red-600 border-red-200">
                            Mandatory
                          </Badge>
                        )}
                        {q.criticalFeedbackCount > 0 && (
                          <Badge className="bg-red-500 text-white">
                            {q.criticalFeedbackCount} Critical Feedback
                          </Badge>
                        )}
                      </div>
                      {q.description && (
                        <p className="text-sm text-slate-600 mb-3">{q.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <div className={`flex items-center gap-1 ${
                          isOverdue(q.deadline) && q.status === 'pending' ? 'text-red-600 font-medium' : 'text-slate-500'
                        }`}>
                          <Clock className="h-4 w-4" />
                          <span>
                            {q.status === 'pending' 
                              ? getTimeUntilDeadline(q.deadline)
                              : `Deadline: ${formatDate(q.deadline, 'medium')}`
                            }
                          </span>
                        </div>
                        {q.submittedAt && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Submitted {formatDate(q.submittedAt, 'short')}</span>
                          </div>
                        )}
                        {q.isLate && (
                          <Badge variant="outline" className="text-red-600 border-red-200">
                            Late Submission
                          </Badge>
                        )}
                      </div>
                      {q.status === 'returned' && q.adminNotes && (
                        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-sm font-medium text-orange-900 mb-1">Admin Notes:</p>
                          <p className="text-sm text-orange-700">{q.adminNotes}</p>
                        </div>
                      )}
                      {q.status === 'rejected' && q.adminNotes && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm font-medium text-red-900 mb-1">Rejection Reason:</p>
                          <p className="text-sm text-red-700">{q.adminNotes}</p>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
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
