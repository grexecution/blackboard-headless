'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function PaymentCompletePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [orderDetails, setOrderDetails] = useState<any>(null)
  
  // WooCommerce typically returns these params after payment
  const orderId = searchParams.get('order_id') || searchParams.get('order')
  const orderKey = searchParams.get('key')
  const paymentStatus = searchParams.get('status')
  
  useEffect(() => {
    // Clear cart data since payment has been processed
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart')
    }
    
    // Check payment status
    if (paymentStatus === 'cancelled' || paymentStatus === 'failed') {
      setStatus('failed')
    } else if (orderId) {
      // Payment successful or pending verification
      setStatus('success')
      setOrderDetails({
        id: orderId,
        key: orderKey,
      })
    } else {
      // No order information, redirect to home
      router.push('/')
    }
  }, [orderId, orderKey, paymentStatus, router])
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#ffed00] mx-auto mb-4" />
          <p className="text-lg">Processing your payment...</p>
        </div>
      </div>
    )
  }
  
  if (status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-50 py-12">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
          <div className="mb-6">
            <XCircle className="h-32 w-32 text-red-500 mx-auto" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4 text-center">Payment Failed</h1>
          
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
            <p className="text-red-800 text-center">
              Your payment could not be processed. Please try again or contact support if the issue persists.
            </p>
          </div>
          
          <div className="space-y-3">
            <Link 
              href="/checkout"
              className="w-full bg-[#ffed00] text-black px-6 py-3 rounded-md font-semibold hover:bg-yellow-400 transition flex items-center justify-center gap-2"
            >
              Try Again
              <ArrowRight className="h-4 w-4" />
            </Link>
            
            <Link 
              href="/shop"
              className="w-full bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-md font-semibold hover:bg-gray-50 transition block text-center"
            >
              Return to Shop
            </Link>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-yellow-50 py-12">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <div className="mb-6 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-32 w-32 bg-green-100 rounded-full animate-ping opacity-20"></div>
          </div>
          <CheckCircle className="h-32 w-32 text-green-500 mx-auto relative z-10" />
        </div>
        
        <h1 className="text-4xl font-bold mb-2 text-center">Payment Successful!</h1>
        
        {orderDetails && (
          <p className="text-lg text-gray-600 text-center mb-6">
            Order #{orderDetails.id}
          </p>
        )}
        
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-8">
          <p className="text-green-800 text-center">
            <span className="font-semibold">Thank you!</span> Your payment has been processed successfully.
            You will receive an order confirmation email shortly.
          </p>
        </div>
        
        <div className="space-y-3">
          <Link 
            href="/account"
            className="w-full bg-[#ffed00] text-black px-6 py-3 rounded-md font-semibold hover:bg-yellow-400 transition flex items-center justify-center gap-2"
          >
            View My Orders
            <ArrowRight className="h-4 w-4" />
          </Link>
          
          <Link 
            href="/shop"
            className="w-full bg-black text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-800 transition block text-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}