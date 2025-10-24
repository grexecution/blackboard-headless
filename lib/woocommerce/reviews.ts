// Reviews API for BlackBoard

export interface Review {
  id: number
  title: {
    rendered: string
  }
  excerpt: {
    rendered: string
  }
  featured_media: number
  acf?: {
    rating?: number
    reviewer_name?: string
    language?: string
  }
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string
      alt_text: string
    }>
  }
}

/**
 * Fetch all reviews from WordPress
 */
export async function getAllReviews(): Promise<Review[]> {
  const WP_BASE_URL = process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://blackboard-training.com'

  try {
    console.log('[getAllReviews] Fetching from:', `${WP_BASE_URL}/wp-json/wp/v2/bb_review?_embed&per_page=100`)

    const res = await fetch(`${WP_BASE_URL}/wp-json/wp/v2/bb_review?_embed&per_page=100`, {
      next: { revalidate: false } // Static generation
    })

    if (!res.ok) {
      console.warn('[getAllReviews] bb_review endpoint not available (404) - Custom post type may need to be registered in WordPress REST API')
      return []
    }

    const reviews: Review[] = await res.json()
    console.log('[getAllReviews] Fetched', reviews.length, 'reviews')

    return reviews
  } catch (error) {
    console.error('[getAllReviews] Error:', error)
    return []
  }
}

/**
 * Filter reviews by language
 */
export function getReviewsByLanguage(reviews: Review[], language: 'en' | 'de'): Review[] {
  return reviews.filter(review => {
    const reviewLang = review.acf?.language?.toLowerCase()
    return reviewLang === language || reviewLang === language.toUpperCase()
  })
}

/**
 * Get English reviews
 */
export function getEnglishReviews(reviews: Review[]): Review[] {
  return getReviewsByLanguage(reviews, 'en')
}

/**
 * Get review image URL
 */
export function getReviewImage(review: Review): string {
  // Try _embedded first
  if (review._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
    return review._embedded['wp:featuredmedia'][0].source_url
  }

  // Fallback to placeholder
  return '/placeholder-review.jpg'
}

/**
 * Get review name (from ACF or title)
 */
export function getReviewerName(review: Review): string {
  return review.acf?.reviewer_name || review.title.rendered || 'Anonymous'
}

/**
 * Get review rating (default to 5 if not set)
 */
export function getReviewRating(review: Review): number {
  return review.acf?.rating || 5
}

/**
 * Strip HTML tags from excerpt
 */
export function getReviewText(review: Review): string {
  return review.excerpt.rendered
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim()
}
