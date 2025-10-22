"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  Download,
  FileText,
  AlertCircle,
  BarChart3,
  PieChart,
} from "lucide-react"
import { formatDate, formatDateTime } from "@/lib/format-date"

interface QuestionStats {
  questionId: string
  questionText: string
  questionType: string
  totalResponses: number
  answerDistribution: { [key: string]: number }
  averageRating?: number
  mostCommon?: string
}

interface Stats {
  questionnaire: {
    id: string
    title: string
    description?: string
    deadline: string
    totalTargets: number
  }
  overview: {
    totalResponses: number
    responseRate: number
    pendingCount: number
    submittedCount: number
    approvedCount: number
    rejectedCount: number
    returnedCount: number
    lateCount: number
    averageCompletionTime: number // in minutes
  }
  questionStats: QuestionStats[]
  timeline: Array<{
    date: string
    count: number
  }>
}

export default function QuestionnaireStatsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const questionnaireId = (pathname?.split('/')?.[3] as string) || ""
  const { user } = useAuth()

  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/')
    }
  }, [user, router])

  // Load stats
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/admin/questionnaires/${questionnaireId}/stats`)
        const json = await res.json()
        if (res.ok && json.success) {
          setStats(json.data)
        }
      } catch (e) {
        console.error('Failed to load stats', e)
      } finally {
        setLoading(false)
      }
    }
    if (user?.role === 'admin' && questionnaireId) {
      load()
    }
  }, [user, questionnaireId])

  // Export to Excel
  const handleExport = async () => {
    try {
      const res = await fetch(`/api/admin/questionnaires/${questionnaireId}/export`)
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `questionnaire_${questionnaireId}_${Date.now()}.xlsx`
      a.click()
    } catch (e) {
      console.error('Export failed', e)
    }
  }

  if (user?.role !== 'admin') {
    return null
  }

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading statistics...</p>
        </div>
      </div>
    )
  }

  const getPercentage = (count: number) => {
    if (stats.overview.totalResponses === 0) return 0
    return Math.round((count / stats.overview.totalResponses) * 100)
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
                onClick={() => router.push(`/admin/questionnaires/${questionnaireId}/responses`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Responses
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">
                  Statistics & Analytics
                </h1>
                <p className="text-sm text-slate-600">{stats.questionnaire.title}</p>
              </div>
            </div>
            <Button onClick={handleExport} className="bg-indigo-500 hover:bg-indigo-600">
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600">Response Rate</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {stats.overview.responseRate}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {stats.overview.totalResponses} / {stats.questionnaire.totalTargets}
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-indigo-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600">Approved</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {stats.overview.approvedCount}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {getPercentage(stats.overview.approvedCount)}% of total
                  </p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600">Pending Review</p>
                  <p className="text-3xl font-bold text-amber-600">
                    {stats.overview.submittedCount}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Awaiting approval
                  </p>
                </div>
                <Clock className="h-10 w-10 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600">Late Submissions</p>
                  <p className="text-3xl font-bold text-red-600">
                    {stats.overview.lateCount}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    After deadline
                  </p>
                </div>
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Breakdown */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-indigo-600" />
              Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Pending ({stats.overview.pendingCount})</span>
                  <span className="text-sm text-slate-600">{getPercentage(stats.overview.pendingCount)}%</span>
                </div>
                <Progress value={getPercentage(stats.overview.pendingCount)} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Submitted ({stats.overview.submittedCount})</span>
                  <span className="text-sm text-slate-600">{getPercentage(stats.overview.submittedCount)}%</span>
                </div>
                <Progress value={getPercentage(stats.overview.submittedCount)} className="h-2 bg-blue-200" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Approved ({stats.overview.approvedCount})</span>
                  <span className="text-sm text-slate-600">{getPercentage(stats.overview.approvedCount)}%</span>
                </div>
                <Progress value={getPercentage(stats.overview.approvedCount)} className="h-2 bg-emerald-200" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Returned ({stats.overview.returnedCount})</span>
                  <span className="text-sm text-slate-600">{getPercentage(stats.overview.returnedCount)}%</span>
                </div>
                <Progress value={getPercentage(stats.overview.returnedCount)} className="h-2 bg-orange-200" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Rejected ({stats.overview.rejectedCount})</span>
                  <span className="text-sm text-slate-600">{getPercentage(stats.overview.rejectedCount)}%</span>
                </div>
                <Progress value={getPercentage(stats.overview.rejectedCount)} className="h-2 bg-red-200" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question-by-Question Analysis */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              Question Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stats.questionStats.map((q, idx) => (
                <div key={q.questionId} className="border-b border-slate-200 pb-6 last:border-0 last:pb-0">
                  <div className="mb-3">
                    <h3 className="font-medium text-slate-900 mb-1">
                      Q{idx + 1}. {q.questionText}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Type: {q.questionType} • Responses: {q.totalResponses}
                    </p>
                  </div>

                  {/* MCQ/Multiple Choice */}
                  {(q.questionType === 'mcq' || q.questionType === 'multiple_choice') && (
                    <div className="space-y-2">
                      {Object.entries(q.answerDistribution).map(([option, count]) => (
                        <div key={option}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-slate-700">{option}</span>
                            <span className="text-sm text-slate-600">
                              {count} ({Math.round((count / q.totalResponses) * 100)}%)
                            </span>
                          </div>
                          <Progress
                            value={(count / q.totalResponses) * 100}
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Rating */}
                  {q.questionType === 'rating' && (
                    <div>
                      <p className="text-2xl font-bold text-indigo-600 mb-2">
                        ⭐ {q.averageRating?.toFixed(1)} / 5.0
                      </p>
                      <p className="text-sm text-slate-600">Average Rating</p>
                    </div>
                  )}

                  {/* Yes/No */}
                  {q.questionType === 'yes_no' && (
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(q.answerDistribution).map(([answer, count]) => (
                        <div key={answer} className="text-center">
                          <p className="text-3xl font-bold text-slate-900 mb-1">{count}</p>
                          <p className="text-sm text-slate-600">{answer}</p>
                          <p className="text-xs text-slate-500">
                            {Math.round((count / q.totalResponses) * 100)}%
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Text */}
                  {q.questionType === 'text' && (
                    <div>
                      <p className="text-sm text-slate-600">
                        {q.totalResponses} text responses submitted
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => router.push(`/admin/questionnaires/${questionnaireId}/responses`)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View All Responses
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        {stats.timeline && stats.timeline.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                Response Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.timeline.map((day, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 w-24">{formatDate(day.date, 'short')}</span>
                    <Progress value={(day.count / stats.overview.totalResponses) * 100} className="flex-1 h-2" />
                    <span className="text-xs text-slate-600 w-12">{day.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
