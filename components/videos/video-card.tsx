'use client'

import { Video, getVideoThumbnail, isVideoLocked, getVideoCategories2 } from '@/lib/woocommerce/videos'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, Activity, Lock, Play } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { LoginModal } from '@/components/auth/login-modal'
import { cleanHtmlText } from '@/lib/utils/html'

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
  const hasAccess = (session?.user as any)?.roles?.includes('customer') ||
                   (session?.user as any)?.roles?.includes('administrator') ||
                   (session?.user as any)?.roles?.includes('reseller') ||
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
                alt={cleanHtmlText(video.title.rendered)}
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

            {/* Lock Badge with Hover Tooltip */}
            {isLocked && !hasAccess && (
              <div className="absolute top-3 right-3 group/badge">
                <div className="relative">
                  <div className="bg-black/80 backdrop-blur-sm text-[#ffed00] px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" />
                    <span className="text-xs font-semibold">Customers only</span>
                  </div>
                  {/* Tooltip */}
                  <div className="absolute top-full right-0 mt-2 opacity-0 invisible group-hover/badge:opacity-100 group-hover/badge:visible transition-all duration-200 pointer-events-none">
                    <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                      Log in or purchase to access
                      <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            <h3
              className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-[#ffed00] transition-colors"
              dangerouslySetInnerHTML={{ __html: video.title.rendered }}
            />

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

            {/* Categories */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-medium hover:bg-[#ffed00]/20 transition-colors"
                    dangerouslySetInnerHTML={{ __html: cat.name }}
                  />
                ))}
              </div>
            )}

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
                <div className="group/cta relative inline-block">
                  <span className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Customers only
                  </span>
                  {/* Hover text */}
                  <span className="text-xs text-gray-400 opacity-0 group-hover/cta:opacity-100 transition-opacity duration-200 absolute left-0 -bottom-5 whitespace-nowrap">
                    Log in or purchase to access
                  </span>
                </div>
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
        />
      )}
    </>
  )
}