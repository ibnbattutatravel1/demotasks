"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Video,
  Calendar,
  Clock,
  Users,
  Plus,
  ExternalLink,
  Edit,
  Trash2,
  Check,
  X,
  Loader2,
  ArrowLeft,
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
  organizer: {
    id: string
    name: string
    avatar?: string
  }
  attendees: Array<{
    userId: string
    name: string
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

export default function MeetingsPage() {
  const router = useRouter()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming')

  useEffect(() => {
    loadMeetings()
  }, [])

  const loadMeetings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/meetings')
      const result = await response.json()

      if (result.success) {
        setMeetings(result.data || [])
      }
    } catch (error) {
      console.error('Failed to load meetings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (meetingId: string) => {
    if (!confirm('Are you sure you want to cancel this meeting?')) return

    try {
      const response = await fetch(`/api/meetings/${meetingId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        loadMeetings()
      } else {
        alert(result.error || 'Failed to cancel meeting')
      }
    } catch (error) {
      console.error('Failed to cancel meeting:', error)
      alert('Failed to cancel meeting')
    }
  }

  const handleEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting)
    setShowForm(true)
  }

  const handleRespondToMeeting = async (meetingId: string, status: 'accepted' | 'declined' | 'tentative') => {
    try {
      const response = await fetch(`/api/meetings/${meetingId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      const result = await response.json()

      if (result.success) {
        loadMeetings()
      } else {
        alert(result.error || 'Failed to respond')
      }
    } catch (error) {
      console.error('Failed to respond:', error)
      alert('Failed to respond')
    }
  }

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'zoom': return '🔵 Zoom'
      case 'google-meet': return '🎥 Google Meet'
      case 'teams': return '💼 Teams'
      default: return '📹 Video Call'
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: any = {
      scheduled: 'default',
      'in-progress': 'default',
      completed: 'secondary',
      cancelled: 'destructive',
    }

    const labels: any = {
      scheduled: 'Scheduled',
      'in-progress': 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    }

    return (
      <Badge variant={variants[status] || 'default'}>
        {labels[status] || status}
      </Badge>
    )
  }

  const filteredMeetings = meetings.filter((meeting) => {
    const now = new Date()
    const startTime = new Date(meeting.startTime)

    if (filter === 'upcoming') {
      return startTime >= now && meeting.status !== 'cancelled' && meeting.status !== 'completed'
    } else if (filter === 'past') {
      return startTime < now || meeting.status === 'completed'
    }
    return true
  })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Video className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Meetings</h1>
                  <p className="text-sm text-slate-600">Manage and join your meetings</p>
                </div>
              </div>
            </div>
            <Button onClick={() => {
              setEditingMeeting(null)
              setShowForm(true)
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-4">
            <Button
              variant={filter === 'upcoming' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('upcoming')}
            >
              Upcoming
            </Button>
            <Button
              variant={filter === 'past' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('past')}
            >
              Past
            </Button>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : filteredMeetings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Video className="h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No meetings found</h3>
              <p className="text-slate-600 mb-4">
                {filter === 'upcoming' 
                  ? "You don't have any upcoming meetings." 
                  : filter === 'past'
                  ? "You don't have any past meetings."
                  : "You don't have any meetings yet."}
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Your First Meeting
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredMeetings.map((meeting) => (
              <Card key={meeting.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{meeting.title}</CardTitle>
                        {getStatusBadge(meeting.status)}
                        <span className="text-sm text-slate-600">
                          {getMeetingTypeIcon(meeting.meetingType)}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm mb-3">{meeting.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(meeting.startTime)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700">
                          <Clock className="h-4 w-4" />
                          <span>
                            {new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {' - '}
                            {new Date(meeting.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700">
                          <Users className="h-4 w-4" />
                          <span>{meeting.attendees.length} attendee{meeting.attendees.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      {meeting.project && (
                        <div className="mt-2">
                          <Badge variant="outline" className={`bg-${meeting.project.color}-50`}>
                            📁 {meeting.project.name}
                          </Badge>
                        </div>
                      )}

                      {/* Attendees */}
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-sm text-slate-600">Attendees:</span>
                        <div className="flex -space-x-2">
                          {meeting.attendees.slice(0, 5).map((attendee) => (
                            <Avatar key={attendee.userId} className="h-8 w-8 border-2 border-white">
                              <AvatarImage src={attendee.avatar} />
                              <AvatarFallback>{attendee.name[0]}</AvatarFallback>
                            </Avatar>
                          ))}
                          {meeting.attendees.length > 5 && (
                            <div className="h-8 w-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-600">
                              +{meeting.attendees.length - 5}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      {meeting.status === 'scheduled' && (
                        <>
                          <Button size="sm" onClick={() => window.open(meeting.meetingLink, '_blank')}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Join
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(meeting)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => router.push(`/meetings/${meeting.id}`)}
                          >
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(meeting.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </>
                      )}
                      {meeting.status === 'cancelled' && (
                        <Badge variant="destructive">Cancelled</Badge>
                      )}
                      {meeting.status === 'completed' && (
                        <Badge variant="secondary">Completed</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Meeting Form Dialog */}
      <MeetingForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingMeeting(null)
        }}
        onSuccess={loadMeetings}
        meeting={editingMeeting}
        mode={editingMeeting ? 'edit' : 'create'}
      />
    </div>
  )
}
