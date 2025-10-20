'use client'

import { Course, isCourseLocked, getCoursePrice, getCourseVideoCount } from '@/lib/woocommerce/courses'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, PlayCircle, Award, Users, Video, Calendar } from 'lucide-react'
import { useCurrency } from '@/lib/currency-context'

interface CourseCardProps {
  course: Course
}

export default function CourseCard({ course }: CourseCardProps) {
  const { getCurrencySymbol } = useCurrency()
  const currencySymbol = getCurrencySymbol()
  const isLocked = isCourseLocked(course)
  const price = getCoursePrice(course)
  const videoCount = getCourseVideoCount(course)
  const isFree = course.acf?.is_free_course === true || course.acf?.is_free_course === '1'

  // Format course type for display
  const rawCourseType = course.acf?.course_type || 'on_demand'
  const courseType = rawCourseType === 'online_live' ? 'Online Live Course' : 'On Demand'

  // Use the access info from the course object which is updated dynamically
  const hasAccess = course.access?.has_access || false

  // Format duration to short format (e.g., "1h 40m" instead of "1 hour and 40 minutes")
  const formatDuration = (duration?: string) => {
    if (!duration) return ''

    // Replace common long forms with short forms
    return duration
      .replace(/(\d+)\s*hours?/gi, '$1h')
      .replace(/(\d+)\s*minutes?/gi, '$1m')
      .replace(/\s*and\s*/gi, ' ')
      .trim()
  }

  // Allow viewing course details even if not purchased
  const handleClick = (e: React.MouseEvent) => {
    // Always allow navigation to course page to view details
    // Access control will be handled on the course page itself
  }

  // Course type badge icon
  const CourseTypeIcon = courseType === 'Online Live Course' ? Calendar : Video

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 relative">
        <div className="block">
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
              <div className="bg-[#ffed00] rounded-full p-4 transform group-hover:scale-110 transition-transform flex items-center justify-center">
                <svg className="h-8 w-8 text-black" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>

            {/* Course Type Badge - Left side */}
            <div className="absolute top-3 left-3">
              <span className="bg-black/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <CourseTypeIcon className="h-3.5 w-3.5" />
                {courseType}
              </span>
            </div>

            {/* Certificate Badge - Always on the RIGHT side */}
            {course.acf?.certificate_awarded && (
              <div className="absolute top-3 right-3">
                <span className="bg-black/80 backdrop-blur-sm text-[#ffed00] px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Award className="h-3.5 w-3.5" />
                  Certificate
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Categories and Status Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              {course.course_categories?.map((cat) => (
                <span
                  key={cat.id}
                  className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-medium"
                >
                  {cat.name}
                </span>
              ))}
              {/* Free Badge - only show if explicitly marked as free course */}
              {isFree && (
                <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                  Free
                </span>
              )}
              {/* Purchased Badge - only show if NOT free and user has access */}
              {!isFree && hasAccess && (
                <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                  Purchased
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="font-bold text-lg mb-2 truncate group-hover:text-[#ffed00] transition-colors">
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
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">{formatDuration(course.acf.duration)}</span>
                </div>
              )}
              {videoCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <PlayCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">{videoCount} videos</span>
                </div>
              )}
              {course.acf?.instructor && (
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{course.acf.instructor}</span>
                </div>
              )}
            </div>

            {/* Price & CTA */}
            <div className="mt-4 pt-4 border-t">
              {/* Action Buttons */}
              <div className="flex gap-2">
                {isLocked && !hasAccess ? (
                  /* Not purchased - show view details button */
                  <Link
                    href={`/courses/${course.slug}`}
                    className="w-full bg-black text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Details & Purchase
                    {price && (
                      <span className="ml-auto font-bold">
                        {currencySymbol}{price}
                      </span>
                    )}
                  </Link>
                ) : (
                  /* Purchased or free course - show BOTH buttons */
                  <>
                    <Link
                      href={`/courses/${course.slug}`}
                      className="flex-1 bg-black text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Details
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </Link>
                    <Link
                      href={`/courses/${course.slug}/learn`}
                      className="flex-1 bg-[#ffed00] text-black py-2.5 px-4 rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <PlayCircle className="h-5 w-5" />
                      Open Course
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}