import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    if (!token?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, method, paypal_email } = body

    if (!amount || !method) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const wpUrl = process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/wp-json/wc/v3', '')
    if (!wpUrl) {
      throw new Error('WordPress URL not configured')
    }

    // Submit payout request to WordPress
    const formData = new FormData()
    formData.append('request_payout', '1')
    formData.append('payout_amount', amount.toString())
    formData.append('payout_method', method)
    if (method === 'paypal' && paypal_email) {
      formData.append('paypal_email', paypal_email)
    }
    formData.append('user_id', token.userId.toString())

    // Call WordPress endpoint to create payout request
    const payoutResponse = await fetch(`${wpUrl}/wp-json/blackboard/v1/affiliate/payout/${token.userId}`, {
      method: 'POST',
      body: formData,
    })

    if (!payoutResponse.ok) {
      const errorData = await payoutResponse.json().catch(() => ({ message: 'Payout request failed' }))
      throw new Error(errorData.message || 'Payout request failed')
    }

    const result = await payoutResponse.json()

    return NextResponse.json({
      success: true,
      message: 'Payout request submitted successfully',
      ...result
    })

  } catch (error: any) {
    console.error('Error processing payout:', error)
    return NextResponse.json({
      error: 'Failed to process payout request',
      details: error.message
    }, { status: 500 })
  }
}

// GET endpoint to fetch payout history
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    if (!token?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const wpUrl = process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/wp-json/wc/v3', '')
    if (!wpUrl) {
      throw new Error('WordPress URL not configured')
    }

    // Fetch payout history from WordPress
    const payoutResponse = await fetch(`${wpUrl}/wp-json/blackboard/v1/affiliate/payouts/${token.userId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!payoutResponse.ok) {
      throw new Error('Failed to fetch payout history')
    }

    const payouts = await payoutResponse.json()

    return NextResponse.json(payouts)

  } catch (error: any) {
    console.error('Error fetching payout history:', error)
    return NextResponse.json({
      error: 'Failed to fetch payout history',
      details: error.message
    }, { status: 500 })
  }
}
