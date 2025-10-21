import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const { orderId, orderNumber, total, currency, customerEmail } = await request.json()

    console.log('Creating Stripe checkout session for order:', orderNumber)

    // Get Stripe secret key from environment
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured')
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia',
    })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Order #${orderNumber}`,
              description: 'BlackBoard Training Products',
            },
            unit_amount: Math.round(parseFloat(total) * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/order-success?order=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout?canceled=true`,
      customer_email: customerEmail,
      metadata: {
        order_id: orderId.toString(),
        order_number: orderNumber.toString(),
        source: 'nextjs_headless',
        woocommerce_order_id: orderId.toString(),
      },
    })

    console.log('Stripe session created:', session.id)
    console.log('Payment URL:', session.url)

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}
