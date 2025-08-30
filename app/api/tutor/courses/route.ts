import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    if (!token?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id') || token.userId

    console.log('Fetching courses for user:', userId)

    // Try to fetch courses from WooCommerce orders (including TutorLMS course products)
    try {
      const ordersResponse = await fetch(
        `${process.env.WP_BASE_URL}/wp-json/wc/v3/orders?customer=${userId}&status=completed&per_page=100`,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(
              `${process.env.WOO_CONSUMER_KEY}:${process.env.WOO_CONSUMER_SECRET}`
            ).toString('base64')}`,
          },
        }
      )

      if (ordersResponse.ok) {
        const orders = await ordersResponse.json()
        console.log('Found orders:', orders.length)
        
        // Extract all course products from orders
        const courseProducts = []
        for (const order of orders) {
          if (order.line_items) {
            for (const item of order.line_items) {
              // Check if it's a course product (TutorLMS courses are typically WooCommerce products)
              const isCourse = 
                item.name?.toLowerCase().includes('course') ||
                item.name?.toLowerCase().includes('kurs') ||
                item.meta_data?.some((meta: any) => 
                  meta.key === '_tutor_course_product' || 
                  meta.key === 'tutor_course_id'
                ) ||
                item.product_id // Include all products for now, filter later if needed

              if (isCourse) {
                courseProducts.push({
                  ...item,
                  order_id: order.id,
                  order_date: order.date_created,
                  order_number: order.number
                })
              }
            }
          }
        }

        console.log('Found course products:', courseProducts.length)

        if (courseProducts.length > 0) {
          // Fetch product details and course content to get more information
          const coursesWithDetails = await Promise.all(
            courseProducts.map(async (item) => {
              let productDetails = null
              let courseUrl = null
              let tutorCourseId = null
              let firstLessonUrl = null
              let courseContents = null

              // Try to fetch product details from WooCommerce
              try {
                const productResponse = await fetch(
                  `${process.env.WP_BASE_URL}/wp-json/wc/v3/products/${item.product_id}`,
                  {
                    headers: {
                      'Authorization': `Basic ${Buffer.from(
                        `${process.env.WOO_CONSUMER_KEY}:${process.env.WOO_CONSUMER_SECRET}`
                      ).toString('base64')}`,
                    },
                  }
                )
                if (productResponse.ok) {
                  productDetails = await productResponse.json()
                  
                  // Try to find the TutorLMS course ID from meta data
                  tutorCourseId = productDetails.meta_data?.find((m: any) => 
                    m.key === '_tutor_course_product_id' || 
                    m.key === 'tutor_course_id' ||
                    m.key === '_course_id'
                  )?.value
                  
                  // If we don't have a specific course ID, try to match by product ID
                  // TutorLMS often uses the same ID for both the product and course
                  if (!tutorCourseId) {
                    tutorCourseId = item.product_id
                  }
                  
                  console.log('Checking TutorLMS course ID:', tutorCourseId, 'for product:', item.name)
                }
              } catch (error) {
                console.error('Error fetching product details for:', item.product_id, error)
              }

              // Since TutorLMS API requires authentication we can't easily access,
              // we'll construct the course URL based on known patterns
              // TutorLMS typically uses: /courses/{course-slug}/
              // And lessons are at: /courses/{course-slug}/lesson/{lesson-slug}/
              
              // For now, we'll link directly to the course page which should auto-redirect
              // to the first lesson if the user is enrolled
              const courseSlug = productDetails?.slug || item.name.toLowerCase().replace(/\s+/g, '-')
              
              // Check if this looks like an on-demand course
              const isOnDemand = item.name.toLowerCase().includes('on-demand') || 
                                item.name.toLowerCase().includes('on demand')
              
              if (isOnDemand) {
                // For on-demand courses, try to construct a direct lesson URL
                // Based on the pattern: /courses/certification-level-1-on-demand/lesson/introduction-2/
                // We'll default to "introduction" as the first lesson slug
                firstLessonUrl = `${process.env.WP_BASE_URL}/courses/${courseSlug}/lesson/introduction/`
                console.log('Generated on-demand course lesson URL:', firstLessonUrl)
                
                // Also try with introduction-2 as a fallback
                const alternativeUrl = `${process.env.WP_BASE_URL}/courses/${courseSlug}/lesson/introduction-2/`
                console.log('Alternative lesson URL:', alternativeUrl)
                
                // Use the alternative if it matches the known pattern
                if (courseSlug.includes('level-1')) {
                  firstLessonUrl = alternativeUrl
                }
              }

              // Fallback: If no first lesson URL was generated, use the course page
              // TutorLMS should auto-redirect enrolled users to the first lesson

              // Determine the course URL (prefer first lesson, fallback to course page)
              if (firstLessonUrl) {
                courseUrl = firstLessonUrl
              } else if (productDetails?.external_url) {
                courseUrl = productDetails.external_url
              } else if (productDetails?.permalink) {
                courseUrl = productDetails.permalink
              } else if (productDetails?.slug) {
                // Fallback to standard TutorLMS course URL structure
                courseUrl = `${process.env.WP_BASE_URL}/courses/${productDetails.slug}/`
              } else {
                courseUrl = `${process.env.WP_BASE_URL}/courses/${item.name.toLowerCase().replace(/\s+/g, '-')}/`
              }

              // Build the course object
              return {
                id: item.product_id,
                title: item.name,
                slug: productDetails?.slug || item.name.toLowerCase().replace(/\s+/g, '-'),
                status: "publish",
                excerpt: productDetails?.short_description || 
                        productDetails?.description?.substring(0, 150) + '...' ||
                        `Learn ${item.name} with comprehensive lessons and practical examples.`,
                featured_image: productDetails?.images?.[0]?.src || null,
                // Course-specific data
                course_url: courseUrl,
                first_lesson_url: firstLessonUrl,
                course_page_url: productDetails?.permalink || `${process.env.WP_BASE_URL}/courses/${productDetails?.slug || item.name.toLowerCase().replace(/\s+/g, '-')}/`,
                wordpress_url: productDetails?.permalink || null,
                tutor_course_id: tutorCourseId,
                // Course contents
                course_contents: courseContents,
                topics_count: courseContents?.topics?.length || 0,
                // Progress tracking (would need TutorLMS API for real data)
                progress: 0, // Default to 0, would need TutorLMS API for actual progress
                total_lessons: courseContents?.total_lessons || 
                              productDetails?.meta_data?.find((m: any) => m.key === '_tutor_course_lesson_count')?.value || 
                              0,
                completed_lessons: 0,
                // Dates
                enrollment_date: item.order_date,
                purchase_date: item.order_date,
                completion_date: null,
                certificate_url: null,
                // Additional info
                instructor: {
                  id: 1,
                  name: productDetails?.meta_data?.find((m: any) => m.key === '_tutor_course_instructor')?.value || "Course Instructor",
                  avatar: null
                },
                categories: productDetails?.categories?.map((c: any) => c.name) || [],
                tags: productDetails?.tags?.map((t: any) => t.name) || [],
                price: item.total || item.price || productDetails?.price || "0",
                regular_price: productDetails?.regular_price || item.price || "0",
                sale_price: productDetails?.sale_price || null,
                currency: item.currency || "EUR",
                duration: productDetails?.meta_data?.find((m: any) => m.key === '_course_duration')?.value || "Self-paced",
                level: productDetails?.meta_data?.find((m: any) => m.key === '_course_level')?.value || "All Levels",
                // Order info
                order_id: item.order_id,
                order_number: item.order_number,
                // Product type
                product_type: productDetails?.type || 'simple',
                is_virtual: productDetails?.virtual || true,
                is_downloadable: productDetails?.downloadable || false,
                // Additional metadata
                sku: productDetails?.sku || item.sku || null,
                product_id: item.product_id,
              }
            })
          )

          console.log('Returning courses with details:', coursesWithDetails.length)
          return NextResponse.json(coursesWithDetails)
        }
      }
    } catch (error) {
      console.error('Error fetching courses from orders:', error)
    }

    // If no courses found, return empty array instead of mock data
    console.log('No courses found for user')
    return NextResponse.json([])

  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}