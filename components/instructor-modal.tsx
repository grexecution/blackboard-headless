'use client'

import { X } from 'lucide-react'
import { useEffect } from 'react'

interface InstructorModalProps {
  isOpen: boolean
  onClose: () => void
  instructor: {
    name: string
    title: string
    content: string
  }
}

export default function InstructorModal({ isOpen, onClose, instructor }: InstructorModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">{instructor.name}</h2>
          <p className="text-[#ffed00] font-semibold mb-6">{instructor.title}</p>

          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: instructor.content }}
          />
        </div>
      </div>
    </div>
  )
}