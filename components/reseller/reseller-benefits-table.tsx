'use client'

import { useEffect, useState } from 'react'
import { Product } from '@/lib/woocommerce/products'
import { useCurrency } from '@/lib/currency-context'
import { Tag, TrendingDown, Package } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface ResellerBenefitsTableProps {
  className?: string
}

export function ResellerBenefitsTable({
  className = '',
}: ResellerBenefitsTableProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { currency, getCurrencySymbol, formatPrice } = useCurrency()

  const currencySymbol = getCurrencySymbol()

  useEffect(() => {
    // Fetch products with reseller pricing
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/woo/products?per_page=100')
        const data = await response.json()

        // Filter products that have reseller pricing enabled
        const productsWithResellerPricing = data.filter(
          (product: Product) =>
            product.reseller_pricing?.enabled &&
            product.reseller_pricing.min_quantity > 0
        )

        setProducts(productsWithResellerPricing)
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) {
    return (
      <div className={`bg-white rounded-xl border shadow-sm p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Tag className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-bold">Reseller Benefits</h2>
        </div>
        <p className="text-gray-500 text-sm">Loading your reseller pricing...</p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className={`bg-white rounded-xl border shadow-sm p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Tag className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-bold">Reseller Benefits</h2>
        </div>
        <p className="text-gray-500 text-sm">
          No reseller pricing available at this time.
        </p>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl border shadow-sm ${className}`}>
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-green-100 rounded-full p-2">
            <Tag className="h-5 w-5 text-green-600" />
          </div>
          <h2 className="text-lg font-bold">Your Reseller Benefits</h2>
        </div>
        <p className="text-gray-600 text-sm">
          As a reseller, you get special pricing when purchasing in bulk. Here
          are all products with reseller discounts:
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-3 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Product
              </th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Min Qty
              </th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Regular Price
              </th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Reseller Price
              </th>
              <th className="text-right py-3 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Savings
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => {
              // Get currency-specific prices with proper fallback
              const usdRegular = product.currency_prices?.usd?.regular_price || product.regular_price || ''
              const eurRegular = product.currency_prices?.eur?.regular_price || product.regular_price || ''

              const regularPriceStr = currency === 'USD'
                ? (usdRegular || eurRegular)
                : (eurRegular || usdRegular)

              const regularPrice = parseFloat(regularPriceStr) || 0

              const resellerPrice =
                currency === 'USD'
                  ? parseFloat(product.reseller_pricing?.price_usd || '0')
                  : parseFloat(product.reseller_pricing?.price_eur || '0')

              const savings = regularPrice - resellerPrice
              const savingsPercent =
                regularPrice > 0 ? (savings / regularPrice) * 100 : 0

              return (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <Link
                      href={`/shop/${product.slug}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="relative h-12 w-12 flex-shrink-0 rounded-md border overflow-hidden">
                        {product.images[0]?.src ? (
                          <Image
                            src={product.images[0].src}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium group-hover:text-[#ffed00] transition-colors">
                        {product.name}
                      </span>
                    </Link>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center justify-center bg-gray-100 rounded-full px-3 py-1 text-xs font-semibold text-gray-700">
                      {product.reseller_pricing?.min_quantity}+
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-sm text-gray-500 line-through">
                      {currencySymbol}
                      {regularPrice.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-sm font-semibold text-green-600">
                      {currencySymbol}
                      {resellerPrice.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-green-600 flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" />
                        {currencySymbol}
                        {savings.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({savingsPercent.toFixed(0)}% off)
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t bg-gray-50 p-6">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
            <Package className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-1">
              How it works:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>
                Add products to your cart and reach the minimum quantity
              </li>
              <li>Reseller pricing will be automatically applied</li>
              <li>Discounts are shown clearly in your cart</li>
              <li>Mix and match - discounts apply per product</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
