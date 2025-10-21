import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get client IP from headers
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip')

    // Try to get country from IP using ipapi.co
    const response = await fetch('https://ipapi.co/json/', {
      headers: {
        'User-Agent': 'BlackBoard-Headless/1.0'
      }
    })

    if (response.ok) {
      const data = await response.json()

      return NextResponse.json({
        country: data.country_code || 'DE',
        city: data.city,
        region: data.region
      })
    }

    // Fallback to Germany
    return NextResponse.json({ country: 'DE' })
  } catch (error) {
    console.error('[Geolocation API] Error:', error)
    // Fallback to Germany
    return NextResponse.json({ country: 'DE' })
  }
}
