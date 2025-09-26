'use client'

import Link from 'next/link'
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Shield, Truck, CreditCard, Award } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    shop: [
      { label: 'All Products', href: '/shop' },
      { label: 'BlackBoard Basic', href: '/product/blackboard-basic' },
      { label: 'BlackBoard Professional', href: '/product/blackboard-professional' },
      { label: 'Accessories', href: '/shop#accessories' },
    ],
    learn: [
      { label: 'ProCoach Certification', href: '/procoach' },
      { label: 'Workshops', href: '/workshops' },
      { label: 'Training Videos', href: '/training-videos' },
      { label: 'Blog', href: '/blog' },
    ],
    support: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'Shipping & Returns', href: '/shipping' },
      { label: 'Size Guide', href: '/size-guide' },
      { label: 'FAQ', href: '/faq' },
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Our Story', href: '/our-story' },
      { label: 'Partners', href: '/partners' },
      { label: 'Careers', href: '/careers' },
    ],
  }

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/blackboardtraining', label: 'Facebook' },
    { icon: Instagram, href: 'https://instagram.com/blackboardtraining', label: 'Instagram' },
    { icon: Youtube, href: 'https://youtube.com/blackboardtraining', label: 'YouTube' },
  ]

  const trustBadges = [
    { icon: Shield, text: '30-Day Guarantee' },
    { icon: Truck, text: 'Free Shipping €100+' },
    { icon: CreditCard, text: 'Secure Payment' },
    { icon: Award, text: 'Premium Quality' },
  ]

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white mb-16 md:mb-0">
      {/* Trust Badges Section */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustBadges.map((badge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <badge.icon className="h-8 w-8 text-[#ffed00] mb-2" />
                <span className="text-sm font-medium">{badge.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Section - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-3xl font-black tracking-tight"
              >
                <span className="text-white">Black</span>
                <span className="text-[#ffed00]">Board</span>
              </motion.div>
            </Link>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              Professional foot training equipment designed by experts, 
              proven by science, trusted by 20,000+ athletes worldwide.
            </p>
            
            {/* Newsletter Signup - Mobile Friendly */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold mb-3">Get 10% off your first order</h4>
              <form className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:border-[#ffed00] transition-colors"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#ffed00] text-black rounded-lg font-semibold text-sm hover:bg-[#ffed00]/90 transition-colors whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#ffed00] hover:text-black transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-[#ffed00]">Shop</h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Learn Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-[#ffed00]">Learn</h3>
            <ul className="space-y-2">
              {footerLinks.learn.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-[#ffed00]">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-[#ffed00]">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Information - Mobile Optimized */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-[#ffed00] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold mb-1">Headquarters</p>
                <p className="text-xs text-gray-400">
                  BlackBoard Training GmbH<br />
                  Musterstraße 123<br />
                  12345 Berlin, Germany
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-[#ffed00] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold mb-1">Phone</p>
                <div className="text-xs text-gray-400">
                  <span suppressHydrationWarning>+49 (0) 30 123456</span>
                  <br />
                  <span>Mon-Fri: 9:00-18:00 CET</span>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-[#ffed00] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold mb-1">Email</p>
                <div className="text-xs text-gray-400">
                  <span suppressHydrationWarning>support@blackboard-training.com</span>
                  <br />
                  <span suppressHydrationWarning>info@blackboard-training.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Mobile Optimized */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xs text-gray-400 text-center md:text-left">
              © {currentYear} BlackBoard Training. All rights reserved.
            </div>
            
            {/* Legal Links - Mobile Friendly */}
            <div className="flex flex-wrap justify-center gap-4 text-xs">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <span className="text-gray-600">•</span>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms & Conditions
              </Link>
              <span className="text-gray-600">•</span>
              <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </Link>
              <span className="text-gray-600">•</span>
              <Link href="/imprint" className="text-gray-400 hover:text-white transition-colors">
                Imprint
              </Link>
            </div>

            {/* Payment Methods - Mobile Optimized */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 mr-2">We accept:</span>
              <div className="flex gap-2">
                <div className="h-6 w-9 bg-gray-800 rounded flex items-center justify-center text-[8px] font-bold text-gray-400">VISA</div>
                <div className="h-6 w-9 bg-gray-800 rounded flex items-center justify-center text-[8px] font-bold text-gray-400">MC</div>
                <div className="h-6 w-9 bg-gray-800 rounded flex items-center justify-center text-[8px] font-bold text-gray-400">AMEX</div>
                <div className="h-6 w-12 bg-gray-800 rounded flex items-center justify-center text-[8px] font-bold text-gray-400">PayPal</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}