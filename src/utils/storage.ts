/**
 * LocalStorage utility functions
 */

import config from '@config'

/**
 * Get token from localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem(config.storage.tokenKey)
}

/**
 * Set token in localStorage
 */
export const setToken = (token: string): void => {
  localStorage.setItem(config.storage.tokenKey, token)
}

/**
 * Remove token from localStorage
 */
export const removeToken = (): void => {
  localStorage.removeItem(config.storage.tokenKey)
  localStorage.removeItem(config.storage.refreshTokenKey)
  localStorage.removeItem(config.storage.userKey)
}

/**
 * Generic localStorage get with JSON parsing
 */
export const getStorageItem = <T>(key: string): T | null => {
  const item = localStorage.getItem(key)
  if (!item) return null
  try {
    return JSON.parse(item) as T
  } catch {
    return item as T
  }
}

/**
 * Generic localStorage set with JSON stringification
 */
export const setStorageItem = <T>(key: string, value: T): void => {
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
  localStorage.setItem(key, stringValue)
}

/**
 * Remove item from localStorage
 */
export const removeStorageItem = (key: string): void => {
  localStorage.removeItem(key)
}

/**
 * Clear all localStorage
 */
export const clearStorage = (): void => {
  localStorage.clear()
}
