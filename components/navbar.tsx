'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ShoppingCart, User, Menu, X, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { useCurrency } from '@/lib/currency-context'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Avatar } from '@/components/ui/avatar'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false)
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { totalItems, openCart } = useCart()
  const { openLoginModal } = useAuth()
  const { currency, setCurrency } = useCurrency()
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
        { href: '/courses', label: 'All Courses' },
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
                        className={`inline-flex items-center gap-1 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
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
                      className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
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
              {/* Currency Toggle - Desktop */}
              <div className="hidden md:flex items-center bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setCurrency('EUR')}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    currency === 'EUR'
                      ? 'bg-[#ffed00] text-black shadow-md'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  EUR €
                </button>
                <button
                  onClick={() => setCurrency('USD')}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    currency === 'USD'
                      ? 'bg-[#ffed00] text-black shadow-md'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  USD $
                </button>
              </div>

              {/* Currency Dropdown - Mobile */}
              <div className="relative md:hidden">
                <button
                  onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                  className="p-2 px-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-1"
                >
                  <span className="text-sm font-semibold text-gray-700">
                    {currency === 'EUR' ? '€' : '$'}
                  </span>
                  <ChevronDown className="h-3 w-3 text-gray-600" />
                </button>

                <AnimatePresence>
                  {currencyDropdownOpen && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setCurrencyDropdownOpen(false)}
                      />

                      {/* Dropdown */}
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
                      >
                        <button
                          onClick={() => {
                            setCurrency('EUR')
                            setCurrencyDropdownOpen(false)
                          }}
                          className={`w-full px-4 py-2.5 text-left font-medium transition-all ${
                            currency === 'EUR'
                              ? 'bg-[#ffed00] text-black'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          EUR €
                        </button>
                        <button
                          onClick={() => {
                            setCurrency('USD')
                            setCurrencyDropdownOpen(false)
                          }}
                          className={`w-full px-4 py-2.5 text-left font-medium transition-all ${
                            currency === 'USD'
                              ? 'bg-[#ffed00] text-black'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          USD $
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Cart - Desktop & Mobile */}
              <motion.button
                onClick={openCart}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-3 rounded-full hover:bg-[#ffed00]/10 hover:shadow-lg hover:shadow-[#ffed00]/20 transition-all duration-300"
              >
                <ShoppingCart className="h-6 w-6 text-gray-700" />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 bg-[#ffed00] text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </motion.button>

              {/* Profile/Login - Desktop */}
              {session ? (
                <Link href="/account" className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#ffed00]/10 transition-all duration-300 hover:scale-110">
                  <Avatar name={session.user?.firstName || session.user?.name} size="sm" />
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

        {/* Mobile Menu - Dropdown Below Navbar */}
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-20"></div>

      {/* Mobile Menu Backdrop & Dropdown - Outside nav for proper positioning */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden z-40"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed top-20 left-0 right-0 lg:hidden z-50 mt-2"
            >
                <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
                  <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                    <div className="p-4">
                      {/* Mobile Links */}
                      <div className="space-y-1">
                        {navLinks.map((link) => {
                          if (link.submenu) {
                            return (
                              <div key={link.label} className="space-y-1">
                                <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                  {link.label}
                                </div>
                                {link.submenu.map((sublink) => {
                                  const isActive = pathname === sublink.href
                                  return (
                                    <Link
                                      key={sublink.href}
                                      href={sublink.href}
                                      onClick={() => setMobileMenuOpen(false)}
                                      className={`block px-4 py-2.5 rounded-full font-medium transition-all ${
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
                            )
                          } else {
                            const isActive = pathname === link.href
                            return (
                              <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block px-4 py-2.5 rounded-full font-medium transition-all ${
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

                      {/* Mobile Account Link */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        {session ? (
                          <Link
                            href="/account"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-700 font-medium"
                          >
                            <Avatar name={session.user?.firstName || session.user?.name} size="sm" />
                            <span>{session.user?.firstName || session.user?.name || 'My Account'}</span>
                          </Link>
                        ) : (
                          <button
                            onClick={() => {
                              setMobileMenuOpen(false)
                              openLoginModal()
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full hover:bg-gray-100 transition-colors text-left text-gray-700 font-medium"
                          >
                            <User className="h-5 w-5" />
                            <span>Sign In</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
    </>
  )
}