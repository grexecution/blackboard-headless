'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  if (!isVisible) {
    return null
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-40 bg-[#ffed00] text-black p-3 rounded-full shadow-lg hover:bg-[#ffed00]/90 transform hover:scale-110 transition-all"
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-6 w-6" />
    </button>
  )
}