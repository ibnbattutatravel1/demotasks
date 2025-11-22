"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Send,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"

interface Question {
  id: string
  questionText: string
  questionType: 'mcq' | 'text' | 'rating' | 'yes_no' | 'file' | 'date' | 'multiple_choice' | 'checkbox' | 'section'
  isRequired: boolean
  options?: string[]
  minValue?: number
  maxValue?: number
  maxFileSize?: number
  allowedFileTypes?: string
  placeholderText?: string
  helpText?: string
}

export default function CreateQuestionnairePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [instructions, setInstructions] = useState("")
  const [targetType, setTargetType] = useState<'all_users' | 'specific_users' | 'role_based'>('all_users')
  const [targetRole, setTargetRole] = useState<string>('')
  const [targetUserIds, setTargetUserIds] = useState<string[]>([])
  const [deadline, setDeadline] = useState("")
  const [isMandatory, setIsMandatory] = useState(true)
  const [allowLateSubmission, setAllowLateSubmission] = useState(false)
  const [showResultsToUsers, setShowResultsToUsers] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [saving, setSaving] = useState(false)

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/')
    }
  }, [user, router])

  // Load users for specific targeting
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/users')
        const json = await res.json()
        if (res.ok && json.success) {
          setUsers(json.data || [])
        }
      } catch (e) {
        console.error('Failed to load users', e)
      }
    }
    if (user?.role === 'admin') {
      load()
    }
  }, [user])

  // Add question
  const addQuestion = (type: Question['questionType']) => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      questionText: '',
      questionType: type,
      isRequired: type === 'section' ? false : true,
    }

    if (type === 'mcq' || type === 'multiple_choice' || type === 'checkbox') {
      newQuestion.options = ['Option 1', 'Option 2']
    }
    if (type === 'rating') {
      newQuestion.minValue = 1
      newQuestion.maxValue = 5
    }
    if (type === 'file') {
      newQuestion.maxFileSize = 10 // MB
      newQuestion.allowedFileTypes = 'pdf,doc,docx,jpg,png'
    }

    setQuestions([...questions, newQuestion])
  }

  // Remove question
  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id))
  }

  // Update question
  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q))
  }

  // Add option to MCQ
  const addOption = (questionId: string) => {
    const question = questions.find(q => q.id === questionId)
    if (question && question.options) {
      updateQuestion(questionId, {
        options: [...question.options, `Option ${question.options.length + 1}`]
      })
    }
  }

  // Remove option
  const removeOption = (questionId: string, index: number) => {
    const question = questions.find(q => q.id === questionId)
    if (question && question.options) {
      updateQuestion(questionId, {
        options: question.options.filter((_, i) => i !== index)
      })
    }
  }

  // Update option
  const updateOption = (questionId: string, index: number, value: string) => {
    const question = questions.find(q => q.id === questionId)
    if (question && question.options) {
      const newOptions = [...question.options]
      newOptions[index] = value
      updateQuestion(questionId, { options: newOptions })
    }
  }

  // Save as draft or publish
  const handleSave = async (publish: boolean = false) => {
    if (!title || !deadline) {
      toast({ title: 'Error', description: 'Title and deadline are required', variant: 'destructive' })
      return
    }

    if (questions.length === 0) {
      toast({ title: 'Error', description: 'Please add at least one question', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      // Create questionnaire
      const res = await fetch('/api/admin/questionnaires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          instructions,
          targetType,
          targetRole: targetType === 'role_based' ? targetRole : undefined,
          targetUserIds: targetType === 'specific_users' ? targetUserIds : undefined,
          deadline,
          isMandatory,
          allowLateSubmission,
          showResultsToUsers,
          questions: questions.map((q, index) => ({
            questionText: q.questionText,
            questionType: q.questionType,
            isRequired: q.isRequired,
            options: q.options,
            minValue: q.minValue,
            maxValue: q.maxValue,
            maxFileSize: q.maxFileSize,
            allowedFileTypes: q.allowedFileTypes,
            placeholderText: q.placeholderText,
            helpText: q.helpText,
          })),
        }),
      })

      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create')

      const questionnaireId = json.data.id

      // Publish if requested
      if (publish) {
        const pubRes = await fetch(`/api/admin/questionnaires/${questionnaireId}/publish`, {
          method: 'POST',
        })
        const pubJson = await pubRes.json()
        if (!pubRes.ok || !pubJson.success) throw new Error(pubJson.error || 'Failed to publish')
      }

      toast({
        title: 'Success',
        description: publish ? 'Questionnaire published successfully' : 'Questionnaire saved as draft'
      })

      router.push('/admin/questionnaires')
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (user?.role !== 'admin') {
    return null
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
                onClick={() => router.push('/admin/questionnaires')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Create Questionnaire</h1>
                <p className="text-sm text-slate-600">Design your survey or questionnaire</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handleSave(false)}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="bg-indigo-500 hover:bg-indigo-600"
              >
                <Send className="h-4 w-4 mr-2" />
                Publish
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Basic Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Employee Satisfaction Survey 2025"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this questionnaire"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                placeholder="Instructions for users filling out this questionnaire"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Target Audience */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Target Audience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Who should receive this questionnaire? *</Label>
              <Select value={targetType} onValueChange={(v: any) => setTargetType(v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_users">All Users</SelectItem>
                  <SelectItem value="role_based">Role-based</SelectItem>
                  <SelectItem value="specific_users">Specific Users</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {targetType === 'role_based' && (
              <div>
                <Label>Select Role</Label>
                <Select value={targetRole} onValueChange={setTargetRole}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Regular Users</SelectItem>
                    <SelectItem value="project_lead">Project Leads</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {targetType === 'specific_users' && (
              <div>
                <Label>Select Users</Label>
                <div className="mt-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-2">
                  {users.map(u => (
                    <label key={u.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={targetUserIds.includes(u.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTargetUserIds([...targetUserIds, u.id])
                          } else {
                            setTargetUserIds(targetUserIds.filter(id => id !== u.id))
                          }
                        }}
                      />
                      <span className="text-sm">{u.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="deadline">Deadline *</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Mandatory</Label>
                <p className="text-xs text-slate-600">Users must complete this questionnaire</p>
              </div>
              <Switch checked={isMandatory} onCheckedChange={setIsMandatory} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Late Submission</Label>
                <p className="text-xs text-slate-600">Accept responses after deadline</p>
              </div>
              <Switch checked={allowLateSubmission} onCheckedChange={setAllowLateSubmission} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Show Results to Users</Label>
                <p className="text-xs text-slate-600">Let users see aggregated results</p>
              </div>
              <Switch checked={showResultsToUsers} onCheckedChange={setShowResultsToUsers} />
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Questions ({questions.length})</CardTitle>
              <div className="flex items-center gap-2">
                <Label className="text-sm text-slate-600">Add Question:</Label>
                <Select
                  key={questions.length}
                  onValueChange={(v) => {
                    addQuestion(v as any)
                  }}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="section">Section / Topic Header</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="mcq">MCQ (Single)</SelectItem>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="yes_no">Yes/No</SelectItem>
                    <SelectItem value="file">File Upload</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600 mb-4">No questions added yet</p>
                <p className="text-sm text-slate-500">Use the dropdown above to add your first question</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q, index) => (
                  <Card key={q.id} className="border-2 border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <GripVertical className="h-5 w-5 text-slate-400 mt-2 cursor-move" />
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">
                              {q.questionType === 'section' ? 'Section' : q.questionType}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeQuestion(q.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                          {q.questionType === 'section' ? (
                            <>
                              <div>
                                <Input
                                  placeholder="Section title (e.g., Teamwork)"
                                  value={q.questionText}
                                  onChange={(e) => updateQuestion(q.id, { questionText: e.target.value })}
                                />
                              </div>
                              <div>
                                <Textarea
                                  placeholder="Optional description for this section"
                                  value={q.helpText || ''}
                                  onChange={(e) => updateQuestion(q.id, { helpText: e.target.value })}
                                  rows={2}
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <Input
                                  placeholder="Question text"
                                  value={q.questionText}
                                  onChange={(e) => updateQuestion(q.id, { questionText: e.target.value })}
                                />
                              </div>

                              {/* MCQ/Multiple Choice Options */}
                              {(q.questionType === 'mcq' || q.questionType === 'multiple_choice' || q.questionType === 'checkbox') && (
                                <div className="space-y-2">
                                  <Label className="text-xs">Options:</Label>
                                  {q.options?.map((opt, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                      <Input
                                        placeholder={`Option ${idx + 1}`}
                                        value={opt}
                                        onChange={(e) => updateOption(q.id, idx, e.target.value)}
                                      />
                                      {q.options!.length > 2 && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeOption(q.id, idx)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addOption(q.id)}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Option
                                  </Button>
                                </div>
                              )}

                              {/* Rating */}
                              {q.questionType === 'rating' && (
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label className="text-xs">Min Value</Label>
                                    <Input
                                      type="number"
                                      value={q.minValue}
                                      onChange={(e) => updateQuestion(q.id, { minValue: Number(e.target.value) })}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Max Value</Label>
                                    <Input
                                      type="number"
                                      value={q.maxValue}
                                      onChange={(e) => updateQuestion(q.id, { maxValue: Number(e.target.value) })}
                                    />
                                  </div>
                                </div>
                              )}

                              {/* File Upload */}
                              {q.questionType === 'file' && (
                                <div className="space-y-2">
                                  <div>
                                    <Label className="text-xs">Max File Size (MB)</Label>
                                    <Input
                                      type="number"
                                      value={q.maxFileSize}
                                      onChange={(e) => updateQuestion(q.id, { maxFileSize: Number(e.target.value) })}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Allowed Types (comma-separated)</Label>
                                    <Input
                                      placeholder="pdf,doc,docx,jpg,png"
                                      value={q.allowedFileTypes}
                                      onChange={(e) => updateQuestion(q.id, { allowedFileTypes: e.target.value })}
                                    />
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={q.isRequired}
                                  onCheckedChange={(checked) => updateQuestion(q.id, { isRequired: checked })}
                                />
                                <Label className="text-sm">Required</Label>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
