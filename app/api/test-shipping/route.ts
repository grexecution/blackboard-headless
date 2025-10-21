import { NextResponse } from 'next/server'
import { wooClient } from '@/lib/woocommerce/client'

export async function GET() {
  try {
    const results: any = {
      zones: [],
      zoneMethods: {},
      products: [],
      flexibleShipping: null
    }

    // 1. Fetch all shipping zones
    console.log('Fetching shipping zones...')
    results.zones = await wooClient.request('/shipping/zones')
    console.log(`Found ${results.zones.length} shipping zones`)

    // 2. Fetch methods and locations for each zone
    for (const zone of results.zones) {
      console.log(`Fetching methods and locations for zone ${zone.id}: ${zone.name}`)
      const [methods, locations] = await Promise.all([
        wooClient.request(`/shipping/zones/${zone.id}/methods`),
        wooClient.request(`/shipping/zones/${zone.id}/locations`)
      ])
      results.zoneMethods[zone.id] = {
        zoneName: zone.name,
        methods: methods,
        locations: locations
      }
    }

    // 3. Fetch sample products to check weight
    console.log('Fetching sample products to check weight data...')
    const products = await wooClient.request('/products?per_page=10')
    results.products = products.map((product: any) => ({
      id: product.id,
      name: product.name,
      weight: product.weight || 'not set',
      dimensions: product.dimensions,
      price: product.price
    }))

    // 4. Try to fetch Flexible Shipping data
    console.log('Testing Flexible Shipping plugin endpoints...')
    try {
      const flexShipping = await fetch('https://blackboard-training.com/wp-json/flexible-shipping/v1')
      results.flexibleShipping = await flexShipping.json()
    } catch (error: any) {
      results.flexibleShipping = { error: error.message }
    }

    return NextResponse.json(results, { status: 200 })
  } catch (error: any) {
    console.error('Error:', error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
