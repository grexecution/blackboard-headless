import { NextRequest, NextResponse } from 'next/server'
import { wooClient } from '@/lib/woocommerce/client'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params
    const body = await request.json()
    
    const {
      transactionId,
      paymentMethod,
      amount,
      currency = 'EUR',
      status = 'completed'
    } = body

    console.log('Completing payment for order:', orderId, {
      transactionId,
      paymentMethod,
      amount,
      status
    })

    // Update order with payment information
    // CRITICAL: transaction_id is required for WooCommerce refunds to work!
    const updateData: any = {
      status: status === 'completed' ? 'processing' : 'on-hold',
      transaction_id: transactionId, // This enables refunds in WooCommerce
      date_paid: new Date().toISOString(),
      date_paid_gmt: new Date().toISOString(),
      payment_method: paymentMethod, // Update payment method if needed
      payment_method_title: paymentMethod === 'stripe' ? 'Credit Card (Stripe)' : 
                           paymentMethod === 'paypal' ? 'PayPal' : 
                           paymentMethod === 'bacs' ? 'Direct Bank Transfer' : 'Manual',
      meta_data: [
        {
          key: '_stripe_charge_id',
          value: paymentMethod === 'stripe' ? transactionId : ''
        },
        {
          key: '_stripe_source_id', // Some Stripe integrations look for this
          value: paymentMethod === 'stripe' ? transactionId : ''
        },
        {
          key: '_paypal_transaction_id',
          value: paymentMethod === 'paypal' ? transactionId : ''
        },
        {
          key: '_paypal_status', // PayPal plugins often check this
          value: paymentMethod === 'paypal' ? 'completed' : ''
        },
        {
          key: '_payment_method',
          value: paymentMethod
        },
        {
          key: '_paid_amount',
          value: amount
        },
        {
          key: '_paid_currency',
          value: currency
        },
        {
          key: '_payment_completed_at',
          value: new Date().toISOString()
        }
      ]
    }

    // If payment is completed, mark as paid
    if (status === 'completed') {
      updateData.set_paid = true
    }

    // Update the order in WooCommerce
    const updatedOrder = await wooClient.request(`/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    })

    // Add order note about payment
    const noteData = {
      note: `Payment ${status} via ${paymentMethod}. Transaction ID: ${transactionId}. Amount: ${currency} ${amount}`,
      customer_note: false
    }

    await wooClient.request(`/orders/${orderId}/notes`, {
      method: 'POST',
      body: JSON.stringify(noteData)
    })

    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        transactionId: updatedOrder.transaction_id,
        datePaid: updatedOrder.date_paid,
        total: updatedOrder.total
      }
    })
  } catch (error: any) {
    console.error('Error completing payment:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to complete payment' 
      },
      { status: 500 }
    )
  }
}