'use client'

import { useCurrency } from '@/lib/currency-context'
import { Product, ProductVariation } from '@/lib/woocommerce/products'

interface ProductPriceDisplayProps {
  product: Product
  variation?: ProductVariation
  variations?: ProductVariation[]
  className?: string
  showFrom?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ProductPriceDisplay({
  product,
  variation,
  variations,
  className = '',
  showFrom = false,
  size = 'md'
}: ProductPriceDisplayProps) {
  const { currency, formatPrice } = useCurrency()

  // If a specific variation is provided, show only that variation's price
  if (variation) {
    const usdRegularPrice = variation.currency_prices?.usd?.regular_price || variation.regular_price
    const usdSalePrice = variation.currency_prices?.usd?.sale_price || variation.sale_price
    const eurRegularPrice = variation.currency_prices?.eur?.regular_price || variation.regular_price
    const eurSalePrice = variation.currency_prices?.eur?.sale_price || variation.sale_price

    const regularPrice = currency === 'USD'
      ? (usdRegularPrice || eurRegularPrice)
      : (eurRegularPrice || usdRegularPrice)

    const salePrice = currency === 'USD'
      ? (usdSalePrice || eurSalePrice)
      : (eurSalePrice || usdSalePrice)

    const onSale = !!(salePrice && parseFloat(salePrice) > 0 && parseFloat(salePrice) < parseFloat(regularPrice || '0'))
    const displayPrice = formatPrice(usdRegularPrice, eurRegularPrice)
    const displaySalePrice = onSale ? formatPrice(usdSalePrice, eurSalePrice) : null

    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-xl sm:text-2xl',
      lg: 'text-3xl sm:text-4xl'
    }

    return (
      <div className={`flex items-baseline gap-2 ${className}`}>
        {showFrom && <span className="text-sm text-gray-500 font-normal">from</span>}
        {onSale && displaySalePrice && (
          <span className={`text-gray-400 line-through ${sizeClasses[size]}`}>
            {displayPrice}
          </span>
        )}
        <span className={`font-bold ${sizeClasses[size]}`}>
          {onSale && displaySalePrice ? displaySalePrice : displayPrice}
        </span>
      </div>
    )
  }

  // For variable products with variations array, show minimum price with "starting from"
  if (variations && variations.length > 0) {
    // Get all prices in the current currency
    const prices = variations.map(v => {
      const usdPrice = v.currency_prices?.usd?.regular_price || v.regular_price || v.price
      const eurPrice = v.currency_prices?.eur?.regular_price || v.regular_price || v.price
      const price = currency === 'USD' ? (usdPrice || eurPrice) : (eurPrice || usdPrice)
      return parseFloat(price || '0')
    }).filter(p => p > 0)

    if (prices.length === 0) {
      // Fallback to product price if no variation prices
      const usdRegularPrice = product.currency_prices?.usd?.regular_price || product.regular_price || product.price
      const eurRegularPrice = product.currency_prices?.eur?.regular_price || product.regular_price || product.price
      const displayPrice = formatPrice(usdRegularPrice, eurRegularPrice)

      const sizeClasses = {
        sm: 'text-sm',
        md: 'text-lg',
        lg: 'text-3xl sm:text-4xl'
      }

      return (
        <div className={`flex items-baseline gap-2 ${className}`}>
          {showFrom && <span className="text-sm text-gray-500 font-normal">starting from</span>}
          <span className={`font-bold ${sizeClasses[size]}`}>
            {displayPrice}
          </span>
        </div>
      )
    }

    const minPrice = Math.min(...prices)

    // Get the variation with minimum price to get proper currency prices
    const minVariation = variations.find(v => {
      const usdPrice = v.currency_prices?.usd?.regular_price || v.regular_price || v.price
      const eurPrice = v.currency_prices?.eur?.regular_price || v.regular_price || v.price
      const price = currency === 'USD' ? (usdPrice || eurPrice) : (eurPrice || usdPrice)
      return parseFloat(price || '0') === minPrice
    })

    const minUsdPrice = minVariation?.currency_prices?.usd?.regular_price || minVariation?.regular_price || minVariation?.price || '0'
    const minEurPrice = minVariation?.currency_prices?.eur?.regular_price || minVariation?.regular_price || minVariation?.price || '0'

    const formattedMinPrice = formatPrice(minUsdPrice, minEurPrice)

    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-xl sm:text-2xl',
      lg: 'text-3xl sm:text-4xl'
    }

    // Show only minimum price with "starting from" text
    return (
      <div className={`flex items-baseline gap-2 ${className}`}>
        {showFrom && <span className="text-sm text-gray-500 font-normal">starting from</span>}
        <span className={`font-bold ${sizeClasses[size]}`}>
          {formattedMinPrice}
        </span>
      </div>
    )
  }

  // For simple products or no variations, show single price
  const usdRegularPrice = product.currency_prices?.usd?.regular_price || product.regular_price
  const usdSalePrice = product.currency_prices?.usd?.sale_price || product.sale_price
  const eurRegularPrice = product.currency_prices?.eur?.regular_price || product.regular_price
  const eurSalePrice = product.currency_prices?.eur?.sale_price || product.sale_price

  const regularPrice = currency === 'USD'
    ? (usdRegularPrice || eurRegularPrice)
    : (eurRegularPrice || usdRegularPrice)

  const salePrice = currency === 'USD'
    ? (usdSalePrice || eurSalePrice)
    : (eurSalePrice || usdSalePrice)

  const onSale = !!(salePrice && parseFloat(salePrice) > 0 && parseFloat(salePrice) < parseFloat(regularPrice || '0'))
  const displayPrice = formatPrice(usdRegularPrice, eurRegularPrice)
  const displaySalePrice = onSale ? formatPrice(usdSalePrice, eurSalePrice) : null

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-3xl sm:text-4xl'
  }

  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      {showFrom && <span className="text-sm text-gray-500">from</span>}
      {onSale && displaySalePrice && (
        <span className={`text-gray-400 line-through ${sizeClasses[size]}`}>
          {displayPrice}
        </span>
      )}
      <span className={`font-bold ${sizeClasses[size]}`}>
        {onSale && displaySalePrice ? displaySalePrice : displayPrice}
      </span>
    </div>
  )
}
