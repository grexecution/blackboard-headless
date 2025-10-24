// Testimonials API for BlackBoard

export interface Testimonial {
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
 * Fetch all testimonials from WordPress
 */
export async function getAllTestimonials(): Promise<Testimonial[]> {
  const WP_BASE_URL = process.env.WORDPRESS_API_URL || process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://blackboard-training.com'

  try {
    console.log('[getAllTestimonials] Fetching from:', `${WP_BASE_URL}/wp-json/wp/v2/testimonial?_embed&per_page=100`)

    const res = await fetch(`${WP_BASE_URL}/wp-json/wp/v2/testimonial?_embed&per_page=100`, {
      next: { revalidate: false } // Static generation
    })

    if (!res.ok) {
      console.warn('[getAllTestimonials] testimonial endpoint not available (404) - Custom post type may need to be registered in WordPress REST API')
      return []
    }

    const testimonials: Testimonial[] = await res.json()
    console.log('[getAllTestimonials] Fetched', testimonials.length, 'testimonials')

    return testimonials
  } catch (error) {
    console.error('[getAllTestimonials] Error:', error)
    return []
  }
}

/**
 * Filter testimonials by language
 */
export function getTestimonialsByLanguage(testimonials: Testimonial[], language: 'en' | 'de'): Testimonial[] {
  return testimonials.filter(testimonial => {
    const testimonialLang = testimonial.acf?.language?.toLowerCase()
    return testimonialLang === language || testimonialLang === language.toUpperCase()
  })
}

/**
 * Get English testimonials
 */
export function getEnglishTestimonials(testimonials: Testimonial[]): Testimonial[] {
  return getTestimonialsByLanguage(testimonials, 'en')
}

/**
 * Get testimonial image URL
 */
export function getTestimonialImage(testimonial: Testimonial): string {
  // Try _embedded first
  if (testimonial._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
    return testimonial._embedded['wp:featuredmedia'][0].source_url
  }

  // Fallback to placeholder
  return '/placeholder-review.jpg'
}

/**
 * Get testimonial name (from ACF or title)
 */
export function getTestimonialReviewerName(testimonial: Testimonial): string {
  return testimonial.acf?.reviewer_name || testimonial.title.rendered || 'Anonymous'
}

/**
 * Get testimonial rating (default to 5 if not set)
 */
export function getTestimonialRating(testimonial: Testimonial): number {
  return testimonial.acf?.rating || 5
}

/**
 * Strip HTML tags from excerpt
 */
export function getTestimonialText(testimonial: Testimonial): string {
  return testimonial.excerpt.rendered
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim()
}
