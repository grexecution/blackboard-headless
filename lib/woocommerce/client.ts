interface WooCommerceConfig {
  url: string
  consumerKey: string
  consumerSecret: string
}

export class WooCommerceClient {
  private config: WooCommerceConfig

  constructor() {
    this.config = {
      url: process.env.WP_BASE_URL || '',
      consumerKey: process.env.WOO_CONSUMER_KEY || '',
      consumerSecret: process.env.WOO_CONSUMER_SECRET || '',
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