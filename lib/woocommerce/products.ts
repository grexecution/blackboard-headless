import { getCachedProducts, getCachedProduct, getCachedProductVariations } from './cache'
import { getCached } from './dev-cache'

export interface ProductImage {
  id: number
  src: string
  alt: string
  name: string
}

export interface ProductCategory {
  id: number
  name: string
  slug: string
}

export interface ProductAttribute {
  id: number
  name: string
  position: number
  visible: boolean
  variation: boolean
  options: string[]
}

export interface CurrencyPrices {
  usd: {
    regular_price: string
    sale_price: string
  }
  eur: {
    regular_price: string
    sale_price: string
  }
}

export interface ResellerPricing {
  enabled: boolean
  min_quantity: number
  price_eur: string
  price_usd: string
}

export interface ProductVariation {
  id: number
  price: string
  regular_price: string
  sale_price: string
  on_sale: boolean
  purchasable: boolean
  attributes: {
    id: number
    name: string
    option: string
  }[]
  image?: ProductImage
  stock_quantity: number | null
  stock_status: string
  in_stock: boolean
  manage_stock: boolean
  weight?: string
  currency_prices?: CurrencyPrices
}

export interface Product {
  id: number
  name: string
  slug: string
  permalink: string
  type: string
  status: string
  featured: boolean
  description: string
  short_description: string
  sku: string
  price: string
  regular_price: string
  sale_price: string
  on_sale: boolean
  purchasable: boolean
  total_sales: number
  stock_quantity: number | null
  stock_status: string
  in_stock: boolean
  manage_stock: boolean
  weight?: string
  images: ProductImage[]
  categories: ProductCategory[]
  attributes: ProductAttribute[]
  variations?: number[]
  price_html?: string
  currency_prices?: CurrencyPrices
  reseller_pricing?: ResellerPricing
  acf?: {
    product_detail_description?: string
    scope_of_delivery?: string
    additional_information?: string
    shipping_information?: string
    [key: string]: any
  }
  meta_data?: Array<{
    id: number
    key: string
    value: any
  }>
}

// Helper function to determine actual stock status
export function getStockStatus(product: Product | ProductVariation): {
  inStock: boolean
  stockQuantity: number | null
  stockText: string
} {
  // If stock management is enabled and quantity is tracked
  if (product.manage_stock && product.stock_quantity !== null) {
    const inStock = product.stock_quantity > 0
    return {
      inStock,
      stockQuantity: product.stock_quantity,
      stockText: inStock ? `${product.stock_quantity} in stock` : 'Out of stock'
    }
  }
  
  // Fall back to stock_status field
  const inStock = product.stock_status === 'instock' || product.in_stock
  return {
    inStock,
    stockQuantity: null,
    stockText: inStock ? 'In stock' : 'Out of stock'
  }
}

export async function getProducts(params?: {
  per_page?: number
  page?: number
  featured?: boolean
  category?: string
  include?: number[]
  status?: string
}): Promise<Product[]> {
  return getCachedProducts(params)
}

export async function getProduct(idOrSlug: string | number): Promise<Product> {
  return getCachedProduct(idOrSlug)
}

export async function getProductVariations(productId: number): Promise<ProductVariation[]> {
  // Use development cache to speed up local development
  if (process.env.NODE_ENV === 'development') {
    return getCached(`product-variations-${productId}`, () => getCachedProductVariations(productId))
  }
  return getCachedProductVariations(productId)
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return getProducts({ featured: true, per_page: 2 })
}

export async function getAllProducts(): Promise<Product[]> {
  // Use development cache to speed up local development
  if (process.env.NODE_ENV === 'development') {
    return getCached('all-products', () => getProducts({ per_page: 100 }))
  }
  return getProducts({ per_page: 100 })
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const allProducts = await getAllProducts()
  return allProducts.filter(product => 
    product.categories.some(cat => cat.slug === categorySlug)
  )
}

export async function getProductsByTag(tag: string): Promise<Product[]> {
  return getProducts({ per_page: 100, category: tag })
}

// Helper to get the minimum price from variations
export function getMinPrice(product: Product, variations?: ProductVariation[]): string {
  if (product.type === 'simple') {
    return product.price
  }
  
  if (variations && variations.length > 0) {
    const prices = variations.map(v => parseFloat(v.price))
    return Math.min(...prices).toFixed(2)
  }
  
  return product.price
}

// Helper to get price range for variable products
export function getPriceRange(product: Product, variations?: ProductVariation[]): string {
  if (product.type === 'simple') {
    return `€${product.price}`
  }
  
  if (variations && variations.length > 0) {
    const prices = variations.map(v => parseFloat(v.price))
    const min = Math.min(...prices).toFixed(2)
    const max = Math.max(...prices).toFixed(2)
    return min === max ? `€${min}` : `€${min} - €${max}`
  }
  
  return `€${product.price}`
}