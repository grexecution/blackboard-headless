import { wooClient } from './client'

export interface Country {
  code: string
  name: string
  states?: { [key: string]: string }
}

export interface TaxRate {
  id: number
  country: string
  state: string
  postcode: string
  city: string
  rate: string
  name: string
  priority: number
  compound: boolean
  shipping: boolean
  order: number
  class: string
}

// Fetch all countries from WooCommerce
export async function getAllCountries(): Promise<Country[]> {
  try {
    const data = await wooClient.request<any>('/data/countries')

    // WooCommerce returns an array-like object where each item has the country code inside
    // Example: { '0': { code: 'AF', name: 'Afghanistan', states: [] }, '1': { code: 'EG', ... } }
    const countries: Country[] = Object.values(data).map((countryData: any) => ({
      code: countryData.code,
      name: countryData.name,
      states: countryData.states || {}
    }))

    return countries
  } catch (error) {
    console.error('Error fetching countries:', error)
    return []
  }
}

// Fetch all tax rates from WooCommerce
export async function getAllTaxRates(): Promise<TaxRate[]> {
  try {
    const data = await wooClient.request<TaxRate[]>('/taxes?per_page=100')
    return data
  } catch (error) {
    console.error('Error fetching tax rates:', error)
    return []
  }
}

// Calculate tax for a given country, state, and amount
export function calculateTax(
  amount: number,
  country: string,
  state: string,
  taxRates: TaxRate[]
): { taxAmount: number; taxRate: number } {
  // Find matching tax rate - prioritize exact country match
  const matchingRate = taxRates.find(rate => {
    // Match country exactly
    if (rate.country !== country) {
      // If there's a wildcard rate (empty country), we'll use it as fallback
      if (rate.country !== '') return false
    }

    // Match state if specified in the tax rate
    if (rate.state && rate.state !== state) return false

    return true
  })

  if (!matchingRate) {
    return { taxAmount: 0, taxRate: 0 }
  }

  const taxRate = parseFloat(matchingRate.rate)

  // Prices include tax, so we need to extract the tax amount
  // Formula: tax = (price * rate) / (100 + rate)
  const taxAmount = (amount * taxRate) / (100 + taxRate)

  return { taxAmount, taxRate }
}

// Get net price (excluding tax) from gross price (including tax)
export function getNetPrice(grossPrice: number, taxRate: number): number {
  return grossPrice / (1 + taxRate / 100)
}

// Country emoji flags mapping
export const countryFlags: { [key: string]: string } = {
  'US': '🇺🇸',
  'GB': '🇬🇧',
  'DE': '🇩🇪',
  'FR': '🇫🇷',
  'IT': '🇮🇹',
  'ES': '🇪🇸',
  'CA': '🇨🇦',
  'AU': '🇦🇺',
  'NZ': '🇳🇿',
  'JP': '🇯🇵',
  'CN': '🇨🇳',
  'IN': '🇮🇳',
  'BR': '🇧🇷',
  'MX': '🇲🇽',
  'AR': '🇦🇷',
  'CL': '🇨🇱',
  'CO': '🇨🇴',
  'PE': '🇵🇪',
  'AT': '🇦🇹',
  'BE': '🇧🇪',
  'BG': '🇧🇬',
  'HR': '🇭🇷',
  'CY': '🇨🇾',
  'CZ': '🇨🇿',
  'DK': '🇩🇰',
  'EE': '🇪🇪',
  'FI': '🇫🇮',
  'GR': '🇬🇷',
  'HU': '🇭🇺',
  'IE': '🇮🇪',
  'LV': '🇱🇻',
  'LT': '🇱🇹',
  'LU': '🇱🇺',
  'MT': '🇲🇹',
  'NL': '🇳🇱',
  'PL': '🇵🇱',
  'PT': '🇵🇹',
  'RO': '🇷🇴',
  'SK': '🇸🇰',
  'SI': '🇸🇮',
  'SE': '🇸🇪',
  'CH': '🇨🇭',
  'NO': '🇳🇴',
  'IS': '🇮🇸',
  'TR': '🇹🇷',
  'RU': '🇷🇺',
  'UA': '🇺🇦',
  'IL': '🇮🇱',
  'SA': '🇸🇦',
  'AE': '🇦🇪',
  'ZA': '🇿🇦',
  'EG': '🇪🇬',
  'NG': '🇳🇬',
  'KE': '🇰🇪',
  'KR': '🇰🇷',
  'SG': '🇸🇬',
  'MY': '🇲🇾',
  'TH': '🇹🇭',
  'VN': '🇻🇳',
  'PH': '🇵🇭',
  'ID': '🇮🇩',
  'PK': '🇵🇰',
  'BD': '🇧🇩',
}

// Top countries for quick select (popular e-commerce markets)
export const topCountries = [
  'US', // United States
  'GB', // United Kingdom
  'DE', // Germany
  'CA', // Canada
  'AU', // Australia
  'FR', // France
  'IT', // Italy
  'ES', // Spain
  'NL', // Netherlands
  'BE', // Belgium
  'AT', // Austria
  'CH', // Switzerland
]
