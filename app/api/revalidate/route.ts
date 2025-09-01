import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

// This endpoint allows for on-demand revalidation of static pages
// Can be triggered via webhook from WordPress or manually

export async function POST(request: NextRequest) {
  try {
    // Get secret from headers or query params for flexibility
    const secret = request.headers.get('x-revalidate-secret') || 
                   request.nextUrl.searchParams.get('secret')
    
    console.log('[Revalidation] Request received', {
      hasSecret: !!secret,
      expectedSecret: !!process.env.REVALIDATE_SECRET,
      secretMatch: secret === process.env.REVALIDATE_SECRET
    })
    
    // Check for secret to secure the endpoint
    if (process.env.REVALIDATE_SECRET && secret !== process.env.REVALIDATE_SECRET) {
      console.error('[Revalidation] Invalid secret provided')
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { path, tag, type = 'path', slug, action } = body

    console.log(`[Revalidation] Processing request:`, {
      type,
      action,
      path,
      slug,
      tag,
      timestamp: new Date().toISOString()
    })

    // Handle WordPress WooCommerce webhook actions
    if (action) {
      switch (action) {
        case 'product.created':
        case 'product.updated':
        case 'product.deleted':
        case 'product.restored':
          // Revalidate product pages and shop
          console.log('[Revalidation] Revalidating shop page...')
          revalidatePath('/shop', 'page')
          console.log('[Revalidation] Revalidating homepage...')
          revalidatePath('/', 'page')
          if (slug) {
            console.log(`[Revalidation] Revalidating product: /product/${slug}`)
            revalidatePath(`/product/${slug}`, 'page')
          }
          // Also revalidate all product pages
          console.log('[Revalidation] Revalidating all product pages...')
          revalidatePath('/product/[slug]', 'page')
          
          const revalidatedPages = ['/', '/shop', '/product/[slug]', slug ? `/product/${slug}` : null].filter(Boolean)
          console.log('[Revalidation] Success! Revalidated:', revalidatedPages)
          
          return NextResponse.json({ 
            revalidated: true, 
            action, 
            pages: revalidatedPages,
            timestamp: new Date().toISOString()
          })

        case 'order.created':
        case 'order.updated':
          // Could trigger stock updates if needed
          revalidatePath('/shop', 'page')
          return NextResponse.json({ revalidated: true, action, pages: ['/shop'] })

        default:
          // Full site revalidation for unknown actions
          revalidatePath('/', 'layout')
          return NextResponse.json({ revalidated: true, action, pages: ['all'] })
      }
    }

    // Manual revalidation by type
    if (type === 'tag' && tag) {
      revalidateTag(tag)
      return NextResponse.json({ revalidated: true, type: 'tag', tag })
    } else if (type === 'path' && path) {
      revalidatePath(path, 'page')
      return NextResponse.json({ revalidated: true, type: 'path', path })
    } else if (type === 'all') {
      // Revalidate everything
      revalidatePath('/', 'layout')
      revalidatePath('/shop', 'page')
      revalidatePath('/product/[slug]', 'page')
      revalidatePath('/workshops', 'page')
      revalidatePath('/procoach', 'page')
      return NextResponse.json({ 
        revalidated: true, 
        type: 'all',
        pages: ['/', '/shop', '/product/[slug]', '/workshops', '/procoach']
      })
    } else {
      // Default: revalidate main pages
      revalidatePath('/', 'page')
      revalidatePath('/shop', 'page')
      return NextResponse.json({ 
        revalidated: true, 
        type: 'default',
        pages: ['/', '/shop']
      })
    }
  } catch (error) {
    console.error('Revalidation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to revalidate', details: errorMessage },
      { status: 500 }
    )
  }
}

// GET endpoint for easy testing and manual triggers
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  const type = request.nextUrl.searchParams.get('type') || 'all'
  
  // Allow access with secret for testing
  if (process.env.REVALIDATE_SECRET && secret === process.env.REVALIDATE_SECRET) {
    if (type === 'all') {
      revalidatePath('/', 'layout')
      return NextResponse.json({ 
        revalidated: true, 
        method: 'GET',
        type: 'all',
        message: 'All pages revalidated successfully'
      })
    } else if (type === 'shop') {
      revalidatePath('/shop', 'page')
      revalidatePath('/', 'page')
      return NextResponse.json({ 
        revalidated: true, 
        method: 'GET',
        type: 'shop',
        message: 'Shop and homepage revalidated'
      })
    }
  }
  
  return NextResponse.json({
    message: 'Revalidation endpoint',
    usage: {
      POST: 'Send POST request with secret and revalidation details',
      GET: 'Use ?secret=YOUR_SECRET&type=all to revalidate all pages',
      types: ['all', 'shop', 'path', 'tag'],
      wordpress: 'Configure WordPress webhooks to send POST requests on product updates'
    }
  }, { status: 200 })
}