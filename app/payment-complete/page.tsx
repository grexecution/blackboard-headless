'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function PaymentCompletePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'cancelled'>('loading')
  const [orderDetails, setOrderDetails] = useState<any>(null)

  const orderId = searchParams.get('order_id')
  const orderKey = searchParams.get('key')
  const paymentStatus = searchParams.get('status')

  useEffect(() => {
    // Check the payment status
    if (paymentStatus === 'cancelled') {
      setStatus('cancelled')
      return
    }

    if (!orderId || !orderKey) {
      setStatus('failed')
      return
    }

    // Verify the order status with backend
    fetch(`/api/orders/${orderId}?key=${orderKey}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrderDetails(data.order)
          if (data.order.status === 'processing' || data.order.status === 'completed') {
            setStatus('success')
          } else if (data.order.status === 'pending') {
            // Payment might still be processing
            setStatus('success') // Show success but with pending payment message
          } else if (data.order.status === 'failed') {
            setStatus('failed')
          }
        } else {
          setStatus('failed')
        }
      })
      .catch(err => {
        console.error('Error fetching order:', err)
        setStatus('failed')
      })
  }, [orderId, orderKey, paymentStatus])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffed00] mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-2">Processing Payment...</h1>
          <p className="text-gray-600">Please wait while we confirm your payment</p>
        </div>
      </div>
    )
  }

  if (status === 'cancelled') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <XCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
          <p className="text-gray-600 mb-6">
            Your payment was cancelled. Your cart items have been saved.
          </p>
          <div className="space-y-3">
            <Link
              href="/checkout"
              className="block w-full bg-[#ffed00] text-black px-6 py-3 rounded-md font-semibold hover:bg-yellow-400 transition"
            >
              Return to Checkout
            </Link>
            <Link
              href="/shop"
              className="block w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-md font-semibold hover:bg-gray-50 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t process your payment. Please try again or contact support if the problem persists.
          </p>
          <div className="space-y-3">
            <Link
              href="/checkout"
              className="block w-full bg-[#ffed00] text-black px-6 py-3 rounded-md font-semibold hover:bg-yellow-400 transition"
            >
              Try Again
            </Link>
            <Link
              href="/contact"
              className="block w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-md font-semibold hover:bg-gray-50 transition"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-12">
      <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your order. We&apos;ve received your payment and will process your order shortly.
          </p>

          {orderDetails && (
            <div className="border-t border-b py-4 my-6 text-left">
              <h2 className="font-semibold mb-3">Order Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-medium">#{orderDetails.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium">€{orderDetails.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${
                    orderDetails.status === 'processing' ? 'text-blue-600' :
                    orderDetails.status === 'completed' ? 'text-green-600' :
                    orderDetails.status === 'pending' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`}>
                    {orderDetails.status === 'processing' ? 'Processing' :
                     orderDetails.status === 'completed' ? 'Completed' :
                     orderDetails.status === 'pending' ? 'Payment Pending' :
                     orderDetails.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-600 mb-6">
            A confirmation email has been sent to your email address with order details and tracking information.
          </p>

          <div className="space-y-3">
            {orderDetails && (
              <Link
                href={`/order-success?order=${orderDetails.id}&number=${orderDetails.number}`}
                className="block w-full bg-[#ffed00] text-black px-6 py-3 rounded-md font-semibold hover:bg-yellow-400 transition flex items-center justify-center gap-2"
              >
                View Order Details
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Link
              href="/shop"
              className="block w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-md font-semibold hover:bg-gray-50 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}