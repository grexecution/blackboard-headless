'use client'

import { useSession } from 'next-auth/react'
import { useCart } from '@/lib/cart-context'
import { useCurrency } from '@/lib/currency-context'
import {
  getProductsNearingDiscount,
  getProductsEligibleForDiscount,
  calculateTotalResellerSavings,
} from '@/lib/reseller-pricing'
import { Tag, TrendingDown, ShoppingCart } from 'lucide-react'

export function ResellerCartNotification() {
  const { data: session } = useSession()
  const { items } = useCart()
  const { currency, getCurrencySymbol } = useCurrency()

  const isReseller = session?.user?.role === 'reseller'

  if (!isReseller || items.length === 0) {
    return null
  }

  const nearingDiscount = getProductsNearingDiscount(items, true)
  const eligibleProducts = getProductsEligibleForDiscount(items, true)
  const { totalSavings, itemsWithDiscount } = calculateTotalResellerSavings(
    items,
    currency,
    true
  )

  const currencySymbol = getCurrencySymbol()

  // Show combined notification if there are any reseller products
  const hasActiveDiscounts = itemsWithDiscount > 0
  const hasNearingDiscounts = nearingDiscount.length > 0

  if (!hasActiveDiscounts && !hasNearingDiscounts) {
    return null
  }

  // Show green if any discounts are active, otherwise yellow
  const variant = hasActiveDiscounts ? 'green' : 'yellow'

  return (
    <div className={`sticky top-0 z-10 ${
      variant === 'green'
        ? 'bg-gradient-to-r from-green-900 to-green-700 border-b border-green-600'
        : 'bg-gradient-to-r from-yellow-900 to-yellow-700 border-b border-yellow-600'
    } px-4 py-3`}>
      <div className="flex items-start gap-3">
        <div className={`${
          variant === 'green' ? 'bg-green-500' : 'bg-[#ffed00]'
        } rounded-full p-2 flex-shrink-0`}>
          {variant === 'green' ? (
            <Tag className="h-4 w-4 text-white" />
          ) : (
            <ShoppingCart className="h-4 w-4 text-black" />
          )}
        </div>
        <div className="flex-1">
          {hasActiveDiscounts && (
            <>
              <p className="text-white font-semibold text-sm flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Reseller Discount Active!
              </p>
              <p className={`${variant === 'green' ? 'text-green-100' : 'text-yellow-100'} text-xs mt-1`}>
                You&apos;re saving {currencySymbol}{totalSavings.toFixed(2)} total
              </p>
              <div className="mt-2 space-y-1">
                {eligibleProducts.map((item) => (
                  <div key={item.id} className={`${variant === 'green' ? 'text-green-100' : 'text-yellow-100'} text-xs`}>
                    <span className="font-medium">{item.name}</span> ({item.quantity}x) - Discount applied
                  </div>
                ))}
              </div>
            </>
          )}

          {hasNearingDiscounts && (
            <>
              {hasActiveDiscounts && (
                <p className={`${variant === 'green' ? 'text-green-100' : 'text-yellow-100'} text-xs mt-3 font-semibold`}>
                  Add more to unlock additional discounts:
                </p>
              )}
              {!hasActiveDiscounts && (
                <>
                  <p className="text-white font-semibold text-sm">
                    Reseller Discount Available!
                  </p>
                  <p className="text-yellow-100 text-xs mt-1">
                    Add more products to unlock bulk pricing:
                  </p>
                </>
              )}
              <div className={`${hasActiveDiscounts ? 'mt-1' : 'mt-2'} space-y-1`}>
                {nearingDiscount.map(({ item, quantityNeeded }) => (
                  <div key={item.id} className={`${variant === 'green' ? 'text-green-100' : 'text-yellow-100'} text-xs`}>
                    <span className="font-medium">{item.name}</span> - Add {quantityNeeded} more (currently {item.quantity}x)
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
