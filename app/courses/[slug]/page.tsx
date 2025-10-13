import { getCourseBySlug, getAllCourses, isCourseLocked } from '@/lib/woocommerce/courses'
import { notFound } from 'next/navigation'
import { ArrowLeft, Clock, PlayCircle, Award, Users, BookOpen, Download } from 'lucide-react'
import Link from 'next/link'
import CoursePlayer from '@/components/courses/course-player'
import Image from 'next/image'

// Static generation
export const revalidate = false
export const dynamic = 'force-static'

export async function generateStaticParams() {
  const courses = await getAllCourses()
  return courses.map((course) => ({
    slug: course.slug,
  }))
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const course = await getCourseBySlug(slug)

  if (!course) {
    notFound()
  }

  const isLocked = isCourseLocked(course)
  const videoCount = course.acf?.course_videos?.length || 0
  const materialCount = course.acf?.course_materials?.length || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-black text-white py-8">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Courses</span>
            </Link>

            {/* Categories */}
            {course.course_categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {course.course_categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-semibold"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {course.title}
            </h1>

            {/* Description */}
            {course.excerpt && (
              <div
                className="text-lg text-gray-300 max-w-4xl"
                dangerouslySetInnerHTML={{ __html: course.excerpt }}
              />
            )}

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-6 mt-6">
              {course.acf?.duration && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#ffed00]" />
                  <span className="text-gray-300">Duration:</span>
                  <span className="font-semibold">{course.acf.duration}</span>
                </div>
              )}
              {videoCount > 0 && (
                <div className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-[#ffed00]" />
                  <span className="text-gray-300">Videos:</span>
                  <span className="font-semibold">{videoCount} lessons</span>
                </div>
              )}
              {course.acf?.instructor && (
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#ffed00]" />
                  <span className="text-gray-300">Instructor:</span>
                  <span className="font-semibold">{course.acf.instructor}</span>
                </div>
              )}
              {course.acf?.certificate_awarded && (
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#ffed00]" />
                  <span className="font-semibold">Certificate Included</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-12">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Course Player or Preview */}
              <CoursePlayer course={course} />

              {/* Course Description */}
              {course.content && (
                <div className="bg-white rounded-xl p-6 mt-6">
                  <h2 className="text-2xl font-bold mb-4">Course Overview</h2>
                  <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: course.content }}
                  />
                </div>
              )}

              {/* Course Videos List (if accessible) */}
              {course.access.has_access && course.acf?.course_videos && course.acf.course_videos.length > 0 && (
                <div className="bg-white rounded-xl p-6 mt-6">
                  <h2 className="text-2xl font-bold mb-4">Course Lessons</h2>
                  <div className="space-y-3">
                    {course.acf.course_videos.map((video, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-[#ffed00] rounded-full flex items-center justify-center">
                          <span className="font-bold text-black">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{video.video_title}</h3>
                          {video.video_description && (
                            <p className="text-sm text-gray-600 mt-1">{video.video_description}</p>
                          )}
                        </div>
                        {video.video_duration && (
                          <span className="text-sm text-gray-500">{video.video_duration}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Course Info Card */}
              <div className="bg-white rounded-xl p-6 sticky top-6">
                {/* Featured Image */}
                {course.featured_image && (
                  <div className="relative aspect-video mb-6 rounded-lg overflow-hidden">
                    <Image
                      src={course.featured_image.url}
                      alt={course.featured_image.alt || course.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Price / Access */}
                {course.acf?.product_data && isLocked ? (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-600">Price:</span>
                      <div className="text-right">
                        {course.acf.product_data.on_sale && course.acf.product_data.regular_price && (
                          <div className="text-sm text-gray-400 line-through">
                            R{course.acf.product_data.regular_price}
                          </div>
                        )}
                        <div className="text-2xl font-bold text-[#ffed00]">
                          R{course.acf.product_data.price}
                        </div>
                      </div>
                    </div>

                    {!course.access.has_access && (
                      <Link
                        href={`/shop/product/${course.acf.product_data.id}`}
                        className="block w-full bg-[#ffed00] text-black text-center py-3 rounded-lg font-semibold hover:bg-[#ffed00]/90 transition-colors"
                      >
                        Purchase Course
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800 font-semibold text-center">
                        {course.access.has_access ? '✓ You have access to this course' : 'Free Course'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Course Details */}
                <div className="space-y-4 border-t pt-6">
                  <h3 className="font-bold text-lg mb-4">Course Details</h3>

                  {course.acf?.difficulty && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Difficulty:</span>
                      <span className="capitalize font-medium">{course.acf.difficulty}</span>
                    </div>
                  )}

                  {course.acf?.start_date && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Next Start:</span>
                      <span className="font-medium">
                        {new Date(course.acf.start_date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}

                  {materialCount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Materials:</span>
                      <span className="font-medium">{materialCount} downloads</span>
                    </div>
                  )}

                  {course.acf?.certificate_awarded && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Certificate:</span>
                      <span className="font-medium text-green-600">✓ Included</span>
                    </div>
                  )}
                </div>

                {/* Course Materials (if accessible) */}
                {course.access.has_access && course.acf?.course_materials && course.acf.course_materials.length > 0 && (
                  <div className="border-t pt-6 mt-6">
                    <h3 className="font-bold text-lg mb-4">Course Materials</h3>
                    <div className="space-y-2">
                      {course.acf.course_materials.map((material, index) => (
                        <a
                          key={index}
                          href={material.material_file.url}
                          download
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Download className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium flex-1">{material.material_title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}