'use client'

import { useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { Course } from '@/lib/woocommerce/courses'
import CourseCard from './course-card'

interface CoursesGridSimpleProps {
  initialCourses: Course[]
}

export default function CoursesGridSimple({ initialCourses }: CoursesGridSimpleProps) {
  const { data: session, status } = useSession()

  // Get enrolled course IDs from session (cached at login) - wrapped in useMemo
  const enrolledCourseIds = useMemo(() => session?.enrolledCourseIds || [], [session?.enrolledCourseIds])

  console.log('[CoursesGridSimple] Session status:', status)
  console.log('[CoursesGridSimple] Enrolled course IDs from session:', enrolledCourseIds)

  // Update courses with access based on session's enrolled course IDs
  const courses = useMemo(() => {
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
          Showing <span className="font-semibold">{sortedCourses.length}</span> course{sortedCourses.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Courses Grid */}
      {sortedCourses.length > 0 ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500">No courses found.</p>
        </div>
      )}
    </div>
  )
}
