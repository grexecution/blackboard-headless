'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Product, ProductVariation, getStockStatus } from '@/lib/woocommerce/products'
import { AddToCartButtonEnhanced } from '@/components/product/add-to-cart-enhanced'
import { ChevronLeft, ChevronRight, Check, Truck, Shield, Award, Users, Star, Clock, Package, RefreshCw, Globe, Heart, Share2, Zap, Footprints, Ruler, Gift, Info, X } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { PaymentIcons } from '@/components/ui/payment-icons'
import { useCurrency, getProductPrice } from '@/lib/currency-context'

interface ProductDetailProps {
  product: Product
  variations: ProductVariation[]
  workshopProduct?: Product | null
}

export function ProductDetail({ product, variations, workshopProduct }: ProductDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null)
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState<'description' | 'scope' | 'additional' | 'shipping'>('description')
  const [isMobileImageExpanded, setIsMobileImageExpanded] = useState(false)
  const [showWorkshopInfo, setShowWorkshopInfo] = useState(false)

  // Currency context
  const { currency, formatPrice, getCurrencySymbol } = useCurrency()

  // Helper function to rename BlackBoard Normal to Basic
  const getDisplayName = (name: string) => {
    return name.replace(/BlackBoard Normal/gi, 'BlackBoard Basic')
  }

  // Auto-select 'Normal' variant on mount if available
  useEffect(() => {
    if (variations.length > 0 && product.type === 'variable' && product.attributes.length > 0) {
      const sizeAttribute = product.attributes.find(attr => 
        attr.name.toLowerCase().includes('size') || 
        attr.name.toLowerCase().includes('größe')
      )
      
      if (sizeAttribute) {
        const normalOption = sizeAttribute.options.find(opt => 
          opt.toLowerCase().includes('normal') || 
          opt.toLowerCase() === 'standard'
        ) || sizeAttribute.options[0]
        
        if (normalOption) {
          handleAttributeChange(sizeAttribute.name, normalOption)
        }
      }
    }
  }, [variations, product]) // eslint-disable-line react-hooks/exhaustive-deps

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

  // Get currency-aware prices for the main product
  const productPrices = getProductPrice(product, currency)

  // Get currency-aware prices for selected variation or fallback to product prices
  const variationPrices = selectedVariation
    ? getProductPrice(selectedVariation as any, currency)
    : null

  // Determine which prices to use
  const currentPriceData = variationPrices || productPrices
  const currentPrice = currentPriceData.displayPrice
  const currentRegularPrice = currentPriceData.regularPrice
  const isOnSale = currentPriceData.onSale
  const discount = isOnSale && currentRegularPrice && currentPrice
    ? Math.round(((parseFloat(currentRegularPrice) - parseFloat(currentPrice)) / parseFloat(currentRegularPrice)) * 100)
    : 0

  // Format prices with currency
  const formattedCurrentPrice = formatPrice(
    selectedVariation?.currency_prices?.usd?.regular_price || product.currency_prices?.usd?.regular_price || currentPrice,
    selectedVariation?.currency_prices?.eur?.regular_price || product.currency_prices?.eur?.regular_price || currentPrice
  )

  const formattedRegularPrice = isOnSale ? formatPrice(
    selectedVariation?.currency_prices?.usd?.sale_price || product.currency_prices?.usd?.sale_price || currentRegularPrice,
    selectedVariation?.currency_prices?.eur?.sale_price || product.currency_prices?.eur?.sale_price || currentRegularPrice
  ) : null

  // Get currency symbol
  const currencySymbol = getCurrencySymbol()

  // Get proper stock status
  const stockStatus = getStockStatus(selectedVariation || product)

  // Get workshop product price if available
  const workshopPriceFormatted = workshopProduct ? formatPrice(
    workshopProduct.currency_prices?.usd?.regular_price || workshopProduct.regular_price,
    workshopProduct.currency_prices?.eur?.regular_price || workshopProduct.regular_price
  ) : null

  // Check if this is a BlackBoard product
  const isBlackBoard = product.name.toLowerCase().includes('blackboard')
  const isProfessional = product.name.toLowerCase().includes('professional')

  // Debug product description
  console.log('[ProductDetail] Product:', product.name)
  console.log('[ProductDetail] Short description:', product.short_description)
  console.log('[ProductDetail] Description:', product.description?.substring(0, 100))

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile-First Hero Section */}
      <section className="lg:py-8">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          {/* Breadcrumb - Hidden on mobile */}
          <nav className="hidden lg:block mb-6">
            <ol className="flex items-center space-x-2 text-sm">
              <li><Link href="/" className="text-gray-600 hover:text-[#ffed00] transition-colors">Home</Link></li>
              <li className="text-gray-400">/</li>
              <li><Link href="/shop" className="text-gray-600 hover:text-[#ffed00] transition-colors">Shop</Link></li>
              <li className="text-gray-400">/</li>
              <li className="font-semibold text-gray-900">{getDisplayName(product.name)}</li>
            </ol>
          </nav>

          <div className="grid lg:grid-cols-2 gap-0 lg:gap-10 xl:gap-12">
            {/* Image Gallery - Mobile Optimized */}
            <div className="relative lg:sticky lg:top-8 lg:h-fit lg:max-w-[600px] lg:w-full">
              {/* Sale Badge - Mobile Positioned */}
              {isOnSale && discount > 0 && (
                <div className="absolute top-4 left-4 z-20 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg lg:px-4 lg:py-2">
                  -{discount}%
                </div>
              )}

              {/* Main Image - Full Width */}
              <motion.div 
                className="relative aspect-square bg-gray-50 lg:rounded-2xl overflow-hidden lg:shadow-xl"
                onClick={() => setIsMobileImageExpanded(!isMobileImageExpanded)}
              >
                {product.images[selectedImageIndex] && (
                  <Image
                    src={product.images[selectedImageIndex].src}
                    alt={product.images[selectedImageIndex].alt || getDisplayName(product.name)}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                )}
                
                {/* Image Navigation - Desktop Only */}
                {product.images.length > 1 && (
                  <div className="hidden lg:flex">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedImageIndex((prev) => 
                          prev === 0 ? product.images.length - 1 : prev - 1
                        )
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur p-2 rounded-full shadow-lg hover:bg-white transition-all"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedImageIndex((prev) => 
                          (prev + 1) % product.images.length
                        )
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur p-2 rounded-full shadow-lg hover:bg-white transition-all"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}

                {/* Mobile Image Dots */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 lg:hidden">
                    {product.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedImageIndex(index)
                        }}
                        className={`w-2 h-2 rounded-full transition-all ${
                          selectedImageIndex === index 
                            ? 'bg-white w-6' 
                            : 'bg-white/60'
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
              
              {/* Thumbnail Gallery - Show 3 with navigation */}
              {product.images.length > 1 && (
                <div className="hidden lg:block mt-4">
                  <div className="relative">
                    <div className="flex gap-3">
                      {product.images.slice(0, Math.min(4, product.images.length)).map((image, index) => (
                        <motion.button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`relative aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all flex-1 max-w-[140px] ${
                            selectedImageIndex === index 
                              ? 'border-[#ffed00] shadow-md' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Image
                            src={image.src}
                            alt={image.alt || ''}
                            fill
                            className="object-cover"
                            sizes="140px"
                          />
                        </motion.button>
                      ))}
                      {product.images.length > 4 && (
                        <button
                          onClick={() => setSelectedImageIndex((selectedImageIndex + 1) % product.images.length)}
                          className="relative aspect-square bg-gray-100 rounded-lg border-2 border-gray-200 hover:border-gray-300 flex-1 max-w-[140px] flex items-center justify-center transition-all hover:bg-gray-200"
                        >
                          <div className="text-center">
                            <ChevronRight className="h-5 w-5 mx-auto text-gray-600" />
                            <span className="text-xs text-gray-600 font-medium">+{product.images.length - 4}</span>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Product Info - Mobile Optimized */}
            <div className="px-4 py-6 lg:px-0 lg:py-0">
              {/* Header with Germany Badge - Mobile Optimized */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                  {getDisplayName(product.name)}
                </h1>
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-gray-100 to-gray-50 px-3 py-1.5 rounded-full self-start border border-gray-200">
                  <span className="text-base">🇩🇪</span>
                  <span className="text-xs font-semibold text-gray-700">Made in Germany</span>
                </div>
              </div>
              
              {/* Modern Minimal Price Section */}
              <div className="mb-6 space-y-2">
                {/* Price Line */}
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-3">
                    {variations.length > 0 && !selectedVariation ? (
                      <>
                        <span className="text-3xl sm:text-4xl font-semibold text-gray-900">
                          {formattedCurrentPrice}
                        </span>
                        <span className="text-sm text-gray-500">starting price</span>
                      </>
                    ) : (
                      <>
                        <span className="text-3xl sm:text-4xl font-semibold text-gray-900">
                          {formattedCurrentPrice}
                        </span>
                        {isOnSale && formattedRegularPrice && (
                          <>
                            <span className="text-xl sm:text-2xl text-gray-400 line-through">{formattedRegularPrice}</span>
                            <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2.5 py-1 rounded-md text-xs font-semibold">
                              SAVE {discount}%
                            </span>
                          </>
                        )}
                      </>
                    )}
                  </div>
                  
                  {/* Stock Status - Minimal */}
                  {stockStatus.inStock ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600">Available</span>
                      {stockStatus.stockQuantity !== null && stockStatus.stockQuantity <= 5 && (
                        <span className="text-sm text-orange-600 font-semibold">• Last {stockStatus.stockQuantity}</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-sm text-gray-500">Out of stock</span>
                    </div>
                  )}
                </div>
                
                {/* VAT and Shipping Info - Subtle */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Includes 19% VAT • Free shipping over €100
                  </p>
                  {isOnSale && discount > 0 && (
                    <p className="text-xs text-red-600 font-medium">
                      Limited time offer
                    </p>
                  )}
                </div>
              </div>

              {/* Why Choose This Product - More Prominent */}
              {isBlackBoard && (
                <div className="bg-gradient-to-r from-[#ffed00]/20 to-[#ffed00]/10 border-2 border-[#ffed00]/40 rounded-xl p-5 mb-6 shadow-sm">
                  <h3 className="font-bold text-base sm:text-lg mb-3 flex items-center gap-2 text-gray-900">
                    <Award className="h-5 w-5 text-[#ffed00]" />
                    Why Choose {getDisplayName(product.name).split(' ')[0]}?
                  </h3>
                  <ul className="space-y-2.5">
                    <li className="flex items-start gap-2.5">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base text-gray-700">Scientifically proven to improve foot function & reduce pain</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base text-gray-700">Trusted by 20,000+ customers worldwide</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base text-gray-700">German engineering with lifetime warranty</span>
                    </li>
                    {/* Compact Freebie Display */}
                    <li className="relative">
                      <div className="bg-gradient-to-r from-green-900/30 to-yellow-900/20 rounded-xl p-3 border-l-4 border-l-green-400">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="bg-green-400 text-black rounded-full p-1.5 shadow-lg flex-shrink-0">
                              <Gift className="h-4 w-4" />
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-400 to-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                <Gift className="h-3 w-3" />
                                FREE BONUS GIFT
                              </div>
                              <span className="text-sm font-semibold text-gray-900">
                                {workshopProduct?.name || 'Functional Foot Workshop'}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                {workshopPriceFormatted || `${currencySymbol}49`}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowWorkshopInfo(true)}
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 underline font-medium whitespace-nowrap"
                          >
                            <Info className="h-3 w-3" />
                            View Details
                          </button>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              )}

              {/* Product Excerpt - Show short_description or first part of description */}
              {(product.short_description && product.short_description.trim() !== '') ? (
                <div className="mb-6 text-gray-700 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.short_description }}
                />
              ) : product.description && product.description.trim() !== '' ? (
                <div className="mb-6 text-gray-700 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description.substring(0, 500) + '...' }}
                />
              ) : null}

              {/* Variations - Mobile Optimized */}
              {product.type === 'variable' && product.attributes.length > 0 && (
                <div className="space-y-4 mb-6">
                  {product.attributes.filter(attr => attr.variation).map((attribute) => (
                    <div key={attribute.id}>
                      <label className="block text-sm font-bold mb-3 text-gray-900">
                        Select {attribute.name}:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {attribute.options.map((option) => {
                          const isXL = option.toLowerCase().includes('xl')
                          const sizeInfo = isXL 
                            ? 'Shoe size > EU 47 / US 13' 
                            : 'Shoe size ≤ EU 47 / US 13'
                          
                          return (
                            <motion.button
                              key={option}
                              onClick={() => handleAttributeChange(attribute.name, option)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`px-4 py-3 border-2 rounded-xl transition-all ${
                                selectedAttributes[attribute.name] === option
                                  ? 'border-[#ffed00] bg-[#ffed00] text-black shadow-lg'
                                  : 'border-gray-300 hover:border-gray-400 bg-white'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                  {isXL ? (
                                    <Ruler className="h-5 w-5 opacity-70" />
                                  ) : (
                                    <Footprints className="h-5 w-5 opacity-70" />
                                  )}
                                </div>
                                <div className="text-left">
                                  <div className="font-bold text-sm sm:text-base mb-0.5">
                                    {getDisplayName(product.name).split(' ')[0]} {option}
                                  </div>
                                  <div className="text-[10px] sm:text-xs opacity-80">{sizeInfo}</div>
                                </div>
                              </div>
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}


              {/* Add to Cart with Customer Satisfaction */}
              <div className="sticky bottom-0 left-0 right-0 bg-white pb-4 lg:relative lg:pb-0">
                {/* Customer Satisfaction - Clean Design */}
                <AddToCartButtonEnhanced 
                  product={product} 
                  variation={selectedVariation || undefined}
                  workshopProduct={workshopProduct}
                  className="w-full shadow-lg lg:shadow-none"
                />
              </div>

              {/* Payment Methods - Juicy Style */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <PaymentIcons className="w-full" />
              </div>

              {/* Satisfied Customers */}
              <div className="mt-6">
                <div className="flex items-center justify-center gap-3">
                  <div className="flex -space-x-2">
                    {[
                      { img: 'https://randomuser.me/api/portraits/men/32.jpg' },
                      { img: 'https://randomuser.me/api/portraits/women/44.jpg' },
                      { img: 'https://randomuser.me/api/portraits/men/52.jpg' },
                      { img: 'https://randomuser.me/api/portraits/women/68.jpg' },
                      { img: 'https://randomuser.me/api/portraits/men/75.jpg' }
                    ].map((avatar, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden bg-gray-200"
                      >
                        <img
                          src={avatar.img}
                          alt={`Customer ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-800">20,000+</span> satisfied customers
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section - Mobile Optimized */}
      <section className="py-8 lg:py-16 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          {/* Tab Headers - Mobile Scrollable */}
          <div className="mb-8 lg:mb-12">
            <div className="flex gap-2 overflow-x-auto pb-2 lg:justify-center lg:overflow-visible">
              {[
                { id: 'description', label: 'Description', icon: Package },
                { id: 'scope', label: 'What\'s Included', icon: Check },
                { id: 'additional', label: 'Details', icon: Award },
                { id: 'shipping', label: 'Shipping', icon: Truck }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-full font-medium transition-all flex items-center gap-2 text-sm whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'bg-[#ffed00] text-black shadow-md' 
                      : 'bg-white text-gray-600 hover:text-black border border-gray-200'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content - Mobile Optimized */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-xl p-6 lg:p-8 shadow-sm">
                {activeTab === 'description' && (
                  <div>
                    {(product as any).acf?.product_detail_description ? (
                      <div 
                        className="prose prose-sm sm:prose-base lg:prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700"
                        dangerouslySetInnerHTML={{ __html: (product as any).acf.product_detail_description }}
                      />
                    ) : product.description ? (
                      <div 
                        className="prose prose-sm sm:prose-base lg:prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700"
                        dangerouslySetInnerHTML={{ __html: product.description }}
                      />
                    ) : (
                      <p className="text-gray-500">No description available.</p>
                    )}
                  </div>
                )}

                {activeTab === 'scope' && (
                  <div>
                    {(product as any).acf?.scope_of_delivery ? (
                      <div 
                        className="prose prose-sm sm:prose-base lg:prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: (product as any).acf.scope_of_delivery }}
                      />
                    ) : (
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">What&apos;s Included:</h3>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm sm:text-base text-gray-700">1x {getDisplayName(product.name)}</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm sm:text-base text-gray-700">Complete training guide & instructions</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm sm:text-base text-gray-700">Access to online training videos</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm sm:text-base text-gray-700">Lifetime warranty certificate</span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'additional' && (
                  <div>
                    {(product as any).acf?.additional_information ? (
                      <div 
                        className="prose prose-sm sm:prose-base lg:prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: (product as any).acf.additional_information }}
                      />
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <tbody>
                            {product.attributes.map((attr) => (
                              <tr key={attr.id} className="border-b">
                                <td className="py-3 pr-4 font-semibold text-sm sm:text-base text-gray-900">{attr.name}</td>
                                <td className="py-3 text-sm sm:text-base text-gray-700">{attr.options.join(', ')}</td>
                              </tr>
                            ))}
                            {product.sku && (
                              <tr className="border-b">
                                <td className="py-3 pr-4 font-semibold text-sm sm:text-base text-gray-900">SKU</td>
                                <td className="py-3 text-sm sm:text-base text-gray-700">{product.sku}</td>
                              </tr>
                            )}
                            <tr className="border-b">
                              <td className="py-3 pr-4 font-semibold text-sm sm:text-base text-gray-900">Categories</td>
                              <td className="py-3 text-sm sm:text-base text-gray-700">
                                {product.categories.map(cat => cat.name).join(', ')}
                              </td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-3 pr-4 font-semibold text-sm sm:text-base text-gray-900">Made in</td>
                              <td className="py-3 text-sm sm:text-base text-gray-700">Germany 🇩🇪</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'shipping' && (
                  <div>
                    {(product as any).acf?.shipping_information ? (
                      <div 
                        className="prose prose-sm sm:prose-base lg:prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: (product as any).acf.shipping_information }}
                      />
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-bold text-base sm:text-lg mb-3 text-gray-900">Shipping Times</h3>
                          <ul className="space-y-2">
                            <li className="flex items-center gap-3">
                              <Truck className="h-4 w-4 text-gray-600" />
                              <span className="text-sm sm:text-base text-gray-700">Germany: 2-3 business days</span>
                            </li>
                            <li className="flex items-center gap-3">
                              <Truck className="h-4 w-4 text-gray-600" />
                              <span className="text-sm sm:text-base text-gray-700">EU: 3-5 business days</span>
                            </li>
                            <li className="flex items-center gap-3">
                              <Globe className="h-4 w-4 text-gray-600" />
                              <span className="text-sm sm:text-base text-gray-700">Worldwide: 5-12 business days</span>
                            </li>
                          </ul>
                        </div>

                        <div>
                          <h3 className="font-bold text-base sm:text-lg mb-3 text-gray-900">Shipping Costs</h3>
                          <ul className="space-y-2">
                            <li className="text-sm sm:text-base text-gray-700">• Free shipping on orders over €100</li>
                            <li className="text-sm sm:text-base text-gray-700">• Standard shipping: €9.90 (Germany)</li>
                            <li className="text-sm sm:text-base text-gray-700">• Express shipping available</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Why Choose Section - Premium Feel, Mobile Optimized */}
      {isBlackBoard && (
        <section className="py-12 lg:py-16 bg-gradient-to-br from-gray-900 to-black text-white">
          <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 lg:mb-12">
              Why Professionals Choose {getDisplayName(product.name)}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="bg-[#ffed00] text-black w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-lg mb-2">20,000+ Customers</h3>
                <p className="text-sm text-gray-300">Trusted by athletes and therapists worldwide</p>
              </motion.div>

              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="bg-[#ffed00] text-black w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-lg mb-2">Award Winning</h3>
                <p className="text-sm text-gray-300">Recognized for innovation in sports therapy</p>
              </motion.div>

              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="bg-[#ffed00] text-black w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-lg mb-2">Lifetime Warranty</h3>
                <p className="text-sm text-gray-300">German engineering you can trust</p>
              </motion.div>

              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="bg-[#ffed00] text-black w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-lg mb-2">4.9/5 Rating</h3>
                <p className="text-sm text-gray-300">Based on 3000+ verified reviews</p>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Workshop Info Modal */}
      {showWorkshopInfo && workshopProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowWorkshopInfo(false)}>
          <motion.div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-green-600" />
                <h2 className="text-xl font-bold">Your Free Bonus Gift</h2>
              </div>
              <button
                onClick={() => setShowWorkshopInfo(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Workshop Image */}
              {workshopProduct.images?.[0] && (
                <div className="relative aspect-video mb-6 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={workshopProduct.images[0].src}
                    alt={workshopProduct.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Workshop Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{workshopProduct.name}</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-2xl text-gray-400 line-through">{workshopPriceFormatted}</span>
                    <span className="text-3xl font-bold text-green-600">FREE</span>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      Included with your purchase
                    </span>
                  </div>
                </div>

                {/* Description */}
                {workshopProduct.description && (
                  <div>
                    <h4 className="font-semibold mb-2">About this workshop:</h4>
                    <div 
                      className="text-gray-600 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: workshopProduct.description }}
                    />
                  </div>
                )}

                {/* Key Benefits */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    What you&apos;ll get:
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Lifetime access to workshop materials</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Professional training techniques</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Downloadable resources and guides</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">{workshopPriceFormatted} value - absolutely free</span>
                    </li>
                  </ul>
                </div>

                {/* Auto-add Notice */}
                <div className="bg-[#ffed00]/10 border border-[#ffed00]/30 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700">
                    <Gift className="h-4 w-4 inline mr-1 text-green-600" />
                    This workshop will be automatically added to your cart when you add the {getDisplayName(product.name)} to your order.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}