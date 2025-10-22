// Parse JSON response with PHP warning handling
function parseJsonResponse<T>(text: string): T | null {
  try {
    // Remove any PHP warnings/notices that might be prepended
    // Find the FIRST occurrence of either [ or {
    const arrayStart = text.indexOf('[')
    const objectStart = text.indexOf('{')

    let jsonStart = -1
    if (arrayStart === -1 && objectStart === -1) {
      console.error('[JSON Parser] No JSON found in response')
      return null
    } else if (arrayStart === -1) {
      jsonStart = objectStart
    } else if (objectStart === -1) {
      jsonStart = arrayStart
    } else {
      // Both exist, use whichever comes first
      jsonStart = Math.min(arrayStart, objectStart)
    }

    // Get JSON text starting from the first { or [
    let jsonText = text.substring(jsonStart)

    // Find the last } or ] to trim any trailing content
    let jsonEnd = -1
    let braceCount = 0
    let inString = false
    let escapeNext = false

    for (let i = 0; i < jsonText.length; i++) {
      const char = jsonText[i]

      if (escapeNext) {
        escapeNext = false
        continue
      }

      if (char === '\\') {
        escapeNext = true
        continue
      }

      if (char === '"') {
        inString = !inString
        continue
      }

      if (!inString) {
        if (char === '{' || char === '[') {
          braceCount++
        } else if (char === '}' || char === ']') {
          braceCount--
          if (braceCount === 0) {
            jsonEnd = i + 1
            break
          }
        }
      }
    }

    if (jsonEnd > 0) {
      jsonText = jsonText.substring(0, jsonEnd)
    }

    const parsed = JSON.parse(jsonText) as T
    return parsed
  } catch (error) {
    console.error('[JSON Parser] Error parsing JSON response:', error)
    console.error('[JSON Parser] Raw response:', text.substring(0, 500))
    return null
  }
}

// Course Types
export interface Course {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image?: {
    url: string
    alt: string
  }
  course_categories: {
    id: number
    name: string
    slug: string
  }[]
  acf?: {
    product_id?: number
    billing_product_id?: number
    access_product_ids?: number[]
    is_free_course?: boolean | '1' | '0'
    product_data?: {
      id: number
      name: string
      price: string
      regular_price: string
      sale_price: string
      on_sale: boolean
      permalink: string
    }
    duration?: string
    course_videos?: {
      video_title: string
      vimeo_id: string
      video_duration?: string
      video_description?: string
      thumbnail?: string
    }[]
    course_materials?: {
      material_title: string
      material_file: {
        url: string
        filename: string
        filesize: number
        mime_type: string
      }
    }[]
    start_date?: string
    instructor?: string
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
    certificate_awarded?: boolean
    course_type?: 'on_demand' | 'online_live'
    booking_widget?: string
    course_includes?: {
      item: string
    }[]
    what_you_will_learn?: string
    equipment_requirements?: string
    course_prerequisites?: string
    course_equipment?: string
  }
  access: {
    has_access: boolean
    reason: string
    is_free?: boolean
    product_id?: number
    access_product_ids?: number[]
    purchased_product_id?: number
  }
}

// Fetch all courses
export async function getAllCourses(): Promise<Course[]> {
  const apiUrl = process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL || process.env.WP_BASE_URL || 'https://blackboard-training.com'
  const endpoint = `${apiUrl}/wp-json/blackboard/v1/courses`

  console.log('[getAllCourses] Fetching from:', endpoint)
  console.log('[getAllCourses] Env vars:', {
    WORDPRESS_API_URL: process.env.WORDPRESS_API_URL,
    NEXT_PUBLIC_WORDPRESS_API_URL: process.env.NEXT_PUBLIC_WORDPRESS_API_URL,
    WP_BASE_URL: process.env.WP_BASE_URL
  })

  try {
    const response = await fetch(endpoint, {
      next: { revalidate: false },
      headers: {
        'Accept': 'application/json',
      },
    })

    console.log('[getAllCourses] Response status:', response.status)

    if (!response.ok) {
      console.error('[getAllCourses] Failed to fetch courses:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('[getAllCourses] Error response:', errorText.substring(0, 500))
      return []
    }

    const text = await response.text()
    console.log('[getAllCourses] Response length:', text.length)

    const courses = parseJsonResponse<Course[]>(text)
    console.log('[getAllCourses] Parsed courses count:', courses?.length || 0)

    return courses || []
  } catch (error) {
    console.error('[getAllCourses] Error fetching courses:', error)
    return []
  }
}

// Fetch single course by slug
export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const apiUrl = process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL || process.env.WP_BASE_URL || 'https://blackboard-training.com'

  try {
    const response = await fetch(`${apiUrl}/wp-json/blackboard/v1/courses/${slug}`, {
      next: { revalidate: false },
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('Failed to fetch course:', response.status)
      return null
    }

    const text = await response.text()
    const course = parseJsonResponse<Course>(text)

    return course
  } catch (error) {
    console.error('Error fetching course:', error)
    return null
  }
}

// Get courses by category
export function getCoursesByCategory(courses: Course[], categorySlug: string): Course[] {
  return courses.filter(course =>
    course.course_categories.some(cat => cat.slug === categorySlug)
  )
}

// Check if course is locked for current user
export function isCourseLocked(course: Course): boolean {
  return !course.access.has_access
}

// Get course price from product data
export function getCoursePrice(course: Course): string | null {
  if (course.acf?.product_data) {
    const { sale_price, regular_price, on_sale } = course.acf.product_data
    return on_sale && sale_price ? sale_price : regular_price
  }
  return null
}

// Get video count for a course
export function getCourseVideoCount(course: Course): number {
  return course.acf?.course_videos?.length || 0
}

// Get total duration for a course by summing video durations
export function getCourseTotalDuration(course: Course): string {
  if (!course.acf?.course_videos || course.acf.course_videos.length === 0) {
    return ''
  }

  let totalMinutes = 0

  // Sum up all video durations (in minutes)
  course.acf.course_videos.forEach(video => {
    if (video.video_duration) {
      // Parse duration string (e.g., "5m", "1h 30m", "45")
      const duration = video.video_duration.toLowerCase()

      // Extract hours if present
      const hoursMatch = duration.match(/(\d+)\s*h/)
      if (hoursMatch) {
        totalMinutes += parseInt(hoursMatch[1]) * 60
      }

      // Extract minutes
      const minutesMatch = duration.match(/(\d+)\s*m/)
      if (minutesMatch) {
        totalMinutes += parseInt(minutesMatch[1])
      } else {
        // If no 'h' or 'm' suffix, assume it's just minutes as a number
        const numericMatch = duration.match(/^(\d+)$/)
        if (numericMatch) {
          totalMinutes += parseInt(numericMatch[1])
        }
      }
    }
  })

  if (totalMinutes === 0) return ''

  // Format output
  if (totalMinutes < 60) {
    return `${totalMinutes}m`
  } else {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }
}

// Get course difficulty label
export function getCourseDifficultyLabel(course: Course): string {
  const difficulty = course.acf?.difficulty || 'beginner'
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
}

// Filter courses by access
export function getAccessibleCourses(courses: Course[]): Course[] {
  return courses.filter(course => course.access.has_access)
}

export function getLockedCourses(courses: Course[]): Course[] {
  return courses.filter(course => !course.access.has_access)
}

// Get unique course categories from a list of courses
export function getUniqueCourseCategories(courses: Course[]) {
  const categoriesMap = new Map()

  courses.forEach(course => {
    course.course_categories.forEach(cat => {
      if (!categoriesMap.has(cat.id)) {
        categoriesMap.set(cat.id, cat)
      }
    })
  })

  return Array.from(categoriesMap.values())
}