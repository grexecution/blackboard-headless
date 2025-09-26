import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import Card from './Card'

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  className?: string
  iconColor?: 'primary' | 'white' | 'black'
  centered?: boolean
}

const iconColorClasses = {
  primary: 'text-[#ffed00]',
  white: 'text-white',
  black: 'text-black',
} as const

/**
 * Reusable Feature Card Component
 * Common pattern for feature/benefit presentations
 */
export default function FeatureCard({
  icon,
  title,
  description,
  className,
  iconColor = 'primary',
  centered = true,
}: FeatureCardProps) {
  return (
    <Card className={cn(centered && 'text-center', className)}>
      <div
        className={cn(
          'mb-4',
          iconColor === iconColorClasses[iconColor],
          centered && 'flex justify-center'
        )}
      >
        <div className="h-12 w-12">{icon}</div>
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Card>
  )
}