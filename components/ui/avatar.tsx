interface AvatarProps {
  name?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  // Get first letter of name
  const getInitial = () => {
    if (!name) return 'U'
    return name.charAt(0).toUpperCase()
  }

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-[#ffed00] to-yellow-300 flex items-center justify-center font-bold text-black ${className}`}
    >
      {getInitial()}
    </div>
  )
}
