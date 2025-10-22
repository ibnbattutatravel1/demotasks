"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  FileText,
  Upload,
  Download,
  Trash2,
  Edit,
  Plus,
  Search,
  Filter,
  File,
  User as UserIcon,
  Clock,
  Pin,
  MoreVertical,
  ChevronDown,
  SortAsc,
  SortDesc,
  Calendar as CalendarIcon,
  Tag,
  RefreshCw,
  Eye,
  Star,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { formatDate, formatDateTime } from "@/lib/format-date"
import type { Project } from "@/lib/types"
import { VoiceInput } from "@/components/ui/voice-input"

interface Note {
  id: string
  projectId: string
  title: string
  content: string
  isPinned: boolean
  createdBy: {
    id: string
    name: string
    avatar?: string
    initials: string
  }
  createdAt: string
  updatedAt?: string
}

interface Document {
  id: string
  projectId: string
  name: string
  size: number
  type: string
  url: string
  uploadedBy: {
    id: string
    name: string
    avatar?: string
    initials: string
  }
  uploadedAt: string
}

export default function ProjectWorkspacePage() {
  const router = useRouter()
  const pathname = usePathname()
  const projectId = (pathname?.split('/')?.[2] as string) || ""
  const { user } = useAuth()
  const { toast } = useToast()

  const [project, setProject] = useState<Project | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [notesSearch, setNotesSearch] = useState("")
  const [docsSearch, setDocsSearch] = useState("")
  const [filterAuthor, setFilterAuthor] = useState<string>("all")
  const [filterPinned, setFilterPinned] = useState<string>("all") // all | pinned | unpinned
  const [sortBy, setSortBy] = useState<string>("recent") // recent | oldest | title
  const [filterDateRange, setFilterDateRange] = useState<string>("all") // all | today | week | month
  const [docFilterType, setDocFilterType] = useState<string>("all") // all | pdf | image | document
  
  // Pagination
  const [notesPage, setNotesPage] = useState(1)
  const [docsPage, setDocsPage] = useState(1)
  const ITEMS_PER_PAGE = 20
  
  // View options
  const [showFavorites, setShowFavorites] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Note dialog
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [noteTitle, setNoteTitle] = useState("")
  const [noteContent, setNoteContent] = useState("")

  // Upload
  const [isUploading, setIsUploading] = useState(false)

  // Check permissions
  const isAdmin = user?.role === 'admin'
  const isProjectLead = project?.ownerId === user?.id
  const hasFullControl = isAdmin || isProjectLead
  const isTeamMember = project?.team?.some((m) => m.id === user?.id)
  const hasAccess = hasFullControl || isTeamMember

  // Load project
  useEffect(() => {
    const loadProject = async () => {
      try {
        const res = await fetch('/api/projects')
        const json = await res.json()
        if (res.ok && json.success) {
          const p = (json.data || []).find((x: any) => x.id === projectId)
          setProject(p || null)
        }
      } catch (e) {
        console.error('Failed to load project', e)
      }
    }
    loadProject()
  }, [projectId])

  // Load notes and documents
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [notesRes, docsRes] = await Promise.all([
          fetch(`/api/projects/${projectId}/notes`),
          fetch(`/api/projects/${projectId}/documents`),
        ])

        const notesJson = await notesRes.json()
        const docsJson = await docsRes.json()

        if (notesRes.ok && notesJson.success) {
          setNotes(notesJson.data || [])
        }
        if (docsRes.ok && docsJson.success) {
          setDocuments(docsJson.data || [])
        }
      } catch (e) {
        console.error('Failed to load workspace data', e)
      } finally {
        setLoading(false)
      }
    }
    if (projectId) load()
  }, [projectId])

  // Handle note actions
  const handleSaveNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) {
      toast({ title: 'Error', description: 'Title and content are required', variant: 'destructive' })
      return
    }

    try {
      const method = editingNote ? 'PATCH' : 'POST'
      const url = editingNote 
        ? `/api/projects/${projectId}/notes/${editingNote.id}`
        : `/api/projects/${projectId}/notes`

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: noteTitle,
          content: noteContent,
        }),
      })

      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to save note')

      // Refresh notes
      const notesRes = await fetch(`/api/projects/${projectId}/notes`)
      const notesJson = await notesRes.json()
      if (notesRes.ok && notesJson.success) {
        setNotes(notesJson.data || [])
      }

      toast({ title: 'Success', description: editingNote ? 'Note updated' : 'Note created' })
      setShowNoteDialog(false)
      setEditingNote(null)
      setNoteTitle("")
      setNoteContent("")
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const res = await fetch(`/api/projects/${projectId}/notes/${noteId}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete note')

      setNotes((prev) => prev.filter((n) => n.id !== noteId))
      toast({ title: 'Success', description: 'Note deleted' })
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    }
  }

  const handlePinNote = async (noteId: string, isPinned: boolean) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !isPinned }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to pin note')

      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, isPinned: !isPinned } : n))
      )
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    }
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setNoteTitle(note.title)
    setNoteContent(note.content)
    setShowNoteDialog(true)
  }

  // Handle document upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append('files', file)
      })

      const res = await fetch(`/api/projects/${projectId}/documents`, {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to upload')

      // Refresh documents
      const docsRes = await fetch(`/api/projects/${projectId}/documents`)
      const docsJson = await docsRes.json()
      if (docsRes.ok && docsJson.success) {
        setDocuments(docsJson.data || [])
      }

      toast({ title: 'Success', description: 'Documents uploaded' })
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const res = await fetch(`/api/projects/${projectId}/documents/${docId}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete document')

      setDocuments((prev) => prev.filter((d) => d.id !== docId))
      toast({ title: 'Success', description: 'Document deleted' })
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    }
  }

  // Filtered and sorted data
  const filteredNotes = notes
    .filter((note) => {
      // Search filter
      const matchesSearch =
        note.title.toLowerCase().includes(notesSearch.toLowerCase()) ||
        note.content.toLowerCase().includes(notesSearch.toLowerCase())
      
      // Author filter
      const matchesAuthor = filterAuthor === 'all' || note.createdBy.id === filterAuthor
      
      // Pinned filter
      const matchesPinned = 
        filterPinned === 'all' ||
        (filterPinned === 'pinned' && note.isPinned) ||
        (filterPinned === 'unpinned' && !note.isPinned)
      
      // Date range filter
      const noteDate = new Date(note.createdAt)
      const now = new Date()
      let matchesDate = true
      
      if (filterDateRange === 'today') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        matchesDate = noteDate >= today
      } else if (filterDateRange === 'week') {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        matchesDate = noteDate >= weekAgo
      } else if (filterDateRange === 'month') {
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        matchesDate = noteDate >= monthAgo
      }
      
      return matchesSearch && matchesAuthor && matchesPinned && matchesDate
    })
    .sort((a, b) => {
      // Always show pinned first
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      
      // Then sort by selected option
      if (sortBy === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title)
      }
      return 0
    })

  const filteredDocuments = documents
    .filter((doc) => {
      // Search filter
      const matchesSearch = doc.name.toLowerCase().includes(docsSearch.toLowerCase())
      
      // Author filter
      const matchesAuthor = filterAuthor === 'all' || doc.uploadedBy.id === filterAuthor
      
      // Type filter
      let matchesType = true
      if (docFilterType === 'pdf') {
        matchesType = doc.type.includes('pdf')
      } else if (docFilterType === 'image') {
        matchesType = doc.type.includes('image')
      } else if (docFilterType === 'document') {
        matchesType = doc.type.includes('word') || doc.type.includes('document') || doc.type.includes('text')
      }
      
      return matchesSearch && matchesAuthor && matchesType
    })
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      } else if (sortBy === 'oldest') {
        return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
      } else if (sortBy === 'title') {
        return a.name.localeCompare(b.name)
      }
      return 0
    })

  // Pagination
  const paginatedNotes = filteredNotes.slice(0, notesPage * ITEMS_PER_PAGE)
  const paginatedDocuments = filteredDocuments.slice(0, docsPage * ITEMS_PER_PAGE)
  const hasMoreNotes = filteredNotes.length > paginatedNotes.length
  const hasMoreDocs = filteredDocuments.length > paginatedDocuments.length
  
  // Get unique authors
  const authors = Array.from(
    new Set([
      ...notes.map((n) => n.createdBy.id),
      ...documents.map((d) => d.uploadedBy.id),
    ])
  )
  
  // Stats
  const pinnedCount = notes.filter(n => n.isPinned).length
  const myNotesCount = notes.filter(n => n.createdBy.id === user?.id).length
  const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0)
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const canEdit = (creatorId: string) => hasFullControl || creatorId === user?.id

  if (!hasAccess && !loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
            <p className="text-slate-600">You don't have permission to access this workspace.</p>
            <Button className="mt-4" onClick={() => router.push(`/projects/${projectId}`)}>
              Back to Project
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
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/projects/${projectId}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Project
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Project Workspace</h1>
                <p className="text-sm text-slate-600">{project?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasFullControl && (
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                  {isAdmin ? 'Admin' : 'Project Lead'}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs defaultValue="notes" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="notes">
              <FileText className="h-4 w-4 mr-2" />
              Notes ({notes.length})
            </TabsTrigger>
            <TabsTrigger value="documents">
              <File className="h-4 w-4 mr-2" />
              Documents ({documents.length})
            </TabsTrigger>
          </TabsList>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-600">Total Notes</p>
                      <p className="text-2xl font-bold text-slate-900">{notes.length}</p>
                    </div>
                    <FileText className="h-8 w-8 text-indigo-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-600">Pinned</p>
                      <p className="text-2xl font-bold text-amber-600">{pinnedCount}</p>
                    </div>
                    <Pin className="h-8 w-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-600">My Notes</p>
                      <p className="text-2xl font-bold text-emerald-600">{myNotesCount}</p>
                    </div>
                    <UserIcon className="h-8 w-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-600">Showing</p>
                      <p className="text-2xl font-bold text-blue-600">{paginatedNotes.length}/{filteredNotes.length}</p>
                    </div>
                    <Eye className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Filters Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Search */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search notes..."
                      value={notesSearch}
                      onChange={(e) => setNotesSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Author Filter */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <UserIcon className="h-4 w-4 mr-2" />
                        {filterAuthor === 'all' ? 'All Authors' : authors.find(a => a === filterAuthor) ? 'Filtered' : 'Author'}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setFilterAuthor('all')}>
                        <UserIcon className="h-4 w-4 mr-2" />
                        All Authors
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {authors.map((authorId) => {
                        const note = notes.find((n) => n.createdBy.id === authorId)
                        const doc = documents.find((d) => d.uploadedBy.id === authorId)
                        const author = note?.createdBy || doc?.uploadedBy
                        if (!author) return null
                        return (
                          <DropdownMenuItem
                            key={authorId}
                            onClick={() => setFilterAuthor(authorId)}
                          >
                            <Avatar className="h-4 w-4 mr-2">
                              <AvatarImage src={author.avatar} />
                              <AvatarFallback className="text-[10px]">{author.initials}</AvatarFallback>
                            </Avatar>
                            {author.name}
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Pinned Filter */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Pin className="h-4 w-4 mr-2" />
                        {filterPinned === 'all' ? 'All' : filterPinned === 'pinned' ? 'Pinned' : 'Unpinned'}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setFilterPinned('all')}>
                        All Notes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterPinned('pinned')}>
                        <Pin className="h-4 w-4 mr-2" />
                        Pinned Only
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterPinned('unpinned')}>
                        Unpinned Only
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Date Range Filter */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {filterDateRange === 'all' ? 'All Time' : filterDateRange === 'today' ? 'Today' : filterDateRange === 'week' ? 'This Week' : 'This Month'}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setFilterDateRange('all')}>
                        All Time
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterDateRange('today')}>
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Today
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterDateRange('week')}>
                        Last 7 Days
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterDateRange('month')}>
                        Last 30 Days
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Sort */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        {sortBy === 'recent' ? <SortDesc className="h-4 w-4 mr-2" /> : <SortAsc className="h-4 w-4 mr-2" />}
                        Sort
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSortBy('recent')}>
                        <SortDesc className="h-4 w-4 mr-2" />
                        Newest First
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                        <SortAsc className="h-4 w-4 mr-2" />
                        Oldest First
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy('title')}>
                        <Tag className="h-4 w-4 mr-2" />
                        By Title (A-Z)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Reset Filters */}
                  {(notesSearch || filterAuthor !== 'all' || filterPinned !== 'all' || filterDateRange !== 'all' || sortBy !== 'recent') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setNotesSearch('')
                        setFilterAuthor('all')
                        setFilterPinned('all')
                        setFilterDateRange('all')
                        setSortBy('recent')
                        setNotesPage(1)
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing {paginatedNotes.length} of {filteredNotes.length} notes
              </p>
              <div className="flex items-center gap-2">
              </div>
              <Dialog open={showNoteDialog} onOpenChange={(open) => {
                setShowNoteDialog(open)
                if (!open) {
                  setEditingNote(null)
                  setNoteTitle("")
                  setNoteContent("")
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-indigo-500 hover:bg-indigo-600">
                    <Plus className="h-4 w-4 mr-2" />
                    New Note
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingNote ? 'Edit Note' : 'Create New Note'}</DialogTitle>
                    <DialogDescription>
                      {editingNote ? 'Update your note' : 'Add a new note to the project workspace'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Title</label>
                      <Input
                        placeholder="Note title..."
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Content</label>
                      <div className="relative mt-1">
                        <Textarea
                          placeholder="Write your note here..."
                          value={noteContent}
                          onChange={(e) => setNoteContent(e.target.value)}
                          className="min-h-[200px] pr-12"
                        />
                        <div className="absolute right-2 top-2">
                          <VoiceInput
                            onTranscript={(text) => {
                              setNoteContent(prev => prev ? `${prev}\n${text}` : text)
                            }}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Use the microphone to dictate your note</p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowNoteDialog(false)
                          setEditingNote(null)
                          setNoteTitle("")
                          setNoteContent("")
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSaveNote} className="bg-indigo-500 hover:bg-indigo-600">
                        {editingNote ? 'Update' : 'Create'} Note
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Notes Grid */}
            {loading ? (
              <div className="text-center py-12 text-slate-500">Loading notes...</div>
            ) : paginatedNotes.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No notes yet</h3>
                  <p className="text-slate-600 mb-4">
                    Start collaborating by creating your first note
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedNotes.map((note) => (
                  <Card key={note.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {note.isPinned && (
                              <Pin className="h-3 w-3 text-indigo-600" />
                            )}
                            <CardTitle className="text-base truncate">{note.title}</CardTitle>
                          </div>
                          <p className="text-xs text-slate-500">
                            {formatDateTime(note.createdAt)}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handlePinNote(note.id, note.isPinned)}>
                              <Pin className="h-4 w-4 mr-2" />
                              {note.isPinned ? 'Unpin' : 'Pin'} Note
                            </DropdownMenuItem>
                            {canEdit(note.createdBy.id) && (
                              <>
                                <DropdownMenuItem onClick={() => handleEditNote(note)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteNote(note.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-700 line-clamp-4 whitespace-pre-wrap">
                        {note.content}
                      </p>
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={note.createdBy.avatar} />
                          <AvatarFallback className="text-xs">{note.createdBy.initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-slate-600">{note.createdBy.name}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Load More Button */}
            {hasMoreNotes && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={() => setNotesPage(prev => prev + 1)}
                  variant="outline"
                  className="min-w-[200px]"
                >
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Load More Notes ({filteredNotes.length - paginatedNotes.length} remaining)
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-600">Total Files</p>
                      <p className="text-2xl font-bold text-slate-900">{documents.length}</p>
                    </div>
                    <File className="h-8 w-8 text-indigo-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-600">Total Size</p>
                      <p className="text-2xl font-bold text-emerald-600">{formatFileSize(totalSize)}</p>
                    </div>
                    <Upload className="h-8 w-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-600">My Files</p>
                      <p className="text-2xl font-bold text-blue-600">{documents.filter(d => d.uploadedBy.id === user?.id).length}</p>
                    </div>
                    <UserIcon className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-600">Showing</p>
                      <p className="text-2xl font-bold text-amber-600">{paginatedDocuments.length}/{filteredDocuments.length}</p>
                    </div>
                    <Eye className="h-8 w-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Filters Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Search */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search documents..."
                      value={docsSearch}
                      onChange={(e) => setDocsSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Type Filter */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <File className="h-4 w-4 mr-2" />
                        {docFilterType === 'all' ? 'All Types' : docFilterType === 'pdf' ? 'PDF' : docFilterType === 'image' ? 'Images' : 'Documents'}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setDocFilterType('all')}>
                        All File Types
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setDocFilterType('pdf')}>
                        <File className="h-4 w-4 mr-2" />
                        PDF Files
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDocFilterType('image')}>
                        <File className="h-4 w-4 mr-2" />
                        Images
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDocFilterType('document')}>
                        <File className="h-4 w-4 mr-2" />
                        Documents
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Sort */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        {sortBy === 'recent' ? <SortDesc className="h-4 w-4 mr-2" /> : <SortAsc className="h-4 w-4 mr-2" />}
                        Sort
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSortBy('recent')}>
                        <SortDesc className="h-4 w-4 mr-2" />
                        Newest First
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                        <SortAsc className="h-4 w-4 mr-2" />
                        Oldest First
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy('title')}>
                        <Tag className="h-4 w-4 mr-2" />
                        By Name (A-Z)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Reset Filters */}
                  {(docsSearch || docFilterType !== 'all' || sortBy !== 'recent') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDocsSearch('')
                        setDocFilterType('all')
                        setSortBy('recent')
                        setDocsPage(1)
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing {paginatedDocuments.length} of {filteredDocuments.length} documents
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="doc-upload"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => document.getElementById('doc-upload')?.click()}
                  disabled={isUploading}
                  className="bg-indigo-500 hover:bg-indigo-600"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload Files'}
                </Button>
              </div>
            </div>

            {/* Documents List */}
            {loading ? (
              <div className="text-center py-12 text-slate-500">Loading documents...</div>
            ) : paginatedDocuments.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <File className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No documents yet</h3>
                  <p className="text-slate-600 mb-4">
                    Upload documents to share with your team
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-200">
                    {paginatedDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <File className="h-8 w-8 text-indigo-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 truncate">{doc.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Avatar className="h-4 w-4">
                                <AvatarImage src={doc.uploadedBy.avatar} />
                                <AvatarFallback className="text-[10px]">
                                  {doc.uploadedBy.initials}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-slate-500">
                                {doc.uploadedBy.name}
                              </span>
                              <span className="text-xs text-slate-400">•</span>
                              <span className="text-xs text-slate-500">
                                {formatDate(doc.uploadedAt, 'short')}
                              </span>
                              <span className="text-xs text-slate-400">•</span>
                              <span className="text-xs text-slate-500">
                                {(doc.size / 1024).toFixed(1)} KB
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(doc.url, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {canEdit(doc.uploadedBy.id) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Load More Button */}
            {hasMoreDocs && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={() => setDocsPage(prev => prev + 1)}
                  variant="outline"
                  className="min-w-[200px]"
                >
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Load More Files ({filteredDocuments.length - paginatedDocuments.length} remaining)
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
