import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const WP_BASE_URL = process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://blackboard-training.com'

// POST - Generate certificate for completed course
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { courseId } = body

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 })
    }

    // Generate certificate in WordPress
    const response = await fetch(
      `${WP_BASE_URL}/wp-json/blackboard/v1/certificates/generate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: session.user.id,
          course_id: courseId,
          user_name: session.user.name || session.user.email,
          completion_date: new Date().toISOString()
        })
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('[Certificate API] WordPress error:', error)
      return NextResponse.json({ error: 'Failed to generate certificate' }, { status: 500 })
    }

    const certificate = await response.json()
    return NextResponse.json(certificate)
  } catch (error) {
    console.error('[Certificate API] Error generating certificate:', error)
    return NextResponse.json({ error: 'Failed to generate certificate' }, { status: 500 })
  }
}

// GET - Get certificate by ID
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const certificateId = searchParams.get('id')

    if (!certificateId) {
      return NextResponse.json({ error: 'Certificate ID required' }, { status: 400 })
    }

    // Fetch certificate from WordPress
    const response = await fetch(
      `${WP_BASE_URL}/wp-json/blackboard/v1/certificates/${certificateId}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    )

    if (!response.ok) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    const certificate = await response.json()

    // Verify this certificate belongs to the user
    if (certificate.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json(certificate)
  } catch (error) {
    console.error('[Certificate API] Error fetching certificate:', error)
    return NextResponse.json({ error: 'Failed to fetch certificate' }, { status: 500 })
  }
}
