/**
 * User API service
 * Handles all user-related API calls
 */

import { apiClient } from './axios.config'
import { API_ENDPOINTS } from '@config/constants'
import type { User, UpdateUserProfile, PaginatedResponse, PaginationParams } from '@types'

export const userService = {
  /**
   * Get paginated list of users
   */
  async getUsers(params: PaginationParams): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<{ data: PaginatedResponse<User> }>(
      API_ENDPOINTS.USERS.LIST,
      { params }
    )
    return response.data.data
  },

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get<{ data: User }>(API_ENDPOINTS.USERS.DETAIL(id))
    return response.data.data
  },

  /**
   * Update user profile
   */
  async updateUser(id: string, data: UpdateUserProfile): Promise<User> {
    const response = await apiClient.patch<{ data: User }>(
      API_ENDPOINTS.USERS.UPDATE(id),
      data
    )
    return response.data.data
  },

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.USERS.DELETE(id))
  },
}

export default userService
