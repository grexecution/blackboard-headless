import { unstable_cache } from 'next/cache'
import { Product, ProductVariation } from './products'
import { wooClient } from './client'

// Cache product data for 1 hour
export const getCachedProducts = unstable_cache(
  async (params?: {
    per_page?: number
    page?: number
    featured?: boolean
    category?: string
    include?: number[]
    status?: string
  }): Promise<Product[]> => {
    const queryParams = new URLSearchParams()
    
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString())
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.featured !== undefined) queryParams.append('featured', params.featured.toString())
    if (params?.category) queryParams.append('category', params.category)
    if (params?.include) queryParams.append('include', params.include.join(','))
    // Always default to 'publish' status unless explicitly set
    queryParams.append('status', params?.status || 'publish')
    
    const endpoint = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const products = await wooClient.request<Product[]>(endpoint)
    
    // Additional client-side filter to ensure only published products
    return products.filter(product => product.status === 'publish')
  },
  ['products'],
  {
    revalidate: 3600, // 1 hour
    tags: ['products']
  }
)

export const getCachedProduct = unstable_cache(
  async (idOrSlug: string | number): Promise<Product> => {
    // If it's a string (slug), we need to search for it
    if (typeof idOrSlug === 'string' && isNaN(Number(idOrSlug))) {
      const products = await wooClient.request<Product[]>(`/products?slug=${idOrSlug}`)
      
      if (products.length === 0) {
        throw new Error(`Product not found: ${idOrSlug}`)
      }
      return products[0]
    }
    
    // If it's a number (ID), fetch directly
    const endpoint = `/products/${idOrSlug}`
    return wooClient.request<Product>(endpoint)
  },
  ['product'],
  {
    revalidate: 3600, // 1 hour
    tags: ['product']
  }
)

export const getCachedProductVariations = unstable_cache(
  async (productId: number): Promise<ProductVariation[]> => {
    const endpoint = `/products/${productId}/variations?per_page=100`
    return wooClient.request<ProductVariation[]>(endpoint)
  },
  ['variations'],
  {
    revalidate: 3600, // 1 hour
    tags: ['variations']
  }
)