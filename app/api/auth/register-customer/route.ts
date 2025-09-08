import { NextRequest, NextResponse } from 'next/server'
import { wooClient } from '@/lib/woocommerce/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      email, 
      password,
      firstName, 
      lastName,
      billing,
      shipping,
      createAccount = true
    } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Create customer in WooCommerce
    // WooCommerce will handle password hashing and WordPress user creation
    try {
      const customerData = {
        email: email,
        first_name: firstName || billing?.firstName || '',
        last_name: lastName || billing?.lastName || '',
        username: email.split('@')[0] + '_' + Date.now(), // Generate unique username
        password: password, // WooCommerce will hash this
        billing: billing ? {
          first_name: billing.firstName,
          last_name: billing.lastName,
          address_1: billing.address1,
          address_2: billing.address2 || '',
          city: billing.city,
          state: billing.state || '',
          postcode: billing.postcode,
          country: billing.country,
          email: email,
          phone: billing.phone || '',
        } : {},
        shipping: shipping ? {
          first_name: shipping.firstName,
          last_name: shipping.lastName,
          address_1: shipping.address1,
          address_2: shipping.address2 || '',
          city: shipping.city,
          state: shipping.state || '',
          postcode: shipping.postcode,
          country: shipping.country,
        } : {},
        meta_data: [
          {
            key: 'created_via',
            value: 'nextjs_checkout'
          },
          {
            key: 'account_created_at_checkout',
            value: 'yes'
          }
        ],
        role: 'customer' // Explicitly set role to customer
      }

      console.log('Creating WooCommerce customer:', { email, username: customerData.username })

      const customer = await wooClient.request('/customers', {
        method: 'POST',
        body: JSON.stringify(customerData)
      })

      console.log('Customer created successfully:', customer.id)

      // WooCommerce automatically:
      // 1. Creates WordPress user with 'customer' role
      // 2. Hashes the password properly
      // 3. Sends new account email (if configured)

      return NextResponse.json({
        success: true,
        customer: {
          id: customer.id,
          email: customer.email,
          username: customer.username,
          firstName: customer.first_name,
          lastName: customer.last_name
        },
        message: 'Account created successfully'
      })
    } catch (error: any) {
      console.error('Customer creation error:', error)
      
      // Check if it's a duplicate email error
      if (error.message && error.message.includes('already')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'An account with this email already exists. Please login instead.' 
          },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { 
          success: false, 
          error: error.message || 'Failed to create account' 
        },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Register customer error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create account' },
      { status: 500 }
    )
  }
}