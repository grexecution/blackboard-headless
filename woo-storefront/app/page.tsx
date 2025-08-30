import { getFeaturedProducts, getStockStatus, getAllProducts } from '@/lib/woocommerce/products'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, ArrowRight, Star, Shield, Truck, Award, Check, PlayCircle, Users, Target, Clock, ChevronRight } from 'lucide-react'
import { AddToCartButton } from '@/components/product/add-to-cart'

// Static generation - rebuilds only on webhook
export const revalidate = false
export const dynamic = 'force-static'

export default async function Home() {
  const products = await getAllProducts()
  const featuredProducts = products.filter(p => 
    p.name.toLowerCase().includes('blackboard') && 
    (p.name.toLowerCase().includes('basic') || p.name.toLowerCase().includes('professional'))
  )

  return (
    <div className="min-h-screen">
      {/* Hero Section - Full Screen */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #ffed00 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}/>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-[#ffed00]/20 text-[#ffed00] px-4 py-2 rounded-full mb-6">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm font-semibold">Trusted by 20,000+ Athletes</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Transform Your
                <span className="block text-[#ffed00] mt-2">Foundation</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                Professional foot training equipment designed by experts, proven by science, trusted by champions.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center gap-2 bg-[#ffed00] text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-[#ffed00]/90 transform hover:scale-105 transition-all shadow-2xl"
                >
                  Shop Now
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <button className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-black transition-all">
                  <PlayCircle className="h-5 w-5" />
                  Watch Demo
                </button>
              </div>
              
              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#ffed00]">98%</div>
                  <div className="text-sm text-gray-400">Satisfaction Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#ffed00]">30-Day</div>
                  <div className="text-sm text-gray-400">Money Back</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#ffed00]">2-5 Days</div>
                  <div className="text-sm text-gray-400">Fast Delivery</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10">
                <Image
                  src="/api/placeholder/600/600"
                  alt="BlackBoard Training Equipment"
                  width={600}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-[#ffed00]/20 blur-3xl rounded-full transform scale-75"></div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Your Feet Are Your <span className="text-[#ffed00]">Foundation</span>
            </h2>
            <p className="text-xl text-gray-600">
              90% of people have foot dysfunction that affects their entire body. 
              BlackBoard is the scientifically proven solution.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Problem */}
            <div className="bg-red-50 rounded-2xl p-8">
              <div className="text-red-600 text-2xl font-bold mb-4">The Problem</div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Chronic pain in feet, knees, hips, and back</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Poor balance and stability</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Decreased athletic performance</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Risk of injuries and falls</span>
                </li>
              </ul>
            </div>
            
            {/* Solution */}
            <div className="bg-green-50 rounded-2xl p-8">
              <div className="text-green-600 text-2xl font-bold mb-4">The Solution</div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>Restore natural foot function</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>Eliminate pain from the ground up</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>Improve balance and coordination</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>Enhance athletic performance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products - Modern Cards */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#ffed00]/10 text-[#ffed00] px-4 py-2 rounded-full mb-4">
              <Award className="h-4 w-4" />
              <span className="text-sm font-semibold">Best Sellers</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Choose Your BlackBoard</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start your journey with our professional-grade training equipment
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {featuredProducts.map((product, index) => (
              <div key={product.id} className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#ffed00] to-yellow-400 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
                <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl">
                  {index === 0 && (
                    <div className="absolute top-4 right-4 z-10 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="relative h-80 bg-gradient-to-br from-gray-100 to-gray-50">
                    {product.images[0] && (
                      <Image
                        src={product.images[0].src}
                        alt={product.images[0].alt || product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                  </div>
                  
                  <div className="p-8">
                    <h3 className="text-3xl font-bold mb-3">{product.name}</h3>
                    
                    <div className="flex items-baseline gap-3 mb-4">
                      <span className="text-4xl font-bold text-[#ffed00]">
                        €{product.price}
                      </span>
                      {product.on_sale && product.regular_price !== product.price && (
                        <span className="text-xl text-gray-400 line-through">
                          €{product.regular_price}
                        </span>
                      )}
                    </div>
                    
                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="text-gray-600">Professional grade materials</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="text-gray-600">Complete training system</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="text-gray-600">Lifetime warranty</span>
                      </li>
                    </ul>
                    
                    <Link
                      href={`/product/${product.slug}`}
                      className="block w-full text-center bg-black text-white px-6 py-4 rounded-full font-bold hover:bg-gray-800 transform hover:scale-105 transition-all"
                    >
                      View Details
                      <ArrowRight className="inline-block ml-2 h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Trusted by <span className="text-[#ffed00]">Champions</span>
            </h2>
            <p className="text-xl text-gray-300">
              Join thousands of athletes and professionals who transformed their performance
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-[#ffed00] text-[#ffed00]" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">
                  {`"BlackBoard completely changed my training. My balance and stability improved dramatically within weeks."`}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#ffed00] rounded-full"></div>
                  <div>
                    <div className="font-semibold">Professional Athlete</div>
                    <div className="text-sm text-gray-400">Verified Buyer</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How BlackBoard <span className="text-[#ffed00]">Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to transform your foundation
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#ffed00] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-black">1</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Assess</h3>
              <p className="text-gray-600">
                Identify your specific foot dysfunction patterns using our diagnostic tools
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-[#ffed00] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-black">2</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Train</h3>
              <p className="text-gray-600">
                Follow our structured program with targeted exercises for your needs
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-[#ffed00] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-black">3</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Transform</h3>
              <p className="text-gray-600">
                Experience improved performance, balance, and pain-free movement
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-[#ffed00] to-yellow-400">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">
            Ready to Transform Your Foundation?
          </h2>
          <p className="text-xl text-gray-800 mb-8 max-w-2xl mx-auto">
            Join 20,000+ athletes and professionals who trust BlackBoard for their training
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-800 transform hover:scale-105 transition-all shadow-2xl"
            >
              <ShoppingBag className="h-5 w-5" />
              Shop Now
            </Link>
            <Link
              href="/procoach"
              className="inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all shadow-2xl"
            >
              Get Certified
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span className="font-semibold">30-Day Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              <span className="font-semibold">Free Shipping €100+</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              <span className="font-semibold">Premium Quality</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}