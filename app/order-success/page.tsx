import Link from 'next/link'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
        
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your order has been successfully placed and you will receive a confirmation email shortly.
        </p>
        
        <div className="bg-gray-50 rounded-md p-4 mb-8">
          <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Estimated delivery: 3-5 business days
          </p>
        </div>
        
        <div className="space-y-3">
          <Link 
            href="/account"
            className="w-full bg-[#ffed00] text-black px-6 py-3 rounded-md font-semibold hover:bg-yellow-400 transition flex items-center justify-center"
          >
            View Order Details
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
          
          <Link 
            href="/shop"
            className="w-full bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-md font-semibold hover:bg-gray-50 transition block"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}