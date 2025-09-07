import { NextRequest, NextResponse } from 'next/server'
import { wooClient } from '@/lib/woocommerce/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id
    const searchParams = request.nextUrl.searchParams
    const orderKey = searchParams.get('key')

    console.log('Fetching order:', { orderId, orderKey })

    // Fetch order from WooCommerce
    const order = await wooClient.request(`/orders/${orderId}`)

    // Verify order key if provided
    if (orderKey && order.order_key !== orderKey) {
      return NextResponse.json(
        { success: false, error: 'Invalid order key' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        number: order.number,
        status: order.status,
        total: order.total,
        currency: order.currency,
        dateCreated: order.date_created,
        paymentMethod: order.payment_method,
        paymentMethodTitle: order.payment_method_title,
        billing: order.billing,
        shipping: order.shipping,
        lineItems: order.line_items,
      },
    })
  } catch (error: any) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch order' },
      { status: 500 }
    )
  }
}