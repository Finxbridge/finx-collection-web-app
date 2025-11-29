/**
 * Formatting utility functions
 */

import { format, formatDistance, formatRelative } from 'date-fns'

/**
 * Format date to string
 */
export const formatDate = (date: Date | string, formatStr = 'PPP'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, formatStr)
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return formatDistance(dateObj, new Date(), { addSuffix: true })
}

/**
 * Format date relative to now (e.g., "yesterday at 3:45 PM")
 */
export const formatRelativeDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return formatRelative(dateObj, new Date())
}

/**
 * Format currency
 */
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Format number with commas
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num)
}

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Capitalize first letter
 */
export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Convert string to title case
 */
export const toTitleCase = (text: string): string => {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
