import { getWorkshopCourses } from '@/lib/lms/api'
import Link from 'next/link'
import CourseCard from '@/components/lms/course-card'
import {
  Users, Calendar, MapPin, Clock, ChevronRight, Video, BookOpen, Quote
} from 'lucide-react'

export const revalidate = false
export const dynamic = 'force-static'

export default async function WorkshopsPage() {
  // Get Workshop courses from WooCommerce
  const workshopCourses = await getWorkshopCourses()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-black to-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              BlackBoard <span className="text-[#ffed00]">Workshops</span>
            </h1>

            <p className="text-2xl text-gray-300 mb-4">
              For Professionals, Therapists & Coaches, Enthusiasts
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mt-8 max-w-3xl mx-auto">
              <Quote className="h-8 w-8 text-[#ffed00] mb-4 mx-auto" />
              <p className="text-xl italic mb-4">
                &quot;If your feet hurt, you hurt all over.&quot;
              </p>
              <p className="text-gray-300">- Socrates</p>
            </div>

            <p className="text-lg text-gray-300 mt-8 max-w-3xl mx-auto">
              Restore a functional foundation and realign your body from the ground up.
              Our workshops provide practical, science-based training for immediate implementation.
            </p>

            {/* Quick Features */}
            <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Users className="h-10 w-10 text-[#ffed00] mb-3 mx-auto" />
                <h3 className="font-semibold mb-2">Small Groups</h3>
                <p className="text-sm text-gray-300">
                  Personalized attention with max 12 participants
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Video className="h-10 w-10 text-[#ffed00] mb-3 mx-auto" />
                <h3 className="font-semibold mb-2">Online & In-Person</h3>
                <p className="text-sm text-gray-300">
                  Flexible learning options to suit your needs
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Calendar className="h-10 w-10 text-[#ffed00] mb-3 mx-auto" />
                <h3 className="font-semibold mb-2">Regular Schedule</h3>
                <p className="text-sm text-gray-300">
                  Monthly workshops throughout the year
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Online Workshop Courses */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Online Workshop Training
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Join our intensive online workshops and master the BlackBoard method with expert guidance.
          </p>

          {workshopCourses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {workshopCourses.map((course) => (
                <CourseCard key={course.id} course={course} type="workshop" />
              ))}
            </div>
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
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
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

      {/* Workshop Process */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Your Workshop Journey
          </h2>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: 1, title: 'Register', desc: 'Choose your workshop and secure your spot' },
                { step: 2, title: 'Prepare', desc: 'Receive pre-workshop materials and setup guide' },
                { step: 3, title: 'Participate', desc: 'Engage in interactive sessions and exercises' },
                { step: 4, title: 'Apply', desc: 'Implement techniques with ongoing support' }
              ].map((item, idx) => (
                <div key={idx} className="text-center">
                  <div className="relative">
                    <div className="w-16 h-16 bg-[#ffed00] rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-black">{item.step}</span>
                    </div>
                    {idx < 3 && (
                      <div className="hidden md:block absolute top-8 left-16 w-full h-0.5 bg-gray-300" />
                    )}
                  </div>
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-black to-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Transform Your Skills?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join our next workshop and experience the power of the BlackBoard method.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="bg-[#ffed00] text-black px-8 py-3 rounded-full font-semibold hover:bg-yellow-400 transition inline-flex items-center gap-2"
            >
              Browse All Workshops
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/20 transition"
            >
              Request Private Workshop
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}