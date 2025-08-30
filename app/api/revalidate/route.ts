import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get('x-revalidate-secret')
    
    // Check for secret to secure the endpoint
    if (process.env.REVALIDATE_SECRET && secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }

    const body = await request.json()
    const { path, tag, type = 'path' } = body

    if (type === 'tag' && tag) {
      revalidateTag(tag)
      return NextResponse.json({ revalidated: true, type: 'tag', tag })
    } else if (type === 'path' && path) {
      revalidatePath(path)
      return NextResponse.json({ revalidated: true, type: 'path', path })
    } else {
      // Revalidate all main pages
      revalidatePath('/', 'layout')
      revalidatePath('/shop')
      revalidatePath('/workshops')
      revalidatePath('/procoach')
      return NextResponse.json({ revalidated: true, type: 'all' })
    }
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { message: 'Revalidation endpoint. Use POST to trigger revalidation.' },
    { status: 200 }
  )
}