import { notFound } from 'next/navigation'
import { CourseLearnClient } from './course-learn-client'
import { Course } from '@/lib/woocommerce/courses'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Dynamic rendering to get user session
export const dynamic = 'force-dynamic'

async function getCourse(slug: string): Promise<Course | null> {
  try {
    const apiUrl = process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'http://localhost:10074'

    const response = await fetch(`${apiUrl}/wp-json/blackboard/v1/courses/${slug}`, {
      cache: 'no-store',
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

export default async function CourseLearnPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const course = await getCourse(slug)

  if (!course) {
    notFound()
  }

  // Get session to check access
  const session = await getServerSession(authOptions) as any
  const enrolledCourseIds = session?.enrolledCourseIds || []

  // Override access based on session
  const hasAccess = enrolledCourseIds.includes(course.id) || course.access?.is_free || false

  course.access = {
    ...course.access,
    has_access: hasAccess,
    reason: hasAccess ? 'enrolled' : (session ? 'not_enrolled' : 'login_required')
  }

  return <CourseLearnClient course={course} />
}
