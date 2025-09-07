import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { wooClient } from '@/lib/woocommerce/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const cookieStore = await cookies()
    let cartToken = cookieStore.get('woo-cart-token')?.value

    // Prepare checkout data for WooCommerce Store API
    const checkoutData = {
      billing_address: {
        first_name: body.billing.firstName,
        last_name: body.billing.lastName,
        address_1: body.billing.address1,
        address_2: body.billing.address2 || '',
        city: body.billing.city,
        state: body.billing.state,
        postcode: body.billing.postcode,
        country: body.billing.country,
        email: body.billing.email,
        phone: body.billing.phone || '',
      },
      shipping_address: body.useShippingAsBilling ? {
        first_name: body.billing.firstName,
        last_name: body.billing.lastName,
        address_1: body.billing.address1,
        address_2: body.billing.address2 || '',
        city: body.billing.city,
        state: body.billing.state,
        postcode: body.billing.postcode,
        country: body.billing.country,
      } : {
        first_name: body.shipping.firstName,
        last_name: body.shipping.lastName,
        address_1: body.shipping.address1,
        address_2: body.shipping.address2 || '',
        city: body.shipping.city,
        state: body.shipping.state,
        postcode: body.shipping.postcode,
        country: body.shipping.country,
      },
      payment_method: body.paymentMethod || 'stripe',
      payment_data: body.paymentData || [],
      customer_note: body.customerNote || '',
    }

    // First, ensure the cart is synced with WooCommerce
    if (body.cartItems && body.cartItems.length > 0) {
      // Clear existing cart
      await wooClient.storeRequest('/cart/items', { method: 'DELETE' }, cartToken)
      
      // Add items to WooCommerce cart
      for (const item of body.cartItems) {
        const cartItem = {
          id: item.variationId || item.productId,
          quantity: item.quantity,
        }
        
        const { data: addedItem, headers: addHeaders } = await wooClient.storeRequest(
          '/cart/add-item',
          {
            method: 'POST',
            body: JSON.stringify(cartItem),
          },
          cartToken
        )
        
        // Update cart token if new one is provided
        const newToken = addHeaders.get('Cart-Token')
        if (newToken) {
          cartToken = newToken
          cookieStore.set('woo-cart-token', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
          })
        }
      }
    }

    // Process checkout with WooCommerce Store API
    const { data: orderData, headers: orderHeaders } = await wooClient.storeRequest(
      '/checkout',
      {
        method: 'POST',
        body: JSON.stringify(checkoutData),
      },
      cartToken
    )

    // Clear cart token after successful checkout
    cookieStore.delete('woo-cart-token')

    // Return the order details
    return NextResponse.json({
      success: true,
      order: {
        id: orderData.order_id || orderData.id,
        orderNumber: orderData.order_number || orderData.order_key,
        status: orderData.status,
        total: orderData.total,
        paymentUrl: orderData.payment_result?.redirect_url,
        paymentMethod: orderData.payment_method,
        billingAddress: orderData.billing_address,
        shippingAddress: orderData.shipping_address,
      },
    })
  } catch (error: any) {
    console.error('Checkout error:', error)
    
    // Parse error message if it's from WooCommerce
    let errorMessage = 'Failed to process checkout'
    let errorCode = 'checkout_error'
    
    if (error.message) {
      try {
        // Try to parse WooCommerce error
        const wooError = JSON.parse(error.message.replace('WooCommerce Store API error: ', ''))
        errorMessage = wooError.message || errorMessage
        errorCode = wooError.code || errorCode
      } catch {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        code: errorCode,
      },
      { status: 400 }
    )
  }
}

// Get checkout fields and configuration
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const cartToken = cookieStore.get('woo-cart-token')?.value

    // Get checkout configuration from WooCommerce
    const { data: checkoutData } = await wooClient.storeRequest(
      '/checkout',
      { method: 'GET' },
      cartToken
    )

    return NextResponse.json({
      fields: checkoutData.fields || {},
      paymentMethods: checkoutData.payment_methods || [],
      shippingMethods: checkoutData.shipping_methods || [],
      needsShipping: checkoutData.needs_shipping || false,
      needsPayment: checkoutData.needs_payment || true,
    })
  } catch (error) {
    console.error('Get checkout config error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch checkout configuration' },
      { status: 500 }
    )
  }
}