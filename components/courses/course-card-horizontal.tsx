'use client'

import { Course, isCourseLocked, getCoursePrice } from '@/lib/woocommerce/courses'
import Image from 'next/image'
import Link from 'next/link'
import { Lock, Award, Clock, Package, CheckCircle, Video, FileText, PlayCircle } from 'lucide-react'
import { useCurrency } from '@/lib/currency-context'

interface CourseCardHorizontalProps {
  course: Course
}

export default function CourseCardHorizontal({ course }: CourseCardHorizontalProps) {
  const { getCurrencySymbol } = useCurrency()
  const currencySymbol = getCurrencySymbol()
  const isLocked = isCourseLocked(course)
  const price = getCoursePrice(course)
  const isFree = course.acf?.is_free_course === true || course.acf?.is_free_course === '1'

  // Get custom field data from ACF
  const prerequisites = course.acf?.course_prerequisites || 'None'
  const equipment = course.acf?.course_equipment || 'Blackboard (not included)'
  const duration = course.acf?.duration || ''

  // Use course_type field (on_demand or online_live)
  const courseType = course.acf?.course_type || 'on_demand'
  const isOnDemand = courseType === 'on_demand'
  const isLive = courseType === 'online_live'

  const certificateOffered = course.acf?.certificate_awarded !== false

  // Use the access info from the course object which is updated dynamically
  const hasAccess = course.access?.has_access || false

  // Get category for display
  const categoryName = course.course_categories?.[0]?.name || ''
  const isWorkshop = categoryName.toLowerCase().includes('workshop')
  const isProCoach = categoryName.toLowerCase().includes('procoach')

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-[#ffed00] hover:shadow-xl transition-all duration-300 group">
      <div className="grid md:grid-cols-[320px,1fr] gap-0">
        {/* Left - Course Image */}
        <div className="relative h-64 md:h-auto bg-gradient-to-br from-gray-100 to-gray-200">
          {course.featured_image?.url ? (
            <Image
              src={course.featured_image.url}
              alt={course.featured_image.alt || course.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText className="h-16 w-16 text-gray-300" />
            </div>
          )}

          {/* Delivery Method Badge - Top Left */}
          <div className="absolute top-4 left-4">
            {isOnDemand ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/80 backdrop-blur-sm rounded-full">
                <Video className="h-3.5 w-3.5 text-[#ffed00]" />
                <span className="text-xs font-bold text-white">On-Demand</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/90 backdrop-blur-sm rounded-full">
                <Video className="h-3.5 w-3.5 text-white" />
                <span className="text-xs font-bold text-white">Live Training</span>
              </div>
            )}
          </div>

          {/* Certificate Badge - Top Right */}
          {certificateOffered && (
            <div className="absolute top-4 right-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ffed00]/95 backdrop-blur-sm rounded-full">
                <Award className="h-3.5 w-3.5 text-black" />
                <span className="text-xs font-bold text-black">Certificate</span>
              </div>
            </div>
          )}
        </div>

        {/* Right - Course Details */}
        <div className="p-6 md:p-8 flex flex-col">
          {/* Category & Status Tags */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              {isProCoach && (
                <span className="px-3 py-1 bg-black text-[#ffed00] rounded-full text-xs font-bold">
                  ProCoach
                </span>
              )}
              {isWorkshop && (
                <span className="px-3 py-1 bg-[#ffed00] text-black rounded-full text-xs font-bold">
                  Workshop
                </span>
              )}
              {isFree && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                  Free
                </span>
              )}
              {hasAccess && !isFree && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Enrolled
                </span>
              )}
            </div>

            {/* Lock Icon - Right Side */}
            {!hasAccess && isLocked && (
              <div className="flex-shrink-0">
                <div className="p-2 bg-gray-900 rounded-full">
                  <Lock className="h-4 w-4 text-white" />
                </div>
              </div>
            )}
          </div>

          {/* Course Title */}
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 group-hover:text-[#ffed00] transition-colors">
            {course.title}
          </h3>

          {/* Course Description */}
          <p className="text-gray-600 leading-relaxed mb-6 line-clamp-2">
            {course.excerpt}
          </p>

          {/* Course Info Grid */}
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {/* Prerequisites */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-[#ffed00]/20 flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-black" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-500 mb-1">Prerequisites</p>
                <p className="text-sm font-bold text-gray-900 truncate">{prerequisites}</p>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-[#ffed00]/20 flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-black" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-500 mb-1">Duration</p>
                <p className="text-sm font-bold text-gray-900">
                  {duration || 'Self-paced'}
                </p>
              </div>
            </div>

            {/* Equipment */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-[#ffed00]/20 flex items-center justify-center flex-shrink-0">
                <Package className="h-5 w-5 text-black" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-500 mb-1">Equipment</p>
                <p className="text-sm font-bold text-gray-900 truncate">{equipment}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto flex gap-3">
            {isLocked && !hasAccess ? (
              /* Not purchased - show view details & purchase button */
              <Link
                href={`/courses/${course.slug}`}
                className="w-full bg-black text-white py-3.5 px-6 rounded-full font-semibold hover:bg-gray-800 transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2"
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
                  className="flex-1 bg-black text-white py-3.5 px-6 rounded-full font-semibold hover:bg-gray-800 transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2"
                >
                  View Details
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </Link>
                <Link
                  href={`/courses/${course.slug}/learn`}
                  className="flex-1 bg-[#ffed00] text-black py-3.5 px-6 rounded-full font-semibold hover:bg-yellow-400 transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2"
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
  )
}
