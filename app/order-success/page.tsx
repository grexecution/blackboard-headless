'use client'

import Link from 'next/link'
import { CheckCircle, Package, ArrowRight, Printer, Mail } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order')
  const orderNumber = searchParams.get('number')

  // Clear any lingering cart data
  useEffect(() => {
    // The cart should already be cleared by the checkout process
    // This is just a safety measure
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart')
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-yellow-50 py-12">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        {/* Success Animation */}
        <div className="mb-6 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-32 w-32 bg-green-100 rounded-full animate-ping opacity-20"></div>
          </div>
          <CheckCircle className="h-32 w-32 text-green-500 mx-auto relative z-10" />
        </div>
        
        <h1 className="text-4xl font-bold mb-2 text-center">Order Confirmed!</h1>
        
        {orderNumber && (
          <p className="text-lg text-gray-600 text-center mb-6">
            Order #{orderNumber}
          </p>
        )}
        
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-8">
          <p className="text-green-800 text-center">
            <span className="font-semibold">Success!</span> Your order has been successfully placed.
            You will receive a confirmation email with your order details shortly.
          </p>
        </div>
        
        {/* What Happens Next */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">What happens next?</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-8 w-8 bg-[#ffed00] rounded-full flex items-center justify-center text-black font-bold text-sm">
                1
              </div>
              <div>
                <p className="font-medium">Order Confirmation</p>
                <p className="text-sm text-gray-600">You&apos;ll receive an email confirmation with your order details</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-8 w-8 bg-[#ffed00] rounded-full flex items-center justify-center text-black font-bold text-sm">
                2
              </div>
              <div>
                <p className="font-medium">Order Processing</p>
                <p className="text-sm text-gray-600">We&apos;ll prepare your items for shipment</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-8 w-8 bg-[#ffed00] rounded-full flex items-center justify-center text-black font-bold text-sm">
                3
              </div>
              <div>
                <p className="font-medium">Shipping</p>
                <p className="text-sm text-gray-600">Your order will be shipped within 1-2 business days</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-8 w-8 bg-[#ffed00] rounded-full flex items-center justify-center text-black font-bold text-sm">
                4
              </div>
              <div>
                <p className="font-medium">Delivery</p>
                <p className="text-sm text-gray-600">Estimated delivery: 3-5 business days</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Estimated Delivery */}
        <div className="bg-gray-50 rounded-md p-6 mb-8 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-lg font-medium mb-1">Estimated Delivery</p>
          <p className="text-2xl font-bold text-[#ffed00]">3-5 Business Days</p>
          <p className="text-sm text-gray-600 mt-2">
            You&apos;ll receive tracking information once your order ships
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          {orderId && (
            <Link 
              href={`/account/orders/${orderId}`}
              className="w-full bg-[#ffed00] text-black px-6 py-3 rounded-md font-semibold hover:bg-yellow-400 transition flex items-center justify-center gap-2"
            >
              <Package className="h-5 w-5" />
              View Order Details
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => window.print()}
              className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print Receipt
            </button>
            
            <Link 
              href="/account"
              className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <Mail className="h-4 w-4" />
              My Orders
            </Link>
          </div>
          
          <Link 
            href="/shop"
            className="w-full bg-black text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-800 transition block text-center"
          >
            Continue Shopping
          </Link>
        </div>
        
        {/* Contact Support */}
        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Need help with your order?{' '}
            <Link href="/contact" className="text-[#ffed00] hover:underline font-medium">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}