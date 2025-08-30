import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { wooClient } from '@/lib/woocommerce/client'

// Proxy handler for WooCommerce Store API (cart/checkout)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params
  const path = '/' + pathSegments.join('/')
  const searchParams = request.nextUrl.searchParams.toString()
  const endpoint = searchParams ? `${path}?${searchParams}` : path
  
  const cookieStore = await cookies()
  const cartToken = cookieStore.get('woo-cart-token')?.value

  try {
    const { data, headers } = await wooClient.storeRequest(endpoint, {}, cartToken)
    
    // Set cart token cookie if returned
    const newCartToken = headers.get('Cart-Token')
    if (newCartToken) {
      cookieStore.set('woo-cart-token', newCartToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Store API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch from Store API' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params
  const path = '/' + pathSegments.join('/')
  const body = await request.json()
  
  const cookieStore = await cookies()
  const cartToken = cookieStore.get('woo-cart-token')?.value

  try {
    const { data, headers } = await wooClient.storeRequest(
      path,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      cartToken
    )
    
    // Set cart token cookie if returned
    const newCartToken = headers.get('Cart-Token')
    if (newCartToken) {
      cookieStore.set('woo-cart-token', newCartToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Store API error:', error)
    return NextResponse.json(
      { error: 'Failed to post to Store API' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params
  const path = '/' + pathSegments.join('/')
  const body = await request.json()
  
  const cookieStore = await cookies()
  const cartToken = cookieStore.get('woo-cart-token')?.value

  try {
    const { data, headers } = await wooClient.storeRequest(
      path,
      {
        method: 'PUT',
        body: JSON.stringify(body),
      },
      cartToken
    )
    
    // Set cart token cookie if returned
    const newCartToken = headers.get('Cart-Token')
    if (newCartToken) {
      cookieStore.set('woo-cart-token', newCartToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Store API error:', error)
    return NextResponse.json(
      { error: 'Failed to update in Store API' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params
  const path = '/' + pathSegments.join('/')
  
  const cookieStore = await cookies()
  const cartToken = cookieStore.get('woo-cart-token')?.value

  try {
    const { data, headers } = await wooClient.storeRequest(
      path,
      {
        method: 'DELETE',
      },
      cartToken
    )
    
    // Set cart token cookie if returned
    const newCartToken = headers.get('Cart-Token')
    if (newCartToken) {
      cookieStore.set('woo-cart-token', newCartToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Store API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete from Store API' },
      { status: 500 }
    )
  }
}