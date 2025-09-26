import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { grid } from '@/lib/design-system/constants'

interface GridProps {
  children: ReactNode
  className?: string
  cols?: keyof typeof grid.cols
  gap?: keyof typeof grid.gap
  responsive?: boolean
}

/**
 * Reusable Grid Component
 * Provides consistent grid layouts with responsive breakpoints
 */
export default function Grid({
  children,
  className,
  cols = 3,
  gap = 'md',
  responsive = true,
}: GridProps) {
  return (
    <div
      className={cn(
        responsive ? grid.cols[cols] : `grid grid-cols-${cols}`,
        grid.gap[gap],
        className
      )}
    >
      {children}
    </div>
  )
}