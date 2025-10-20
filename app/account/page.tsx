import { getAllCourses } from '@/lib/woocommerce/courses'
import { wooClient } from '@/lib/woocommerce/client'
import AccountClient from './account-client'

export default async function AccountPage() {
  // Pre-fetch courses on server (instant, like /courses page)
  let initialCourses: any[] = []
  try {
    initialCourses = await getAllCourses()
    console.log('[Account Server] Fetched courses:', initialCourses.length)
  } catch (error) {
    console.error('[Account Server] Error fetching courses:', error)
  }

  // Pre-fetch recent orders on server (much faster than client-side)
  let initialOrders: any[] = []
  try {
    // We can't get customer ID here without session, so we'll fetch on client
    // But we can prepare the structure
    initialOrders = []
  } catch (error) {
    console.error('[Account Server] Error fetching orders:', error)
  }

  return <AccountClient initialCourses={initialCourses} initialOrders={initialOrders} />
}
