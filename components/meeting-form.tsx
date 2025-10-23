"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Video, Calendar, Clock, Users, Link as LinkIcon, Loader2 } from "lucide-react"
import { MultiSelect } from "@/components/ui/multi-select"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface Project {
  id: string
  name: string
  color: string
}

interface MeetingFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  meeting?: any // For editing existing meeting
  mode?: 'create' | 'edit'
}

export function MeetingForm({ isOpen, onClose, onSuccess, meeting, mode = 'create' }: MeetingFormProps) {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meetingLink: '',
    meetingType: 'zoom',
    startTime: '',
    endTime: '',
    timezone: 'UTC',
    projectId: '',
    agenda: '',
    reminderMinutes: 15,
    attendeeIds: [] as string[],
  })

  useEffect(() => {
    if (isOpen) {
      loadData()
      if (meeting && mode === 'edit') {
        setFormData({
          title: meeting.title || '',
          description: meeting.description || '',
          meetingLink: meeting.meetingLink || '',
          meetingType: meeting.meetingType || 'zoom',
          startTime: meeting.startTime ? new Date(meeting.startTime).toISOString().slice(0, 16) : '',
          endTime: meeting.endTime ? new Date(meeting.endTime).toISOString().slice(0, 16) : '',
          timezone: meeting.timezone || 'UTC',
          projectId: meeting.projectId || '',
          agenda: meeting.agenda || '',
          reminderMinutes: meeting.reminderMinutes || 15,
          attendeeIds: meeting.attendees?.map((a: any) => a.userId) || [],
        })
      } else {
        // Reset form for create mode
        setFormData({
          title: '',
          description: '',
          meetingLink: '',
          meetingType: 'zoom',
          startTime: '',
          endTime: '',
          timezone: 'UTC',
          projectId: '',
          agenda: '',
          reminderMinutes: 15,
          attendeeIds: [],
        })
      }
    }
  }, [isOpen, meeting, mode])

  const loadData = async () => {
    try {
      const [usersRes, projectsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/projects'),
      ])
      
      const usersData = await usersRes.json()
      const projectsData = await projectsRes.json()
      
      if (usersData.success) setUsers(usersData.data || [])
      if (projectsData.success) setProjects(projectsData.data || [])
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Convert datetime-local to ISO timestamps
      const startTime = new Date(formData.startTime).toISOString()
      const endTime = new Date(formData.endTime).toISOString()

      const payload = {
        ...formData,
        startTime,
        endTime,
        projectId: formData.projectId || null,
        agenda: formData.agenda || null,
      }

      const url = mode === 'edit' && meeting ? `/api/meetings/${meeting.id}` : '/api/meetings'
      const method = mode === 'edit' ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        onSuccess()
        onClose()
      } else {
        alert(result.error || 'Failed to save meeting')
      }
    } catch (error) {
      console.error('Error saving meeting:', error)
      alert('Failed to save meeting')
    } finally {
      setLoading(false)
    }
  }

  const userOptions = users.map(u => ({ value: u.id, label: u.name }))

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-indigo-600" />
            {mode === 'edit' ? 'Edit Meeting' : 'Schedule New Meeting'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit' 
              ? 'Update meeting details and attendees will be notified.' 
              : 'Create a new meeting and invite participants.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Weekly Team Sync"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What will be discussed in this meeting?"
              rows={3}
              required
            />
          </div>

          {/* Meeting Link */}
          <div className="space-y-2">
            <Label htmlFor="meetingLink" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Meeting Link *
            </Label>
            <Input
              id="meetingLink"
              type="url"
              value={formData.meetingLink}
              onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
              placeholder="https://zoom.us/j/123456789"
              required
            />
          </div>

          {/* Meeting Type */}
          <div className="space-y-2">
            <Label htmlFor="meetingType">Meeting Platform</Label>
            <Select
              value={formData.meetingType}
              onValueChange={(value) => setFormData({ ...formData, meetingType: value })}
            >
              <SelectTrigger id="meetingType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zoom">🔵 Zoom</SelectItem>
                <SelectItem value="google-meet">🎥 Google Meet</SelectItem>
                <SelectItem value="teams">💼 Microsoft Teams</SelectItem>
                <SelectItem value="other">📹 Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Start Time *
              </Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                End Time *
              </Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={formData.timezone}
              onValueChange={(value) => setFormData({ ...formData, timezone: value })}
            >
              <SelectTrigger id="timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="UTC">🌍 UTC (Greenwich Mean Time)</SelectItem>
                <SelectItem value="America/New_York">🇺🇸 Eastern Time (ET)</SelectItem>
                <SelectItem value="America/Chicago">🇺🇸 Central Time (CT)</SelectItem>
                <SelectItem value="America/Denver">🇺🇸 Mountain Time (MT)</SelectItem>
                <SelectItem value="America/Los_Angeles">🇺🇸 Pacific Time (PT)</SelectItem>
                <SelectItem value="Europe/London">🇬🇧 London (GMT/BST)</SelectItem>
                <SelectItem value="Europe/Paris">🇫🇷 Paris (CET/CEST)</SelectItem>
                <SelectItem value="Europe/Berlin">🇩🇪 Berlin (CET/CEST)</SelectItem>
                <SelectItem value="Europe/Rome">🇮🇹 Rome (CET/CEST)</SelectItem>
                <SelectItem value="Europe/Moscow">🇷🇺 Moscow (MSK)</SelectItem>
                <SelectItem value="Asia/Dubai">🇦🇪 Dubai (GST)</SelectItem>
                <SelectItem value="Asia/Riyadh">🇸🇦 Riyadh (AST)</SelectItem>
                <SelectItem value="Asia/Kuwait">🇰🇼 Kuwait (AST)</SelectItem>
                <SelectItem value="Asia/Bahrain">🇧🇭 Bahrain (AST)</SelectItem>
                <SelectItem value="Asia/Qatar">🇶🇦 Qatar (AST)</SelectItem>
                <SelectItem value="Asia/Kolkata">🇮🇳 India (IST)</SelectItem>
                <SelectItem value="Asia/Shanghai">🇨🇳 China (CST)</SelectItem>
                <SelectItem value="Asia/Tokyo">🇯🇵 Tokyo (JST)</SelectItem>
                <SelectItem value="Asia/Seoul">🇰🇷 Seoul (KST)</SelectItem>
                <SelectItem value="Asia/Singapore">🇸🇬 Singapore (SGT)</SelectItem>
                <SelectItem value="Australia/Sydney">🇦🇺 Sydney (AEDT/AEST)</SelectItem>
                <SelectItem value="Pacific/Auckland">🇳🇿 Auckland (NZDT/NZST)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Attendees */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Attendees * (Select participants)
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (formData.attendeeIds.length === users.length) {
                    // Deselect all
                    setFormData({ ...formData, attendeeIds: [] })
                  } else {
                    // Select all
                    setFormData({ ...formData, attendeeIds: users.map(u => u.id) })
                  }
                }}
              >
                {formData.attendeeIds.length === users.length ? 'Deselect All' : 'Select All Users'}
              </Button>
            </div>
            <MultiSelect
              options={userOptions}
              selected={formData.attendeeIds}
              onChange={(selected: string[]) => setFormData({ ...formData, attendeeIds: selected })}
              placeholder="Select attendees..."
            />
            <p className="text-xs text-muted-foreground">
              {formData.attendeeIds.length} of {users.length} user(s) selected
            </p>
          </div>

          {/* Project Association */}
          <div className="space-y-2">
            <Label htmlFor="projectId">Link to Project (Optional)</Label>
            <Select
              value={formData.projectId}
              onValueChange={(value) => setFormData({ ...formData, projectId: value })}
            >
              <SelectTrigger id="projectId">
                <SelectValue placeholder="No project selected" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Agenda */}
          <div className="space-y-2">
            <Label htmlFor="agenda">Agenda (Optional)</Label>
            <Textarea
              id="agenda"
              value={formData.agenda}
              onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
              placeholder="Meeting agenda and topics to discuss..."
              rows={3}
            />
          </div>

          {/* Reminder */}
          <div className="space-y-2">
            <Label htmlFor="reminderMinutes">Reminder Before Meeting</Label>
            <Select
              value={String(formData.reminderMinutes)}
              onValueChange={(value) => setFormData({ ...formData, reminderMinutes: Number(value) })}
            >
              <SelectTrigger id="reminderMinutes">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes before</SelectItem>
                <SelectItem value="15">15 minutes before</SelectItem>
                <SelectItem value="30">30 minutes before</SelectItem>
                <SelectItem value="60">1 hour before</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'edit' ? 'Update Meeting' : 'Schedule Meeting'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
