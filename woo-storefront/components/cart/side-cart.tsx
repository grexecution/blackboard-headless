'use client'

import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Plus, Minus, ShoppingBag, Truck, Shield, CreditCard } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import Image from 'next/image'
import Link from 'next/link'

// Payment method icons component
const PaymentIcons = () => (
  <div className="flex items-center gap-2 justify-center py-3 px-4 bg-gray-900 rounded-md">
    <span className="text-xs text-gray-400">We accept:</span>
    <div className="flex gap-2 items-center">
      {/* Visa */}
      <svg className="h-8 w-auto" viewBox="0 0 48 32" fill="none">
        <rect width="48" height="32" rx="4" fill="white"/>
        <path d="M20.5 11L17.5 21H14.5L17.5 11H20.5Z" fill="#1A1F71"/>
        <path d="M32 11L29 18L26 11H23L27 21H31L35 11H32Z" fill="#1A1F71"/>
      </svg>
      {/* Mastercard */}
      <svg className="h-8 w-auto" viewBox="0 0 48 32" fill="none">
        <rect width="48" height="32" rx="4" fill="white"/>
        <circle cx="19" cy="16" r="7" fill="#EB001B"/>
        <circle cx="29" cy="16" r="7" fill="#F79E1B"/>
      </svg>
      {/* Amex */}
      <svg className="h-8 w-auto" viewBox="0 0 48 32" fill="none">
        <rect width="48" height="32" rx="4" fill="#006FCF"/>
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">AMEX</text>
      </svg>
      {/* PayPal */}
      <div className="bg-[#003087] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center">
        Pay<span className="text-[#009CDE]">Pal</span>
      </div>
    </div>
  </div>
)

// Shipping rates by country
const getShippingRate = (country: string, subtotal: number) => {
  // Free shipping over €100 for most countries
  if (subtotal >= 100) return 0
  
  // Country-specific shipping rates
  const rates: Record<string, number> = {
    'DE': 5.95,  // Germany
    'AT': 7.95,  // Austria
    'CH': 12.95, // Switzerland
    'FR': 8.95,  // France
    'IT': 9.95,  // Italy
    'ES': 9.95,  // Spain
    'NL': 7.95,  // Netherlands
    'BE': 7.95,  // Belgium
    'GB': 14.95, // UK
    'US': 19.95, // USA
  }
  
  return rates[country] || 12.95 // Default international rate
}

export function SideCart() {
  const { 
    items, 
    isOpen, 
    closeCart, 
    removeItem, 
    updateQuantity, 
    totalPrice,
    totalItems 
  } = useCart()

  const [country, setCountry] = useState('DE')
  const [shipping, setShipping] = useState(0)
  const [tax, setTax] = useState(0)

  // Calculate shipping based on country
  useEffect(() => {
    const shippingRate = getShippingRate(country, totalPrice)
    setShipping(shippingRate)
  }, [totalPrice, country])

  // Calculate tax based on country (VAT included in price for EU)
  useEffect(() => {
    // For EU countries, VAT is included in the price
    // Show the VAT amount that's included
    const vatRate = 0.19 // 19% German VAT
    const vatAmount = (totalPrice / (1 + vatRate)) * vatRate
    setTax(vatAmount)
  }, [totalPrice])

  // Detect country from IP
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data.country_code) {
          setCountry(data.country_code)
        }
      })
      .catch(() => {
        setCountry('DE')
      })
  }, [])

  const finalTotal = totalPrice + shipping

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeCart}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-black text-white">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5" />
                        <h2 className="text-lg font-semibold">Shopping Cart</h2>
                        {totalItems > 0 && (
                          <span className="ml-1 rounded-full bg-[#ffed00] px-2 py-0.5 text-xs text-black font-bold">
                            {totalItems}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        className="rounded-md p-2 hover:bg-gray-900 transition-colors"
                        onClick={closeCart}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                      {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <ShoppingBag className="h-16 w-16 text-gray-600 mb-4" />
                          <p className="text-gray-400 mb-4">Your cart is empty</p>
                          <Link
                            href="/shop"
                            onClick={closeCart}
                            className="text-sm text-[#ffed00] underline hover:text-[#ffed00]/80 transition-colors"
                          >
                            Continue Shopping
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {items.map((item) => (
                            <div key={item.id} className="flex gap-4">
                              {item.image && (
                                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-800">
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex flex-1 flex-col">
                                <div className="flex justify-between">
                                  <div>
                                    <h3 className="text-sm font-medium">{item.name}</h3>
                                    {item.attributes && (
                                      <p className="mt-1 text-xs text-gray-400">
                                        {Object.entries(item.attributes).map(([key, value]) => (
                                          <span key={key}>{value} </span>
                                        ))}
                                      </p>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => removeItem(item.id)}
                                    className="text-gray-500 hover:text-white transition-colors"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                      className="rounded-md border border-gray-700 p-1 hover:bg-gray-900 transition-colors"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </button>
                                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      className="rounded-md border border-gray-700 p-1 hover:bg-gray-900 transition-colors"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </button>
                                  </div>
                                  <p className="text-sm font-medium">
                                    €{(item.price * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Checkout Section */}
                    {items.length > 0 && (
                      <div className="border-t border-gray-800 px-6 py-6">
                        {/* Subtotal */}
                        <div className="flex justify-between text-sm">
                          <p>Subtotal</p>
                          <p>€{totalPrice.toFixed(2)}</p>
                        </div>
                        
                        <div className="border-b border-gray-800 my-3" />
                        
                        {/* Shipping */}
                        <div className="flex justify-between text-sm mb-2">
                          <div className="flex items-center gap-1">
                            <Truck className="h-3 w-3" />
                            <span>Shipping to {country}</span>
                          </div>
                          <p>{shipping === 0 ? 'Free' : `€${shipping.toFixed(2)}`}</p>
                        </div>
                        
                        {/* Tax Info */}
                        <div className="flex justify-between text-sm mb-3 text-gray-400">
                          <p>VAT included (19%)</p>
                          <p>€{tax.toFixed(2)}</p>
                        </div>
                        
                        <div className="border-b border-gray-800 my-3" />
                        
                        {/* Total */}
                        <div className="flex justify-between text-lg font-bold mb-4">
                          <p>Total</p>
                          <p>€{finalTotal.toFixed(2)}</p>
                        </div>

                        {/* Trust Badges */}
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                          <Shield className="h-4 w-4" />
                          <span>Secure Checkout • SSL Encrypted</span>
                        </div>

                        {/* Checkout Button */}
                        <Link
                          href="/checkout"
                          onClick={closeCart}
                          className="flex w-full items-center justify-center rounded-md bg-[#ffed00] px-6 py-3 text-black font-bold hover:bg-[#ffed00]/90 transition-colors"
                        >
                          Proceed to Checkout
                        </Link>
                        
                        {/* Info Text */}
                        <p className="mt-3 text-xs text-gray-400 text-center">
                          Prices include VAT. Shipping calculated at checkout.
                        </p>
                        
                        {/* Payment Methods */}
                        <div className="mt-4">
                          <PaymentIcons />
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}