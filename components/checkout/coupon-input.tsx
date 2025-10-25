'use client'

import { useState } from 'react'
import { Tag, X, Loader2, CheckCircle } from 'lucide-react'

interface CouponData {
  id: number
  code: string
  amount: string
  discountType: string
  description: string
  freeShipping: boolean
  discountAmount: number
  individualUse: boolean
}

interface CouponInputProps {
  onCouponApplied: (coupon: CouponData) => void
  onCouponRemoved: () => void
  appliedCoupon: CouponData | null
  cartItems: any[]
  customerId?: number
}

export default function CouponInput({
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon,
  cartItems,
  customerId,
}: CouponInputProps) {
  const [couponCode, setCouponCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState('')
  const [showInput, setShowInput] = useState(false)

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError('Please enter a coupon code')
      return
    }

    setIsValidating(true)
    setError('')

    try {
      const response = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          couponCode: couponCode.trim(),
          cartItems: cartItems.map(item => ({
            productId: item.productId,
            variationId: item.variationId,
            quantity: item.quantity,
            price: item.price,
          })),
          customerId: customerId,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Invalid coupon code')
        setIsValidating(false)
        return
      }

      // Coupon is valid
      onCouponApplied(data.coupon)
      setCouponCode('')
      setShowInput(false)
      setError('')
    } catch (err: any) {
      setError('Failed to validate coupon. Please try again.')
    } finally {
      setIsValidating(false)
    }
  }

  const handleRemoveCoupon = () => {
    onCouponRemoved()
    setCouponCode('')
    setError('')
    setShowInput(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyCoupon()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      {/* Applied Coupon Display */}
      {appliedCoupon && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-green-900 tracking-wide">
                    {appliedCoupon.code}
                  </span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                    Applied
                  </span>
                </div>
                {appliedCoupon.description && (
                  <p className="text-sm text-green-700 mb-2">{appliedCoupon.description}</p>
                )}
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="text-green-900 font-semibold">
                    -{appliedCoupon.discountAmount.toFixed(2)} discount
                  </span>
                  {appliedCoupon.freeShipping && (
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                      Free Shipping
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="text-green-600 hover:text-green-800 p-1 hover:bg-green-100 rounded transition"
              aria-label="Remove coupon"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Coupon Input */}
      {!appliedCoupon && (
        <>
          {!showInput ? (
            <button
              onClick={() => setShowInput(true)}
              className="flex items-center gap-2 text-black hover:text-gray-700 font-medium transition"
            >
              <Tag className="h-5 w-5" />
              <span>Have a coupon code?</span>
            </button>
          ) : (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Coupon Code
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value)
                      setError('')
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="summer2024"
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffed00] ${
                      error ? 'border-red-300' : 'border-gray-200'
                    }`}
                    disabled={isValidating}
                  />
                  {isValidating && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                    </div>
                  )}
                </div>
                <button
                  onClick={handleApplyCoupon}
                  disabled={isValidating || !couponCode.trim()}
                  className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isValidating ? 'Validating...' : 'Apply'}
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                onClick={() => {
                  setShowInput(false)
                  setCouponCode('')
                  setError('')
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
