import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import Section from './Section'
import Heading from './Heading'
import Button from './Button'
import { ChevronRight } from 'lucide-react'

interface HeroSectionProps {
  title: string | ReactNode
  subtitle?: string
  description?: string | ReactNode
  primaryCTA?: {
    label: string
    href: string
    icon?: ReactNode
  }
  secondaryCTA?: {
    label: string
    href: string
    icon?: ReactNode
  }
  children?: ReactNode
  variant?: 'default' | 'compact' | 'feature'
  backgroundPattern?: boolean
  className?: string
}

/**
 * Reusable Hero Section Component
 * Standardizes hero sections across pages
 */
export default function HeroSection({
  title,
  subtitle,
  description,
  primaryCTA,
  secondaryCTA,
  children,
  variant = 'default',
  backgroundPattern = false,
  className,
}: HeroSectionProps) {
  const isCompact = variant === 'compact'

  return (
    <Section
      variant="dark"
      size={isCompact ? 'sm' : 'lg'}
      className={cn('relative', className)}
    >
      {backgroundPattern && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat" />
        </div>
      )}

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {typeof title === 'string' ? (
          <Heading level={1} color="inverse" accent centered>
            {title}
          </Heading>
        ) : (
          title
        )}

        {subtitle && (
          <p className="text-2xl text-gray-300 mb-8 mt-6">{subtitle}</p>
        )}

        {description && (
          <div className="text-lg text-gray-300 mt-8 max-w-3xl mx-auto">
            {typeof description === 'string' ? <p>{description}</p> : description}
          </div>
        )}

        {children && <div className="mt-12">{children}</div>}

        {(primaryCTA || secondaryCTA) && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            {primaryCTA && (
              <Button
                href={primaryCTA.href}
                size="lg"
                icon={primaryCTA.icon || <ChevronRight className="h-5 w-5" />}
              >
                {primaryCTA.label}
              </Button>
            )}
            {secondaryCTA && (
              <Button
                href={secondaryCTA.href}
                variant="outline"
                size="lg"
                icon={secondaryCTA.icon}
              >
                {secondaryCTA.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </Section>
  )
}