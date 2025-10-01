"use client"

import { Mic, MicOff, Loader2 } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Button } from "./button"
import { useToast } from "./use-toast"

interface VoiceInputProps {
  onTranscript: (text: string) => void
  className?: string
}

export function VoiceInput({ onTranscript, className }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Check if browser supports Web Speech API
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      setIsSupported(!!SpeechRecognition)

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'ar-SA' // Arabic (Saudi Arabia) - يمكن تغييره

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          onTranscript(transcript)
          setIsListening(false)
        }

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
          
          let errorMessage = 'حدث خطأ في التعرف على الصوت'
          switch (event.error) {
            case 'no-speech':
              errorMessage = 'لم يتم اكتشاف صوت. حاول مرة أخرى.'
              break
            case 'audio-capture':
              errorMessage = 'لم يتم العثور على ميكروفون.'
              break
            case 'not-allowed':
              errorMessage = 'تم رفض إذن الميكروفون.'
              break
            default:
              errorMessage = `خطأ: ${event.error}`
          }
          
          toast({
            title: "خطأ في الإدخال الصوتي",
            description: errorMessage,
            variant: "destructive",
          })
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = recognition
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [onTranscript, toast])

  const toggleListening = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
        toast({
          title: "🎤 جاري الاستماع...",
          description: "تحدث الآن، سيتم تحويل كلامك إلى نص",
        })
      } catch (error) {
        console.error('Error starting recognition:', error)
        toast({
          title: "خطأ",
          description: "فشل في بدء التعرف على الصوت",
          variant: "destructive",
        })
      }
    }
  }

  if (!isSupported) {
    return null // Don't show button if not supported
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={toggleListening}
      className={`${className} ${isListening ? 'text-red-500 hover:text-red-600 animate-pulse' : 'text-slate-500 hover:text-slate-700'}`}
      title={isListening ? "إيقاف التسجيل" : "ابدأ التسجيل الصوتي"}
    >
      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </Button>
  )
}
