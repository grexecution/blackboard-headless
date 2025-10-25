'use client'

import { useState, useEffect, useRef, useMemo, Fragment } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  PlayCircle, CheckCircle, Lock, Clock, FileText, Download,
  ChevronLeft, ChevronRight, Menu, X, BookOpen, Video,
  Award, AlertCircle
} from 'lucide-react'
import { Course } from '@/lib/woocommerce/courses'
import { CertificateModal } from '@/components/certificates/certificate-modal'
import { Dialog, Transition } from '@headlessui/react'

interface CourseLearnClientProps {
  course: Course
}

export function CourseLearnClient({ course: initialCourse }: CourseLearnClientProps) {
  const { data: session, status } = useSession()

  // Client-side access check - computed immediately to prevent FOUC
  const course = useMemo(() => {
    const enrolledCourseIds = (session as any)?.enrolledCourseIds || []
    const hasAccess = enrolledCourseIds.includes(initialCourse.id) || initialCourse.access?.is_free || false

    return {
      ...initialCourse,
      access: {
        ...initialCourse.access,
        has_access: hasAccess,
        reason: hasAccess ? 'enrolled' : (session ? 'not_enrolled' : 'login_required')
      }
    }
  }, [initialCourse, session])
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [completedVideos, setCompletedVideos] = useState<number[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true) // Desktop sidebar toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false) // Mobile drawer toggle
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [certificateGenerated, setCertificateGenerated] = useState(false)
  const [certificatePdfUrl, setCertificatePdfUrl] = useState<string | null>(null)
  const [hasAutoShownModal, setHasAutoShownModal] = useState(false)
  const videoRef = useRef<HTMLIFrameElement>(null)

  // Get chapters structure (with fallback to flat videos for backward compatibility)
  const chapters = course.acf?.course_chapters || []
  const videos = course.acf?.course_videos || []

  // Flatten chapters into videos array for existing functionality
  const allVideos = chapters.length > 0
    ? chapters.flatMap(chapter => chapter.videos || [])
    : videos

  useEffect(() => {
    if (course?.id) {
      const saved = localStorage.getItem(`course_${course.id}_progress`)
      if (saved) {
        const savedProgress = JSON.parse(saved)
        // Filter out invalid indices (cleanup for old data with chapter rows)
        const validProgress = savedProgress.filter((idx: number) => idx < allVideos.length)
        setCompletedVideos(validProgress)
        // Save cleaned data back
        if (validProgress.length !== savedProgress.length) {
          localStorage.setItem(`course_${course.id}_progress`, JSON.stringify(validProgress))
        }
      }
    }
  }, [course?.id, allVideos.length])

  const handleVideoComplete = () => {
    if (!course) return
    const newCompleted = [...completedVideos, currentVideoIndex]
    setCompletedVideos(newCompleted)
    localStorage.setItem(`course_${course.id}_progress`, JSON.stringify(newCompleted))

    // Check if course is now 100% complete
    const newProgress = Math.round((newCompleted.length / allVideos.length) * 100)

    // If we just hit 100%, show certificate modal immediately
    if (newProgress === 100 && !hasAutoShownModal) {
      setTimeout(() => {
        setShowCertificateModal(true)
        setHasAutoShownModal(true)
        sessionStorage.setItem(`course_${course.id}_auto_shown`, 'true')
      }, 800) // Small delay for better UX
    } else if (currentVideoIndex < allVideos.length - 1) {
      // Move to next video only if not complete
      setCurrentVideoIndex(currentVideoIndex + 1)
    }
  }

  const handleVideoIncomplete = () => {
    if (!course) return
    const newCompleted = completedVideos.filter(idx => idx !== currentVideoIndex)
    setCompletedVideos(newCompleted)
    localStorage.setItem(`course_${course.id}_progress`, JSON.stringify(newCompleted))
  }

  const handleVideoSelect = (index: number) => {
    setCurrentVideoIndex(index)
    window.scrollTo(0, 0)
  }

  const isVideoCompleted = (index: number) => completedVideos.includes(index)

  const calculateProgress = () => {
    const totalVideos = allVideos.length
    if (totalVideos === 0) return 0
    return Math.round((completedVideos.length / totalVideos) * 100)
  }

  const formatDuration = (duration?: string) => duration || ''

  const getVimeoEmbedUrl = (vimeoId: string) => {
    if (!vimeoId) return ''
    return `https://player.vimeo.com/video/${vimeoId}?title=0&byline=0&portrait=0&transparent=0&dnt=1`
  }

  const handleGenerateCertificate = async () => {
    if (!course || calculateProgress() !== 100) return

    try {
      const response = await fetch('/api/certificates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id })
      })

      if (response.ok) {
        setCertificateGenerated(true)
        // Store in localStorage
        localStorage.setItem(`course_${course.id}_certificate`, JSON.stringify({
          generated: true,
          generatedAt: new Date().toISOString()
        }))
      }
    } catch (error) {
      console.error('Error generating certificate:', error)
      alert('Failed to generate certificate. Please try again.')
    }
  }

  // Load certificate status and PDF URL
  useEffect(() => {
    if (course?.id) {
      const certData = localStorage.getItem(`course_${course.id}_certificate`)
      if (certData) {
        const data = JSON.parse(certData)
        setCertificateGenerated(data.generated || false)
        setCertificatePdfUrl(data.pdfUrl || null)
      }
    }
  }, [course?.id])

  // Auto-trigger certificate modal when 100% complete (only once per session)
  useEffect(() => {
    const progress = calculateProgress()
    if (progress === 100 && !hasAutoShownModal && !showCertificateModal) {
      const autoShownKey = `course_${course.id}_auto_shown`
      const alreadyShown = sessionStorage.getItem(autoShownKey)

      if (!alreadyShown) {
        setTimeout(() => {
          setShowCertificateModal(true)
          setHasAutoShownModal(true)
          sessionStorage.setItem(autoShownKey, 'true')
        }, 1500)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedVideos, course.id, hasAutoShownModal, showCertificateModal])

  if (!course.access?.has_access) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Required</h2>
          <p className="text-gray-600 mb-6">
            {course.access?.reason === 'login_required'
              ? 'Please log in to access this course.'
              : 'You need to purchase this course to access the content.'}
          </p>
          <Link
            href={`/courses/${course.slug}`}
            className="inline-flex items-center gap-2 bg-[#ffed00] text-black px-6 py-3 rounded-full font-semibold hover:bg-yellow-500"
          >
            View Course Details
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  const currentVideo = allVideos[currentVideoIndex]

  if (allVideos.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Videos Available</h2>
        <p className="text-gray-600 mb-6">This course doesn&apos;t have any video content yet.</p>
        <Link href="/courses" className="flex items-center gap-2 bg-[#ffed00] text-black px-6 py-3 rounded-full font-semibold hover:bg-yellow-500">
          <ChevronLeft className="h-4 w-4" />
          Back to Courses
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
        <div className="flex gap-6 py-6">
          {/* Desktop Sidebar */}
          <div className={`hidden lg:block transition-all duration-300 ${sidebarOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
            <div className="bg-white rounded-xl border overflow-hidden sticky top-6 w-80">
              <div className="p-6 border-b">
                <Link href={`/courses/${course.slug}`} className="flex items-center gap-2 text-gray-600 hover:text-black mb-4 transition-colors">
                  <ChevronLeft className="h-4 w-4" />
                  Back to Course
                </Link>
                <h2 className="text-xl font-bold mb-2">{course.title}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Video className="h-4 w-4" />
                    {allVideos.length} Videos
                  </span>
                  {course.acf?.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {course.acf.duration}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Your Progress</span>
                  <span className="text-sm text-gray-600">{calculateProgress()}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#ffed00] to-yellow-500 transition-all" style={{ width: `${calculateProgress()}%` }} />
                </div>
                <p className="text-xs text-gray-500 mt-2">{completedVideos.length} of {allVideos.length} videos completed</p>
              </div>

              <div className="p-6 max-h-[50vh] overflow-y-auto">
                <h3 className="font-semibold mb-4">Course Content</h3>
                <div className="space-y-4">
                  {chapters.length > 0 ? (
                    chapters.map((chapter, chapterIndex) => (
                      <div key={chapterIndex}>
                        {chapter.chapter_name && (
                          <div className="px-3 py-2 mb-2 bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-500 rounded">
                            <h4 className="font-bold text-sm text-gray-800">📁 {chapter.chapter_name}</h4>
                          </div>
                        )}
                        <div className="space-y-2">
                          {chapter.videos && chapter.videos.map((video) => {
                            const videoIndex = video.index - 1
                            return (
                              <button
                                key={video.index}
                                onClick={() => handleVideoSelect(videoIndex)}
                                className={`w-full text-left p-3 rounded-lg transition-all ${currentVideoIndex === videoIndex ? 'bg-[#ffed00] text-black' : 'hover:bg-gray-100'}`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`mt-0.5 ${isVideoCompleted(videoIndex) ? 'text-green-500' : currentVideoIndex === videoIndex ? 'text-black' : 'text-gray-400'}`}>
                                    {isVideoCompleted(videoIndex) ? (
                                      <CheckCircle className="h-5 w-5" />
                                    ) : (
                                      <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center">
                                        <span className="text-xs">{video.index}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`font-medium truncate ${currentVideoIndex === videoIndex ? 'text-black' : ''}`}>{video.video_title}</p>
                                    {video.video_duration && (
                                      <p className={`text-xs ${currentVideoIndex === videoIndex ? 'text-black/70' : 'text-gray-500'}`}>{formatDuration(video.video_duration)}</p>
                                    )}
                                  </div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="space-y-2">
                      {videos.map((video, index) => (
                        <button
                          key={index}
                          onClick={() => handleVideoSelect(index)}
                          className={`w-full text-left p-3 rounded-lg transition-all ${currentVideoIndex === index ? 'bg-[#ffed00] text-black' : 'hover:bg-gray-100'}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 ${isVideoCompleted(index) ? 'text-green-500' : currentVideoIndex === index ? 'text-black' : 'text-gray-400'}`}>
                              {isVideoCompleted(index) ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center">
                                  <span className="text-xs">{index + 1}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium truncate ${currentVideoIndex === index ? 'text-black' : ''}`}>{video.video_title}</p>
                              {video.video_duration && (
                                <p className={`text-xs ${currentVideoIndex === index ? 'text-black/70' : 'text-gray-500'}`}>{formatDuration(video.video_duration)}</p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Certificate Section at bottom of sidebar */}
              <div className="p-6 border-t bg-gradient-to-br from-yellow-50 to-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    <span className="font-semibold text-sm">Certificate</span>
                  </div>
                  {calculateProgress() === 100 ? (
                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      ✓ Ready
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">{calculateProgress()}%</span>
                  )}
                </div>

                <p className="text-xs text-gray-600 mb-3">
                  {calculateProgress() === 100
                    ? 'Congratulations! All videos completed.'
                    : `${completedVideos.length}/${allVideos.length} videos completed`}
                </p>

                <button
                  onClick={() => setShowCertificateModal(true)}
                  className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${
                    calculateProgress() === 100
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black shadow-md hover:shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {calculateProgress() === 100 ? 'View Certificate' : 'View Progress'}
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  {/* Desktop toggle button */}
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className={`hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${sidebarOpen ? 'text-gray-600 hover:bg-gray-100' : 'text-[#ffed00] bg-yellow-50 hover:bg-yellow-100'}`}
                  >
                    <Menu className={`h-5 w-5 transition-transform duration-300 ${sidebarOpen ? '' : 'rotate-180'}`} />
                    <span className="hidden sm:inline font-medium">{sidebarOpen ? 'Hide' : 'Show'} Menu</span>
                  </button>

                  {/* Mobile menu button */}
                  <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg text-[#ffed00] bg-yellow-50 hover:bg-yellow-100 transition-all"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="font-medium">Menu</span>
                  </button>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {currentVideoIndex > 0 && (
                        <button onClick={() => setCurrentVideoIndex(currentVideoIndex - 1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                      )}
                      {currentVideoIndex < allVideos.length - 1 && (
                        <button onClick={() => setCurrentVideoIndex(currentVideoIndex + 1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      )}
                    </div>

                    {isVideoCompleted(currentVideoIndex) ? (
                      <button onClick={handleVideoIncomplete} className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-medium hover:bg-gray-300 transition-colors text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Mark Incomplete
                      </button>
                    ) : (
                      <button onClick={handleVideoComplete} className="flex items-center gap-2 bg-[#ffed00] text-black px-4 py-2 rounded-full font-semibold hover:bg-yellow-500 transition-colors">
                        <CheckCircle className="h-4 w-4" />
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {currentVideo && (
                <div className="p-6">
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">{currentVideo.video_title}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {currentVideo.video_duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDuration(currentVideo.video_duration)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Video className="h-4 w-4" />
                        {currentVideo.vimeo_id ? 'Video Lesson' : 'Text Lesson'}
                      </span>
                      {isVideoCompleted(currentVideoIndex) && (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          Completed
                        </span>
                      )}
                    </div>
                  </div>

                  {currentVideo.vimeo_id ? (
                    <div className="mb-8">
                      <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                        <iframe
                          key={`video-${currentVideoIndex}-${currentVideo.vimeo_id}`}
                          ref={videoRef}
                          src={getVimeoEmbedUrl(currentVideo.vimeo_id)}
                          className="absolute inset-0 w-full h-full"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                          title={currentVideo.video_title}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mb-8">
                      <div className="bg-gray-100 rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium">Text-based lesson</p>
                        <p className="text-gray-500 text-sm">Read the content below</p>
                      </div>
                    </div>
                  )}

                  {currentVideo.video_description && (
                    <div className="mb-8">
                      <div
                        className="prose prose-lg max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-p:text-gray-700 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-strong:text-black prose-a:text-[#ffed00] prose-a:no-underline hover:prose-a:underline"
                        dangerouslySetInnerHTML={{ __html: currentVideo.video_description }}
                      />
                    </div>
                  )}

                  {course.acf?.course_materials && course.acf.course_materials.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold mb-4">Course Materials</h2>
                      <div className="space-y-3">
                        {course.acf.course_materials.map((material, index) => (
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

                  <div className="border-t pt-6 flex items-center justify-between">
                    {currentVideoIndex > 0 ? (
                      <button onClick={() => setCurrentVideoIndex(currentVideoIndex - 1)} className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
                        <ChevronLeft className="h-4 w-4" />
                        Previous Video
                      </button>
                    ) : <div />}

                    {currentVideoIndex < allVideos.length - 1 ? (
                      <button onClick={() => setCurrentVideoIndex(currentVideoIndex + 1)} className="flex items-center gap-2 bg-[#ffed00] text-black px-6 py-3 rounded-full font-semibold hover:bg-yellow-500 transition-colors">
                        Next Video
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <div className="text-center">
                        <p className="text-gray-600 mb-2">🎉 Course Complete!</p>
                        <Link href="/account" className="inline-flex items-center gap-2 bg-[#ffed00] text-black px-6 py-3 rounded-full font-semibold hover:bg-yellow-500">
                          Back to My Courses
                          <Award className="h-4 w-4" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        courseName={course.title}
        lessons={allVideos.map((video, index) => ({
          title: video.video_title,
          duration: video.video_duration,
          completed: completedVideos.includes(index)
        }))}
        progress={calculateProgress()}
        onGenerateCertificate={handleGenerateCertificate}
        certificateGenerated={certificateGenerated}
        certificatePdfUrl={certificatePdfUrl}
        onCertificateGenerated={(pdfUrl) => {
          setCertificatePdfUrl(pdfUrl)
          setCertificateGenerated(true)
          // Save to localStorage
          localStorage.setItem(`course_${course.id}_certificate`, JSON.stringify({
            generated: true,
            pdfUrl: pdfUrl,
            generatedAt: new Date().toISOString()
          }))
        }}
      />

      {/* Mobile Menu Drawer - Only on mobile */}
      <div className="lg:hidden">
        <Transition.Root show={mobileMenuOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={setMobileMenuOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full pr-10">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-300"
                  enterFrom="-translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-300"
                  leaveFrom="translate-x-0"
                  leaveTo="-translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-sm">
                    <div className="flex h-full flex-col bg-white shadow-xl">
                      {/* Header */}
                      <div className="p-6 border-b">
                        <div className="flex items-center justify-between mb-4">
                          <Link
                            href={`/courses/${course.slug}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Back to Course
                          </Link>
                          <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                        <h2 className="text-xl font-bold mb-2">{course.title}</h2>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Video className="h-4 w-4" />
                            {allVideos.length} Videos
                          </span>
                          {course.acf?.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {course.acf.duration}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="p-6 border-b">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold">Your Progress</span>
                          <span className="text-sm text-gray-600">{calculateProgress()}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#ffed00] to-yellow-500 transition-all" style={{ width: `${calculateProgress()}%` }} />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{completedVideos.length} of {allVideos.length} videos completed</p>
                      </div>

                      {/* Video List */}
                      <div className="flex-1 overflow-y-auto p-6">
                        <h3 className="font-semibold mb-4">Course Content</h3>
                        <div className="space-y-4">
                          {chapters.length > 0 ? (
                            chapters.map((chapter, chapterIndex) => (
                              <div key={chapterIndex}>
                                {chapter.chapter_name && (
                                  <div className="px-3 py-2 mb-2 bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-500 rounded">
                                    <h4 className="font-bold text-sm text-gray-800">📁 {chapter.chapter_name}</h4>
                                  </div>
                                )}
                                <div className="space-y-2">
                                  {chapter.videos && chapter.videos.map((video) => {
                                    const videoIndex = video.index - 1
                                    return (
                                      <button
                                        key={video.index}
                                        onClick={() => {
                                          handleVideoSelect(videoIndex)
                                          setMobileMenuOpen(false)
                                        }}
                                        className={`w-full text-left p-3 rounded-lg transition-all ${currentVideoIndex === videoIndex ? 'bg-[#ffed00] text-black' : 'hover:bg-gray-100'}`}
                                      >
                                        <div className="flex items-start gap-3">
                                          <div className={`mt-0.5 ${isVideoCompleted(videoIndex) ? 'text-green-500' : currentVideoIndex === videoIndex ? 'text-black' : 'text-gray-400'}`}>
                                            {isVideoCompleted(videoIndex) ? (
                                              <CheckCircle className="h-5 w-5" />
                                            ) : (
                                              <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center">
                                                <span className="text-xs">{video.index}</span>
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className={`font-medium truncate ${currentVideoIndex === videoIndex ? 'text-black' : ''}`}>{video.video_title}</p>
                                            {video.video_duration && (
                                              <p className={`text-xs ${currentVideoIndex === videoIndex ? 'text-black/70' : 'text-gray-500'}`}>{formatDuration(video.video_duration)}</p>
                                            )}
                                          </div>
                                        </div>
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="space-y-2">
                              {videos.map((video, index) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    handleVideoSelect(index)
                                    setMobileMenuOpen(false)
                                  }}
                                  className={`w-full text-left p-3 rounded-lg transition-all ${currentVideoIndex === index ? 'bg-[#ffed00] text-black' : 'hover:bg-gray-100'}`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`mt-0.5 ${isVideoCompleted(index) ? 'text-green-500' : currentVideoIndex === index ? 'text-black' : 'text-gray-400'}`}>
                                      {isVideoCompleted(index) ? (
                                        <CheckCircle className="h-5 w-5" />
                                      ) : (
                                        <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center">
                                          <span className="text-xs">{index + 1}</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className={`font-medium truncate ${currentVideoIndex === index ? 'text-black' : ''}`}>{video.video_title}</p>
                                      {video.video_duration && (
                                        <p className={`text-xs ${currentVideoIndex === index ? 'text-black/70' : 'text-gray-500'}`}>{formatDuration(video.video_duration)}</p>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Certificate Section */}
                      <div className="p-6 border-t bg-gradient-to-br from-yellow-50 to-white">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-yellow-600" />
                            <span className="font-semibold text-sm">Certificate</span>
                          </div>
                          {calculateProgress() === 100 ? (
                            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                              ✓ Ready
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500">{calculateProgress()}%</span>
                          )}
                        </div>

                        <p className="text-xs text-gray-600 mb-3">
                          {calculateProgress() === 100
                            ? 'Congratulations! All videos completed.'
                            : `${completedVideos.length}/${allVideos.length} videos completed`}
                        </p>

                        <button
                          onClick={() => {
                            setShowCertificateModal(true)
                            setMobileMenuOpen(false)
                          }}
                          className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${
                            calculateProgress() === 100
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black shadow-md hover:shadow-lg'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {calculateProgress() === 100 ? 'View Certificate' : 'View Progress'}
                        </button>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
          </Dialog>
        </Transition.Root>
      </div>
    </div>
  )
}
