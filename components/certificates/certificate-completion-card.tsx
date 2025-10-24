'use client'

import { useState, useEffect } from 'react'
import { Award, CheckCircle, Circle, Download, Loader2, Trophy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'

interface Lesson {
  title: string
  duration?: string
}

interface CertificateCompletionCardProps {
  courseId: number
  courseName: string
  lessons: Lesson[]
}

export function CertificateCompletionCard({ courseId, courseName, lessons }: CertificateCompletionCardProps) {
  const { data: session } = useSession()
  const [completedLessons, setCompletedLessons] = useState<number[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [certificateGenerated, setCertificateGenerated] = useState(false)
  const [certificateId, setCertificateId] = useState<string | null>(null)

  // Load progress from localStorage (temporary until WordPress backend is ready)
  useEffect(() => {
    const saved = localStorage.getItem(`course_${courseId}_progress`)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setCompletedLessons(data.completedLessons || [])
        setCertificateGenerated(data.certificateGenerated || false)
        setCertificateId(data.certificateId || null)
      } catch (e) {
        console.error('Failed to load progress:', e)
      }
    }
  }, [courseId])

  // Calculate progress
  const totalLessons = lessons.length
  const completedCount = completedLessons.length
  const progressPercent = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0
  const isComplete = completedCount === totalLessons && totalLessons > 0

  // Toggle lesson completion
  const toggleLesson = (index: number) => {
    const newCompleted = completedLessons.includes(index)
      ? completedLessons.filter(i => i !== index)
      : [...completedLessons, index].sort((a, b) => a - b)

    setCompletedLessons(newCompleted)

    // Save to localStorage
    const progress = {
      completedLessons: newCompleted,
      certificateGenerated,
      certificateId
    }
    localStorage.setItem(`course_${courseId}_progress`, JSON.stringify(progress))
  }

  // Generate certificate
  const generateCertificate = async () => {
    if (!isComplete || !session) return

    setIsGenerating(true)

    try {
      // Call API to generate certificate
      const response = await fetch('/api/certificates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId })
      })

      if (response.ok) {
        const data = await response.json()
        setCertificateGenerated(true)
        setCertificateId(data.certificateId || `CERT-${courseId}-${Date.now()}`)

        // Save to localStorage
        const progress = {
          completedLessons,
          certificateGenerated: true,
          certificateId: data.certificateId || `CERT-${courseId}-${Date.now()}`,
          generatedAt: new Date().toISOString()
        }
        localStorage.setItem(`course_${courseId}_progress`, JSON.stringify(progress))
      } else {
        alert('Failed to generate certificate. Please try again.')
      }
    } catch (error) {
      console.error('Error generating certificate:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Download certificate
  const downloadCertificate = () => {
    if (!certificateId) return

    // For now, open certificate page
    window.open(`/certificates/${certificateId}`, '_blank')
  }

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-400 rounded-2xl p-6 lg:p-8 shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-yellow-400 rounded-full p-3">
          <Trophy className="h-8 w-8 text-black" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900">Course Completion & Certificate</h3>
          <p className="text-sm text-gray-600">Complete all lessons to earn your certificate</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">
            Progress: {completedCount} of {totalLessons} lessons complete
          </span>
          <span className="text-sm font-bold text-yellow-600">
            {Math.round(progressPercent)}%
          </span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Lesson Checklist */}
      <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
        {lessons.map((lesson, index) => {
          const isCompleted = completedLessons.includes(index)

          return (
            <button
              key={index}
              onClick={() => toggleLesson(index)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                isCompleted
                  ? 'bg-green-50 border-green-400 hover:border-green-500'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              {isCompleted ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
              )}
              <div className="flex-1 text-left">
                <p className={`text-sm font-medium ${isCompleted ? 'text-green-900' : 'text-gray-900'}`}>
                  {lesson.title}
                </p>
                {lesson.duration && (
                  <p className="text-xs text-gray-500">{lesson.duration}</p>
                )}
              </div>
              {isCompleted && (
                <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  ✓ Complete
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Certificate Section */}
      <AnimatePresence mode="wait">
        {isComplete && !certificateGenerated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-green-50 to-yellow-50 border-2 border-green-400 rounded-xl p-6"
          >
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-400 rounded-full mb-3">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                🎉 Congratulations!
              </h4>
              <p className="text-sm text-gray-700">
                You've completed all lessons. Generate your certificate now!
              </p>
            </div>
            <button
              onClick={generateCertificate}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating Certificate...
                </>
              ) : (
                <>
                  <Award className="h-5 w-5" />
                  Generate Certificate
                </>
              )}
            </button>
          </motion.div>
        )}

        {certificateGenerated && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-yellow-100 to-yellow-50 border-2 border-yellow-500 rounded-xl p-6 text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full mb-4 shadow-lg">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2">
              Certificate Earned! 🏆
            </h4>
            <p className="text-sm text-gray-700 mb-1">
              Course: <span className="font-semibold">{courseName}</span>
            </p>
            <p className="text-xs text-gray-600 mb-4">
              Certificate ID: {certificateId}
            </p>
            <button
              onClick={downloadCertificate}
              className="w-full bg-black hover:bg-gray-900 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Download className="h-5 w-5" />
              Download Certificate PDF
            </button>
            <p className="text-xs text-gray-500 mt-3">
              Also available in Account → Certificates
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
