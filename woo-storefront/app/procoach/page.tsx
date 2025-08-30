import { getAllProducts } from '@/lib/woocommerce/products'
import Link from 'next/link'
import Image from 'next/image'
import { Award, CheckCircle, Star, Users, BookOpen, TrendingUp } from 'lucide-react'

export const revalidate = 3600

export default async function ProCoachPage() {
  const products = await getAllProducts()
  
  // Filter ProCoach certification products
  const certifications = products.filter(p => 
    p.categories.some(cat => 
      cat.slug === 'procoach' || 
      cat.slug === 'certification' ||
      cat.name.toLowerCase().includes('procoach') ||
      cat.name.toLowerCase().includes('certification')
    ) || p.name.toLowerCase().includes('procoach')
  )

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-black to-gray-900 text-white py-20">
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
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Become a <span className="text-[#ffed00]">ProCoach</span>?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition">
              <CheckCircle className="h-12 w-12 text-[#ffed00] mb-4" />
              <h3 className="text-xl font-semibold mb-3">Professional Recognition</h3>
              <p className="text-gray-600">
                Gain industry-recognized certification in foot health and movement science.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition">
              <Users className="h-12 w-12 text-[#ffed00] mb-4" />
              <h3 className="text-xl font-semibold mb-3">Expert Community</h3>
              <p className="text-gray-600">
                Join a network of professionals dedicated to improving human movement.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition">
              <TrendingUp className="h-12 w-12 text-[#ffed00] mb-4" />
              <h3 className="text-xl font-semibold mb-3">Career Growth</h3>
              <p className="text-gray-600">
                Expand your practice with cutting-edge techniques and methodologies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Certification Programs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Available Certifications
          </h2>
          
          {certifications.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {certifications.map((cert) => (
                <Link 
                  key={cert.id} 
                  href={`/product/${cert.slug}`}
                  className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gray-100">
                    {cert.images?.[0] ? (
                      <Image
                        src={cert.images[0].src}
                        alt={cert.images[0].alt || cert.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Award className="h-24 w-24 text-gray-300" />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-[#ffed00] transition">
                      {cert.name}
                    </h3>
                    
                    <div 
                      className="text-gray-600 text-sm mb-4 line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: cert.short_description || cert.description }}
                    />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">
                        ${cert.price}
                      </span>
                      <span className="text-[#ffed00] font-semibold group-hover:underline">
                        Learn More →
                      </span>
                    </div>
                  </div>
                </Link>
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

      {/* CTA Section */}
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Become a <span className="text-[#ffed00]">ProCoach</span>?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Take the next step in your professional journey with BlackBoard certification.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/shop" 
              className="bg-[#ffed00] text-black px-8 py-3 rounded-md font-semibold hover:bg-yellow-400 transition"
            >
              Browse All Programs
            </Link>
            <Link 
              href="/contact" 
              className="bg-white text-black px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}