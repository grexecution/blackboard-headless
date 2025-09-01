'use client'

import { ShoppingBag } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCart } from '@/lib/cart-context'
import { Product, ProductVariation, getStockStatus } from '@/lib/woocommerce/products'
import { qualifiesForFreebie } from '@/lib/woocommerce/freebie'

interface AddToCartButtonEnhancedProps {
  product: Product
  variation?: ProductVariation
  workshopProduct?: Product | null
  className?: string
}

export function AddToCartButtonEnhanced({ 
  product, 
  variation, 
  workshopProduct,
  className = "" 
}: AddToCartButtonEnhancedProps) {
  const [isAdding, setIsAdding] = useState(false)
  const { addItem, updateItem, items } = useCart()

  const handleAddToCart = () => {
    setIsAdding(true)
    
    // Add the main product
    addItem(product, 1, variation)
    
    // If we have workshop product data and this qualifies for freebie, update the freebie
    if (workshopProduct && qualifiesForFreebie(product)) {
      setTimeout(() => {
        const freebieId = `freebie-${product.id}`
        
        // Update the freebie with real workshop data
        updateItem?.(freebieId, {
          name: `${workshopProduct.name}`,
          productId: workshopProduct.id,
          image: workshopProduct.images?.[0]?.src,
          slug: workshopProduct.slug
        })
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