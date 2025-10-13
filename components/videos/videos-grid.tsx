'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Video } from '@/lib/woocommerce/videos'
import VideoCard from './video-card'
import { Play, Loader2 } from 'lucide-react'

interface VideosGridProps {
  initialVideos: Video[]
  allCategories: any[]
}

const VIDEOS_PER_PAGE = 9

export default function VideosGrid({ initialVideos, allCategories }: VideosGridProps) {
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category')

  // Filter videos based on category
  const getFilteredVideos = useCallback(() => {
    if (!currentCategory) return initialVideos

    const category = allCategories.find(cat => cat.slug === currentCategory)
    if (!category) return []

    return initialVideos.filter(video => video.video_cat?.includes(category.id))
  }, [currentCategory, initialVideos, allCategories])

  const filteredVideos = getFilteredVideos()

  const [displayedVideos, setDisplayedVideos] = useState<Video[]>(
    filteredVideos.slice(0, VIDEOS_PER_PAGE)
  )
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(filteredVideos.length > VIDEOS_PER_PAGE)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadingRef = useRef<HTMLDivElement>(null)

  // Reset when category changes
  useEffect(() => {
    const filtered = getFilteredVideos()
    setDisplayedVideos(filtered.slice(0, VIDEOS_PER_PAGE))
    setPage(1)
    setHasMore(filtered.length > VIDEOS_PER_PAGE)
  }, [currentCategory, getFilteredVideos])

  // Load more videos
  const loadMoreVideos = useCallback(() => {
    if (loading || !hasMore) return

    setLoading(true)

    // Simulate loading delay for smooth UX
    setTimeout(() => {
      const filtered = getFilteredVideos()
      const nextPage = page + 1
      const startIndex = (nextPage - 1) * VIDEOS_PER_PAGE
      const endIndex = startIndex + VIDEOS_PER_PAGE
      const nextVideos = filtered.slice(startIndex, endIndex)

      if (nextVideos.length > 0) {
        setDisplayedVideos(prev => [...prev, ...nextVideos])
        setPage(nextPage)
        setHasMore(endIndex < filtered.length)
      } else {
        setHasMore(false)
      }

      setLoading(false)
    }, 500)
  }, [page, loading, hasMore, getFilteredVideos])

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && hasMore && !loading) {
          loadMoreVideos()
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1
      }
    )

    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loadMoreVideos, hasMore, loading])

  // Show category name if filtered
  const categoryName = currentCategory
    ? allCategories.find(cat => cat.slug === currentCategory)?.name
    : null

  return (
    <div>
      <div className="mb-6">
        <p className="text-gray-600">
          {categoryName ? (
            <>
              Showing <span className="font-semibold">{filteredVideos.length}</span> videos in{' '}
              <span className="font-semibold">{categoryName}</span>
            </>
          ) : (
            <>
              Showing <span className="font-semibold">{filteredVideos.length}</span> training videos
            </>
          )}
        </p>
      </div>

      {displayedVideos.length > 0 ? (
        <>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayedVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>

          {/* Loading indicator for infinite scroll */}
          {hasMore && (
            <div
              ref={loadingRef}
              className="flex justify-center items-center py-12"
            >
              {loading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[#ffed00]" />
                  <p className="mt-2 text-sm text-gray-600">Loading more videos...</p>
                </div>
              ) : (
                <div className="text-center">
                  <button
                    onClick={loadMoreVideos}
                    className="px-6 py-3 bg-[#ffed00] text-black rounded-lg font-semibold hover:bg-[#ffed00]/90 transition-colors"
                  >
                    Load More Videos
                  </button>
                </div>
              )}
            </div>
          )}

          {!hasMore && displayedVideos.length > VIDEOS_PER_PAGE && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">
                You've reached the end of the videos
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <Play className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {categoryName ? `No videos in ${categoryName}` : 'No videos available'}
          </h3>
          <p className="text-gray-500">
            {categoryName ? 'Try selecting a different category.' : 'Check back soon for new training content.'}
          </p>
        </div>
      )}
    </div>
  )
}