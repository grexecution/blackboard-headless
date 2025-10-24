import { getAllProducts, getProductVariations } from '@/lib/woocommerce/products'
import { getAllCourses, getCoursesByCategory } from '@/lib/woocommerce/courses'
import ShopClient from './shop-client'

// Force static generation at build time
export const revalidate = false
export const dynamic = 'force-static'

// Add metadata for SEO
export const metadata = {
  title: 'Shop - BlackBoard Training',
  description: 'Premium tactical training equipment including BlackBoard Basic and Professional models',
}

export default async function ShopPage() {
  console.log('[Shop] Rendering shop page...')

  let products: any[] = []
  try {
    products = await getAllProducts()
    console.log(`[Shop] Loaded ${products.length} products`)
  } catch (error) {
    console.error('[Shop] Failed to fetch products:', error)
    // Return empty state instead of crashing
    products = []
  }

  // Fetch courses
  let allCourses: any[] = []
  try {
    allCourses = await getAllCourses()
    console.log(`[Shop] Loaded ${allCourses.length} courses`)
  } catch (error) {
    console.error('[Shop] Failed to fetch courses:', error)
    allCourses = []
  }

  // Categorize products
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

  const accessories = products.filter(p =>
    p.categories.some((cat: any) =>
      cat.slug === 'zubehor' ||
      cat.slug === 'accessories' ||
      cat.name.toLowerCase().includes('replacement')
    )
  )

  // Get courses by category
  const procoachCourses = getCoursesByCategory(allCourses, 'procoach')
  const workshopCourses = getCoursesByCategory(allCourses, 'workshop')

  // Get variations for price ranges
  const getProductWithVariations = async (product: any) => {
    if (product.type === 'variable' && product.variations?.length > 0) {
      const variations = await getProductVariations(product.id)
      return { ...product, variationData: variations }
    }
    return product
  }

  const blackboardWithVariations = await Promise.all(
    blackboardProducts.map(getProductWithVariations)
  )

  return (
    <ShopClient
      blackboardWithVariations={blackboardWithVariations}
      accessories={accessories}
      workshopCourses={workshopCourses}
      procoachCourses={procoachCourses}
    />
  )
}
