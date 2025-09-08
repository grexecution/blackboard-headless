'use client'

import { useCart } from '@/lib/cart-context'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ShoppingCart, CreditCard, User, MapPin, ArrowLeft, Package, Truck, CheckCircle, AlertCircle, Mail, Lock, Eye, EyeOff, Info } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface CheckoutConfig {
  paymentMethods: Array<{
    id: string
    title: string
    description?: string
    enabled: boolean
  }>
  shippingMethods: Array<{
    id: string
    title: string
    cost: string
  }>
  needsShipping: boolean
  needsPayment: boolean
}

export default function CheckoutPage() {
  const { items, clearCart, totalPrice } = useCart()
  const { data: session } = useSession()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [checkoutConfig, setCheckoutConfig] = useState<CheckoutConfig | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('stripe')
  const [useShippingAsBilling, setUseShippingAsBilling] = useState(true)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [createAccount, setCreateAccount] = useState(true) // Always true - account creation is mandatory
  const [accountPassword, setAccountPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [emailStatus, setEmailStatus] = useState<'checking' | 'exists' | 'available' | null>(null)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [newCustomerId, setNewCustomerId] = useState<number | null>(null)
  
  const [billingData, setBillingData] = useState({
    firstName: '',
    lastName: '',
    email: session?.user?.email || '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postcode: '',
    country: 'DE',
  })

  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postcode: '',
    country: 'DE',
  })

  const [customerNote, setCustomerNote] = useState('')

  // Fetch checkout configuration
  useEffect(() => {
    fetch('/api/checkout')
      .then(res => res.json())
      .then(data => {
        setCheckoutConfig(data)
        // Set default payment method if available
        if (data.paymentMethods && data.paymentMethods.length > 0) {
          const defaultMethod = data.paymentMethods.find((m: any) => m.enabled) || data.paymentMethods[0]
          setSelectedPaymentMethod(defaultMethod.id)
        }
      })
      .catch(err => console.error('Failed to fetch checkout config:', err))
  }, [])

  // Update email when session changes
  useEffect(() => {
    if (session?.user?.email && !billingData.email) {
      setBillingData(prev => ({ ...prev, email: session.user.email! }))
      setEmailStatus('exists') // User is logged in
    }
  }, [session, billingData.email])

  // Check if email exists when user types
  useEffect(() => {
    const checkEmail = async () => {
      if (!billingData.email || !billingData.email.includes('@')) {
        setEmailStatus(null)
        return
      }

      // Don't check if user is logged in
      if (session?.user?.email === billingData.email) {
        setEmailStatus('exists')
        return
      }

      setCheckingEmail(true)
      try {
        const response = await fetch('/api/auth/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: billingData.email })
        })
        const data = await response.json()
        
        if (data.exists) {
          setEmailStatus('exists')
          setCreateAccount(false)
        } else {
          setEmailStatus('available')
          // Suggest creating account for new users
          if (!session) {
            setCreateAccount(true)
          }
        }
      } catch (error) {
        console.error('Email check failed:', error)
      } finally {
        setCheckingEmail(false)
      }
    }

    const debounceTimer = setTimeout(checkEmail, 500)
    return () => clearTimeout(debounceTimer)
  }, [billingData.email, session])

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setBillingData(prev => ({ ...prev, [name]: value }))
    // Clear validation error for this field
    setValidationErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setShippingData(prev => ({ ...prev, [name]: value }))
    // Clear validation error for this field
    setValidationErrors(prev => ({ ...prev, [`shipping_${name}`]: '' }))
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    // Validate billing fields
    if (!billingData.firstName) errors.firstName = 'First name is required'
    if (!billingData.lastName) errors.lastName = 'Last name is required'
    if (!billingData.email) errors.email = 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingData.email)) errors.email = 'Invalid email address'
    if (!billingData.address1) errors.address1 = 'Address is required'
    if (!billingData.city) errors.city = 'City is required'
    if (!billingData.postcode) errors.postcode = 'Postal code is required'
    
    // Validate shipping fields if not using billing as shipping
    if (!useShippingAsBilling && checkoutConfig?.needsShipping) {
      if (!shippingData.firstName) errors.shipping_firstName = 'First name is required'
      if (!shippingData.lastName) errors.shipping_lastName = 'Last name is required'
      if (!shippingData.address1) errors.shipping_address1 = 'Address is required'
      if (!shippingData.city) errors.shipping_city = 'City is required'
      if (!shippingData.postcode) errors.shipping_postcode = 'Postal code is required'
    }
    
    // Check email status
    if (emailStatus === 'exists' && !session) {
      errors.email = 'This email is already registered. Please login or use a different email.'
    }
    
    // Validate password (account creation is mandatory for new users)
    if (emailStatus === 'available' && !session) {
      if (!accountPassword) errors.password = 'Password is required for account creation'
      if (accountPassword && accountPassword.length < 8) errors.password = 'Password must be at least 8 characters'
      if (!confirmPassword) errors.confirmPassword = 'Please confirm your password'
      if (accountPassword && confirmPassword && accountPassword !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match'
      }
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setError('Please fill in all required fields')
      return
    }
    
    setIsProcessing(true)
    setError('')

    try {
      let customerId = session?.user?.id || newCustomerId || null
      
      // Create account (mandatory for new users)
      if (emailStatus === 'available' && !session) {
        try {
          const registerResponse = await fetch('/api/auth/register-customer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: billingData.email,
              password: accountPassword,
              firstName: billingData.firstName,
              lastName: billingData.lastName,
              billing: billingData,
              shipping: useShippingAsBilling ? billingData : shippingData
            })
          })
          
          const registerData = await registerResponse.json()
          
          if (!registerData.success) {
            throw new Error(registerData.error || 'Failed to create account')
          }
          
          customerId = registerData.customer.id
          setNewCustomerId(registerData.customer.id)
          console.log('Account created successfully for:', registerData.customer.email)
        } catch (err: any) {
          setError('Failed to create account: ' + err.message)
          setIsProcessing(false)
          return
        }
      }
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billing: billingData,
          shipping: useShippingAsBilling ? billingData : shippingData,
          useShippingAsBilling,
          paymentMethod: selectedPaymentMethod,
          customerNote,
          totalPrice,
          customerId: customerId,
          cartItems: items.map(item => ({
            productId: item.productId,
            variationId: item.variationId,
            quantity: item.quantity,
            isFreebie: item.isFreebie || false,
            name: item.name,
            price: item.price,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        console.error('Checkout failed:', data)
        throw new Error(data.error || 'Failed to process checkout')
      }

      // Clear cart after successful order creation
      clearCart()
      
      // Store order details in sessionStorage for the success page
      sessionStorage.setItem('lastOrder', JSON.stringify(data.order))
      
      // Redirect to success page for all payment methods
      // The success page will show appropriate instructions based on payment method
      router.push(`/order-success?order=${data.order.id}&number=${data.order.orderNumber}&method=${data.order.paymentMethod}`)
    } catch (err: any) {
      setError(err.message || 'Failed to process order. Please try again.')
      setIsProcessing(false)
    }
  }

  // Calculate shipping cost
  const shippingCost = totalPrice >= 100 ? 0 : 7.95
  const finalTotal = totalPrice + shippingCost

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-4">Add some products to checkout</p>
          <Link 
            href="/shop"
            className="bg-[#ffed00] text-black px-6 py-3 rounded-md font-semibold hover:bg-yellow-400 transition inline-block"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-12">
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
        <div className="mb-6">
          <Link 
            href="/shop" 
            className="inline-flex items-center text-gray-600 hover:text-black transition"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shop
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Checkout Form */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Billing Information */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <div className="flex items-center mb-4">
                  <User className="h-5 w-5 text-gray-600 mr-2" />
                  <h2 className="text-xl font-semibold">Billing Information</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={billingData.firstName}
                      onChange={handleBillingChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00] ${
                        validationErrors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.firstName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={billingData.lastName}
                      onChange={handleBillingChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00] ${
                        validationErrors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.lastName}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        required
                        value={billingData.email}
                        onChange={handleBillingChange}
                        disabled={!!session}
                        className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00] ${
                          validationErrors.email ? 'border-red-500' : 
                          emailStatus === 'exists' && !session ? 'border-red-500' :
                          emailStatus === 'available' ? 'border-green-500' :
                          'border-gray-300'
                        } ${session ? 'bg-gray-50' : ''}`}
                      />
                      {checkingEmail && (
                        <div className="absolute right-3 top-3">
                          <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-black rounded-full"></div>
                        </div>
                      )}
                      {!checkingEmail && emailStatus === 'exists' && !session && (
                        <div className="absolute right-3 top-3">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        </div>
                      )}
                      {!checkingEmail && emailStatus === 'available' && (
                        <div className="absolute right-3 top-3">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                    </div>
                    {validationErrors.email && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                    )}
                    {emailStatus === 'exists' && !session && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        This email is already registered. 
                        <Link href="/login" className="underline font-medium">Please login</Link>
                        or use a different email.
                      </p>
                    )}
                    {emailStatus === 'available' && !session && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-blue-800">
                              Account creation required
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              An account is required to access training center videos and your purchased video content.
                              Please set a password below.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Password fields for account creation - mandatory */}
                  {emailStatus === 'available' && !session && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={accountPassword}
                            onChange={(e) => {
                              setAccountPassword(e.target.value)
                              setValidationErrors(prev => ({ ...prev, password: '' }))
                            }}
                            className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00] ${
                              validationErrors.password ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Min. 8 characters"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {validationErrors.password && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm Password *
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value)
                            setValidationErrors(prev => ({ ...prev, confirmPassword: '' }))
                          }}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00] ${
                            validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Re-enter password"
                        />
                        {validationErrors.confirmPassword && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>
                        )}
                      </div>
                    </>
                  )}
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={billingData.phone}
                      onChange={handleBillingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00]"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="address1"
                      required
                      value={billingData.address1}
                      onChange={handleBillingChange}
                      placeholder="House number and street name"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00] ${
                        validationErrors.address1 ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.address1 && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.address1}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apartment, suite, etc. (optional)
                    </label>
                    <input
                      type="text"
                      name="address2"
                      value={billingData.address2}
                      onChange={handleBillingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={billingData.city}
                      onChange={handleBillingChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00] ${
                        validationErrors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.city && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.city}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State/Province
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={billingData.state}
                      onChange={handleBillingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="postcode"
                      required
                      value={billingData.postcode}
                      onChange={handleBillingChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00] ${
                        validationErrors.postcode ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.postcode && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.postcode}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <select
                      name="country"
                      required
                      value={billingData.country}
                      onChange={handleBillingChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00]"
                    >
                      <option value="DE">Germany</option>
                      <option value="AT">Austria</option>
                      <option value="CH">Switzerland</option>
                      <option value="FR">France</option>
                      <option value="IT">Italy</option>
                      <option value="ES">Spain</option>
                      <option value="NL">Netherlands</option>
                      <option value="BE">Belgium</option>
                      <option value="GB">United Kingdom</option>
                      <option value="US">United States</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Truck className="h-5 w-5 text-gray-600 mr-2" />
                    <h2 className="text-xl font-semibold">Shipping Address</h2>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={useShippingAsBilling}
                      onChange={(e) => setUseShippingAsBilling(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">Same as billing address</span>
                  </label>
                </div>
                
                {!useShippingAsBilling && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={shippingData.firstName}
                        onChange={handleShippingChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00] ${
                          validationErrors.shipping_firstName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {validationErrors.shipping_firstName && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.shipping_firstName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        value={shippingData.lastName}
                        onChange={handleShippingChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00] ${
                          validationErrors.shipping_lastName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {validationErrors.shipping_lastName && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.shipping_lastName}</p>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="address1"
                        required
                        value={shippingData.address1}
                        onChange={handleShippingChange}
                        placeholder="House number and street name"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00] ${
                          validationErrors.shipping_address1 ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {validationErrors.shipping_address1 && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.shipping_address1}</p>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Apartment, suite, etc. (optional)
                      </label>
                      <input
                        type="text"
                        name="address2"
                        value={shippingData.address2}
                        onChange={handleShippingChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={shippingData.city}
                        onChange={handleShippingChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00] ${
                          validationErrors.shipping_city ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {validationErrors.shipping_city && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.shipping_city}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State/Province
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={shippingData.state}
                        onChange={handleShippingChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00]"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        name="postcode"
                        required
                        value={shippingData.postcode}
                        onChange={handleShippingChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00] ${
                          validationErrors.shipping_postcode ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {validationErrors.shipping_postcode && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.shipping_postcode}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country *
                      </label>
                      <select
                        name="country"
                        required
                        value={shippingData.country}
                        onChange={handleShippingChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00]"
                      >
                        <option value="DE">Germany</option>
                        <option value="AT">Austria</option>
                        <option value="CH">Switzerland</option>
                        <option value="FR">France</option>
                        <option value="IT">Italy</option>
                        <option value="ES">Spain</option>
                        <option value="NL">Netherlands</option>
                        <option value="BE">Belgium</option>
                        <option value="GB">United Kingdom</option>
                        <option value="US">United States</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <div className="flex items-center mb-4">
                  <CreditCard className="h-5 w-5 text-gray-600 mr-2" />
                  <h2 className="text-xl font-semibold">Payment Method</h2>
                </div>
                
                <div className="space-y-3">
                  {/* Stripe */}
                  <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition ${
                    selectedPaymentMethod === 'stripe' ? 'border-[#ffed00] bg-yellow-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="stripe"
                      checked={selectedPaymentMethod === 'stripe'}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium mb-1">Credit/Debit Card (Stripe)</div>
                      <div className="text-sm text-gray-600">Pay securely with your credit or debit card</div>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">Visa</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">Mastercard</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">Amex</span>
                      </div>
                    </div>
                  </label>

                  {/* PayPal */}
                  <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition ${
                    selectedPaymentMethod === 'paypal' ? 'border-[#ffed00] bg-yellow-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={selectedPaymentMethod === 'paypal'}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium mb-1">PayPal</div>
                      <div className="text-sm text-gray-600">Pay with your PayPal account</div>
                      <div className="mt-2">
                        <span className="text-xs bg-[#003087] text-white px-2 py-1 rounded">PayPal</span>
                      </div>
                    </div>
                  </label>

                  {/* Bank Transfer */}
                  <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition ${
                    selectedPaymentMethod === 'bacs' ? 'border-[#ffed00] bg-yellow-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bacs"
                      checked={selectedPaymentMethod === 'bacs'}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium mb-1">Bank Transfer</div>
                      <div className="text-sm text-gray-600">Direct bank transfer (order will be processed after payment confirmation)</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h2 className="text-xl font-semibold mb-4">Order Notes (Optional)</h2>
                <textarea
                  name="customerNote"
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="Notes about your order, e.g. special notes for delivery"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00] h-24"
                />
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                {/* Cart Items */}
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      {/* Product Image */}
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        {item.image && !item.image.includes('placeholder') ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="text-sm font-medium line-clamp-1">
                          {item.name}
                          {item.isFreebie && (
                            <span className="ml-1 text-xs text-green-600 font-normal">(Gift)</span>
                          )}
                        </h3>
                        {item.variation?.attributes && (
                          <p className="text-xs text-gray-500">
                            {item.variation.attributes.map((attr) => attr.value).join(', ')}
                          </p>
                        )}
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                          <span className={`text-sm font-medium ${item.isFreebie ? 'text-green-600' : ''}`}>
                            {item.isFreebie ? 'FREE' : `€${(item.price * item.quantity).toFixed(2)}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4 space-y-2">
                  {/* Subtotal */}
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>€{totalPrice.toFixed(2)}</span>
                  </div>
                  
                  {/* Shipping */}
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? 'Free' : `€${shippingCost.toFixed(2)}`}</span>
                  </div>
                  
                  {/* Free Shipping Message */}
                  {totalPrice < 100 && (
                    <div className="text-xs text-gray-500 py-2">
                      Add €{(100 - totalPrice).toFixed(2)} more for free shipping
                    </div>
                  )}
                  
                  {/* Savings from freebies */}
                  {items.some(item => item.isFreebie) && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Gift Value</span>
                      <span>€49.00</span>
                    </div>
                  )}
                  
                  {/* Total */}
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>€{finalTotal.toFixed(2)}</span>
                  </div>
                  
                  <p className="text-xs text-gray-500 pt-2">
                    Including VAT (19%)
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full mt-6 bg-[#ffed00] text-black py-3 rounded-md font-semibold hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Place Order
                    </>
                  )}
                </button>

                {/* Security Badge */}
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Secure SSL Encrypted Checkout
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}