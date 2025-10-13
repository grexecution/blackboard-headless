'use client'

import { Course, isCourseLocked, getCoursePrice, getCourseVideoCount, getCourseDifficultyLabel } from '@/lib/woocommerce/courses'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, PlayCircle, Award, Lock, Users } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { LoginModal } from '@/components/auth/login-modal'

interface CourseCardProps {
  course: Course
}

export default function CourseCard({ course }: CourseCardProps) {
  const { data: session } = useSession()
  const [showLoginModal, setShowLoginModal] = useState(false)

  const isLocked = isCourseLocked(course)
  const price = getCoursePrice(course)
  const videoCount = getCourseVideoCount(course)
  const difficulty = getCourseDifficultyLabel(course)

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

  // Difficulty badge colors
  const difficultyColor = {
    'Beginner': 'bg-green-100 text-green-800',
    'Intermediate': 'bg-yellow-100 text-yellow-800',
    'Advanced': 'bg-red-100 text-red-800',
  }[difficulty] || 'bg-gray-100 text-gray-800'

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 relative">
        <Link
          href={hasAccess ? `/courses/${course.slug}` : '#'}
          onClick={handleClick}
          className="block"
        >
          {/* Thumbnail */}
          <div className="relative aspect-video bg-gray-100 overflow-hidden">
            {course.featured_image?.url ? (
              <Image
                src={course.featured_image.url}
                alt={course.featured_image.alt || course.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#ffed00] to-[#ffd700]">
                <PlayCircle className="h-16 w-16 text-black/20" />
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
                  <PlayCircle className="h-8 w-8 text-black" fill="currentColor" />
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {/* Difficulty Badge */}
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${difficultyColor}`}>
                {difficulty}
              </span>

              {/* Certificate Badge */}
              {course.acf?.certificate_awarded && (
                <span className="bg-black/80 backdrop-blur-sm text-[#ffed00] px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Award className="h-3.5 w-3.5" />
                  Certificate
                </span>
              )}
            </div>

            {/* Lock Badge */}
            {isLocked && !hasAccess && (
              <div className="absolute top-3 right-3">
                <div className="bg-black/80 backdrop-blur-sm text-[#ffed00] px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  <span className="text-xs font-semibold">Purchase required</span>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Categories */}
            {course.course_categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {course.course_categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-medium"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-[#ffed00] transition-colors">
              {course.title}
            </h3>

            {/* Excerpt */}
            {course.excerpt && (
              <div
                className="text-sm text-gray-600 line-clamp-2 mb-3"
                dangerouslySetInnerHTML={{ __html: course.excerpt }}
              />
            )}

            {/* Metadata */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              {course.acf?.duration && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{course.acf.duration}</span>
                </div>
              )}
              {videoCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <PlayCircle className="h-4 w-4" />
                  <span>{videoCount} videos</span>
                </div>
              )}
              {course.acf?.instructor && (
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  <span>{course.acf.instructor}</span>
                </div>
              )}
            </div>

            {/* Price & CTA */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              {price && isLocked ? (
                <div className="flex items-center gap-2">
                  {course.acf?.product_data?.on_sale && course.acf?.product_data?.regular_price && (
                    <span className="text-sm text-gray-400 line-through">
                      R{course.acf.product_data.regular_price}
                    </span>
                  )}
                  <span className="text-xl font-bold text-[#ffed00]">
                    R{price}
                  </span>
                </div>
              ) : (
                <span className="text-sm font-semibold text-green-600">
                  {isLocked ? 'Enrolled' : 'Free Course'}
                </span>
              )}

              <span className="text-sm font-semibold text-[#ffed00] group-hover:text-black transition-colors flex items-center gap-2">
                {isLocked && !hasAccess ? 'View Details' : 'Start Learning'}
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
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