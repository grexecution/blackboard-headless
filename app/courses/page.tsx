import { getAllCourses, getUniqueCourseCategories } from '@/lib/woocommerce/courses'
import CoursesGrid from '@/components/courses/courses-grid'
import { GraduationCap } from 'lucide-react'

// Static generation
export const revalidate = false
export const dynamic = 'force-static'

export default async function CoursesPage() {
  const courses = await getAllCourses()
  const categories = getUniqueCourseCategories(courses)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-black text-white py-12">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <GraduationCap className="h-10 w-10 text-[#ffed00]" />
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                Professional <span className="text-[#ffed00]">Courses</span>
              </h1>
            </div>
            <p className="text-xl text-gray-300 leading-relaxed">
              Elevate your skills with our comprehensive training courses. From ProCoach certifications to hands-on workshops,
              we provide the education you need to excel in functional training.
            </p>
          </div>
        </div>
      </section>

      {/* Courses Content */}
      <section className="py-12">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          {courses.length > 0 ? (
            <CoursesGrid
              initialCourses={courses}
              allCategories={categories}
            />
          ) : (
            <div className="text-center py-20">
              <GraduationCap className="h-20 w-20 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-700 mb-4">
                No courses available yet
              </h2>
              <p className="text-gray-500 max-w-md mx-auto">
                We&apos;re preparing amazing courses for you. Check back soon or contact us for more information about upcoming courses.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}