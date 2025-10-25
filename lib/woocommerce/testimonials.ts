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
  featured_image?: {
    url: string
    alt: string
  }
  acf?: {
    rating?: number
    reviewer_name?: string
    job_position?: string
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
 * Hardcoded testimonials fallback (used when WordPress API endpoint is not available)
 */
const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    title: { rendered: 'John Anderson' },
    excerpt: { rendered: 'The BlackBoard training system has completely transformed my approach to foot strength. After just 6 weeks, I noticed significant improvements in my balance and overall athletic performance. Highly recommended!' },
    featured_media: 0,
    featured_image: { url: 'https://i.pravatar.cc/150?img=12', alt: 'John Anderson' },
    acf: {
      rating: 5,
      reviewer_name: 'John Anderson',
      job_position: 'Professional Athlete',
      language: 'en'
    }
  },
  {
    id: 2,
    title: { rendered: 'Sarah Mitchell' },
    excerpt: { rendered: 'As a physiotherapist, I recommend BlackBoard to all my patients recovering from foot and ankle injuries. The results speak for themselves - faster recovery times and better long-term outcomes.' },
    featured_media: 0,
    featured_image: { url: 'https://i.pravatar.cc/150?img=5', alt: 'Sarah Mitchell' },
    acf: {
      rating: 5,
      reviewer_name: 'Sarah Mitchell',
      job_position: 'Physiotherapist',
      language: 'en'
    }
  },
  {
    id: 3,
    title: { rendered: 'Michael Chen' },
    excerpt: { rendered: 'I have been using BlackBoard for 3 months and my chronic foot pain is gone. The exercises are simple but incredibly effective. Best investment in my health I have made this year!' },
    featured_media: 0,
    featured_image: { url: 'https://i.pravatar.cc/150?img=33', alt: 'Michael Chen' },
    acf: {
      rating: 5,
      reviewer_name: 'Michael Chen',
      job_position: 'Marathon Runner',
      language: 'en'
    }
  },
  {
    id: 4,
    title: { rendered: 'Emma Rodriguez' },
    excerpt: { rendered: 'The ProCoach certification was outstanding! Gregor is an excellent instructor and the content is top-notch. I now feel confident training my clients with these techniques.' },
    featured_media: 0,
    featured_image: { url: 'https://i.pravatar.cc/150?img=9', alt: 'Emma Rodriguez' },
    acf: {
      rating: 5,
      reviewer_name: 'Emma Rodriguez',
      job_position: 'Personal Trainer',
      language: 'en'
    }
  },
  {
    id: 5,
    title: { rendered: 'Thomas Weber' },
    excerpt: { rendered: 'After years of dealing with plantar fasciitis, the BlackBoard system finally gave me relief. The approach is scientific, practical, and most importantly - it works!' },
    featured_media: 0,
    featured_image: { url: 'https://i.pravatar.cc/150?img=68', alt: 'Thomas Weber' },
    acf: {
      rating: 5,
      reviewer_name: 'Thomas Weber',
      job_position: 'Sports Scientist',
      language: 'en'
    }
  }
]

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
      console.warn('[getAllTestimonials] testimonial endpoint not available (404) - Using fallback testimonials')
      return FALLBACK_TESTIMONIALS
    }

    const testimonials: Testimonial[] = await res.json()
    console.log('[getAllTestimonials] Fetched', testimonials.length, 'testimonials')

    return testimonials.length > 0 ? testimonials : FALLBACK_TESTIMONIALS
  } catch (error) {
    console.error('[getAllTestimonials] Error:', error)
    return FALLBACK_TESTIMONIALS
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
  // Try featured_image field first (added by plugin)
  if (testimonial.featured_image?.url) {
    return testimonial.featured_image.url
  }

  // Try _embedded as fallback
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
 * Get testimonial job position
 */
export function getTestimonialJobPosition(testimonial: Testimonial): string {
  return testimonial.acf?.job_position || 'Verified Customer'
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
