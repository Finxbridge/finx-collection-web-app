/**
 * Central export for all API services
 */

import { authService as authServiceImport } from './auth.service'
import { userService as userServiceImport } from './user.service'

export { apiClient } from './axios.config'
export { authService } from './auth.service'
export { userService } from './user.service'

// Export a combined API object for convenient access
export const api = {
  auth: authServiceImport,
  users: userServiceImport,
}

export default api
