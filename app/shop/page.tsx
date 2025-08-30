import { getAllProducts, getStockStatus, getProductVariations, getPriceRange } from '@/lib/woocommerce/products'
import Link from 'next/link'
import Image from 'next/image'
import { AddToCartButton } from '@/components/product/add-to-cart'
import { Package, Truck, Award, ChevronRight } from 'lucide-react'

// Static generation - rebuilds only on webhook or manual trigger
export const revalidate = false // No automatic revalidation - only manual/webhook
export const dynamic = 'force-static' // Force static generation

export default async function ShopPage() {
  const products = await getAllProducts()
  
  // Categorize products
  const blackboardProducts = products.filter(p => 
    p.name.toLowerCase().includes('blackboard') && 
    (p.name.toLowerCase().includes('basic') || p.name.toLowerCase().includes('professional'))
  )
  
  const accessories = products.filter(p => 
    p.categories.some(cat => 
      cat.slug === 'zubehor' || 
      cat.slug === 'accessories' || 
      cat.name.toLowerCase().includes('replacement')
    )
  )
  
  const procoachProducts = products.filter(p => 
    p.categories.some(cat => 
      cat.slug === 'procoach' || 
      cat.slug === 'certifications' ||
      cat.name.toLowerCase().includes('certification')
    )
  )
  
  const workshopProducts = products.filter(p => 
    p.categories.some(cat => 
      cat.slug === 'workshops' || 
      cat.name.toLowerCase().includes('workshop')
    )
  )

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
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-black text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold">Shop</h1>
          <p className="mt-4 text-xl text-gray-300">
            Professional foot training equipment and education
          </p>
        </div>
      </section>

      {/* Featured BlackBoard Products */}
      {blackboardWithVariations.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Our BlackBoard Sets</h2>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {blackboardWithVariations.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="relative h-80 bg-gray-100">
                    {product.images[0] && (
                      <Image
                        src={product.images[0].src}
                        alt={product.images[0].alt || product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                    {product.on_sale && (
                      <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-md text-sm font-semibold">
                        Sale
                      </span>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                    
                    {/* Price Range */}
                    <div className="text-2xl font-bold text-[#ffed00] mb-3">
                      {product.variationData ? (
                        <span>From €{getPriceRange(product, product.variationData).split(' - ')[0].replace('€', '')}</span>
                      ) : (
                        <span>€{product.price}</span>
                      )}
                    </div>
                    
                    {/* Stock & Shipping Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        <span>In Stock & Ready to Ship</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Truck className="h-4 w-4" />
                        <span>2-5 Days</span>
                      </div>
                    </div>
                    
                    {/* Short Description */}
                    {product.short_description && (
                      <div 
                        className="text-gray-600 mb-6 line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: product.short_description }}
                      />
                    )}
                    
                    {/* CTA Button */}
                    <Link
                      href={`/product/${product.slug}`}
                      className="inline-flex items-center justify-center w-full bg-black text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-800 transition-colors"
                    >
                      Select Options
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Accessories Section */}
      {accessories.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Accessories</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {accessories.map((product) => (
                <div key={product.id} className="group">
                  <Link href={`/product/${product.slug}`}>
                    <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                      {product.images[0] && (
                        <Image
                          src={product.images[0].src}
                          alt={product.images[0].alt || product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                  </Link>
                  
                  <div>
                    <Link href={`/product/${product.slug}`}>
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-[#ffed00] transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <div className="font-bold text-lg mb-3">
                      €{product.price}
                    </div>

                    <Link
                      href={`/product/${product.slug}`}
                      className="block w-full text-center bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ProCoach Section */}
      {procoachProducts.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">ProCoach Certifications</h2>
              <Link 
                href="/procoach"
                className="text-[#ffed00] hover:text-[#ffed00]/80 font-semibold flex items-center gap-2"
              >
                View All Certifications
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {procoachProducts.slice(0, 3).map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative h-48 bg-gray-100">
                    {product.images[0] && (
                      <Image
                        src={product.images[0].src}
                        alt={product.images[0].alt || product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-2">{product.name}</h3>
                    <div className="text-2xl font-bold text-[#ffed00] mb-4">
                      €{product.price}
                    </div>
                    <Link
                      href={`/product/${product.slug}`}
                      className="block w-full text-center bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust Section */}
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <Award className="h-12 w-12 mx-auto mb-4 text-[#ffed00]" />
              <h3 className="text-xl font-bold mb-2">Professional Quality</h3>
              <p className="text-gray-300">
                Used by professional athletes and sports teams worldwide
              </p>
            </div>
            <div>
              <Package className="h-12 w-12 mx-auto mb-4 text-[#ffed00]" />
              <h3 className="text-xl font-bold mb-2">20,000+ Customers</h3>
              <p className="text-gray-300">
                Trusted by therapists and trainers globally
              </p>
            </div>
            <div>
              <Truck className="h-12 w-12 mx-auto mb-4 text-[#ffed00]" />
              <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
              <p className="text-gray-300">
                2-5 business days worldwide shipping
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}