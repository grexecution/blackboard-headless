import { getAllVideos, getVideoCategories } from '@/lib/woocommerce/videos'
import VideoFilter from '@/components/videos/video-filter'
import VideosGrid from '@/components/videos/videos-grid'
import { Play } from 'lucide-react'

// Static generation for initial load
export const revalidate = false
export const dynamic = 'force-static'

export default async function TrainingVideosPage() {
  const [videos, categories] = await Promise.all([
    getAllVideos(),
    getVideoCategories()
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-black text-white py-12 sm:py-16">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-[#ffed00]/20 text-[#ffed00] px-4 py-2 rounded-full mb-4 sm:mb-6">
              <Play className="h-4 w-4" />
              <span className="text-sm font-semibold uppercase tracking-wider">Training Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
              BlackBoard Training Videos
            </h1>
            <p className="text-base sm:text-xl text-gray-300 leading-relaxed">
              Master your foot training with our comprehensive video library. From beginner exercises to advanced techniques,
              learn from certified instructors and transform your foundation.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <div className="grid lg:grid-cols-4 gap-0 md:gap-8">
            {/* Sidebar Filter */}
            <div className="lg:col-span-1">
              <VideoFilter categories={categories} />
            </div>

            {/* Videos Grid with Filtering and Pagination */}
            <div className="lg:col-span-3">
              <VideosGrid initialVideos={videos} allCategories={categories} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}