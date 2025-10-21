'use client'

import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Plus, Minus, ShoppingBag, Truck, Shield, CreditCard, Gift, Package } from 'lucide-react'
import { useCart, CartItem } from '@/lib/cart-context'
import { useCurrency, getProductPrice } from '@/lib/currency-context'
import { calculateTax, TaxRate } from '@/lib/woocommerce/countries-taxes'
import { calculateCartWeight, findShippingZoneForCountry, calculateShippingCost, ShippingZoneWithMethods } from '@/lib/woocommerce/shipping'
import { getCountryFromIPClient } from '@/lib/geolocation'
import { calculateResellerPrice } from '@/lib/reseller-pricing'
import { useSession } from 'next-auth/react'
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

// Country name lookup
const getCountryName = (code: string): string => {
  const countryNames: Record<string, string> = {
    'DE': 'Germany',
    'AT': 'Austria',
    'CH': 'Switzerland',
    'FR': 'France',
    'IT': 'Italy',
    'ES': 'Spain',
    'NL': 'Netherlands',
    'BE': 'Belgium',
    'GB': 'United Kingdom',
    'US': 'United States',
    'CA': 'Canada',
    'AU': 'Australia',
    'RO': 'Romania',
  }
  return countryNames[code] || code
}

interface SideCartProps {
  taxRates: TaxRate[]
  shippingZones: ShippingZoneWithMethods[]
}

export function SideCart({ taxRates, shippingZones }: SideCartProps) {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    totalItems
  } = useCart()

  const { data: session } = useSession()
  const { currency, formatPrice, getCurrencySymbol } = useCurrency()

  const [country, setCountry] = useState('DE')
  const [countryName, setCountryName] = useState('Germany')
  const [shipping, setShipping] = useState(0)
  const [tax, setTax] = useState(0)
  const [taxRate, setTaxRate] = useState(0)
  const [isLoadingCountry, setIsLoadingCountry] = useState(true)
  const [hasPhysicalProducts, setHasPhysicalProducts] = useState(false)

  const isReseller = session?.user?.role === 'reseller'

  // Helper to get currency-aware price for a cart item (with reseller pricing)
  const getItemPrice = (item: CartItem): number => {
    if (item.isFreebie) return 0

    // Check if reseller pricing applies
    const resellerPriceInfo = calculateResellerPrice(item, currency, isReseller)
    if (resellerPriceInfo.hasDiscount) {
      return resellerPriceInfo.price
    }

    // Regular pricing
    if (!item.currency_prices) {
      // Fallback to legacy price
      return item.price
    }

    const priceData = getProductPrice(item as any, currency)
    return parseFloat(priceData.displayPrice) || item.price
  }

  // Calculate total price with currency awareness and reseller savings
  let totalPrice = 0
  let totalSavings = 0
  let subtotalBeforeDiscount = 0

  items.forEach(item => {
    if (item.isFreebie) return

    const resellerPriceInfo = calculateResellerPrice(item, currency, isReseller)
    const itemPrice = getItemPrice(item)

    if (resellerPriceInfo.hasDiscount) {
      // Use discounted price for total
      totalPrice += resellerPriceInfo.price * item.quantity
      // Track original price and savings
      subtotalBeforeDiscount += resellerPriceInfo.originalPrice * item.quantity
      totalSavings += resellerPriceInfo.discountAmount * item.quantity
    } else {
      // No discount, use regular price
      totalPrice += itemPrice * item.quantity
      subtotalBeforeDiscount += itemPrice * item.quantity
    }
  })

  // Get currency symbol
  const currencySymbol = getCurrencySymbol()

  // Detect country from IP on mount
  useEffect(() => {
    const detectCountry = async () => {
      setIsLoadingCountry(true)
      try {
        const detectedCountry = await getCountryFromIPClient()
        setCountry(detectedCountry)
        setCountryName(getCountryName(detectedCountry))
      } catch (error) {
        console.error('[Side Cart] Failed to detect country:', error)
        setCountry('DE')
        setCountryName('Germany')
      } finally {
        setIsLoadingCountry(false)
      }
    }

    detectCountry()
  }, [])

  // Calculate tax and shipping when cart changes or country changes
  useEffect(() => {
    if (!country || items.length === 0) {
      setShipping(0)
      setTax(0)
      setTaxRate(0)
      return
    }

    // Calculate subtotal (excluding tax)
    const { taxAmount, taxRate: calculatedTaxRate } = calculateTax(totalPrice, country, '', taxRates)
    setTax(taxAmount)
    setTaxRate(calculatedTaxRate)

    // Calculate shipping based on cart weight and destination country
    const cartItems = items.map(item => ({
      id: item.id,
      weight: item.weight,
      quantity: item.quantity
    }))

    const totalWeight = calculateCartWeight(cartItems)

    // If cart has no weight (virtual products only), shipping is not needed
    if (totalWeight === 0) {
      setShipping(0)
      setHasPhysicalProducts(false)
      return
    }

    // Cart has physical products
    setHasPhysicalProducts(true)

    // Find shipping zone for country
    const zone = findShippingZoneForCountry(shippingZones, country)

    if (!zone) {
      console.warn(`[Side Cart] No shipping zone found for country ${country}`)
      setShipping(0)
      return
    }

    // Calculate shipping cost based on weight
    const result = calculateShippingCost(zone, totalWeight)

    if (!result) {
      console.warn(`[Side Cart] No shipping rate found for weight ${totalWeight}kg in zone ${zone.name}`)
      setShipping(0)
      return
    }

    setShipping(result.cost)
  }, [totalPrice, country, items, taxRates, shippingZones])

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

                    {/* Reseller Notification - Premium version */}
                    {isReseller && items.some(item => item.reseller_pricing?.enabled) && (
                      <div className="bg-gradient-to-r from-green-900/30 to-green-800/30 border-b border-green-700/20 px-4 py-2.5">
                        <p className="text-green-400 text-xs font-medium text-center tracking-wide">
                          RESELLER BULK PRICING ACTIVE
                        </p>
                      </div>
                    )}

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
                            <div key={item.id} className={`flex gap-4 ${
                              item.isFreebie ? 'bg-gradient-to-r from-green-900/30 to-yellow-900/20 -mx-6 px-6 py-4 border-l-4 border-l-green-400 rounded-r-lg' : ''
                            }`}>
                              {/* Product Image with Gift Badge */}
                              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-800">
                                {item.image && !item.image.includes('placeholder') ? (
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                    {item.isFreebie ? (
                                      <Gift className="h-8 w-8 text-green-400" />
                                    ) : (
                                      <Package className="h-8 w-8 text-gray-600" />
                                    )}
                                  </div>
                                )}
                                {item.isFreebie && (
                                  <div className="absolute -top-2 -right-2 bg-green-400 text-black rounded-full p-1.5 shadow-lg">
                                    <Gift className="h-4 w-4" />
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex flex-1 flex-col">
                                <div className="flex justify-between">
                                  <div className="flex-1">
                                    {item.isFreebie && (
                                      <div className="inline-flex items-center gap-1 bg-gradient-to-r from-green-400 to-yellow-400 text-black px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1">
                                        <Gift className="h-3 w-3" />
                                        FREE BONUS GIFT
                                      </div>
                                    )}
                                    <h3 className="text-sm font-medium">
                                      {item.name}
                                      {item.isFreebie && (
                                        <span className="ml-1 text-xs text-green-400">({currencySymbol}49 value)</span>
                                      )}
                                    </h3>
                                    {item.variation?.attributes && (
                                      <p className="mt-1 text-xs text-gray-400">
                                        {item.variation.attributes.map((attr) => (
                                          <span key={attr.name}>{attr.value} </span>
                                        ))}
                                      </p>
                                    )}
                                  </div>
                                  {!item.isFreebie && (
                                    <button
                                      onClick={() => removeItem(item.id)}
                                      className="text-gray-500 hover:text-white transition-colors ml-2"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                                <div className="mt-2 flex items-end justify-between">
                                  {!item.isFreebie ? (
                                    <>
                                      <div className="flex flex-col gap-1">
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
                                        {(() => {
                                          const resellerPriceInfo = calculateResellerPrice(item, currency, isReseller)
                                          if (resellerPriceInfo.hasDiscount) {
                                            const saved = resellerPriceInfo.discountAmount * item.quantity
                                            return (
                                              <div className="inline-flex items-center gap-1 bg-green-900/40 border border-green-700/50 text-green-400 px-2 py-0.5 rounded text-[10px] font-medium">
                                                Reseller Discount • {currencySymbol}{saved.toFixed(2)}
                                              </div>
                                            )
                                          }
                                          if (isReseller && item.reseller_pricing?.enabled && item.quantity < item.reseller_pricing.min_quantity) {
                                            const needed = item.reseller_pricing.min_quantity - item.quantity
                                            return (
                                              <div className="inline-flex items-center gap-1 bg-yellow-900/40 border border-yellow-700/50 text-yellow-400 px-2 py-0.5 rounded text-[10px] font-medium">
                                                Add {needed} more for reseller discount
                                              </div>
                                            )
                                          }
                                          return null
                                        })()}
                                      </div>
                                      <div className="text-right">
                                        {(() => {
                                          const resellerPriceInfo = calculateResellerPrice(item, currency, isReseller)
                                          if (resellerPriceInfo.hasDiscount) {
                                            return (
                                              <div>
                                                <p className="text-xs text-gray-500 line-through">
                                                  {currencySymbol}{(resellerPriceInfo.originalPrice * item.quantity).toFixed(2)}
                                                </p>
                                                <p className="text-sm font-medium text-green-400">
                                                  {currencySymbol}{(resellerPriceInfo.price * item.quantity).toFixed(2)}
                                                </p>
                                              </div>
                                            )
                                          }
                                          return (
                                            <p className="text-sm font-medium">
                                              {currencySymbol}{(getItemPrice(item) * item.quantity).toFixed(2)}
                                            </p>
                                          )
                                        })()}
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                                        <span className="text-green-400">✓</span> Included with purchase
                                      </span>
                                      <p className="text-sm font-bold text-green-400 animate-pulse">
                                        FREE
                                      </p>
                                    </>
                                  )}
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
                        {/* Estimate Notice */}
                        <div className="mb-4 p-3 bg-gray-900 rounded-md border border-gray-800">
                          <div className="flex items-start gap-2">
                            <Truck className="h-4 w-4 text-[#ffed00] mt-0.5 flex-shrink-0" />
                            <div className="text-xs">
                              <p className="text-gray-400">
                                Shipping and tax based on <span className="text-white font-medium">{countryName}</span>.
                                {isLoadingCountry && <span className="ml-1 text-gray-500">(Detecting...)</span>}
                              </p>
                              <p className="text-gray-500 mt-1">
                                Final prices calculated at checkout.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Subtotal (excl. tax) */}
                        <div className="flex justify-between text-sm mb-2">
                          <p className="text-gray-400">Subtotal (excl. tax)</p>
                          <p className="text-white">{currencySymbol}{totalPrice.toFixed(2)}</p>
                        </div>

                        {/* Reseller Discount - show savings achieved */}
                        {totalSavings > 0 && (
                          <div className="flex justify-between text-sm mb-2 bg-green-500/10 -mx-4 px-4 py-1.5 rounded">
                            <p className="text-green-400 font-medium flex items-center gap-1">
                              <Gift className="h-3.5 w-3.5" />
                              Reseller Discount
                            </p>
                            <p className="text-green-400 font-semibold">-{currencySymbol}{totalSavings.toFixed(2)}</p>
                          </div>
                        )}

                        {/* Tax */}
                        {tax > 0 && (
                          <div className="flex justify-between text-sm mb-2">
                            <p className="text-gray-400">
                              Tax ({taxRate > 0 ? `${taxRate.toFixed(0)}%` : 'VAT'})
                            </p>
                            <p className="text-white">{currencySymbol}{tax.toFixed(2)}</p>
                          </div>
                        )}

                        {/* Shipping - only show if cart has physical products */}
                        {hasPhysicalProducts && (
                          <div className="flex justify-between text-sm mb-3">
                            <div className="flex items-center gap-1">
                              <span className="text-gray-400">Shipping</span>
                            </div>
                            <p className="text-white">
                              {shipping === 0 ? (
                                <span className="text-green-400 font-medium">Free</span>
                              ) : (
                                `${currencySymbol}${shipping.toFixed(2)}`
                              )}
                            </p>
                          </div>
                        )}

                        <div className="border-b border-gray-800 my-3" />

                        {/* Total */}
                        <div className="flex justify-between text-lg font-bold mb-4">
                          <p>Total</p>
                          <p>{currencySymbol}{finalTotal.toFixed(2)}</p>
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