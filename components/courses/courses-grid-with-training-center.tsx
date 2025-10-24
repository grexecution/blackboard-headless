'use client'

import { useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { Course } from '@/lib/woocommerce/courses'
import CourseCard from './course-card'
import Link from 'next/link'
import Image from 'next/image'
import { PlayCircle, Video } from 'lucide-react'

interface CoursesGridWithTrainingCenterProps {
  initialCourses: Course[]
}

export default function CoursesGridWithTrainingCenter({ initialCourses }: CoursesGridWithTrainingCenterProps) {
  const { data: session } = useSession()

  // Get enrolled course IDs from session (cached at login) - wrapped in useMemo
  const enrolledCourseIds = useMemo(() => session?.enrolledCourseIds || [], [session?.enrolledCourseIds])

  // Update courses with access based on session's enrolled course IDs
  const courses = useMemo(() => {
    if (!initialCourses || !Array.isArray(initialCourses)) return []
    return initialCourses.map(course => ({
      ...course,
      access: {
        ...course.access,
        has_access: enrolledCourseIds.includes(course.id) || course.access?.is_free || false
      }
    }))
  }, [initialCourses, enrolledCourseIds])

  // Sort: unlocked courses first, then locked courses
  const sortedCourses = useMemo(() => {
    return courses.sort((a, b) => {
      const aHasAccess = a.access?.has_access || false
      const bHasAccess = b.access?.has_access || false

      if (aHasAccess && !bHasAccess) return -1
      if (!aHasAccess && bHasAccess) return 1
      return 0
    })
  }, [courses])

  return (
    <div>
      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing <span className="font-semibold">{sortedCourses.length + 1}</span> item{sortedCourses.length !== 0 ? 's' : ''}
        </p>
      </div>

      {/* Courses Grid with Training Center as first item */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Training Center Card - Static First Position */}
        <Link
          href="/training-videos"
          className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 relative"
        >
          {/* Thumbnail */}
          <div className="relative aspect-video bg-gray-100 overflow-hidden">
            <Image
              src="/images/trainingcenter.png"
              alt="BlackBoard Training Center"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-[#ffed00] rounded-full p-4 transform group-hover:scale-110 transition-transform flex items-center justify-center">
                <svg className="h-8 w-8 text-black" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>

            {/* Free Badge - Left side */}
            <div className="absolute top-3 left-3">
              <span className="bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <Video className="h-3.5 w-3.5" />
                Free Videos
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Categories Badge */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-[#ffed00]/20 text-[#ffed00] px-2.5 py-1 rounded-full text-xs font-semibold">
                Training Center
              </span>
            </div>

            {/* Title */}
            <h3 className="font-bold text-lg mb-2 truncate group-hover:text-[#ffed00] transition-colors">
              Free Training Videos
            </h3>

            {/* Excerpt */}
            <div className="text-sm text-gray-600 line-clamp-2 mb-3">
              Access our complete library of free training videos and tutorials
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1.5">
                <PlayCircle className="h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">24+ videos</span>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="w-full bg-[#ffed00] text-black py-3 px-4 rounded-full font-semibold hover:bg-yellow-400 transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2">
                  <PlayCircle className="h-5 w-5" />
                  Browse Videos
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Regular Course Cards */}
        {sortedCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {sortedCourses.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg col-span-full">
          <p className="text-gray-500">No courses found.</p>
        </div>
      )}
    </div>
  )
}
