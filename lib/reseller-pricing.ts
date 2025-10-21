import { CartItem } from './cart-context'
import { ResellerPricing } from './woocommerce/products'

/**
 * Check if reseller pricing should be applied to a cart item
 */
export function shouldApplyResellerPricing(
  item: CartItem,
  isReseller: boolean
): boolean {
  if (!isReseller || !item.reseller_pricing) {
    return false
  }

  const { enabled, min_quantity } = item.reseller_pricing

  return enabled && item.quantity >= min_quantity
}

/**
 * Calculate the effective price for a cart item with reseller pricing
 */
export function calculateResellerPrice(
  item: CartItem,
  currency: 'USD' | 'EUR',
  isReseller: boolean
): {
  price: number
  originalPrice: number
  hasDiscount: boolean
  discountAmount: number
  discountPercentage: number
} {
  // Get the regular price based on currency
  const originalPriceStr =
    currency === 'USD'
      ? item.currency_prices?.usd.regular_price || '0'
      : item.currency_prices?.eur.regular_price || '0'

  const originalPrice = parseFloat(originalPriceStr)

  // Check if reseller pricing applies
  if (!shouldApplyResellerPricing(item, isReseller)) {
    return {
      price: originalPrice,
      originalPrice,
      hasDiscount: false,
      discountAmount: 0,
      discountPercentage: 0,
    }
  }

  // Get reseller price
  const resellerPriceStr =
    currency === 'USD'
      ? item.reseller_pricing?.price_usd || '0'
      : item.reseller_pricing?.price_eur || '0'

  const resellerPrice = parseFloat(resellerPriceStr)

  // Calculate discount
  const discountAmount = originalPrice - resellerPrice
  const discountPercentage =
    originalPrice > 0 ? (discountAmount / originalPrice) * 100 : 0

  return {
    price: resellerPrice,
    originalPrice,
    hasDiscount: true,
    discountAmount,
    discountPercentage,
  }
}

/**
 * Get all products in cart that have reseller pricing available
 */
export function getProductsWithResellerPricing(
  items: CartItem[]
): CartItem[] {
  return items.filter(
    (item) => item.reseller_pricing?.enabled && !item.isFreebie
  )
}

/**
 * Get products that are eligible for reseller discount (meet min quantity)
 */
export function getProductsEligibleForDiscount(
  items: CartItem[],
  isReseller: boolean
): CartItem[] {
  if (!isReseller) return []

  return items.filter((item) => shouldApplyResellerPricing(item, isReseller))
}

/**
 * Get products that can qualify for discount if more are added
 */
export function getProductsNearingDiscount(
  items: CartItem[],
  isReseller: boolean
): Array<{
  item: CartItem
  quantityNeeded: number
}> {
  if (!isReseller) return []

  return items
    .filter((item) => {
      if (!item.reseller_pricing?.enabled || item.isFreebie) return false
      return item.quantity < item.reseller_pricing.min_quantity
    })
    .map((item) => ({
      item,
      quantityNeeded: item.reseller_pricing!.min_quantity - item.quantity,
    }))
}

/**
 * Calculate total savings from reseller pricing
 */
export function calculateTotalResellerSavings(
  items: CartItem[],
  currency: 'USD' | 'EUR',
  isReseller: boolean
): {
  totalSavings: number
  itemsWithDiscount: number
} {
  let totalSavings = 0
  let itemsWithDiscount = 0

  items.forEach((item) => {
    if (item.isFreebie) return

    const priceInfo = calculateResellerPrice(item, currency, isReseller)
    if (priceInfo.hasDiscount) {
      totalSavings += priceInfo.discountAmount * item.quantity
      itemsWithDiscount++
    }
  })

  return {
    totalSavings,
    itemsWithDiscount,
  }
}
