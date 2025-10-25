import { NextRequest, NextResponse } from 'next/server'
import { wooClient } from '@/lib/woocommerce/client'

export async function POST(request: NextRequest) {
  try {
    const { couponCode, cartItems, customerId } = await request.json()

    if (!couponCode || couponCode.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Coupon code is required' },
        { status: 400 }
      )
    }

    console.log('Validating coupon:', couponCode)

    // Fetch coupon from WooCommerce
    let coupon
    try {
      const coupons = await wooClient.request(`/coupons?code=${encodeURIComponent(couponCode.trim())}`, {
        method: 'GET',
      })

      if (!coupons || coupons.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid coupon code' },
          { status: 400 }
        )
      }

      coupon = coupons[0]
    } catch (error: any) {
      console.error('Error fetching coupon:', error)
      return NextResponse.json(
        { success: false, error: 'Invalid coupon code' },
        { status: 400 }
      )
    }

    console.log('Coupon found:', coupon.code)

    // Validate coupon
    const now = new Date()
    const validationErrors: string[] = []

    // Check if coupon exists and has valid ID
    if (!coupon.id) {
      validationErrors.push('Invalid coupon')
    }

    // Check expiry date
    if (coupon.date_expires && new Date(coupon.date_expires) < now) {
      validationErrors.push('This coupon has expired')
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      validationErrors.push('This coupon has reached its usage limit')
    }

    // Check usage limit per user
    if (customerId && coupon.usage_limit_per_user) {
      // Note: We'd need to check WooCommerce order history for this user
      // For now, we'll skip this validation as it requires additional API calls
    }

    // Check if coupon allows free shipping
    const freeShipping = coupon.free_shipping || false

    // Check minimum spend
    if (coupon.minimum_amount) {
      const cartTotal = cartItems.reduce((sum: number, item: any) => {
        return sum + (parseFloat(item.price) * item.quantity)
      }, 0)

      if (cartTotal < parseFloat(coupon.minimum_amount)) {
        validationErrors.push(
          `Minimum spend of ${coupon.minimum_amount} required (current: ${cartTotal.toFixed(2)})`
        )
      }
    }

    // Check maximum spend (only if maximum_amount is set and greater than 0)
    if (coupon.maximum_amount && parseFloat(coupon.maximum_amount) > 0) {
      const cartTotal = cartItems.reduce((sum: number, item: any) => {
        return sum + (parseFloat(item.price) * item.quantity)
      }, 0)

      if (cartTotal > parseFloat(coupon.maximum_amount)) {
        validationErrors.push(
          `Maximum spend of ${coupon.maximum_amount} exceeded`
        )
      }
    }

    // Check individual use
    if (coupon.individual_use) {
      // This would prevent combining with other coupons
      // Frontend should handle this by clearing other coupons
    }

    // Check product restrictions
    if (coupon.product_ids && coupon.product_ids.length > 0) {
      const hasValidProduct = cartItems.some((item: any) =>
        coupon.product_ids.includes(item.productId)
      )
      if (!hasValidProduct) {
        validationErrors.push('This coupon is not valid for items in your cart')
      }
    }

    // Check excluded products
    if (coupon.excluded_product_ids && coupon.excluded_product_ids.length > 0) {
      const hasExcludedProduct = cartItems.some((item: any) =>
        coupon.excluded_product_ids.includes(item.productId)
      )
      if (hasExcludedProduct) {
        validationErrors.push('This coupon cannot be used with some items in your cart')
      }
    }

    // Check product categories (if needed)
    // This would require fetching product category data

    // If there are validation errors, return them
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, error: validationErrors[0] },
        { status: 400 }
      )
    }

    // Calculate discount amount
    let discountAmount = 0
    const cartSubtotal = cartItems.reduce((sum: number, item: any) => {
      return sum + (parseFloat(item.price) * item.quantity)
    }, 0)

    if (coupon.discount_type === 'percent') {
      // Percentage discount
      discountAmount = (cartSubtotal * parseFloat(coupon.amount)) / 100
    } else if (coupon.discount_type === 'fixed_cart') {
      // Fixed cart discount
      discountAmount = parseFloat(coupon.amount)
    } else if (coupon.discount_type === 'fixed_product') {
      // Fixed product discount (applies to each valid item)
      const validItems = cartItems.filter((item: any) => {
        if (coupon.product_ids && coupon.product_ids.length > 0) {
          return coupon.product_ids.includes(item.productId)
        }
        if (coupon.excluded_product_ids && coupon.excluded_product_ids.length > 0) {
          return !coupon.excluded_product_ids.includes(item.productId)
        }
        return true
      })

      discountAmount = validItems.reduce((sum: number, item: any) => {
        return sum + (parseFloat(coupon.amount) * item.quantity)
      }, 0)
    }

    // Ensure discount doesn't exceed cart total
    if (discountAmount > cartSubtotal) {
      discountAmount = cartSubtotal
    }

    console.log('Coupon valid. Discount amount:', discountAmount)

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        amount: coupon.amount,
        discountType: coupon.discount_type,
        description: coupon.description || '',
        freeShipping: freeShipping,
        discountAmount: discountAmount,
        individualUse: coupon.individual_use || false,
      },
    })
  } catch (error: any) {
    console.error('Coupon validation error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to validate coupon' },
      { status: 500 }
    )
  }
}
