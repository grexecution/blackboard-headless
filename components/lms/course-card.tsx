import Image from 'next/image'
import Link from 'next/link'
import { Award, CheckCircle, Clock, Video, Trophy, ChevronRight, ShoppingCart } from 'lucide-react'
import { Course } from '@/lib/lms/api'

interface CourseCardProps {
  course: Course
  type?: 'procoach' | 'workshop' | 'course'
}

export default function CourseCard({ course, type = 'course' }: CourseCardProps) {
  const typeLabel = type === 'procoach' ? 'CERTIFICATION' : type === 'workshop' ? 'WORKSHOP' : 'COURSE'
  const viewLabel = type === 'procoach' ? 'View Course' : type === 'workshop' ? 'View Workshop' : 'View Course'

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group">
      {/* Course Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
        {course.acf?.course_thumbnail ? (
          <Image
            src={course.acf.course_thumbnail.url}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#ffed00]/10 to-yellow-500/10">
            <Award className="h-20 w-20 text-[#ffed00]" />
          </div>
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Type Badge */}
        <div className="absolute top-4 right-4 bg-[#ffed00] text-black px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
          {typeLabel}
        </div>

        {/* Access Status Badge */}
        {course.has_access ? (
          <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            PURCHASED
          </div>
        ) : course.price && course.price !== '0' ? (
          <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
            ${course.price}
          </div>
        ) : (
          <div className="absolute top-4 left-4 bg-gray-900 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
            FREE
          </div>
        )}

        {/* Progress Overlay */}
        {course.has_access && (course.progress || 0) > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="mb-2">
              <div className="flex justify-between items-center text-white text-xs font-semibold mb-1">
                <span>Progress</span>
                <span>{course.progress || 0}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                <div
                  className="h-full bg-gradient-to-r from-[#ffed00] to-yellow-400 transition-all duration-500"
                  style={{ width: `${course.progress || 0}%` }}
                />
              </div>
            </div>
            {course.progress === 100 && (
              <div className="flex items-center gap-1.5 text-[#ffed00] text-xs font-bold">
                <Trophy className="h-4 w-4" />
                COMPLETED
              </div>
            )}
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="p-6">
        {/* Metadata Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs bg-[#ffed00]/10 text-gray-700 px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[#ffed00]" />
            {course.acf?.course_duration || 'Self-paced'}
          </span>
          {course.acf?.difficulty_level && (
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
              course.acf.difficulty_level === 'Beginner' ? 'bg-green-100 text-green-700' :
              course.acf.difficulty_level === 'Advanced' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {course.acf.difficulty_level}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-[#ffed00] transition-colors line-clamp-2">
          {course.title}
        </h3>

        {/* Description */}
        <div
          className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: course.excerpt }}
        />

        {/* Course Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Video className="h-4 w-4 text-[#ffed00]" />
            <span className="font-medium">{course.acf?.total_lessons || 0} Lessons</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Award className="h-4 w-4 text-[#ffed00]" />
            <span className="font-medium">Certificate</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 pt-4">
          {/* CTA Button */}
          {course.has_access ? (
            <Link
              href={`/account/courses/${course.slug}`}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#ffed00] to-yellow-400 text-black py-3.5 rounded-xl font-bold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              {viewLabel}
              <ChevronRight className="h-5 w-5" />
            </Link>
          ) : (
            <>
              {/* Price Display */}
              {course.price && course.price !== '0' && (
                <div className="text-center mb-3">
                  <span className="text-3xl font-bold text-gray-900">${course.price}</span>
                </div>
              )}

              {/* Buy Now Button */}
              <Link
                href={course.product_slug ? `/product/${course.product_slug}` : '/shop'}
                className="flex items-center justify-center gap-2 w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-gray-900 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 group/btn"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Buy Now</span>
                <ChevronRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}