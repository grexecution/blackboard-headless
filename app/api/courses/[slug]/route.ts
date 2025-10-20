import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const apiUrl = process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'http://localhost:10074'

  console.log('[API /courses/[slug]] Request for slug:', slug)
  console.log('[API /courses/[slug]] Request headers:', Object.fromEntries(request.headers.entries()))

  // Get the user's session to check access via enrolledCourseIds
  const session = await getServerSession(authOptions) as any
  const enrolledCourseIds = session?.enrolledCourseIds || []

  console.log('[API /courses/[slug]] Session exists:', !!session)
  console.log('[API /courses/[slug]] Session user:', session?.user?.email)
  console.log('[API /courses/[slug]] Enrolled course IDs from session:', enrolledCourseIds)

  const headers: HeadersInit = {
    'Accept': 'application/json',
  }

  // Add JWT token if user is logged in (for other data like WooCommerce info)
  if (session?.jwt) {
    headers['Authorization'] = `Bearer ${session.jwt}`
  }

  try {
    const response = await fetch(`${apiUrl}/wp-json/blackboard/v1/courses/${slug}`, {
      headers,
      cache: 'no-store', // Don't cache to ensure fresh access data
    })

    console.log('[API /courses/[slug]] WordPress response status:', response.status)

    if (!response.ok) {
      console.log('[API /courses/[slug]] WordPress returned error, returning 404')
      return NextResponse.json({ error: 'Course not found' }, { status: response.status })
    }

    const data = await response.json()
    console.log('[API /courses/[slug]] WordPress course data:', {
      id: data.id,
      slug: data.slug,
      title: data.title,
      originalAccess: data.access
    })

    // Override access check with session-based enrolled courses
    // This is the authoritative source of truth from login
    const hasAccess = enrolledCourseIds.includes(data.id) || data.access?.is_free || false

    console.log('[API /courses/[slug]] Access check:', {
      courseId: data.id,
      enrolledCourseIds,
      isFree: data.access?.is_free,
      hasAccess
    })

    data.access = {
      ...data.access,
      has_access: hasAccess,
      reason: hasAccess ? 'enrolled' : (session ? 'not_enrolled' : 'login_required')
    }

    console.log('[API /courses/[slug]] Final access object:', data.access)
    console.log('[API /courses/[slug]] Returning course data')

    return NextResponse.json(data)
  } catch (error) {
    console.error('[API /courses/[slug]] Error fetching course:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
