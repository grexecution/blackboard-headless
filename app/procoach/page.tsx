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
        <div className="container mx-auto px-4">
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

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Trophy className="h-10 w-10 text-[#ffed00] mb-3 mx-auto" />
                <h3 className="font-semibold mb-2">Industry Recognition</h3>
                <p className="text-sm text-gray-300">
                  Globally recognized certification
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Users className="h-10 w-10 text-[#ffed00] mb-3 mx-auto" />
                <h3 className="font-semibold mb-2">Expert Network</h3>
                <p className="text-sm text-gray-300">
                  Join 500+ certified professionals
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Target className="h-10 w-10 text-[#ffed00] mb-3 mx-auto" />
                <h3 className="font-semibold mb-2">Career Growth</h3>
                <p className="text-sm text-gray-300">
                  Expand your practice & expertise
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Become a <span className="text-[#ffed00]">ProCoach</span>?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition">
              <Shield className="h-12 w-12 text-[#ffed00] mb-4" />
              <h3 className="text-xl font-semibold mb-3">Professional Credibility</h3>
              <p className="text-gray-600">
                Stand out with industry-recognized certification and proven expertise.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition">
              <BookOpen className="h-12 w-12 text-[#ffed00] mb-4" />
              <h3 className="text-xl font-semibold mb-3">Comprehensive Training</h3>
              <p className="text-gray-600">
                Master evidence-based techniques with structured learning pathways.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition">
              <Trophy className="h-12 w-12 text-[#ffed00] mb-4" />
              <h3 className="text-xl font-semibold mb-3">Business Growth</h3>
              <p className="text-gray-600">
                Attract more clients with specialized foot health expertise.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition">
              <Zap className="h-12 w-12 text-[#ffed00] mb-4" />
              <h3 className="text-xl font-semibold mb-3">Continuous Support</h3>
              <p className="text-gray-600">
                Access ongoing education and community resources.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ProCoach Certification Courses */}
      <section className="py-16">
        <div className="container mx-auto px-4">
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

      {/* Certification Process */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Your Path to <span className="text-[#ffed00]">Certification</span>
          </h2>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { icon: BookOpen, title: 'Learn', desc: 'Complete comprehensive online modules' },
                { icon: Target, title: 'Practice', desc: 'Apply techniques with guided exercises' },
                { icon: Trophy, title: 'Assess', desc: 'Pass certification assessments' },
                { icon: Award, title: 'Certify', desc: 'Receive your ProCoach certificate' }
              ].map((step, idx) => (
                <div key={idx} className="text-center">
                  <div className="relative">
                    <div className="w-20 h-20 bg-[#ffed00] rounded-full flex items-center justify-center mx-auto mb-4">
                      <step.icon className="h-10 w-10 text-black" />
                    </div>
                    {idx < 3 && (
                      <div className="hidden md:block absolute top-10 left-20 w-full h-0.5 bg-gray-300" />
                    )}
                  </div>
                  <h3 className="font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-black to-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Become a <span className="text-[#ffed00]">ProCoach</span>?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Take the next step in your professional journey with BlackBoard certification.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/account/courses"
              className="bg-[#ffed00] text-black px-8 py-3 rounded-full font-semibold hover:bg-yellow-400 transition inline-flex items-center gap-2"
            >
              View All Courses
              <ChevronRight className="h-4 w-4" />
            </Link>
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