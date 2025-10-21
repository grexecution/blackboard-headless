'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, Grid, Award, User } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { useSession } from 'next-auth/react'

export function MobileBottomNav() {
  const pathname = usePathname()
  const { totalItems, openCart } = useCart()
  const { openLoginModal } = useAuth()
  const { data: session } = useSession()

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/shop', icon: Grid, label: 'Shop' },
    { href: '#cart', icon: ShoppingBag, label: 'Cart', action: openCart, badge: totalItems },
    { href: '/procoach', icon: Award, label: 'ProCoach' },
    { 
      href: session ? '/account' : '#login', 
      icon: User, 
      label: 'Account',
      action: session ? undefined : () => openLoginModal()
    }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40 pb-safe">
      <div className="grid grid-cols-5 h-16" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          
          if (item.action) {
            return (
              <button
                key={item.label}
                onClick={item.action}
                className="flex flex-col items-center justify-center relative"
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-[#ffed00]' : 'text-gray-600'}`} />
                <span className={`text-xs mt-1 ${isActive ? 'text-[#ffed00] font-semibold' : 'text-gray-600'}`}>
                  {item.label}
                </span>
                {item.badge && item.badge > 0 && (
                  <span className="absolute top-1 right-4 bg-[#ffed00] text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          }
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center relative"
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-[#ffed00]' : 'text-gray-600'}`} />
              <span className={`text-xs mt-1 ${isActive ? 'text-[#ffed00] font-semibold' : 'text-gray-600'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}