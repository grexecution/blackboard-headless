import { getAllCountries, getAllTaxRates, Country, TaxRate } from '@/lib/woocommerce/countries-taxes'
import { getAllShippingZones, ShippingZoneWithMethods } from '@/lib/woocommerce/shipping'
import { getAllTestimonials } from '@/lib/woocommerce/testimonials'
import CheckoutClient from './checkout-client'

export default async function CheckoutPage() {
  // Pre-fetch countries, tax rates, shipping zones, and testimonials on server
  let countries: Country[] = []
  let taxRates: TaxRate[] = []
  let shippingZones: ShippingZoneWithMethods[] = []
  let testimonials: any[] = []

  try {
    countries = await getAllCountries()
  } catch (error) {
    console.error('[Checkout Server] Error fetching countries:', error)
  }

  try {
    taxRates = await getAllTaxRates()
  } catch (error) {
    console.error('[Checkout Server] Error fetching tax rates:', error)
  }

  try {
    shippingZones = await getAllShippingZones()
  } catch (error) {
    console.error('[Checkout Server] Error fetching shipping zones:', error)
  }

  try {
    testimonials = await getAllTestimonials()
  } catch (error) {
    console.error('[Checkout Server] Error fetching testimonials:', error)
  }

  return <CheckoutClient countries={countries} taxRates={taxRates} shippingZones={shippingZones} testimonials={testimonials} />
}
