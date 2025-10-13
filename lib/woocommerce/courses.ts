import { parseJsonResponse } from './utils'

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
  }
  access: {
    has_access: boolean
    reason: string
    product_id?: number
  }
}

// Fetch all courses
export async function getAllCourses(): Promise<Course[]> {
  const apiUrl = process.env.WORDPRESS_API_URL || 'http://blackboard-local.local'

  try {
    const response = await fetch(`${apiUrl}/wp-json/blackboard/v1/courses`, {
      next: { revalidate: false },
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('Failed to fetch courses:', response.status)
      return []
    }

    const text = await response.text()
    const courses = parseJsonResponse<Course[]>(text)

    return courses || []
  } catch (error) {
    console.error('Error fetching courses:', error)
    return []
  }
}

// Fetch single course by slug
export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const apiUrl = process.env.WORDPRESS_API_URL || 'http://blackboard-local.local'

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

// Get total duration for a course (if we have individual video durations)
export function getCourseTotalDuration(course: Course): string {
  if (!course.acf?.course_videos) {
    return course.acf?.duration || ''
  }

  // If we have individual video durations, we could calculate total
  // For now, just return the duration field
  return course.acf?.duration || ''
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