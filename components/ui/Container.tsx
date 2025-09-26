import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { spacing } from '@/lib/design-system/constants'

interface ContainerProps {
  children: ReactNode
  className?: string
  size?: 'narrow' | 'medium' | 'wide' | 'full'
  noPadding?: boolean
}

/**
 * Reusable Container Component
 * Provides consistent max-width constraints
 */
export default function Container({
  children,
  className,
  size = 'wide',
  noPadding = false,
}: ContainerProps) {
  return (
    <div
      className={cn(
        !noPadding && spacing.container.base,
        spacing.container[size],
        className
      )}
    >
      {children}
    </div>
  )
}