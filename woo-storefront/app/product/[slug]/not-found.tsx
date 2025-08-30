import Link from 'next/link'
import { AlertCircle, ArrowLeft, ShoppingBag } from 'lucide-react'

export default function ProductNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Product Not Found</h1>
          <p className="text-gray-600 mb-6">
            The product you&apos;re looking for doesn&apos;t exist or has been removed from our catalog.
          </p>
        </div>
        
        <div className="space-y-3">
          <Link
            href="/shop"
            className="w-full inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-800 transition-colors"
          >
            <ShoppingBag className="h-5 w-5" />
            Browse All Products
          </Link>
          
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 border border-gray-300 px-6 py-3 rounded-md font-semibold hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}