import { Product, ProductVariation } from '@/lib/woocommerce/products'
import { useCurrency } from '@/lib/currency-context'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Gift } from 'lucide-react'

interface ProductCardProps {
  product: Product & { variationData?: ProductVariation[] }
  getDisplayName: (name: string) => string
}

export default function ProductCard({ product, getDisplayName }: ProductCardProps) {
  const { getCurrencySymbol } = useCurrency()
  const currencySymbol = getCurrencySymbol()

  const isProfessional = product.name.toLowerCase().includes('professional')

  return (
    <div
      className={`group relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
        isProfessional ? 'border-2 border-[#ffed00]' : 'border border-gray-200 hover:border-gray-300'
      }`}
    >
      {isProfessional && (
        <div className="absolute top-4 right-4 z-10">
          <span className="bg-gradient-to-r from-[#ffed00] to-yellow-500 text-black px-4 py-2 rounded-full text-sm font-bold animate-pulse">
            MOST POPULAR
          </span>
        </div>
      )}

      {/* Product Image */}
      <div className="relative h-56 sm:h-80 lg:h-96 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {product.images[0] && (
          <Image
            src={product.images[0].src}
            alt={product.images[0].alt || getDisplayName(product.name)}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Freebie Badge */}
        <div className="absolute bottom-4 left-4 right-4 transform transition-transform duration-300 group-hover:translate-y-[-4px]">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-2 sm:p-3 shadow-lg group-hover:bg-white transition-colors">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 animate-bounce" />
              <span className="text-xs sm:text-sm font-semibold text-gray-900">
                <span className="hidden sm:inline">Includes FREE Functional Foot Workshop ({currencySymbol}49 value)</span>
                <span className="sm:hidden">FREE Workshop ({currencySymbol}49 value)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        {/* Product Title & Badge */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg sm:text-2xl lg:text-3xl font-bold mb-2">
              {getDisplayName(product.name)}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                🇩🇪 Made in Germany
              </span>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="mb-6">
          <div className="text-gray-900">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              from {currencySymbol}
              {product.variationData && product.variationData.length > 0
                ? Math.min(...product.variationData.map(v => parseFloat(v.price) || 0)).toFixed(2)
                : parseFloat(product.price || '0').toFixed(2)}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Includes 19% VAT • Free shipping over {currencySymbol}100
          </p>
        </div>

        {/* Stock Status */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">In Stock • Ships in 24 hours</span>
        </div>

        {/* CTA Button */}
        <Link
          href={`/product/${product.slug}`}
          className={`
            relative flex items-center justify-center w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-lg
            transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl
            ${isProfessional
              ? 'bg-[#ffed00] text-black hover:bg-yellow-400'
              : 'bg-black text-white hover:bg-gray-800'
            }
          `}
        >
          <span className="hidden sm:inline">View Options & Sizes</span>
          <span className="sm:hidden">View Options</span>
          <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  )
}
