import { getWorkshopCourses, getProCoachCourses } from '@/lib/lms/api'
import CourseCard from '@/components/lms/course-card'
import Link from 'next/link'
import {
  Award, Users, Clock, Calendar, Video, BookOpen,
  ChevronRight, ArrowRight, Sparkles, Target, Zap
} from 'lucide-react'

export const revalidate = false
export const dynamic = 'force-static'

export default async function AllCoursesPage() {
  // Fetch both workshop and ProCoach courses
  const workshops = await getWorkshopCourses()
  const procoachCourses = await getProCoachCourses()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-black to-gray-900 text-white py-16 md:py-20">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              BlackBoard <span className="text-[#ffed00]">Education Center</span>
            </h1>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Master foot health with our comprehensive training programs. Choose between
              intensive workshops for quick skills or complete certification courses for professional expertise.
            </p>

            {/* Course Type Selector - Anchor Navigation */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <a
                href="#workshops"
                className="group relative overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300"
              >
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-[#ffed00] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Calendar className="h-7 w-7 text-black" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Workshops</h3>
                  <p className="text-sm text-gray-300 mb-4">
                    Intensive 2-4 day hands-on training sessions
                  </p>
                  <div className="flex items-center justify-center gap-2 text-[#ffed00]">
                    <span className="font-semibold">View Workshops</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </a>

              <a
                href="#procoach"
                className="group relative overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300"
              >
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-[#ffed00] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Award className="h-7 w-7 text-black" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">ProCoach Certification</h3>
                  <p className="text-sm text-gray-300 mb-4">
                    Complete certification program with ongoing support
                  </p>
                  <div className="flex items-center justify-center gap-2 text-[#ffed00]">
                    <span className="font-semibold">View Certifications</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </a>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-[#ffed00]">
                  {workshops.length + procoachCourses.length}+
                </div>
                <div className="text-xs text-gray-300">Total Courses</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-[#ffed00]">500+</div>
                <div className="text-xs text-gray-300">Active Students</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-[#ffed00]">20+</div>
                <div className="text-xs text-gray-300">Expert Instructors</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-[#ffed00]">98%</div>
                <div className="text-xs text-gray-300">Success Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#ffed00]/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#ffed00]/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Workshops Section */}
      <section id="workshops" className="py-16 scroll-mt-20">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          {/* Section Header */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#ffed00]/10 text-[#ffed00] px-4 py-2 rounded-full mb-4">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">INTENSIVE TRAINING</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              BlackBoard <span className="text-[#ffed00]">Workshops</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Join our hands-on workshops and master specific foot training techniques in just a few days.
              Perfect for professionals looking to expand their skillset quickly.
            </p>
          </div>

          {/* Workshop Features */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#ffed00]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-6 w-6 text-[#ffed00]" />
              </div>
              <h3 className="font-semibold mb-1">2-4 Day Format</h3>
              <p className="text-sm text-gray-600">Intensive weekend or weekday sessions</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#ffed00]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-[#ffed00]" />
              </div>
              <h3 className="font-semibold mb-1">Small Groups</h3>
              <p className="text-sm text-gray-600">Maximum 20 participants for personal attention</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#ffed00]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6 text-[#ffed00]" />
              </div>
              <h3 className="font-semibold mb-1">Practical Focus</h3>
              <p className="text-sm text-gray-600">80% hands-on practice with real equipment</p>
            </div>
          </div>

          {/* Workshops Grid */}
          {workshops.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {workshops.map((workshop) => (
                <CourseCard key={workshop.id} course={workshop} type="workshop" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-600 mb-2">No workshops scheduled</p>
              <p className="text-gray-500">Check back soon for upcoming workshop dates!</p>
            </div>
          )}

          {/* View All Workshops Button */}
          <div className="text-center mt-12">
            <Link
              href="/workshops"
              className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-900 transition-colors"
            >
              View All Workshops
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Divider with Benefits */}
      <section className="py-12 bg-gradient-to-r from-gray-50 via-white to-gray-50">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">Why Choose BlackBoard Training?</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#ffed00] to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-black" />
                </div>
                <h4 className="font-semibold mb-2">Evidence-Based Methods</h4>
                <p className="text-sm text-gray-600">Scientifically proven techniques backed by research</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#ffed00] to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-black" />
                </div>
                <h4 className="font-semibold mb-2">Expert Instructors</h4>
                <p className="text-sm text-gray-600">Learn from industry-leading professionals</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#ffed00] to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-black" />
                </div>
                <h4 className="font-semibold mb-2">Recognized Certification</h4>
                <p className="text-sm text-gray-600">Globally accepted credentials for your career</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ProCoach Section */}
      <section id="procoach" className="py-16 bg-gray-50 scroll-mt-20">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          {/* Section Header */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#ffed00]/10 text-[#ffed00] px-4 py-2 rounded-full mb-4">
              <Award className="h-4 w-4" />
              <span className="text-sm font-semibold">PROFESSIONAL CERTIFICATION</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ProCoach <span className="text-[#ffed00]">Certification Program</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Become a certified BlackBoard ProCoach with our comprehensive training program.
              Perfect for professionals seeking complete mastery and official certification.
            </p>
          </div>

          {/* ProCoach Features */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#ffed00]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-[#ffed00]" />
              </div>
              <h3 className="font-semibold mb-1">12-16 Week Program</h3>
              <p className="text-sm text-gray-600">Comprehensive online and in-person training</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#ffed00]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Video className="h-6 w-6 text-[#ffed00]" />
              </div>
              <h3 className="font-semibold mb-1">Hybrid Learning</h3>
              <p className="text-sm text-gray-600">Video courses + live workshops + mentorship</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#ffed00]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="h-6 w-6 text-[#ffed00]" />
              </div>
              <h3 className="font-semibold mb-1">Official Certificate</h3>
              <p className="text-sm text-gray-600">Industry-recognized ProCoach certification</p>
            </div>
          </div>

          {/* ProCoach Courses Grid */}
          {procoachCourses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {procoachCourses.map((course) => (
                <CourseCard key={course.id} course={course} type="procoach" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl">
              <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-600 mb-2">Certification programs coming soon!</p>
              <p className="text-gray-500">Join the waitlist to be notified when enrollment opens.</p>
            </div>
          )}

          {/* View ProCoach Details Button */}
          <div className="text-center mt-12">
            <Link
              href="/procoach"
              className="inline-flex items-center gap-2 bg-[#ffed00] text-black px-8 py-3 rounded-full font-semibold hover:bg-yellow-500 transition-colors"
            >
              Learn About ProCoach Certification
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-black to-gray-900 text-white">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Your <span className="text-[#ffed00]">Training Journey</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Whether you&apos;re looking for a quick skill upgrade or complete certification,
              we have the perfect program for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-[#ffed00] text-black px-8 py-4 rounded-full font-bold hover:bg-yellow-500 transition-all duration-300"
              >
                Get Started Today
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 px-8 py-4 rounded-full font-bold hover:bg-white/20 transition-all duration-300"
              >
                Learn More
                <BookOpen className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}