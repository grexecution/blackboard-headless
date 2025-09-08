'use client'

import Link from 'next/link'
import { CheckCircle, Package, ArrowRight, Printer, Mail, CreditCard, DollarSign, Copy, AlertCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order')
  const orderNumber = searchParams.get('number')
  const paymentMethod = searchParams.get('method')
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  // Get order details from sessionStorage and clear cart
  useEffect(() => {
    // The cart should already be cleared by the checkout process
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart')
      
      // Get order details from sessionStorage
      const storedOrder = sessionStorage.getItem('lastOrder')
      if (storedOrder) {
        setOrderDetails(JSON.parse(storedOrder))
        // Clear it after reading
        sessionStorage.removeItem('lastOrder')
      }
    }
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-yellow-50 py-6 md:py-12 px-3 sm:px-4">
      <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 md:p-8 max-w-2xl w-full">
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
        
        {/* Payment Status Message */}
        {paymentMethod === 'bacs' && orderDetails?.bankDetails ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-8">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-yellow-800 font-semibold mb-3">
                  Bank Transfer Required
                </p>
                <p className="text-yellow-700 text-sm mb-4">
                  Please transfer the total amount to the following bank account:
                </p>
                <div className="bg-white rounded-md p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Name:</span>
                    <span className="font-mono">{orderDetails.bankDetails.accountName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">IBAN:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{orderDetails.bankDetails.iban}</span>
                      <button
                        onClick={() => copyToClipboard(orderDetails.bankDetails.iban)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">BIC/SWIFT:</span>
                    <span className="font-mono">{orderDetails.bankDetails.bic}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bank:</span>
                    <span>{orderDetails.bankDetails.bank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-semibold">{orderDetails.bankDetails.reference}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold text-lg">€{orderDetails?.total || '0.00'}</span>
                  </div>
                </div>
                {copied && (
                  <p className="text-green-600 text-sm mt-2">IBAN copied to clipboard!</p>
                )}
              </div>
            </div>
          </div>
        ) : paymentMethod === 'stripe' || paymentMethod === 'paypal' ? (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-8">
            <p className="text-blue-800 text-center">
              <span className="font-semibold">Order Received!</span> Your order has been placed and is awaiting payment processing.
              You will receive a confirmation email once payment is confirmed.
            </p>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-8">
            <p className="text-green-800 text-center">
              <span className="font-semibold">Success!</span> Your order has been successfully placed.
              You will receive a confirmation email with your order details shortly.
            </p>
          </div>
        )}
        
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