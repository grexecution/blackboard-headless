import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    if (!token?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is an affiliate (this would typically check a user meta field or role)
    const isAffiliate = true // Mock for now

    if (!isAffiliate) {
      return NextResponse.json({ error: 'Not an affiliate' }, { status: 403 })
    }

    // Mock affiliate data - this would typically come from an affiliate plugin like AffiliateWP
    const affiliateData = {
      affiliate_id: token.userId,
      status: 'active',
      referral_url: `https://blackboard.training/?ref=${token.userId}`,
      commission_rate: 0.3, // 30%
      stats: {
        total_referrals: 47,
        total_commissions: 2850.75,
        pending_commissions: 485.50,
        paid_commissions: 2365.25,
        this_month_referrals: 8,
        this_month_commissions: 485.50
      },
      recent_referrals: [
        {
          id: 'ref_1',
          order_id: '12345',
          customer_email: 'customer1@example.com',
          amount: 149.00,
          commission: 44.70,
          status: 'pending',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          product: 'Advanced WordPress Development'
        },
        {
          id: 'ref_2',
          order_id: '12346',
          customer_email: 'customer2@example.com',
          amount: 199.00,
          commission: 59.70,
          status: 'pending',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          product: 'React Fundamentals'
        },
        {
          id: 'ref_3',
          order_id: '12344',
          customer_email: 'customer3@example.com',
          amount: 299.00,
          commission: 89.70,
          status: 'paid',
          date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          product: 'E-commerce Strategy'
        }
      ],
      payment_info: {
        next_payment_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        minimum_payout: 100.00,
        payment_method: 'PayPal',
        payment_email: token.email
      },
      marketing_materials: [
        {
          id: 'banner_1',
          title: 'Hero Banner - Courses',
          type: 'banner',
          size: '728x90',
          url: '/marketing/banner-courses-728x90.png',
          code: `<a href="https://blackboard.training/?ref=${token.userId}"><img src="/marketing/banner-courses-728x90.png" alt="Blackboard Training Courses" /></a>`
        },
        {
          id: 'banner_2', 
          title: 'Square Banner - Courses',
          type: 'banner',
          size: '300x300',
          url: '/marketing/banner-courses-300x300.png',
          code: `<a href="https://blackboard.training/?ref=${token.userId}"><img src="/marketing/banner-courses-300x300.png" alt="Blackboard Training Courses" /></a>`
        },
        {
          id: 'text_1',
          title: 'Text Link - Main Site',
          type: 'text',
          code: `<a href="https://blackboard.training/?ref=${token.userId}">Learn from the best at Blackboard Training</a>`
        }
      ]
    }

    return NextResponse.json(affiliateData)

  } catch (error) {
    console.error('Error fetching affiliate data:', error)
    return NextResponse.json({ error: 'Failed to fetch affiliate data' }, { status: 500 })
  }
}