import { getAllProducts } from '@/lib/woocommerce/products'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, Target, Users, Activity, ChevronRight, Quote } from 'lucide-react'

export const revalidate = 3600

export default async function WorkshopsPage() {
  const products = await getAllProducts()
  
  // Filter workshop products
  const workshops = products.filter(p => 
    p.categories.some(cat => 
      cat.slug === 'workshops' || 
      cat.name.toLowerCase().includes('workshop')
    ) || p.name.toLowerCase().includes('workshop')
  )

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-black to-gray-900 text-white py-20">
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
                {`"If your feet hurt, you hurt all over."`}
              </p>
              <p className="text-gray-300">- Socrates</p>
            </div>
            
            <p className="text-lg text-gray-300 mt-8 max-w-3xl mx-auto">
              Restore a functional foundation and realign your body from the ground up. 
              Our workshops provide practical, science-based training for immediate implementation.
            </p>
          </div>
        </div>
      </section>

      {/* Workshops Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Available Workshops</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Specialized training programs designed to address specific foot conditions and improve overall biomechanics
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {workshops.map((workshop) => (
              <div key={workshop.id} className="bg-white rounded-lg shadow-lg overflow-hidden group">
                <div className="relative h-64 bg-gray-100">
                  {workshop.images[0] && (
                    <Image
                      src={workshop.images[0].src}
                      alt={workshop.images[0].alt || workshop.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  {workshop.on_sale && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-md text-sm font-bold">
                      Special Offer
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-3">{workshop.name}</h3>
                  
                  {workshop.short_description && (
                    <div 
                      className="text-gray-600 mb-4 line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: workshop.short_description }}
                    />
                  )}
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Target className="h-4 w-4 text-[#ffed00]" />
                      <span>Targeted solution approach</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4 text-[#ffed00]" />
                      <span>Self-paced learning</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Activity className="h-4 w-4 text-[#ffed00]" />
                      <span>Practical exercises</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Workshop Price</p>
                        <p className="text-3xl font-bold text-[#ffed00]">€{workshop.price}</p>
                      </div>
                    </div>
                    
                    <Link
                      href={`/product/${workshop.slug}`}
                      className="flex items-center justify-center gap-2 w-full bg-black text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-800 transition-colors"
                    >
                      Learn More
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {workshops.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No workshops available at the moment.</p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-[#ffed00] hover:text-[#ffed00]/80 font-semibold"
              >
                Browse All Products
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            What You&apos;ll <span className="text-[#ffed00]">Learn</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#ffed00] rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-black" />
              </div>
              <h3 className="font-bold mb-2">Root Cause Analysis</h3>
              <p className="text-sm text-gray-600">
                Identify and address the underlying causes of foot dysfunction
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#ffed00] rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="h-8 w-8 text-black" />
              </div>
              <h3 className="font-bold mb-2">Practical Exercises</h3>
              <p className="text-sm text-gray-600">
                Learn effective exercises you can implement immediately
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#ffed00] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-black" />
              </div>
              <h3 className="font-bold mb-2">Professional Techniques</h3>
              <p className="text-sm text-gray-600">
                Master methods used by elite athletes and therapists
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#ffed00] rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-black" />
              </div>
              <h3 className="font-bold mb-2">Lifetime Access</h3>
              <p className="text-sm text-gray-600">
                Review materials anytime with unlimited access
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who Is This For Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Who Are These Workshops For?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold mb-3 text-[#ffed00]">Healthcare Professionals</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Physiotherapists</li>
                <li>• Sports therapists</li>
                <li>• Chiropractors</li>
                <li>• Podiatrists</li>
                <li>• Massage therapists</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold mb-3 text-[#ffed00]">Fitness Professionals</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Personal trainers</li>
                <li>• Yoga instructors</li>
                <li>• Pilates teachers</li>
                <li>• Athletic coaches</li>
                <li>• Movement specialists</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold mb-3 text-[#ffed00]">Active Individuals</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Athletes</li>
                <li>• Runners</li>
                <li>• Fitness enthusiasts</li>
                <li>• Anyone with foot issues</li>
                <li>• Health-conscious individuals</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Transform Your <span className="text-[#ffed00]">Foundation</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Start your journey to better foot health and improved performance today.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-[#ffed00] text-black px-8 py-4 rounded-md font-bold hover:bg-[#ffed00]/90 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              Shop All Products
            </Link>
            <Link
              href="/procoach"
              className="inline-flex items-center gap-2 border border-white px-8 py-4 rounded-md font-bold hover:bg-white hover:text-black transition-colors"
            >
              View Certifications
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

// Add missing import
import { ShoppingCart } from 'lucide-react'