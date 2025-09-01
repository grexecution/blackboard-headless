import { Product } from './products'

// Configuration for freebies
export const FREEBIE_CONFIG = {
  functionalFootWorkshop: {
    // These are potential identifiers for the workshop product
    // We'll match against slug, name, or ID
    slugs: ['functional-foot-workshop', 'foot-workshop'],
    names: ['Functional Foot Workshop', 'Foot Workshop'],
    categorySlug: 'workshops',
    fallbackId: 99999, // If we can't find the product, use this ID
  }
}

// Check if a product qualifies for the freebie
export function qualifiesForFreebie(product: Product): boolean {
  // Check if it's a BlackBoard Set
  const isBlackBoardSet = 
    product.categories?.some(cat => 
      cat.slug === 'blackboard-sets' || 
      cat.name.toLowerCase().includes('blackboard set')
    ) || 
    (product.name.toLowerCase().includes('blackboard') && 
     (product.name.toLowerCase().includes('basic') || 
      product.name.toLowerCase().includes('professional')))
  
  return isBlackBoardSet
}

// Find the workshop product from all products
export function findWorkshopProduct(products: Product[]): Product | null {
  // Try to find by slug first
  let workshop = products.find(p => 
    FREEBIE_CONFIG.functionalFootWorkshop.slugs.some(slug => 
      p.slug === slug
    )
  )
  
  // Try to find by name
  if (!workshop) {
    workshop = products.find(p => 
      FREEBIE_CONFIG.functionalFootWorkshop.names.some(name => 
        p.name.toLowerCase().includes(name.toLowerCase())
      )
    )
  }
  
  // Try to find by category
  if (!workshop) {
    workshop = products.find(p => 
      p.categories?.some(cat => 
        cat.slug === FREEBIE_CONFIG.functionalFootWorkshop.categorySlug ||
        cat.slug === 'workshops' ||
        cat.name?.toLowerCase().includes('workshop')
      )
    )
  }
  
  // Try any product with 'workshop' in the name
  if (!workshop) {
    workshop = products.find(p => 
      p.name.toLowerCase().includes('workshop') ||
      p.name.toLowerCase().includes('foot')
    )
  }
  
  return workshop || null
}

// Create a freebie cart item
export function createFreebieItem(workshop: Product | null, parentProductId: number) {
  if (workshop) {
    return {
      id: `freebie-${parentProductId}`,
      productId: workshop.id,
      name: `${workshop.name} (🎁 Free Gift)`,
      price: 0,
      originalPrice: parseFloat(workshop.price),
      quantity: 1,
      image: workshop.images[0]?.src,
      slug: workshop.slug,
      isFreebie: true,
      parentProductId: parentProductId
    }
  }
  
  // Fallback if workshop not found
  return {
    id: `freebie-${parentProductId}`,
    productId: FREEBIE_CONFIG.functionalFootWorkshop.fallbackId,
    name: 'Functional Foot Workshop (🎁 Free Gift)',
    price: 0,
    originalPrice: 49,
    quantity: 1,
    image: undefined,
    slug: 'functional-foot-workshop',
    isFreebie: true,
    parentProductId: parentProductId
  }
}