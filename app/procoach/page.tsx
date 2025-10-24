import { getAllCourses, getCoursesByCategory } from '@/lib/woocommerce/courses'
import { getAllProCoaches } from '@/lib/woocommerce/procoaches'
import Link from 'next/link'
import CoursesListHorizontal from '@/components/courses/courses-list-horizontal'
import ProCoachFinder from '@/components/procoach/procoach-finder'
import ConsultationBookingButton from '@/components/procoach/consultation-booking-button'
import {
  Award, Users, BookOpen, Target, Shield, Zap, Trophy, ChevronRight, MapPin, Check, User, Calendar, Video
} from 'lucide-react'
import Image from "next/image";

export const revalidate = false
export const dynamic = 'force-static'

export default async function ProCoachPage() {
  // Get ProCoach courses from WooCommerce
  let allCourses: any[] = []
  try {
    allCourses = await getAllCourses()
  } catch (error) {
    console.error('Error fetching courses:', error)
    // Return empty array to allow build to continue
    allCourses = []
  }
  const procoachCourses = getCoursesByCategory(allCourses, 'procoach')

  // Get all ProCoaches
  let procoaches: any[] = []
  try {
    procoaches = await getAllProCoaches()
  } catch (error) {
    console.error('Error fetching procoaches:', error)
    // Return empty array to allow build to continue
    procoaches = []
  }

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
                <span className="text-sm font-semibold">Professional Certification</span>
              </div>

              {/* H1 - Same size as home */}
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                BlackBoard <span className="text-[#ffed00]">ProCoach</span>
                <span className="block text-gray-300 mt-2">Education</span>
              </h1>

              {/* Subtitle - Same size as home */}
              <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                Master the art and science of foot health with on-demand courses and live training
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

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#courses"
                  className="inline-flex items-center justify-center gap-2 bg-[#ffed00] text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-[#ffed00]/90 transform hover:scale-105 transition-all shadow-2xl"
                >
                  View Certification Courses
                  <ChevronRight className="h-5 w-5" />
                </a>
                <a
                  href="#find-procoach"
                  className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-black transition-all"
                >
                  <MapPin className="h-5 w-5" />
                  Find a ProCoach
                </a>
              </div>
            </div>

            {/* Right - How it Works */}
            <div>
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl border-2 border-white/10 p-8 md:p-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ffed00]/20 rounded-full mb-6">
                  <Zap className="h-4 w-4 text-[#ffed00]" />
                  <span className="text-sm font-bold text-[#ffed00]">Two-Level System</span>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold mb-6">How it works</h3>

                {/* Level 1 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-4 border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#ffed00] flex items-center justify-center font-bold text-black">
                      1
                    </div>
                    <h4 className="text-lg font-bold">Level 1</h4>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">
                    On-demand online course with concentrated materials covering fundamental concepts and techniques
                  </p>
                  <div className="inline-block px-3 py-1 bg-[#ffed00] rounded-full text-xs text-black font-semibold mr-2">
                    On Demand
                  </div>
                  <div className="inline-block px-3 py-1 bg-white text-black rounded-full text-xs font-semibold">
                    Live Training
                  </div>
                </div>

                {/* Level 2 */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#ffed00] flex items-center justify-center font-bold text-black">
                      2
                    </div>
                    <h4 className="text-lg font-bold">Level 2</h4>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">
                    Live webinar led by head coach Armin Harrasser with hands-on practice and certification
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-300 mb-3">
                    <Shield className="h-3 w-3" />
                    <span>Requires Level 1 completion</span>
                  </div>
                  <div className="inline-block px-3 py-1 bg-white text-black rounded-full text-xs font-semibold mr-2">
                    Live Training
                  </div>
                </div>

                {/* Lecturer Badge */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ffed00] to-yellow-500 flex items-center justify-center">
                      <Award className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Lead Instructor</p>
                      <p className="text-base font-bold">Armin Harrasser</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ProCoach Certification Courses */}
      <section id="courses" className="py-20 bg-white scroll-mt-20">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            Certification Programs
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Choose your certification path and start your journey to becoming a BlackBoard ProCoach expert.
          </p>

          {procoachCourses.length > 0 ? (
            <CoursesListHorizontal initialCourses={procoachCourses} />
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

          {/* Online Consultation - Horizontal Card */}
          <div className="mt-6">
            <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-[#ffed00] hover:shadow-xl transition-all duration-300 group">
              <div className="grid md:grid-cols-[320px,1fr] gap-0">
                {/* Left - Armin Image */}
                <div className="relative h-64 md:h-auto bg-gradient-to-br from-gray-900 to-black">
                  {/* Placeholder for Armin's image */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#ffed00] to-yellow-500 flex items-center justify-center">
                      <Image
                          src="/images/armin_har.png"
                          alt="BlackBoard Coach Armin Harrasser"
                          fill
                          className="object-cover"
                          priority
                      />
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
                    <ConsultationBookingButton />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Learn - Dark Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ffed00]/20 rounded-full mb-6">
                <BookOpen className="h-4 w-4 text-[#ffed00]" />
                <span className="text-sm font-bold text-[#ffed00]">Comprehensive Training</span>
              </div>

              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                Become a foot health <span className="text-[#ffed00]">professional</span>
              </h2>

              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                Our two-step ProCoach program provides comprehensive knowledge in functional and
                biomechanical connections of the body, teaching you how the BlackBoard can effectively
                address muscle and joint issues from head to toe.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#ffed00] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-black font-bold" />
                  </div>
                  <p className="text-gray-300">Functional and biomechanical body connections</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#ffed00] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-black font-bold" />
                  </div>
                  <p className="text-gray-300">BlackBoard techniques for muscle and joint issues</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#ffed00] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-black font-bold" />
                  </div>
                  <p className="text-gray-300">Complete head-to-toe treatment protocols</p>
                </div>
              </div>
            </div>

            {/* Right - Image Placeholder */}
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-[#ffed00]/20 to-gray-800 border-2 border-[#ffed00]/30 overflow-hidden shadow-2xl">
                {/* Placeholder for image - you can replace with actual image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Trophy className="h-32 w-32 text-[#ffed00]/30" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ProCoach Finder Section */}
      <section id="find-procoach" className="pt-16 scroll-mt-20">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6 mb-12">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ffed00] bg-opacity-20 rounded-full text-sm font-semibold text-gray-900 mb-4">
              <MapPin className="h-4 w-4" />
              Find a Certified ProCoach Near You
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Connect with a <span className="text-[#ffed00]">Certified ProCoach</span>
            </h2>
            <p className="text-lg text-gray-600">
              Our network of certified BlackBoard ProCoaches spans across Europe and beyond.
              Find an expert near you to begin your journey to optimal foot health and movement.
            </p>
          </div>
        </div>

        <ProCoachFinder procoaches={procoaches} />
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
              className="bg-[#ffed00] text-black px-8 py-3 rounded-full font-semibold hover:bg-yellow-400 transition inline-flex items-center justify-center gap-2"
            >
              View All Courses
              <ChevronRight className="h-4 w-4" />
            </a>
            <a
              href="#find-procoach"
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/20 transition inline-flex items-center justify-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Find a ProCoach Near You
            </a>
            <Link
              href="/contact"
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/20 transition"
            >
              1:1 Live Session
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}