/**
 * Validation utility functions
 */

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 * At least 8 characters, 1 uppercase, 1 lowercase, 1 number
 */
export const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  return passwordRegex.test(password)
}

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate phone number (basic US format)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?1?\s*\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})$/
  return phoneRegex.test(phone)
}

/**
 * Check if string is empty or whitespace
 */
export const isEmpty = (value: string): boolean => {
  return !value || value.trim().length === 0
}

/**
 * Check if value is defined and not null
 */
export const isDefined = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined
}
