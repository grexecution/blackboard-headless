/**
 * Get user's country from IP address using a free geolocation service
 */
export async function getCountryFromIP(): Promise<string> {
  try {
    // Try ipapi.co first (no API key required, 1000 requests/day free)
    const response = await fetch('https://ipapi.co/json/', {
      cache: 'force-cache',
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (response.ok) {
      const data = await response.json()
      if (data.country_code) {
        console.log(`[Geolocation] Detected country from IP: ${data.country_code}`)
        return data.country_code
      }
    }
  } catch (error) {
    console.error('[Geolocation] Failed to detect country from IP:', error)
  }

  // Fallback to Germany (your primary market)
  console.log('[Geolocation] Using default country: DE')
  return 'DE'
}

/**
 * Get user's country from IP (client-side)
 */
export async function getCountryFromIPClient(): Promise<string> {
  try {
    // Use our API route to avoid CORS issues
    const response = await fetch('/api/geolocation')

    if (response.ok) {
      const data = await response.json()
      if (data.country) {
        console.log(`[Geolocation Client] Detected country: ${data.country}`)
        return data.country
      }
    }
  } catch (error) {
    console.error('[Geolocation Client] Failed to detect country:', error)
  }

  // Fallback to Germany
  return 'DE'
}
