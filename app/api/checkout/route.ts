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

    // Determine order status based on payment method
    // For now, we'll mark bank transfer as on-hold (awaiting payment)
    // and other methods as pending until we integrate proper payment processing
    const orderStatus = body.paymentMethod === 'bacs' ? 'on-hold' : 'pending'
    
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
      shipping_lines: [
        {
          method_id: 'flat_rate',
          method_title: body.totalPrice >= 100 ? 'Free Shipping' : 'Flat Rate',
          total: body.totalPrice >= 100 ? '0.00' : '7.95',
        }
      ],
      customer_note: body.customerNote || '',
      customer_id: body.customerId || 0, // Link to WooCommerce customer if logged in
      status: orderStatus,
      meta_data: [
        {
          key: '_headless_return_url',
          value: process.env.NEXTAUTH_URL || 'https://blackboard-headless.vercel.app',
        },
        {
          key: '_payment_source',
          value: 'nextjs_checkout',
        },
        {
          key: '_payment_method_used',
          value: body.paymentMethod,
        },
        {
          key: '_awaiting_payment',
          value: body.paymentMethod !== 'bacs' ? 'yes' : 'no',
        },
        // Store payment intent ID if using Stripe (would come from Stripe.js integration)
        ...(body.paymentIntentId ? [{
          key: '_stripe_intent_id',
          value: body.paymentIntentId,
        }] : []),
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
    console.log('Payment method:', body.paymentMethod)

    // For headless checkout, we don't redirect to WooCommerce
    // Instead, we handle everything on our side
    // The order is created with appropriate status:
    // - 'on-hold' for bank transfer (awaiting payment)
    // - 'pending' for other methods (payment to be processed)
    
    // In a production environment, you would:
    // 1. For Stripe: Use Stripe.js to process payment client-side
    // 2. For PayPal: Use PayPal SDK to process payment
    // 3. For Bank Transfer: Show bank details for manual transfer
    
    // For now, we'll just return success and show order confirmation

    // Return the order details without payment URL
    // The frontend will handle the success flow
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.number,
        orderKey: order.order_key,
        status: order.status,
        total: order.total,
        paymentMethod: order.payment_method,
        paymentMethodTitle: order.payment_method_title,
        billingAddress: order.billing,
        shippingAddress: order.shipping,
        // Include bank details if bank transfer
        bankDetails: body.paymentMethod === 'bacs' ? {
          accountName: 'BlackBoard Training GmbH',
          iban: 'DE89 3704 0044 0532 0130 00',
          bic: 'COBADEFFXXX',
          bank: 'Commerzbank',
          reference: `Order #${order.number}`,
        } : null,
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