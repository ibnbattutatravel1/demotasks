"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ArrowLeft,
  Save,
  Send,
  Upload,
  Clock,
  AlertCircle,
  CheckCircle2,
  Star,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/format-date"

interface Question {
  id: string
  questionText: string
  questionType: string
  isRequired: boolean
  options?: string[]
  minValue?: number
  maxValue?: number
  maxFileSize?: number
  allowedFileTypes?: string
  helpText?: string
  displayOrder: number
}

interface Answer {
  questionId: string
  answerValue?: string
  answerText?: string
  answerNumber?: number
  answerOptions?: string[]
  answerFile?: string
  answerDate?: string
}

export default function FillQuestionnairePage() {
  const router = useRouter()
  const pathname = usePathname()
  const questionnaireId = (pathname?.split('/')?.[2] as string) || ""
  const { user } = useAuth()
  const { toast } = useToast()

  const [questionnaire, setQuestionnaire] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<{ [key: string]: Answer }>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<{ [key: string]: boolean }>({})

  // Load questionnaire
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/questionnaires/${questionnaireId}`)
        const json = await res.json()
        if (res.ok && json.success) {
          setQuestionnaire(json.data.questionnaire)
          setQuestions(json.data.questions)
          
          // Load existing answers if response exists
          if (json.data.response && json.data.answers) {
            const existingAnswers: { [key: string]: Answer } = {}
            json.data.answers.forEach((a: any) => {
              existingAnswers[a.questionId] = {
                questionId: a.questionId,
                answerValue: a.answerValue,
                answerText: a.answerText,
                answerNumber: a.answerNumber,
                answerOptions: a.answerOptions ? JSON.parse(a.answerOptions) : undefined,
                answerFile: a.answerFile,
                answerDate: a.answerDate,
              }
            })
            setAnswers(existingAnswers)
          }
        }
      } catch (e) {
        console.error('Failed to load questionnaire', e)
        toast({ title: 'Error', description: 'Failed to load questionnaire', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    }
    if (user && questionnaireId) {
      load()
    }
  }, [user, questionnaireId])

  // Update answer
  const updateAnswer = (questionId: string, updates: Partial<Answer>) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        ...prev[questionId],
        ...updates,
      }
    }))
  }

  // Handle file upload
  const handleFileUpload = async (questionId: string, file: File, question: Question) => {
    // Validate file size
    if (question.maxFileSize && file.size > question.maxFileSize * 1024 * 1024) {
      toast({
        title: 'Error',
        description: `File size exceeds ${question.maxFileSize}MB`,
        variant: 'destructive'
      })
      return
    }

    // Validate file type
    if (question.allowedFileTypes) {
      const allowedTypes = question.allowedFileTypes.split(',').map(t => t.trim())
      const fileExt = file.name.split('.').pop()?.toLowerCase()
      if (!fileExt || !allowedTypes.includes(fileExt)) {
        toast({
          title: 'Error',
          description: `Only ${question.allowedFileTypes} files are allowed`,
          variant: 'destructive'
        })
        return
      }
    }

    try {
      setUploadingFiles(prev => ({ ...prev, [questionId]: true }))
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('questionnaireId', questionnaireId)
      formData.append('questionId', questionId)

      const res = await fetch('/api/questionnaires/upload', {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Upload failed')

      updateAnswer(questionId, { answerFile: json.filePath })
      toast({ title: 'Success', description: 'File uploaded successfully' })
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    } finally {
      setUploadingFiles(prev => ({ ...prev, [questionId]: false }))
    }
  }

  // Validate answers
  const validateAnswers = () => {
    const errors: string[] = []
    
    questions.forEach(q => {
      if (q.isRequired) {
        const answer = answers[q.id]
        if (!answer) {
          errors.push(`Question "${q.questionText}" is required`)
        } else {
          // Check based on type
          if (q.questionType === 'text' && !answer.answerText?.trim()) {
            errors.push(`Question "${q.questionText}" requires an answer`)
          } else if (q.questionType === 'mcq' || q.questionType === 'yes_no') {
            if (!answer.answerValue) {
              errors.push(`Question "${q.questionText}" requires a selection`)
            }
          } else if (q.questionType === 'multiple_choice' || q.questionType === 'checkbox') {
            if (!answer.answerOptions || answer.answerOptions.length === 0) {
              errors.push(`Question "${q.questionText}" requires at least one selection`)
            }
          } else if (q.questionType === 'rating' && !answer.answerNumber) {
            errors.push(`Question "${q.questionText}" requires a rating`)
          } else if (q.questionType === 'file' && !answer.answerFile) {
            errors.push(`Question "${q.questionText}" requires a file upload`)
          } else if (q.questionType === 'date' && !answer.answerDate) {
            errors.push(`Question "${q.questionText}" requires a date`)
          }
        }
      }
    })

    return errors
  }

  // Save as draft
  const handleSaveDraft = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/questionnaires/${questionnaireId}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: Object.values(answers),
          isDraft: true,
        }),
      })

      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to save')

      toast({ title: 'Success', description: 'Draft saved successfully' })
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  // Submit
  const handleSubmit = async () => {
    const errors = validateAnswers()
    if (errors.length > 0) {
      toast({
        title: 'Validation Error',
        description: errors[0],
        variant: 'destructive'
      })
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/questionnaires/${questionnaireId}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: Object.values(answers),
          isDraft: false,
        }),
      })

      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to submit')

      toast({ title: 'Success', description: 'Response submitted successfully' })
      router.push('/questionnaires')
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  // Progress calculation
  const answeredCount = Object.keys(answers).length
  const totalCount = questions.length
  const progress = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0

  // Check if overdue
  const isOverdue = questionnaire?.deadline && new Date(questionnaire.deadline) < new Date()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading questionnaire...</p>
        </div>
      </div>
    )
  }

  if (!questionnaire) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Questionnaire Not Found</h2>
            <p className="text-slate-600 mb-4">This questionnaire may have been deleted or you don't have access to it.</p>
            <Button onClick={() => router.push('/questionnaires')}>
              Back to Questionnaires
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
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/questionnaires')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              {questionnaire.isMandatory && (
                <Badge className="bg-red-500">Mandatory</Badge>
              )}
              {isOverdue && (
                <Badge variant="destructive">Overdue</Badge>
              )}
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{questionnaire.title}</h1>
            {questionnaire.description && (
              <p className="text-slate-600 mb-3">{questionnaire.description}</p>
            )}
            {questionnaire.deadline && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="h-4 w-4" />
                <span>Deadline: {formatDate(questionnaire.deadline)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-indigo-50 border-b border-indigo-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-indigo-900">Progress</span>
            <span className="text-sm text-indigo-700">{answeredCount} / {totalCount} questions</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Instructions */}
      {questionnaire.instructions && (
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-1">Instructions</h3>
                  <p className="text-sm text-blue-800 whitespace-pre-wrap">{questionnaire.instructions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Questions */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="space-y-6">
          {questions.map((q, index) => (
            <Card key={q.id}>
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className="text-slate-500 text-sm mr-2">Q{index + 1}.</span>
                    <span>{q.questionText}</span>
                    {q.isRequired && <span className="text-red-500 ml-1">*</span>}
                  </div>
                  <Badge variant="outline" className="ml-2">{q.questionType}</Badge>
                </CardTitle>
                {q.helpText && (
                  <p className="text-sm text-slate-600 mt-1">{q.helpText}</p>
                )}
              </CardHeader>
              <CardContent>
                {/* MCQ (Single Choice) */}
                {q.questionType === 'mcq' && (
                  <RadioGroup
                    value={answers[q.id]?.answerValue || ''}
                    onValueChange={(value) => updateAnswer(q.id, { answerValue: value })}
                  >
                    {Array.isArray(q.options) && q.options.map((opt, idx) => (
                      <div key={idx} className="flex items-center space-x-2 mb-2">
                        <RadioGroupItem value={opt} id={`${q.id}_${idx}`} />
                        <Label htmlFor={`${q.id}_${idx}`} className="cursor-pointer">{opt}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {/* Multiple Choice / Checkbox */}
                {(q.questionType === 'multiple_choice' || q.questionType === 'checkbox') && (
                  <div className="space-y-2">
                    {Array.isArray(q.options) && q.options.map((opt, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${q.id}_${idx}`}
                          checked={answers[q.id]?.answerOptions?.includes(opt) || false}
                          onCheckedChange={(checked) => {
                            const current = answers[q.id]?.answerOptions || []
                            const updated = checked
                              ? [...current, opt]
                              : current.filter(o => o !== opt)
                            updateAnswer(q.id, { answerOptions: updated })
                          }}
                        />
                        <Label htmlFor={`${q.id}_${idx}`} className="cursor-pointer">{opt}</Label>
                      </div>
                    ))}
                  </div>
                )}

                {/* Text */}
                {q.questionType === 'text' && (
                  <Textarea
                    placeholder="Type your answer here..."
                    value={answers[q.id]?.answerText || ''}
                    onChange={(e) => updateAnswer(q.id, { answerText: e.target.value })}
                    rows={4}
                  />
                )}

                {/* Rating */}
                {q.questionType === 'rating' && (
                  <div className="flex items-center gap-2">
                    {Array.from({ length: (q.maxValue || 5) - (q.minValue || 1) + 1 }, (_, i) => {
                      const value = (q.minValue || 1) + i
                      const selected = answers[q.id]?.answerNumber === value
                      return (
                        <button
                          key={value}
                          onClick={() => updateAnswer(q.id, { answerNumber: value })}
                          className={`p-2 ${selected ? 'text-yellow-500' : 'text-slate-300'}`}
                        >
                          <Star className="h-8 w-8" fill={selected ? 'currentColor' : 'none'} />
                        </button>
                      )
                    })}
                    {answers[q.id]?.answerNumber && (
                      <span className="ml-2 text-sm text-slate-600">
                        {answers[q.id].answerNumber} / {q.maxValue || 5}
                      </span>
                    )}
                  </div>
                )}

                {/* Yes/No */}
                {q.questionType === 'yes_no' && (
                  <RadioGroup
                    value={answers[q.id]?.answerValue || ''}
                    onValueChange={(value) => updateAnswer(q.id, { answerValue: value })}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem value="Yes" id={`${q.id}_yes`} />
                      <Label htmlFor={`${q.id}_yes`} className="cursor-pointer">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id={`${q.id}_no`} />
                      <Label htmlFor={`${q.id}_no`} className="cursor-pointer">No</Label>
                    </div>
                  </RadioGroup>
                )}

                {/* File Upload */}
                {q.questionType === 'file' && (
                  <div>
                    <Input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(q.id, file, q)
                      }}
                      disabled={uploadingFiles[q.id]}
                    />
                    {q.allowedFileTypes && (
                      <p className="text-xs text-slate-500 mt-1">
                        Allowed: {q.allowedFileTypes} (Max: {q.maxFileSize}MB)
                      </p>
                    )}
                    {uploadingFiles[q.id] && (
                      <p className="text-sm text-indigo-600 mt-2">Uploading...</p>
                    )}
                    {answers[q.id]?.answerFile && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>File uploaded successfully</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Date */}
                {q.questionType === 'date' && (
                  <Input
                    type="date"
                    value={answers[q.id]?.answerDate || ''}
                    onChange={(e) => updateAnswer(q.id, { answerDate: e.target.value })}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-8 pb-8">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-indigo-500 hover:bg-indigo-600"
          >
            <Send className="h-4 w-4 mr-2" />
            Submit Response
          </Button>
        </div>
      </div>
    </div>
  )
}
