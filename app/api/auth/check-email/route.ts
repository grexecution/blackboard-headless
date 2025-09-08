import { NextRequest, NextResponse } from 'next/server'
import { wooClient } from '@/lib/woocommerce/client'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { exists: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists in WooCommerce/WordPress
    try {
      // Try to fetch customers with this email
      const customers = await wooClient.request(`/customers?email=${encodeURIComponent(email)}&per_page=1`)

      const userExists = customers && customers.length > 0
      
      return NextResponse.json({
        exists: userExists,
        message: userExists 
          ? 'This email is already registered. Please login or use a different email.'
          : 'No account found. You can create one during checkout.',
        userId: userExists && customers[0] ? customers[0].id : null
      })
    } catch (error: any) {
      // If we get a 404 or empty result, user doesn't exist
      console.log('User check error:', error.message)
      return NextResponse.json({
        exists: false,
        message: 'No account found. You can create one during checkout.'
      })
    }
  } catch (error: any) {
    console.error('Check email error:', error)
    return NextResponse.json(
      { exists: false, error: 'Failed to check email' },
      { status: 500 }
    )
  }
}