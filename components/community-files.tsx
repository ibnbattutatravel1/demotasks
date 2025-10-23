'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import {
  FileText,
  Upload,
  Download,
  Trash2,
  File,
  Image,
  FileVideo,
  FileAudio,
  FileArchive,
  Calendar,
  User,
  StickyNote,
} from 'lucide-react'
import { formatDate } from '@/lib/format-date'

interface CommunityFile {
  id: string
  file_name: string
  file_path: string
  file_type: string
  file_size: number
  mime_type: string
  description?: string
  notes?: string
  uploaded_by: string
  uploader_name: string
  uploader_avatar?: string
  uploaded_at: string
}

interface CommunityFilesProps {
  communityId: string
  canUpload: boolean
}

export function CommunityFiles({ communityId, canUpload }: CommunityFilesProps) {
  const { toast } = useToast()
  const [files, setFiles] = useState<CommunityFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    description: '',
    // notes: '',  // Temporarily disabled until DB updated
  })

  useEffect(() => {
    loadFiles()
  }, [communityId])

  const loadFiles = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/communities/${communityId}/files`)
      const json = await res.json()
      if (json.success) {
        setFiles(json.data || [])
      }
    } catch (error) {
      console.error('Failed to load files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadForm({ ...uploadForm, file })
    }
  }

  const handleUpload = async () => {
    if (!uploadForm.file) {
      toast({ title: 'Error', description: 'Please select a file', variant: 'destructive' })
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', uploadForm.file)
      formData.append('description', uploadForm.description)
      // formData.append('notes', uploadForm.notes)  // Temporarily disabled

      const res = await fetch(`/api/communities/${communityId}/files`, {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()
      if (json.success) {
        toast({ title: 'Success', description: 'File uploaded successfully' })
        setDialogOpen(false)
        setUploadForm({ file: null, description: '' })
        loadFiles()
      } else {
        throw new Error(json.error)
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  const getFileIcon = (fileType: string, mimeType: string) => {
    if (fileType === 'image' || mimeType.startsWith('image/')) {
      return <Image className="h-8 w-8 text-purple-600" />
    }
    if (fileType === 'video' || mimeType.startsWith('video/')) {
      return <FileVideo className="h-8 w-8 text-blue-600" />
    }
    if (fileType === 'audio' || mimeType.startsWith('audio/')) {
      return <FileAudio className="h-8 w-8 text-green-600" />
    }
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) {
      return <FileArchive className="h-8 w-8 text-amber-600" />
    }
    return <File className="h-8 w-8 text-slate-600" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600">Loading files...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-900">Community Files</p>
                <p className="text-xs text-purple-600">
                  {files.length} file{files.length !== 1 ? 's' : ''} shared
                </p>
              </div>
            </div>
            {canUpload && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload File</DialogTitle>
                    <DialogDescription>
                      Share a file with the community.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="file">File</Label>
                      <Input
                        id="file"
                        type="file"
                        onChange={handleFileSelect}
                      />
                      {uploadForm.file && (
                        <p className="text-xs text-slate-600 mt-1">
                          {uploadForm.file.name} ({formatFileSize(uploadForm.file.size)})
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Input
                        id="description"
                        placeholder="Brief description of the file"
                        value={uploadForm.description}
                        onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                      />
                    </div>
                    <Button
                      onClick={handleUpload}
                      disabled={uploading || !uploadForm.file}
                      className="w-full"
                    >
                      {uploading ? 'Uploading...' : 'Upload File'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Files List */}
      {files.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No files yet</h3>
            <p className="text-slate-600 mb-4">
              {canUpload
                ? 'Be the first to share a file with the community'
                : 'No files have been shared in this community yet'}
            </p>
            {canUpload && (
              <Button onClick={() => setDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload First File
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {files.map((file) => (
            <Card key={file.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getFileIcon(file.file_type, file.mime_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900 truncate">{file.file_name}</h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{file.uploader_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(file.uploaded_at, 'short')}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {formatFileSize(file.file_size)}
                          </Badge>
                        </div>
                      </div>
                      <a
                        href={file.file_path}
                        download={file.file_name}
                        className="flex-shrink-0"
                      >
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>

                    {file.description && (
                      <p className="text-sm text-slate-700 mb-2">{file.description}</p>
                    )}

                    {/* Notes feature temporarily disabled until DB updated */}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
