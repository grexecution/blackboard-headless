import { getProCoachCourses } from '@/lib/lms/api'
import Link from 'next/link'
import CourseCard from '@/components/lms/course-card'
import {
  Award, Users, BookOpen, Target, Shield, Zap, Trophy, ChevronRight
} from 'lucide-react'

export const revalidate = false
export const dynamic = 'force-static'

export default async function ProCoachPage() {
  // Get ProCoach courses from WooCommerce
  const procoachCourses = await getProCoachCourses()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-black to-gray-900 text-white py-20">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              BlackBoard <span className="text-[#ffed00]">ProCoach</span>
            </h1>

            <p className="text-2xl text-gray-300 mb-8">
              Professional Certification Program
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 mt-8 max-w-3xl mx-auto">
              <Award className="h-16 w-16 text-[#ffed00] mb-4 mx-auto" />
              <p className="text-xl mb-4">
                Become a Certified BlackBoard ProCoach
              </p>
              <p className="text-gray-300">
                Join our comprehensive certification program and master the BlackBoard methodology
                for foot health and movement optimization.
              </p>
            </div>

            {/* Certification Timeline */}
            <div className="mt-16 max-w-6xl mx-auto px-4">
              <h3 className="text-2xl font-bold text-center mb-12 text-[#ffed00]">
                Your Path to Certification
              </h3>

              {/* Desktop Horizontal Timeline */}
              <div className="hidden md:block relative">
                {/* Timeline Line - positioned at the circles */}
                <div className="absolute top-6 left-0 right-0 h-0.5 bg-gradient-to-r from-[#ffed00]/20 via-[#ffed00] to-[#ffed00]/20 z-0"></div>

                {/* Timeline Steps */}
                <div className="grid grid-cols-4 gap-6 relative">
                  {/* Step 1 - Video Course */}
                  <div className="relative">
                    <div className="flex flex-col items-center">
                      <div className="relative z-10 w-12 h-12 bg-[#ffed00] rounded-full border-4 border-black shadow-lg flex items-center justify-center font-bold text-black">
                        1
                      </div>
                      <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-[#ffed00]/20 text-center">
                        <h4 className="text-lg font-bold text-[#ffed00] mb-2">Video Course</h4>
                        <p className="text-gray-300 text-sm mb-3">Start with online video training modules and theory</p>
                        <span className="inline-block text-xs bg-[#ffed00]/20 text-[#ffed00] px-3 py-1 rounded-full">2-3 weeks</span>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 - Foundation */}
                  <div className="relative">
                    <div className="flex flex-col items-center">
                      <div className="relative z-10 w-12 h-12 bg-[#ffed00] rounded-full border-4 border-black shadow-lg flex items-center justify-center font-bold text-black">
                        2
                      </div>
                      <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-[#ffed00]/20 text-center">
                        <h4 className="text-lg font-bold text-[#ffed00] mb-2">Live Workshop</h4>
                        <p className="text-gray-300 text-sm mb-3">Hands-on training with BlackBoard equipment and techniques</p>
                        <span className="inline-block text-xs bg-[#ffed00]/20 text-[#ffed00] px-3 py-1 rounded-full">3-4 days</span>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 - Practice */}
                  <div className="relative">
                    <div className="flex flex-col items-center">
                      <div className="relative z-10 w-12 h-12 bg-[#ffed00] rounded-full border-4 border-black shadow-lg flex items-center justify-center font-bold text-black">
                        3
                      </div>
                      <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-[#ffed00]/20 text-center">
                        <h4 className="text-lg font-bold text-[#ffed00] mb-2">Practice Phase</h4>
                        <p className="text-gray-300 text-sm mb-3">Apply with clients, submit case studies, receive feedback</p>
                        <span className="inline-block text-xs bg-[#ffed00]/20 text-[#ffed00] px-3 py-1 rounded-full">6-8 weeks</span>
                      </div>
                    </div>
                  </div>

                  {/* Step 4 - Certification */}
                  <div className="relative">
                    <div className="flex flex-col items-center">
                      <div className="relative z-10 w-12 h-12 bg-[#ffed00] rounded-full border-4 border-black shadow-lg flex items-center justify-center font-bold text-black">
                        ✓
                      </div>
                      <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-[#ffed00]/20 text-center">
                        <h4 className="text-lg font-bold text-[#ffed00] mb-2">Certification</h4>
                        <p className="text-gray-300 text-sm mb-3">Final assessment and official ProCoach certification</p>
                        <span className="inline-block text-xs bg-[#ffed00]/20 text-[#ffed00] px-3 py-1 rounded-full">1-2 weeks</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Vertical Timeline */}
              <div className="md:hidden relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#ffed00]/20 via-[#ffed00] to-[#ffed00]/20"></div>

                {/* Timeline Steps */}
                <div className="space-y-8">
                  {/* Step 1 - Video Course */}
                  <div className="relative flex items-start">
                    <div className="relative z-10 w-12 h-12 bg-[#ffed00] rounded-full border-4 border-black shadow-lg flex items-center justify-center font-bold text-black flex-shrink-0">
                      1
                    </div>
                    <div className="ml-6 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-[#ffed00]/20 flex-1">
                      <h4 className="text-lg font-bold text-[#ffed00] mb-2">Video Course</h4>
                      <p className="text-gray-300 text-sm mb-3">Start with online video training modules and theory</p>
                      <span className="inline-block text-xs bg-[#ffed00]/20 text-[#ffed00] px-3 py-1 rounded-full">2-3 weeks</span>
                    </div>
                  </div>

                  {/* Step 2 - Live Workshop */}
                  <div className="relative flex items-start">
                    <div className="relative z-10 w-12 h-12 bg-[#ffed00] rounded-full border-4 border-black shadow-lg flex items-center justify-center font-bold text-black flex-shrink-0">
                      2
                    </div>
                    <div className="ml-6 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-[#ffed00]/20 flex-1">
                      <h4 className="text-lg font-bold text-[#ffed00] mb-2">Live Workshop</h4>
                      <p className="text-gray-300 text-sm mb-3">Hands-on training with BlackBoard equipment and techniques</p>
                      <span className="inline-block text-xs bg-[#ffed00]/20 text-[#ffed00] px-3 py-1 rounded-full">3-4 days</span>
                    </div>
                  </div>

                  {/* Step 3 - Practice Phase */}
                  <div className="relative flex items-start">
                    <div className="relative z-10 w-12 h-12 bg-[#ffed00] rounded-full border-4 border-black shadow-lg flex items-center justify-center font-bold text-black flex-shrink-0">
                      3
                    </div>
                    <div className="ml-6 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-[#ffed00]/20 flex-1">
                      <h4 className="text-lg font-bold text-[#ffed00] mb-2">Practice Phase</h4>
                      <p className="text-gray-300 text-sm mb-3">Apply with clients, submit case studies, receive feedback</p>
                      <span className="inline-block text-xs bg-[#ffed00]/20 text-[#ffed00] px-3 py-1 rounded-full">6-8 weeks</span>
                    </div>
                  </div>

                  {/* Step 4 - Certification */}
                  <div className="relative flex items-start">
                    <div className="relative z-10 w-12 h-12 bg-[#ffed00] rounded-full border-4 border-black shadow-lg flex items-center justify-center font-bold text-black flex-shrink-0">
                      ✓
                    </div>
                    <div className="ml-6 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-[#ffed00]/20 flex-1">
                      <h4 className="text-lg font-bold text-[#ffed00] mb-2">Certification</h4>
                      <p className="text-gray-300 text-sm mb-3">Final assessment and official ProCoach certification</p>
                      <span className="inline-block text-xs bg-[#ffed00]/20 text-[#ffed00] px-3 py-1 rounded-full">1-2 weeks</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ProCoach Certification Courses */}
      <section id="courses" className="py-16 scroll-mt-20">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            Certification Programs
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Choose your certification path and start your journey to becoming a BlackBoard ProCoach expert.
          </p>

          {procoachCourses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {procoachCourses.map((course) => (
                <CourseCard key={course.id} course={course} type="procoach" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-600">
                Certification programs coming soon!
              </p>
              <p className="text-gray-500 mt-2">
                Check back for updates or contact us for more information.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Become a <span className="text-[#ffed00]">ProCoach</span>?
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#ffed00] to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Trophy className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">Industry Recognition</h3>
                <p className="text-gray-600 leading-relaxed">
                  Gain globally recognized certification that establishes your expertise in foot health and movement optimization
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#ffed00] to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">Expert Network</h3>
                <p className="text-gray-600 leading-relaxed">
                  Join an exclusive community of 500+ certified professionals and access ongoing mentorship and resources
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#ffed00] to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">Career Growth</h3>
                <p className="text-gray-600 leading-relaxed">
                  Expand your practice with specialized skills that attract premium clients and increase revenue potential
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-black to-gray-900 text-white">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Become a <span className="text-[#ffed00]">ProCoach</span>?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Take the next step in your professional journey with BlackBoard certification.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#courses"
              className="bg-[#ffed00] text-black px-8 py-3 rounded-full font-semibold hover:bg-yellow-400 transition inline-flex items-center gap-2"
            >
              View All Courses
              <ChevronRight className="h-4 w-4" />
            </a>
            <Link
              href="/contact"
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/20 transition"
            >
              Contact Us for Group Training
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}