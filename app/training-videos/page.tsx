import { getAllVideos, getVideoCategories, getVideoThumbnail, isVideoLocked, getVideoCategories2 } from '@/lib/woocommerce/videos'
import VideoCard from '@/components/videos/video-card'
import VideoFilter from '@/components/videos/video-filter'
import { Play } from 'lucide-react'

// Static generation
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
      <section className="bg-black text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-[#ffed00]/20 text-[#ffed00] px-4 py-2 rounded-full mb-6">
              <Play className="h-4 w-4" />
              <span className="text-sm font-semibold uppercase tracking-wider">Training Center</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              BlackBoard Training Videos
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Master your foot training with our comprehensive video library. From beginner exercises to advanced techniques,
              learn from certified instructors and transform your foundation.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Filter */}
            <div className="lg:col-span-1">
              <VideoFilter categories={categories} />
            </div>

            {/* Videos Grid */}
            <div className="lg:col-span-3">
              <div className="mb-6">
                <p className="text-gray-600">
                  Showing <span className="font-semibold">{videos.length}</span> training videos
                </p>
              </div>

              {videos.length > 0 ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {videos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Play className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No videos available</h3>
                  <p className="text-gray-500">Check back soon for new training content.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}