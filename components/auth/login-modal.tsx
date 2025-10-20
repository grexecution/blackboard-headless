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
          // Only navigate if not on checkout page (checkout preserves data)
          if (redirectTo !== '/checkout') {
            router.push(redirectTo)
          } else {
            // On checkout, just refresh to update session
            router.refresh()
          }
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
            <div className="bg-white md:rounded-2xl shadow-2xl w-full h-full max-w-6xl max-h-[100vh] md:max-h-[60vh] overflow-auto">
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
                <div className="p-8 lg:p-12 relative flex flex-col justify-center">
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