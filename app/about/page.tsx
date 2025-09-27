import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Users, Target, Award, CheckCircle, Calendar, TrendingUp, Heart, Lightbulb } from 'lucide-react'

export const metadata = {
  title: 'About BlackBoard | Our Story & Mission',
  description: 'Learn about the founders of BlackBoard and how a simple ankle sprain led to a revolutionary foot training system used by over 20,000 athletes worldwide.',
}

export default function AboutPage() {
  const milestones = [
    { year: '2015', event: 'First Ideas & Concept', description: 'Gregor Stumpf and Lars Grandjot begin developing the BlackBoard concept' },
    { year: '2016', event: 'First Prototype', description: 'Testing and refining the design with athletes and patients' },
    { year: '2017', event: 'Launch of the Online-Shop', description: 'Making BlackBoard available to customers worldwide' },
    { year: '2018', event: '1,000 Happy Customers', description: 'Reaching our first major milestone in customer satisfaction' },
    { year: '2023', event: '3,000+ Happy Customers', description: 'Continued growth and international expansion' },
    { year: '2024', event: '20,000+ Users Worldwide', description: 'BlackBoard becomes the leading foot training system globally' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #ffed00 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}/>
        </div>

        <div className="max-w-screen-xl mx-auto px-4 lg:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              Our <span className="text-[#ffed00]">Story</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              How a simple ankle sprain led to a revolutionary foot training system
            </p>
          </div>
        </div>
      </section>

      {/* The Idea Section */}
      <section className="py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-[#ffed00]/10 to-yellow-50 rounded-3xl p-8 md:p-12 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                How the idea of BlackBoard came about
              </h2>

              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p>
                  Gregor Stumpf, a sports scientist, and Lars Grandjot, a physiotherapist, worked together in a physiotherapy practice in Cologne. While treating patients and athletes, they quickly realized the crucial role a healthy foot plays.
                </p>

                <p>
                  Lars knew this all too well from personal experience: years of issues following a single ankle sprain called for a new treatment method. That&apos;s how the idea for the BlackBoard was born. After two years of development, the BlackBoard prototype was ready for extensive testing. In both therapy and prevention, this tool offered a completely new approach to help people with long-term issues.
                </p>

                <p>
                  Patients, therapists, and doctors embraced the use of the BlackBoard and confirmed the effectiveness of the concept. To this day, the BlackBoard is proudly and meticulously produced in its hometown of Cologne.
                </p>
              </div>
            </div>

            {/* Founders Image Section */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl mb-12">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Users className="h-20 w-20 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Gregor Stumpf & Lars Grandjot</p>
                  </div>
                </div>

                {/* Yellow banner overlay */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-[#ffed00] text-black px-6 py-3 rounded-full font-bold shadow-lg">
                  The founders of BlackBoard: Gregor Stumpf & Lars Grandjot
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Our <span className="text-[#ffed00]">Mission & Values</span>
              </h2>
              <p className="text-xl text-gray-600">
                What drives us every day to help you achieve better foot health
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-[#ffed00]/20 rounded-full flex items-center justify-center mb-6">
                  <Target className="h-8 w-8 text-[#ffed00]" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-gray-600">
                  To provide everyone with access to professional foot training, helping eliminate pain and improve performance from the ground up.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-[#ffed00]/20 rounded-full flex items-center justify-center mb-6">
                  <Heart className="h-8 w-8 text-[#ffed00]" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Our Passion</h3>
                <p className="text-gray-600">
                  We&apos;re passionate about foot health and believe that proper foot function is the foundation of overall body wellness and athletic performance.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-[#ffed00]/20 rounded-full flex items-center justify-center mb-6">
                  <Lightbulb className="h-8 w-8 text-[#ffed00]" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Our Innovation</h3>
                <p className="text-gray-600">
                  Continuously improving our products based on scientific research and feedback from thousands of users worldwide.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Milestones Timeline */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                The biggest BlackBoard <span className="text-[#ffed00]">milestones</span>
              </h2>
              <p className="text-xl text-gray-400">
                Our journey from a simple idea to a global movement
              </p>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-[#ffed00]/30 transform md:-translate-x-1/2"></div>

              {/* Milestone items */}
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div key={milestone.year} className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    {/* Timeline dot */}
                    <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-[#ffed00] rounded-full transform -translate-x-1/2 z-10"></div>

                    {/* Content */}
                    <div className={`ml-16 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                      <div className="bg-gray-900 rounded-2xl p-6 hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                          <Calendar className="h-5 w-5 text-[#ffed00]" />
                          <span className="text-[#ffed00] font-bold text-lg">{milestone.year}</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">{milestone.event}</h3>
                        <p className="text-gray-400">{milestone.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Success Message */}
            <div className="mt-16 text-center">
              <div className="inline-flex items-center gap-3 bg-[#ffed00]/20 text-[#ffed00] px-6 py-3 rounded-full">
                <TrendingUp className="h-5 w-5" />
                <span className="font-bold">With love for the product since 2015: This is BlackBoard!</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose BlackBoard */}
      <section className="py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Why Choose <span className="text-[#ffed00]">BlackBoard</span>?
              </h2>
              <p className="text-xl text-gray-600">
                What makes us different from other training systems
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#ffed00] to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-10 w-10 text-black" />
                </div>
                <h3 className="font-bold text-lg mb-2">Scientific Foundation</h3>
                <p className="text-sm text-gray-600">Developed by experts in sports science and physiotherapy</p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#ffed00] to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-10 w-10 text-black" />
                </div>
                <h3 className="font-bold text-lg mb-2">Proven Results</h3>
                <p className="text-sm text-gray-600">Trusted by 20,000+ athletes and therapists worldwide</p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#ffed00] to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-10 w-10 text-black" />
                </div>
                <h3 className="font-bold text-lg mb-2">Expert Support</h3>
                <p className="text-sm text-gray-600">Access to professional training programs and guidance</p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#ffed00] to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-10 w-10 text-black" />
                </div>
                <h3 className="font-bold text-lg mb-2">Made with Love</h3>
                <p className="text-sm text-gray-600">Handcrafted in Cologne with attention to every detail</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#ffed00] to-yellow-500">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-black/80 mb-8">
              Join thousands of athletes and patients who have transformed their lives with BlackBoard
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition-all shadow-xl"
              >
                Shop BlackBoard
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-xl"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}