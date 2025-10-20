import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function GET() {
  const session = await getServerSession()

  return NextResponse.json({
    hasSession: !!session,
    email: session?.user?.email || null,
    hasJWT: !!(session as any)?.jwt,
    sessionKeys: session ? Object.keys(session) : [],
  })
}
