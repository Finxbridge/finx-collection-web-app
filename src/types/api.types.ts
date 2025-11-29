/**
 * API-related types and interfaces
 */

export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
}

export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
  statusCode: number
}

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

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
