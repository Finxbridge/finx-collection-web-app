/**
 * Authentication API service
 * Handles all authentication-related API calls
 */

import { apiClient } from './axios.config'
import { API_ENDPOINTS } from '@config/constants'
import type { AuthUser, LoginCredentials, RegisterData, User } from '@types'

export const authService = {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const response = await apiClient.post<{ data: AuthUser }>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    )
    return response.data.data
  },

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthUser> {
    const response = await apiClient.post<{ data: AuthUser }>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    )
    return response.data.data
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT)
  },

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ data: User }>(API_ENDPOINTS.AUTH.ME)
    return response.data.data
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await apiClient.post<{ data: { accessToken: string } }>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    )
    return response.data.data
  },
}

export default authService
