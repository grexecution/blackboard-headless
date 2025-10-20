import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

/**
 * Check user's access to courses
 * Returns an object mapping course IDs to access status
 */
export async function GET(request: NextRequest) {
  try {
    console.log('='.repeat(80))
    console.log('[Access API] NEW REQUEST RECEIVED')
    console.log('[Access API] URL:', request.url)
    console.log('[Access API] Method:', request.method)

    const session = await getServerSession()
    console.log('[Access API] Session retrieved')
    console.log('[Access API] Session object:', JSON.stringify(session, null, 2))

    if (!session?.user?.email) {
      console.log('[Access API] ❌ NO AUTHENTICATED USER')
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    console.log('[Access API] ✓ User authenticated:', session.user.email)

    const searchParams = request.nextUrl.searchParams
    const courseIds = searchParams.get('courseIds')

    if (!courseIds) {
      console.log('[Access API] ❌ NO COURSE IDS PROVIDED')
      return NextResponse.json({ error: 'Course IDs required' }, { status: 400 })
    }

    console.log('[Access API] ✓ Checking access for course IDs:', courseIds)

    const wpUrl = process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL
    console.log('[Access API] WordPress URL:', wpUrl)

    // Get user's JWT token from session (it's stored in session.jwt, not session.user.jwt)
    const jwtToken = (session as any).jwt

    console.log('[Access API] JWT token exists:', !!jwtToken)
    if (jwtToken) {
      console.log('[Access API] JWT token preview:', jwtToken.substring(0, 50) + '...')
    }

    if (!jwtToken) {
      console.error('[Access API] ❌ NO JWT TOKEN IN SESSION')
      console.error('[Access API] Session keys:', Object.keys(session))
      console.error('[Access API] Full session:', JSON.stringify(session, null, 2))
      return NextResponse.json({ error: 'No JWT token in session' }, { status: 401 })
    }

    console.log('[Access API] ✓ JWT token found in session')

    // Parse course IDs
    const ids = courseIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))

    // Check access for each course
    const accessMap: Record<number, any> = {}

    console.log('[Access API] Parsed course IDs:', ids)

    for (const courseId of ids) {
      try {
        const endpoint = `${wpUrl}/wp-json/blackboard/v1/courses/access/${courseId}`
        console.log(`[Access API] 🔄 Calling WordPress for course ${courseId}`)
        console.log(`[Access API] Endpoint: ${endpoint}`)
        console.log(`[Access API] JWT Preview: ${jwtToken.substring(0, 30)}...`)

        const accessResponse = await fetch(
          endpoint,
          {
            headers: {
              'Authorization': `Bearer ${jwtToken}`,
              'Content-Type': 'application/json',
            },
            cache: 'no-store', // Always get fresh access data
          }
        )

        console.log(`[Access API] WordPress response status for course ${courseId}: ${accessResponse.status}`)

        if (accessResponse.ok) {
          const accessData = await accessResponse.json()
          console.log(`[Access API] ✓ Access data for course ${courseId}:`, JSON.stringify(accessData))
          accessMap[courseId] = accessData
        } else {
          const errorText = await accessResponse.text()
          console.error(`[Access API] ❌ Failed response for course ${courseId}`)
          console.error(`[Access API] Error body: ${errorText.substring(0, 200)}`)
          // Default to no access if endpoint fails
          accessMap[courseId] = {
            has_access: false,
            reason: 'check_failed'
          }
        }
      } catch (error) {
        console.error(`[Access API] ❌ Exception for course ${courseId}:`, error)
        accessMap[courseId] = {
          has_access: false,
          reason: 'check_failed'
        }
      }
    }

    console.log('[Access API] ✅ FINAL ACCESS MAP:', JSON.stringify(accessMap, null, 2))
    console.log('='.repeat(80))
    return NextResponse.json(accessMap)

  } catch (error) {
    console.error('[Access API] Error checking course access:', error)
    return NextResponse.json(
      { error: 'Failed to check course access' },
      { status: 500 }
    )
  }
}
