import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    if (!token?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id') || token.userId

    // Fetch certificates for the user
    const certificatesResponse = await fetch(
      `${process.env.WP_BASE_URL}/wp-json/tutor/v1/certificates?user_id=${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${token.jwt}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!certificatesResponse.ok) {
      // If TutorLMS API is not available, return mock data for now
      return NextResponse.json([
        {
          id: 1,
          course_id: 2,
          course_title: "React Fundamentals",
          certificate_url: "/api/certificates/download/1",
          issue_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          certificate_hash: "cert_hash_123",
          grade: "A",
          completion_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          instructor: {
            name: "Jane Smith",
            signature: "/signatures/jane-smith.png"
          },
          student: {
            name: token.name || "Student",
            email: token.email
          },
          status: "issued"
        }
      ])
    }

    const certificates = await certificatesResponse.json()
    return NextResponse.json(certificates)

  } catch (error) {
    console.error('Error fetching certificates:', error)
    return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 })
  }
}