import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { radius } from '@/lib/design-system/constants'

interface BadgeProps {
  children: ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'dark'
  size?: 'xs' | 'sm' | 'md'
  rounded?: keyof typeof radius
  icon?: ReactNode
}

const variantClasses = {
  primary: 'bg-[#ffed00] text-black',
  secondary: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  dark: 'bg-black/80 backdrop-blur-sm text-white',
} as const

const sizeClasses = {
  xs: 'px-2 py-0.5 text-xs',
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
} as const

/**
 * Reusable Badge Component
 * For status indicators, labels, and tags
 */
export default function Badge({
  children,
  className,
  variant = 'primary',
  size = 'sm',
  rounded = 'full',
  icon,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-semibold',
        variantClasses[variant],
        sizeClasses[size],
        radius[rounded],
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  )
}