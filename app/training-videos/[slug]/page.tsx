import { getVideoBySlug, getAllVideos, isVideoLocked, getVideoCategories2 } from '@/lib/woocommerce/videos'
import { notFound } from 'next/navigation'
import { ArrowLeft, Clock, Activity, Lock } from 'lucide-react'
import Link from 'next/link'
import VideoPlayer from '@/components/videos/video-player'
// Note: For server-side auth check, we'll rely on client-side for now
// Can be enhanced with server session check when auth is fully configured

// Static generation
export const revalidate = false
export const dynamic = 'force-static'

export async function generateStaticParams() {
  const videos = await getAllVideos()
  return videos.map((video) => ({
    slug: video.slug,
  }))
}

export default async function VideoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const video = await getVideoBySlug(slug)

  if (!video) {
    notFound()
  }

  const isLocked = isVideoLocked(video)
  const categories = getVideoCategories2(video)

  // Note: Access control is handled client-side in VideoPlayerWrapper
  // for better user experience with login modals

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-black text-white py-8">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <Link
              href="/training-videos"
              className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Training Center</span>
            </Link>

            {/* Categories */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-semibold"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {video.title.rendered}
            </h1>

            {/* Description */}
            {video.content?.rendered && (
              <div
                className="text-lg text-gray-300 max-w-4xl"
                dangerouslySetInnerHTML={{ __html: video.content.rendered }}
              />
            )}

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-6 mt-6">
              {video.acf?.duration && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#ffed00]" />
                  <span className="text-gray-300">Duration:</span>
                  <span className="font-semibold">{video.acf.duration}</span>
                </div>
              )}
              {video.acf?.exercises && (
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-[#ffed00]" />
                  <span className="text-gray-300">Exercises:</span>
                  <span className="font-semibold">{video.acf.exercises}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Video Content */}
      <section className="py-12">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            <VideoPlayer video={video} />
          </div>
        </div>
      </section>
    </div>
  )
}