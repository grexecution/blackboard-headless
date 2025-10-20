'use client'

import { useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { Course } from '@/lib/woocommerce/courses'
import CourseCard from './course-card'
import { Filter } from 'lucide-react'

interface CoursesGridProps {
  initialCourses: Course[]
  allCategories: any[]
}

export default function CoursesGrid({ initialCourses, allCategories }: CoursesGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const { data: session, status } = useSession()

  // Get enrolled course IDs from session (cached at login) - wrapped in useMemo
  const enrolledCourseIds = useMemo(() => session?.enrolledCourseIds || [], [session?.enrolledCourseIds])

  console.log('[CoursesGrid] Session status:', status)
  console.log('[CoursesGrid] Enrolled course IDs from session:', enrolledCourseIds)

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

  // Filter courses based on selected category
  const filteredCourses = useMemo(() => {
    const filtered = selectedCategory === 'all'
      ? courses
      : courses.filter(course =>
          course.course_categories?.some(cat => cat.slug === selectedCategory)
        )

    // Sort: unlocked courses first, then locked courses
    return filtered.sort((a, b) => {
      const aHasAccess = a.access?.has_access || false
      const bHasAccess = b.access?.has_access || false

      if (aHasAccess && !bHasAccess) return -1
      if (!aHasAccess && bHasAccess) return 1
      return 0
    })
  }, [courses, selectedCategory])

  return (
    <div>
      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <span className="font-semibold text-gray-700">Filter by Category:</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#ffed00] text-black'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-[#ffed00]'
            }`}
          >
            All Courses
          </button>
          {allCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.slug)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === category.slug
                  ? 'bg-[#ffed00] text-black'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-[#ffed00]'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing <span className="font-semibold">{filteredCourses.length}</span>
          {selectedCategory !== 'all' && (
            <> {allCategories.find(c => c.slug === selectedCategory)?.name}</>
          )} course{filteredCourses.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500">No courses found in this category.</p>
        </div>
      )}
    </div>
  )
}