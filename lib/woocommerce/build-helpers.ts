// Build-time helpers that bypass caching for static generation
import { wooClient } from './client'
import { Product, ProductVariation } from './products'

// Direct API calls without caching for build-time static generation
export async function getAllProductsForBuild(): Promise<Product[]> {
  console.log('[Build Helper] Fetching all products directly from WooCommerce...')
  
  const queryParams = new URLSearchParams()
  queryParams.append('per_page', '100')
  queryParams.append('status', 'publish')
  
  const endpoint = `/products?${queryParams.toString()}`
  const products = await wooClient.request<Product[]>(endpoint)
  
  console.log(`[Build Helper] Fetched ${products.length} products`)
  
  // Filter to ensure only published products
  return products.filter(product => product.status === 'publish')
}

export async function getProductForBuild(slug: string): Promise<Product> {
  console.log(`[Build Helper] Fetching product: ${slug}`)
  
  const products = await wooClient.request<Product[]>(`/products?slug=${slug}`)
  
  if (products.length === 0) {
    throw new Error(`Product not found: ${slug}`)
  }
  
  return products[0]
}

export async function getProductVariationsForBuild(productId: number): Promise<ProductVariation[]> {
  console.log(`[Build Helper] Fetching variations for product ID: ${productId}`)
  
  const endpoint = `/products/${productId}/variations?per_page=100`
  return wooClient.request<ProductVariation[]>(endpoint)
}