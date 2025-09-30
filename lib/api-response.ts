import { NextResponse } from 'next/server'

/**
 * Create a JSON response with no-cache headers
 * Ensures real-time data for critical operations
 */
export function createApiResponse<T>(
  data: T,
  options?: {
    status?: number
    success?: boolean
  }
) {
  const response = NextResponse.json(
    {
      success: options?.success ?? true,
      ...data,
    },
    { status: options?.status ?? 200 }
  )

  // Critical: Disable all caching for API responses
  // This ensures users always see the latest data
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  response.headers.set('Surrogate-Control', 'no-store')

  return response
}

/**
 * Create an error response with no-cache headers
 */
export function createErrorResponse(
  error: string,
  status: number = 500
) {
  const response = NextResponse.json(
    { success: false, error },
    { status }
  )

  // Also disable caching for errors
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')

  return response
}
