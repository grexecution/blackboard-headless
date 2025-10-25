'use client'

import { useCart } from '@/lib/cart-context'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { ShoppingCart, CreditCard, User, MapPin, ArrowLeft, Package, Truck, CheckCircle, AlertCircle, Mail, Lock, Eye, EyeOff, Info, Star, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { LoginModal } from '@/components/auth/login-modal'
import { useCurrency } from '@/lib/currency-context'
import { Country, TaxRate, calculateTax, getNetPrice } from '@/lib/woocommerce/countries-taxes'
import { ShippingZoneWithMethods, findShippingZoneForCountry, calculateCartWeight, calculateShippingCost } from '@/lib/woocommerce/shipping'
import { calculateTotalResellerSavings } from '@/lib/reseller-pricing'
import CountrySelect from '@/components/ui/CountrySelect'
import { Testimonial, getTestimonialImage, getTestimonialReviewerName, getTestimonialRating, getTestimonialText, getTestimonialJobPosition } from '@/lib/woocommerce/testimonials'

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

interface CheckoutClientProps {
  countries: Country[]
  taxRates: TaxRate[]
  shippingZones: ShippingZoneWithMethods[]
  testimonials: Testimonial[]
}

export default function CheckoutClient({ countries, taxRates, shippingZones, testimonials }: CheckoutClientProps) {
  const { getCurrencySymbol, currency } = useCurrency()
  const currencySymbol = getCurrencySymbol()
  const { items, clearCart, totalPrice } = useCart()
  const { data: session } = useSession()
  const isReseller = session?.user?.role === 'reseller'
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState<'creating' | 'payment' | 'redirecting'>('creating')
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
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null)
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [orderSummaryExpanded, setOrderSummaryExpanded] = useState(false)

  // B2B / Company fields
  const [isCompany, setIsCompany] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [vatNumber, setVatNumber] = useState('')
  const [vatValidationStatus, setVatValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid' | 'error'>('idle')
  const [vatValidationMessage, setVatValidationMessage] = useState('')
  const [vatExemptionApplied, setVatExemptionApplied] = useState(false)
  const [validatedVatData, setValidatedVatData] = useState<{
    countryCode: string
    vatNumber: string
    name?: string
    address?: string
  } | null>(null)

  const [billingData, setBillingData] = useState({
    firstName: '',
    lastName: '',
    email: session?.user?.email || '',
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

  // Update email and populate addresses when session changes (after login)
  useEffect(() => {
    if (session?.user?.email) {
      // Update email if empty or different
      if (!billingData.email || billingData.email !== session.user.email) {
        setBillingData(prev => ({ ...prev, email: session.user.email! }))
      }
      // Clear password fields since user is now logged in
      setAccountPassword('')
      setConfirmPassword('')
      setPasswordStrength(null)
      setPasswordMatch(null)
      // Update email status to show user is logged in
      setEmailStatus('exists')
      
      // Use addresses directly from session (already fetched during login)
      const billing = session.user.billing
      const shipping = session.user.shipping
      
      // Only populate if fields are currently empty (don't overwrite user's input)
      if (billing) {
        setBillingData(prev => ({
          firstName: prev.firstName || billing.first_name || session.user.firstName || '',
          lastName: prev.lastName || billing.last_name || session.user.lastName || '',
          email: session.user.email!,
          address1: prev.address1 || billing.address_1 || '',
          address2: prev.address2 || billing.address_2 || '',
          city: prev.city || billing.city || '',
          state: prev.state || billing.state || '',
          postcode: prev.postcode || billing.postcode || '',
          country: prev.country || billing.country || 'DE',
        }))
      } else {
        // If no billing address saved, at least use first/last name from session
        setBillingData(prev => ({
          ...prev,
          firstName: prev.firstName || session.user.firstName || '',
          lastName: prev.lastName || session.user.lastName || '',
          email: session.user.email!,
        }))
      }
      
      // Populate shipping if it exists and fields are empty
      if (shipping && (shipping.address_1 || shipping.city)) {
        setShippingData(prev => ({
          firstName: prev.firstName || shipping.first_name || '',
          lastName: prev.lastName || shipping.last_name || '',
          address1: prev.address1 || shipping.address_1 || '',
          address2: prev.address2 || shipping.address_2 || '',
          city: prev.city || shipping.city || '',
          state: prev.state || shipping.state || '',
          postcode: prev.postcode || shipping.postcode || '',
          country: prev.country || shipping.country || 'DE',
        }))
        // If shipping address exists, uncheck "use billing as shipping"
        if (shipping.address_1 && shipping.city) {
          setUseShippingAsBilling(false)
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

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

  // VAT Validation Effect
  useEffect(() => {
    const validateVAT = async () => {
      // Only validate if:
      // 1. User is a company
      // 2. VAT number is entered
      // 3. Country is selected and is in EU (but not Germany)
      if (!isCompany || !vatNumber || !billingData.country) {
        setVatValidationStatus('idle')
        setVatExemptionApplied(false)
        setValidatedVatData(null)
        return
      }

      // Germany always has VAT
      if (billingData.country === 'DE') {
        setVatValidationStatus('idle')
        setVatExemptionApplied(false)
        setValidatedVatData(null)
        setVatValidationMessage('')
        return
      }

      // EU countries for VAT validation
      const EU_COUNTRIES = [
        'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
        'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL',
        'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
      ]

      // Non-EU countries don't need validation (always VAT exempt for exports)
      if (!EU_COUNTRIES.includes(billingData.country)) {
        setVatValidationStatus('idle')
        setVatExemptionApplied(true) // Export = no VAT
        setValidatedVatData(null)
        setVatValidationMessage('Export delivery - VAT exempt')
        return
      }

      // Validate EU VAT number
      setVatValidationStatus('validating')
      setVatValidationMessage('Validating VAT number...')

      try {
        const response = await fetch('/api/vat/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vatNumber,
            countryCode: billingData.country
          })
        })

        const data = await response.json()

        if (data.valid) {
          setVatValidationStatus('valid')
          setVatExemptionApplied(true)
          setValidatedVatData(data)

          // Show different message for fallback validation
          if (data.fallbackValidation) {
            setVatValidationMessage(`✓ VAT format valid - Tax exemption applied (VIES service unavailable)`)
          } else {
            setVatValidationMessage(`✓ Valid VAT ID - Tax exemption applied${data.name ? ` (${data.name})` : ''}`)
          }
        } else {
          setVatValidationStatus('invalid')
          setVatExemptionApplied(false)
          setValidatedVatData(null)
          setVatValidationMessage(data.error || 'Invalid VAT number - VAT will be charged')
        }
      } catch (error) {
        console.error('VAT validation error:', error)
        setVatValidationStatus('error')
        setVatExemptionApplied(false)
        setValidatedVatData(null)
        setVatValidationMessage('Could not validate VAT number - VAT will be charged')
      }
    }

    const debounceTimer = setTimeout(validateVAT, 800)
    return () => clearTimeout(debounceTimer)
  }, [vatNumber, billingData.country, isCompany])

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

  const checkPasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength(null)
      return
    }
    
    // Check for weak password
    if (password.length < 8) {
      setPasswordStrength('weak')
      return
    }
    
    // Check for strong password (length >= 12, has uppercase, lowercase, number, and special char)
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    const strengthCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length
    
    if (password.length >= 12 && strengthCount >= 3) {
      setPasswordStrength('strong')
    } else if (password.length >= 8 && strengthCount >= 2) {
      setPasswordStrength('medium')
    } else {
      setPasswordStrength('weak')
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setAccountPassword(newPassword)
    checkPasswordStrength(newPassword)
    setValidationErrors(prev => ({ ...prev, password: '' }))
    
    // Check if passwords match
    if (confirmPassword) {
      setPasswordMatch(newPassword === confirmPassword)
    }
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value
    setConfirmPassword(newConfirmPassword)
    setPasswordMatch(accountPassword === newConfirmPassword)
    setValidationErrors(prev => ({ ...prev, confirmPassword: '' }))
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
    
    // Validate shipping fields if not using billing as shipping AND cart has physical products
    if (!useShippingAsBilling && checkoutConfig?.needsShipping && hasPhysicalProducts) {
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
    setProcessingStep('creating')
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
          shippingCost,
          shippingMethodTitle,
          customerId: customerId,
          // B2B / VAT data
          isCompany,
          companyName,
          vatNumber,
          vatExemptionApplied,
          validatedVatData,
          cartItems: items.map(item => ({
            productId: item.productId,
            variationId: item.variationId,
            quantity: item.quantity,
            isFreebie: item.isFreebie || false,
            name: item.name,
            price: item.price,
            reseller_pricing: item.reseller_pricing,
          })),
          resellerDiscount: resellerDiscount,
          isReseller: isReseller,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        console.error('Checkout failed:', data)
        throw new Error(data.error || 'Failed to process checkout')
      }

      // Store order details in sessionStorage for the success page
      sessionStorage.setItem('lastOrder', JSON.stringify(data.order))

      // Handle payment based on method
      if (selectedPaymentMethod === 'stripe' || selectedPaymentMethod === 'klarna') {
        // Create Stripe Checkout Session (supports both card and Klarna)
        console.log(`Creating Stripe checkout session with ${selectedPaymentMethod}...`)
        setProcessingStep('redirecting')

        const stripeResponse = await fetch('/api/create-stripe-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: data.order.id,
            orderNumber: data.order.orderNumber,
            total: data.order.total,
            currency: billingData.country === 'US' ? 'USD' : 'EUR',
            customerEmail: billingData.email,
            paymentMethod: selectedPaymentMethod, // Pass the selected payment method
          }),
        })

        const stripeData = await stripeResponse.json()

        if (!stripeData.success) {
          throw new Error(stripeData.error || 'Failed to create payment session')
        }

        console.log('Redirecting to Stripe Checkout...')
        // Clear cart only right before redirect (prevents flash of empty cart)
        clearCart()
        // Redirect to Stripe's hosted checkout page (keep isProcessing true so modal stays visible)
        window.location.href = stripeData.url
        // Note: No code runs after this line - page navigation begins immediately
        return

      } else if (selectedPaymentMethod === 'paypal') {
        // Create PayPal order
        console.log('Creating PayPal order...')
        setProcessingStep('redirecting')

        const paypalResponse = await fetch('/api/create-paypal-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: data.order.id,
            orderNumber: data.order.orderNumber,
            total: data.order.total,
            currency: billingData.country === 'US' ? 'USD' : 'EUR',
          }),
        })

        const paypalData = await paypalResponse.json()

        if (!paypalData.success) {
          throw new Error(paypalData.error || 'Failed to create PayPal order')
        }

        console.log('Redirecting to PayPal...')
        clearCart()
        window.location.href = paypalData.approveLink
        return

      } else {
        // For bank transfer, go directly to success page
        setProcessingStep('redirecting')
        clearCart()
        router.push(`/order-success?order=${data.order.id}&number=${data.order.orderNumber}&method=${data.order.paymentMethod}`)
        return
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process order. Please try again.')
      setIsProcessing(false)
    }
  }

  // Calculate tax and pricing based on selected country
  // Prices from products are tax-inclusive, so when country changes we need to:
  // 1. Extract the current tax from totalPrice (based on selected country)
  // 2. Calculate net price (price without tax)
  // 3. Keep finalTotal the same (it's the gross/final price including tax)

  const { taxAmount, taxRate } = useMemo(() => {
    // If VAT exemption is applied (valid EU VAT or export), return 0% tax
    if (vatExemptionApplied) {
      return { taxAmount: 0, taxRate: 0 }
    }
    return calculateTax(totalPrice, billingData.country, billingData.state, taxRates)
  }, [totalPrice, billingData.country, billingData.state, taxRates, vatExemptionApplied])

  // Net price (excluding tax) - this is what changes when country changes
  const netPrice = useMemo(() => {
    return getNetPrice(totalPrice, taxRate)
  }, [totalPrice, taxRate])

  // Calculate shipping cost based on country and cart weight
  const { shippingCost, shippingMethodTitle, hasPhysicalProducts } = useMemo(() => {
    // Use shipping address country if different from billing, otherwise use billing
    const destinationCountry = useShippingAsBilling ? billingData.country : shippingData.country

    if (!destinationCountry || shippingZones.length === 0) {
      return { shippingCost: 0, shippingMethodTitle: 'Shipping', hasPhysicalProducts: false }
    }

    // Find the shipping zone for the destination country
    const zone = findShippingZoneForCountry(shippingZones, destinationCountry)

    if (!zone) {
      console.warn(`No shipping zone found for country ${destinationCountry}`)
      return { shippingCost: 0, shippingMethodTitle: 'Shipping', hasPhysicalProducts: false }
    }

    // Calculate cart weight from items
    const cartItems = items.map(item => ({
      id: item.id,
      weight: item.weight,
      quantity: item.quantity
    }))

    const totalWeight = calculateCartWeight(cartItems)

    // If cart has no weight (virtual products only), no shipping needed
    if (totalWeight === 0) {
      return { shippingCost: 0, shippingMethodTitle: 'No Shipping Required', hasPhysicalProducts: false }
    }

    // Calculate shipping cost based on weight and zone
    const result = calculateShippingCost(zone, totalWeight)

    if (!result) {
      console.warn(`No shipping rate found for weight ${totalWeight}kg in zone ${zone.name}`)
      return { shippingCost: 0, shippingMethodTitle: 'Shipping', hasPhysicalProducts: true }
    }

    return { shippingCost: result.cost, shippingMethodTitle: result.methodTitle, hasPhysicalProducts: true }
  }, [billingData.country, shippingData.country, useShippingAsBilling, items, shippingZones])

  // Calculate reseller discount
  const { totalSavings: resellerDiscount } = calculateTotalResellerSavings(items, currency, isReseller)

  // Final total stays the same (gross price including tax)
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
    <>
      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              {/* Animated Icon */}
              <div className="mb-6 relative">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-[#ffed00] mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  {processingStep === 'creating' && <Package className="h-8 w-8 text-gray-400" />}
                  {processingStep === 'payment' && <CreditCard className="h-8 w-8 text-gray-400" />}
                  {processingStep === 'redirecting' && <CheckCircle className="h-8 w-8 text-green-500" />}
                </div>
              </div>

              {/* Processing Steps */}
              <div className="space-y-3 mb-6">
                <div className={`flex items-center justify-center gap-3 transition-all ${processingStep === 'creating' ? 'text-black font-semibold' : 'text-gray-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${processingStep === 'creating' ? 'bg-[#ffed00] animate-pulse' : 'bg-gray-300'}`}></div>
                  <span>Creating your order</span>
                </div>
                <div className={`flex items-center justify-center gap-3 transition-all ${processingStep === 'payment' ? 'text-black font-semibold' : 'text-gray-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${processingStep === 'payment' ? 'bg-[#ffed00] animate-pulse' : 'bg-gray-300'}`}></div>
                  <span>Setting up payment</span>
                </div>
                <div className={`flex items-center justify-center gap-3 transition-all ${processingStep === 'redirecting' ? 'text-black font-semibold' : 'text-gray-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${processingStep === 'redirecting' ? 'bg-[#ffed00] animate-pulse' : 'bg-gray-300'}`}></div>
                  <span>Redirecting to payment</span>
                </div>
              </div>

              {/* Message */}
              <p className="text-gray-600 text-sm">
                {processingStep === 'creating' && 'Please wait while we create your order...'}
                {processingStep === 'payment' && 'Preparing secure payment...'}
                {processingStep === 'redirecting' && 'Taking you to complete payment...'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 py-6 md:py-12">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
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
              {/* Collapsible Order Summary - Mobile Only */}
              <div className="lg:hidden bg-white rounded-lg shadow-sm border border-gray-200">
                <button
                  type="button"
                  onClick={() => setOrderSummaryExpanded(!orderSummaryExpanded)}
                  className="w-full px-4 py-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-gray-600" />
                    <span className="font-semibold">
                      Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">{currencySymbol}{finalTotal.toFixed(2)}</span>
                    {orderSummaryExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                </button>

                {orderSummaryExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-200">
                    {/* Cart Items */}
                    <div className="space-y-3 mt-4 mb-4">
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
                            </h3>
                            {item.isFreebie && (
                              <p className="text-xs text-green-600 font-semibold">(Gift)</p>
                            )}
                            {item.variation?.attributes && (
                              <p className="text-xs text-gray-500">
                                {item.variation.attributes.map((attr) => attr.value).join(', ')}
                              </p>
                            )}
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                              <span className={`text-sm font-medium ${item.isFreebie ? 'text-green-600' : ''}`}>
                                {item.isFreebie ? 'FREE' : `${currencySymbol}${(item.price * item.quantity).toFixed(2)}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Price Breakdown */}
                    <div className="border-t pt-4 space-y-2">
                      {/* Subtotal (Net Price - without tax) */}
                      <div className="flex justify-between text-sm">
                        <span>Subtotal (excl. tax)</span>
                        <span>{currencySymbol}{netPrice.toFixed(2)}</span>
                      </div>

                      {/* Reseller Discount */}
                      {resellerDiscount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Reseller Discount</span>
                          <span>-{currencySymbol}{resellerDiscount.toFixed(2)}</span>
                        </div>
                      )}

                      {/* Tax */}
                      {taxRate > 0 ? (
                        <div className="flex justify-between text-sm">
                          <span>Tax ({taxRate.toFixed(0)}%)</span>
                          <span>{currencySymbol}{taxAmount.toFixed(2)}</span>
                        </div>
                      ) : vatExemptionApplied ? (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>VAT (0% - {validatedVatData ? 'EU Reverse Charge' : 'Export'})</span>
                          <span>{currencySymbol}0.00</span>
                        </div>
                      ) : null}

                      {/* Shipping - only show if cart has physical products */}
                      {hasPhysicalProducts && (
                        <div className="flex justify-between text-sm">
                          <span>{shippingMethodTitle}</span>
                          <span>{shippingCost === 0 ? 'Free' : `${currencySymbol}${shippingCost.toFixed(2)}`}</span>
                        </div>
                      )}

                      {/* Total */}
                      <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                        <span>Total</span>
                        <span>{currencySymbol}{finalTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Billing Information */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <div className="flex items-center mb-4">
                  <User className="h-5 w-5 text-gray-600 mr-2" />
                  <h2 className="text-xl font-semibold">Billing Information</h2>
                </div>
                
                {/* First Name and Last Name - Side by side on mobile */}
                <div className="grid grid-cols-2 gap-4">
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
                </div>

                {/* Email Address - Full width */}
                <div>
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
                      <button
                        type="button"
                        onClick={() => setShowLoginModal(true)}
                        className="underline font-medium hover:text-red-700"
                      >
                        Please login
                      </button>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={accountPassword}
                          onChange={handlePasswordChange}
                          className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00] ${
                            validationErrors.password ? 'border-red-500' :
                            passwordStrength === 'weak' ? 'border-red-400' :
                            passwordStrength === 'medium' ? 'border-yellow-400' :
                            passwordStrength === 'strong' ? 'border-green-400' :
                            'border-gray-300'
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
                      {passwordStrength && (
                        <div className="mt-1 flex items-center gap-2">
                          <div className="flex gap-1 flex-1">
                            <div className={`h-1 flex-1 rounded ${
                              passwordStrength === 'weak' ? 'bg-red-400' :
                              passwordStrength === 'medium' ? 'bg-yellow-400' :
                              'bg-green-400'
                            }`} />
                            <div className={`h-1 flex-1 rounded ${
                              passwordStrength === 'medium' ? 'bg-yellow-400' :
                              passwordStrength === 'strong' ? 'bg-green-400' :
                              'bg-gray-200'
                            }`} />
                            <div className={`h-1 flex-1 rounded ${
                              passwordStrength === 'strong' ? 'bg-green-400' : 'bg-gray-200'
                            }`} />
                          </div>
                          <span className={`text-xs font-medium ${
                            passwordStrength === 'weak' ? 'text-red-600' :
                            passwordStrength === 'medium' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {passwordStrength === 'weak' ? 'Weak' :
                             passwordStrength === 'medium' ? 'Medium' :
                             'Strong'}
                          </span>
                        </div>
                      )}
                      {validationErrors.password && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={handleConfirmPasswordChange}
                          className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00] ${
                            validationErrors.confirmPassword ? 'border-red-500' :
                            passwordMatch === false ? 'border-red-400' :
                            passwordMatch === true ? 'border-green-400' :
                            'border-gray-300'
                          }`}
                          placeholder="Re-enter password"
                        />
                        {passwordMatch !== null && (
                          <div className="absolute right-3 top-3">
                            {passwordMatch ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        )}
                      </div>
                      {passwordMatch === false && confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                      )}
                      {passwordMatch === true && confirmPassword && (
                        <p className="text-green-500 text-xs mt-1">Passwords match</p>
                      )}
                      {validationErrors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                )}


                {/* Street Address - Full width */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="address1"
                    required
                    value={billingData.address1}
                    onChange={handleBillingChange}
                    placeholder="Street & number"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00] ${
                      validationErrors.address1 ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.address1 && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.address1}</p>
                  )}
                </div>

                {/* Apartment and City - Side by side on mobile */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apartment, suite
                    </label>
                    <input
                      type="text"
                      name="address2"
                      value={billingData.address2}
                      onChange={handleBillingChange}
                      placeholder="Apt, suite"
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
                      placeholder="City"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00] ${
                        validationErrors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.city && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.city}</p>
                    )}
                  </div>
                </div>

                {/* State and Postal Code - Side by side on mobile */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State/Province
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={billingData.state}
                      onChange={handleBillingChange}
                      placeholder="State"
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
                      placeholder="Postal code"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00] ${
                        validationErrors.postcode ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.postcode && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.postcode}</p>
                    )}
                  </div>
                </div>

                {/* Country - Full width */}
                <div>
                  <CountrySelect
                    countries={countries}
                    value={billingData.country}
                    onChange={(countryCode) => {
                      setBillingData(prev => ({ ...prev, country: countryCode }))
                      setValidationErrors(prev => ({ ...prev, country: '' }))
                    }}
                    label="Country *"
                    error={validationErrors.country}
                  />
                </div>

                {/* Company / B2B Checkbox */}
                <div className="pt-4 border-t border-gray-200">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isCompany}
                        onChange={(e) => {
                          setIsCompany(e.target.checked)
                          if (!e.target.checked) {
                            setCompanyName('')
                            setVatNumber('')
                            setVatValidationStatus('idle')
                            setVatExemptionApplied(false)
                          }
                        }}
                        className="h-4 w-4 text-[#ffed00] focus:ring-[#ffed00] border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        I am ordering as a company
                      </span>
                    </label>
                  </div>

                {/* Company Fields - Only show when checkbox is checked */}
                {isCompany && (
                  <>
                    {/* Company Name and VAT Number in one row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company Name
                          </label>
                          <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Your Company Ltd."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00]"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            VAT / Tax ID Number
                          </label>
                          <input
                            type="text"
                            value={vatNumber}
                            onChange={(e) => setVatNumber(e.target.value.toUpperCase())}
                            placeholder="ATU12345678"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00]"
                          />
                        </div>
                      </div>

                    {/* VAT Validation Status and Info */}
                    <div>
                        {/* VAT Validation Status */}
                        {vatValidationStatus !== 'idle' && vatValidationMessage && (
                          <div className={`mb-2 p-2 rounded-md text-xs flex items-start gap-2 ${
                            vatValidationStatus === 'valid' ? 'bg-green-50 text-green-800' :
                            vatValidationStatus === 'validating' ? 'bg-blue-50 text-blue-800' :
                            'bg-red-50 text-red-800'
                          }`}>
                            {vatValidationStatus === 'validating' ? (
                              <div className="animate-spin h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full mt-0.5"></div>
                            ) : vatValidationStatus === 'valid' ? (
                              <CheckCircle className="h-4 w-4 flex-shrink-0" />
                            ) : (
                              <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            )}
                            <span>{vatValidationMessage}</span>
                          </div>
                        )}

                        {/* Info Notice */}
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-800">
                              <strong>Business customers from other EU countries</strong> can get VAT exemption if they enter a valid EU VAT ID.
                              For Germany and non-EU countries, VAT still applies.
                            </p>
                          </div>
                        </div>
                    </div>
                  </>
                )}
              </div>

              {/* Shipping Address - only show if cart has physical products */}
              {hasPhysicalProducts && (
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
                  <div className="space-y-4">
                    {/* First Name and Last Name - Side by side on mobile */}
                    <div className="grid grid-cols-2 gap-4">
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
                    </div>

                    {/* Street Address - Full width */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="address1"
                        required
                        value={shippingData.address1}
                        onChange={handleShippingChange}
                        placeholder="Street & number"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00] ${
                          validationErrors.shipping_address1 ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {validationErrors.shipping_address1 && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.shipping_address1}</p>
                      )}
                    </div>

                    {/* Apartment and City - Side by side on mobile */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Apartment, suite
                        </label>
                        <input
                          type="text"
                          name="address2"
                          value={shippingData.address2}
                          onChange={handleShippingChange}
                          placeholder="Apt, suite"
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
                          placeholder="City"
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00] ${
                            validationErrors.shipping_city ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {validationErrors.shipping_city && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors.shipping_city}</p>
                        )}
                      </div>
                    </div>

                    {/* State and Postal Code - Side by side on mobile */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State/Province
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={shippingData.state}
                          onChange={handleShippingChange}
                          placeholder="State"
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
                          placeholder="Postal code"
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00] ${
                            validationErrors.shipping_postcode ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {validationErrors.shipping_postcode && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors.shipping_postcode}</p>
                        )}
                      </div>
                    </div>

                    {/* Country - Full width */}
                    <div>
                      <CountrySelect
                        countries={countries}
                        value={shippingData.country}
                        onChange={(countryCode) => {
                          setShippingData(prev => ({ ...prev, country: countryCode }))
                          setValidationErrors(prev => ({ ...prev, shipping_country: '' }))
                        }}
                        label="Country *"
                        error={validationErrors.shipping_country}
                      />
                    </div>
                  </div>
                )}
              </div>
              )}

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <div className="flex items-center mb-4">
                  <CreditCard className="h-5 w-5 text-gray-600 mr-2" />
                  <h2 className="text-xl font-semibold">Payment Method</h2>
                </div>

                <div className="space-y-3">
                  {/* Stripe - Credit/Debit Card */}
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
                      <div className="font-medium mb-1">Credit Card / Debit Card</div>
                      <div className="text-sm text-gray-600">Pay securely with your credit or debit card</div>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">Visa</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">Mastercard</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">Amex</span>
                      </div>
                    </div>
                  </label>

                  {/* Klarna */}
                  <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition ${
                    selectedPaymentMethod === 'klarna' ? 'border-[#ffed00] bg-yellow-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="klarna"
                      checked={selectedPaymentMethod === 'klarna'}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium mb-1">Klarna</div>
                      <div className="text-sm text-gray-600">Pay now, pay later, or pay in installments</div>
                      <div className="mt-2">
                        <span className="text-xs bg-[#FFB3C7] text-black px-2 py-1 rounded font-semibold">Klarna</span>
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
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4 z-10">
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
                        </h3>
                        {item.isFreebie && (
                          <p className="text-xs text-green-600 font-semibold">(Gift)</p>
                        )}
                        {item.variation?.attributes && (
                          <p className="text-xs text-gray-500">
                            {item.variation.attributes.map((attr) => attr.value).join(', ')}
                          </p>
                        )}
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                          <span className={`text-sm font-medium ${item.isFreebie ? 'text-green-600' : ''}`}>
                            {item.isFreebie ? 'FREE' : `${currencySymbol}${(item.price * item.quantity).toFixed(2)}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4 space-y-2">
                  {/* Subtotal (Net Price - without tax) */}
                  <div className="flex justify-between text-sm">
                    <span>Subtotal (excl. tax)</span>
                    <span>{currencySymbol}{netPrice.toFixed(2)}</span>
                  </div>

                  {/* Reseller Discount */}
                  {resellerDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Reseller Discount</span>
                      <span>-{currencySymbol}{resellerDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Tax */}
                  {taxRate > 0 ? (
                    <div className="flex justify-between text-sm">
                      <span>Tax ({taxRate.toFixed(0)}% based on {countries.find(c => c.code === billingData.country)?.name || billingData.country})</span>
                      <span>{currencySymbol}{taxAmount.toFixed(2)}</span>
                    </div>
                  ) : vatExemptionApplied ? (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>VAT (0% - {validatedVatData ? 'EU Reverse Charge' : 'Export'})</span>
                      <span>{currencySymbol}0.00</span>
                    </div>
                  ) : null}

                  {/* Shipping - only show if cart has physical products */}
                  {hasPhysicalProducts && (
                    <div className="flex justify-between text-sm">
                      <span>{shippingMethodTitle}</span>
                      <span>{shippingCost === 0 ? 'Free' : `${currencySymbol}${shippingCost.toFixed(2)}`}</span>
                    </div>
                  )}

                  {/* Note: Removed old "free shipping at €100" message as shipping is now weight-based */}
                  {false && totalPrice < 100 && (
                    <div className="text-xs text-gray-500 py-2">
                      Add {currencySymbol}{(100 - totalPrice).toFixed(2)} more for free shipping
                    </div>
                  )}

                  {/* Savings from freebies */}
                  {items.some(item => item.isFreebie) && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Gift Value</span>
                      <span>{currencySymbol}49.00</span>
                    </div>
                  )}

                  {/* Total (Gross Price - including tax) */}
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>{currencySymbol}{finalTotal.toFixed(2)}</span>
                  </div>

                  {taxRate > 0 && (
                    <p className="text-xs text-gray-500 pt-2">
                      Including {taxRate.toFixed(0)}% tax for {countries.find(c => c.code === billingData.country)?.name || billingData.country}
                    </p>
                  )}
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
                      {processingStep === 'creating' && 'Creating order...'}
                      {processingStep === 'payment' && 'Processing payment...'}
                      {processingStep === 'redirecting' && 'Redirecting to payment...'}
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

              {/* Customer Testimonials */}
              {testimonials.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="text-center">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Trusted by Athletes Worldwide</h3>
                    <p className="text-xs text-gray-600">Real reviews from our customers</p>
                  </div>
                  <div className="space-y-3">
                    {testimonials.slice(0, 3).map((review) => {
                      const rating = getTestimonialRating(review)
                      const reviewerName = getTestimonialReviewerName(review)
                      const jobPosition = getTestimonialJobPosition(review)
                      const reviewText = getTestimonialText(review)
                      const imageUrl = getTestimonialImage(review)

                      return (
                        <div key={review.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                          {/* Star Rating */}
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < rating ? 'fill-[#ffed00] text-[#ffed00]' : 'fill-gray-300 text-gray-300'}`}
                              />
                            ))}
                          </div>

                          {/* Review Text */}
                          {reviewText && (
                            <p className="text-xs text-gray-700 mb-3 line-clamp-3 leading-relaxed">
                              &ldquo;{reviewText}&rdquo;
                            </p>
                          )}

                          {/* Reviewer Info */}
                          <div className="flex items-center gap-2">
                            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                              <Image
                                src={imageUrl}
                                alt={reviewerName}
                                fill
                                className="object-cover"
                                sizes="32px"
                              />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900">{reviewerName}</p>
                              <p className="text-[10px] text-gray-600">{jobPosition}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Login Modal */}
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          redirectTo="/checkout"
        />
      </div>
    </div>
    </>
  )
}