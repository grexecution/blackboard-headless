'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle, Shield, Award, Zap, CheckCircle, ChevronLeft, Star, Users, Truck } from 'lucide-react'
import { useSession } from 'next-auth/react'

export default function LoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  })

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      router.push('/account')
    }
  }, [session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    if (isLogin) {
      try {
        const { signIn } = await import('next-auth/react')
        const result = await signIn('credentials', {
          username: formData.email,
          password: formData.password,
          redirect: false,
        })
        
        if (result?.ok) {
          router.push('/account')
        } else if (result?.error) {
          if (result.error === '2FA_NOT_SUPPORTED') {
            setError('This system does not support accounts with Two-Factor Authentication (2FA) enabled. Please disable 2FA in your WordPress account settings or use an account without 2FA.')
          } else {
            setError('Invalid username or password. Please try again.')
          }
        }
      } catch (error) {
        console.error('Login error:', error)
        setError('An error occurred during login. Please try again.')
      }
    } else {
      setError('Registration is not yet available. Please use an existing WordPress account.')
    }
    
    setLoading(false)
  }

  const benefits = [
    { icon: Zap, text: 'Track your orders instantly' },
    { icon: Award, text: 'Access exclusive member discounts' },
    { icon: Shield, text: 'Secure checkout process' },
    { icon: CheckCircle, text: 'Save your preferences' }
  ]

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffed00]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors">
              <ChevronLeft className="h-5 w-5" />
              <span>Back to Shop</span>
            </Link>
            <Link href="/" className="text-3xl font-black tracking-tight">
              <span className="text-black">Black</span>
              <span className="text-[#ffed00]">Board</span>
            </Link>
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Benefits */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="hidden lg:block"
            >
              <div className="bg-gradient-to-br from-black via-gray-900 to-black rounded-2xl p-12 text-white h-full">
                <h1 className="text-4xl font-bold mb-6">
                  Welcome to
                  <span className="block text-[#ffed00] mt-2">BlackBoard Training</span>
                </h1>
                <p className="text-xl text-gray-300 mb-12">
                  Join thousands of athletes and professionals who trust BlackBoard for their training equipment.
                </p>

                <div className="space-y-6 mb-12">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      className="flex items-center gap-4"
                    >
                      <div className="w-12 h-12 bg-[#ffed00]/20 rounded-full flex items-center justify-center">
                        <benefit.icon className="h-6 w-6 text-[#ffed00]" />
                      </div>
                      <span className="text-lg text-gray-300">{benefit.text}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Trust Indicators */}
                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-800">
                  <div>
                    <div className="text-3xl font-bold text-[#ffed00]">20K+</div>
                    <div className="text-sm text-gray-400">Happy Customers</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#ffed00]">4.9</div>
                    <div className="text-sm text-gray-400">Average Rating</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#ffed00]">100%</div>
                    <div className="text-sm text-gray-400">Secure</div>
                  </div>
                </div>

                {/* Bottom Trust Badges */}
                <div className="mt-12 pt-8 border-t border-gray-800">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <Shield className="h-8 w-8 mx-auto mb-2 text-[#ffed00]" />
                      <p className="text-xs text-gray-400">30-Day Guarantee</p>
                    </div>
                    <div className="text-center">
                      <Truck className="h-8 w-8 mx-auto mb-2 text-[#ffed00]" />
                      <p className="text-xs text-gray-400">Free Shipping €100+</p>
                    </div>
                    <div className="text-center">
                      <Award className="h-8 w-8 mx-auto mb-2 text-[#ffed00]" />
                      <p className="text-xs text-gray-400">Premium Quality</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 lg:p-10 border border-gray-100">
                {/* Mobile Trust Indicators */}
                <div className="lg:hidden mb-8 pb-8 border-b">
                  <div className="flex justify-around">
                    <div className="text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-[#ffed00]" />
                      <div className="text-lg font-bold">20K+</div>
                      <div className="text-xs text-gray-500">Customers</div>
                    </div>
                    <div className="text-center">
                      <Star className="h-8 w-8 mx-auto mb-2 text-[#ffed00]" />
                      <div className="text-lg font-bold">4.9</div>
                      <div className="text-xs text-gray-500">Rating</div>
                    </div>
                    <div className="text-center">
                      <Shield className="h-8 w-8 mx-auto mb-2 text-[#ffed00]" />
                      <div className="text-lg font-bold">100%</div>
                      <div className="text-xs text-gray-500">Secure</div>
                    </div>
                  </div>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {isLogin ? 'Welcome Back!' : 'Join BlackBoard'}
                  </h2>
                  <p className="text-gray-600">
                    {isLogin ? 'Sign in to access your account' : 'Create your account to get started'}
                  </p>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <AnimatePresence mode="wait">
                    {!isLogin && (
                      <motion.div
                        key="name"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffed00] focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                            required={!isLogin}
                            disabled={loading}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffed00] focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffed00] focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {!isLogin && (
                      <motion.div
                        key="confirm"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffed00] focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                            required={!isLogin}
                            disabled={loading}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {isLogin && (
                    <div className="flex items-center justify-between">
                      <label className="flex items-center cursor-pointer">
                        <input type="checkbox" className="mr-3 w-4 h-4 text-[#ffed00] border-gray-300 rounded focus:ring-[#ffed00]" />
                        <span className="text-sm text-gray-600">Remember me</span>
                      </label>
                      <Link href="/forgot-password" className="text-sm text-gray-900 font-medium hover:text-[#ffed00] transition-colors">
                        Forgot password?
                      </Link>
                    </div>
                  )}

                  <motion.button
                    whileHover={!loading ? { scale: 1.02 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#ffed00] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#ffed00]/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                        />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <>
                        <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">OR</span>
                  </div>
                </div>

                {/* Social Login Options */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    disabled={loading}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Google</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    disabled={loading}
                  >
                    <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Facebook</span>
                  </button>
                </div>

                {/* Toggle Login/Register */}
                <div className="mt-8 text-center">
                  <span className="text-gray-600">
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}
                  </span>
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin)
                      setError('')
                    }}
                    className="ml-2 text-black font-bold hover:text-[#ffed00] transition-colors"
                    disabled={loading}
                  >
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <Award className="h-12 w-12 mx-auto mb-4 text-[#ffed00]" />
                <h3 className="font-bold text-lg mb-2">Professional Equipment</h3>
                <p className="text-sm text-gray-600">Trusted by 20,000+ athletes worldwide</p>
              </div>
              <div>
                <Users className="h-12 w-12 mx-auto mb-4 text-[#ffed00]" />
                <h3 className="font-bold text-lg mb-2">Expert Support</h3>
                <p className="text-sm text-gray-600">Get guidance from certified trainers</p>
              </div>
              <div>
                <Shield className="h-12 w-12 mx-auto mb-4 text-[#ffed00]" />
                <h3 className="font-bold text-lg mb-2">Lifetime Warranty</h3>
                <p className="text-sm text-gray-600">Premium quality guaranteed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}