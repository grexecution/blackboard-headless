import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request })
    if (!token?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const wpUrl = process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/wp-json/wc/v3', '')
    if (!wpUrl) {
      throw new Error('WordPress URL not configured')
    }

    // Fetch affiliate data from WordPress custom endpoint
    // This requires the BlackBoard Next.js Sync plugin to expose affiliate data
    const affiliateResponse = await fetch(`${wpUrl}/wp-json/blackboard/v1/affiliate/${token.userId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!affiliateResponse.ok) {
      // User is not an affiliate
      if (affiliateResponse.status === 404 || affiliateResponse.status === 403) {
        return NextResponse.json({ error: 'Not an affiliate' }, { status: 403 })
      }
      throw new Error(`Failed to fetch affiliate data: ${affiliateResponse.statusText}`)
    }

    const affiliateData = await affiliateResponse.json()

    // Return affiliate data in the format expected by the frontend
    return NextResponse.json({
      affiliate_id: affiliateData.affiliate_id || token.userId,
      status: affiliateData.status || 'active',
      referral_url: affiliateData.referral_url || `${process.env.NEXT_PUBLIC_BASE_URL}/?ref=${affiliateData.affiliate_id || token.userId}`,
      commission_rate: parseFloat(affiliateData.rate || '0.1'), // Default 10% if not set
      stats: {
        total_referrals: parseInt(affiliateData.referrals || '0'),
        total_commissions: parseFloat(affiliateData.earnings || '0'),
        pending_commissions: parseFloat(affiliateData.unpaid_earnings || '0'),
        paid_commissions: parseFloat(affiliateData.paid_earnings || '0'),
        this_month_referrals: parseInt(affiliateData.referrals_this_month || '0'),
        this_month_commissions: parseFloat(affiliateData.earnings_this_month || '0')
      },
      recent_referrals: Array.isArray(affiliateData.referrals_data)
        ? affiliateData.referrals_data.slice(0, 10).map((ref: any) => ({
            id: ref.reference || ref.referral_id || ref.id,
            order_id: ref.reference || ref.order_id,
            customer_email: ref.customer_email || 'Customer',
            amount: parseFloat(ref.amount || '0'),
            commission: parseFloat(ref.commission || '0'),
            status: ref.status || 'pending',
            date: ref.date || new Date().toISOString(),
            product: ref.description || ref.product_name || 'Product Purchase'
          }))
        : [],
      payment_info: {
        next_payment_date: affiliateData.next_payment_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        minimum_payout: parseFloat(affiliateData.minimum_payout || '50'),
        payment_method: affiliateData.payment_method || 'PayPal',
        payment_email: affiliateData.payment_email || token.email
      },
      marketing_materials: [
        {
          id: 'banner_1',
          title: 'Hero Banner - Products',
          type: 'banner',
          size: '728x90',
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/marketing/banner-728x90.png`,
          code: `<a href="${process.env.NEXT_PUBLIC_BASE_URL}/?ref=${affiliateData.affiliate_id || token.userId}"><img src="${process.env.NEXT_PUBLIC_BASE_URL}/marketing/banner-728x90.png" alt="BlackBoard Training" /></a>`
        },
        {
          id: 'banner_2',
          title: 'Square Banner - Products',
          type: 'banner',
          size: '300x300',
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/marketing/banner-300x300.png`,
          code: `<a href="${process.env.NEXT_PUBLIC_BASE_URL}/?ref=${affiliateData.affiliate_id || token.userId}"><img src="${process.env.NEXT_PUBLIC_BASE_URL}/marketing/banner-300x300.png" alt="BlackBoard Training" /></a>`
        },
        {
          id: 'text_1',
          title: 'Text Link - Main Site',
          type: 'text',
          code: `<a href="${process.env.NEXT_PUBLIC_BASE_URL}/?ref=${affiliateData.affiliate_id || token.userId}">Transform your foundation with BlackBoard Training</a>`
        },
        {
          id: 'text_2',
          title: 'Text Link - Shop',
          type: 'text',
          code: `<a href="${process.env.NEXT_PUBLIC_BASE_URL}/shop?ref=${affiliateData.affiliate_id || token.userId}">Shop BlackBoard Training Products</a>`
        }
      ]
    })

  } catch (error: any) {
    console.error('Error fetching affiliate data:', error)
    return NextResponse.json({ error: 'Failed to fetch affiliate data', details: error.message }, { status: 500 })
  }
}
