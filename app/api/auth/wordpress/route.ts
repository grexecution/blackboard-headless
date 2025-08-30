import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    const wordpressUrl = process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WOO_API_URL?.replace('/wp-json/wc/v3', '')
    
    if (!wordpressUrl) {
      console.error('WordPress URL not configured')
      return NextResponse.json(
        { error: 'Authentication service not configured' },
        { status: 500 }
      )
    }

    // Authenticate with WordPress
    const authResponse = await fetch(`${wordpressUrl}/wp-json/jwt-auth/v1/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    const authData = await authResponse.json()

    if (!authResponse.ok) {
      return NextResponse.json(
        { error: authData.message || 'Authentication failed' },
        { status: authResponse.status }
      )
    }

    // Get user details
    const userResponse = await fetch(`${wordpressUrl}/wp-json/wp/v2/users/me`, {
      headers: {
        'Authorization': `Bearer ${authData.token}`,
      },
    })

    const userData = await userResponse.json()

    return NextResponse.json({
      token: authData.token,
      user: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        name: userData.name,
        first_name: userData.first_name,
        last_name: userData.last_name,
      }
    })

  } catch (error) {
    console.error('WordPress auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}