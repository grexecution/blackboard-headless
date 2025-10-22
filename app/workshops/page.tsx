import { getAllCourses, getCoursesByCategory } from '@/lib/woocommerce/courses'
import Link from 'next/link'
import CoursesListHorizontal from '@/components/courses/courses-list-horizontal'
import {
  Users, Calendar, Clock, Video, BookOpen, Quote, Target, Shield, Award, User, Trophy, ChevronRight
} from 'lucide-react'

export const revalidate = false
export const dynamic = 'force-static'

export default async function WorkshopsPage() {
  // Get Workshop courses from WooCommerce
  let allCourses: any[] = []
  try {
    allCourses = await getAllCourses()
  } catch (error) {
    console.error('Error fetching courses:', error)
    // Return empty array to allow build to continue
    allCourses = []
  }
  const workshopCourses = getCoursesByCategory(allCourses, 'workshop')

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-black via-gray-900 to-black text-white py-20 md:py-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="max-w-screen-xl mx-auto px-4 lg:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Main Content */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-[#ffed00]/20 text-[#ffed00] px-4 py-2 rounded-full mb-8">
                <Award className="h-4 w-4 fill-current" />
                <span className="text-sm font-semibold">All Workshops in English!</span>
              </div>

              {/* H1 - Same size as home */}
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                BlackBoard Training <span className="text-[#ffed00]">Workshops</span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                This is for everyone interested in restoring and improving foot health and function — from elite athletes to weekend warriors.
              </p>

              {/* Target Audience Tags */}
              <div className="flex flex-wrap gap-3 mb-10">
                <div className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm hover:bg-white/10 transition text-sm">
                  <Shield className="h-4 w-4 text-[#ffed00]" />
                  <span className="font-medium">Professionals</span>
                </div>
                <div className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm hover:bg-white/10 transition text-sm">
                  <Users className="h-4 w-4 text-[#ffed00]" />
                  <span className="font-medium">Therapists & Coaches</span>
                </div>
                <div className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm hover:bg-white/10 transition text-sm">
                  <Target className="h-4 w-4 text-[#ffed00]" />
                  <span className="font-medium">Enthusiasts</span>
                </div>
              </div>

              {/* CTA Button */}
              <div>
                <a
                  href="#workshops"
                  className="inline-flex items-center justify-center gap-2 bg-[#ffed00] text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-[#ffed00]/90 transform hover:scale-105 transition-all shadow-2xl"
                >
                  Choose Your Workshop
                  <ChevronRight className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Right - Quote & Description */}
            <div>
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl border-2 border-white/10 p-8 md:p-10">
                {/* Socrates Quote */}
                <div className="mb-8 pb-8 border-b border-white/10">
                  <Quote className="h-10 w-10 text-[#ffed00] mb-4" />
                  <p className="text-2xl italic mb-3 leading-relaxed">
                    &quot;If your feet hurt, you hurt all over.&quot;
                  </p>
                  <p className="text-gray-400 text-sm">— Socrates</p>
                </div>

                {/* Description */}
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    When walking or running, our feet are the first part of the body to touch the ground and the last to leave it. Between ground contact and propulsion, numerous processes occur at our foundation.
                  </p>
                  <p>
                    It acts as a shock absorber for our weight, transferring it throughout the body. Eccentric energy is converted into concentric force to adequately accelerate the body.
                  </p>
                  <p className="text-[#ffed00] font-semibold">
                    The BlackBoard Training Workshops will assist you in restoring a functional foundation and realigning the body from the ground up.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Online Workshop Courses */}
      <section id="workshops" className="py-20 bg-white scroll-mt-20">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            Workshop Programs
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Choose your workshop and start freeing your feet. Join our intensive training and master the BlackBoard method.
          </p>

          {workshopCourses.length > 0 ? (
            <CoursesListHorizontal initialCourses={workshopCourses} />
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-600">
                No online workshops available at the moment.
              </p>
              <p className="text-gray-500 mt-2">
                Check back soon or contact us for upcoming dates.
              </p>
            </div>
          )}

          {/* Online Consultation - Horizontal Card */}
          <div className="mt-6">
            <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-[#ffed00] hover:shadow-xl transition-all duration-300 group">
              <div className="grid md:grid-cols-[320px,1fr] gap-0">
                {/* Left - Armin Image */}
                <div className="relative h-64 md:h-auto bg-gradient-to-br from-gray-900 to-black">
                  {/* Placeholder for Armin's image */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#ffed00] to-yellow-500 flex items-center justify-center">
                      <User className="h-16 w-16 text-black" />
                    </div>
                  </div>

                  {/* 1:1 Badge - Top Left */}
                  <div className="absolute top-4 left-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ffed00]/95 backdrop-blur-sm rounded-full">
                      <Video className="h-3.5 w-3.5 text-black" />
                      <span className="text-xs font-bold text-black">1:1 Live Session</span>
                    </div>
                  </div>

                  {/* Armin Badge - Bottom */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3">
                      <p className="text-xs text-gray-500 font-medium">Your Trainer</p>
                      <p className="text-base font-bold text-gray-900">Armin Harrasser</p>
                    </div>
                  </div>
                </div>

                {/* Right - Consultation Details */}
                <div className="p-6 md:p-8 flex flex-col">
                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-black text-[#ffed00] rounded-full text-xs font-bold">
                      Online Consultation
                    </span>
                    <span className="px-3 py-1 bg-[#ffed00] text-black rounded-full text-xs font-bold">
                      Individual Coaching
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 group-hover:text-[#ffed00] transition-colors">
                    BlackBoard Online Consultation
                  </h2>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Experience a tailor-made coaching experience with Armin Harrasser, your personal trainer and advisor.
                    Benefit from an individual 1:1 session specifically tailored to your needs and goals.
                  </p>

                  {/* Benefits Grid - 3 columns */}
                  <div className="grid sm:grid-cols-3 gap-4 mb-6">
                    {/* Personalized Guidance */}
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-[#ffed00]/20 flex items-center justify-center flex-shrink-0">
                        <Target className="h-5 w-5 text-black" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-500 mb-1">Format</p>
                        <p className="text-sm font-bold text-gray-900 truncate">1:1 Video Call</p>
                      </div>
                    </div>

                    {/* Expert Support */}
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-[#ffed00]/20 flex items-center justify-center flex-shrink-0">
                        <Users className="h-5 w-5 text-black" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-500 mb-1">Experience</p>
                        <p className="text-sm font-bold text-gray-900 truncate">Expert Coach</p>
                      </div>
                    </div>

                    {/* Valuable Insights */}
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-[#ffed00]/20 flex items-center justify-center flex-shrink-0">
                        <Trophy className="h-5 w-5 text-black" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-500 mb-1">Focus</p>
                        <p className="text-sm font-bold text-gray-900 truncate">Your Goals</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-auto">
                    <a
                      href="/contact"
                      className="w-full bg-[#ffed00] text-black py-3.5 px-6 rounded-full font-semibold hover:bg-yellow-400 transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <Calendar className="h-5 w-5" />
                      Book an Online Consultation
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            What to Expect from Our Workshops
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <Clock className="h-10 w-10 text-[#ffed00] mb-4" />
              <h3 className="text-lg font-semibold mb-2">Intensive Learning</h3>
              <p className="text-sm text-gray-600">
                2-4 weeks of focused training with daily practice sessions
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <Users className="h-10 w-10 text-[#ffed00] mb-4" />
              <h3 className="text-lg font-semibold mb-2">Expert Instructors</h3>
              <p className="text-sm text-gray-600">
                Learn directly from certified BlackBoard master trainers
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <BookOpen className="h-10 w-10 text-[#ffed00] mb-4" />
              <h3 className="text-lg font-semibold mb-2">Practical Application</h3>
              <p className="text-sm text-gray-600">
                Hands-on exercises and real-world case studies
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <Video className="h-10 w-10 text-[#ffed00] mb-4" />
              <h3 className="text-lg font-semibold mb-2">Resource Access</h3>
              <p className="text-sm text-gray-600">
                Lifetime access to workshop recordings and materials
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}