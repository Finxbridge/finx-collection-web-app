/**
 * General helper utility functions
 */

import { clsx, type ClassValue } from 'clsx'

/**
 * Merge class names (works great with Tailwind)
 */
export const cn = (...inputs: ClassValue[]): string => {
  return clsx(inputs)
}

/**
 * Sleep/delay function
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Debounce function
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * Throttle function
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Generate random ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

/**
 * Group array by key
 */
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key])
      if (!result[groupKey]) {
        result[groupKey] = []
      }
      result[groupKey].push(item)
      return result
    },
    {} as Record<string, T[]>
  )
}

/**
 * Remove duplicates from array
 */
export const unique = <T>(array: T[]): T[] => {
  return Array.from(new Set(array))
}
