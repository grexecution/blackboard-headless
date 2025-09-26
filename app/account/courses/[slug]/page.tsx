'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  PlayCircle, CheckCircle, Lock, Clock, FileText, Download,
  ChevronLeft, ChevronRight, Menu, X, BookOpen, Video,
  Award, AlertCircle, Loader2, BarChart3, Calendar
} from 'lucide-react'
import { getCourseBySlug, markLessonComplete, getVimeoEmbedUrl, formatDuration, checkCourseAccess, type Course, type Lesson } from '@/lib/lms/api'

interface CoursePageProps {
  params: { slug: string }
}

export default function CoursePage({ params }: CoursePageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [completedLessons, setCompletedLessons] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const videoRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // Comment out for demo - normally require auth
    // if (status === 'unauthenticated') {
    //   router.push(`/login?redirect=/account/courses/${params.slug}`)
    // }
  }, [status, router, params.slug])

  useEffect(() => {
    fetchCourseData()
  }, [session, params.slug])

  const fetchCourseData = async () => {
    try {
      setLoading(true)

      // Fetch course by slug
      const courseData = await getCourseBySlug(params.slug, session?.user?.token)

      if (courseData) {
        setCourse(courseData)

        // Check access - for demo, use the course's has_access property
        if (session?.user?.token) {
          const access = await checkCourseAccess(courseData.id, session.user.token)
          setHasAccess(access)
        } else {
          // For demo without auth
          setHasAccess(courseData.has_access || false)
        }

        // Set first lesson as current
        if (courseData.lessons && courseData.lessons.length > 0) {
          setCurrentLesson(courseData.lessons[0])
        }

        // Load completed lessons - for demo, use lesson.completed property
        const completed = courseData.lessons
          ?.filter(l => l.completed)
          ?.map(l => l.id) || []
        setCompletedLessons(completed)
      }
    } catch (error) {
      console.error('Error fetching course:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLessonComplete = async () => {
    if (!currentLesson || !session?.user?.token) return

    const success = await markLessonComplete(currentLesson.id, session.user.token)

    if (success) {
      setCompletedLessons([...completedLessons, currentLesson.id])

      // Auto-advance to next lesson
      const currentIndex = course?.lessons.findIndex(l => l.id === currentLesson.id) || 0
      if (course && currentIndex < course.lessons.length - 1) {
        setCurrentLesson(course.lessons[currentIndex + 1])
      }
    }
  }

  const handleLessonSelect = (lesson: Lesson) => {
    setCurrentLesson(lesson)
    // Scroll to top on mobile
    window.scrollTo(0, 0)
  }

  const isLessonCompleted = (lessonId: number) => {
    return completedLessons.includes(lessonId)
  }

  const calculateProgress = () => {
    if (!course) return 0
    return Math.round((completedLessons.length / course.lessons.length) * 100)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#ffed00]" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
        <p className="text-gray-600 mb-6">The course you're looking for doesn't exist.</p>
        <Link
          href="/account/courses"
          className="flex items-center gap-2 bg-[#ffed00] text-black px-6 py-3 rounded-full font-semibold hover:bg-yellow-500"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Courses
        </Link>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Required</h2>
          <p className="text-gray-600 mb-6">
            You need to purchase a product to access this course.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-[#ffed00] text-black px-6 py-3 rounded-full font-semibold hover:bg-yellow-500"
          >
            Browse Products
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <div className={`hidden lg:block ${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300`}>
        <div className="h-full bg-white border-r overflow-y-auto">
          {/* Course Header */}
          <div className="p-6 border-b">
            <Link
              href="/account/courses"
              className="flex items-center gap-2 text-gray-600 hover:text-black mb-4 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Courses
            </Link>
            <h2 className="text-xl font-bold mb-2">{course.title}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Video className="h-4 w-4" />
                {course.lessons.length} Lessons
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {course.acf?.course_duration}
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Your Progress</span>
              <span className="text-sm text-gray-600">{calculateProgress()}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#ffed00] to-yellow-500 transition-all"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {completedLessons.length} of {course.lessons.length} lessons completed
            </p>
          </div>

          {/* Lessons List */}
          <div className="p-6">
            <h3 className="font-semibold mb-4">Course Content</h3>
            <div className="space-y-2">
              {course.lessons.map((lesson, index) => (
                <button
                  key={lesson.id}
                  onClick={() => handleLessonSelect(lesson)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    currentLesson?.id === lesson.id
                      ? 'bg-[#ffed00] text-black'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${
                      isLessonCompleted(lesson.id)
                        ? 'text-green-500'
                        : currentLesson?.id === lesson.id
                        ? 'text-black'
                        : 'text-gray-400'
                    }`}>
                      {isLessonCompleted(lesson.id) ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center">
                          <span className="text-xs">{index + 1}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${
                        currentLesson?.id === lesson.id ? 'text-black' : ''
                      }`}>
                        {lesson.title}
                      </p>
                      <p className={`text-xs ${
                        currentLesson?.id === lesson.id ? 'text-black/70' : 'text-gray-500'
                      }`}>
                        {formatDuration(lesson.acf?.video_duration || '')}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <div className="w-80 h-full bg-white" onClick={(e) => e.stopPropagation()}>
            {/* Same content as desktop sidebar */}
            <div className="h-full overflow-y-auto">
              {/* Course Header */}
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold">{course.title}</h2>
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Progress */}
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Your Progress</span>
                  <span className="text-sm text-gray-600">{calculateProgress()}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#ffed00] to-yellow-500 transition-all"
                    style={{ width: `${calculateProgress()}%` }}
                  />
                </div>
              </div>

              {/* Lessons List */}
              <div className="p-6">
                <h3 className="font-semibold mb-4">Course Content</h3>
                <div className="space-y-2">
                  {course.lessons.map((lesson, index) => (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        handleLessonSelect(lesson)
                        setSidebarOpen(false)
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        currentLesson?.id === lesson.id
                          ? 'bg-[#ffed00] text-black'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 ${
                          isLessonCompleted(lesson.id)
                            ? 'text-green-500'
                            : currentLesson?.id === lesson.id
                            ? 'text-black'
                            : 'text-gray-400'
                        }`}>
                          {isLessonCompleted(lesson.id) ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center">
                              <span className="text-xs">{index + 1}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${
                            currentLesson?.id === lesson.id ? 'text-black' : ''
                          }`}>
                            {lesson.title}
                          </p>
                          <p className={`text-xs ${
                            currentLesson?.id === lesson.id ? 'text-black/70' : 'text-gray-500'
                          }`}>
                            {formatDuration(lesson.acf?.video_duration || '')}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Bar */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
            >
              <Menu className="h-5 w-5" />
              <span className="hidden sm:inline">Course Menu</span>
            </button>

            <div className="flex items-center gap-4">
              {/* Previous/Next Navigation */}
              <div className="flex items-center gap-2">
                {currentLesson && course.lessons.indexOf(currentLesson) > 0 && (
                  <button
                    onClick={() => {
                      const prevIndex = course.lessons.indexOf(currentLesson) - 1
                      setCurrentLesson(course.lessons[prevIndex])
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}
                {currentLesson && course.lessons.indexOf(currentLesson) < course.lessons.length - 1 && (
                  <button
                    onClick={() => {
                      const nextIndex = course.lessons.indexOf(currentLesson) + 1
                      setCurrentLesson(course.lessons[nextIndex])
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Complete Button */}
              {currentLesson && !isLessonCompleted(currentLesson.id) && (
                <button
                  onClick={handleLessonComplete}
                  className="flex items-center gap-2 bg-[#ffed00] text-black px-4 py-2 rounded-full font-semibold hover:bg-yellow-500 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark Complete
                </button>
              )}
            </div>
          </div>
        </div>

        {currentLesson ? (
          <div className="p-6">
            {/* Lesson Title */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">{currentLesson.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDuration(currentLesson.acf?.video_duration || '')}
                </span>
                <span className="flex items-center gap-1">
                  <Video className="h-4 w-4" />
                  {currentLesson.acf?.lesson_type || 'Video'}
                </span>
                {isLessonCompleted(currentLesson.id) && (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Completed
                  </span>
                )}
              </div>
            </div>

            {/* Video Player */}
            {currentLesson.acf?.vimeo_video_id && (
              <div className="mb-8">
                <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                  <iframe
                    ref={videoRef}
                    src={getVimeoEmbedUrl(currentLesson.acf.vimeo_video_id)}
                    className="absolute inset-0 w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Written Content */}
            {currentLesson.acf?.written_content && (
              <div className="mb-8">
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentLesson.acf.written_content }}
                />
              </div>
            )}

            {/* Exercise Instructions */}
            {currentLesson.acf?.exercise_instructions && currentLesson.acf.exercise_instructions.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Exercises</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {currentLesson.acf.exercise_instructions.map((exercise, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-6">
                      <h3 className="font-bold text-lg mb-2">{exercise.exercise_title}</h3>
                      <p className="text-gray-600 mb-3">{exercise.exercise_description}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{exercise.exercise_duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lesson Materials */}
            {currentLesson.acf?.lesson_materials && currentLesson.acf.lesson_materials.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Lesson Materials</h2>
                <div className="space-y-3">
                  {currentLesson.acf.lesson_materials.map((material, index) => (
                    <a
                      key={index}
                      href={material.material_file?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-white p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <FileText className="h-5 w-5 text-gray-400" />
                      <span className="flex-1 font-medium">{material.material_title}</span>
                      <Download className="h-5 w-5 text-gray-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Footer */}
            <div className="border-t pt-6 flex items-center justify-between">
              {course.lessons.indexOf(currentLesson) > 0 ? (
                <button
                  onClick={() => {
                    const prevIndex = course.lessons.indexOf(currentLesson) - 1
                    setCurrentLesson(course.lessons[prevIndex])
                  }}
                  className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous Lesson
                </button>
              ) : (
                <div />
              )}

              {course.lessons.indexOf(currentLesson) < course.lessons.length - 1 ? (
                <button
                  onClick={() => {
                    const nextIndex = course.lessons.indexOf(currentLesson) + 1
                    setCurrentLesson(course.lessons[nextIndex])
                  }}
                  className="flex items-center gap-2 bg-[#ffed00] text-black px-6 py-3 rounded-full font-semibold hover:bg-yellow-500 transition-colors"
                >
                  Next Lesson
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 mb-2">🎉 Course Complete!</p>
                  <Link
                    href="/account/courses"
                    className="inline-flex items-center gap-2 bg-[#ffed00] text-black px-6 py-3 rounded-full font-semibold hover:bg-yellow-500"
                  >
                    Back to Courses
                    <Award className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Select a lesson from the menu to begin</p>
          </div>
        )}
      </div>
    </div>
  )
}