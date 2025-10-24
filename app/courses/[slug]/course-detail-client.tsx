'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { Course, getCoursePrice } from '@/lib/woocommerce/courses'
import { Clock, PlayCircle, Award, Users, BookOpen, Download, Check, Lock, Package, Wrench, ShoppingCart, X, Calendar } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/lib/cart-context'
import { useCurrency } from '@/lib/currency-context'
import { PaymentIcons } from '@/components/ui/payment-icons'

interface CourseDetailClientProps {
  course: Course
}

export function CourseDetailClient({ course: initialCourse }: CourseDetailClientProps) {
  const { data: session, status } = useSession()
  const { getCurrencySymbol } = useCurrency()
  const currencySymbol = getCurrencySymbol()
  const [activeTab, setActiveTab] = useState<'description' | 'includes' | 'learn' | 'equipment'>('description')
  const [isAdding, setIsAdding] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const { addItem } = useCart()

  // Client-side access check - computed immediately to prevent FOUC
  const course = useMemo(() => {
    const enrolledCourseIds = (session as any)?.enrolledCourseIds || []
    const hasAccess = enrolledCourseIds.includes(initialCourse.id) || initialCourse.access?.is_free || false

    return {
      ...initialCourse,
      access: {
        ...initialCourse.access,
        has_access: hasAccess,
        reason: hasAccess ? 'enrolled' : (session ? 'not_enrolled' : 'login_required')
      }
    }
  }, [initialCourse, session])

  // Get course type and booking widget
  const rawCourseType = course.acf?.course_type || 'on_demand'
  const courseType = rawCourseType === 'online_live' ? 'Online Live Course' : 'On Demand'
  const bookingWidget = course.acf?.booking_widget

  // Inject booking widget script when modal opens
  useEffect(() => {
    if (showBookingModal && bookingWidget) {
      // Create a temporary div to parse the script
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = bookingWidget

      // Find and execute any script tags
      const scripts = tempDiv.getElementsByTagName('script')
      const loadedScripts: HTMLScriptElement[] = []

      // Load external scripts first, then inline scripts
      const externalScripts: HTMLScriptElement[] = []
      const inlineScripts: HTMLScriptElement[] = []

      Array.from(scripts).forEach(script => {
        if (script.src) {
          externalScripts.push(script)
        } else {
          inlineScripts.push(script)
        }
      })

      // Load external scripts with promises
      const loadExternalScripts = async () => {
        for (const script of externalScripts) {
          const newScript = document.createElement('script')
          newScript.src = script.src

          // Wait for each external script to load
          await new Promise<void>((resolve, reject) => {
            newScript.onload = () => resolve()
            newScript.onerror = () => reject()
            document.body.appendChild(newScript)
            loadedScripts.push(newScript)
          })
        }

        // After external scripts are loaded, execute inline scripts
        inlineScripts.forEach(script => {
          const newScript = document.createElement('script')
          newScript.textContent = script.textContent
          document.body.appendChild(newScript)
          loadedScripts.push(newScript)
        })
      }

      loadExternalScripts().catch(err => {
        console.error('Failed to load booking widget scripts:', err)
      })

      // Clean up scripts when modal closes
      return () => {
        loadedScripts.forEach(script => {
          script.remove()
        })
      }
    }
  }, [showBookingModal, bookingWidget])

  const handleAddToCart = () => {
    if (!course.acf?.product_data?.id) return

    setIsAdding(true)

    // Construct product object from course data (no API call needed)
    const product = {
      id: course.acf.product_data.id,
      name: course.acf.product_data.name || course.title,
      price: course.acf.product_data.price,
      regular_price: course.acf.product_data.regular_price,
      sale_price: course.acf.product_data.sale_price || '',
      on_sale: course.acf.product_data.on_sale || false,
      slug: course.slug,
      permalink: course.acf.product_data.permalink || `/courses/${course.slug}`,
      images: course.featured_image ? [{
        id: 0,
        src: course.featured_image.url,
        alt: course.featured_image.alt || course.title,
        name: course.featured_image.alt || course.title
      }] : [],
      categories: course.course_categories || [],
      stock_quantity: null,
      manage_stock: false,
      stock_status: 'instock' as const
    }

    // Add the product to cart
    addItem(product as any, 1)

    // Reset loading state after animation
    setTimeout(() => setIsAdding(false), 600)
  }

  const hasAccess = course.access?.has_access || false
  const price = getCoursePrice(course)
  const videoCount = course.acf?.course_videos?.length || 0
  const materialCount = course.acf?.course_materials?.length || 0

  // Calculate total duration if we have video durations
  let totalDuration = course.acf?.duration || ''
  if (!totalDuration && course.acf?.course_videos) {
    const totalMinutes = course.acf.course_videos.reduce((sum, video) => {
      if (video.video_duration) {
        const parts = video.video_duration.split(':')
        if (parts.length === 2) {
          return sum + parseInt(parts[0]) * 60 + parseInt(parts[1])
        }
      }
      return sum
    }, 0)
    if (totalMinutes > 0) {
      const hours = Math.floor(totalMinutes / 60)
      const mins = totalMinutes % 60
      totalDuration = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile-First Hero Section - Same as Product */}
      <section className="lg:py-8">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          {/* Breadcrumb - Hidden on mobile */}
          <nav className="hidden lg:block mb-6">
            <ol className="flex items-center space-x-2 text-sm">
              <li><Link href="/" className="text-gray-600 hover:text-[#ffed00] transition-colors">Home</Link></li>
              <li className="text-gray-400">/</li>
              <li><Link href="/courses" className="text-gray-600 hover:text-[#ffed00] transition-colors">Courses</Link></li>
              <li className="text-gray-400">/</li>
              <li className="font-semibold text-gray-900">{course.title}</li>
            </ol>
          </nav>

          <div className="grid lg:grid-cols-2 gap-0 lg:gap-10 xl:gap-12">
            {/* Image - Mobile Optimized */}
            <div className="relative lg:sticky lg:top-8 lg:h-fit lg:max-w-[600px] lg:w-full">
              {/* Category Badges */}
              {course.course_categories && course.course_categories.length > 0 && (
                <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
                  {course.course_categories.map((cat) => (
                    <span
                      key={cat.id}
                      className="bg-white text-black px-3 py-1.5 rounded-full text-xs font-bold shadow-lg"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Certificate Badge */}
              {course.acf?.certificate_awarded && (
                <div className="absolute top-4 right-4 z-20 bg-[#ffed00] text-black px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                  <Award className="h-3.5 w-3.5" />
                  Certificate
                </div>
              )}

              {/* Main Image - Full Width on Mobile */}
              <div className="relative aspect-video bg-gray-100 lg:rounded-2xl overflow-hidden lg:shadow-xl">
                {course.featured_image?.url ? (
                  <Image
                    src={course.featured_image.url}
                    alt={course.featured_image.alt || course.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#ffed00] to-[#ffd700]">
                    <PlayCircle className="h-24 w-24 text-black/20" />
                  </div>
                )}

                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="bg-[#ffed00] rounded-full p-6 shadow-2xl flex items-center justify-center">
                    <svg className="h-12 w-12 text-black" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Info - Mobile Optimized */}
            <div className="px-4 py-6 lg:px-0 lg:py-0">
              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-4">
                {course.title}
              </h1>

              {/* Excerpt */}
              {course.excerpt && (
                <div
                  className="text-base text-gray-600 mb-6"
                  dangerouslySetInnerHTML={{ __html: course.excerpt }}
                />
              )}

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {totalDuration && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <Clock className="h-5 w-5 text-[#ffed00] mb-1" />
                    <p className="text-xs text-gray-600">Duration</p>
                    <p className="font-bold text-sm">{totalDuration}</p>
                  </div>
                )}
                {videoCount > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <PlayCircle className="h-5 w-5 text-[#ffed00] mb-1" />
                    <p className="text-xs text-gray-600">Lessons</p>
                    <p className="font-bold text-sm">{videoCount} videos</p>
                  </div>
                )}
                {course.acf?.instructor && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <Users className="h-5 w-5 text-[#ffed00] mb-1" />
                    <p className="text-xs text-gray-600">Instructor</p>
                    <p className="font-bold text-sm">{course.acf.instructor}</p>
                  </div>
                )}
                {course.acf?.difficulty && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <BookOpen className="h-5 w-5 text-[#ffed00] mb-1" />
                    <p className="text-xs text-gray-600">Level</p>
                    <p className="font-bold text-sm capitalize">{course.acf.difficulty}</p>
                  </div>
                )}
              </div>

              {/* Price Section - Same style as Product */}
              <div className="mb-6 space-y-2">
                {courseType === 'Online Live Course' && bookingWidget && !hasAccess ? (
                  /* Online Live Course - no price display, booking button below */
                  null
                ) : price && !hasAccess ? (
                  <>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl sm:text-4xl font-semibold text-gray-900">
                        <span className="text-lg sm:text-xl align-top">{currencySymbol}</span>
                        {price}
                      </span>
                      {course.acf?.product_data?.on_sale && course.acf?.product_data?.regular_price && (
                        <>
                          <span className="text-xl sm:text-2xl text-gray-400 line-through">{currencySymbol}{course.acf.product_data.regular_price}</span>
                          <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2.5 py-1 rounded-md text-xs font-semibold">
                            SAVE {Math.round(((parseFloat(course.acf.product_data.regular_price) - parseFloat(price)) / parseFloat(course.acf.product_data.regular_price)) * 100)}%
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      One-time payment • Lifetime access • Includes certificate
                    </p>
                  </>
                ) : !hasAccess ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-semibold text-center">
                      ✓ Free Course
                    </p>
                  </div>
                ) : null}
              </div>

              {/* CTA Buttons */}
              <div className="sticky bottom-0 left-0 right-0 bg-white pb-4 lg:relative lg:pb-0">
                {!hasAccess && courseType === 'Online Live Course' && bookingWidget ? (
                  /* Online Live Course with Booking Widget - CHECK THIS FIRST */
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowBookingModal(true)}
                      className="w-full bg-[#ffed00] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#ffed00]/90 transition-colors shadow-lg lg:shadow-none flex items-center justify-center gap-2"
                    >
                      <Calendar className="h-5 w-5" />
                      Book Your Spot
                    </button>
                    <p className="text-xs text-gray-500 text-center">
                      Booking managed by external provider
                    </p>
                  </div>
                ) : !hasAccess && price && course.acf?.product_id ? (
                  /* Regular Course with Add to Cart */
                  <button
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className="w-full bg-[#ffed00] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#ffed00]/90 transition-colors shadow-lg lg:shadow-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAdding ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5" />
                        Add to Cart - {currencySymbol}{price}
                      </>
                    )}
                  </button>
                ) : hasAccess ? (
                  /* User has access - show green notice and open course button */
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                      <p className="text-sm text-green-700 font-semibold">
                        ✓ You have access to this course
                      </p>
                    </div>
                    <Link href={`/courses/${course.slug}/learn`} className="w-full bg-[#ffed00] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#ffed00]/90 transition-colors flex items-center justify-center gap-2">
                      <PlayCircle className="h-6 w-6" />
                      Open Course
                    </Link>
                  </div>
                ) : (
                  /* Free course without access requirements */
                  <Link href={`/courses/${course.slug}/learn`} className="w-full bg-[#ffed00] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#ffed00]/90 transition-colors shadow-lg lg:shadow-none flex items-center justify-center gap-2">
                    <PlayCircle className="h-6 w-6" />
                    Open Course
                  </Link>
                )}
              </div>

              {/* Payment Methods - Hide for ProCoach Live courses, show for all other courses */}
              {rawCourseType !== 'online_live' && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <PaymentIcons className="w-full" />
                </div>
              )}

              {/* Satisfied Customers - Show for all courses */}
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
                        <Image
                          src={avatar.img}
                          alt={`Customer ${i + 1}`}
                          width={32}
                          height={32}
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

      {/* Tabs Section - Same as Product Page */}
      <section className="py-8 lg:py-16 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          {/* Tab Headers - Mobile Scrollable */}
          <div className="mb-8 lg:mb-12">
            <div className="flex gap-2 overflow-x-auto pb-2 lg:justify-center lg:overflow-visible">
              {[
                { id: 'description', label: 'Description', icon: Package },
                { id: 'includes', label: 'This Course Includes', icon: Check },
                { id: 'learn', label: 'What You\'ll Learn', icon: Award },
                { id: 'equipment', label: 'Equipment & Requirements', icon: Wrench }
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
                    {course.content ? (
                      <div
                        className="prose prose-sm sm:prose-base lg:prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700"
                        dangerouslySetInnerHTML={{ __html: course.content }}
                      />
                    ) : (
                      <p className="text-gray-500">No description available.</p>
                    )}
                  </div>
                )}

                {activeTab === 'includes' && (
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">This Course Includes:</h3>
                    {course.acf?.course_includes && course.acf.course_includes.length > 0 ? (
                      <ul className="space-y-3">
                        {course.acf.course_includes.map((include, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm sm:text-base text-gray-700">{include.item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm sm:text-base text-gray-700">{videoCount} on-demand video lessons</span>
                        </li>
                        {materialCount > 0 && (
                          <li className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm sm:text-base text-gray-700">{materialCount} downloadable resources</span>
                          </li>
                        )}
                        <li className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm sm:text-base text-gray-700">Lifetime access to course content</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm sm:text-base text-gray-700">Access on desktop and mobile</span>
                        </li>
                        {course.acf?.certificate_awarded && (
                          <li className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm sm:text-base text-gray-700">Certificate of completion</span>
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                )}

                {activeTab === 'learn' && (
                  <div>
                    {course.acf?.what_you_will_learn ? (
                      <div
                        className="prose prose-sm sm:prose-base lg:prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700"
                        dangerouslySetInnerHTML={{ __html: course.acf.what_you_will_learn }}
                      />
                    ) : (
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">What You&apos;ll Learn:</h3>
                        <p className="text-gray-500">Course learning outcomes will be added soon.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'equipment' && (
                  <div>
                    {course.acf?.equipment_requirements ? (
                      <div
                        className="prose prose-sm sm:prose-base lg:prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700"
                        dangerouslySetInnerHTML={{ __html: course.acf.equipment_requirements }}
                      />
                    ) : (
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">Equipment & Requirements:</h3>
                        <p className="text-gray-500">No special equipment required. Course requirements will be added soon.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Course Syllabus Section */}
      {course.acf?.course_videos && course.acf.course_videos.length > 0 && (
        <section className="py-8 lg:py-16 bg-white">
          <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Course Curriculum</h2>
                <p className="text-gray-600">
                  {videoCount} lessons • {totalDuration || 'Self-paced learning'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {course.acf.course_videos.map((video, index) => (
                    <div
                      key={index}
                      className={`p-4 sm:p-5 transition-colors ${
                        hasAccess ? 'hover:bg-gray-100 cursor-pointer' : 'cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Lesson Number */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          hasAccess
                            ? 'bg-[#ffed00] text-black'
                            : 'bg-gray-200 text-gray-400'
                        }`}>
                          {hasAccess ? (
                            index + 1
                          ) : (
                            <Lock className="h-4 w-4" />
                          )}
                        </div>

                        {/* Lesson Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-1">
                            <h3 className={`font-semibold text-sm sm:text-base ${
                              hasAccess ? 'text-gray-900' : 'text-gray-500'
                            }`}>
                              {video.video_title}
                            </h3>
                            {video.video_duration && (
                              <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {video.video_duration}
                              </span>
                            )}
                          </div>
                          {video.video_description && (
                            <div
                              className={`text-xs sm:text-sm mt-1 prose prose-sm max-w-none ${
                                hasAccess ? 'prose-p:text-gray-600' : 'prose-p:text-gray-400'
                              }`}
                              dangerouslySetInnerHTML={{ __html: video.video_description }}
                            />
                          )}
                        </div>

                        {/* Play Icon */}
                        {hasAccess && (
                          <PlayCircle className="h-5 w-5 text-[#ffed00] flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Locked State Message */}
              {!hasAccess && price && (
                <div className="mt-6 bg-gradient-to-r from-[#ffed00]/10 to-[#ffed00]/5 border border-[#ffed00]/30 rounded-xl p-6 text-center">
                  <Lock className="h-8 w-8 mx-auto mb-3 text-gray-600" />
                  <h3 className="font-bold text-lg mb-2">Unlock Full Course Access</h3>
                  <p className="text-gray-600 mb-4">
                    Get instant access to all {videoCount} lessons and course materials
                  </p>
                  <button
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className="inline-flex items-center gap-2 bg-[#ffed00] text-black px-8 py-3 rounded-lg font-bold hover:bg-[#ffed00]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAdding ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5" />
                        Add to Cart - {currencySymbol}{price}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Course Materials */}
      {hasAccess && course.acf?.course_materials && course.acf.course_materials.length > 0 && (
        <section className="py-8 lg:py-16 bg-gray-50">
          <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6">Course Materials</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {course.acf.course_materials.map((material, index) => (
                  <a
                    key={index}
                    href={material.material_file.url}
                    download
                    className="flex items-center gap-4 p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-[#ffed00] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Download className="h-6 w-6 text-black" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{material.material_title}</p>
                      <p className="text-xs text-gray-500">{material.material_file.filename}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Booking Widget Modal */}
      {showBookingModal && bookingWidget && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowBookingModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowBookingModal(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>

            {/* Widget content */}
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-4">{course.title}</h3>
              <div
                dangerouslySetInnerHTML={{ __html: bookingWidget }}
                className="booking-widget-container"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

