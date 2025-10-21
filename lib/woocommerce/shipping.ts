import { wooClient } from './client'

export interface ShippingRule {
  conditions: Array<{
    condition_id: string
    min: string
    max: string
  }>
  cost_per_order: string
  additional_costs?: any[]
  special_action?: string
}

export interface ShippingMethod {
  id: number
  instance_id: number
  title: string
  enabled: boolean
  method_id: string
  settings: {
    method_rules?: {
      value: ShippingRule[]
    }
    [key: string]: any
  }
}

export interface ShippingZone {
  id: number
  name: string
  order: number
}

export interface ShippingZoneWithMethods extends ShippingZone {
  methods: ShippingMethod[]
  locations?: Array<{
    code: string
    type: string
  }>
}

// Cache for shipping zones (fetched once during build)
let cachedShippingZones: ShippingZoneWithMethods[] | null = null

/**
 * Fetch all shipping zones with their methods and locations
 */
export async function getAllShippingZones(): Promise<ShippingZoneWithMethods[]> {
  // Return cached data if available
  if (cachedShippingZones) {
    return cachedShippingZones
  }

  try {
    // 1. Fetch all shipping zones
    const zones = await wooClient.request<ShippingZone[]>('/shipping/zones')

    // 2. Fetch methods and locations for each zone
    const zonesWithMethods = await Promise.all(
      zones.map(async (zone) => {
        const [methods, locations] = await Promise.all([
          wooClient.request<ShippingMethod[]>(`/shipping/zones/${zone.id}/methods`),
          wooClient.request<Array<{ code: string; type: string }>>(`/shipping/zones/${zone.id}/locations`)
        ])

        return {
          ...zone,
          methods,
          locations
        }
      })
    )

    cachedShippingZones = zonesWithMethods
    return zonesWithMethods
  } catch (error) {
    console.error('Error fetching shipping zones:', error)
    return []
  }
}

// European Union country codes (as per WooCommerce continent definitions)
const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI',
  'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT',
  'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'
]

/**
 * Check if a country is in a continent
 */
function isCountryInContinent(countryCode: string, continentCode: string): boolean {
  if (continentCode === 'EU') {
    return EU_COUNTRIES.includes(countryCode)
  }
  // Add other continent mappings if needed
  return false
}

/**
 * Find the appropriate shipping zone for a given country code
 * Priority: State > Country > Continent > Default Zone
 */
export function findShippingZoneForCountry(
  zones: ShippingZoneWithMethods[],
  countryCode: string,
  stateCode?: string
): ShippingZoneWithMethods | null {
  let matches: Array<{ zone: ShippingZoneWithMethods; priority: number }> = []

  for (const zone of zones) {
    if (!zone.locations || zone.locations.length === 0) {
      // Zone 0 has no locations - it's the default fallback
      if (zone.id === 0) {
        matches.push({ zone, priority: 0 }) // Lowest priority
      }
      continue
    }

    for (const location of zone.locations) {
      // Priority 3: State-level match (highest priority)
      if (location.type === 'state' && stateCode) {
        const [country, state] = location.code.split(':')
        if (country === countryCode && state === stateCode) {
          matches.push({ zone, priority: 3 })
          break
        }
      }

      // Priority 2: Country-level match
      if (location.type === 'country' && location.code === countryCode) {
        matches.push({ zone, priority: 2 })
        break
      }

      // Priority 1: Continent-level match (lower priority)
      if (location.type === 'continent' && isCountryInContinent(countryCode, location.code)) {
        matches.push({ zone, priority: 1 })
        break
      }
    }
  }

  if (matches.length === 0) {
    return null
  }

  // Sort by priority (highest first) and return the best match
  matches.sort((a, b) => b.priority - a.priority)
  return matches[0].zone
}

/**
 * Calculate shipping cost based on total cart weight and shipping zone
 */
export function calculateShippingCost(
  zone: ShippingZoneWithMethods,
  totalWeightKg: number
): { cost: number; methodTitle: string } | null {
  // Find the first enabled Flexible Shipping method
  const flexibleShippingMethod = zone.methods.find(
    method => method.enabled && method.method_id === 'flexible_shipping_single'
  )

  if (!flexibleShippingMethod || !flexibleShippingMethod.settings.method_rules) {
    // No flexible shipping method found, return null
    return null
  }

  const rules = flexibleShippingMethod.settings.method_rules.value

  // Find the matching rule based on weight
  const matchingRule = rules.find(rule => {
    const weightCondition = rule.conditions.find(c => c.condition_id === 'weight')
    if (!weightCondition) return false

    const min = parseFloat(weightCondition.min)
    const max = parseFloat(weightCondition.max)

    return totalWeightKg >= min && totalWeightKg <= max
  })

  if (!matchingRule) {
    // No matching rule found - weight might be outside configured ranges
    console.warn(`No shipping rule found for weight ${totalWeightKg}kg in zone ${zone.name}`)
    return null
  }

  return {
    cost: parseFloat(matchingRule.cost_per_order),
    methodTitle: flexibleShippingMethod.title
  }
}

/**
 * Calculate total weight of cart items
 */
export function calculateCartWeight(items: Array<{ weight?: string | number; quantity: number }>): number {
  let totalWeight = 0

  for (const item of items) {
    if (!item.weight) continue

    const weight = typeof item.weight === 'string' ? parseFloat(item.weight) : item.weight

    if (isNaN(weight) || weight <= 0) continue

    totalWeight += weight * item.quantity
  }

  return totalWeight
}

/**
 * Main function to calculate shipping for checkout
 */
export async function calculateShippingForCheckout(
  countryCode: string,
  cartItems: Array<{ id: number; weight?: string | number; quantity: number }>
): Promise<{ cost: number; methodTitle: string } | null> {
  // 1. Get all shipping zones
  const zones = await getAllShippingZones()

  if (zones.length === 0) {
    console.error('No shipping zones configured')
    return null
  }

  // 2. Find the zone for this country
  const zone = findShippingZoneForCountry(zones, countryCode)

  if (!zone) {
    console.warn(`No shipping zone found for country ${countryCode}`)
    return null
  }

  // 3. Calculate total cart weight
  const totalWeight = calculateCartWeight(cartItems)

  if (totalWeight === 0) {
    // Cart has no physical products (all virtual/digital)
    // Return free shipping or null
    console.log('Cart has no weight (virtual products only)')
    return { cost: 0, methodTitle: 'Free Shipping' }
  }

  // 4. Calculate shipping cost based on weight and zone
  return calculateShippingCost(zone, totalWeight)
}
