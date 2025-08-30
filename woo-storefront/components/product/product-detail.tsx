'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Product, ProductVariation, getStockStatus } from '@/lib/woocommerce/products'
import { AddToCartButton } from '@/components/product/add-to-cart'
import { ChevronLeft, ChevronRight, Check, Truck, Shield, Award, Users, Star, Clock, Zap, Heart, Share2, ArrowRight, Package, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface ProductDetailProps {
  product: Product
  variations: ProductVariation[]
}

export function ProductDetail({ product, variations }: ProductDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null)
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState<'benefits' | 'description' | 'specs' | 'reviews'>('benefits')
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [urgencyTimer, setUrgencyTimer] = useState(600) // 10 minutes in seconds

  // Countdown timer for urgency
  useEffect(() => {
    const timer = setInterval(() => {
      setUrgencyTimer((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAttributeChange = (attributeName: string, value: string) => {
    const newAttributes = { ...selectedAttributes, [attributeName]: value }
    setSelectedAttributes(newAttributes)

    // Find matching variation
    const matchingVariation = variations.find(variation => {
      return variation.attributes.every(attr => {
        return newAttributes[attr.name] === attr.option
      })
    })

    setSelectedVariation(matchingVariation || null)
    
    // Update image if variation has one
    if (matchingVariation?.image) {
      const variationImageIndex = product.images.findIndex(img => img.src === matchingVariation.image?.src)
      if (variationImageIndex !== -1) {
        setSelectedImageIndex(variationImageIndex)
      }
    }
  }

  const currentPrice = selectedVariation?.price || product.price
  const currentRegularPrice = selectedVariation?.regular_price || product.regular_price
  const isOnSale = selectedVariation?.on_sale || product.on_sale
  
  // Get proper stock status
  const stockStatus = getStockStatus(selectedVariation || product)

  // Check if this is a BlackBoard product
  const isBlackBoard = product.name.toLowerCase().includes('blackboard')
  const isProfessional = product.name.toLowerCase().includes('professional')

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm">
              <li><Link href="/" className="text-gray-600 hover:text-[#ffed00]">Home</Link></li>
              <li className="text-gray-400">/</li>
              <li><Link href="/shop" className="text-gray-600 hover:text-[#ffed00]">Shop</Link></li>
              <li className="text-gray-400">/</li>
              <li className="font-semibold">{product.name}</li>
            </ol>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Image Gallery - Enhanced */}
            <div className="relative">
              {/* Sale Badge */}
              {isOnSale && (
                <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                  SALE {Math.round(((parseFloat(currentRegularPrice) - parseFloat(currentPrice)) / parseFloat(currentRegularPrice)) * 100)}% OFF
                </div>
              )}

              {/* Best Seller Badge */}
              {isProfessional && (
                <div className="absolute top-4 right-4 z-10 bg-[#ffed00] text-black px-4 py-2 rounded-full font-bold shadow-lg">
                  BEST SELLER
                </div>
              )}

              <motion.div 
                className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-2xl mb-4"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {product.images[selectedImageIndex] && (
                  <Image
                    src={product.images[selectedImageIndex].src}
                    alt={product.images[selectedImageIndex].alt || product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                )}
                
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex((prev) => 
                        prev === 0 ? product.images.length - 1 : prev - 1
                      )}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition-all"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex((prev) => 
                        prev === product.images.length - 1 ? 0 : prev + 1
                      )}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition-all"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
              </motion.div>

              {/* Thumbnail Gallery */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {product.images.map((image, index) => (
                    <motion.button
                      key={image.id}
                      onClick={() => setSelectedImageIndex(index)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index ? 'border-[#ffed00] shadow-lg' : 'border-gray-200'
                      }`}
                    >
                      <Image
                        src={image.src}
                        alt={image.alt || ''}
                        fill
                        className="object-cover"
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info - Enhanced */}
            <div>
              {/* Urgency Timer */}
              {stockStatus.inStock && stockStatus.stockQuantity !== null && stockStatus.stockQuantity <= 10 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 flex items-center gap-3"
                >
                  <Clock className="h-5 w-5 text-orange-500" />
                  <span className="text-sm font-semibold text-orange-800">
                    Limited time offer ends in: {formatTime(urgencyTimer)}
                  </span>
                </motion.div>
              )}

              {/* Rating */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-[#ffed00] text-[#ffed00]" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">(127 verified reviews)</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{product.name}</h1>
              
              {/* Price Section - Enhanced */}
              <div className="mb-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                <div className="flex items-baseline gap-4 mb-2">
                  {variations.length > 0 && !selectedVariation ? (
                    <div>
                      <span className="text-4xl font-bold">€{product.price}</span>
                      <span className="text-2xl text-gray-600"> - €{Math.max(...variations.map(v => parseFloat(v.price))).toFixed(2)}</span>
                    </div>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-black">€{currentPrice}</span>
                      {isOnSale && currentRegularPrice !== currentPrice && (
                        <span className="text-2xl text-gray-400 line-through">€{currentRegularPrice}</span>
                      )}
                    </>
                  )}
                </div>
                {isOnSale && (
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-red-500" />
                    <span className="text-red-600 font-semibold">
                      You save €{(parseFloat(currentRegularPrice) - parseFloat(currentPrice)).toFixed(2)}!
                    </span>
                  </div>
                )}
              </div>

              {/* Key Benefits - New */}
              {isBlackBoard && (
                <div className="bg-[#ffed00]/10 border border-[#ffed00]/30 rounded-xl p-6 mb-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-[#ffed00]" />
                    Why Choose {product.name}?
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Scientifically proven to improve foot function and reduce pain</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Used by 20,000+ professional athletes worldwide</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Lifetime warranty with German engineering quality</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Complete training system with expert guidance included</span>
                    </li>
                  </ul>
                </div>
              )}

              {/* Variations - Enhanced */}
              {product.type === 'variable' && product.attributes.length > 0 && (
                <div className="space-y-4 mb-6">
                  {product.attributes.filter(attr => attr.variation).map((attribute) => (
                    <div key={attribute.id}>
                      <label className="block text-sm font-bold mb-3">
                        Select {attribute.name}:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {attribute.options.map((option) => (
                          <motion.button
                            key={option}
                            onClick={() => handleAttributeChange(attribute.name, option)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-6 py-3 border-2 rounded-xl font-medium transition-all ${
                              selectedAttributes[attribute.name] === option
                                ? 'border-[#ffed00] bg-[#ffed00] text-black shadow-lg'
                                : 'border-gray-300 hover:border-gray-400 bg-white'
                            }`}
                          >
                            {option}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Stock Status - Enhanced */}
              <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                {stockStatus.inStock ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-600 font-bold">{stockStatus.stockText}</span>
                    </div>
                    {stockStatus.stockQuantity !== null && stockStatus.stockQuantity <= 5 && (
                      <span className="text-orange-500 font-semibold animate-pulse">
                        Only {stockStatus.stockQuantity} left!
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-red-600 font-bold">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Action Buttons - Enhanced */}
              <div className="space-y-3 mb-6">
                {product.type === 'simple' && (
                  <AddToCartButton product={product} className="w-full" />
                )}
                
                {product.type === 'variable' && selectedVariation && (
                  <AddToCartButton product={product} variation={selectedVariation} className="w-full" />
                )}
                
                {product.type === 'variable' && !selectedVariation && (
                  <div className="w-full py-4 px-6 bg-gray-100 text-gray-500 rounded-xl text-center font-medium">
                    Please select product options above
                  </div>
                )}

                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`flex-1 py-3 px-4 border-2 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      isWishlisted 
                        ? 'border-red-500 bg-red-50 text-red-600' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                    {isWishlisted ? 'Saved' : 'Save'}
                  </button>
                  <button className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-xl font-medium hover:border-gray-400 transition-all flex items-center justify-center gap-2">
                    <Share2 className="h-5 w-5" />
                    Share
                  </button>
                </div>
              </div>

              {/* Trust Badges - Enhanced */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                <div className="text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="text-xs font-bold">30-Day</p>
                  <p className="text-xs text-gray-600">Money Back</p>
                </div>
                <div className="text-center">
                  <Truck className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-xs font-bold">Free Shipping</p>
                  <p className="text-xs text-gray-600">Orders €100+</p>
                </div>
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-xs font-bold">Lifetime</p>
                  <p className="text-xs text-gray-600">Warranty</p>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-gray-600 mb-2">Secure payment with:</p>
                <div className="flex gap-3">
                  <div className="h-8 w-12 bg-gray-100 rounded flex items-center justify-center text-xs font-bold">VISA</div>
                  <div className="h-8 w-12 bg-gray-100 rounded flex items-center justify-center text-xs font-bold">MC</div>
                  <div className="h-8 w-12 bg-gray-100 rounded flex items-center justify-center text-xs font-bold">AMEX</div>
                  <div className="h-8 w-16 bg-gray-100 rounded flex items-center justify-center text-xs font-bold">PayPal</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Tabs Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {/* Tab Headers - Enhanced */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-gray-100 rounded-full p-1">
              {[
                { id: 'benefits', label: 'Benefits', icon: Zap },
                { id: 'description', label: 'Details', icon: Package },
                { id: 'specs', label: 'Specifications', icon: Award },
                { id: 'reviews', label: 'Reviews', icon: Star }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${
                    activeTab === tab.id 
                      ? 'bg-[#ffed00] text-black shadow-lg' 
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content - Enhanced */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto"
            >
              {activeTab === 'benefits' && (
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Transform Your Performance</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <Check className="h-6 w-6 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Improve Balance & Stability</p>
                          <p className="text-sm text-gray-600">Enhanced proprioception for better athletic performance</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="h-6 w-6 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Reduce Pain & Injuries</p>
                          <p className="text-sm text-gray-600">Address foot dysfunction to eliminate pain from the ground up</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="h-6 w-6 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Professional Grade Training</p>
                          <p className="text-sm text-gray-600">Same equipment used by elite athletes and sports teams</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-4">What&apos;s Included</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <Package className="h-6 w-6 text-[#ffed00] flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Complete Training System</p>
                          <p className="text-sm text-gray-600">Everything you need for professional foot training</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <Award className="h-6 w-6 text-[#ffed00] flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Expert Training Guide</p>
                          <p className="text-sm text-gray-600">Step-by-step instructions from sports professionals</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <Users className="h-6 w-6 text-[#ffed00] flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Community Access</p>
                          <p className="text-sm text-gray-600">Join our community of athletes and trainers</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'description' && (
                <div>
                  {product.description ? (
                    <div 
                      className="prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                  ) : (
                    <p className="text-gray-500">No description available.</p>
                  )}
                </div>
              )}

              {activeTab === 'specs' && (
                <div>
                  <table className="w-full">
                    <tbody>
                      {product.attributes.map((attr) => (
                        <tr key={attr.id} className="border-b">
                          <td className="py-4 pr-8 font-semibold">{attr.name}</td>
                          <td className="py-4">{attr.options.join(', ')}</td>
                        </tr>
                      ))}
                      {product.sku && (
                        <tr className="border-b">
                          <td className="py-4 pr-8 font-semibold">SKU</td>
                          <td className="py-4">{product.sku}</td>
                        </tr>
                      )}
                      <tr className="border-b">
                        <td className="py-4 pr-8 font-semibold">Categories</td>
                        <td className="py-4">
                          {product.categories.map(cat => cat.name).join(', ')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <div className="text-center py-12">
                    <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 mb-4">No reviews yet. Be the first to review this product!</p>
                    <button className="bg-[#ffed00] text-black px-6 py-3 rounded-xl font-bold hover:bg-[#ffed00]/90 transition-all">
                      Write a Review
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Social Proof Section - Enhanced */}
      <section className="py-16 bg-gradient-to-br from-black via-gray-900 to-black text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Join <span className="text-[#ffed00]">20,000+ Athletes</span> Who Trust BlackBoard
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Professional Athlete",
                sport: "Football",
                quote: "BlackBoard completely transformed my training. My balance and agility improved dramatically within weeks."
              },
              {
                name: "Olympic Runner",
                sport: "Track & Field",
                quote: "The best investment I've made for my performance. My foot strength has never been better."
              },
              {
                name: "Physical Therapist",
                sport: "Healthcare Professional",
                quote: "I recommend BlackBoard to all my patients. The results speak for themselves."
              }
            ].map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur rounded-xl p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-[#ffed00] text-[#ffed00]" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">&ldquo;{review.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#ffed00] rounded-full"></div>
                  <div>
                    <div className="font-semibold">{review.name}</div>
                    <div className="text-sm text-gray-400">{review.sport}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-2xl font-bold mb-4">Ready to Transform Your Training?</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-[#ffed00] text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-[#ffed00]/90 transform hover:scale-105 transition-all shadow-2xl"
            >
              Shop All Products
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}