import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// This webhook endpoint triggers a rebuild when WooCommerce data changes
export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const body = await request.text()
    
    // Get WooCommerce webhook signature from headers
    const signature = request.headers.get('x-wc-webhook-signature')
    
    // Verify webhook is from WooCommerce (optional but recommended)
    const secret = process.env.WEBHOOK_SECRET || 'your-secret-key'
    if (signature && secret) {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('base64')
      
      if (signature !== expectedSignature) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    // Trigger rebuild on Vercel
    if (process.env.VERCEL_DEPLOY_HOOK) {
      // For Vercel: trigger rebuild via deploy hook
      const response = await fetch(process.env.VERCEL_DEPLOY_HOOK, {
        method: 'POST',
      })
      
      if (!response.ok) {
        throw new Error('Failed to trigger rebuild')
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Rebuild triggered successfully' 
      })
    }
    
    // For local development or other platforms
    console.log('Webhook received - would trigger rebuild in production')
    
    // Alternative: Use ISR revalidation for specific paths
    // This is faster than full rebuild but requires listing all paths
    if (process.env.NODE_ENV === 'production') {
      try {
        // Parse WooCommerce webhook data
        const data = JSON.parse(body)
        
        // Revalidate specific paths based on webhook type
        const paths = ['/shop', '/']
        
        // If it's a product update, also revalidate that product page
        if (data.slug) {
          paths.push(`/product/${data.slug}`)
        }
        
        // Revalidate all paths
        for (const path of paths) {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/revalidate?path=${path}&secret=${secret}`)
        }
        
        return NextResponse.json({ 
          success: true, 
          message: 'Pages revalidated',
          paths 
        })
      } catch (e) {
        console.error('Revalidation error:', e)
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed' 
    })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Also support GET for testing
export async function GET() {
  return NextResponse.json({ 
    status: 'Webhook endpoint is working',
    info: 'Send POST request with WooCommerce webhook data to trigger rebuild'
  })
}