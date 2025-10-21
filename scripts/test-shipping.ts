import { wooClient } from '../lib/woocommerce/client'

async function testShipping() {
  console.log('=== TESTING WOOCOMMERCE SHIPPING API ===\n')

  try {
    // 1. Fetch all shipping zones
    console.log('1. Fetching shipping zones...')
    const zones = await wooClient.request('/shipping/zones')
    console.log('Shipping zones:', JSON.stringify(zones, null, 2))
    console.log(`Found ${zones.length} shipping zones\n`)

    // 2. Fetch methods for each zone
    for (const zone of zones) {
      console.log(`\n2. Fetching methods for zone ${zone.id}: ${zone.name}`)
      const methods = await wooClient.request(`/shipping/zones/${zone.id}/methods`)
      console.log(`Zone ${zone.name} methods:`, JSON.stringify(methods, null, 2))
    }

    // 3. Fetch sample products to check weight
    console.log('\n\n3. Fetching sample products to check weight data...')
    const products = await wooClient.request('/products?per_page=5')
    products.forEach((product: any) => {
      console.log(`\nProduct: ${product.name}`)
      console.log(`  - ID: ${product.id}`)
      console.log(`  - Weight: ${product.weight || 'not set'}`)
      console.log(`  - Dimensions: ${JSON.stringify(product.dimensions)}`)
    })

    // 4. Try to fetch Flexible Shipping data
    console.log('\n\n4. Testing Flexible Shipping plugin endpoints...')
    try {
      // Flexible Shipping uses a custom namespace, not wc/v3
      const flexShipping = await fetch('https://blackboard-training.com/wp-json/flexible-shipping/v1')
      const flexData = await flexShipping.json()
      console.log('Flexible Shipping API:', JSON.stringify(flexData, null, 2))
    } catch (error: any) {
      console.log('Flexible Shipping API error:', error.message)
    }

  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

testShipping()
