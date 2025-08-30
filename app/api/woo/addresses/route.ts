import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    if (!token?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customer_id') || token.userId

    // Fetch customer details including billing and shipping addresses
    const customerResponse = await fetch(
      `${process.env.WP_BASE_URL}/wp-json/wc/v3/customers/${customerId}`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${process.env.WOO_CONSUMER_KEY}:${process.env.WOO_CONSUMER_SECRET}`
          ).toString('base64')}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!customerResponse.ok) {
      throw new Error('Failed to fetch customer data')
    }

    const customer = await customerResponse.json()
    
    return NextResponse.json({
      billing: customer.billing,
      shipping: customer.shipping
    })

  } catch (error) {
    console.error('Error fetching addresses:', error)
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    if (!token?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, address } = body // type: 'billing' or 'shipping'

    // Update customer address
    const updateResponse = await fetch(
      `${process.env.WORDPRESS_API_URL}/wp-json/wc/v3/customers/${token.userId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
          ).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [type]: address
        })
      }
    )

    if (!updateResponse.ok) {
      throw new Error('Failed to update address')
    }

    const updatedCustomer = await updateResponse.json()
    
    return NextResponse.json({
      billing: updatedCustomer.billing,
      shipping: updatedCustomer.shipping
    })

  } catch (error) {
    console.error('Error updating address:', error)
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 })
  }
}