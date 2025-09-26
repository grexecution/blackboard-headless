import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { typography } from '@/lib/design-system/constants'

interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: ReactNode
  className?: string
  color?: keyof typeof typography.color
  accent?: boolean
  centered?: boolean
}

/**
 * Reusable Heading Component
 * Ensures consistent typography across the application
 */
export default function Heading({
  level,
  children,
  className,
  color = 'primary',
  accent = false,
  centered = false,
}: HeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements
  const headingClass = cn(
    typography.heading[`h${level}`],
    typography.color[color],
    centered && 'text-center',
    className
  )

  if (accent && typeof children === 'string') {
    // Split text to add yellow accent to specific words
    const words = children.split(' ')
    const accentIndex = words.findIndex(word =>
      word.toLowerCase().includes('blackboard') ||
      word.toLowerCase().includes('procoach') ||
      word.toLowerCase().includes('workshop')
    )

    if (accentIndex !== -1) {
      return (
        <Tag className={headingClass}>
          {words.map((word, index) => (
            <span key={index}>
              {index === accentIndex ? (
                <span className="text-[#ffed00]">{word}</span>
              ) : (
                word
              )}
              {index < words.length - 1 && ' '}
            </span>
          ))}
        </Tag>
      )
    }
  }

  return <Tag className={headingClass}>{children}</Tag>
}