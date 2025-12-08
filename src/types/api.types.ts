/**
 * API-related types and interfaces
 * Matches backend response format
 */

// API Response Status (lowercase as returned by backend)
export type ApiStatus = 'success' | 'failure' | 'SUCCESS' | 'FAILURE'

// Standard API Response matching backend format
export interface ApiResponse<T = unknown> {
  status: ApiStatus
  message: string
  payload: T | null
  data?: T | null // Fallback for backwards compatibility
}

// Legacy format for backwards compatibility
export interface LegacyApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
}

export interface ApiError {
  status: 'failure' | 'FAILURE'
  message: string
  data: null
  errors?: Record<string, string[]>
  statusCode?: number
}

export interface PaginationParams {
  page?: number
  size?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Spring Boot paginated response format
export interface SpringPageable {
  sort: {
    sorted: boolean
    unsorted: boolean
    empty: boolean
  }
  offset: number
  pageNumber: number
  pageSize: number
  paged: boolean
  unpaged: boolean
}

export interface SpringPaginatedResponse<T> {
  content: T[]
  pageable: SpringPageable
  last: boolean
  totalPages: number
  totalElements: number
  size: number
  number: number
  sort: {
    sorted: boolean
    unsorted: boolean
    empty: boolean
  }
  first: boolean
  numberOfElements: number
  empty: boolean
}

// Legacy paginated response
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface QueryOptions {
  enabled?: boolean
  refetchInterval?: number
  cacheTime?: number
  staleTime?: number
}
