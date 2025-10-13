'use client'

import { useState } from 'react'
import { Course, isCourseLocked } from '@/lib/woocommerce/courses'
import { useSession } from 'next-auth/react'
import { LoginModal } from '@/components/auth/login-modal'
import { Lock, PlayCircle, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface CoursePlayerProps {
  course: Course
}

export default function CoursePlayer({ course }: CoursePlayerProps) {
  const { data: session, status } = useSession()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)

  const isLocked = isCourseLocked(course)
  const videos = course.acf?.course_videos || []
  const currentVideo = videos[currentVideoIndex]

  // Check if user has customer role or is admin
  const hasAccess = (session?.user as any)?.roles?.includes('customer') ||
                   (session?.user as any)?.roles?.includes('administrator') ||
                   (session?.user as any)?.roles?.includes('reseller') ||
                   !isLocked

  // Show loading state while checking auth
  if (status === 'loading') {
    return (
      <div className="bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffed00] mx-auto"></div>
          <p className="text-white mt-4">Loading course...</p>
        </div>
      </div>
    )
  }

  // Show locked state if no access
  if (isLocked && !hasAccess) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden">
        <div className="aspect-video flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="bg-black/50 backdrop-blur rounded-full p-6 mx-auto w-fit mb-6">
              <Lock className="h-16 w-16 text-[#ffed00]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Course Locked
            </h3>
            <p className="text-gray-300 mb-6">
              Purchase this course to access all video lessons, materials, and receive your certificate upon completion.
            </p>

            {course.acf?.product_data ? (
              <div className="space-y-3">
                <div className="text-center mb-4">
                  {course.acf.product_data.on_sale && course.acf.product_data.regular_price && (
                    <span className="text-gray-400 line-through text-lg mr-2">
                      R{course.acf.product_data.regular_price}
                    </span>
                  )}
                  <span className="text-3xl font-bold text-[#ffed00]">
                    R{course.acf.product_data.price}
                  </span>
                </div>
                <Link
                  href={`/shop/product/${course.acf.product_data.id}`}
                  className="inline-block bg-[#ffed00] text-black px-8 py-3 rounded-lg font-semibold hover:bg-[#ffed00]/90 transition-colors"
                >
                  Purchase Course
                </Link>
                {!session && (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="block w-full text-gray-300 hover:text-white transition-colors"
                  >
                    Already purchased? <span className="underline">Log in</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="inline-block bg-[#ffed00] text-black px-8 py-3 rounded-lg font-semibold hover:bg-[#ffed00]/90 transition-colors"
              >
                Log in to Access
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Show course preview if no videos
  if (videos.length === 0) {
    return (
      <div className="bg-gradient-to-br from-[#ffed00] to-[#ffd700] rounded-xl overflow-hidden">
        <div className="aspect-video flex items-center justify-center p-8">
          <div className="text-center">
            <PlayCircle className="h-20 w-20 text-black/20 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-black mb-2">
              Course Content Coming Soon
            </h3>
            <p className="text-black/70">
              Video lessons will be available here once they are uploaded.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show video player
  return (
    <div className="space-y-4">
      {/* Main Video Player */}
      <div className="bg-black rounded-xl overflow-hidden">
        <div className="aspect-video relative">
          {currentVideo && currentVideo.vimeo_id ? (
            <iframe
              src={`https://player.vimeo.com/video/${currentVideo.vimeo_id}?h=0&badge=0&autopause=0&player_id=0&app_id=58479`}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={currentVideo.video_title}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <p className="text-gray-400">Video not available</p>
            </div>
          )}
        </div>

        {/* Current Video Info */}
        {currentVideo && (
          <div className="p-4 bg-gray-900 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#ffed00] text-sm font-medium mb-1">
                  Lesson {currentVideoIndex + 1} of {videos.length}
                </p>
                <h3 className="text-white text-lg font-semibold">
                  {currentVideo.video_title}
                </h3>
                {currentVideo.video_duration && (
                  <p className="text-gray-400 text-sm mt-1">
                    Duration: {currentVideo.video_duration}
                  </p>
                )}
              </div>
              {currentVideoIndex < videos.length - 1 && (
                <button
                  onClick={() => setCurrentVideoIndex(currentVideoIndex + 1)}
                  className="flex items-center gap-2 bg-[#ffed00] text-black px-4 py-2 rounded-lg font-medium hover:bg-[#ffed00]/90 transition-colors"
                >
                  Next Lesson
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
            {currentVideo.video_description && (
              <p className="text-gray-300 text-sm mt-3">
                {currentVideo.video_description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Video Playlist */}
      {videos.length > 1 && (
        <div className="bg-white rounded-xl p-4">
          <h3 className="font-bold text-lg mb-3">Course Lessons</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {videos.map((video, index) => (
              <button
                key={index}
                onClick={() => setCurrentVideoIndex(index)}
                className={`w-full text-left flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  index === currentVideoIndex
                    ? 'bg-[#ffed00] text-black'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === currentVideoIndex
                      ? 'bg-black text-[#ffed00]'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${
                    index === currentVideoIndex ? 'text-black' : 'text-gray-900'
                  }`}>
                    {video.video_title}
                  </p>
                  {video.video_duration && (
                    <p className={`text-sm ${
                      index === currentVideoIndex ? 'text-black/70' : 'text-gray-500'
                    }`}>
                      {video.video_duration}
                    </p>
                  )}
                </div>
                {index === currentVideoIndex && (
                  <PlayCircle className="h-5 w-5 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  )
}