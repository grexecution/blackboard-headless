interface WooCommerceConfig {
  url: string
  consumerKey: string
  consumerSecret: string
}

export class WooCommerceClient {
  private config: WooCommerceConfig

  constructor() {
    // Check for required environment variables
    const url = process.env.WP_BASE_URL || process.env.NEXT_PUBLIC_WOO_API_URL?.replace('/wp-json/wc/v3', '') || ''
    const consumerKey = process.env.WOO_CONSUMER_KEY || ''
    const consumerSecret = process.env.WOO_CONSUMER_SECRET || ''

    // In production, throw clear errors
    if (!url && process.env.NODE_ENV === 'production') {
      throw new Error('WP_BASE_URL or NEXT_PUBLIC_WOO_API_URL environment variable is required')
    }
    if (!consumerKey && process.env.NODE_ENV === 'production') {
      throw new Error('WOO_CONSUMER_KEY environment variable is required')
    }
    if (!consumerSecret && process.env.NODE_ENV === 'production') {
      throw new Error('WOO_CONSUMER_SECRET environment variable is required')
    }

    // Log configuration for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('WooCommerce Client Config:', {
        url: url ? `${url} (configured)` : 'NOT SET',
        consumerKey: consumerKey ? 'SET' : 'NOT SET',
        consumerSecret: consumerSecret ? 'SET' : 'NOT SET'
      })
    }

    this.config = {
      url,
      consumerKey,
      consumerSecret,
    }
  }

  private getAuthHeader(): string {
    const credentials = `${this.config.consumerKey}:${this.config.consumerSecret}`
    return `Basic ${Buffer.from(credentials).toString('base64')}`
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.url}/wp-json/wc/v3${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`WooCommerce API error: ${response.statusText}`)
    }

    return response.json()
  }

  // Store API methods (for cart/checkout)
  async storeRequest<T = any>(
    endpoint: string,
    options: RequestInit = {},
    sessionToken?: string
  ): Promise<{ data: T; headers: Headers }> {
    const url = `${this.config.url}/wp-json/wc/store/v1${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }

    if (sessionToken) {
      headers['Cart-Token'] = sessionToken
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`WooCommerce Store API error: ${error}`)
    }

    const data = await response.json()
    return { data, headers: response.headers }
  }
}

export const wooClient = new WooCommerceClient()