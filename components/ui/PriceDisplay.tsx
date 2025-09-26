import { cn } from '@/lib/utils'
import Badge from './Badge'

interface PriceDisplayProps {
  price: string | number
  originalPrice?: string | number
  currency?: '€' | '$' | '£'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showBadge?: boolean
  badgeText?: string
  className?: string
}

const sizeClasses = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-4xl',
} as const

/**
 * Reusable Price Display Component
 * Consistent price formatting across the application
 */
export default function PriceDisplay({
  price,
  originalPrice,
  currency = '€',
  size = 'md',
  showBadge = false,
  badgeText = 'SALE',
  className,
}: PriceDisplayProps) {
  const isOnSale = originalPrice && originalPrice !== price

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn('font-bold', sizeClasses[size])}>
        {currency}
        {price}
      </span>

      {isOnSale && (
        <>
          <span className="text-gray-400 line-through text-sm">
            {currency}
            {originalPrice}
          </span>
          {showBadge && (
            <Badge variant="error" size="xs">
              {badgeText}
            </Badge>
          )}
        </>
      )}
    </div>
  )
}