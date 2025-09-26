/**
 * BlackBoard Design System Constants
 * Central source of truth for all design tokens
 */

// Brand Colors
export const colors = {
  primary: {
    yellow: '#ffed00',
    black: '#000000',
    white: '#ffffff',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  gradient: {
    blackToGray: 'from-black to-gray-900',
    yellowToOrange: 'from-[#ffed00] to-yellow-500',
    redGradient: 'from-red-500 to-red-600',
    greenGradient: 'from-green-500 to-green-600',
  },
} as const

// Typography Scale
export const typography = {
  heading: {
    h1: 'text-5xl md:text-6xl lg:text-7xl font-bold',
    h2: 'text-3xl md:text-4xl lg:text-5xl font-bold',
    h3: 'text-2xl md:text-3xl font-bold',
    h4: 'text-xl md:text-2xl font-bold',
    h5: 'text-lg md:text-xl font-semibold',
    h6: 'text-base md:text-lg font-semibold',
  },
  body: {
    large: 'text-lg md:text-xl',
    base: 'text-base',
    small: 'text-sm',
    xs: 'text-xs',
  },
  color: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    muted: 'text-gray-400',
    inverse: 'text-white',
    accent: 'text-[#ffed00]',
  },
} as const

// Spacing Scale
export const spacing = {
  section: {
    padding: 'py-16 lg:py-24',
    gap: 'gap-16 lg:gap-24',
  },
  container: {
    base: 'container mx-auto px-4',
    narrow: 'max-w-4xl mx-auto',
    medium: 'max-w-5xl mx-auto',
    wide: 'max-w-6xl mx-auto',
    full: 'max-w-7xl mx-auto',
  },
  card: {
    padding: 'p-6 lg:p-8',
    gap: 'gap-6 lg:gap-8',
  },
  element: {
    margin: {
      xs: 'mb-2',
      sm: 'mb-4',
      md: 'mb-6',
      lg: 'mb-8',
      xl: 'mb-12',
    },
    padding: {
      xs: 'p-2',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-12',
    },
  },
} as const

// Grid Layouts
export const grid = {
  cols: {
    2: 'grid md:grid-cols-2',
    3: 'grid md:grid-cols-2 lg:grid-cols-3',
    4: 'grid md:grid-cols-2 lg:grid-cols-4',
  },
  gap: {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12',
  },
} as const

// Border Radius
export const radius = {
  none: 'rounded-none',
  sm: 'rounded',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
  full: 'rounded-full',
} as const

// Shadows
export const shadow = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  base: 'shadow',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  inner: 'shadow-inner',
} as const

// Transitions
export const transition = {
  base: 'transition-all duration-300',
  fast: 'transition-all duration-150',
  slow: 'transition-all duration-500',
  colors: 'transition-colors duration-300',
  transform: 'transition-transform duration-300',
  opacity: 'transition-opacity duration-300',
} as const

// Animation Classes
export const animation = {
  hover: {
    scale: 'hover:scale-105',
    lift: 'hover:-translate-y-1',
    shadow: 'hover:shadow-xl',
    brightness: 'hover:brightness-110',
  },
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
} as const

// Button Variants
export const buttonVariants = {
  primary: `bg-[#ffed00] text-black font-bold hover:bg-yellow-400 ${transition.base}`,
  secondary: `bg-black text-white font-bold hover:bg-gray-800 ${transition.base}`,
  outline: `bg-transparent border-2 border-white text-white hover:bg-white/10 ${transition.base}`,
  ghost: `bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 ${transition.base}`,
} as const

// Button Sizes
export const buttonSizes = {
  xs: 'px-3 py-1.5 text-xs',
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
  xl: 'px-10 py-5 text-xl',
} as const

// Z-Index Scale
export const zIndex = {
  dropdown: 'z-10',
  sticky: 'z-20',
  fixed: 'z-30',
  modalBackdrop: 'z-40',
  modal: 'z-50',
  popover: 'z-60',
  tooltip: 'z-70',
} as const