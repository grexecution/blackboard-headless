import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Target, Calendar, TrendingUp, Heart, Lightbulb } from 'lucide-react'

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
      <section className="bg-black text-white py-16">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-[#ffed00]/20 text-[#ffed00] px-4 py-2 rounded-full mb-6">
              <Heart className="h-4 w-4" />
              <span className="text-sm font-semibold uppercase tracking-wider">Our Story</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
              Born from Pain, Built with Passion
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-4">
              How a single ankle sprain sparked a revolution in foot training that has helped over 20,000 people worldwide
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#ffed00]" />
                <span className="text-xs">Founded in 2015</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-[#ffed00]" />
                <span className="text-xs">Made in Cologne, Germany</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#ffed00]" />
                <span className="text-xs">20,000+ Happy Customers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Idea Section - Two Column Layout */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Section Title */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                How the idea of <span className="text-[#ffed00]">BlackBoard</span> came about
              </h2>
              <div className="w-24 h-1 bg-[#ffed00] mx-auto rounded-full"></div>
            </div>

            {/* Two Column Grid */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              {/* Left Column - Story */}
              <div className="space-y-8">
                {/* Chapter 1 */}
                <div className="relative">
                  <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-[#ffed00] to-transparent rounded-full"></div>
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#ffed00] rounded-full flex items-center justify-center font-bold text-black">
                        1
                      </div>
                      <h3 className="text-xl font-bold">The Meeting</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      Gregor Stumpf, a sports scientist, and Lars Grandjot, a physiotherapist, worked together in a physiotherapy practice in Cologne, Germany. While treating patients and athletes, they quickly realized the crucial role a healthy foot plays.
                    </p>
                  </div>
                </div>

                {/* Chapter 2 */}
                <div className="relative">
                  <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-[#ffed00] via-[#ffed00] to-transparent rounded-full"></div>
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#ffed00] rounded-full flex items-center justify-center font-bold text-black">
                        2
                      </div>
                      <h3 className="text-xl font-bold">The Problem</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      Lars knew this all too well from personal experience: years of issues following a single ankle sprain called for a new treatment method. That&apos;s how the idea for the BlackBoard was born.
                    </p>
                  </div>
                </div>

                {/* Chapter 3 */}
                <div className="relative">
                  <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-[#ffed00] to-transparent rounded-full"></div>
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#ffed00] rounded-full flex items-center justify-center font-bold text-black">
                        3
                      </div>
                      <h3 className="text-xl font-bold">The Solution</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      After two years of development, the BlackBoard prototype was ready for extensive testing. In both therapy and prevention, this tool offered a completely new approach to help people with long-term issues.
                    </p>
                  </div>
                </div>

                {/* Chapter 4 */}
                <div className="relative">
                  <div className="absolute -left-4 top-0 w-1 h-full bg-[#ffed00] rounded-full"></div>
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#ffed00] rounded-full flex items-center justify-center font-bold text-black">
                        4
                      </div>
                      <h3 className="text-xl font-bold">The Success</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      Patients, therapists, and doctors embraced the use of the BlackBoard and confirmed the effectiveness of the concept. To this day, the BlackBoard is proudly and meticulously produced in its hometown of Cologne, Germany.
                    </p>
                  </div>
                </div>

                {/* Made in Cologne Badge */}
                <div className="flex items-center gap-3 bg-gradient-to-r from-[#ffed00] to-yellow-400 text-black px-6 py-4 rounded-2xl font-bold shadow-lg">
                  <Heart className="h-6 w-6 fill-current" />
                  <span>Made with love in Germany since 2015</span>
                </div>
              </div>

              {/* Right Column - Founders Image (Sticky) */}
              <div className="lg:sticky lg:top-24">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <div className="aspect-[3/4] relative">
                    <Image
                      src="/images/founders.png"
                      alt="BlackBoard founders Gregor Stumpf and Lars Grandjot"
                      fill
                      className="object-cover"
                      priority
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                    {/* Founders Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="space-y-3">
                        <div className="inline-block bg-[#ffed00] text-black px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider">
                          The Founders
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white">
                          Gregor Stumpf<br/>
                          & Lars Grandjot
                        </h3>
                        <p className="text-white/90 text-sm">
                          Sports Scientist & Physiotherapist
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Cards Below Image */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-white rounded-xl p-4 shadow-md text-center">
                    <div className="text-3xl font-bold text-[#ffed00]">2015</div>
                    <div className="text-sm text-gray-600 font-medium">Founded</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-md text-center">
                    <div className="text-3xl font-bold text-[#ffed00]">20k+</div>
                    <div className="text-sm text-gray-600 font-medium">Customers</div>
                  </div>
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
                href="/courses"
                className="inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-xl"
              >
                View Courses
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}