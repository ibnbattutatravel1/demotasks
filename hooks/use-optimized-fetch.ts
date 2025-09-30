import { useEffect, useState, useRef, useCallback } from 'react'

interface FetchOptions<T> {
  url: string
  cacheKey?: string
  cacheDuration?: number // in milliseconds
  dependencies?: any[]
  skip?: boolean
}

interface FetchState<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

// Simple in-memory cache for the client side
const clientCache = new Map<string, { data: any; timestamp: number; ttl: number }>()

/**
 * Optimized fetch hook with built-in caching and deduplication
 * Prevents multiple identical requests and caches responses
 */
export function useOptimizedFetch<T = any>(options: FetchOptions<T>): FetchState<T> {
  const { url, cacheKey, cacheDuration = 30000, dependencies = [], skip = false } = options
  
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(!skip)
  const [error, setError] = useState<Error | null>(null)
  
  // Track active requests to prevent duplicates
  const activeRequestRef = useRef<Promise<any> | null>(null)
  const mountedRef = useRef(true)

  const fetchData = useCallback(async () => {
    if (skip) return

    const key = cacheKey || url

    // Check cache first
    const cached = clientCache.get(key)
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      setData(cached.data)
      setIsLoading(false)
      return
    }

    // If there's already an active request for this URL, wait for it
    if (activeRequestRef.current) {
      try {
        const result = await activeRequestRef.current
        if (mountedRef.current) {
          setData(result)
          setIsLoading(false)
        }
        return
      } catch (err) {
        // Will be handled below
      }
    }

    setIsLoading(true)
    setError(null)

    // Create new request
    const request = fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        const json = await res.json()
        const result = json.success ? json.data : json
        
        // Cache the result
        clientCache.set(key, {
          data: result,
          timestamp: Date.now(),
          ttl: cacheDuration,
        })
        
        return result
      })

    activeRequestRef.current = request

    try {
      const result = await request
      if (mountedRef.current) {
        setData(result)
        setError(null)
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
        setData(null)
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
      }
      activeRequestRef.current = null
    }
  }, [url, cacheKey, cacheDuration, skip])

  useEffect(() => {
    mountedRef.current = true
    fetchData()
    
    return () => {
      mountedRef.current = false
    }
  }, [fetchData, ...dependencies])

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  }
}

/**
 * Clear cache for a specific key or pattern
 */
export function clearCache(pattern?: string) {
  if (!pattern) {
    clientCache.clear()
    return
  }

  for (const key of clientCache.keys()) {
    if (key.includes(pattern)) {
      clientCache.delete(key)
    }
  }
}

/**
 * Prefetch data and cache it
 */
export function prefetch(url: string, cacheDuration: number = 30000) {
  return fetch(url)
    .then(async (res) => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const json = await res.json()
      const result = json.success ? json.data : json
      
      clientCache.set(url, {
        data: result,
        timestamp: Date.now(),
        ttl: cacheDuration,
      })
      
      return result
    })
}
