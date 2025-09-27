import { getAllProducts, getStockStatus, getProductVariations, getPriceRange } from '@/lib/woocommerce/products'
import Link from 'next/link'
import Image from 'next/image'
import { Package, Truck, Award, ChevronRight, Star, Shield, Globe, RefreshCw, Gift, Check } from 'lucide-react'

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
  const products = await getAllProducts()
  console.log(`[Shop] Loaded ${products.length} products`)
  
  // Helper function to rename BlackBoard Normal to Basic
  const getDisplayName = (name: string) => {
    return name.replace(/BlackBoard Normal/gi, 'BlackBoard Basic')
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
    <div className="min-h-screen bg-white">
      {/* Modern Header - Compact */}
      <section className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white py-12 lg:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
              Professional Training Equipment
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-4">
              Transform your foot training practice with German-engineered equipment
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#ffed00]" />
                <span className="text-xs">Lifetime Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#ffed00]" />
                <span className="text-xs">Worldwide Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-[#ffed00]" />
                <span className="text-xs">Made in Germany</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured BlackBoard Products */}
      {blackboardWithVariations.length > 0 && (
        <section className="py-16 lg:py-24">
          <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
            
            <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
              {blackboardWithVariations.map((product, index) => {
                const isProfessional = product.name.toLowerCase().includes('professional')
                const priceFrom = product.variationData 
                  ? getPriceRange(product, product.variationData).split(' - ')[0].replace('€', '')
                  : product.price
                
                return (
                  <div 
                    key={product.id} 
                    className={`group relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                      isProfessional ? 'border-2 border-[#ffed00]' : 'border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {isProfessional && (
                      <div className="absolute top-4 right-4 z-10">
                        <span className="bg-gradient-to-r from-[#ffed00] to-yellow-500 text-black px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                          MOST POPULAR
                        </span>
                      </div>
                    )}
                    
                    {/* Product Image */}
                    <div className="relative h-80 lg:h-96 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                      {product.images[0] && (
                        <Image
                          src={product.images[0].src}
                          alt={product.images[0].alt || getDisplayName(product.name)}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      
                      {/* Overlay gradient on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Freebie Badge */}
                      <div className="absolute bottom-4 left-4 right-4 transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg group-hover:bg-white transition-colors">
                          <div className="flex items-center gap-2">
                            <Gift className="h-5 w-5 text-green-500 animate-bounce" />
                            <span className="text-sm font-semibold text-gray-900">
                              Includes FREE Functional Foot Workshop (€49 value)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-8">
                      {/* Product Title & Badge */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl lg:text-3xl font-bold mb-2">
                            {getDisplayName(product.name)}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                              🇩🇪 Made in Germany
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Price */}
                      <div className="mb-6">
                        <div className="flex items-baseline gap-3">
                          <span className="text-4xl font-semibold text-gray-900">
                            <span className="text-2xl align-top">€</span>
                            {priceFrom}
                          </span>
                          {product.variationData && (
                            <span className="text-sm text-gray-500">starting price</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Includes 19% VAT • Free shipping over €100
                        </p>
                      </div>
                      
                      {/* Key Features */}
                      <div className="mb-6 space-y-2">
                        {isProfessional ? (
                          <>
                            <div className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700">Professional size (60x40cm)</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700">Perfect for clinics & gyms</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700">Includes professional markers</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700">Compact size (45x30cm)</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700">Perfect for home & travel</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700">Includes starter markers</span>
                            </div>
                          </>
                        )}
                      </div>
                      
                      {/* Stock Status */}
                      <div className="flex items-center gap-2 mb-6">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600">In Stock • Ships in 24 hours</span>
                      </div>
                      
                      {/* CTA Button */}
                      <Link
                        href={`/product/${product.slug}`}
                        className={`
                          relative flex items-center justify-center w-full px-6 py-4 rounded-xl font-bold text-lg
                          transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl
                          ${isProfessional 
                            ? 'bg-[#ffed00] text-black hover:bg-yellow-400' 
                            : 'bg-black text-white hover:bg-gray-800'
                          }
                        `}
                      >
                        <span>View Options & Sizes</span>
                        <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                      
                      {/* Trust Badges */}
                      <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-3 gap-4 text-center">
                        <div>
                          <Shield className="h-5 w-5 mx-auto mb-1 text-gray-400" />
                          <p className="text-xs text-gray-600">Lifetime<br/>Warranty</p>
                        </div>
                        <div>
                          <RefreshCw className="h-5 w-5 mx-auto mb-1 text-gray-400" />
                          <p className="text-xs text-gray-600">30-Day<br/>Returns</p>
                        </div>
                        <div>
                          <Star className="h-5 w-5 mx-auto mb-1 text-gray-400" />
                          <p className="text-xs text-gray-600">4.9/5<br/>Rating</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Accessories Section - Modern Grid */}
      {accessories.length > 0 && (
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Accessories & Replacement Parts</h2>
              <p className="text-lg text-gray-600">Keep your BlackBoard in perfect condition</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {accessories.map((product) => (
                <Link 
                  key={product.id} 
                  href={`/product/${product.slug}`}
                  className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all"
                >
                  <div className="relative aspect-square bg-gray-100">
                    {product.images[0] && (
                      <Image
                        src={product.images[0].src}
                        alt={product.images[0].alt || getDisplayName(product.name)}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    {product.on_sale && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        SALE
                      </span>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-[#ffed00] transition-colors">
                      {getDisplayName(product.name)}
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">
                        €{product.price}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#ffed00] transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Workshops Section */}
      {workshopProducts.length > 0 && (
        <section className="py-16 lg:py-24">
          <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Online Workshops</h2>
              <p className="text-lg text-gray-600">Learn from experts and enhance your skills</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {workshopProducts.slice(0, 3).map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                  <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                    {product.images[0] && (
                      <Image
                        src={product.images[0].src}
                        alt={product.images[0].alt || getDisplayName(product.name)}
                        fill
                        className="object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-bold text-xl text-white">
                        {getDisplayName(product.name)}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-baseline gap-3 mb-4">
                      <span className="text-3xl font-bold">€{product.price}</span>
                      {product.regular_price && product.regular_price !== product.price && (
                        <span className="text-lg text-gray-400 line-through">€{product.regular_price}</span>
                      )}
                    </div>
                    
                    {product.short_description && (
                      <div 
                        className="text-sm text-gray-600 mb-4 line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: product.short_description }}
                      />
                    )}
                    
                    <Link
                      href={`/product/${product.slug}`}
                      className="block w-full text-center bg-black text-white px-4 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
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
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">ProCoach Certifications</h2>
                <p className="text-lg text-gray-600">Become a certified foot function specialist</p>
              </div>
              <Link 
                href="/procoach"
                className="hidden md:flex items-center gap-2 text-[#ffed00] hover:text-[#ffed00]/80 font-semibold"
              >
                View All Programs
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {procoachProducts.slice(0, 3).map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                  <div className="relative h-56 bg-gradient-to-br from-[#ffed00] to-yellow-600">
                    {product.images[0] && (
                      <Image
                        src={product.images[0].src}
                        alt={product.images[0].alt || getDisplayName(product.name)}
                        fill
                        className="object-cover"
                      />
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-black text-white px-3 py-1 rounded-full text-sm font-semibold">
                        CERTIFICATION
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-3">{getDisplayName(product.name)}</h3>
                    <div className="text-3xl font-bold text-[#ffed00] mb-4">
                      €{product.price}
                    </div>
                    <Link
                      href={`/product/${product.slug}`}
                      className="block w-full text-center bg-black text-white px-4 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                    >
                      Enroll Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8 md:hidden">
              <Link 
                href="/procoach"
                className="inline-flex items-center gap-2 text-[#ffed00] hover:text-[#ffed00]/80 font-semibold"
              >
                View All Programs
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Trust Section - Modern Style */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Professionals Worldwide</h2>
            <p className="text-lg text-gray-300">Join thousands of satisfied customers</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="bg-[#ffed00] text-black w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-2">German Quality</h3>
              <p className="text-gray-400 text-sm">
                Precision engineering since 2008
              </p>
            </div>
            <div>
              <div className="bg-[#ffed00] text-black w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-2">20,000+ Users</h3>
              <p className="text-gray-400 text-sm">
                Trusted by professionals globally
              </p>
            </div>
            <div>
              <div className="bg-[#ffed00] text-black w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-2">4.9/5 Rating</h3>
              <p className="text-gray-400 text-sm">
                Based on 3000+ reviews
              </p>
            </div>
            <div>
              <div className="bg-[#ffed00] text-black w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-2">Fast Shipping</h3>
              <p className="text-gray-400 text-sm">
                2-5 days worldwide delivery
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}