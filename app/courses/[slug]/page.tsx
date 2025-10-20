import { notFound } from 'next/navigation'
import { CourseDetailClient } from './course-detail-client'
import { Course, getAllCourses } from '@/lib/woocommerce/courses'

// Static generation for instant page loads
export const revalidate = false
export const dynamic = 'force-static'
export const dynamicParams = true

async function getCourse(slug: string): Promise<Course | null> {
  try {
    const apiUrl = process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL || process.env.WP_BASE_URL || 'https://blackboard-training.com'

    const response = await fetch(`${apiUrl}/wp-json/blackboard/v1/courses/${slug}`, {
      next: { revalidate: false },
    })

    if (!response.ok) {
      return null
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching course:', error)
    return null
  }
}

// Generate static params for all courses at build time
export async function generateStaticParams() {
  console.log('[Build] Starting generateStaticParams for course pages...')

  try {
    const courses = await getAllCourses()

    if (courses.length === 0) {
      console.warn('[Build] No courses returned - API may be unavailable, skipping static generation')
      return []
    }

    console.log(`[Build] Fetched ${courses.length} courses for static generation`)

    const params = courses.map((course) => ({
      slug: course.slug,
    }))

    console.log('[Build] Static params generation complete for courses!')
    return params
  } catch (error) {
    console.error('[Build] Error generating static params for courses:', error)
    return []
  }
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const course = await getCourse(slug)

  if (!course) {
    notFound()
  }

  // Pass course to client component
  // Access checking will happen on client side to prevent FOUC
  return <CourseDetailClient course={course} />
}
