'use client'

import { Video, getVideoThumbnail, isVideoLocked, getVideoCategories2 } from '@/lib/woocommerce/videos'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, Activity, Lock, Play } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { LoginModal } from '@/components/auth/login-modal'

interface VideoCardProps {
  video: Video
}

export default function VideoCard({ video }: VideoCardProps) {
  const { data: session } = useSession()
  const [showLoginModal, setShowLoginModal] = useState(false)

  const isLocked = isVideoLocked(video)
  const thumbnail = getVideoThumbnail(video)
  const categories = getVideoCategories2(video)

  // Check if user has customer role or is admin
  const hasAccess = session?.user?.roles?.includes('customer') ||
                   session?.user?.roles?.includes('administrator') ||
                   session?.user?.roles?.includes('reseller') ||
                   !isLocked

  const handleClick = (e: React.MouseEvent) => {
    if (isLocked && !hasAccess) {
      e.preventDefault()
      setShowLoginModal(true)
    }
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 relative">
        <Link
          href={hasAccess ? `/training-videos/${video.slug}` : '#'}
          onClick={handleClick}
          className="block"
        >
          {/* Thumbnail */}
          <div className="relative aspect-video bg-gray-100 overflow-hidden">
            {thumbnail && thumbnail !== '/placeholder-video.jpg' ? (
              <Image
                src={thumbnail}
                alt={video.title.rendered}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                <Play className="h-12 w-12 text-gray-400" />
              </div>
            )}

            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {isLocked && !hasAccess ? (
                <div className="bg-black/80 backdrop-blur-sm rounded-full p-4">
                  <Lock className="h-8 w-8 text-[#ffed00]" />
                </div>
              ) : (
                <div className="bg-[#ffed00] rounded-full p-4 transform group-hover:scale-110 transition-transform">
                  <Play className="h-8 w-8 text-black ml-1" fill="currentColor" />
                </div>
              )}
            </div>

            {/* Lock Badge */}
            {isLocked && !hasAccess && (
              <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-[#ffed00] px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold">BlackBoard Customers Only</span>
              </div>
            )}

            {/* Categories */}
            {categories.length > 0 && (
              <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-medium"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-[#ffed00] transition-colors">
              {video.title.rendered}
            </h3>

            {/* Metadata */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              {video.acf?.duration && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{video.acf.duration}</span>
                </div>
              )}
              {video.acf?.exercises && (
                <div className="flex items-center gap-1.5">
                  <Activity className="h-4 w-4" />
                  <span>{video.acf.exercises} exercises</span>
                </div>
              )}
            </div>

            {/* Description */}
            {video.excerpt?.rendered && (
              <div
                className="text-sm text-gray-600 line-clamp-2"
                dangerouslySetInnerHTML={{ __html: video.excerpt.rendered }}
              />
            )}

            {/* CTA */}
            <div className="mt-4">
              {isLocked && !hasAccess ? (
                <span className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Login to watch
                </span>
              ) : (
                <span className="text-sm font-semibold text-[#ffed00] group-hover:text-black transition-colors flex items-center gap-2">
                  Watch now
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          redirectUrl="/training-videos"
        />
      )}
    </>
  )
}