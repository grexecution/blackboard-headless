'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star, Shield, Truck, Award, Check, PlayCircle, Users, ChevronRight, RefreshCw, BookOpen, Video as VideoIcon, FileText, Lock, Trophy, Activity, TrendingUp, AlertTriangle, Target, Zap, Brain } from 'lucide-react'
import InstructorModal from '@/components/instructor-modal'
import { useCurrency } from '@/lib/currency-context'
import { ProductPriceDisplay } from '@/components/products/ProductPriceDisplay'
import ProductCard from '@/components/products/ProductCard'
import { Video, getVideoThumbnail } from '@/lib/woocommerce/videos'
import { Testimonial, getTestimonialImage, getTestimonialReviewerName, getTestimonialRating, getTestimonialText, getTestimonialJobPosition } from '@/lib/woocommerce/testimonials'

interface HomeContentProps {
  blackboardProducts: any[]
  blackboardWithVariations: any[]
  videos: Video[]
  totalVideoCount?: number
  reviews: Testimonial[]
}

export default function HomeContent({ blackboardProducts, blackboardWithVariations, videos = [], totalVideoCount = 0, reviews = [] }: HomeContentProps) {
  const { getCurrencySymbol } = useCurrency()
  const currencySymbol = getCurrencySymbol()

  // Helper function to rename BlackBoard Normal to Basic
  const getDisplayName = (name: string) => {
    return name.replace(/BlackBoard Normal/gi, 'BlackBoard Basic')
  }

  // Helper function to decode HTML entities (server-safe)
  const decodeHtmlEntities = (text: string) => {
    return text
      .replace(/&#8211;/g, '–')
      .replace(/&#8212;/g, '—')
      .replace(/&#8220;/g, '"')
      .replace(/&#8221;/g, '"')
      .replace(/&#8216;/g, "'")
      .replace(/&#8217;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
  }

  const [selectedInstructor, setSelectedInstructor] = useState<any>(null)
  const [showVideoModal, setShowVideoModal] = useState(false)

  const instructors = [
    {
      name: "Lars Grandjot",
      title: "Physiotherapeut",
      image: "/images/team/lars.jpg",
      shortBio: "Nach meiner Ausbildung zur Physiotherapeut im Jahr 2005 und meinem Einstieg nach Köln habe ich mit meinem Geschäftspartner Gregor das BlackBoard zur Kräftigung der Füße entwickelt.",
      fullContent: `
        <h3><strong>Werdegang & Expertise</strong></h3>
        <p>Nach meiner Ausbildung zum Physiotherapeuten im Jahr 2005 und meinem Einstieg in Köln habe ich mit meinem Geschäftspartner Gregor das BlackBoard zur Kräftigung der Füße entwickelt. Wir haben das BlackBoard Training für gesunde, leistungsstarke Füße ins Leben gerufen.</p>

        <h3><strong>Spezialisierungen</strong></h3>
        <ul>
          <li>Funktionelle Fußtherapie</li>
          <li>Sportphysiotherapie</li>
          <li>Manuelle Therapie</li>
          <li>Funktionelle Anatomie</li>
        </ul>

        <h3><strong>Berufliche Stationen</strong></h3>
        <p>Unter anderem war ich bei Kurt Canaris tätig, arbeite als Physiotherapeut und unterrichte funktionelle Anatomie an verschiedenen Instituten. Meine langjährige Erfahrung in der Behandlung von Profisportlern hat maßgeblich zur Entwicklung des BlackBoard-Konzepts beigetragen.</p>

        <h3><strong>Philosophie</strong></h3>
        <p>Ich glaube fest daran, dass die Füße das Fundament unseres gesamten Bewegungsapparats sind. Eine gezielte Kräftigung und Mobilisierung der Fußmuskulatur kann viele Beschwerden im gesamten Körper positiv beeinflussen.</p>
      `
    },
    {
      name: "Gregor Stumpf",
      title: "Dipl. Sportwissenschaftler",
      image: "/images/team/gregor.jpg",
      shortBio: "Nach Abschluss meines Studiums der Sportrehabilitation im Jahr 2006 arbeitet ich u.a. mit Profisportlern und unterrichtete bereits an der Kölner Sporthochschule.",
      fullContent: `
        <h3><strong>Akademischer Hintergrund</strong></h3>
        <p>Nach Abschluss meines Studiums der Sportrehabilitation im Jahr 2006 arbeitete ich u.a. mit Profisportlern und unterrichtete bereits an der Kölner Sporthochschule.</p>

        <h3><strong>Karriere im Profisport</strong></h3>
        <p>2015 wechselte ich zu Bayer 04 Leverkusen, wo ich meine Erfahrungen in einem professionellen Trainingsumfeld weiter ausbauen konnte. Die Arbeit mit Bundesliga-Profis hat mir gezeigt, wie wichtig eine starke Fußmuskulatur für die Leistungsfähigkeit und Verletzungsprävention ist.</p>

        <h3><strong>Die Entwicklung des BlackBoards</strong></h3>
        <p>Diese Erkenntnisse führten dazu, dass ich zusammen mit Lars das BlackBoard entwickelte, ein Tool, das heute weltweit zur Genesung nach Verletzungen und zur Leistungssteigerung eingesetzt wird. Unser Ziel war es, ein einfaches aber effektives Trainingsgerät zu schaffen, das sowohl im Profisport als auch im Heimbereich eingesetzt werden kann.</p>

        <h3><strong>Aktuelle Tätigkeit</strong></h3>
        <p>Heute berate ich Profisportler und Vereine in Trainingsfragen und gebe mein Wissen in Workshops und Fortbildungen weiter. Das BlackBoard ist dabei ein zentraler Bestandteil meiner Arbeit.</p>
      `
    },
    {
      name: "Armin Harasser",
      title: "Sportwissenschaftler (M.Sc.)",
      image: "/images/team/armin_harasser.jpg",
      shortBio: "Seit 7 Jahren unterrichte ich weltweit Therapiemethoden, arbeite mit dem Fußchirurgen Dr. Kai Olms zusammen und behandle Olympiaathleten wie Galen Rupp und Dimitry Ovtcharov. Als nächstes werde ich in Japan und Südkorea unterrichten.",
      fullContent: `
        <h3><strong>Internationale Expertise</strong></h3>
        <p>Seit 7 Jahren unterrichte ich weltweit Therapiemethoden, speziell mit dem Fußtrainingsgerät. Meine Zusammenarbeit mit dem Fußchirurgen Dr. Kai Olms hat zu innovativen Behandlungsansätzen geführt, die heute international anerkannt sind.</p>

        <h3><strong>Arbeit mit Spitzensportlern</strong></h3>
        <p>Zu meinen Klienten zählen Olympiaathleten wie Galen Rupp (USA, Marathon) und Dimitry Ovtcharov (Deutschland, Tischtennis). Die Arbeit mit diesen Ausnahmesportlern hat mir gezeigt, wie wichtig die Fußgesundheit für Höchstleistungen ist.</p>

        <h3><strong>Internationale Lehrtätigkeit</strong></h3>
        <p>Als nächstes werde ich in Japan und Südkorea unterrichten. Die große Nachfrage aus Asien zeigt, dass das BlackBoard-Konzept weltweit auf Interesse stößt. Besonders im asiatischen Raum wird der präventive Aspekt des Fußtrainings sehr geschätzt.</p>

        <h3><strong>Zusammenarbeit mit Dr. Kai Olms</strong></h3>
        <p>Die enge Kooperation mit dem renommierten Fußchirurgen Dr. Kai Olms ermöglicht es mir, modernste medizinische Erkenntnisse direkt in praktische Trainingskonzepte zu übersetzen. Diese Verbindung von Wissenschaft und Praxis macht unsere Arbeit so effektiv.</p>

        <h3><strong>Forschung & Entwicklung</strong></h3>
        <p>Neben meiner praktischen Arbeit bin ich auch in der Forschung tätig. Aktuelle Studien zur Wirksamkeit des BlackBoard-Trainings zeigen signifikante Verbesserungen in Balance, Kraft und Verletzungsprävention.</p>

        <h3><strong>Vision</strong></h3>
        <p>Mein Ziel ist es, das Bewusstsein für die Bedeutung der Fußgesundheit weltweit zu erhöhen und mit dem BlackBoard jedem Menschen ein effektives Trainingstool zur Verfügung zu stellen.</p>
      `
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section - HIDDEN - Adjusted Height to Show Scroll Indicator */}
      <section className="hidden relative min-h-[85vh] md:min-h-[90vh] flex items-center bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #ffed00 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}/>
        </div>

        <div className="max-w-screen-xl mx-auto px-4 lg:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              {/* Trustpilot and Trust Badges */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="inline-flex items-center gap-2 bg-[#ffed00]/20 text-[#ffed00] px-4 py-2 rounded-full">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-semibold">Trusted by 20,000+ Athletes</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-[#ffed00] text-[#ffed00]" />
                    ))}
                  </div>
                  <span className="text-sm text-white">50+ Trustpilot Reviews</span>
                </div>
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
                <button
                  onClick={() => setShowVideoModal(true)}
                  className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-black transition-all"
                  type="button"
                >
                  <PlayCircle className="h-5 w-5" />
                  Watch Demo
                </button>
              </div>

            </div>

            <div className="relative">
              <div className="relative z-10">
                {blackboardProducts[0]?.images[0] ? (
                  <>
                    <Image
                      src={blackboardProducts[0].images[0].src}
                      alt="BlackBoard Training Equipment"
                      width={600}
                      height={600}
                      className="w-full h-auto rounded-2xl shadow-2xl"
                    />
                    {/* Mini Product Link Card */}
                    <Link
                      href={`/product/${blackboardProducts[0].slug}`}
                      className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={blackboardProducts[0].images[0].src}
                            alt={getDisplayName(blackboardProducts[0].name)}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 group-hover:text-[#ffed00] transition-colors">
                            {getDisplayName(blackboardProducts[0].name)}
                          </h3>
                          <ProductPriceDisplay
                            product={blackboardProducts[0]}
                            variations={blackboardWithVariations.find(p => p.id === blackboardProducts[0].id)?.variations}
                            showFrom={true}
                            size="sm"
                            className="text-sm text-gray-600"
                          />
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#ffed00] transition-all group-hover:translate-x-1" />
                      </div>
                    </Link>
                  </>
                ) : (
                  <div className="w-full aspect-square bg-gray-800 rounded-2xl"></div>
                )}
              </div>
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-[#ffed00]/20 blur-3xl rounded-full transform scale-75"></div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator - Clickable */}
        <button
          onClick={() => {
            const nextSection = document.querySelector('section:nth-of-type(2)')
            nextSection?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer hover:scale-110 transition-transform"
          aria-label="Scroll to next section"
        >
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </button>
      </section>

      {/* Hero Section - Best of Both Worlds */}
      <section className="relative min-h-[80vh] md:min-h-[90vh] flex items-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="https://blackboard-training.com/wp-content/uploads/2023/11/blackboard_landing_short_2_mini.mp4" type="video/mp4" />
          </video>
          {/* Dark Overlay for Text Readability - Mobile optimized */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/85 to-black/80 md:bg-gradient-to-r md:from-black/95 md:via-black/75 md:to-black/60"></div>
        </div>

        {/* Animated Dot Pattern Overlay (from original hero) */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #ffed00 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}/>
        </div>

        <div className="max-w-screen-xl mx-auto px-4 lg:px-6 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center py-8 md:py-0">
            {/* Left Column - Text Content from Original Hero */}
            <div className="text-white order-2 lg:order-1">
              {/* Trustpilot and Trust Badges - Mobile optimized */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                <div className="inline-flex items-center gap-2 bg-[#ffed00]/20 text-[#ffed00] px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                  <span className="font-semibold">20,000+ Athletes</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-[#ffed00] text-[#ffed00]" />
                    ))}
                  </div>
                  <span className="text-white hidden sm:inline">50+ Trustpilot Reviews</span>
                  <span className="text-white sm:hidden">5.0 Rating</span>
                </div>
              </div>

              <h1 className="text-5xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
                Transform Your
                <span className="block text-[#ffed00] mt-1 sm:mt-2">Foundation</span>
              </h1>

              <p className="text-base sm:text-xl md:text-2xl text-gray-300 mb-6 sm:mb-8 leading-relaxed">
                Professional foot training equipment designed by experts, proven by science, trusted by champions.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center gap-2 bg-[#ffed00] text-black px-6 py-3 sm:px-8 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-[#ffed00]/90 transform hover:scale-105 transition-all shadow-2xl"
                >
                  Shop Now
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <button
                  onClick={() => setShowVideoModal(true)}
                  type="button"
                  className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-white hover:text-black transition-all"
                >
                  <PlayCircle className="h-5 w-5" />
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Right Column - Floating Product Card from Alternative Hero */}
            <div className="hidden lg:block relative max-w-sm sm:max-w-md mx-auto lg:mx-0 order-1 lg:order-2">
              <div className="relative group">
                {/* Glowing Background */}
                <div className="absolute -inset-4 bg-gradient-to-r from-[#ffed00] to-yellow-300 rounded-3xl opacity-25 blur-2xl group-hover:opacity-50 transition-opacity"></div>

                {/* Product Card */}
                <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-4 sm:p-6 shadow-2xl">
                  {blackboardProducts[0]?.images[0] && (
                    <>
                      {/* Product Image */}
                      <div className="relative mb-3 sm:mb-4 rounded-2xl overflow-hidden">
                        <Image
                          src={blackboardProducts[0].images[0].src}
                          alt="BlackBoard Training Equipment"
                          width={400}
                          height={400}
                          className="w-full h-auto transform group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="space-y-2 sm:space-y-3">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                          {getDisplayName(blackboardProducts[0].name)}
                        </h3>

                        <ProductPriceDisplay
                          product={blackboardProducts[0]}
                          variations={blackboardWithVariations.find(p => p.id === blackboardProducts[0].id)?.variations || []}
                          showFrom={blackboardWithVariations.find(p => p.id === blackboardProducts[0].id)?.variations && blackboardWithVariations.find(p => p.id === blackboardProducts[0].id)?.variations.length > 0}
                          size="md"
                        />

                        {/* Quick Features */}
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700">
                            <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#ffed00] flex-shrink-0" />
                            <span>Free Shipping</span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700">
                            <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#ffed00] flex-shrink-0" />
                            <span className="hidden sm:inline">2-Year Warranty</span>
                            <span className="sm:hidden">Warranty</span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700">
                            <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#ffed00] flex-shrink-0" />
                            <span>Pro Quality</span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700">
                            <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#ffed00] fill-[#ffed00] flex-shrink-0" />
                            <span>5.0 Rating</span>
                          </div>
                        </div>

                        {/* Quick Add Button */}
                        <Link
                          href={`/product/${blackboardProducts[0].slug}`}
                          className="block w-full bg-black text-white text-center py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base hover:bg-gray-900 transition-all transform hover:scale-[1.02] shadow-lg"
                        >
                          View Details
                        </Link>
                      </div>
                    </>
                  )}
                </div>

                {/* Floating Stats with Tilt Effect on Card Hover - Mobile optimized */}
                <div className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 bg-[#ffed00] text-black px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl transform rotate-[-3deg] group-hover:rotate-[-5deg] transition-transform duration-300">
                  <div className="text-2xl sm:text-3xl font-black">20K+</div>
                  <div className="text-[10px] sm:text-xs font-bold uppercase">Happy Athletes</div>
                </div>

                <div className="absolute -top-4 sm:-top-6 -right-4 sm:-right-6 bg-white text-black px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl transform rotate-[3deg] group-hover:rotate-[5deg] transition-transform duration-300">
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-[#ffed00] text-[#ffed00]" />
                    ))}
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold mt-0.5 sm:mt-1">50+ Reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>


      </section>

      {/* Problem/Solution Section - Design A */}
      <section className="py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Your Feet Are Your <span className="text-[#ffed00]">Foundation</span>
                </h2>
                <div className="flex flex-wrap justify-center gap-6 mb-8">
                  <div className="bg-red-50 border-2 border-red-200 px-6 py-3 rounded-full">
                    <span className="text-red-700 font-bold text-lg">77% of adults</span>
                    <span className="text-red-600"> have foot problems</span>
                  </div>
                  <div className="bg-green-50 border-2 border-green-200 px-6 py-3 rounded-full">
                    <span className="text-green-700 font-bold text-lg">10 minutes daily</span>
                    <span className="text-green-600"> to fix them</span>
                  </div>
                </div>
                <p className="text-xl text-gray-600">
                  Scientific studies show that foot dysfunction affects your entire kinetic chain,
                  causing pain and performance issues throughout your body.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-2 md:mb-6">
                {/* Problem with Icons */}
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-8 border-2 border-red-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-red-700">The Hidden Problem</div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-red-200 rounded-lg flex items-center justify-center mt-0.5">
                        <Activity className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">Chronic Pain Chain</span>
                        <p className="text-sm text-gray-600 mt-1">Feet → Knees → Hips → Back progression</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-red-200 rounded-lg flex items-center justify-center mt-0.5">
                        <TrendingUp className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">Declining Performance</span>
                        <p className="text-sm text-gray-600 mt-1">Reduced balance, power & agility</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-red-200 rounded-lg flex items-center justify-center mt-0.5">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">Injury Risk</span>
                        <p className="text-sm text-gray-600 mt-1">3x higher chance of sports injuries</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Solution with Icons */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border-2 border-green-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-green-700">The BlackBoard Solution</div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-200 rounded-lg flex items-center justify-center mt-0.5">
                        <Zap className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">Instant Activation</span>
                        <p className="text-sm text-gray-600 mt-1">Wake up 26 dormant foot muscles</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-200 rounded-lg flex items-center justify-center mt-0.5">
                        <Shield className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">Pain Prevention</span>
                        <p className="text-sm text-gray-600 mt-1">Fix the root cause, not symptoms</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-200 rounded-lg flex items-center justify-center mt-0.5">
                        <Brain className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">Neural Enhancement</span>
                        <p className="text-sm text-gray-600 mt-1">Improved proprioception & control</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
        </div>
      </section>

      {/* Featured BlackBoard Products - Beautiful Cards */}
      {blackboardWithVariations.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
              <div className="text-center mb-10 md:mb-16">
              <div className="inline-flex items-center gap-2 bg-[#ffed00]/10 text-[#ffed00] px-4 py-2 rounded-full mb-4">
                <Award className="h-4 w-4" />
                <span className="text-sm font-semibold uppercase tracking-wider">Choose Your Equipment</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">BlackBoard Training Sets</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Professional-grade equipment trusted by over 20,000 athletes, therapists, and trainers worldwide
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {blackboardWithVariations.map((product: any) => (
                <ProductCard key={product.id} product={product} getDisplayName={getDisplayName} />
              ))}
            </div>

            {/* View All Products Button */}
            <div className="text-center mt-12">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition-all"
              >
                View All Products
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Training Center Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #ffed00 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }}/>
        </div>

        <div className="max-w-screen-xl mx-auto px-4 lg:px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div>
                <div className="inline-flex items-center gap-2 bg-[#ffed00]/20 text-[#ffed00] px-4 py-2 rounded-full mb-6">
                  <Lock className="h-4 w-4" />
                  <span className="text-sm font-semibold uppercase tracking-wider">Exclusive for Customers</span>
                </div>

                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  The BlackBoard
                  <span className="block text-[#ffed00]">Training Center</span>
                </h2>

                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  In our Training Center, you&apos;ll find guides and videos from instructors and experts to help you achieve maximum training results.
                </p>

                {/* Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#ffed00]/20 rounded-lg flex items-center justify-center">
                      <VideoIcon className="h-5 w-5 text-[#ffed00]" />
                    </div>
                    <div>
                      <p className="font-semibold">Video Tutorials</p>
                      <p className="text-sm text-gray-400">Step-by-step guides</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#ffed00]/20 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-[#ffed00]" />
                    </div>
                    <div>
                      <p className="font-semibold">Training Plans</p>
                      <p className="text-sm text-gray-400">Structured programs</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#ffed00]/20 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-[#ffed00]" />
                    </div>
                    <div>
                      <p className="font-semibold">Expert Instructors</p>
                      <p className="text-sm text-gray-400">Learn from the best</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#ffed00]/20 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-[#ffed00]" />
                    </div>
                    <div>
                      <p className="font-semibold">PDF Guides</p>
                      <p className="text-sm text-gray-400">Downloadable resources</p>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <Link
                  href="/training-center"
                  className="inline-flex items-center gap-3 bg-[#ffed00] text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-[#ffed00]/90 transform hover:scale-105 transition-all shadow-xl"
                >
                  <PlayCircle className="h-6 w-6" />
                  Go to Training Center
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>

              {/* Visual Side */}
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  {/* Video Cards */}
                  {videos.length > 0 ? (
                    videos.map((video) => {
                      const thumbnail = getVideoThumbnail(video)
                      const duration = video.acf?.duration || ''
                      const decodedTitle = decodeHtmlEntities(video.title.rendered)
                      return (
                        <Link
                          key={video.id}
                          href="/training-videos"
                          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 hover:bg-gray-800/70 transition-all cursor-pointer group"
                        >
                          <div className="aspect-video bg-gray-700 rounded-lg mb-3 relative overflow-hidden">
                            {thumbnail && thumbnail !== '/placeholder-video.jpg' ? (
                              <Image
                                src={thumbnail}
                                alt={decodedTitle}
                                fill
                                className="object-cover"
                              />
                            ) : null}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                              <div className="w-12 h-12 bg-[#ffed00] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <PlayCircle className="h-6 w-6 text-black" strokeWidth={2} />
                              </div>
                            </div>
                          </div>
                          <p className="text-sm font-semibold truncate">{decodedTitle}</p>
                          {duration && <p className="text-xs text-gray-400">{duration}</p>}
                        </Link>
                      )
                    })
                  ) : (
                    // Fallback placeholders if no videos
                    <>
                      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 hover:bg-gray-800/70 transition-all cursor-pointer group">
                        <div className="aspect-video bg-gray-700 rounded-lg mb-3 relative overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 bg-[#ffed00] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                              <PlayCircle className="h-6 w-6 text-black ml-0.5" />
                            </div>
                          </div>
                        </div>
                        <p className="text-sm font-semibold">Getting Started</p>
                        <p className="text-xs text-gray-400">5 min</p>
                      </div>
                      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 hover:bg-gray-800/70 transition-all cursor-pointer group">
                        <div className="aspect-video bg-gray-700 rounded-lg mb-3 relative overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 bg-[#ffed00] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                              <PlayCircle className="h-6 w-6 text-black ml-0.5" />
                            </div>
                          </div>
                        </div>
                        <p className="text-sm font-semibold">Basic Exercises</p>
                        <p className="text-xs text-gray-400">12 min</p>
                      </div>
                      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 hover:bg-gray-800/70 transition-all cursor-pointer group">
                        <div className="aspect-video bg-gray-700 rounded-lg mb-3 relative overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 bg-[#ffed00] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                              <PlayCircle className="h-6 w-6 text-black ml-0.5" />
                            </div>
                          </div>
                        </div>
                        <p className="text-sm font-semibold">Advanced Training</p>
                        <p className="text-xs text-gray-400">18 min</p>
                      </div>
                      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 hover:bg-gray-800/70 transition-all cursor-pointer group">
                        <div className="aspect-video bg-gray-700 rounded-lg mb-3 relative overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 bg-[#ffed00] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                              <PlayCircle className="h-6 w-6 text-black ml-0.5" />
                            </div>
                          </div>
                        </div>
                        <p className="text-sm font-semibold">Pro Techniques</p>
                        <p className="text-xs text-gray-400">15 min</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Floating Badge */}
                <div className="absolute -top-4 -right-4 bg-[#ffed00] text-black px-4 py-2 rounded-full font-bold text-sm shadow-xl">
                  {totalVideoCount > 0 ? `${totalVideoCount} Videos` : '100+ Videos'}
                </div>
              </div>
            </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
            {/* Section Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-[#ffed00]/10 text-gray-900 px-4 py-2 rounded-full mb-4">
                <Star className="h-4 w-4 fill-[#ffed00] text-[#ffed00]" />
                <span className="text-sm font-semibold uppercase tracking-wider">Customer Reviews</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                What Our Customers Say
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Real experiences from athletes and professionals using BlackBoard
              </p>
            </div>

            {/* Reviews Grid - Real Customer Reviews */}
            <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">
              {reviews.length > 0 ? (
                reviews.map((review) => {
                  const rating = getTestimonialRating(review)
                  const reviewerName = getTestimonialReviewerName(review)
                  const jobPosition = getTestimonialJobPosition(review)
                  const reviewText = getTestimonialText(review)
                  const imageUrl = getTestimonialImage(review)

                  return (
                    <div key={review.id} className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-[#ffed00] transition-all shadow-sm hover:shadow-lg">
                      {/* Star Rating */}
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < rating ? 'fill-[#ffed00] text-[#ffed00]' : 'fill-gray-300 text-gray-300'}`}
                          />
                        ))}
                      </div>

                      {/* Review Text */}
                      {reviewText && (
                        <p className="text-sm text-gray-700 mb-5 line-clamp-4 leading-relaxed">
                          &ldquo;{reviewText}&rdquo;
                        </p>
                      )}

                      {/* Reviewer Info with Avatar */}
                      <div className="mt-auto pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                            <Image
                              src={imageUrl}
                              alt={reviewerName}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{reviewerName}</p>
                            <p className="text-xs text-gray-600 mt-0.5">{jobPosition}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                // Fallback placeholder if no reviews
                [...Array(5)].map((_, index) => (
                  <div key={`placeholder-${index}`} className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-[#ffed00] text-[#ffed00]" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-400 mb-5">Loading testimonial...</p>
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-gray-400">Customer Name</p>
                          <p className="text-xs text-gray-400 mt-0.5">Verified Customer</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-6 flex-wrap justify-center">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-semibold text-gray-700">Verified Reviews</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-semibold text-gray-700">100% Authentic</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-[#ffed00] text-[#ffed00]" />
                  <span className="text-sm font-semibold text-gray-700">4.9/5 Average Rating</span>
                </div>
              </div>
            </div>
        </div>
      </section>

      {/* Team Members Section - WITH NEW HEADING */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
            {/* NEW SECTION HEADING */}
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Your <span className="text-[#ffed00]">Expert Instructors</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Learn from certified professionals with decades of combined experience in sports science, physiotherapy, and performance training
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {instructors.map((instructor, index) => (
                <div key={index} className="bg-gray-900 rounded-2xl overflow-hidden group hover:transform hover:scale-[1.02] transition-all duration-300">
                  <div className="aspect-[4/5] bg-gray-800 relative overflow-hidden">
                    {instructor.image && (
                      <Image
                        src={instructor.image}
                        alt={instructor.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-2">{instructor.name}</h3>
                    <p className="text-[#ffed00] text-sm font-semibold mb-4">{instructor.title}</p>
                    <p className="text-gray-300 text-sm leading-relaxed mb-6">
                      {instructor.shortBio}
                    </p>
                    <button
                      onClick={() => setSelectedInstructor(instructor)}
                      className="bg-white text-black px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#ffed00] transition-colors"
                    >
                      Mehr Infos
                    </button>
                  </div>
                </div>
              ))}
            </div>
        </div>
      </section>

      {/* Modal */}
      {selectedInstructor && (
        <InstructorModal
          isOpen={!!selectedInstructor}
          onClose={() => setSelectedInstructor(null)}
          instructor={{
            name: selectedInstructor.name,
            title: selectedInstructor.title,
            content: selectedInstructor.fullContent
          }}
        />
      )}

      {/* Transformation Results Section - Before/After */}
      <section className="py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Real <span className="text-[#ffed00]">Transformations</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                See what happens when you commit to just 10 minutes a day with BlackBoard
              </p>
            </div>

            {/* Before/After Comparison */}
            <div className="grid lg:grid-cols-2 gap-8 mb-16">
              {/* Before */}
              <div className="relative">
                <div className="absolute -top-3 left-6 bg-red-500 text-white px-4 py-1 rounded-full text-sm font-bold z-10">
                  BEFORE BLACKBOARD
                </div>
                <div className="bg-gradient-to-br from-red-50 via-white to-red-50 rounded-2xl p-8 pt-12 shadow-xl border-2 border-red-100">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-3xl">😫</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Daily Pain</h4>
                        <p className="text-sm text-gray-600">Constant discomfort in feet, knees, and back</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-3xl">🦴</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Weak Structure</h4>
                        <p className="text-sm text-gray-600">Collapsed arches, pronation issues</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-3xl">⚠️</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">High Injury Risk</h4>
                        <p className="text-sm text-gray-600">Frequent sprains and overuse injuries</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-3xl">📉</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Limited Performance</h4>
                        <p className="text-sm text-gray-600">Can&apos;t reach athletic potential</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* After */}
              <div className="relative">
                <div className="absolute -top-3 left-6 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold z-10">
                  AFTER 4 WEEKS
                </div>
                <div className="bg-gradient-to-br from-green-50 via-white to-green-50 rounded-2xl p-8 pt-12 shadow-xl border-2 border-green-100">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-3xl">💪</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Pain-Free Movement</h4>
                        <p className="text-sm text-gray-600">Eliminated chronic pain patterns</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-3xl">🏗️</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Strong Foundation</h4>
                        <p className="text-sm text-gray-600">Restored arch, perfect alignment</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-3xl">🛡️</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Injury Prevention</h4>
                        <p className="text-sm text-gray-600">70% reduction in injury risk</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-3xl">🚀</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Peak Performance</h4>
                        <p className="text-sm text-gray-600">Improved speed, power & agility</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scientific Evidence */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Backed by Science</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#ffed00] mb-2">89%</div>
                  <p className="text-sm text-gray-600">Pain reduction after 4 weeks</p>
                  <p className="text-xs text-gray-500 mt-1">University of Cologne Study 2023</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#ffed00] mb-2">2.3x</div>
                  <p className="text-sm text-gray-600">Increase in foot muscle strength</p>
                  <p className="text-xs text-gray-500 mt-1">Sports Medicine Journal 2024</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#ffed00] mb-2">67%</div>
                  <p className="text-sm text-gray-600">Better balance & stability</p>
                  <p className="text-xs text-gray-500 mt-1">German Sports University 2023</p>
                </div>
              </div>
            </div>
        </div>
      </section>

      {/* Professional Athletes Section */}
      <section className="py-16 bg-gradient-to-r from-gray-900 via-black to-gray-900">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
            {/* Section Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-[#ffed00]/20 text-[#ffed00] px-4 py-2 rounded-full mb-4">
                <Trophy className="h-4 w-4" />
                <span className="text-sm font-semibold uppercase tracking-wider">Elite Performance</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Trusted by <span className="text-[#ffed00]">World-Class Athletes</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Professional athletes from every major sport rely on BlackBoard for peak performance
              </p>
            </div>

            {/* Athletes Grid - Compact Design */}
            <div className="relative">
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max md:grid md:grid-cols-4 lg:grid-cols-6 md:gap-3 md:min-w-0">
                  {/* Athletes List */}
                  {[
                    { name: "Timo Werner", sport: "Football", team: "RB Leipzig" },
                    { name: "Marcel Halstenberg", sport: "Football", team: "RB Leipzig" },
                    { name: "Yussuf Poulsen", sport: "Football", team: "RB Leipzig" },
                    { name: "Konrad Laimer", sport: "Football", team: "RB Leipzig" },
                    { name: "Kevin Kampl", sport: "Football", team: "RB Leipzig" },
                    { name: "Dimitrij Ovtcharov", sport: "Table Tennis", team: "Olympic Medalist" },
                    { name: "Galen Rupp", sport: "Athletics", team: "Olympic Marathoner" },
                    { name: "Malaika Mihambo", sport: "Long Jump", team: "World Champion" },
                    { name: "Julian Reus", sport: "Sprint", team: "German Record Holder" },
                    { name: "Maximilian Levy", sport: "Cycling", team: "Olympic Medalist" },
                    { name: "Patrick Hausding", sport: "Diving", team: "Olympic Medalist" },
                    { name: "Fabian Hambüchen", sport: "Gymnastics", team: "Olympic Champion" }
                  ].map((athlete, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-48 md:w-auto bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 hover:bg-gray-800/70 transition-all group"
                    >
                      {/* Avatar Placeholder */}
                      <div className="w-12 h-12 bg-gradient-to-br from-[#ffed00] to-yellow-600 rounded-full mx-auto mb-3 flex items-center justify-center text-black font-bold text-lg">
                        {athlete.name.split(' ').map(n => n[0]).join('')}
                      </div>

                      {/* Athlete Info */}
                      <div className="text-center">
                        <h3 className="text-white font-semibold text-sm group-hover:text-[#ffed00] transition-colors">
                          {athlete.name}
                        </h3>
                        <p className="text-gray-500 text-xs mt-1">{athlete.sport}</p>
                        <p className="text-[#ffed00] text-xs mt-0.5 opacity-80">{athlete.team}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scroll Indicator for Mobile */}
              <div className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-black to-transparent w-8 h-full pointer-events-none flex items-center justify-end pr-2">
                <ChevronRight className="h-5 w-5 text-white animate-pulse" />
              </div>
            </div>
        </div>
      </section>

      {/* Guarantee Section */}
        {/*
      <section className="py-20 bg-gradient-to-br from-[#ffed00] to-yellow-500">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <div className="text-center">
            <Shield className="h-20 w-20 mx-auto mb-6 text-black" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">
              30-Day Money Back Guarantee
            </h2>
            <p className="text-xl text-black/80 mb-8">
              We&apos;re so confident you&apos;ll love your BlackBoard that we offer a full refund
              if you&apos;re not completely satisfied. No questions asked.
            </p>
            <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition-all shadow-xl"
            >
              Start Your Transformation
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
*/}

      {/* Video Modal */}
      {showVideoModal && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setShowVideoModal(false)}
        >
          <button
            onClick={() => setShowVideoModal(false)}
            className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
            aria-label="Close video"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div
            className="relative w-full max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative pt-[56.25%] bg-black rounded-xl overflow-hidden">
              <video
                className="absolute inset-0 w-full h-full"
                controls
                autoPlay
                playsInline
                src="https://blackboard-training.com/wp-content/uploads/2023/11/bb_image_en-lores.mp4"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}