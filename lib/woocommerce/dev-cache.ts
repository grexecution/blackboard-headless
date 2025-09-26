// Development-only cache to speed up local development
// This cache is ONLY used in development mode to avoid repeated API calls

const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

export function getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  // Only use cache in development
  if (process.env.NODE_ENV !== 'development') {
    return fetcher()
  }

  const cached = cache.get(key)

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[DEV CACHE HIT] ${key}`)
    return Promise.resolve(cached.data)
  }

  console.log(`[DEV CACHE MISS] ${key}`)
  return fetcher().then(data => {
    cache.set(key, { data, timestamp: Date.now() })
    return data
  })
}

export function clearCache() {
  cache.clear()
  console.log('[DEV CACHE] Cleared')
}