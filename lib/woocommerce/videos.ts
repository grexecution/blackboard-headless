const WP_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || process.env.WORDPRESS_API_URL || process.env.WP_BASE_URL || 'http://localhost:10074'

/**
 * Parse JSON response, handling PHP warnings that may be prepended
 */
async function parseJsonResponse(response: Response): Promise<any> {
  const text = await response.text()

  // Try to parse as-is first
  try {
    return JSON.parse(text)
  } catch (e) {
    // If parsing fails, try to extract JSON from the text
    // Look for the first '[' or '{' character
    const jsonStart = Math.min(
      text.indexOf('[') !== -1 ? text.indexOf('[') : Infinity,
      text.indexOf('{') !== -1 ? text.indexOf('{') : Infinity
    )

    if (jsonStart !== Infinity) {
      try {
        return JSON.parse(text.substring(jsonStart))
      } catch (e2) {
        console.error('Failed to parse JSON even after cleanup:', e2)
        throw e2
      }
    }

    throw e
  }
}

export interface VideoCategory {
  id: number
  name: string
  slug: string
  description: string
  count: number
}

export interface Video {
  id: number
  title: {
    rendered: string
  }
  content: {
    rendered: string
  }
  excerpt: {
    rendered: string
  }
  slug: string
  featured_media: number
  video_cat: number[]
  acf: {
    sub_title?: string
    short_description?: string
    duration?: string
    exercises?: string
    locked_for_non_customers?: (boolean | string | number)[]
    'locked_for_non-customers'?: (boolean | string | number)[] // Field with hyphens from API
    videos?: VideoItem[]
    [key: string]: any // Allow other dynamic fields
  }
  _embedded?: {
    'wp:featuredmedia'?: [{
      source_url: string
      alt_text: string
    }]
    'wp:term'?: Array<Array<{
      id: number
      name: string
      slug: string
    }>>
  }
}

export interface VideoItem {
  title: string
  video_thumb?: any
  short_description?: string
  description?: string
  product?: number
  seconds_per_page?: string
  body_area?: string
  training_goal?: string
  vimeo_video_id?: string
}

/**
 * Get all video categories
 */
export async function getVideoCategories(): Promise<VideoCategory[]> {
  try {
    const response = await fetch(`${WP_API_URL}/wp-json/wp/v2/video_cat`, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: false }
    })

    if (!response.ok) {
      console.error('Failed to fetch video categories')
      return []
    }

    return await parseJsonResponse(response)
  } catch (error) {
    console.error('Error fetching video categories:', error)
    return []
  }
}

/**
 * Get all videos with embedded data
 */
export async function getAllVideos(category?: string): Promise<Video[]> {
  try {
    let url = `${WP_API_URL}/wp-json/wp/v2/video?_embed&per_page=100`

    // If category is specified, filter by category
    if (category) {
      const categories = await getVideoCategories()
      const cat = categories.find(c => c.slug === category)
      if (cat) {
        url += `&video_cat=${cat.id}`
      }
    }

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: false }
    })

    if (!response.ok) {
      console.error('Failed to fetch videos')
      return []
    }

    return await parseJsonResponse(response)
  } catch (error) {
    console.error('Error fetching videos:', error)
    return []
  }
}

/**
 * Get a single video by slug
 */
export async function getVideoBySlug(slug: string): Promise<Video | null> {
  try {
    const response = await fetch(`${WP_API_URL}/wp-json/wp/v2/video?slug=${slug}&_embed`, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: false }
    })

    if (!response.ok) {
      console.error('Failed to fetch video')
      return null
    }

    const videos = await parseJsonResponse(response)
    return videos[0] || null
  } catch (error) {
    console.error('Error fetching video:', error)
    return null
  }
}

/**
 * Check if a video is locked for non-customers
 * ACF checkbox returns array with '1' (string) when checked, field missing when unchecked
 * Note: Field key uses hyphens, not underscores: 'locked_for_non-customers'
 */
export function isVideoLocked(video: Video): boolean {
  // Check both possible field names (with underscores and with hyphens)
  // The API returns it with hyphens: 'locked_for_non-customers'
  const lockedField = video.acf?.locked_for_non_customers ||
                     (video.acf as any)?.['locked_for_non-customers']

  if (!lockedField || !Array.isArray(lockedField)) {
    return false // Field missing or not an array = unlocked
  }

  // Check if array has a truthy value (ACF returns '1' as string)
  return lockedField.length > 0 &&
         (lockedField[0] === true ||
          lockedField[0] === '1' ||
          lockedField[0] === 1)
}

/**
 * Extract video thumbnail URL
 */
export function getVideoThumbnail(video: Video): string {
  if (video._embedded?.['wp:featuredmedia']?.[0]) {
    return video._embedded['wp:featuredmedia'][0].source_url
  }
  return '/placeholder-video.jpg'
}

/**
 * Extract video categories
 */
export function getVideoCategories2(video: Video): Array<{id: number, name: string, slug: string}> {
  if (video._embedded?.['wp:term']?.[0]) {
    return video._embedded['wp:term'][0]
  }
  return []
}