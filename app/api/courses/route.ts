import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const apiUrl = process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL || process.env.WP_BASE_URL || 'https://blackboard-training.com'

  // Get the user's session to extract JWT token
  const session = await getServerSession(authOptions) as any

  const headers: HeadersInit = {
    'Accept': 'application/json',
  }

  // Add JWT token if user is logged in
  if (session?.jwt) {
    headers['Authorization'] = `Bearer ${session.jwt}`
  }

  try {
    const response = await fetch(`${apiUrl}/wp-json/blackboard/v1/courses`, {
      headers,
      cache: 'no-store', // Don't cache to ensure fresh access data
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch courses' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
