'use client'

import { ShoppingBag } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCart } from '@/lib/cart-context'
import { Product, ProductVariation, getStockStatus } from '@/lib/woocommerce/products'
import { qualifiesForFreebie } from '@/lib/woocommerce/freebie'

interface AddToCartButtonProps {
  product: Product
  variation?: ProductVariation
  className?: string
  workshopProduct?: Product | null
}

export function AddToCartButton({ product, variation, className = "", workshopProduct }: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const { addItem, items } = useCart()

  const handleAddToCart = () => {
    setIsAdding(true)
    
    // Add the main product
    addItem(product, 1, variation)
    
    // If this qualifies for freebie and we have workshop product details, update the cart
    if (qualifiesForFreebie(product) && workshopProduct) {
      // The cart context will handle adding the freebie, but we can update it with real data
      setTimeout(() => {
        // Update the freebie with actual workshop data
        const freebieId = `freebie-${product.id}`
        const existingFreebie = items.find(item => item.id === freebieId)
        
        if (!existingFreebie && workshopProduct) {
          // Cart context should have already added a placeholder
          // We could dispatch an update action here if needed
          console.log('Workshop product ready for freebie:', workshopProduct)
        }
      }, 100)
    }

    setTimeout(() => {
      setIsAdding(false)
    }, 500)
  }

  const stockStatus = getStockStatus(variation || product)
  const isOutOfStock = !stockStatus.inStock

  if (isOutOfStock) {
    return (
      <button
        disabled
        className={`w-full bg-gray-200 text-gray-500 px-6 py-4 rounded-xl font-semibold cursor-not-allowed ${className}`}
      >
        Out of Stock
      </button>
    )
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className={`
        w-full flex items-center justify-center gap-3 bg-[#ffed00] text-black px-6 py-4 rounded-xl font-bold text-lg
        hover:bg-[#ffed00]/90 transition-all transform hover:scale-[1.02] shadow-lg
        ${isAdding ? 'scale-95 opacity-75' : ''}
        ${className}
      `}
    >
      {isAdding ? (
        <>Adding to Cart...</>
      ) : (
        <>
          <ShoppingBag className="h-6 w-6" />
          Add to Cart
        </>
      )}
    </button>
  )
}