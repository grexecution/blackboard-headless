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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token') // PayPal order ID

    if (!token) {
      throw new Error('No PayPal order ID provided')
    }

    console.log('Capturing PayPal payment for order:', token)

    const accessToken = await getPayPalAccessToken()

    // Capture the payment
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${token}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    const captureData = await response.json()

    if (!response.ok) {
      console.error('PayPal capture failed:', captureData)
      throw new Error(captureData.message || 'Payment capture failed')
    }

    console.log('PayPal capture response:', captureData)

    if (captureData.status === 'COMPLETED') {
      // Get WooCommerce order ID from custom_id
      const customId = captureData.purchase_units[0].custom_id

      console.log('Updating WooCommerce order:', customId)

      // Update WooCommerce order
      const wooUrl = process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL
      const updateUrl = `${wooUrl}/wp-json/wc/v3/orders/${customId}`

      const updateResponse = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'Basic ' +
            Buffer.from(
              `${process.env.WOO_CONSUMER_KEY}:${process.env.WOO_CONSUMER_SECRET}`
            ).toString('base64'),
        },
        body: JSON.stringify({
          status: 'processing',
          transaction_id: captureData.id,
          set_paid: true,
        }),
      })

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json()
        console.error('Failed to update WooCommerce order:', errorData)
        throw new Error(`WooCommerce update failed: ${JSON.stringify(errorData)}`)
      }

      const updatedOrder = await updateResponse.json()
      console.log('WooCommerce order updated successfully:', updatedOrder.id)

      // Add order note about PayPal payment
      const noteUrl = `${wooUrl}/wp-json/wc/v3/orders/${customId}/notes`
      await fetch(noteUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'Basic ' +
            Buffer.from(
              `${process.env.WOO_CONSUMER_KEY}:${process.env.WOO_CONSUMER_SECRET}`
            ).toString('base64'),
        },
        body: JSON.stringify({
          note: `PayPal payment completed. Order ID: ${token}, Transaction ID: ${captureData.id}`,
        }),
      })

      // Redirect to success page
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/order-success?order=${customId}&paypal_id=${token}`
      )
    } else {
      throw new Error(`Payment not completed. Status: ${captureData.status}`)
    }
  } catch (error: any) {
    console.error('PayPal capture error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?error=payment_failed&message=${encodeURIComponent(error.message)}`
    )
  }
}
