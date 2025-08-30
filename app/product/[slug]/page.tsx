import { getProduct, getProductVariations, getAllProducts } from '@/lib/woocommerce/products'
import { ProductDetail } from '@/components/product/product-detail'
import { notFound } from 'next/navigation'

// Static generation - rebuilds only on webhook
export const revalidate = false
export const dynamic = 'force-static'

export async function generateStaticParams() {
  const products = await getAllProducts()
  return products.map((product) => ({
    slug: product.slug,
  }))
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

    return <ProductDetail product={product} variations={variations} />
  } catch (error) {
    console.error('Error fetching product:', error)
    notFound()
  }
}