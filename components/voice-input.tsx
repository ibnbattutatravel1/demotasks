"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Loader2, Check, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VoiceInputProps {
  onTranscript: (text: string) => void
  onRecordingComplete?: (audioBlob: Blob, duration: number) => void
  mode?: 'transcript' | 'audio' | 'both'
  maxDuration?: number
  className?: string
}

export function VoiceInput({
  onTranscript,
  onRecordingComplete,
  mode = 'transcript',
  maxDuration = 300, // 5 minutes default
  className = '',
}: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [duration, setDuration] = useState(0)
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'success' | 'error'>('idle')
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  
  const { toast } = useToast()

  // Initialize Speech Recognition (Web Speech API)
  useEffect(() => {
    if (typeof window !== 'undefined' && (mode === 'transcript' || mode === 'both')) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'ar-EG' // Arabic Egypt - يمكن تغييره

        recognition.onresult = (event: any) => {
          let finalTranscript = ''
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' '
            }
          }
          
          if (finalTranscript) {
            onTranscript(finalTranscript.trim())
          }
        }

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          if (event.error === 'not-allowed') {
            toast({
              title: 'Microphone Access Denied',
              description: 'Please allow microphone access in your browser settings',
              variant: 'destructive'
            })
          }
        }

        recognitionRef.current = recognition
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [mode, onTranscript, toast])

  const startRecording = async () => {
    try {
      setStatus('recording')
      setDuration(0)
      startTimeRef.current = Date.now()
      audioChunksRef.current = []

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Start audio recording if needed
      if (mode === 'audio' || mode === 'both') {
        const mediaRecorder = new MediaRecorder(stream)
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
        }

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          const recordDuration = Math.floor((Date.now() - startTimeRef.current) / 1000)
          
          if (onRecordingComplete) {
            onRecordingComplete(audioBlob, recordDuration)
          }
          
          stream.getTracks().forEach(track => track.stop())
        }

        mediaRecorder.start()
        mediaRecorderRef.current = mediaRecorder
      }

      // Start speech recognition if needed
      if ((mode === 'transcript' || mode === 'both') && recognitionRef.current) {
        recognitionRef.current.start()
      }

      setIsRecording(true)

      // Start duration timer
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1
          
          // Auto-stop at max duration
          if (newDuration >= maxDuration) {
            stopRecording()
          }
          
          return newDuration
        })
      }, 1000)

      toast({
        title: '🎤 Recording Started',
        description: 'Speak clearly into your microphone'
      })

    } catch (error) {
      console.error('Error starting recording:', error)
      setStatus('error')
      toast({
        title: 'Recording Failed',
        description: 'Could not access microphone. Please check permissions.',
        variant: 'destructive'
      })
    }
  }

  const stopRecording = () => {
    setIsRecording(false)
    setStatus('processing')

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    setTimeout(() => {
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2000)
    }, 500)

    toast({
      title: '✅ Recording Stopped',
      description: `Duration: ${formatDuration(duration)}`
    })
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getButtonColor = () => {
    switch (status) {
      case 'recording':
        return 'bg-red-500 hover:bg-red-600 animate-pulse'
      case 'processing':
        return 'bg-blue-500'
      case 'success':
        return 'bg-emerald-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-indigo-500 hover:bg-indigo-600'
    }
  }

  const getButtonIcon = () => {
    if (isProcessing) return <Loader2 className="h-4 w-4 animate-spin" />
    if (status === 'success') return <Check className="h-4 w-4" />
    if (status === 'error') return <AlertCircle className="h-4 w-4" />
    if (isRecording) return <Square className="h-4 w-4" />
    return <Mic className="h-4 w-4" />
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        type="button"
        size="sm"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={getButtonColor()}
      >
        {getButtonIcon()}
        {isRecording && <span className="ml-2">{formatDuration(duration)}</span>}
      </Button>
      
      {isRecording && (
        <div className="flex items-center gap-2 text-sm text-red-600 animate-pulse">
          <div className="w-2 h-2 bg-red-500 rounded-full" />
          <span className="font-medium">Recording...</span>
        </div>
      )}
    </div>
  )
}
