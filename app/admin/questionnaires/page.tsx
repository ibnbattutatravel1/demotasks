"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Plus,
  Search,
  Filter,
  FileText,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Send,
  ChevronDown,
  ArrowLeft,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { formatDate, formatDateTime } from "@/lib/format-date"

interface Questionnaire {
  id: string
  title: string
  description?: string
  targetType: string
  targetRole?: string
  deadline: string
  isMandatory: boolean
  status: string
  publishedAt?: string
  createdAt: string
  totalTargets: number
  totalResponses: number
  pendingCount: number
  submittedCount: number
  approvedCount: number
}

export default function AdminQuestionnairesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/')
    }
  }, [user, router])

  // Load questionnaires
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/admin/questionnaires')
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
    if (user?.role === 'admin') {
      load()
    }
  }, [user])

  // Delete questionnaire
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return

    try {
      const res = await fetch(`/api/admin/questionnaires/${id}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete')

      setQuestionnaires(prev => prev.filter(q => q.id !== id))
      toast({ title: 'Success', description: 'Questionnaire deleted' })
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    }
  }

  // Publish questionnaire
  const handlePublish = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/questionnaires/${id}/publish`, {
        method: 'POST',
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to publish')

      setQuestionnaires(prev =>
        prev.map(q => (q.id === id ? { ...q, status: 'published', publishedAt: new Date().toISOString() } : q))
      )
      toast({ title: 'Success', description: 'Questionnaire published and notifications sent' })
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    }
  }

  // Filtered questionnaires
  const filtered = questionnaires.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Stats
  const stats = {
    total: questionnaires.length,
    published: questionnaires.filter(q => q.status === 'published').length,
    draft: questionnaires.filter(q => q.status === 'draft').length,
    closed: questionnaires.filter(q => q.status === 'closed').length,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-emerald-100 text-emerald-700'
      case 'draft': return 'bg-slate-100 text-slate-700'
      case 'closed': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getResponseRate = (q: Questionnaire) => {
    if (q.totalTargets === 0) return 0
    return Math.round((q.totalResponses / q.totalTargets) * 100)
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
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Questionnaires</h1>
              <p className="text-slate-600">Manage surveys and questionnaires for users</p>
            </div>
            <Button
              onClick={() => router.push('/admin/questionnaires/new')}
              className="bg-indigo-500 hover:bg-indigo-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Questionnaire
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
                  <p className="text-xs text-slate-600">Total</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600">Published</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.published}</p>
                </div>
                <Send className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600">Draft</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.draft}</p>
                </div>
                <Edit className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600">Closed</p>
                  <p className="text-2xl font-bold text-red-600">{stats.closed}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
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
                  <DropdownMenuItem onClick={() => setStatusFilter('published')}>Published</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('draft')}>Draft</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('closed')}>Closed</DropdownMenuItem>
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
              <p className="text-slate-600 mb-4">
                {search || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first questionnaire to get started'}
              </p>
              {!search && statusFilter === 'all' && (
                <Button onClick={() => router.push('/admin/questionnaires/new')} className="bg-indigo-500">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Questionnaire
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((q) => (
              <Card key={q.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{q.title}</h3>
                        <Badge className={getStatusColor(q.status)}>{q.status}</Badge>
                        {q.isMandatory && (
                          <Badge variant="outline" className="text-red-600 border-red-200">
                            Mandatory
                          </Badge>
                        )}
                      </div>
                      {q.description && (
                        <p className="text-sm text-slate-600 mb-3">{q.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{q.totalTargets} users</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>{q.totalResponses} responses ({getResponseRate(q)}%)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Deadline: {formatDate(q.deadline, 'medium')}</span>
                        </div>
                      </div>
                      {q.status === 'published' && (
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="outline" className="text-xs">{q.pendingCount} Pending</Badge>
                          <Badge variant="outline" className="text-xs text-blue-600">{q.submittedCount} Submitted</Badge>
                          <Badge variant="outline" className="text-xs text-emerald-600">{q.approvedCount} Approved</Badge>
                        </div>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/admin/questionnaires/${q.id}/responses`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Responses
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/admin/questionnaires/${q.id}/stats`)}>
                          <FileText className="h-4 w-4 mr-2" />
                          Statistics
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {q.status === 'draft' && (
                          <>
                            <DropdownMenuItem onClick={() => router.push(`/admin/questionnaires/${q.id}/edit`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePublish(q.id)}>
                              <Send className="h-4 w-4 mr-2" />
                              Publish
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDelete(q.id, q.title)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
