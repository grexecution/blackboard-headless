import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const WP_BASE_URL = process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://blackboard-training.com'

// GET - Fetch user's course progress
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 })
    }

    // Fetch progress from WordPress user meta
    const response = await fetch(
      `${WP_BASE_URL}/wp-json/blackboard/v1/users/${session.user.id}/progress/${courseId}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 0 }
      }
    )

    if (!response.ok) {
      // If no progress found, return empty progress
      return NextResponse.json({
        completedLessons: [],
        completedAt: null,
        certificateGenerated: false
      })
    }

    const progress = await response.json()
    return NextResponse.json(progress)
  } catch (error) {
    console.error('[Progress API] Error fetching progress:', error)
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
  }
}

// POST - Update course progress (mark lesson complete)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { courseId, lessonIndex, action } = body

    if (!courseId || lessonIndex === undefined) {
      return NextResponse.json({ error: 'Course ID and lesson index required' }, { status: 400 })
    }

    // Update progress in WordPress
    const response = await fetch(
      `${WP_BASE_URL}/wp-json/blackboard/v1/users/${session.user.id}/progress/${courseId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonIndex,
          action: action || 'complete' // 'complete' or 'uncomplete'
        })
      }
    )

    if (!response.ok) {
      throw new Error('Failed to update progress')
    }

    const progress = await response.json()
    return NextResponse.json(progress)
  } catch (error) {
    console.error('[Progress API] Error updating progress:', error)
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
  }
}
