import { NextRequest, NextResponse } from 'next/server'
import { wooClient } from '@/lib/woocommerce/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Checkout request received:', {
      paymentMethod: body.paymentMethod,
      hasCartItems: body.cartItems?.length > 0,
      billingCountry: body.billing?.country,
    })

    // Prepare order data for WooCommerce REST API v3
    const orderData = {
      payment_method: body.paymentMethod || 'bacs',
      payment_method_title: body.paymentMethod === 'stripe' ? 'Credit Card (Stripe)' : 
                           body.paymentMethod === 'paypal' ? 'PayPal' : 'Direct Bank Transfer',
      set_paid: false,
      billing: {
        first_name: body.billing.firstName,
        last_name: body.billing.lastName,
        address_1: body.billing.address1,
        address_2: body.billing.address2 || '',
        city: body.billing.city,
        state: body.billing.state || '',
        postcode: body.billing.postcode,
        country: body.billing.country,
        email: body.billing.email,
        phone: body.billing.phone || '',
      },
      shipping: body.useShippingAsBilling ? {
        first_name: body.billing.firstName,
        last_name: body.billing.lastName,
        address_1: body.billing.address1,
        address_2: body.billing.address2 || '',
        city: body.billing.city,
        state: body.billing.state || '',
        postcode: body.billing.postcode,
        country: body.billing.country,
      } : {
        first_name: body.shipping.firstName,
        last_name: body.shipping.lastName,
        address_1: body.shipping.address1,
        address_2: body.shipping.address2 || '',
        city: body.shipping.city,
        state: body.shipping.state || '',
        postcode: body.shipping.postcode,
        country: body.shipping.country,
      },
      line_items: body.cartItems
        .filter((item: any) => !item.isFreebie) // Skip freebie items
        .map((item: any) => ({
          product_id: item.productId,
          variation_id: item.variationId || undefined,
          quantity: item.quantity,
        })),
      customer_note: body.customerNote || '',
      status: 'pending',
      meta_data: [
        {
          key: '_headless_return_url',
          value: process.env.NEXTAUTH_URL || 'https://blackboard-headless.vercel.app',
        },
        {
          key: '_payment_source',
          value: 'nextjs_checkout',
        },
      ],
    }

    console.log('Creating order with WooCommerce REST API...')
    console.log('Order data:', JSON.stringify(orderData, null, 2))

    // Create order using WooCommerce REST API
    const order = await wooClient.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    })

    console.log('Order created successfully:', order.id)
    console.log('Order key:', order.order_key)
    console.log('Order status:', order.status)
    console.log('Order links:', order._links ? Object.keys(order._links) : 'No links')

    // Generate payment URL for payment gateways
    let paymentUrl = null
    
    // For payment methods that require payment processing, redirect to WooCommerce
    if (body.paymentMethod === 'paypal' || body.paymentMethod === 'stripe') {
      // Build the return URL for after payment
      const returnUrl = process.env.NEXTAUTH_URL || 'https://blackboard-headless.vercel.app'
      const successUrl = `${returnUrl}/payment-complete?order_id=${order.id}&key=${order.order_key}&status=success`
      const cancelUrl = `${returnUrl}/payment-complete?order_id=${order.id}&status=cancelled`
      
      // Get the payment URL from the order if it exists
      // WooCommerce should provide the payment URL in the order response
      if (order._links && order._links.payment) {
        paymentUrl = order._links.payment[0].href
        console.log('Using WooCommerce payment URL:', paymentUrl)
      } else {
        // Construct the WordPress checkout URL on the main domain
        // Try both German (/kasse/) and English (/checkout/) paths
        const wpBaseUrl = process.env.WP_BASE_URL || 'https://blackboard-training.com'
        
        // German WooCommerce sites often use /kasse/ instead of /checkout/
        // Let's try the German path first since this is a German site
        paymentUrl = `${wpBaseUrl}/kasse/order-pay/${order.id}/?pay_for_order=true&key=${order.order_key}`
        console.log('Payment URL generated (German path):', paymentUrl)
        
        // Alternative: If the above doesn't work, the site might use English paths
        // paymentUrl = `${wpBaseUrl}/checkout/order-pay/${order.id}/?pay_for_order=true&key=${order.order_key}`
      }
    }
    // For bank transfer (bacs), no immediate payment needed
    else if (body.paymentMethod === 'bacs') {
      // Bank transfer doesn't need immediate payment
      paymentUrl = null
    }

    // Return the order details
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.number,
        orderKey: order.order_key,
        status: order.status,
        total: order.total,
        paymentUrl: paymentUrl,
        paymentMethod: order.payment_method,
        billingAddress: order.billing,
        shippingAddress: order.shipping,
      },
    })
  } catch (error: any) {
    console.error('Checkout error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
    })
    
    // Parse error message
    let errorMessage = 'Failed to process checkout'
    let errorCode = 'checkout_error'
    let errorDetails: any = {}
    
    if (error.message) {
      errorMessage = error.message
    }
    
    // Check for specific WooCommerce errors
    if (error.response) {
      console.error('WooCommerce response error:', error.response)
      errorMessage = error.response.message || errorMessage
      errorCode = error.response.code || errorCode
      errorDetails = error.response.data || {}
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        code: errorCode,
        details: errorDetails,
      },
      { status: 400 }
    )
  }
}

// Get available payment methods
export async function GET(request: NextRequest) {
  try {
    // Get payment gateways from WooCommerce
    const paymentGateways = await wooClient.request('/payment_gateways')
    
    // Filter to only enabled gateways
    const enabledGateways = paymentGateways.filter((gateway: any) => gateway.enabled)
    
    // Return simplified payment method data
    return NextResponse.json({
      paymentMethods: enabledGateways.map((gateway: any) => ({
        id: gateway.id,
        title: gateway.title,
        description: gateway.description,
        enabled: gateway.enabled,
      })),
      shippingMethods: [], // You can fetch shipping methods if needed
      needsShipping: true,
      needsPayment: true,
    })
  } catch (error) {
    console.error('Get checkout config error:', error)
    
    // Return default payment methods if API fails
    return NextResponse.json({
      paymentMethods: [
        {
          id: 'bacs',
          title: 'Direct Bank Transfer',
          description: 'Make your payment directly into our bank account.',
          enabled: true,
        },
        {
          id: 'stripe',
          title: 'Credit Card (Stripe)',
          description: 'Pay with your credit card via Stripe.',
          enabled: true,
        },
        {
          id: 'paypal',
          title: 'PayPal',
          description: 'Pay via PayPal; you can pay with your credit card if you don\'t have a PayPal account.',
          enabled: true,
        },
      ],
      shippingMethods: [],
      needsShipping: true,
      needsPayment: true,
    })
  }
}