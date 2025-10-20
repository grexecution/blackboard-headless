'use client'

import { useCurrency, getProductPrice } from '@/lib/currency-context'
import { Product } from '@/lib/woocommerce/products'

interface ProductPriceProps {
  product: Product
  showFrom?: boolean
  className?: string
}

export default function ProductPrice({ product, showFrom = false, className = '' }: ProductPriceProps) {
  const { currency, formatPrice } = useCurrency()

  // Get the appropriate prices based on currency
  const { regularPrice, salePrice, displayPrice, onSale } = getProductPrice(product, currency)

  // Format the display price
  const formattedPrice = formatPrice(
    product.currency_prices?.usd?.regular_price || product.regular_price,
    product.currency_prices?.eur?.regular_price || product.regular_price
  )

  const formattedSalePrice = onSale ? formatPrice(
    product.currency_prices?.usd?.sale_price || product.sale_price,
    product.currency_prices?.eur?.sale_price || product.sale_price
  ) : null

  const formattedRegularPrice = onSale ? formatPrice(
    product.currency_prices?.usd?.regular_price || product.regular_price,
    product.currency_prices?.eur?.regular_price || product.regular_price
  ) : null

  return (
    <div className={className}>
      {showFrom && <span className="text-sm text-gray-500 mr-1">from</span>}
      {onSale && formattedRegularPrice && (
        <span className="text-gray-400 line-through mr-2">
          {formattedRegularPrice}
        </span>
      )}
      <span className="font-bold">
        {onSale && formattedSalePrice ? formattedSalePrice : formattedPrice}
      </span>
    </div>
  )
}
