/**
 * ProCoach data fetching utilities
 * Fetches ProCoach data from WordPress REST API
 */

export interface ProCoach {
  id: number
  title: string
  slug: string
  coach_name: string
  company_name?: string
  address: string
  latitude: number
  longitude: number
  phone?: string
  email: string
  website?: string
  certification_date?: string
  specialties?: string
  image_url?: string
  date: string
  modified: string
}

const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL || 'https://blackboard-training.com'

/**
 * Fetch all ProCoaches from WordPress
 */
export async function getAllProCoaches(): Promise<ProCoach[]> {
  try {
    const response = await fetch(`${WORDPRESS_API_URL}/wp-json/blackboard/v1/procoaches`, {
      next: { revalidate: false }, // Static generation
    })

    if (!response.ok) {
      console.error('Failed to fetch procoaches:', response.statusText)
      return []
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching procoaches:', error)
    return []
  }
}

/**
 * Fetch a single ProCoach by ID
 */
export async function getProCoachById(id: number): Promise<ProCoach | null> {
  try {
    const response = await fetch(`${WORDPRESS_API_URL}/wp-json/blackboard/v1/procoaches/${id}`, {
      next: { revalidate: false }, // Static generation
    })

    if (!response.ok) {
      console.error('Failed to fetch procoach:', response.statusText)
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching procoach:', error)
    return null
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return Math.round(distance * 10) / 10 // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Filter ProCoaches by distance from a location
 */
export function filterProCoachesByDistance(
  procoaches: ProCoach[],
  userLat: number,
  userLon: number,
  maxDistance: number // in kilometers
): Array<ProCoach & { distance: number }> {
  return procoaches
    .map(coach => ({
      ...coach,
      distance: calculateDistance(userLat, userLon, coach.latitude, coach.longitude)
    }))
    .filter(coach => coach.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)
}

/**
 * Search ProCoaches by name, company, or location
 */
export function searchProCoaches(procoaches: ProCoach[], query: string): ProCoach[] {
  const lowerQuery = query.toLowerCase().trim()

  if (!lowerQuery) {
    return procoaches
  }

  return procoaches.filter(coach => {
    return (
      coach.coach_name?.toLowerCase().includes(lowerQuery) ||
      coach.company_name?.toLowerCase().includes(lowerQuery) ||
      coach.address?.toLowerCase().includes(lowerQuery) ||
      coach.specialties?.toLowerCase().includes(lowerQuery)
    )
  })
}

/**
 * Get Google Maps directions URL
 */
export function getGoogleMapsDirectionsUrl(address: string): string {
  const encodedAddress = encodeURIComponent(address)
  return `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`
}
