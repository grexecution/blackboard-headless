'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/lib/woocommerce/products'

// Store workshop product data globally to avoid refetching
let cachedWorkshopProduct: Product | null = null

export function useWorkshopProduct() {
  const [workshopProduct, setWorkshopProduct] = useState<Product | null>(cachedWorkshopProduct)
  const [isLoading, setIsLoading] = useState(!cachedWorkshopProduct)

  useEffect(() => {
    if (!cachedWorkshopProduct) {
      // In a real app, this would fetch from an API endpoint
      // For now, we'll create a mock workshop product
      const mockWorkshop: Product = {
        id: 999,
        name: 'Functional Foot Workshop',
        slug: 'functional-foot-workshop',
        permalink: '/product/functional-foot-workshop',
        type: 'simple',
        status: 'publish',
        featured: false,
        description: 'Master the fundamentals of foot function with our comprehensive workshop.',
        short_description: 'Professional foot training workshop with lifetime access.',
        sku: 'WORKSHOP-001',
        price: '49',
        regular_price: '49',
        sale_price: '',
        on_sale: false,
        purchasable: true,
        total_sales: 0,
        stock_quantity: null,
        stock_status: 'instock',
        in_stock: true,
        manage_stock: false,
        images: [
          {
            id: 1,
            src: 'https://via.placeholder.com/600x400/ffed00/000000?text=Foot+Workshop',
            alt: 'Functional Foot Workshop',
            name: 'workshop-cover'
          }
        ],
        categories: [
          {
            id: 1,
            name: 'Workshops',
            slug: 'workshops'
          }
        ],
        attributes: [],
        variations: []
      }

      // Simulate API delay
      setTimeout(() => {
        cachedWorkshopProduct = mockWorkshop
        setWorkshopProduct(mockWorkshop)
        setIsLoading(false)
      }, 100)
    }
  }, [])

  return { workshopProduct, isLoading }
}