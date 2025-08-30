import { NextRequest, NextResponse } from 'next/server'
import { wooClient } from '@/lib/woocommerce/client'

// Proxy handler for WooCommerce REST API
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathArray } = await params
  const path = '/' + pathArray.join('/')
  const searchParams = request.nextUrl.searchParams.toString()
  const endpoint = searchParams ? `${path}?${searchParams}` : path

  try {
    const data = await wooClient.request(endpoint)
    return NextResponse.json(data)
  } catch (error) {
    console.error('WooCommerce API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch from WooCommerce' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathArray } = await params
  const path = '/' + pathArray.join('/')
  const body = await request.json()

  try {
    const data = await wooClient.request(path, {
      method: 'POST',
      body: JSON.stringify(body),
    })
    return NextResponse.json(data)
  } catch (error) {
    console.error('WooCommerce API error:', error)
    return NextResponse.json(
      { error: 'Failed to post to WooCommerce' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathArray } = await params
  const path = '/' + pathArray.join('/')
  const body = await request.json()

  try {
    const data = await wooClient.request(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
    return NextResponse.json(data)
  } catch (error) {
    console.error('WooCommerce API error:', error)
    return NextResponse.json(
      { error: 'Failed to update in WooCommerce' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathArray } = await params
  const path = '/' + pathArray.join('/')

  try {
    const data = await wooClient.request(path, {
      method: 'DELETE',
    })
    return NextResponse.json(data)
  } catch (error) {
    console.error('WooCommerce API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete from WooCommerce' },
      { status: 500 }
    )
  }
}