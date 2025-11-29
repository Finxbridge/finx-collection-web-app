/**
 * Central export for all API services
 */

export { apiClient } from './axios.config'
export { authService } from './auth.service'
export { userService } from './user.service'

// Export a combined API object for convenient access
export const api = {
  auth: authService,
  users: userService,
}

export default api
