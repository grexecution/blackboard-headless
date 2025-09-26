import { ReactNode } from 'react'
import { spacing, colors } from '@/lib/design-system/constants'
import { cn } from '@/lib/utils'

interface SectionProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'dark' | 'light' | 'yellow'
  size?: 'sm' | 'md' | 'lg'
  container?: 'narrow' | 'medium' | 'wide' | 'full'
  noPadding?: boolean
}

const variantClasses = {
  default: 'bg-white',
  dark: 'bg-gradient-to-b from-black to-gray-900 text-white',
  light: 'bg-gray-50',
  yellow: 'bg-gradient-to-br from-[#ffed00] to-yellow-500',
} as const

const sizeClasses = {
  sm: 'py-8 lg:py-12',
  md: 'py-16 lg:py-24',
  lg: 'py-24 lg:py-32',
} as const

/**
 * Reusable Section Component
 * Provides consistent section spacing and container widths
 */
export default function Section({
  children,
  className,
  variant = 'default',
  size = 'md',
  container = 'wide',
  noPadding = false,
}: SectionProps) {
  const containerClass = container ? spacing.container[container] : ''

  return (
    <section
      className={cn(
        variantClasses[variant],
        !noPadding && sizeClasses[size],
        className
      )}
    >
      <div className={cn(spacing.container.base, containerClass)}>
        {children}
      </div>
    </section>
  )
}