import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { radius, shadow, transition } from '@/lib/design-system/constants'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  rounded?: keyof typeof radius
  shadowSize?: keyof typeof shadow
  hover?: boolean
  onClick?: () => void
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
} as const

/**
 * Reusable Card Component
 * Base template for all card-based layouts
 */
export default function Card({
  children,
  className,
  padding = 'md',
  rounded = 'xl',
  shadowSize = 'lg',
  hover = true,
  onClick,
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-white overflow-hidden',
        paddingClasses[padding],
        radius[rounded],
        shadow[shadowSize],
        hover && 'hover:shadow-xl',
        onClick && 'cursor-pointer',
        transition.base,
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}