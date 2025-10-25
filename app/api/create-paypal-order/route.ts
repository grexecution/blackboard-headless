import { NextRequest, NextResponse } from 'next/server'

const PAYPAL_API = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
  ).toString('base64')

  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${auth}`,
    },
    body: 'grant_type=client_credentials',
  })

  const data = await response.json()
  return data.access_token
}

export async function POST(request: NextRequest) {
  try {
    const { orderId, orderNumber, total, currency } = await request.json()

    console.log('Creating PayPal order for:', orderNumber)

    const accessToken = await getPayPalAccessToken()

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: orderNumber.toString(),
            description: 'BlackBoard Training Products',
            custom_id: orderId.toString(),
            amount: {
              currency_code: currency === 'USD' ? 'USD' : 'EUR',
              value: parseFloat(total).toFixed(2),
            },
          },
        ],
        application_context: {
          brand_name: 'BlackBoard Training',
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/capture-paypal-payment`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?canceled=true`,
        },
      }),
    })

    const order = await response.json()

    if (!response.ok) {
      console.error('PayPal order creation failed:', order)
      throw new Error(order.message || 'PayPal order creation failed')
    }

    console.log('PayPal order created:', order.id)

    return NextResponse.json({
      success: true,
      id: order.id,
      approveLink: order.links.find((link: any) => link.rel === 'approve')?.href,
    })
  } catch (error: any) {
    console.error('PayPal order creation error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
