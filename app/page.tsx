import { getAllProducts, getProductVariations } from '@/lib/woocommerce/products'
import { getAllVideos } from '@/lib/woocommerce/videos'
import { getAllTestimonials, getEnglishTestimonials } from '@/lib/woocommerce/testimonials'
import HomeContent from '@/components/home-content'

// Static generation - rebuilds only on webhook
export const revalidate = false
export const dynamic = 'force-static'

export default async function Home() {
  let products: any[] = []
  let videos: any[] = []
  let reviews: any[] = []

  try {
    products = await getAllProducts()
  } catch (error) {
    console.error('Failed to fetch products for homepage:', error)
    // Return empty state instead of crashing
    products = []
  }

  try {
    videos = await getAllVideos()
  } catch (error) {
    console.error('Failed to fetch videos for homepage:', error)
    videos = []
  }

  try {
    const allTestimonials = await getAllTestimonials()
    reviews = getEnglishTestimonials(allTestimonials)
    console.log('[Home] Fetched', reviews.length, 'English testimonials')
  } catch (error) {
    console.error('Failed to fetch testimonials for homepage:', error)
    reviews = []
  }

  // Get BlackBoard products and sort them
  const blackboardProducts = products.filter(p =>
    p.name.toLowerCase().includes('blackboard') &&
    (p.name.toLowerCase().includes('basic') ||
     p.name.toLowerCase().includes('normal') ||
     p.name.toLowerCase().includes('professional'))
  ).sort((a, b) => {
    // Ensure Basic/Normal comes before Professional
    const aIsBasic = a.name.toLowerCase().includes('basic') || a.name.toLowerCase().includes('normal')
    const bIsBasic = b.name.toLowerCase().includes('basic') || b.name.toLowerCase().includes('normal')
    if (aIsBasic && !bIsBasic) return -1
    if (!aIsBasic && bIsBasic) return 1
    return 0
  })

  // Get variations for price ranges
  const getProductWithVariations = async (product: any) => {
    if (product.type === 'variable' && product.variations?.length > 0) {
      try {
        const variations = await getProductVariations(product.id)
        return { ...product, variationData: variations }
      } catch (error) {
        console.error(`Failed to fetch variations for product ${product.id}:`, error)
        return product
      }
    }
    return product
  }

  const blackboardWithVariations = await Promise.all(
    blackboardProducts.map(getProductWithVariations)
  )

  return (
    <HomeContent
      blackboardProducts={blackboardProducts}
      blackboardWithVariations={blackboardWithVariations}
      videos={videos.slice(0, 4)}
      totalVideoCount={videos.length}
      reviews={reviews}
    />
  )
}