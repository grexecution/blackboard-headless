'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  PlayCircle, Clock, BookOpen, Lock, CheckCircle,
  TrendingUp, Award, ChevronRight, Loader2,
  Video, FileText, Users, Star
} from 'lucide-react'
import { getAllCourses, getUserProgress, checkCourseAccess, type Course, type UserProgress } from '@/lib/lms/api'

export default function CoursesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all')

  useEffect(() => {
    // Comment out redirect for demo purposes - normally you'd want this
    // if (status === 'unauthenticated') {
    //   router.push('/login?redirect=/account/courses')
    // }
  }, [status, router])

  useEffect(() => {
    fetchCoursesAndProgress()
  }, [session, status])

  const fetchCoursesAndProgress = async () => {
    try {
      setLoading(true)

      // Fetch all courses (will return demo data in development)
      const allCourses = await getAllCourses()

      // Fetch user progress if authenticated
      if (session?.user?.token) {
        const progress = await getUserProgress(session.user.token)
        setUserProgress(progress)

        // Check access for each course
        const coursesWithAccess = await Promise.all(
          allCourses.map(async (course) => {
            const hasAccess = await checkCourseAccess(course.id, session.user.token!)
            const courseProgress = progress.find(p => p.course_id === course.id)
            return {
              ...course,
              has_access: hasAccess,
              progress: courseProgress?.percentage_complete || 0
            }
          })
        )
        setCourses(coursesWithAccess)
      } else {
        // For demo/development, show courses with demo data
        const coursesWithDemoAccess = allCourses.map(course => ({
          ...course,
          has_access: course.has_access ?? false,
          progress: course.progress ?? 0
        }))
        setCourses(coursesWithDemoAccess)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = courses.filter(course => {
    if (filter === 'all') return true
    if (filter === 'in-progress') return course.progress > 0 && course.progress < 100
    if (filter === 'completed') return course.progress === 100
    return true
  })

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#ffed00]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-black to-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              My <span className="text-[#ffed00]">Training Center</span>
            </h1>
            <p className="text-xl text-gray-300">
              Access your courses, track progress, and master foot training
            </p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#ffed00]">{courses.filter(c => c.has_access).length}</div>
              <div className="text-sm text-gray-600">Available Courses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">
                {courses.filter(c => c.progress === 100).length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">
                {courses.filter(c => c.progress > 0 && c.progress < 100).length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {courses.reduce((acc, c) => acc + (c.acf?.total_lessons || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Lessons</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              filter === 'all'
                ? 'bg-[#ffed00] text-black'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Courses
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              filter === 'in-progress'
                ? 'bg-[#ffed00] text-black'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              filter === 'completed'
                ? 'bg-[#ffed00] text-black'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all group"
            >
              {/* Course Thumbnail */}
              <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
                {course.acf?.course_thumbnail ? (
                  <Image
                    src={course.acf.course_thumbnail.url}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-gray-400" />
                  </div>
                )}

                {/* Access Badge */}
                {!course.has_access && (
                  <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1 rounded-full flex items-center gap-1">
                    <Lock className="h-4 w-4" />
                    <span className="text-sm">Locked</span>
                  </div>
                )}

                {/* Progress Badge */}
                {course.progress > 0 && (
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-sm font-semibold">
                      {course.progress === 100 ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          Completed
                        </span>
                      ) : (
                        <span className="text-blue-600">{course.progress}% Complete</span>
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Course Content */}
              <div className="p-6">
                {/* Category & Difficulty */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {course.acf?.course_category || 'Training'}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(course.acf?.difficulty_level || 'Beginner')}`}>
                    {course.acf?.difficulty_level || 'Beginner'}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-2 group-hover:text-[#ffed00] transition-colors">
                  {course.title}
                </h3>

                {/* Description */}
                <div
                  className="text-gray-600 text-sm mb-4 line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: course.excerpt }}
                />

                {/* Course Meta */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Video className="h-4 w-4" />
                    {course.acf?.total_lessons || 0} Lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {course.acf?.course_duration || 'Self-paced'}
                  </span>
                </div>

                {/* Progress Bar */}
                {course.has_access && course.progress > 0 && (
                  <div className="mb-4">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#ffed00] to-yellow-500 transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                {course.has_access ? (
                  <Link
                    href={`/account/courses/${course.slug}`}
                    className="flex items-center justify-center gap-2 w-full bg-[#ffed00] text-black py-3 rounded-xl font-semibold hover:bg-yellow-500 transition-colors"
                  >
                    View Course
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-400 py-3 rounded-xl font-semibold cursor-not-allowed"
                  >
                    <Lock className="h-4 w-4" />
                    Purchase Required
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? "You don't have access to any courses yet."
                : `You don't have any ${filter.replace('-', ' ')} courses.`}
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-[#ffed00] text-black px-6 py-3 rounded-full font-semibold hover:bg-yellow-500 transition-colors"
            >
              Browse Products
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}