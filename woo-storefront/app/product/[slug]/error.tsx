'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowLeft } from 'lucide-react'

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Product page error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
          <p className="text-gray-600 mb-6">
            Sorry, we couldn&apos;t find the product you&apos;re looking for. It may have been removed or the link might be incorrect.
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-black text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
          
          <Link
            href="/shop"
            className="w-full inline-flex items-center justify-center gap-2 border border-gray-300 px-6 py-3 rounded-md font-semibold hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </Link>
        </div>
      </div>
    </div>
  )
}