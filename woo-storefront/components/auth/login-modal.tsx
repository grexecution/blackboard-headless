'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle, X, Shield, Award, Zap, CheckCircle } from 'lucide-react'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  redirectTo?: string
}

export function LoginModal({ isOpen, onClose, redirectTo = '/account' }: LoginModalProps) {
  const router = useRouter()
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

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ email: '', password: '', name: '', confirmPassword: '' })
      setError('')
      setShowPassword(false)
      setIsLogin(true)
    }
  }, [isOpen])

  // Prevent body scroll when modal is open and handle escape key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }
      document.addEventListener('keydown', handleEscape)
      
      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = 'unset'
      }
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

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
          onClose()
          router.push(redirectTo)
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
    { icon: Zap, text: 'Track your orders' },
    { icon: Award, text: 'Member discounts' },
    { icon: Shield, text: 'Secure checkout' },
    { icon: CheckCircle, text: 'Save preferences' }
  ]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 md:inset-4 lg:inset-8 xl:inset-16 2xl:inset-24 z-50 flex items-center justify-center p-4 md:p-0"
          >
            <div className="bg-white md:rounded-2xl shadow-2xl w-full h-full max-w-6xl max-h-[100vh] md:max-h-[90vh] overflow-auto">
              <div className="grid lg:grid-cols-2 h-full">
                {/* Left Side - Benefits */}
                <div className="hidden lg:block bg-gradient-to-br from-black via-gray-900 to-black p-12 md:rounded-l-2xl">
                  <div className="h-full flex flex-col justify-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                      Welcome to
                      <span className="block text-[#ffed00] mt-2">BlackBoard Training</span>
                    </h2>
                    <p className="text-gray-300 mb-8">
                      Join thousands of athletes who trust BlackBoard for their training equipment.
                    </p>

                    <div className="space-y-4 mb-8">
                      {benefits.map((benefit, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <div className="w-10 h-10 bg-[#ffed00]/20 rounded-full flex items-center justify-center">
                            <benefit.icon className="h-5 w-5 text-[#ffed00]" />
                          </div>
                          <span className="text-gray-300">{benefit.text}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Trust Indicators */}
                    <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-800">
                      <div>
                        <div className="text-2xl font-bold text-[#ffed00]">20K+</div>
                        <div className="text-xs text-gray-400">Customers</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-[#ffed00]">4.9</div>
                        <div className="text-xs text-gray-400">Rating</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-[#ffed00]">100%</div>
                        <div className="text-xs text-gray-400">Secure</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Form */}
                <div className="p-8 lg:p-12 relative">
                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
                  >
                    <X className="h-6 w-6" />
                  </button>

                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="text-3xl font-black tracking-tight mb-4">
                      <span className="text-black">Black</span>
                      <span className="text-[#ffed00]">Board</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {isLogin ? 'Welcome Back!' : 'Join BlackBoard'}
                    </h3>
                    <p className="text-gray-600 mt-2">
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
                  <form onSubmit={handleSubmit} className="space-y-4">
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
                              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffed00] focus:border-transparent transition-all"
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
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffed00] focus:border-transparent transition-all"
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
                        className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffed00] focus:border-transparent transition-all"
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
                              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffed00] focus:border-transparent transition-all"
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
                          <input type="checkbox" className="mr-2 w-4 h-4 text-[#ffed00] border-gray-300 rounded focus:ring-[#ffed00]" />
                          <span className="text-sm text-gray-600">Remember me</span>
                        </label>
                        <button type="button" className="text-sm text-gray-900 font-medium hover:text-[#ffed00] transition-colors">
                          Forgot password?
                        </button>
                      </div>
                    )}

                    <motion.button
                      whileHover={!loading ? { scale: 1.02 } : {}}
                      whileTap={!loading ? { scale: 0.98 } : {}}
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#ffed00] text-black py-3 rounded-xl font-bold text-lg hover:bg-[#ffed00]/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">OR</span>
                    </div>
                  </div>

                  {/* Social Login Options */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                      disabled={loading}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span className="font-medium text-gray-700">Google</span>
                    </button>
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                      disabled={loading}
                    >
                      <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span className="font-medium text-gray-700">Facebook</span>
                    </button>
                  </div>

                  {/* Toggle Login/Register */}
                  <div className="mt-6 text-center">
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
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}