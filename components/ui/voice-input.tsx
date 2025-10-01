"use client"

import { Mic, MicOff } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Button } from "./button"
import { useToast } from "./use-toast"

interface VoiceInputProps {
  onTranscript: (text: string) => void
  className?: string
  lang?: string // BCP-47 speech recognition locale e.g. "en-US", "ar-SA"
}

export function VoiceInput({ onTranscript, className, lang }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<any>(null)
  const { toast } = useToast()
  const selectedLang = (lang && typeof lang === 'string' ? lang : (typeof navigator !== 'undefined' ? navigator.language : 'en-US')) || 'en-US'

  // Simple i18n messages based on selected language (ar vs default en)
  const isArabic = selectedLang?.toLowerCase().startsWith('ar')
  const t = {
    listeningTitle: isArabic ? "🎤 جاري الاستماع..." : "🎤 Listening...",
    listeningDesc: isArabic ? "تحدث الآن، سيتم تحويل كلامك إلى نص" : "Speak now, your speech will be transcribed",
    startErrorTitle: isArabic ? "خطأ" : "Error",
    startErrorDesc: isArabic ? "فشل في بدء التعرف على الصوت" : "Failed to start voice recognition",
    errTitle: isArabic ? "خطأ في الإدخال الصوتي" : "Voice input error",
    errNoSpeech: isArabic ? "لم يتم اكتشاف صوت. حاول مرة أخرى." : "No speech detected. Please try again.",
    errNoMic: isArabic ? "لم يتم العثور على ميكروفون." : "No microphone was found.",
    errDenied: isArabic ? "تم رفض إذن الميكروفون." : "Microphone permission was denied.",
    errGeneric: (code: string) => isArabic ? `خطأ: ${code}` : `Error: ${code}`,
    btnTitleStart: isArabic ? "ابدأ التسجيل الصوتي" : "Start voice input",
    btnTitleStop: isArabic ? "إيقاف التسجيل" : "Stop voice input",
  }

  useEffect(() => {
    // Check if browser supports Web Speech API
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      setIsSupported(!!SpeechRecognition)

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = selectedLang

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          onTranscript(transcript)
          setIsListening(false)
        }

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
          
          let errorMessage = t.errGeneric(event.error)
          switch (event.error) {
            case 'no-speech':
              errorMessage = t.errNoSpeech
              break
            case 'audio-capture':
              errorMessage = t.errNoMic
              break
            case 'not-allowed':
              errorMessage = t.errDenied
              break
            default:
              errorMessage = t.errGeneric(event.error)
          }
          
          toast({
            title: t.errTitle,
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
          title: t.listeningTitle,
          description: t.listeningDesc,
        })
      } catch (error) {
        console.error('Error starting recognition:', error)
        toast({
          title: t.startErrorTitle,
          description: t.startErrorDesc,
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
      title={isListening ? t.btnTitleStop : t.btnTitleStart}
    >
      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </Button>
  )
}
