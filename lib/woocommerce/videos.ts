const WP_API_URL = process.env.WP_BASE_URL || 'https://blackboard-training.com'

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
    locked_for_non_customers?: boolean[]
    videos?: VideoItem[]
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
    const response = await fetch(`${WP_API_URL}/wp/v2/video_cat`, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: false }
    })

    if (!response.ok) {
      console.error('Failed to fetch video categories')
      return []
    }

    return await response.json()
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
    let url = `${WP_API_URL}/wp/v2/video?_embed&per_page=100`

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

    return await response.json()
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
    const response = await fetch(`${WP_API_URL}/wp/v2/video?slug=${slug}&_embed`, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: false }
    })

    if (!response.ok) {
      console.error('Failed to fetch video')
      return null
    }

    const videos = await response.json()
    return videos[0] || null
  } catch (error) {
    console.error('Error fetching video:', error)
    return null
  }
}

/**
 * Check if a video is locked for non-customers
 */
export function isVideoLocked(video: Video): boolean {
  return video.acf?.locked_for_non_customers?.[0] === true
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