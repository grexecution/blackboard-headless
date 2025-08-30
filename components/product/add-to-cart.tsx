'use client'

import { ShoppingBag, Plus, Minus } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '@/lib/cart-context'
import { Product, ProductVariation, getStockStatus } from '@/lib/woocommerce/products'

interface AddToCartButtonProps {
  product: Product
  variation?: ProductVariation
  className?: string
}

export function AddToCartButton({ product, variation, className = "" }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const { addItem } = useCart()

  const handleAddToCart = () => {
    setIsAdding(true)
    
    const price = variation 
      ? parseFloat(variation.price)
      : parseFloat(product.price)
    
    const image = variation?.image?.src || product.images[0]?.src

    const attributes = variation?.attributes?.reduce((acc, attr) => {
      acc[attr.name] = attr.option
      return acc
    }, {} as Record<string, string>)

    addItem({
      productId: product.id,
      variationId: variation?.id,
      name: product.name,
      price,
      quantity,
      image,
      attributes
    })

    setTimeout(() => {
      setIsAdding(false)
      setQuantity(1)
    }, 500)
  }

  const stockStatus = getStockStatus(variation || product)
  const isOutOfStock = !stockStatus.inStock
  const maxQuantity = stockStatus.stockQuantity || 99

  if (isOutOfStock) {
    return (
      <button
        disabled
        className="bg-gray-200 text-gray-500 px-6 py-3 rounded-md font-semibold cursor-not-allowed"
      >
        Out of Stock
      </button>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center border rounded-md">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="p-2 hover:bg-gray-100 transition-colors"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
        <button
          onClick={() => setQuantity(Math.min(quantity + 1, maxQuantity))}
          className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
          disabled={quantity >= maxQuantity}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <button
        onClick={handleAddToCart}
        disabled={isAdding}
        className={`
          flex items-center gap-2 bg-black text-white px-6 py-3 rounded-md font-semibold 
          hover:bg-gray-800 transition-all
          ${isAdding ? 'scale-95 opacity-75' : ''}
        `}
      >
        {isAdding ? (
          <>Adding...</>
        ) : (
          <>
            <ShoppingBag className="h-5 w-5" />
            Add to Cart
          </>
        )}
      </button>
    </div>
  )
}