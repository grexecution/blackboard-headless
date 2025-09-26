import { getAllProducts, getProductVariations } from '@/lib/woocommerce/products'
import HomeContent from '@/components/home-content'

// Static generation - rebuilds only on webhook
export const revalidate = false
export const dynamic = 'force-static'

export default async function Home() {
  const products = await getAllProducts()

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
      const variations = await getProductVariations(product.id)
      return { ...product, variationData: variations }
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
    />
  )
}