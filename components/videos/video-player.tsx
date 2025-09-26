'use client'

import { Video, VideoItem, isVideoLocked } from '@/lib/woocommerce/videos'
import { useState } from 'react'
import { Play, ChevronDown, ChevronUp, Clock, Activity, Target, Package, Lock } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { LoginModal } from '@/components/auth/login-modal'

interface VideoPlayerProps {
  video: Video
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const [expandedDescriptions, setExpandedDescriptions] = useState<{ [key: number]: boolean }>({})
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { data: session } = useSession()

  const isLocked = isVideoLocked(video)
  const hasAccess = session?.user?.roles?.includes('customer') ||
                   session?.user?.roles?.includes('administrator') ||
                   session?.user?.roles?.includes('reseller') ||
                   !isLocked

  const toggleDescription = (index: number) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  // Show locked content if no access
  if (isLocked && !hasAccess) {
    return (
      <>
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-[#ffed00]/10 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Lock className="h-12 w-12 text-[#ffed00]" />
            </div>
            <h2 className="text-2xl font-bold mb-4">
              BlackBoard Customers Only
            </h2>
            <p className="text-gray-600 mb-8">
              This training video is exclusive to BlackBoard customers.
              Please log in with your customer account to access this content.
            </p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="inline-flex items-center justify-center gap-2 bg-[#ffed00] text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-[#ffed00]/90 transition-all"
            >
              Login to Watch
            </button>
          </div>
        </div>
        {showLoginModal && (
          <LoginModal
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)}
            redirectUrl={`/training-videos/${video.slug}`}
          />
        )}
      </>
    )
  }

  if (!video.acf?.videos || video.acf.videos.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
        <Play className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No videos available</h3>
        <p className="text-gray-500">This training doesn&apos;t have any video content yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {video.acf.videos.map((item: VideoItem, index: number) => (
        <div key={index} className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Video Player */}
            <div className="bg-black aspect-video lg:aspect-auto">
              {item.vimeo_video_id ? (
                <div className="relative w-full h-full min-h-[400px]">
                  <iframe
                    src={`https://player.vimeo.com/video/${item.vimeo_video_id}?title=0&byline=0&portrait=0`}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[400px] bg-gray-900">
                  <div className="text-center">
                    <Play className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">Video not available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Info */}
            <div className="p-8 lg:p-10">
              <h2 className="text-2xl lg:text-3xl font-bold mb-6">{item.title}</h2>

              {/* Short Description */}
              {item.short_description && (
                <div className="mb-6">
                  <div className={`prose prose-gray max-w-none ${!expandedDescriptions[index] ? 'line-clamp-3' : ''}`}>
                    <p className="text-gray-600">{item.short_description}</p>
                  </div>
                  {item.short_description.length > 150 && (
                    <button
                      onClick={() => toggleDescription(index)}
                      className="mt-2 text-[#ffed00] font-semibold text-sm flex items-center gap-1 hover:text-black transition-colors"
                    >
                      {expandedDescriptions[index] ? (
                        <>
                          Show less
                          <ChevronUp className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Continue reading
                          <ChevronDown className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4">
                {item.seconds_per_page && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-[#ffed00] mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Duration</p>
                      <p className="text-sm font-semibold">{item.seconds_per_page}</p>
                    </div>
                  </div>
                )}

                {item.body_area && (
                  <div className="flex items-start gap-3">
                    <Activity className="h-5 w-5 text-[#ffed00] mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Body Area</p>
                      <p className="text-sm font-semibold">{item.body_area}</p>
                    </div>
                  </div>
                )}

                {item.training_goal && (
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-[#ffed00] mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Training Goal</p>
                      <p className="text-sm font-semibold">{item.training_goal}</p>
                    </div>
                  </div>
                )}

                {item.product && (
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-[#ffed00] mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Required Product</p>
                      <p className="text-sm font-semibold">BlackBoard</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Full Description */}
              {item.description && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold mb-3">About this exercise</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}