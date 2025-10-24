import { NextRequest, NextResponse } from 'next/server'

// EU country codes (without DE since Germany always has VAT)
const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL',
  'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
]

// VAT number format patterns for EU countries (min/max length after country code)
const VAT_FORMATS: Record<string, { min: number; max: number; pattern?: RegExp }> = {
  AT: { min: 9, max: 9, pattern: /^U\d{8}$/ }, // ATU12345678
  BE: { min: 10, max: 10, pattern: /^\d{10}$/ }, // BE0123456789
  BG: { min: 9, max: 10, pattern: /^\d{9,10}$/ }, // BG123456789
  HR: { min: 11, max: 11, pattern: /^\d{11}$/ }, // HR12345678901
  CY: { min: 9, max: 9, pattern: /^\d{8}[A-Z]$/ }, // CY12345678A
  CZ: { min: 8, max: 10, pattern: /^\d{8,10}$/ }, // CZ12345678
  DK: { min: 8, max: 8, pattern: /^\d{8}$/ }, // DK12345678
  EE: { min: 9, max: 9, pattern: /^\d{9}$/ }, // EE123456789
  FI: { min: 8, max: 8, pattern: /^\d{8}$/ }, // FI12345678
  FR: { min: 11, max: 11, pattern: /^[A-Z0-9]{2}\d{9}$/ }, // FR12345678901
  GR: { min: 9, max: 9, pattern: /^\d{9}$/ }, // GR123456789 (EL in VIES)
  HU: { min: 8, max: 8, pattern: /^\d{8}$/ }, // HU12345678
  IE: { min: 8, max: 9, pattern: /^\d{7}[A-Z]{1,2}$/ }, // IE1234567A
  IT: { min: 11, max: 11, pattern: /^\d{11}$/ }, // IT12345678901
  LV: { min: 11, max: 11, pattern: /^\d{11}$/ }, // LV12345678901
  LT: { min: 9, max: 12, pattern: /^\d{9}(\d{3})?$/ }, // LT123456789
  LU: { min: 8, max: 8, pattern: /^\d{8}$/ }, // LU12345678
  MT: { min: 8, max: 8, pattern: /^\d{8}$/ }, // MT12345678
  NL: { min: 12, max: 12, pattern: /^\d{9}B\d{2}$/ }, // NL123456789B01
  PL: { min: 10, max: 10, pattern: /^\d{10}$/ }, // PL1234567890
  PT: { min: 9, max: 9, pattern: /^\d{9}$/ }, // PT123456789
  RO: { min: 2, max: 10, pattern: /^\d{2,10}$/ }, // RO12
  SK: { min: 10, max: 10, pattern: /^\d{10}$/ }, // SK1234567890
  SI: { min: 8, max: 8, pattern: /^\d{8}$/ }, // SI12345678
  ES: { min: 9, max: 9, pattern: /^[A-Z0-9]\d{7}[A-Z0-9]$/ }, // ESA1234567B
  SE: { min: 12, max: 12, pattern: /^\d{12}$/ }, // SE123456789012
}

/**
 * Fallback format validation when VIES API is unavailable
 */
function validateVATFormat(countryCode: string, vatNumber: string): { valid: boolean; error?: string } {
  const format = VAT_FORMATS[countryCode]

  if (!format) {
    return { valid: false, error: 'Unknown country code format' }
  }

  // Check length
  if (vatNumber.length < format.min || vatNumber.length > format.max) {
    return {
      valid: false,
      error: `VAT number should be ${format.min}${format.min !== format.max ? `-${format.max}` : ''} characters for ${countryCode}`
    }
  }

  // Check pattern if defined
  if (format.pattern && !format.pattern.test(vatNumber)) {
    return { valid: false, error: 'VAT number format is incorrect' }
  }

  return { valid: true }
}

interface VATValidationResponse {
  valid: boolean
  countryCode?: string
  vatNumber?: string
  name?: string
  address?: string
  error?: string
}

/**
 * Validate EU VAT number using the EU VIES API
 * POST /api/vat/validate
 * Body: { vatNumber: string, countryCode: string }
 */
export async function POST(request: NextRequest) {
  let vatNumber = ''
  let countryCode = ''
  let vatNumberOnly = ''

  try {
    const body = await request.json()
    vatNumber = body.vatNumber
    countryCode = body.countryCode

    if (!vatNumber || !countryCode) {
      return NextResponse.json(
        { valid: false, error: 'VAT number and country code are required' },
        { status: 400 }
      )
    }

    // Clean VAT number (remove spaces, dashes, etc.)
    const cleanVatNumber = vatNumber.replace(/[\s\-\.]/g, '').toUpperCase()

    // Check if country is in EU (excluding Germany)
    if (countryCode === 'DE') {
      return NextResponse.json({
        valid: false,
        error: 'German companies must pay VAT regardless of VAT ID',
      })
    }

    if (!EU_COUNTRIES.includes(countryCode)) {
      return NextResponse.json({
        valid: false,
        error: 'VAT validation is only available for EU countries',
      })
    }

    // Remove country code from VAT number if it's included
    vatNumberOnly = cleanVatNumber
    if (cleanVatNumber.startsWith(countryCode)) {
      vatNumberOnly = cleanVatNumber.substring(countryCode.length)
    }

    console.log(`[VAT Validation] Validating ${countryCode}${vatNumberOnly}`)

    // Call EU VIES API using the correct endpoint format
    // The VIES service uses query parameters, not POST body
    const viesUrl = `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${vatNumberOnly}`

    console.log(`[VAT Validation] Calling VIES URL: ${viesUrl}`)

    const response = await fetch(viesUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('[VAT Validation] VIES API error:', response.status, response.statusText)

      // If VIES service is unavailable, use fallback format validation
      if (response.status === 503 || response.status === 500) {
        console.log('[VAT Validation] VIES unavailable, using fallback format validation')

        const formatCheck = validateVATFormat(countryCode, vatNumberOnly)

        if (formatCheck.valid) {
          return NextResponse.json({
            valid: true,
            countryCode,
            vatNumber: `${countryCode}${vatNumberOnly}`,
            fallbackValidation: true,
            message: 'VAT format is valid (VIES service unavailable, format-only validation used)',
          })
        } else {
          return NextResponse.json({
            valid: false,
            error: formatCheck.error || 'Invalid VAT number format',
            serviceUnavailable: true,
          })
        }
      }

      return NextResponse.json(
        { valid: false, error: 'VAT validation failed' },
        { status: response.status }
      )
    }

    const data = await response.json()

    console.log('[VAT Validation] Response:', data)

    // VIES API response structure:
    // {
    //   "isValid": true/false,
    //   "requestDate": "2024-01-01",
    //   "userError": "INVALID_INPUT" (if error),
    //   "name": "Company Name",
    //   "address": "Company Address"
    // }

    if (data.isValid) {
      return NextResponse.json({
        valid: true,
        countryCode,
        vatNumber: `${countryCode}${vatNumberOnly}`,
        name: data.name || undefined,
        address: data.address || undefined,
      })
    } else {
      return NextResponse.json({
        valid: false,
        error: data.userError || 'Invalid VAT number',
      })
    }
  } catch (error: any) {
    console.error('[VAT Validation] Error:', error)

    // Try format validation as fallback on network/fetch errors
    if (countryCode && vatNumberOnly) {
      console.log('[VAT Validation] Network error, attempting fallback format validation')

      const formatCheck = validateVATFormat(countryCode, vatNumberOnly)

      if (formatCheck.valid) {
        return NextResponse.json({
          valid: true,
          countryCode,
          vatNumber: `${countryCode}${vatNumberOnly}`,
          fallbackValidation: true,
          message: 'VAT format is valid (VIES service unavailable, format-only validation used)',
        })
      } else {
        return NextResponse.json({
          valid: false,
          error: formatCheck.error || 'Invalid VAT number format',
          serviceUnavailable: true,
        })
      }
    }

    // If we don't have the data for fallback validation, return generic error
    return NextResponse.json(
      {
        valid: false,
        error: error.message || 'VAT validation failed',
        serviceUnavailable: true
      },
      { status: 500 }
    )
  }
}
