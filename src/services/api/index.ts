/**
 * Central export for all API services
 */

import { authService as authServiceImport } from './auth.service'
import { userService as userServiceImport } from './user.service'
import {
  permissionService as permissionServiceImport,
  roleService as roleServiceImport,
  userManagementService as userManagementServiceImport,
} from './management.service'
import { masterDataService as masterDataServiceImport } from './masterData.service'
import { caseSourcingService as caseSourcingServiceImport } from './caseSourcing.service'

export { apiClient } from './axios.config'
export { authService } from './auth.service'
export { userService } from './user.service'
export {
  permissionService,
  roleService,
  userManagementService,
} from './management.service'
export { masterDataService } from './masterData.service'
export { caseSourcingService } from './caseSourcing.service'

// Export a combined API object for convenient access
export const api = {
  auth: authServiceImport,
  users: userServiceImport,
  management: {
    permissions: permissionServiceImport,
    roles: roleServiceImport,
    users: userManagementServiceImport,
  },
  masterData: masterDataServiceImport,
  caseSourcing: caseSourcingServiceImport,
}

export default api
