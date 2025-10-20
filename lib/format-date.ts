// Date formatting utilities for consistent display across the app

/**
 * Formats an ISO date string to a readable format
 * @param dateString - ISO date string (e.g., "2025-10-30T00:00:00.000Z")
 * @param format - Format style: 'short' | 'medium' | 'long' | 'relative'
 * @returns Formatted date string
 */
export function formatDate(dateString: string | Date | null | undefined, format: 'short' | 'medium' | 'long' | 'relative' = 'medium'): string {
  if (!dateString) return '-'
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    
    // Check if date is valid
    if (isNaN(date.getTime())) return '-'
    
    switch (format) {
      case 'short':
        // Example: "Oct 30"
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      
      case 'medium':
        // Example: "Oct 30, 2025"
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      
      case 'long':
        // Example: "October 30, 2025"
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      
      case 'relative':
        // Example: "2 days ago", "in 3 days"
        return formatRelativeDate(date)
      
      default:
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
  } catch (error) {
    console.error('Error formatting date:', error)
    return '-'
  }
}

/**
 * Formats a date to show relative time (e.g., "2 days ago", "in 3 days")
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  
  if (diffMinutes === 0) return 'Just now'
  if (diffMinutes > 0 && diffMinutes < 60) return `in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`
  if (diffMinutes < 0 && diffMinutes > -60) return `${Math.abs(diffMinutes)} minute${Math.abs(diffMinutes) > 1 ? 's' : ''} ago`
  
  if (diffHours > 0 && diffHours < 24) return `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`
  if (diffHours < 0 && diffHours > -24) return `${Math.abs(diffHours)} hour${Math.abs(diffHours) > 1 ? 's' : ''} ago`
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays > 1 && diffDays <= 7) return `in ${diffDays} days`
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`
  
  // For dates beyond a week, show the actual date
  return formatDate(date, 'medium')
}

/**
 * Formats a date for input fields (YYYY-MM-DD)
 */
export function formatDateForInput(dateString: string | Date | null | undefined): string {
  if (!dateString) return ''
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    if (isNaN(date.getTime())) return ''
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  } catch (error) {
    return ''
  }
}

/**
 * Formats a timestamp to show both date and time
 * @param dateString - ISO date string
 * @returns Formatted date and time string (e.g., "Oct 30, 2025 at 2:30 PM")
 */
export function formatDateTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return '-'
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    if (isNaN(date.getTime())) return '-'
    
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    
    return `${dateStr} at ${timeStr}`
  } catch (error) {
    return '-'
  }
}

/**
 * Checks if a date is overdue (past today and not completed)
 */
export function isOverdue(dateString: string | null | undefined): boolean {
  if (!dateString) return false
  
  try {
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return date < today
  } catch (error) {
    return false
  }
}

/**
 * Gets the number of days until/since a date
 */
export function getDaysUntil(dateString: string | null | undefined): number {
  if (!dateString) return 0
  
  try {
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)
    
    const diffTime = date.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  } catch (error) {
    return 0
  }
}
