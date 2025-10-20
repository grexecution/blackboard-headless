import { getProduct, getProductVariations, getAllProducts } from '@/lib/woocommerce/products'
import { getAllProductsForBuild } from '@/lib/woocommerce/build-helpers'
import { ProductDetail } from '@/components/product/product-detail'
import { notFound } from 'next/navigation'
import { findWorkshopProduct, qualifiesForFreebie } from '@/lib/woocommerce/freebie'

// Force static generation at build time with no revalidation
export const revalidate = false
export const dynamic = 'force-static'
export const dynamicParams = true

// Add metadata generation for better SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  try {
    const product = await getProduct(slug)
    if (!product) return {}
    
    return {
      title: product.name.replace(/BlackBoard Normal/gi, 'BlackBoard Basic'),
      description: product.short_description?.replace(/<[^>]*>/g, '') || '',
    }
  } catch (error) {
    return {}
  }
}

export async function generateStaticParams() {
  console.log('[Build] Starting generateStaticParams for product pages...')

  // Check if required environment variables are present
  if (!process.env.WOO_CONSUMER_KEY || !process.env.WOO_CONSUMER_SECRET) {
    console.warn('[Build] WooCommerce credentials not found, skipping static generation')
    return []
  }

  try {
    // Use build helper to bypass cache during static generation
    const products = await getAllProductsForBuild()
    console.log(`[Build] Fetched ${products.length} products from WooCommerce (bypassing cache)`)

    // Filter out products without slugs or with empty slugs
    const validProducts = products.filter(p => p.slug && p.slug.trim() !== '')
    console.log(`[Build] Found ${validProducts.length} valid products with slugs`)

    const params = validProducts.map((product) => {
      console.log(`[Build] Generating static params for: ${product.slug}`)
      return {
        slug: product.slug,
      }
    })

    console.log('[Build] Static params generation complete!')
    return params
  } catch (error) {
    console.error('[Build] Error generating static params:', error)
    // Return empty array to allow build to continue
    return []
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  // Note: We use the cached version here for runtime, not the build helper
  // This ensures proper caching behavior when serving pages
  
  try {
    const product = await getProduct(slug)
    
    if (!product) {
      notFound()
    }

    let variations: any[] = []
    if (product.type === 'variable' && product.variations && product.variations.length > 0) {
      try {
        variations = await getProductVariations(product.id)
      } catch (error) {
        console.error('Error fetching variations:', error)
        // Continue without variations if they fail to load
      }
    }

    // Fetch workshop product if this qualifies for freebie
    let workshopProduct = null
    if (qualifiesForFreebie(product)) {
      try {
        const allProducts = await getAllProducts()
        workshopProduct = findWorkshopProduct(allProducts)
      } catch (error) {
        console.error('Error fetching workshop product:', error)
      }
    }

    return <ProductDetail product={product} variations={variations} workshopProduct={workshopProduct} />
  } catch (error) {
    console.error('Error fetching product with slug:', slug, error)
    notFound()
  }
}