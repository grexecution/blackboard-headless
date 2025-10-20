interface WooCommerceConfig {
  url: string
  consumerKey: string
  consumerSecret: string
}

export class WooCommerceClient {
  private config: WooCommerceConfig

  constructor() {
    // Only run on server-side
    if (typeof window !== 'undefined') {
      // Client-side: return dummy config to prevent errors
      this.config = {
        url: '',
        consumerKey: '',
        consumerSecret: '',
      }
      return
    }

    // Server-side: Check for required environment variables
    const url = process.env.WP_BASE_URL || process.env.NEXT_PUBLIC_WOO_API_URL?.replace('/wp-json/wc/v3', '') || ''
    const consumerKey = process.env.WOO_CONSUMER_KEY || ''
    const consumerSecret = process.env.WOO_CONSUMER_SECRET || ''

    // Store config even if empty - let individual requests handle missing credentials
    this.config = {
      url,
      consumerKey,
      consumerSecret,
    }
  }

  // Check if credentials are available
  hasCredentials(): boolean {
    return !!(this.config.url && this.config.consumerKey && this.config.consumerSecret)
  }

  private getAuthHeader(): string {
    const credentials = `${this.config.consumerKey}:${this.config.consumerSecret}`
    return `Basic ${Buffer.from(credentials).toString('base64')}`
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Prevent client-side calls
    if (typeof window !== 'undefined') {
      throw new Error('WooCommerce API calls can only be made from the server')
    }

    // Check if credentials are available
    if (!this.hasCredentials()) {
      throw new Error('WooCommerce credentials not configured')
    }

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
    // Prevent client-side calls
    if (typeof window !== 'undefined') {
      throw new Error('WooCommerce API calls can only be made from the server')
    }

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