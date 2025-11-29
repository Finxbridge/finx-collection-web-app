/**
 * Axios instance configuration with interceptors
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import config from '@config'
import { getToken, removeToken, setToken } from '@utils/storage'
import { ApiError } from '@types'

// Create axios instance
export const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem(config.storage.refreshTokenKey)
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        // Attempt to refresh token
        const response = await axios.post(
          `${config.api.baseUrl}/auth/refresh`,
          { refreshToken }
        )

        const { accessToken } = response.data.data
        setToken(accessToken)

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
        }
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Refresh failed - logout user
        removeToken()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // Transform error to consistent format
    const apiError: ApiError = {
      success: false,
      message: error.response?.data?.message || error.message || 'An error occurred',
      errors: error.response?.data?.errors,
      statusCode: error.response?.status || 500,
    }

    return Promise.reject(apiError)
  }
)

export default apiClient
