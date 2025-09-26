import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants, buttonSizes, radius } from '@/lib/design-system/constants'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants
  size?: keyof typeof buttonSizes
  rounded?: keyof typeof radius
  fullWidth?: boolean
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  href?: string
  external?: boolean
  children: ReactNode
}

/**
 * Reusable Button Component
 * Supports all button variants, sizes, and can render as a link
 */
const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      rounded = 'full',
      fullWidth = false,
      loading = false,
      icon,
      iconPosition = 'right',
      href,
      external = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const buttonClass = cn(
      buttonVariants[variant],
      buttonSizes[size],
      radius[rounded],
      fullWidth && 'w-full',
      'inline-flex items-center justify-center gap-2',
      disabled && 'opacity-50 cursor-not-allowed',
      className
    )

    const content = (
      <>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!loading && icon && iconPosition === 'left' && icon}
        {children}
        {!loading && icon && iconPosition === 'right' && icon}
      </>
    )

    if (href) {
      if (external) {
        return (
          <a
            ref={ref as any}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass}
          >
            {content}
          </a>
        )
      }

      return (
        <Link ref={ref as any} href={href} className={buttonClass}>
          {content}
        </Link>
      )
    }

    return (
      <button
        ref={ref as any}
        className={buttonClass}
        disabled={disabled || loading}
        {...props}
      >
        {content}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button