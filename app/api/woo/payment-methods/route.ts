import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get available payment methods from WooCommerce
    const wooUrl = process.env.NEXT_PUBLIC_WOO_API_URL
    const consumerKey = process.env.WOO_CONSUMER_KEY
    const consumerSecret = process.env.WOO_CONSUMER_SECRET

    if (!wooUrl || !consumerKey || !consumerSecret) {
      return NextResponse.json(
        { error: 'WooCommerce configuration missing' },
        { status: 500 }
      )
    }

    const response = await fetch(`${wooUrl}/payment_gateways`, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64'),
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch payment methods')
    }

    const paymentMethods = await response.json()
    
    // Filter to only enabled payment methods
    const enabledMethods = paymentMethods.filter((method: any) => method.enabled === true)

    return NextResponse.json(enabledMethods)
  } catch (error) {
    console.error('Payment methods error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    )
  }
}