'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Currency = 'USD' | 'EUR'

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  formatPrice: (usdPrice: string | number, eurPrice?: string | number) => string
  getCurrencySymbol: () => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('EUR')

  // Load currency from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('blackboard_currency')
    if (saved === 'USD' || saved === 'EUR') {
      setCurrencyState(saved)
    }
  }, [])

  // Save currency to localStorage when it changes
  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency)
    localStorage.setItem('blackboard_currency', newCurrency)
  }

  // Format price based on selected currency with proper number formatting
  const formatPrice = (usdPrice: string | number, eurPrice?: string | number): string => {
    // Determine which price to use based on selected currency
    let priceToUse: string | number | undefined

    if (currency === 'USD') {
      // USD selected: prefer USD price, fallback to EUR price
      priceToUse = usdPrice || eurPrice
    } else {
      // EUR selected: prefer EUR price, fallback to USD price
      priceToUse = eurPrice || usdPrice
    }

    // Convert to number
    const numPrice = typeof priceToUse === 'string' ? parseFloat(priceToUse) : (priceToUse || 0)

    // Handle invalid or zero prices
    if (!priceToUse || !numPrice || isNaN(numPrice) || numPrice === 0) return ''

    // Format with appropriate currency symbol and number format
    if (currency === 'USD') {
      // USD: 1,000.00 (comma as thousand separator, period as decimal)
      const formatted = numPrice.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
      return `$${formatted}`
    } else {
      // EUR: 1.000,00 (period as thousand separator, comma as decimal)
      const formatted = numPrice.toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
      return `€${formatted}`
    }
  }

  // Get currency symbol
  const getCurrencySymbol = (): string => {
    return currency === 'USD' ? '$' : '€'
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, getCurrencySymbol }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}

/**
 * Helper function to get the correct price from a product based on current currency
 * Handles both regular and sale prices with proper fallback logic
 */
export function getProductPrice(product: any, currency: Currency): {
  regularPrice: string
  salePrice: string
  displayPrice: string
  onSale: boolean
} {
  // Get currency-specific prices if they exist
  const usdRegular = product.currency_prices?.usd?.regular_price || product.regular_price
  const usdSale = product.currency_prices?.usd?.sale_price || product.sale_price
  const eurRegular = product.currency_prices?.eur?.regular_price || product.regular_price
  const eurSale = product.currency_prices?.eur?.sale_price || product.sale_price

  // Determine which prices to use based on selected currency
  const regularPrice = currency === 'USD'
    ? (usdRegular || eurRegular)
    : (eurRegular || usdRegular)

  const salePrice = currency === 'USD'
    ? (usdSale || eurSale)
    : (eurSale || usdSale)

  // Determine display price (sale price if on sale, otherwise regular)
  const onSale = !!(salePrice && parseFloat(salePrice) > 0 && parseFloat(salePrice) < parseFloat(regularPrice || '0'))
  const displayPrice = onSale ? salePrice : regularPrice

  return {
    regularPrice: regularPrice || '',
    salePrice: salePrice || '',
    displayPrice: displayPrice || '',
    onSale
  }
}
