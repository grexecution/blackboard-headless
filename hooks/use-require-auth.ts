'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export function useRequireAuth(redirectTo: string = '/') {
  const { data: session, status } = useSession()
  const { openLoginModal } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading
    
    if (!session) {
      // Not logged in, open modal and redirect to home
      openLoginModal()
      router.push('/')
    }
  }, [session, status, openLoginModal, router, redirectTo])

  return { session, isLoading: status === 'loading' }
}