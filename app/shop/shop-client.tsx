'use client'

import { Product, ProductVariation } from '@/lib/woocommerce/products'
import { Course } from '@/lib/woocommerce/courses'
import { ProductPriceDisplay } from '@/components/products/ProductPriceDisplay'
import { useCurrency } from '@/lib/currency-context'
import CoursesGridSimple from '@/components/courses/courses-grid-simple'
import Link from 'next/link'
import Image from 'next/image'
import { Package, Truck, Award, ChevronRight, Star, Shield, Globe, RefreshCw, Gift, Check } from 'lucide-react'

interface ShopClientProps {
  blackboardWithVariations: (Product & { variationData?: ProductVariation[] })[]
  accessories: Product[]
  workshopCourses: Course[]
  procoachCourses: Course[]
}

export default function ShopClient({
  blackboardWithVariations,
  accessories,
  workshopCourses,
  procoachCourses
}: ShopClientProps) {
  const { getCurrencySymbol } = useCurrency()
  const currencySymbol = getCurrencySymbol()

  // Helper function to rename BlackBoard Normal to Basic
  const getDisplayName = (name: string) => {
    return name.replace(/BlackBoard Normal/gi, 'BlackBoard Basic')
  }

  // Get price display for products
  const getPriceDisplay = (product: Product, variations?: ProductVariation[], size: 'sm' | 'md' | 'lg' = 'md') => {
    if (product.type === 'simple') {
      return <ProductPriceDisplay product={product} size={size} />
    }

    if (variations && variations.length > 0) {
      // Show minimum price with "starting from" for variable products
      return <ProductPriceDisplay product={product} variations={variations} showFrom={true} size={size} />
    }

    return <ProductPriceDisplay product={product} size={size} />
  }

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
              {blackboardWithVariations.map((product) => {
                const isProfessional = product.name.toLowerCase().includes('professional')

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

                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Freebie Badge */}
                      <div className="absolute bottom-4 left-4 right-4 transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg group-hover:bg-white transition-colors">
                          <div className="flex items-center gap-2">
                            <Gift className="h-5 w-5 text-green-500 animate-bounce" />
                            <span className="text-sm font-semibold text-gray-900">
                              Includes FREE Functional Foot Workshop ({currencySymbol}49 value)
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
                        <div className="text-gray-900">
                          {getPriceDisplay(product, product.variationData, 'lg')}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Includes 19% VAT • Free shipping over {currencySymbol}100
                        </p>
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

                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Accessories Section - Premium Design */}
      {accessories.length > 0 && (
        <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50">
          <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-[#ffed00]/10 px-4 py-2 rounded-full mb-4">
                <Package className="h-4 w-4 text-[#ffed00]" />
                <span className="text-sm font-semibold text-gray-700">Premium Add-Ons</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Essential Accessories</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Enhance your training experience with our carefully selected accessories
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
              {accessories.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  className="group relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Gradient Border Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#ffed00]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>

                  {/* Sale Badge */}
                  {product.on_sale && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
                        SALE
                      </span>
                    </div>
                  )}

                  {/* Product Image */}
                  <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    {product.images[0] && (
                      <Image
                        src={product.images[0].src}
                        alt={product.images[0].alt || getDisplayName(product.name)}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center justify-center gap-2 text-white">
                          <span className="text-sm font-semibold">View Details</span>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>

                    {/* Index Badge - Top Right */}
                    <div className="absolute top-3 right-3">
                      <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-xs font-bold text-gray-700">{index + 1}</span>
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 relative">
                    <h3 className="font-bold text-sm mb-3 line-clamp-2 min-h-[2.5rem] group-hover:text-[#ffed00] transition-colors">
                      {getDisplayName(product.name)}
                    </h3>

                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <ProductPriceDisplay product={product} size="sm" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-[#ffed00] flex items-center justify-center transition-colors duration-300">
                        <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-black transition-colors" />
                      </div>
                    </div>

                    {/* Stock Indicator */}
                    <div className="mt-3 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-500">In Stock</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Trust Badge Below */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Fast Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Premium Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Secure Payment</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Workshops Section */}
      {workshopCourses.length > 0 && (
        <section className="py-16 lg:py-24">
          <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Online Workshops</h2>
              <p className="text-lg text-gray-600">Learn from experts and enhance your skills</p>
            </div>

            <CoursesGridSimple initialCourses={workshopCourses} />

            <div className="text-center mt-8">
              <Link
                href="/workshops"
                className="inline-flex items-center gap-2 text-[#ffed00] hover:text-[#ffed00]/80 font-semibold"
              >
                View All Workshops
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ProCoach Section */}
      {procoachCourses.length > 0 && (
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

            <CoursesGridSimple initialCourses={procoachCourses} />

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
