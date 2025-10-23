"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  Video,
  Calendar,
  Clock,
  Users,
  ExternalLink,
  Edit,
  Trash2,
  ArrowLeft,
  User,
  Check,
  X,
  HelpCircle,
  Loader2,
  FileText,
  Link as LinkIcon,
} from "lucide-react"
import { MeetingForm } from "@/components/meeting-form"
import { formatDate } from "@/lib/format-date"

interface Meeting {
  id: string
  title: string
  description: string
  meetingLink: string
  meetingType: string
  startTime: string
  endTime: string
  timezone: string
  status: string
  agenda?: string
  notes?: string
  recordingUrl?: string
  organizer: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  attendees: Array<{
    id: string
    userId: string
    name: string
    email: string
    avatar?: string
    status: string
    role: string
  }>
  project?: {
    id: string
    name: string
    color: string
  }
}

export default function MeetingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditForm, setShowEditForm] = useState(false)
  const [notes, setNotes] = useState("")
  const [savingNotes, setSavingNotes] = useState(false)

  useEffect(() => {
    loadMeeting()
  }, [resolvedParams.id])

  const loadMeeting = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/meetings/${resolvedParams.id}`)
      const result = await response.json()

      if (result.success) {
        setMeeting(result.data)
        setNotes(result.data.notes || "")
      } else {
        alert(result.error || 'Failed to load meeting')
        router.push('/meetings')
      }
    } catch (error) {
      console.error('Failed to load meeting:', error)
      router.push('/meetings')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to cancel this meeting?')) return

    try {
      const response = await fetch(`/api/meetings/${resolvedParams.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        router.push('/meetings')
      } else {
        alert(result.error || 'Failed to cancel meeting')
      }
    } catch (error) {
      console.error('Failed to cancel meeting:', error)
      alert('Failed to cancel meeting')
    }
  }

  const handleResponse = async (status: 'accepted' | 'declined' | 'tentative') => {
    try {
      const response = await fetch(`/api/meetings/${resolvedParams.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      const result = await response.json()

      if (result.success) {
        loadMeeting()
      } else {
        alert(result.error || 'Failed to respond')
      }
    } catch (error) {
      console.error('Failed to respond:', error)
      alert('Failed to respond')
    }
  }

  const handleSaveNotes = async () => {
    try {
      setSavingNotes(true)
      const response = await fetch(`/api/meetings/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })

      const result = await response.json()

      if (result.success) {
        setMeeting(result.data)
      } else {
        alert(result.error || 'Failed to save notes')
      }
    } catch (error) {
      console.error('Failed to save notes:', error)
      alert('Failed to save notes')
    } finally {
      setSavingNotes(false)
    }
  }

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'zoom': return '🔵'
      case 'google-meet': return '🎥'
      case 'teams': return '💼'
      default: return '📹'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <Check className="h-4 w-4 text-green-600" />
      case 'declined': return <X className="h-4 w-4 text-red-600" />
      case 'tentative': return <HelpCircle className="h-4 w-4 text-yellow-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p>Meeting not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/meetings")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Meetings
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-3xl">{getMeetingTypeIcon(meeting.meetingType)}</div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">{meeting.title}</h1>
                  <p className="text-slate-600 mt-1">{meeting.description}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {meeting.status === 'scheduled' && (
                <>
                  <Button onClick={() => window.open(meeting.meetingLink, '_blank')}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Join Meeting
                  </Button>
                  <Button variant="outline" onClick={() => setShowEditForm(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Meeting Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Meeting Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-sm text-slate-600 mb-1">Start Time</h3>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  {formatDate(meeting.startTime)}
                </p>
                <p className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4 text-slate-500" />
                  {new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-600 mb-1">End Time</h3>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  {formatDate(meeting.endTime)}
                </p>
                <p className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4 text-slate-500" />
                  {new Date(meeting.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-slate-600 mb-2">Meeting Link</h3>
              <a
                href={meeting.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-indigo-600 hover:underline"
              >
                <LinkIcon className="h-4 w-4" />
                {meeting.meetingLink}
              </a>
            </div>

            {meeting.project && (
              <div>
                <h3 className="font-semibold text-sm text-slate-600 mb-2">Associated Project</h3>
                <Badge variant="outline" className={`bg-${meeting.project.color}-50`}>
                  📁 {meeting.project.name}
                </Badge>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-sm text-slate-600 mb-2">Status</h3>
              <Badge>{meeting.status}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Agenda */}
        {meeting.agenda && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Agenda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-slate-700">{meeting.agenda}</p>
            </CardContent>
          </Card>
        )}

        {/* Organizer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Organizer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={meeting.organizer.avatar} />
                <AvatarFallback>{meeting.organizer.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{meeting.organizer.name}</p>
                <p className="text-sm text-slate-600">{meeting.organizer.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendees */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Attendees ({meeting.attendees.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {meeting.attendees.map((attendee) => (
                <div key={attendee.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={attendee.avatar} />
                      <AvatarFallback>{attendee.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{attendee.name}</p>
                      <p className="text-sm text-slate-600">{attendee.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {attendee.role === 'organizer' && (
                      <Badge variant="secondary">Organizer</Badge>
                    )}
                    <div className="flex items-center gap-1">
                      {getStatusIcon(attendee.status)}
                      <span className="text-sm capitalize">{attendee.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Meeting Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add meeting notes here..."
              rows={6}
              className="mb-3"
            />
            <Button onClick={handleSaveNotes} disabled={savingNotes}>
              {savingNotes && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Notes
            </Button>
          </CardContent>
        </Card>

        {/* Recording */}
        {meeting.recordingUrl && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Recording
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href={meeting.recordingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-indigo-600 hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                View Recording
              </a>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Form */}
      <MeetingForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSuccess={loadMeeting}
        meeting={meeting}
        mode="edit"
      />
    </div>
  )
}
