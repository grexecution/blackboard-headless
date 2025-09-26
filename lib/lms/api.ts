// LMS API functions for fetching courses and managing progress
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const WP_API_URL = process.env.WORDPRESS_API_URL || ''
const WOO_API_URL = process.env.NEXT_PUBLIC_WOO_API_URL || ''

export interface Course {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  acf: {
    course_duration: string
    difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced'
    course_category: string
    course_thumbnail: any
    course_trailer_vimeo?: string
    total_lessons: number
    required_products: number[]
    course_order: number
    is_featured: boolean
    course_materials?: Array<{
      material_title: string
      material_file: any
      material_description: string
    }>
  }
  lessons: Lesson[]
  has_access?: boolean
  progress?: number
}

export interface Lesson {
  id: number
  title: string
  slug: string
  content?: string
  acf: {
    parent_course: number
    lesson_number: number
    vimeo_video_id: string
    video_duration: string
    lesson_type: 'Video' | 'Text' | 'Mixed' | 'Exercise'
    lesson_materials?: Array<{
      material_title: string
      material_file: any
    }>
    written_content?: string
    exercise_instructions?: Array<{
      exercise_title: string
      exercise_description: string
      exercise_duration: string
      exercise_image: any
    }>
    estimated_completion: number
    is_preview: boolean
  }
  completed?: boolean
  completion_date?: string
}

export interface UserProgress {
  course_id: number
  percentage_complete: number
  last_accessed: string
  completed_lessons: number[]
}

// Demo lessons for development/testing
const DEMO_LESSONS: Lesson[] = [
  {
    id: 1,
    title: 'Introduction to BlackBoard Training',
    slug: 'intro-blackboard',
    content: '<p>Welcome to the BlackBoard training method. In this lesson, we\'ll cover the fundamental principles...</p>',
    acf: {
      parent_course: 1,
      lesson_number: 1,
      vimeo_video_id: '824804225', // Sample Vimeo ID
      video_duration: '12:45',
      lesson_type: 'Video',
      written_content: '<h3>Welcome to BlackBoard Training</h3><p>The BlackBoard method is a revolutionary approach to foot training that combines biomechanics, neuroscience, and practical exercises. This lesson introduces the core concepts you\'ll be working with throughout the course.</p><h4>Key Concepts:</h4><ul><li>Foot architecture and its role in movement</li><li>The kinetic chain from foot to hip</li><li>Neurological aspects of foot function</li><li>Introduction to the BlackBoard tool</li></ul>',
      estimated_completion: 15,
      is_preview: true
    },
    completed: true,
    completion_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    title: 'Foot Anatomy & Biomechanics',
    slug: 'foot-anatomy',
    acf: {
      parent_course: 1,
      lesson_number: 2,
      vimeo_video_id: '824804225',
      video_duration: '18:30',
      lesson_type: 'Mixed',
      written_content: '<h3>Understanding Your Feet</h3><p>Your feet contain 26 bones, 33 joints, and over 100 muscles, tendons, and ligaments. Understanding this complex structure is essential for effective training.</p>',
      exercise_instructions: [
        {
          exercise_title: 'Foot Mapping Exercise',
          exercise_description: 'Use your hands to explore and identify the major structures of your foot',
          exercise_duration: '5 minutes',
          exercise_image: { url: 'https://images.unsplash.com/photo-1609899464726-209befaac5bc?w=400' }
        }
      ],
      estimated_completion: 25,
      is_preview: false
    },
    completed: true,
    completion_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    title: 'Setting Up Your BlackBoard',
    slug: 'blackboard-setup',
    acf: {
      parent_course: 1,
      lesson_number: 3,
      vimeo_video_id: '824804225',
      video_duration: '8:15',
      lesson_type: 'Video',
      lesson_materials: [
        {
          material_title: 'Setup Guide PDF',
          material_file: { url: '#' }
        }
      ],
      estimated_completion: 10,
      is_preview: false
    },
    completed: true,
    completion_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 4,
    title: 'Basic Balance Exercises',
    slug: 'basic-balance',
    acf: {
      parent_course: 1,
      lesson_number: 4,
      vimeo_video_id: '824804225',
      video_duration: '15:00',
      lesson_type: 'Exercise',
      exercise_instructions: [
        {
          exercise_title: 'Single Leg Stand',
          exercise_description: 'Stand on one foot for 30 seconds, maintaining balance',
          exercise_duration: '2 minutes per leg',
          exercise_image: { url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400' }
        },
        {
          exercise_title: 'Heel-to-Toe Walk',
          exercise_description: 'Walk in a straight line placing heel directly in front of toe',
          exercise_duration: '3 minutes',
          exercise_image: { url: 'https://images.unsplash.com/photo-1571019613576-2b22c76fd955?w=400' }
        }
      ],
      estimated_completion: 20,
      is_preview: false
    },
    completed: false
  },
  {
    id: 5,
    title: 'Strength Building Fundamentals',
    slug: 'strength-fundamentals',
    acf: {
      parent_course: 1,
      lesson_number: 5,
      vimeo_video_id: '824804225',
      video_duration: '22:00',
      lesson_type: 'Video',
      written_content: '<h3>Building Foot Strength</h3><p>Strong feet are the foundation of athletic performance. This lesson covers essential strengthening exercises.</p>',
      estimated_completion: 25,
      is_preview: false
    },
    completed: false
  }
]

// Demo courses data for development/testing
const DEMO_COURSES: Course[] = [
  {
    id: 1,
    title: 'BlackBoard Fundamentals',
    slug: 'blackboard-fundamentals',
    excerpt: 'Master the essential foot training techniques that form the foundation of the BlackBoard method. Perfect for beginners.',
    content: '<p>This comprehensive course introduces you to the BlackBoard training methodology, covering everything from basic anatomy to advanced movement patterns. You\'ll learn how to properly use the BlackBoard tool, understand foot biomechanics, and develop a training routine that enhances your athletic performance.</p><h3>What You\'ll Learn:</h3><ul><li>Foot anatomy and biomechanics</li><li>Proper BlackBoard setup and usage</li><li>Progressive training exercises</li><li>Injury prevention techniques</li><li>Performance optimization strategies</li></ul>',
    acf: {
      course_duration: '4 weeks',
      difficulty_level: 'Beginner',
      course_category: 'Foundation Training',
      course_thumbnail: { url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800' },
      course_trailer_vimeo: '824804225',
      total_lessons: 12,
      required_products: [101, 102],
      course_order: 1,
      is_featured: true,
      course_materials: [
        {
          material_title: 'Course Workbook',
          material_file: { url: '#' },
          material_description: 'Complete course workbook with exercises and notes'
        },
        {
          material_title: 'Quick Reference Guide',
          material_file: { url: '#' },
          material_description: 'Printable quick reference for all exercises'
        }
      ]
    },
    lessons: DEMO_LESSONS.filter(l => l.acf.parent_course === 1),
    has_access: true,
    progress: 65
  },
  {
    id: 2,
    title: 'Advanced Foot Mechanics',
    slug: 'advanced-foot-mechanics',
    excerpt: 'Deep dive into biomechanics and advanced training protocols for serious athletes and trainers.',
    content: '<p>Take your understanding of foot mechanics to the next level...</p>',
    acf: {
      course_duration: '6 weeks',
      difficulty_level: 'Advanced',
      course_category: 'Performance Training',
      course_thumbnail: { url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800' },
      total_lessons: 18,
      required_products: [103],
      course_order: 2,
      is_featured: true,
      course_materials: []
    },
    lessons: [],
    has_access: true,
    progress: 30
  },
  {
    id: 3,
    title: 'ProCoach Certification Prep',
    slug: 'procoach-certification-prep',
    excerpt: 'Prepare for your ProCoach certification with comprehensive training modules and practice exams.',
    content: '<p>Everything you need to become a certified BlackBoard ProCoach...</p>',
    acf: {
      course_duration: '8 weeks',
      difficulty_level: 'Intermediate',
      course_category: 'Certification',
      course_thumbnail: { url: 'https://images.unsplash.com/photo-1540324155974-7523202daa3f?w=800' },
      total_lessons: 24,
      required_products: [104, 105],
      course_order: 3,
      is_featured: true,
      course_materials: [
        {
          material_title: 'Study Guide',
          material_file: { url: '#' },
          material_description: 'Complete certification study guide PDF'
        }
      ]
    },
    lessons: [],
    has_access: true,
    progress: 100
  },
  {
    id: 4,
    title: 'Injury Prevention & Recovery',
    slug: 'injury-prevention-recovery',
    excerpt: 'Learn evidence-based techniques for preventing common foot injuries and accelerating recovery.',
    content: '<p>Protect yourself and your clients from common foot-related injuries...</p>',
    acf: {
      course_duration: '3 weeks',
      difficulty_level: 'Intermediate',
      course_category: 'Rehabilitation',
      course_thumbnail: { url: 'https://images.unsplash.com/photo-1609899517237-77d357b047cf?w=800' },
      total_lessons: 9,
      required_products: [106],
      course_order: 4,
      is_featured: false,
      course_materials: []
    },
    lessons: [],
    has_access: true,
    progress: 0
  },
  {
    id: 5,
    title: 'Sprint Performance Mastery',
    slug: 'sprint-performance-mastery',
    excerpt: 'Unlock explosive speed through targeted foot training and biomechanical optimization.',
    content: '<p>Transform your sprinting performance with specialized foot training...</p>',
    acf: {
      course_duration: '5 weeks',
      difficulty_level: 'Advanced',
      course_category: 'Performance Training',
      course_thumbnail: { url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800' },
      total_lessons: 15,
      required_products: [107],
      course_order: 5,
      is_featured: false,
      course_materials: []
    },
    lessons: [],
    has_access: false,
    progress: 0
  },
  {
    id: 6,
    title: 'Youth Training Programs',
    slug: 'youth-training-programs',
    excerpt: 'Specialized training protocols designed for young athletes developing fundamental movement skills.',
    content: '<p>Age-appropriate foot training for youth athletes...</p>',
    acf: {
      course_duration: '4 weeks',
      difficulty_level: 'Beginner',
      course_category: 'Youth Development',
      course_thumbnail: { url: 'https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=800' },
      total_lessons: 10,
      required_products: [108],
      course_order: 6,
      is_featured: false,
      course_materials: []
    },
    lessons: [],
    has_access: false,
    progress: 0
  }
]

// Fetch all courses (public endpoint)
export async function getAllCourses(): Promise<Course[]> {
  try {
    // Return demo data if API URL is not configured or in development
    if (!WP_API_URL || process.env.NODE_ENV === 'development') {
      return DEMO_COURSES
    }

    const response = await fetch(`${WP_API_URL}/wp-json/wp/v2/bb_course?_embed&per_page=100`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      // Return demo data as fallback
      return DEMO_COURSES
    }

    const courses = await response.json()
    return courses.map(formatCourse)
  } catch (error) {
    console.error('Error fetching courses, using demo data:', error)
    return DEMO_COURSES
  }
}

// Fetch user's available courses (requires auth)
export async function getUserCourses(authToken: string): Promise<Course[]> {
  try {
    const response = await fetch(`${WP_API_URL}/wp-json/bb-lms/v1/my-courses`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user courses')
    }

    const data = await response.json()
    return data.courses || []
  } catch (error) {
    console.error('Error fetching user courses:', error)
    return []
  }
}

// Fetch single course by slug (for URL routing)
export async function getCourseBySlug(slug: string, authToken?: string): Promise<Course | null> {
  try {
    // Return demo data if API is not configured
    if (!WP_API_URL || process.env.NODE_ENV === 'development') {
      const course = DEMO_COURSES.find(c => c.slug === slug)
      if (course) {
        // Add full lessons for the first course (demo)
        if (course.id === 1) {
          course.lessons = DEMO_LESSONS.filter(l => l.acf.parent_course === 1)
        }
        return course
      }
      return null
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }

    const response = await fetch(`${WP_API_URL}/wp-json/bb-lms/v1/course-by-slug/${slug}`, {
      headers,
      cache: 'no-store'
    })

    if (!response.ok) {
      // Try demo data as fallback
      const course = DEMO_COURSES.find(c => c.slug === slug)
      return course || null
    }

    const course = await response.json()
    return formatCourse(course)
  } catch (error) {
    console.error('Error fetching course by slug:', error)
    const course = DEMO_COURSES.find(c => c.slug === slug)
    return course || null
  }
}

// Fetch single course with lessons
export async function getCourse(courseId: number, authToken?: string): Promise<Course | null> {
  try {
    // Return demo data if API is not configured
    if (!WP_API_URL || process.env.NODE_ENV === 'development') {
      const course = DEMO_COURSES.find(c => c.id === courseId)
      if (course) {
        // Add full lessons for the first course (demo)
        if (course.id === 1) {
          course.lessons = DEMO_LESSONS.filter(l => l.acf.parent_course === 1)
        }
        return course
      }
      return null
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }

    const response = await fetch(`${WP_API_URL}/wp-json/bb-lms/v1/course/${courseId}`, {
      headers,
      cache: 'no-store'
    })

    if (!response.ok) {
      // Try demo data as fallback
      const course = DEMO_COURSES.find(c => c.id === courseId)
      return course || null
    }

    const course = await response.json()
    return formatCourse(course)
  } catch (error) {
    console.error('Error fetching course:', error)
    const course = DEMO_COURSES.find(c => c.id === courseId)
    return course || null
  }
}

// Check if user has access to a course
export async function checkCourseAccess(courseId: number, authToken: string): Promise<boolean> {
  try {
    // Return demo access data if API is not configured
    if (!WP_API_URL || process.env.NODE_ENV === 'development') {
      // Courses 1-4 have access, 5-6 are locked
      return courseId <= 4
    }

    const response = await fetch(`${WP_API_URL}/wp-json/bb-lms/v1/check-access`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ course_id: courseId }),
      cache: 'no-store'
    })

    if (!response.ok) {
      // Return demo data as fallback
      return courseId <= 4
    }

    const data = await response.json()
    return data.has_access || false
  } catch (error) {
    console.error('Error checking course access, using demo data:', error)
    return courseId <= 4
  }
}

// Mark lesson as complete
export async function markLessonComplete(lessonId: number, authToken: string): Promise<boolean> {
  try {
    const response = await fetch(`${WP_API_URL}/wp-json/bb-lms/v1/complete-lesson`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lesson_id: lessonId }),
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error('Failed to mark lesson as complete')
    }

    return true
  } catch (error) {
    console.error('Error marking lesson complete:', error)
    return false
  }
}

// Get user's progress across all courses
export async function getUserProgress(authToken: string): Promise<UserProgress[]> {
  try {
    // Return demo progress data if API is not configured
    if (!WP_API_URL || process.env.NODE_ENV === 'development') {
      return [
        { course_id: 1, percentage_complete: 65, last_accessed: new Date().toISOString(), completed_lessons: [1, 2, 3, 4, 5, 6, 7, 8] },
        { course_id: 2, percentage_complete: 30, last_accessed: new Date().toISOString(), completed_lessons: [1, 2, 3, 4, 5] },
        { course_id: 3, percentage_complete: 100, last_accessed: new Date().toISOString(), completed_lessons: Array.from({length: 24}, (_, i) => i + 1) },
        { course_id: 4, percentage_complete: 0, last_accessed: new Date().toISOString(), completed_lessons: [] }
      ]
    }

    const response = await fetch(`${WP_API_URL}/wp-json/bb-lms/v1/progress`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      // Return demo data as fallback
      return [
        { course_id: 1, percentage_complete: 65, last_accessed: new Date().toISOString(), completed_lessons: [1, 2, 3, 4, 5, 6, 7, 8] },
        { course_id: 2, percentage_complete: 30, last_accessed: new Date().toISOString(), completed_lessons: [1, 2, 3, 4, 5] },
        { course_id: 3, percentage_complete: 100, last_accessed: new Date().toISOString(), completed_lessons: Array.from({length: 24}, (_, i) => i + 1) },
        { course_id: 4, percentage_complete: 0, last_accessed: new Date().toISOString(), completed_lessons: [] }
      ]
    }

    const data = await response.json()
    return data.progress || []
  } catch (error) {
    console.error('Error fetching user progress, using demo data:', error)
    return [
      { course_id: 1, percentage_complete: 65, last_accessed: new Date().toISOString(), completed_lessons: [1, 2, 3, 4, 5, 6, 7, 8] },
      { course_id: 2, percentage_complete: 30, last_accessed: new Date().toISOString(), completed_lessons: [1, 2, 3, 4, 5] },
      { course_id: 3, percentage_complete: 100, last_accessed: new Date().toISOString(), completed_lessons: Array.from({length: 24}, (_, i) => i + 1) },
      { course_id: 4, percentage_complete: 0, last_accessed: new Date().toISOString(), completed_lessons: [] }
    ]
  }
}

// Helper function to format course data
function formatCourse(course: any): Course {
  return {
    id: course.id,
    title: course.title?.rendered || course.title || '',
    slug: course.slug,
    excerpt: course.excerpt?.rendered || '',
    content: course.content?.rendered || '',
    acf: course.acf || {},
    lessons: course.lessons || [],
    has_access: course.has_access,
    progress: course.progress
  }
}

// Get Vimeo embed URL with privacy settings
export function getVimeoEmbedUrl(vimeoId: string, autoplay: boolean = false): string {
  if (!vimeoId) return ''

  const params = new URLSearchParams({
    title: '0',
    byline: '0',
    portrait: '0',
    transparent: '0',
    autoplay: autoplay ? '1' : '0',
    dnt: '1', // Do not track
  })

  return `https://player.vimeo.com/video/${vimeoId}?${params.toString()}`
}

// Calculate course progress percentage
export function calculateCourseProgress(completedLessons: number[], totalLessons: number): number {
  if (totalLessons === 0) return 0
  return Math.round((completedLessons.length / totalLessons) * 100)
}

// Format duration for display
export function formatDuration(duration: string): string {
  if (!duration) return ''

  // If duration is already formatted (e.g., "15:30"), return as is
  if (duration.includes(':')) return duration

  // If duration is in minutes, format it
  const minutes = parseInt(duration)
  if (isNaN(minutes)) return duration

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}