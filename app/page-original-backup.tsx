import { getAllProducts, getProductVariations, getPriceRange } from '@/lib/woocommerce/products'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star, Shield, Truck, Award, Check, PlayCircle, Users, ChevronRight, Gift, RefreshCw, BookOpen, Video, FileText, Lock, Trophy } from 'lucide-react'

// Static generation - rebuilds only on webhook
export const revalidate = false
export const dynamic = 'force-static'

export default async function Home() {
  const products = await getAllProducts()
  
  // Helper function to rename BlackBoard Normal to Basic
  const getDisplayName = (name: string) => {
    return name.replace(/BlackBoard Normal/gi, 'BlackBoard Basic')
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
      {/* Hero Section - Full Screen */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #ffed00 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}/>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              {/* Trustpilot and Trust Badges */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="inline-flex items-center gap-2 bg-[#ffed00]/20 text-[#ffed00] px-4 py-2 rounded-full">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-semibold">Trusted by 20,000+ Athletes</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-[#ffed00] text-[#ffed00]" />
                    ))}
                  </div>
                  <span className="text-sm text-white">50+ Trustpilot Reviews</span>
                </div>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Transform Your
                <span className="block text-[#ffed00] mt-2">Foundation</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                Professional foot training equipment designed by experts, proven by science, trusted by champions.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center gap-2 bg-[#ffed00] text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-[#ffed00]/90 transform hover:scale-105 transition-all shadow-2xl"
                >
                  Shop Now
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <button className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-black transition-all">
                  <PlayCircle className="h-5 w-5" />
                  Watch Demo
                </button>
              </div>

            </div>
            
            <div className="relative">
              <div className="relative z-10">
                {blackboardProducts[0]?.images[0] ? (
                  <>
                    <Image
                      src={blackboardProducts[0].images[0].src}
                      alt="BlackBoard Training Equipment"
                      width={600}
                      height={600}
                      className="w-full h-auto rounded-2xl shadow-2xl"
                    />
                    {/* Mini Product Link Card */}
                    <Link 
                      href={`/product/${blackboardProducts[0].slug}`}
                      className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={blackboardProducts[0].images[0].src}
                            alt={getDisplayName(blackboardProducts[0].name)}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 group-hover:text-[#ffed00] transition-colors">
                            {getDisplayName(blackboardProducts[0].name)}
                          </h3>
                          <p className="text-sm text-gray-600">From €{blackboardProducts[0].price}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#ffed00] transition-all group-hover:translate-x-1" />
                      </div>
                    </Link>
                  </>
                ) : (
                  <div className="w-full aspect-square bg-gray-800 rounded-2xl"></div>
                )}
              </div>
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-[#ffed00]/20 blur-3xl rounded-full transform scale-75"></div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Your Feet Are Your <span className="text-[#ffed00]">Foundation</span>
            </h2>
            <p className="text-xl text-gray-600">
              90% of people have foot dysfunction that affects their entire body. 
              BlackBoard is the scientifically proven solution.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Problem */}
            <div className="bg-red-50 rounded-2xl p-8">
              <div className="text-red-600 text-2xl font-bold mb-4">The Problem</div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Chronic pain in feet, knees, hips, and back</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Poor balance and stability</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Decreased athletic performance</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Risk of injuries and falls</span>
                </li>
              </ul>
            </div>
            
            {/* Solution */}
            <div className="bg-green-50 rounded-2xl p-8">
              <div className="text-green-600 text-2xl font-bold mb-4">The Solution</div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>Restore natural foot function</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>Eliminate pain from the ground up</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>Improve balance and coordination</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>Enhance athletic performance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Featured BlackBoard Products - Beautiful Cards */}
      {blackboardWithVariations.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-[#ffed00]/10 text-[#ffed00] px-4 py-2 rounded-full mb-4">
                <Award className="h-4 w-4" />
                <span className="text-sm font-semibold uppercase tracking-wider">Choose Your Equipment</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">BlackBoard Training Sets</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Professional-grade equipment trusted by over 20,000 athletes, therapists, and trainers worldwide
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
              {blackboardWithVariations.map((product) => {
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
            
            {/* View All Products Button */}
            <div className="text-center mt-12">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition-all"
              >
                View All Products
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Social Proof Section */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Trusted by <span className="text-[#ffed00]">Champions</span>
            </h2>
            <p className="text-xl text-gray-400">
              Used by professional athletes and teams worldwide
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-gray-900 rounded-xl p-6 text-center">
              <div className="text-5xl font-bold text-[#ffed00] mb-2">20,000+</div>
              <div className="text-gray-400">Happy Customers</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 text-center">
              <div className="text-5xl font-bold text-[#ffed00] mb-2">4.9/5</div>
              <div className="text-gray-400">Average Rating</div>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 text-center">
              <div className="text-5xl font-bold text-[#ffed00] mb-2">98%</div>
              <div className="text-gray-400">Would Recommend</div>
            </div>
          </div>
        </div>
      </section>

      {/* Training Center Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #ffed00 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }}/>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div>
                <div className="inline-flex items-center gap-2 bg-[#ffed00]/20 text-[#ffed00] px-4 py-2 rounded-full mb-6">
                  <Lock className="h-4 w-4" />
                  <span className="text-sm font-semibold uppercase tracking-wider">Exclusive for Customers</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  The BlackBoard
                  <span className="block text-[#ffed00]">Training Center</span>
                </h2>
                
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  In our Training Center, you&apos;ll find guides and videos from instructors and experts to help you achieve maximum training results.
                </p>
                
                {/* Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#ffed00]/20 rounded-lg flex items-center justify-center">
                      <Video className="h-5 w-5 text-[#ffed00]" />
                    </div>
                    <div>
                      <p className="font-semibold">Video Tutorials</p>
                      <p className="text-sm text-gray-400">Step-by-step guides</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#ffed00]/20 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-[#ffed00]" />
                    </div>
                    <div>
                      <p className="font-semibold">Training Plans</p>
                      <p className="text-sm text-gray-400">Structured programs</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#ffed00]/20 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-[#ffed00]" />
                    </div>
                    <div>
                      <p className="font-semibold">Expert Instructors</p>
                      <p className="text-sm text-gray-400">Learn from the best</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#ffed00]/20 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-[#ffed00]" />
                    </div>
                    <div>
                      <p className="font-semibold">PDF Guides</p>
                      <p className="text-sm text-gray-400">Downloadable resources</p>
                    </div>
                  </div>
                </div>
                
                {/* CTA Button */}
                <Link
                  href="/training-center"
                  className="inline-flex items-center gap-3 bg-[#ffed00] text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-[#ffed00]/90 transform hover:scale-105 transition-all shadow-xl"
                >
                  <PlayCircle className="h-6 w-6" />
                  Go to Training Center
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
              
              {/* Visual Side */}
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  {/* Video Cards */}
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 hover:bg-gray-800/70 transition-all cursor-pointer group">
                    <div className="aspect-video bg-gray-700 rounded-lg mb-3 relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-[#ffed00] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <PlayCircle className="h-6 w-6 text-black ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-semibold">Getting Started</p>
                    <p className="text-xs text-gray-400">5 min</p>
                  </div>
                  
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 hover:bg-gray-800/70 transition-all cursor-pointer group">
                    <div className="aspect-video bg-gray-700 rounded-lg mb-3 relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-[#ffed00] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <PlayCircle className="h-6 w-6 text-black ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-semibold">Basic Exercises</p>
                    <p className="text-xs text-gray-400">12 min</p>
                  </div>
                  
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 hover:bg-gray-800/70 transition-all cursor-pointer group">
                    <div className="aspect-video bg-gray-700 rounded-lg mb-3 relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-[#ffed00] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <PlayCircle className="h-6 w-6 text-black ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-semibold">Advanced Training</p>
                    <p className="text-xs text-gray-400">18 min</p>
                  </div>
                  
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 hover:bg-gray-800/70 transition-all cursor-pointer group">
                    <div className="aspect-video bg-gray-700 rounded-lg mb-3 relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-[#ffed00] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <PlayCircle className="h-6 w-6 text-black ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-semibold">Pro Techniques</p>
                    <p className="text-xs text-gray-400">15 min</p>
                  </div>
                </div>
                
                {/* Floating Badge */}
                <div className="absolute -top-4 -right-4 bg-[#ffed00] text-black px-4 py-2 rounded-full font-bold text-sm shadow-xl">
                  100+ Videos
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-[#ffed00]/10 text-gray-900 px-4 py-2 rounded-full mb-4">
                <Star className="h-4 w-4 fill-[#ffed00] text-[#ffed00]" />
                <span className="text-sm font-semibold uppercase tracking-wider">Customer Reviews</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                What Our Customers Say
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Real experiences from athletes and professionals using BlackBoard
              </p>
            </div>

            {/* Reviews Grid - Placeholder for screenshots */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Review Card 1 - Placeholder */}
              <div className="bg-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#ffed00] text-[#ffed00]" />
                  ))}
                </div>
                <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Review Screenshot 1</span>
                </div>
                <p className="text-sm text-gray-500">Verified Customer</p>
              </div>

              {/* Review Card 2 - Placeholder */}
              <div className="bg-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#ffed00] text-[#ffed00]" />
                  ))}
                </div>
                <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Review Screenshot 2</span>
                </div>
                <p className="text-sm text-gray-500">Verified Customer</p>
              </div>

              {/* Review Card 3 - Placeholder */}
              <div className="bg-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#ffed00] text-[#ffed00]" />
                  ))}
                </div>
                <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Review Screenshot 3</span>
                </div>
                <p className="text-sm text-gray-500">Verified Customer</p>
              </div>

              {/* Review Card 4 - Placeholder */}
              <div className="bg-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#ffed00] text-[#ffed00]" />
                  ))}
                </div>
                <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Review Screenshot 4</span>
                </div>
                <p className="text-sm text-gray-500">Verified Customer</p>
              </div>

              {/* Review Card 5 - Placeholder */}
              <div className="bg-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#ffed00] text-[#ffed00]" />
                  ))}
                </div>
                <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Review Screenshot 5</span>
                </div>
                <p className="text-sm text-gray-500">Verified Customer</p>
              </div>

              {/* Review Card 6 - Placeholder */}
              <div className="bg-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#ffed00] text-[#ffed00]" />
                  ))}
                </div>
                <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Review Screenshot 6</span>
                </div>
                <p className="text-sm text-gray-500">Verified Customer</p>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-6 flex-wrap justify-center">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-semibold text-gray-700">Verified Reviews</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-semibold text-gray-700">100% Authentic</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-[#ffed00] text-[#ffed00]" />
                  <span className="text-sm font-semibold text-gray-700">4.9/5 Average Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Members Section */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Lars Grandjot */}
              <div className="bg-gray-900 rounded-2xl overflow-hidden">
                <div className="aspect-[4/5] bg-gray-800 relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">Lars Grandjot</h3>
                  <p className="text-[#ffed00] text-sm font-semibold mb-4">Physiotherapeut</p>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    Nach meiner Ausbildung zur Physiotherapeut im Jahr 2005 und meinem Einstieg nach Köln habe ich mit meinem Geschäftspartner Gregor das BlackBoard zur Kräftigung der Füße entwickelt. Wir haben das BlackBoard Training für gesunde, leistungsstarke Füße ins Leben gerufen. Unter anderem war Kurt Canaris, arbeite als Physiotherapeut und unterrichte funktionelle Anatomie.
                  </p>
                  <button className="bg-white text-black px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors">
                    Mehr Infos
                  </button>
                </div>
              </div>

              {/* Gregor Stumpf */}
              <div className="bg-gray-900 rounded-2xl overflow-hidden">
                <div className="aspect-[4/5] bg-gray-800 relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">Gregor Stumpf</h3>
                  <p className="text-[#ffed00] text-sm font-semibold mb-4">Dipl. Sportwissenschaftler</p>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    Nach Abschluss meines Studiums der Sportrehabilitation im Jahr 2006 arbeitet ich u.a. mit Profisportlern und unterrichtete bereits an der Kölner Sporthochschule. 2015 weckseite ich zu BayerO4 Leverkusen, wo ich meine Erfahrungen in einer professionellen Trainingsumfeld weiter konnte. Dies führte dazu, dass ich zusammen mit Lars das BlackBoard entwickelte, ein Tool, das heute weltweit zur Genessung nach Verletzungen und zur Leistungssteigerung eingesetzt wird.
                  </p>
                  <button className="bg-white text-black px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors">
                    Mehr Infos
                  </button>
                </div>
              </div>

              {/* Armin Harrasser */}
              <div className="bg-gray-900 rounded-2xl overflow-hidden">
                <div className="aspect-[4/5] bg-gray-800 relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">Armin Harrasser</h3>
                  <p className="text-[#ffed00] text-sm font-semibold mb-4">Sportwissenschaftler (M.Sc.)</p>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    Seit 7 Jahren unterrichte ich weltweit Therapiemethoden, speziell mit dem Fußtrainingsger Dr. Kai Olms zusammen und behandle Olympiaathleten wie Glenn Rupp und Dimitry Ovtcharov. Als nächstes werde ich in Japan und Südkorea unterrichten.
                  </p>
                  <button className="bg-white text-black px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors">
                    Mehr Infos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Start Training in <span className="text-[#ffed00]">3 Simple Steps</span>
            </h2>
            <p className="text-xl text-gray-600">
              Transform your foundation with just 10 minutes a day
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-[#ffed00] text-black w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold">
                1
              </div>
              <h3 className="text-2xl font-bold mb-3">Choose Your BlackBoard</h3>
              <p className="text-gray-600">
                Select the perfect size for your space and training needs
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#ffed00] text-black w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold">
                2
              </div>
              <h3 className="text-2xl font-bold mb-3">Follow the Program</h3>
              <p className="text-gray-600">
                Access our free training videos and structured programs
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#ffed00] text-black w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold">
                3
              </div>
              <h3 className="text-2xl font-bold mb-3">Feel the Difference</h3>
              <p className="text-gray-600">
                Experience improved balance, strength, and pain relief
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-20 bg-gradient-to-br from-[#ffed00] to-yellow-500">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Shield className="h-20 w-20 mx-auto mb-6 text-black" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">
              30-Day Money Back Guarantee
            </h2>
            <p className="text-xl text-black/80 mb-8">
              We&apos;re so confident you&apos;ll love your BlackBoard that we offer a full refund 
              if you&apos;re not completely satisfied. No questions asked.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition-all shadow-xl"
            >
              Start Your Transformation
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Professional Athletes Section */}
      <section className="py-16 bg-gradient-to-r from-gray-900 via-black to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-[#ffed00]/20 text-[#ffed00] px-4 py-2 rounded-full mb-4">
                <Trophy className="h-4 w-4" />
                <span className="text-sm font-semibold uppercase tracking-wider">Elite Performance</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Trusted by <span className="text-[#ffed00]">World-Class Athletes</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Professional athletes from every major sport rely on BlackBoard for peak performance
              </p>
            </div>

            {/* Athletes Grid - Compact Design */}
            <div className="relative">
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max md:grid md:grid-cols-4 lg:grid-cols-6 md:gap-3 md:min-w-0">
                  {/* Athletes List */}
                  {[
                    { name: "Timo Werner", sport: "Football", team: "RB Leipzig" },
                    { name: "Marcel Halstenberg", sport: "Football", team: "RB Leipzig" },
                    { name: "Yussuf Poulsen", sport: "Football", team: "RB Leipzig" },
                    { name: "Konrad Laimer", sport: "Football", team: "RB Leipzig" },
                    { name: "Kevin Kampl", sport: "Football", team: "RB Leipzig" },
                    { name: "Dimitrij Ovtcharov", sport: "Table Tennis", team: "Olympic Medalist" },
                    { name: "Galen Rupp", sport: "Athletics", team: "Olympic Marathoner" },
                    { name: "Malaika Mihambo", sport: "Long Jump", team: "World Champion" },
                    { name: "Julian Reus", sport: "Sprint", team: "German Record Holder" },
                    { name: "Maximilian Levy", sport: "Cycling", team: "Olympic Medalist" },
                    { name: "Patrick Hausding", sport: "Diving", team: "Olympic Medalist" },
                    { name: "Fabian Hambüchen", sport: "Gymnastics", team: "Olympic Champion" }
                  ].map((athlete, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-48 md:w-auto bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 hover:bg-gray-800/70 transition-all group"
                    >
                      {/* Avatar Placeholder */}
                      <div className="w-12 h-12 bg-gradient-to-br from-[#ffed00] to-yellow-600 rounded-full mx-auto mb-3 flex items-center justify-center text-black font-bold text-lg">
                        {athlete.name.split(' ').map(n => n[0]).join('')}
                      </div>

                      {/* Athlete Info */}
                      <div className="text-center">
                        <h3 className="text-white font-semibold text-sm group-hover:text-[#ffed00] transition-colors">
                          {athlete.name}
                        </h3>
                        <p className="text-gray-500 text-xs mt-1">{athlete.sport}</p>
                        <p className="text-[#ffed00] text-xs mt-0.5 opacity-80">{athlete.team}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scroll Indicator for Mobile */}
              <div className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-black to-transparent w-8 h-full pointer-events-none flex items-center justify-end pr-2">
                <ChevronRight className="h-5 w-5 text-white animate-pulse" />
              </div>
            </div>

            {/* Stats Bar */}
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-[#ffed00]">50+</div>
                <div className="text-sm text-gray-400">Pro Athletes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-[#ffed00]">15+</div>
                <div className="text-sm text-gray-400">Sports</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-[#ffed00]">10+</div>
                <div className="text-sm text-gray-400">Olympic Medals</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your <span className="text-[#ffed00]">Foundation</span>?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join thousands of athletes and professionals who have discovered
              the power of proper foot function.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 bg-[#ffed00] text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-[#ffed00]/90 transition-all shadow-xl"
              >
                Shop BlackBoard
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-black transition-all"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}