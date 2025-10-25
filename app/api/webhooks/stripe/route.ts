import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  console.log('Stripe webhook received:', event.type)

  // Handle checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    console.log('Payment successful for session:', session.id)
    console.log('Metadata:', session.metadata)

    const orderId = session.metadata?.order_id || session.metadata?.woocommerce_order_id

    if (!orderId) {
      console.error('No order ID in session metadata')
      return NextResponse.json({ error: 'No order ID' }, { status: 400 })
    }

    try {
      // Update WooCommerce order status to 'processing'
      const wooUrl = process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL
      const updateUrl = `${wooUrl}/wp-json/wc/v3/orders/${orderId}`

      console.log('Updating WooCommerce order:', orderId)

      const response = await fetch(updateUrl, {
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
          transaction_id: session.payment_intent as string,
          set_paid: true,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Failed to update WooCommerce order:', errorData)
        throw new Error(`WooCommerce update failed: ${JSON.stringify(errorData)}`)
      }

      const updatedOrder = await response.json()
      console.log('WooCommerce order updated successfully:', updatedOrder.id)

      // Add order note about Stripe payment
      const noteUrl = `${wooUrl}/wp-json/wc/v3/orders/${orderId}/notes`
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
          note: `Stripe payment completed. Session ID: ${session.id}, Payment Intent: ${session.payment_intent}`,
        }),
      })

      return NextResponse.json({ received: true, orderId, status: 'updated' })
    } catch (error: any) {
      console.error('Error updating order:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
  }

  // Handle payment_intent.succeeded for direct charges
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    console.log('Payment intent succeeded:', paymentIntent.id)
  }

  return NextResponse.json({ received: true })
}
