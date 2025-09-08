'use client'

import { useState } from 'react'
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react'

// This is a simple admin page to manually confirm payments
// In production, this would be triggered by Stripe/PayPal webhooks
export default function ConfirmPaymentPage() {
  const [orderId, setOrderId] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('stripe')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/orders/${orderId}/complete-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId,
          paymentMethod,
          amount: parseFloat(amount),
          currency: 'EUR',
          status: 'completed'
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: `Order #${orderId} marked as paid successfully!` })
        // Clear form
        setOrderId('')
        setTransactionId('')
        setAmount('')
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update order' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to confirm payment' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-md">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <CreditCard className="h-6 w-6 text-gray-600" />
            <h1 className="text-2xl font-bold">Confirm Payment (Admin)</h1>
          </div>

          <p className="text-gray-600 mb-6 text-sm">
            Use this form to manually confirm payment for orders. 
            In production, this would be automated via payment gateway webhooks.
          </p>

          {message && (
            <div className={`mb-4 p-3 rounded-md flex items-start gap-2 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order ID
              </label>
              <input
                type="text"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g., 123"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction ID
              </label>
              <input
                type="text"
                required
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g., ch_1234567890"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (EUR)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g., 99.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffed00]"
              >
                <option value="stripe">Stripe</option>
                <option value="paypal">PayPal</option>
                <option value="bacs">Bank Transfer</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ffed00] text-black py-3 rounded-md font-semibold hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Confirm Payment'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-yellow-50 rounded-md">
            <h3 className="font-semibold text-sm mb-2">How it works:</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• This updates the WooCommerce order status to &quot;Processing&quot;</li>
              <li>• Stores the transaction ID for refund capability</li>
              <li>• Adds payment details to order meta data</li>
              <li>• Creates an order note with payment details</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}