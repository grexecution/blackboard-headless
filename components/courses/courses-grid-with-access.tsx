'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Course } from '@/lib/woocommerce/courses'
import CoursesGrid from './courses-grid'

interface CoursesGridWithAccessProps {
  initialCourses: Course[]
  allCategories: any[]
}

export default function CoursesGridWithAccess({ initialCourses, allCategories }: CoursesGridWithAccessProps) {
  const { data: session } = useSession()
  const [courses, setCourses] = useState(initialCourses)
  const [isLoadingAccess, setIsLoadingAccess] = useState(false)

  const checkUserAccess = useCallback(async () => {
    setIsLoadingAccess(true)
    try {
      const courseIds = initialCourses.map(c => c.id).join(',')
      const response = await fetch(`/api/courses/access?courseIds=${courseIds}`, {
        cache: 'no-store' // Always get fresh data
      })

      if (!response.ok) {
        console.error('Failed to check course access:', response.status)
        return
      }

      const accessMap = await response.json()

      // Update courses with actual access status from WordPress
      const updatedCourses = initialCourses.map(course => {
        const accessInfo = accessMap[course.id]

        if (accessInfo) {
          return {
            ...course,
            access: accessInfo
          }
        }

        return course
      })

      setCourses(updatedCourses)
    } catch (error) {
      console.error('Error checking course access:', error)
    } finally {
      setIsLoadingAccess(false)
    }
  }, [initialCourses])

  useEffect(() => {
    // If user is logged in, check their actual course access
    if (session?.user) {
      checkUserAccess()
    } else {
      // If not logged in, ensure all courses show as no access
      setCourses(initialCourses.map(course => ({
        ...course,
        access: {
          has_access: false,
          reason: 'login_required',
          product_id: course.acf?.product_id
        }
      })))
    }
  }, [session, checkUserAccess, initialCourses])

  return (
    <div>
      {isLoadingAccess && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
          Checking your course access...
        </div>
      )}
      <CoursesGrid initialCourses={courses} allCategories={allCategories} />
    </div>
  )
}