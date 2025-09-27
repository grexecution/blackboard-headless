'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ShoppingCart, User, Menu, X, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { totalItems, openCart } = useCart()
  const { openLoginModal } = useAuth()
  const { data: session } = useSession()
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/training-videos', label: 'Training Videos' },
    {
      href: '#',
      label: 'Education',
      submenu: [
        { href: '/procoach', label: 'ProCoach' },
        { href: '/workshops', label: 'Workshops' }
      ]
    },
    { href: '/about', label: 'About' }
  ]

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white'
      }`}>
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-2xl md:text-3xl font-black tracking-tight"
              >
                <span className="text-black">Black</span>
                <span className="text-[#ffed00] relative">
                  Board
                  <span className="absolute -bottom-1 left-0 right-0 h-1 bg-[#ffed00] rounded-full"></span>
                </span>
              </motion.div>
            </Link>

            {/* Desktop Menu - Center */}
            <div className="hidden lg:flex items-center space-x-1 xl:absolute xl:left-1/2 xl:transform xl:-translate-x-1/2">
              {navLinks.map((link) => {
                if (link.submenu) {
                  const isActive = link.submenu.some(sub => pathname === sub.href)
                  return (
                    <div key={link.label} className="relative">
                      <button
                        onClick={() => setEducationDropdownOpen(!educationDropdownOpen)}
                        onMouseEnter={() => setEducationDropdownOpen(true)}
                        onMouseLeave={() => setEducationDropdownOpen(false)}
                        className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-[#ffed00] text-black'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {link.label}
                        <ChevronDown className={`h-4 w-4 transition-transform ${educationDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {educationDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            onMouseEnter={() => setEducationDropdownOpen(true)}
                            onMouseLeave={() => setEducationDropdownOpen(false)}
                            className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
                          >
                            {link.submenu.map((sublink) => {
                              const isSubActive = pathname === sublink.href
                              return (
                                <Link
                                  key={sublink.href}
                                  href={sublink.href}
                                  className={`block px-4 py-3 font-medium transition-all duration-200 ${
                                    isSubActive
                                      ? 'bg-[#ffed00] text-black'
                                      : 'text-gray-700 hover:bg-gray-100'
                                  }`}
                                >
                                  {sublink.label}
                                </Link>
                              )
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                } else {
                  const isActive = pathname === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-[#ffed00] text-black'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
                }
              })}
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-2">
              {/* Cart - Desktop */}
              <button 
                onClick={openCart} 
                className="hidden md:flex relative p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ShoppingCart className="h-6 w-6 text-gray-700" />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 bg-[#ffed00] text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </button>

              {/* Profile/Login - Desktop */}
              {session ? (
                <Link href="/account" className="hidden md:flex p-3 rounded-lg hover:bg-gray-100 transition-colors">
                  <User className="h-6 w-6 text-gray-700" />
                </Link>
              ) : (
                <button 
                  onClick={() => openLoginModal()}
                  className="hidden md:flex p-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <User className="h-6 w-6 text-gray-700" />
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6 text-gray-700" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Full Screen Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              
              {/* Menu Panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-2xl lg:hidden overflow-y-auto"
              >
                <div className="p-6">
                  {/* Close Button */}
                  <div className="flex justify-end mb-8">
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  
                  {/* Mobile Links */}
                  <div className="space-y-2">
                    {navLinks.map((link) => {
                      if (link.submenu) {
                        return (
                          <div key={link.label}>
                            <div className="px-4 py-2 font-semibold text-gray-900">
                              {link.label}
                            </div>
                            <div className="ml-4 space-y-1">
                              {link.submenu.map((sublink) => {
                                const isActive = pathname === sublink.href
                                return (
                                  <Link
                                    key={sublink.href}
                                    href={sublink.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-4 py-2 rounded-lg font-medium transition-all ${
                                      isActive
                                        ? 'bg-[#ffed00] text-black'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                  >
                                    {sublink.label}
                                  </Link>
                                )
                              })}
                            </div>
                          </div>
                        )
                      } else {
                        const isActive = pathname === link.href
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`block px-4 py-3 rounded-lg font-medium transition-all ${
                              isActive
                                ? 'bg-[#ffed00] text-black'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {link.label}
                          </Link>
                        )
                      }
                    })}
                  </div>
                  
                  {/* Mobile Account Links */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    {session ? (
                      <Link
                        href="/account"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <User className="h-5 w-5" />
                        <span className="font-medium">My Account</span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false)
                          openLoginModal()
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                      >
                        <User className="h-5 w-5" />
                        <span className="font-medium">Sign In</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
      
      {/* Spacer for fixed navbar */}
      <div className="h-20"></div>
    </>
  )
}