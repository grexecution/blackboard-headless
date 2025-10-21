import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('orderId')

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
  }

  try {
    const wpUrl = process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WOO_API_URL?.replace('/wp-json/wc/v3', '')
    const paymentUrlEndpoint = `${wpUrl}/wp-json/blackboard/v1/orders/${orderId}/payment-url`

    console.log('Fetching payment data from:', paymentUrlEndpoint)

    const response = await fetch(paymentUrlEndpoint)
    const data = await response.json()

    return NextResponse.json({
      success: true,
      endpoint: paymentUrlEndpoint,
      rawResponse: data,
      analysis: {
        hasPaymentUrl: !!data.payment_url,
        paymentUrl: data.payment_url,
        returnUrl: data.return_url,
        redirectType: data.redirect_type,
        paymentMethod: data.payment_method,
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 })
  }
}
