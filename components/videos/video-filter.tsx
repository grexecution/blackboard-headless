'use client'

import { VideoCategory } from '@/lib/woocommerce/videos'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter } from 'lucide-react'

interface VideoFilterProps {
  categories: VideoCategory[]
}

export default function VideoFilter({ categories }: VideoFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category')

  const handleCategoryChange = (categorySlug: string | null) => {
    const params = new URLSearchParams(searchParams.toString())

    if (categorySlug) {
      params.set('category', categorySlug)
    } else {
      params.delete('category')
    }

    router.push(`/training-videos${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="h-5 w-5 text-gray-700" />
        <h3 className="font-bold text-lg">Filter Videos</h3>
      </div>

      {/* Categories */}
      <div>
        <h4 className="font-semibold text-sm text-gray-700 mb-3">Categories</h4>
        <div className="space-y-2">
          {/* All Videos */}
          <button
            onClick={() => handleCategoryChange(null)}
            className={`w-full text-left px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
              !currentCategory
                ? 'bg-[#ffed00] text-black'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Videos
          </button>

          {/* Category Buttons */}
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.slug)}
              className={`w-full text-left px-4 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-between ${
                currentCategory === category.slug
                  ? 'bg-[#ffed00] text-black'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{category.name}</span>
              {category.count > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  currentCategory === category.slug
                    ? 'bg-black/20'
                    : 'bg-gray-300'
                }`}>
                  {category.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="bg-[#ffed00]/10 rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-2">BlackBoard Exclusive</h4>
          <p className="text-xs text-gray-600">
            Some videos are exclusive to BlackBoard customers. Login with your account to access all content.
          </p>
        </div>
      </div>
    </div>
  )
}