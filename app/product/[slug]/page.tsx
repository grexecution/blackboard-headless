import { getProduct, getProductVariations, getAllProducts } from '@/lib/woocommerce/products'
import { ProductDetail } from '@/components/product/product-detail'
import { notFound } from 'next/navigation'
import { findWorkshopProduct, qualifiesForFreebie } from '@/lib/woocommerce/freebie'

// Allow revalidation every hour as fallback
export const revalidate = 3600
// Allow dynamic rendering if needed
export const dynamic = 'auto'

export async function generateStaticParams() {
  try {
    const products = await getAllProducts()
    // Filter out products without slugs or with empty slugs
    const validProducts = products.filter(p => p.slug && p.slug.trim() !== '')
    return validProducts.map((product) => ({
      slug: product.slug,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    // Return empty array to allow dynamic rendering
    return []
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
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