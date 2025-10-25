'use client'

import { signOut } from 'next-auth/react'
import { useEffect, useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  User, Mail, Phone, MapPin, Package, CreditCard, LogOut, ChevronRight,
  Loader2, Settings, Star, BookOpen, Award, Bell, Shield, RefreshCw,
  ExternalLink, TrendingUp, DollarSign, Calendar, Clock, Video, CheckCircle,
  Lock, PlayCircle
} from 'lucide-react'
import { useRequireAuth } from '@/hooks/use-require-auth'
import Link from 'next/link'
import Image from 'next/image'
import { getAllCourses, getUserProgress, checkCourseAccess } from '@/lib/lms/api'
import CoursesGridSimple from '@/components/courses/courses-grid-simple'
import CoursesGridWithTrainingCenter from '@/components/courses/courses-grid-with-training-center'
import { ResellerBenefitsTable } from '@/components/reseller/reseller-benefits-table'

interface AccountClientProps {
  initialCourses: any[]
  initialOrders: any[]
}

export default function AccountClient({ initialCourses, initialOrders }: AccountClientProps) {
  const { session, isLoading: authLoading } = useRequireAuth('/account')
  const { data: sessionData } = useSession()

  // Use pre-fetched data immediately (instant like /courses page)
  const [orders, setOrders] = useState<any[]>(initialOrders)

  // Filter courses by access using session data (same pattern as CoursesGrid)
  const courses = useMemo(() => {
    const enrolledCourseIds = (sessionData as any)?.enrolledCourseIds || []

    return initialCourses
      .filter(course =>
        // Show if user has access OR if it's a free course
        course.access?.has_access === true ||
        course.access?.is_free === true ||
        enrolledCourseIds.includes(course.id)
      )
      .map(course => ({
        ...course,
        access: {
          ...course.access,
          has_access: true,
          reason: 'enrolled'
        }
      }))
  }, [initialCourses, sessionData])
  const [certificates, setCertificates] = useState<any[]>([])
  const [addresses, setAddresses] = useState<any>({
    billing: session?.user?.billing || {},
    shipping: session?.user?.shipping || {}
  })
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [affiliateData, setAffiliateData] = useState<any>(null)
  const [loading, setLoading] = useState(false) // Start as false since we load immediately
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  // Use addresses from session immediately - no API call needed
  useEffect(() => {
    if (session) {
      setAddresses({
        billing: session.user.billing || {},
        shipping: session.user.shipping || {}
      })
    }
  }, [session])

  // Fetch orders on dashboard or orders tab (needed for recent orders display)
  useEffect(() => {
    if ((activeTab === 'dashboard' || activeTab === 'orders') && orders.length === 0 && !ordersLoading && session) {
      fetchOrders()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, session])

  // Courses are pre-loaded from server - no fetching needed!

  // Lazy load certificates when certificates tab is opened
  useEffect(() => {
    if (activeTab === 'certificates' && certificates.length === 0 && session) {
      fetchCertificates()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  // Check affiliate status only (lightweight, can run immediately)
  useEffect(() => {
    if (session) {
      fetch('/api/affiliate/dashboard')
        .then(res => res.ok ? res.json() : null)
        .then(data => setAffiliateData(data))
        .catch(() => setAffiliateData(null))
    }
  }, [session])

  const fetchOrders = async () => {
    setOrdersLoading(true)
    try {
      // Fetch only recent orders (last 20) for faster loading
      // User can always load more if needed
      const res = await fetch('/api/woo/orders?customer=' + session?.user.id + '&per_page=20&orderby=date&order=desc')
      const data = await res.json()
      setOrders(data)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setOrdersLoading(false)
    }
  }

  // fetchCourses removed - courses are now pre-fetched on server!

  const fetchCertificates = async () => {
    try {
      const res = await fetch('/api/tutor/certificates')
      const data = await res.json()
      setCertificates(data)
    } catch (error) {
      console.error('Failed to fetch certificates:', error)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-bb-primary" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Check affiliate status (from affiliate system API)
  const isAffiliate = affiliateData && affiliateData.status === 'active'

  // Check reseller role (from WooCommerce user role)
  const isReseller = session?.user?.role === 'reseller'

  const baseMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: User },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'certificates', label: 'Certificates', icon: Award },
    ...(isReseller ? [{ id: 'reseller', label: 'Reseller', icon: DollarSign }] : []),
    { id: 'account-details', label: 'Account Details', icon: Settings },
  ]

  // Add affiliate dashboard if user is an affiliate (NOT related to reseller role)
  const menuItems = isAffiliate ? [
    ...baseMenuItems,
    { id: 'affiliate', label: 'Affiliate Dashboard', icon: TrendingUp }
  ] : baseMenuItems

  return (
    <div className="bb-modern-dashboard">
      {/* Background gradient */}
      <div className="fixed top-0 left-0 right-0 h-96 bg-gradient-to-b from-bb-primary/5 to-transparent pointer-events-none z-0" />
      
      <div className="relative z-10 pt-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bb-welcome-section mb-5"
        >
          <div className="bb-welcome-decoration absolute" />
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <h1 className="bb-welcome-title">
                Welcome back, {session.user.firstName || session.user.name}!
                {isAffiliate && (
                  <span className="bb-affiliate-badge">AFFILIATE</span>
                )}
                {isReseller && (
                  <span className="bb-affiliate-badge" style={{ backgroundColor: '#10b981', marginLeft: '0.5rem' }}>RESELLER</span>
                )}
              </h1>
              <p className="bb-welcome-subtitle">
                Access your courses, track progress, and manage your learning journey
              </p>
            </div>
            <button
              onClick={() => signOut()}
              className="bb-nav-item bb-nav-logout"
            >
              <div className="bb-nav-icon">
                <LogOut />
              </div>
              <span>Logout</span>
            </button>
          </div>
        </motion.div>

        {/* Sync Message */}
        {/*<motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bb-sync-message"
        >
          <RefreshCw className="w-5 h-5" />
          <span>All your data is synchronized with your WordPress account in real-time.</span>
        </motion.div>*/}

        {/* Navigation Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bb-navigation-section"
        >
          <div className="bb-nav-grid">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`bb-nav-item ${activeTab === item.id ? 'bb-nav-active' : ''}`}
                >
                  <div className="bb-nav-icon">
                    <Icon />
                  </div>
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Dashboard Content */}
        <div className="bb-dashboard-grid">
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-10"
            >
              {/* Quick Stats */}
              <div className="bb-dashboard-section">
                <div className="bb-section-header">
                  <h2>Quick Overview</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button
                    onClick={() => setActiveTab('courses')}
                    className="bg-gradient-to-br from-[#ffed00]/10 to-yellow-100/50 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-[#ffed00] group"
                  >
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-900 group-hover:scale-110 transition-transform" />
                    <div className="text-3xl font-bold text-gray-900 mb-1">{courses.length}</div>
                    <div className="text-sm text-gray-600 font-medium">Enrolled Courses</div>
                    <div className="mt-3 text-xs text-gray-500 flex items-center justify-center gap-1">
                      View Courses <ChevronRight className="w-3 h-3" />
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('orders')
                      if (orders.length === 0 && !ordersLoading) {
                        fetchOrders()
                      }
                    }}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-gray-300 group"
                  >
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-900 group-hover:scale-110 transition-transform" />
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {ordersLoading ? (
                        <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                      ) : (
                        orders.length
                      )}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Total Orders</div>
                    <div className="mt-3 text-xs text-gray-500 flex items-center justify-center gap-1">
                      View Orders <ChevronRight className="w-3 h-3" />
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('certificates')}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-gray-300 group"
                  >
                    <Award className="w-12 h-12 mx-auto mb-4 text-gray-900 group-hover:scale-110 transition-transform" />
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {courses.filter((course: any) => {
                        if (typeof window === 'undefined') return false
                        const certData = localStorage.getItem(`course_${course.id}_certificate`)
                        return certData && JSON.parse(certData).generated
                      }).length}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Certificates Earned</div>
                    <div className="mt-3 text-xs text-gray-500 flex items-center justify-center gap-1">
                      View Certificates <ChevronRight className="w-3 h-3" />
                    </div>
                  </button>
                </div>
              </div>

              {/* My Courses */}
              <div className="bb-dashboard-section">
                <div className="bb-section-header">
                  <h2>My Courses</h2>
                  <button onClick={() => setActiveTab('courses')} className="bb-view-all">
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                {courses.length > 0 ? (
                  <CoursesGridWithTrainingCenter initialCourses={courses.slice(0, 3)} />
                ) : (
                  <div className="bb-empty-state">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600 mb-4">No courses enrolled yet</p>
                    <Link href="/courses" className="bb-btn-primary inline-block">
                      Browse Courses
                    </Link>
                  </div>
                )}
              </div>

              {/* Recent Orders */}
              <div className="bb-dashboard-section">
                <div className="bb-section-header">
                  <h2>Recent Orders</h2>
                  <button
                    onClick={() => {
                      setActiveTab('orders')
                      if (orders.length === 0 && !ordersLoading) {
                        fetchOrders()
                      }
                    }}
                    className="bb-view-all"
                  >
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : orders.length > 0 ? (
                  <div className="bb-orders-list">
                    {orders.slice(0, 3).map((order: any) => (
                      <div key={order.id} className="bb-order-item">
                        <div className="bb-order-header">
                          <div className="bb-order-info">
                            <div className="bb-order-number">#{order.number}</div>
                            <div className="bb-order-date">
                              {new Date(order.date_created).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </div>
                          </div>
                          <div className={`bb-order-status bb-status-${order.status}`}>
                            {order.status}
                          </div>
                        </div>

                        {/* Order Summary Info */}
                        <div className="mt-3 text-sm text-gray-600 space-y-1">
                          {order.shipping && (order.shipping.address_1 || order.shipping.first_name) ? (
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 mt-0.5 text-gray-400" />
                              <div>
                                <span className="text-gray-500">Shipped to:</span>{' '}
                                {order.shipping.first_name && order.shipping.last_name && (
                                  <span>{order.shipping.first_name} {order.shipping.last_name}, </span>
                                )}
                                {order.shipping.address_1 && (
                                  <>
                                    {order.shipping.address_1}
                                    {order.shipping.city && `, ${order.shipping.city}`}
                                    {order.shipping.state && `, ${order.shipping.state}`}
                                    {order.shipping.postcode && ` ${order.shipping.postcode}`}
                                  </>
                                )}
                              </div>
                            </div>
                          ) : order.billing && (order.billing.address_1 || order.billing.first_name) ? (
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 mt-0.5 text-gray-400" />
                              <div>
                                <span className="text-gray-500">Billed to:</span>{' '}
                                {order.billing.first_name && order.billing.last_name && (
                                  <span>{order.billing.first_name} {order.billing.last_name}, </span>
                                )}
                                {order.billing.address_1 && (
                                  <>
                                    {order.billing.address_1}
                                    {order.billing.city && `, ${order.billing.city}`}
                                    {order.billing.state && `, ${order.billing.state}`}
                                    {order.billing.postcode && ` ${order.billing.postcode}`}
                                  </>
                                )}
                              </div>
                            </div>
                          ) : null}

                          {order.line_items && order.line_items.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-500">
                                {order.line_items.length} item{order.line_items.length !== 1 ? 's' : ''}
                                {order.line_items.length <= 2 && (
                                  <>: {order.line_items.map((item: any) => item.name).join(', ')}</>
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="bb-order-footer mt-4">
                          <div className="bb-order-total">{order.total} {order.currency}</div>
                          <button
                            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            className="bb-details-button"
                          >
                            {expandedOrder === order.id ? 'Hide Details' : 'View Details'}
                            <ChevronRight className={`w-4 h-4 transition-transform ${expandedOrder === order.id ? 'rotate-90' : ''}`} />
                          </button>
                        </div>

                        {/* Expanded Order Details */}
                        {expandedOrder === order.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-gray-200 space-y-4"
                          >
                            {/* Order Items */}
                            {order.line_items && order.line_items.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-bb-dark mb-3 flex items-center gap-2">
                                  <Package className="w-4 h-4" />
                                  Order Items ({order.line_items.length})
                                </h4>
                                <div className="space-y-2">
                                  {order.line_items.map((item: any) => (
                                    <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 bg-bb-primary/10 rounded flex items-center justify-center text-xs font-bold">
                                            {item.quantity}x
                                          </div>
                                          <div>
                                            <div className="font-medium text-bb-dark">{item.name}</div>
                                            {item.sku && (
                                              <div className="text-xs text-gray-500">SKU: {item.sku}</div>
                                            )}
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="font-semibold text-bb-dark">{item.total} {order.currency}</div>
                                          {item.quantity > 1 && (
                                            <div className="text-xs text-gray-500">
                                              {(parseFloat(item.total) / item.quantity).toFixed(2)} each
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Payment Method */}
                            {order.payment_method_title && (
                              <div className="bg-blue-50 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-sm">
                                  <CreditCard className="w-4 h-4 text-blue-600" />
                                  <span className="font-medium text-bb-dark">Payment Method:</span>
                                  <span className="text-gray-600">{order.payment_method_title}</span>
                                </div>
                              </div>
                            )}

                            {/* Addresses */}
                            <div className="grid md:grid-cols-2 gap-4">
                              {/* Billing Address */}
                              {order.billing && (order.billing.address_1 || order.billing.first_name) && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <h5 className="font-semibold text-bb-dark mb-2 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Billing Address
                                  </h5>
                                  <div className="text-sm text-gray-600 space-y-1">
                                    {order.billing.first_name && order.billing.last_name && (
                                      <div>{order.billing.first_name} {order.billing.last_name}</div>
                                    )}
                                    {order.billing.company && <div>{order.billing.company}</div>}
                                    {order.billing.address_1 && <div>{order.billing.address_1}</div>}
                                    {order.billing.address_2 && <div>{order.billing.address_2}</div>}
                                    <div>
                                      {order.billing.postcode && <span>{order.billing.postcode} </span>}
                                      {order.billing.city && <span>{order.billing.city}</span>}
                                    </div>
                                    {order.billing.state && <div>{order.billing.state}</div>}
                                    {order.billing.country && <div>{order.billing.country}</div>}
                                    {order.billing.email && (
                                      <div className="flex items-center gap-1 pt-2 border-t border-gray-200 mt-2">
                                        <Mail className="w-3 h-3" />
                                        <span>{order.billing.email}</span>
                                      </div>
                                    )}
                                    {order.billing.phone && (
                                      <div className="flex items-center gap-1">
                                        <Phone className="w-3 h-3" />
                                        <span>{order.billing.phone}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Shipping Address */}
                              {order.shipping && (order.shipping.address_1 || order.shipping.first_name) && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <h5 className="font-semibold text-bb-dark mb-2 flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    Shipping Address
                                  </h5>
                                  <div className="text-sm text-gray-600 space-y-1">
                                    {order.shipping.first_name && order.shipping.last_name && (
                                      <div>{order.shipping.first_name} {order.shipping.last_name}</div>
                                    )}
                                    {order.shipping.company && <div>{order.shipping.company}</div>}
                                    {order.shipping.address_1 && <div>{order.shipping.address_1}</div>}
                                    {order.shipping.address_2 && <div>{order.shipping.address_2}</div>}
                                    <div>
                                      {order.shipping.postcode && <span>{order.shipping.postcode} </span>}
                                      {order.shipping.city && <span>{order.shipping.city}</span>}
                                    </div>
                                    {order.shipping.state && <div>{order.shipping.state}</div>}
                                    {order.shipping.country && <div>{order.shipping.country}</div>}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Customer Note */}
                            {order.customer_note && (
                              <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
                                <h5 className="font-semibold text-bb-dark mb-2">Customer Note</h5>
                                <p className="text-sm text-gray-600">{order.customer_note}</p>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bb-empty-state">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600 mb-4">No orders yet</p>
                    <Link href="/shop" className="bb-btn-primary inline-block">
                      Start Shopping
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bb-dashboard-section"
            >
              <div className="bb-section-header">
                <h2>Order History</h2>
                <button onClick={fetchOrders} className="bb-sync-button">
                  <RefreshCw className="w-4 h-4" />
                  Sync Orders
                </button>
              </div>
              {ordersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-bb-primary" />
                </div>
              ) : orders.length > 0 ? (
                <div className="bb-orders-list">
                  {orders.map((order: any) => (
                    <div key={order.id} className="bb-order-item">
                      <div className="bb-order-header">
                        <div className="bb-order-info">
                          <div className="bb-order-number">#{order.number}</div>
                          <div className="bb-order-date">
                            {new Date(order.date_created).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'long', 
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                        <div className={`bb-order-status bb-status-${order.status}`}>
                          {order.status}
                        </div>
                      </div>
                      
                      {/* Order Summary Info */}
                      <div className="mt-3 text-sm text-gray-600 space-y-1">
                        {order.shipping && (order.shipping.address_1 || order.shipping.first_name) ? (
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 mt-0.5 text-gray-400" />
                            <div>
                              <span className="text-gray-500">Shipped to:</span>{' '}
                              {order.shipping.first_name && order.shipping.last_name && (
                                <span>{order.shipping.first_name} {order.shipping.last_name}, </span>
                              )}
                              {order.shipping.address_1 && (
                                <>
                                  {order.shipping.address_1}
                                  {order.shipping.city && `, ${order.shipping.city}`}
                                  {order.shipping.state && `, ${order.shipping.state}`}
                                  {order.shipping.postcode && ` ${order.shipping.postcode}`}
                                </>
                              )}
                            </div>
                          </div>
                        ) : order.billing && (order.billing.address_1 || order.billing.first_name) ? (
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 mt-0.5 text-gray-400" />
                            <div>
                              <span className="text-gray-500">Billed to:</span>{' '}
                              {order.billing.first_name && order.billing.last_name && (
                                <span>{order.billing.first_name} {order.billing.last_name}, </span>
                              )}
                              {order.billing.address_1 && (
                                <>
                                  {order.billing.address_1}
                                  {order.billing.city && `, ${order.billing.city}`}
                                  {order.billing.state && `, ${order.billing.state}`}
                                  {order.billing.postcode && ` ${order.billing.postcode}`}
                                </>
                              )}
                            </div>
                          </div>
                        ) : null}
                        
                        {order.line_items && order.line_items.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-500">
                              {order.line_items.length} item{order.line_items.length !== 1 ? 's' : ''}
                              {order.line_items.length <= 2 && (
                                <>: {order.line_items.map((item: any) => item.name).join(', ')}</>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="bb-order-footer mt-4">
                        <div className="bb-order-total">{order.total} {order.currency}</div>
                        <button 
                          onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                          className="bb-details-button"
                        >
                          {expandedOrder === order.id ? 'Hide Details' : 'View Details'} 
                          <ChevronRight className={`w-4 h-4 transition-transform ${expandedOrder === order.id ? 'rotate-90' : ''}`} />
                        </button>
                      </div>
                      
                      {/* Expanded Order Details */}
                      {expandedOrder === order.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-gray-200 space-y-4"
                        >
                          {/* Order Items */}
                          {order.line_items && order.line_items.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-bb-dark mb-3 flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                Order Items ({order.line_items.length})
                              </h4>
                              <div className="space-y-2">
                                {order.line_items.map((item: any) => (
                                  <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-bb-primary/10 rounded flex items-center justify-center text-xs font-bold">
                                          {item.quantity}
                                        </div>
                                        <div>
                                          <div className="font-medium text-bb-dark">{item.name}</div>
                                          {item.variation && item.variation.length > 0 && (
                                            <div className="text-xs text-gray-600">
                                              {item.variation.map((v: any) => `${v.attribute}: ${v.value}`).join(', ')}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-medium">{item.total} {order.currency}</div>
                                        <div className="text-sm text-gray-600">{item.price} each</div>
                                      </div>
                                    </div>
                                    {item.sku && (
                                      <div className="text-xs text-gray-500">SKU: {item.sku}</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Order Summary */}
                          <div>
                            <h4 className="font-semibold text-bb-dark mb-3 flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              Order Summary
                            </h4>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Subtotal:</span>
                                <span>{order.total} {order.currency}</span>
                              </div>
                              {order.total_tax && parseFloat(order.total_tax) > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span>Tax:</span>
                                  <span>{order.total_tax} {order.currency}</span>
                                </div>
                              )}
                              {order.shipping_total && parseFloat(order.shipping_total) > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span>Shipping:</span>
                                  <span>{order.shipping_total} {order.currency}</span>
                                </div>
                              )}
                              <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                                <span>Total:</span>
                                <span>{order.total} {order.currency}</span>
                              </div>
                            </div>
                          </div>

                          {/* Customer Info */}
                          {(order.billing || order.shipping) && (
                            <div>
                              <h4 className="font-semibold text-bb-dark mb-3 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Customer Information
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {order.billing && (
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <h5 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-1">
                                      <CreditCard className="w-3 h-3" />
                                      Billing Address
                                    </h5>
                                    <div className="text-sm space-y-1">
                                      <div>{order.billing.first_name} {order.billing.last_name}</div>
                                      {order.billing.company && <div>{order.billing.company}</div>}
                                      <div>{order.billing.address_1}</div>
                                      {order.billing.address_2 && <div>{order.billing.address_2}</div>}
                                      <div>{order.billing.city}, {order.billing.state} {order.billing.postcode}</div>
                                      <div>{order.billing.country}</div>
                                      {order.billing.email && <div className="text-gray-600">{order.billing.email}</div>}
                                      {order.billing.phone && <div className="text-gray-600">{order.billing.phone}</div>}
                                    </div>
                                  </div>
                                )}
                                {order.shipping && (order.shipping.first_name || order.shipping.address_1) && (
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <h5 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-1">
                                      <Package className="w-3 h-3" />
                                      Shipping Address
                                    </h5>
                                    <div className="text-sm space-y-1">
                                      <div>{order.shipping.first_name} {order.shipping.last_name}</div>
                                      {order.shipping.company && <div>{order.shipping.company}</div>}
                                      <div>{order.shipping.address_1}</div>
                                      {order.shipping.address_2 && <div>{order.shipping.address_2}</div>}
                                      <div>{order.shipping.city}, {order.shipping.state} {order.shipping.postcode}</div>
                                      <div>{order.shipping.country}</div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Order Notes */}
                          {order.customer_note && (
                            <div>
                              <h4 className="font-semibold text-bb-dark mb-3 flex items-center gap-2">
                                <Bell className="w-4 h-4" />
                                Customer Note
                              </h4>
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                                {order.customer_note}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bb-empty-state">
                  <Package className="w-16 h-16 mx-auto mb-4" />
                  <p>No orders found</p>
                  <a href="#" className="bb-btn-primary">
                    Start Shopping
                  </a>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'courses' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Courses Section */}
              <div className="bb-dashboard-section">
                <div className="bb-section-header">
                  <h2>My Learning</h2>
                  <Link
                    href="/courses"
                    className="bb-sync-button"
                  >
                    Browse All Courses
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                {courses.length > 0 ? (
                  <CoursesGridWithTrainingCenter initialCourses={courses} />
                ) : (
                  <div className="bb-empty-state">
                    <BookOpen className="w-16 h-16 mx-auto mb-4" />
                    <p>No courses enrolled yet</p>
                    <Link href="/courses" className="bb-btn-primary">
                      Browse Available Courses
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'certificates' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bb-dashboard-section"
            >
              <div className="bb-section-header">
                <h2>My Certificates</h2>
                <p className="text-sm text-gray-600 mt-1">View and download your course certificates</p>
              </div>
              {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {courses.map((course: any) => {
                    // Get certificate data from localStorage
                    const certData = typeof window !== 'undefined'
                      ? localStorage.getItem(`course_${course.id}_certificate`)
                      : null
                    const certificate = certData ? JSON.parse(certData) : null
                    const isGenerated = certificate?.generated || false
                    const pdfUrl = certificate?.pdfUrl || null

                    // Get progress from localStorage
                    const progressData = typeof window !== 'undefined'
                      ? localStorage.getItem(`course_${course.id}_progress`)
                      : null
                    const completedVideos = progressData ? JSON.parse(progressData) : []

                    // Calculate progress
                    const totalVideos = course.acf?.course_chapters?.length > 0
                      ? course.acf.course_chapters.flatMap((ch: any) => ch.videos || []).length
                      : course.acf?.course_videos?.length || 0
                    const progress = totalVideos > 0 ? Math.round((completedVideos.length / totalVideos) * 100) : 0
                    const isComplete = progress === 100

                    const handleDownload = () => {
                      if (pdfUrl) {
                        const link = document.createElement('a')
                        link.href = pdfUrl
                        link.download = `${course.title.replace(/[^a-z0-9]/gi, '_')}_Certificate.pdf`
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                      }
                    }

                    return (
                      <div
                        key={course.id}
                        className={`rounded-xl p-6 border transition-all duration-300 ${
                          isComplete
                            ? 'bg-gradient-to-br from-[#ffed00]/10 to-yellow-50 border-[#ffed00]/30 hover:border-[#ffed00]/50'
                            : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              {isComplete ? (
                                <Award className="w-6 h-6 text-[#ffed00]" />
                              ) : (
                                <BookOpen className="w-6 h-6 text-gray-400" />
                              )}
                              <h3 className="font-semibold text-lg text-gray-900">
                                {isComplete ? 'Certificate of Completion' : 'In Progress'}
                              </h3>
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-3">{course.title}</h4>

                            {/* Progress Bar */}
                            <div className="mb-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">Progress</span>
                                <span className="text-sm font-bold text-gray-900">{progress}%</span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-300 ${
                                    isComplete ? 'bg-gradient-to-r from-[#ffed00] to-yellow-500' : 'bg-gray-400'
                                  }`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {completedVideos.length} of {totalVideos} lessons completed
                              </p>
                            </div>

                            {/* Course Stats */}
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Video className="w-4 h-4" />
                                {totalVideos} lessons
                              </span>
                              {course.acf?.duration && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {course.acf.duration}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-sm">
                            {isComplete ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-green-600 font-medium">Completed</span>
                                {isGenerated && certificate?.generatedAt && (
                                  <span className="text-gray-500">
                                    • {new Date(certificate.generatedAt).toLocaleDateString()}
                                  </span>
                                )}
                              </>
                            ) : (
                              <>
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600 font-medium">
                                  {totalVideos - completedVideos.length} lessons remaining
                                </span>
                              </>
                            )}
                          </div>

                          {isComplete && isGenerated && pdfUrl ? (
                            <button
                              onClick={handleDownload}
                              className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                            >
                              <Award className="w-4 h-4" />
                              Download Certificate
                            </button>
                          ) : isComplete ? (
                            <Link
                              href={`/courses/${course.slug}/learn`}
                              className="flex items-center gap-2 bg-[#ffed00] hover:bg-yellow-500 text-black text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                            >
                              <Award className="w-4 h-4" />
                              Generate Certificate
                            </Link>
                          ) : (
                            <Link
                              href={`/courses/${course.slug}/learn`}
                              className="flex items-center gap-2 text-gray-600 hover:text-black text-sm font-semibold transition-colors"
                            >
                              Continue Learning
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="bb-empty-state">
                  <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600 mb-2">No courses enrolled yet</p>
                  <p className="text-sm text-gray-500 mb-6">Enroll in courses to start earning certificates</p>
                  <Link href="/courses" className="bb-btn-primary inline-block">
                    Browse Courses
                  </Link>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'account-details' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Account Information */}
              <div className="bb-dashboard-section">
                <div className="bb-section-header">
                  <h2>Account Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input 
                        type="text" 
                        value={session.user.firstName || ''} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bb-primary/20 focus:border-bb-primary"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input 
                        type="text" 
                        value={session.user.lastName || ''} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bb-primary/20 focus:border-bb-primary"
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input 
                        type="email" 
                        value={session.user.email || ''} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bb-primary/20 focus:border-bb-primary"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                      <input 
                        type="text" 
                        value={session.user.name || ''} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bb-primary/20 focus:border-bb-primary"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="bb-dashboard-section">
                <div className="bb-section-header">
                  <h2>My Addresses</h2>
                </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Billing Address */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg text-bb-dark flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Billing Address
                    </h3>
                    <button className="text-sm text-bb-dark hover:text-bb-primary transition-colors">
                      Edit
                    </button>
                  </div>
                  {(addresses.billing || session.user.billing) ? (
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="font-medium text-bb-dark">
                        {(addresses.billing || session.user.billing).first_name} {(addresses.billing || session.user.billing).last_name}
                      </div>
                      {(addresses.billing || session.user.billing).company && (
                        <div>{(addresses.billing || session.user.billing).company}</div>
                      )}
                      <div>{(addresses.billing || session.user.billing).address_1}</div>
                      {(addresses.billing || session.user.billing).address_2 && (
                        <div>{(addresses.billing || session.user.billing).address_2}</div>
                      )}
                      <div>
                        {(addresses.billing || session.user.billing).city}, {(addresses.billing || session.user.billing).state} {(addresses.billing || session.user.billing).postcode}
                      </div>
                      <div>{(addresses.billing || session.user.billing).country}</div>
                      {(addresses.billing || session.user.billing).phone && (
                        <div className="flex items-center gap-1 mt-3">
                          <Phone className="w-4 h-4" />
                          {(addresses.billing || session.user.billing).phone}
                        </div>
                      )}
                      {(addresses.billing || session.user.billing).email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {(addresses.billing || session.user.billing).email}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500 mb-4">No billing address set</p>
                      <button className="bb-btn-primary">Add Address</button>
                    </div>
                  )}
                </div>

                {/* Shipping Address */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg text-bb-dark flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Shipping Address
                    </h3>
                    <button className="text-sm text-bb-dark hover:text-bb-primary transition-colors">
                      Edit
                    </button>
                  </div>
                  {(addresses.shipping || session.user.shipping) && ((addresses.shipping || session.user.shipping).first_name || (addresses.shipping || session.user.shipping).address_1) ? (
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="font-medium text-bb-dark">
                        {(addresses.shipping || session.user.shipping).first_name} {(addresses.shipping || session.user.shipping).last_name}
                      </div>
                      {(addresses.shipping || session.user.shipping).company && (
                        <div>{(addresses.shipping || session.user.shipping).company}</div>
                      )}
                      <div>{(addresses.shipping || session.user.shipping).address_1}</div>
                      {(addresses.shipping || session.user.shipping).address_2 && (
                        <div>{(addresses.shipping || session.user.shipping).address_2}</div>
                      )}
                      <div>
                        {(addresses.shipping || session.user.shipping).city}, {(addresses.shipping || session.user.shipping).state} {(addresses.shipping || session.user.shipping).postcode}
                      </div>
                      <div>{(addresses.shipping || session.user.shipping).country}</div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500 mb-4">No shipping address set</p>
                      <button className="bb-btn-primary">Add Address</button>
                    </div>
                  )}
                </div>
              </div>
              </div>

              {/* Payment Methods */}
              <div className="bb-dashboard-section">
                <div className="bb-section-header">
                  <h2>Payment Methods</h2>
                  <button className="bb-view-all">
                    <CreditCard className="w-4 h-4" />
                    Add New Card
                  </button>
                </div>
              {paymentMethods.length > 0 ? (
                <div className="space-y-4">
                  {paymentMethods.map((method: any) => (
                    <div key={method.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-8 bg-gradient-to-r from-bb-dark to-gray-800 rounded flex items-center justify-center text-white text-xs font-bold">
                          {method.card.brand.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-bb-dark">
                            •••• •••• •••• {method.card.last4}
                          </div>
                          <div className="text-sm text-gray-600">
                            Expires {method.card.exp_month.toString().padStart(2, '0')}/{method.card.exp_year}
                          </div>
                          {method.is_default && (
                            <div className="inline-block bg-bb-primary/10 text-bb-dark text-xs px-2 py-1 rounded mt-1">
                              Default
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="text-sm text-bb-dark hover:text-bb-primary transition-colors">
                          Edit
                        </button>
                        <button className="text-sm text-red-600 hover:text-red-700 transition-colors">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bb-empty-state">
                  <CreditCard className="w-16 h-16 mx-auto mb-4" />
                  <p>No payment methods saved</p>
                  <a href="#" className="bb-btn-primary">
                    Add Payment Method
                  </a>
                </div>
              )}
              </div>
            </motion.div>
          )}


          {activeTab === 'affiliate' && affiliateData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Affiliate Stats */}
              <div className="bb-dashboard-section">
                <div className="bb-section-header">
                  <h2>Affiliate Dashboard</h2>
                  <button onClick={() => window.location.reload()} className="bb-sync-button">
                    <RefreshCw className="w-4 h-4" />
                    Sync Data
                  </button>
                </div>
                
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center border border-green-200">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 text-green-600" />
                    <div className="text-2xl font-bold text-green-700 mb-1">${affiliateData.stats.total_commissions.toFixed(2)}</div>
                    <div className="text-sm text-green-600">Total Earned</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center border border-blue-200">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                    <div className="text-2xl font-bold text-blue-700 mb-1">{affiliateData.stats.total_referrals}</div>
                    <div className="text-sm text-blue-600">Total Referrals</div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 text-center border border-yellow-200">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
                    <div className="text-2xl font-bold text-yellow-700 mb-1">${affiliateData.stats.pending_commissions.toFixed(2)}</div>
                    <div className="text-sm text-yellow-600">Pending</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center border border-purple-200">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                    <div className="text-2xl font-bold text-purple-700 mb-1">{affiliateData.stats.this_month_referrals}</div>
                    <div className="text-sm text-purple-600">This Month</div>
                  </div>
                </div>

                {/* Referral Info */}
                <div className="bg-gradient-to-r from-bb-primary/10 to-yellow-100 rounded-xl p-6 mb-8 border border-bb-primary/20">
                  <h3 className="text-lg font-semibold text-bb-dark mb-4 flex items-center gap-2">
                    <ExternalLink className="w-5 h-5" />
                    Your Referral Link
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-white rounded-lg p-3 border">
                      <code className="text-sm text-gray-600 break-all">{affiliateData.referral_url}</code>
                    </div>
                    <button className="bb-view-all shrink-0">
                      Copy Link
                    </button>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    Commission Rate: <span className="font-semibold text-bb-dark">{(affiliateData.commission_rate * 100)}%</span>
                  </div>
                </div>
              </div>

              {/* Recent Referrals */}
              <div className="bb-dashboard-section">
                <div className="bb-section-header">
                  <h2>Recent Referrals</h2>
                  <a href="#" className="bb-view-all">
                    View All <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
                <div className="space-y-4">
                  {affiliateData.recent_referrals.map((referral: any) => (
                    <div key={referral.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-bb-primary rounded-full flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-bb-dark" />
                          </div>
                          <div>
                            <div className="font-semibold text-bb-dark">Order #{referral.order_id}</div>
                            <div className="text-sm text-gray-600">{referral.product}</div>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          referral.status === 'paid' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Order Total:</span>
                          <div className="font-semibold">${referral.amount.toFixed(2)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Commission:</span>
                          <div className="font-semibold text-green-600">${referral.commission.toFixed(2)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Customer:</span>
                          <div className="font-semibold">{referral.customer_email}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Date:</span>
                          <div className="font-semibold">{new Date(referral.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Marketing Materials */}
              <div className="bb-dashboard-section">
                <div className="bb-section-header">
                  <h2>Marketing Materials</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {affiliateData.marketing_materials.map((material: any) => (
                    <div key={material.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <Settings className="w-6 h-6 text-bb-dark" />
                        <div>
                          <h3 className="font-semibold text-bb-dark">{material.title}</h3>
                          <div className="text-sm text-gray-600 capitalize">{material.type}</div>
                        </div>
                      </div>
                      {material.size && (
                        <div className="text-sm text-gray-600 mb-3">Size: {material.size}</div>
                      )}
                      <div className="bg-white rounded p-3 mb-4 border">
                        <code className="text-xs text-gray-600 break-all">{material.code}</code>
                      </div>
                      <button className="bb-view-all w-full text-sm">
                        Copy Code
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Info */}
              <div className="bb-dashboard-section">
                <div className="bb-section-header">
                  <h2>Payment Information</h2>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-bb-dark mb-3">Next Payment</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span className="font-medium">{new Date(affiliateData.payment_info.next_payment_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-medium text-green-600">${affiliateData.stats.pending_commissions.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Method:</span>
                          <span className="font-medium">{affiliateData.payment_info.payment_method}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-bb-dark mb-3">Payment Settings</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Minimum Payout:</span>
                          <span className="font-medium">${affiliateData.payment_info.minimum_payout.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium">{affiliateData.payment_info.payment_email}</span>
                        </div>
                      </div>
                      <button className="mt-4 text-sm text-bb-dark hover:text-bb-primary transition-colors">
                        Edit Payment Settings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Reseller Tab */}
          {(activeTab === 'reseller' && isReseller) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bb-dashboard-section"
            >
              <div className="bb-section-header">
                <h2>Reseller Benefits</h2>
                <p className="text-sm text-gray-600 mt-2">Your exclusive wholesale pricing and benefits</p>
              </div>
              <ResellerBenefitsTable />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}