"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Download,
  MessageSquare,
  Clock,
  Star,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDate, formatDateTime } from "@/lib/format-date"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface QuestionAnswer {
  questionId: string
  questionText: string
  questionType: string
  isRequired: boolean
  answerValue?: string
  answerText?: string
  answerNumber?: number
  answerOptions?: string[]
  answerFile?: string
  answerDate?: string
  feedback?: string
  isCritical?: boolean
}

interface HistoryItem {
  id: string
  action: string
  notes: string
  createdAt: string
  userName: string
}

export default function ReviewResponsePage() {
  const router = useRouter()
  const pathname = usePathname()
  const parts = pathname?.split('/') || []
  const questionnaireId = parts[3] || ""
  const userId = parts[5] || ""
  const { user } = useAuth()
  const { toast } = useToast()

  const [response, setResponse] = useState<any>(null)
  const [questionnaire, setQuestionnaire] = useState<any>(null)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [qa, setQA] = useState<QuestionAnswer[]>([])
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [adminNotes, setAdminNotes] = useState("")
  const [processing, setProcessing] = useState(false)
  const [feedbacks, setFeedbacks] = useState<{ [key: string]: { text: string; isCritical: boolean } }>({})

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/')
    }
  }, [user, router])

  // Load response
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/admin/questionnaires/${questionnaireId}/responses/${userId}`)
        const json = await res.json()
        if (res.ok && json.success) {
          setResponse(json.data.response)
          setQuestionnaire(json.data.questionnaire)
          setUserInfo(json.data.user)
          setQA(json.data.questionsAnswers)
          setHistory(json.data.history || [])
          setAdminNotes(json.data.response.adminNotes || '')
          
          // Load existing feedbacks
          const existingFeedbacks: { [key: string]: { text: string; isCritical: boolean } } = {}
          json.data.feedbacks?.forEach((f: any) => {
            existingFeedbacks[f.questionId] = {
              text: f.feedbackText,
              isCritical: f.isCritical
            }
          })
          setFeedbacks(existingFeedbacks)
        }
      } catch (e) {
        console.error('Failed to load response', e)
        toast({ title: 'Error', description: 'Failed to load response', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    }
    if (user?.role === 'admin' && questionnaireId && userId) {
      load()
    }
  }, [user, questionnaireId, userId])

  // Handle approve/reject/return
  const handleAction = async (action: 'approve' | 'reject' | 'return') => {
    if (action === 'reject' && !adminNotes.trim()) {
      toast({ title: 'Error', description: 'Please provide rejection reason', variant: 'destructive' })
      return
    }

    setProcessing(true)
    try {
      const res = await fetch(`/api/admin/questionnaires/${questionnaireId}/responses/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          adminNotes,
          feedbacks: Object.entries(feedbacks).map(([questionId, fb]) => ({
            questionId,
            feedbackText: fb.text,
            isCritical: fb.isCritical,
          })).filter(f => f.feedbackText.trim()),
        }),
      })

      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to process')

      toast({
        title: 'Success',
        description: action === 'approve' ? 'Response approved' : action === 'reject' ? 'Response rejected' : 'Response returned for revision'
      })

      router.push(`/admin/questionnaires/${questionnaireId}/responses`)
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    } finally {
      setProcessing(false)
    }
  }

  if (user?.role !== 'admin') {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading response...</p>
        </div>
      </div>
    )
  }

  if (!response || !questionnaire || !userInfo) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Response Not Found</h2>
            <Button onClick={() => router.push(`/admin/questionnaires/${questionnaireId}/responses`)}>
              Back to Responses
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/admin/questionnaires/${questionnaireId}/responses`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">Review Response</h1>
                <p className="text-sm text-slate-600">{questionnaire.title}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* User Info */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={userInfo.avatar} />
                  <AvatarFallback className="text-lg">{userInfo.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-1">{userInfo.name}</h2>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    {getStatusBadge(response.status)}
                    {response.isLate && (
                      <Badge variant="outline" className="text-red-600 border-red-200">
                        Late Submission
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    {response.submittedAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Submitted {formatDateTime(response.submittedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions & Answers */}
        <div className="space-y-4 mb-6">
          {qa.map((item, index) => (
            <Card key={item.questionId} className={feedbacks[item.questionId]?.isCritical ? 'border-2 border-red-500' : ''}>
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className="text-slate-500 text-sm mr-2">Q{index + 1}.</span>
                    <span>{item.questionText}</span>
                    {item.isRequired && <span className="text-red-500 ml-1">*</span>}
                  </div>
                  <Badge variant="outline">{item.questionType}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Answer Display */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs font-medium text-slate-600 mb-2">User's Answer:</p>
                  
                  {item.questionType === 'text' && (
                    <p className="text-slate-900 whitespace-pre-wrap">{item.answerText || <span className="text-slate-400">No answer</span>}</p>
                  )}
                  
                  {(item.questionType === 'mcq' || item.questionType === 'yes_no') && (
                    <p className="text-slate-900 font-medium">{item.answerValue || <span className="text-slate-400">No answer</span>}</p>
                  )}
                  
                  {(item.questionType === 'multiple_choice' || item.questionType === 'checkbox') && (
                    <div className="flex flex-wrap gap-2">
                      {item.answerOptions && item.answerOptions.length > 0 ? (
                        item.answerOptions.map((opt, idx) => (
                          <Badge key={idx} variant="secondary">{opt}</Badge>
                        ))
                      ) : (
                        <span className="text-slate-400">No answer</span>
                      )}
                    </div>
                  )}
                  
                  {item.questionType === 'rating' && (
                    <div className="flex items-center gap-2">
                      {item.answerNumber ? (
                        <>
                          {Array.from({ length: item.answerNumber }, (_, i) => (
                            <Star key={i} className="h-5 w-5 text-yellow-500" fill="currentColor" />
                          ))}
                          <span className="ml-2 text-slate-600">{item.answerNumber} / 5</span>
                        </>
                      ) : (
                        <span className="text-slate-400">No rating</span>
                      )}
                    </div>
                  )}
                  
                  {item.questionType === 'file' && (
                    <div>
                      {item.answerFile ? (
                        <a
                          href={item.answerFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download File</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">No file uploaded</span>
                      )}
                    </div>
                  )}
                  
                  {item.questionType === 'date' && (
                    <p className="text-slate-900">{item.answerDate ? formatDate(item.answerDate) : <span className="text-slate-400">No date</span>}</p>
                  )}
                </div>

                {/* Feedback Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Add Feedback (Optional)</Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={feedbacks[item.questionId]?.isCritical || false}
                        onCheckedChange={(checked) => {
                          setFeedbacks(prev => ({
                            ...prev,
                            [item.questionId]: {
                              text: prev[item.questionId]?.text || '',
                              isCritical: checked
                            }
                          }))
                        }}
                      />
                      <Label className="text-xs text-red-600">Mark as Critical</Label>
                    </div>
                  </div>
                  <Textarea
                    placeholder="Add specific feedback for this question..."
                    value={feedbacks[item.questionId]?.text || ''}
                    onChange={(e) => {
                      setFeedbacks(prev => ({
                        ...prev,
                        [item.questionId]: {
                          text: e.target.value,
                          isCritical: prev[item.questionId]?.isCritical || false
                        }
                      }))
                    }}
                    rows={2}
                    className={feedbacks[item.questionId]?.isCritical ? 'border-red-500' : ''}
                  />
                  {feedbacks[item.questionId]?.isCritical && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      This feedback will be highlighted in red for the user
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Admin Notes */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Overall Admin Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Add overall notes or comments about this response..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        {response.status === 'submitted' && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">Review this response and take action:</p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleAction('return')}
                    disabled={processing}
                    className="text-orange-600 border-orange-300 hover:bg-orange-50"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Return for Revision
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleAction('reject')}
                    disabled={processing}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleAction('approve')}
                    disabled={processing}
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* History Timeline */}
        {history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                History Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.map((h) => (
                  <div key={h.id} className="flex gap-3 text-sm">
                    <div className="flex-shrink-0 w-2 h-2 bg-indigo-500 rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="text-slate-900 font-medium">{h.action.replace('_', ' ')}</p>
                      {h.notes && <p className="text-slate-600 text-xs mt-0.5">{h.notes}</p>}
                      <p className="text-slate-500 text-xs mt-1">
                        {formatDateTime(h.createdAt)} • {h.userName}
                      </p>
                    </div>
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
