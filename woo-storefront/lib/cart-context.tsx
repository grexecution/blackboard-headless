'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product, ProductVariation } from '@/lib/woocommerce/products'

export interface CartItem {
  id: string
  productId: number
  name: string
  price: number
  quantity: number
  image?: string
  slug: string
  variationId?: number
  variation?: {
    attributes: Array<{ name: string; value: string }>
  }
  stock_quantity?: number | null
  manage_stock?: boolean
}

interface CartContextType {
  items: CartItem[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (product: Product, quantity?: number, variation?: ProductVariation) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error)
      }
    }
    setIsInitialized(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('cart', JSON.stringify(items))
    }
  }, [items, isInitialized])

  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)

  const addItem = (product: Product, quantity = 1, variation?: ProductVariation) => {
    const itemId = variation ? `${product.id}-${variation.id}` : product.id.toString()
    
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === itemId)
      
      if (existingItem) {
        return currentItems.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      
      const price = variation ? parseFloat(variation.price) : parseFloat(product.price)
      
      const newItem: CartItem = {
        id: itemId,
        productId: product.id,
        name: product.name,
        price: price,
        quantity,
        image: product.images[0]?.src,
        slug: product.slug,
        variationId: variation?.id,
        variation: variation ? {
          attributes: variation.attributes.map(attr => ({
            name: attr.name,
            value: attr.option
          }))
        } : undefined,
        stock_quantity: variation?.stock_quantity ?? product.stock_quantity,
        manage_stock: variation?.manage_stock ?? product.manage_stock
      }
      
      return [...currentItems, newItem]
    })
    
    openCart()
  }

  const removeItem = (id: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
    } else {
      setItems(currentItems =>
        currentItems.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      )
    }
  }

  const clearCart = () => {
    setItems([])
  }

  const totalItems = items.reduce((total, item) => total + item.quantity, 0)
  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}