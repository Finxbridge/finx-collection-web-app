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
import { strategyEngineService as strategyEngineServiceImport } from './strategyEngine.service'
import {
  allocationService as allocationServiceImport,
  reallocationService as reallocationServiceImport,
  failureAnalysisService as failureAnalysisServiceImport,
} from './allocation.service'
import {
  repaymentService as repaymentServiceImport,
  digitalPaymentService as digitalPaymentServiceImport,
} from './repayment.service'
import { workflowService as workflowServiceImport } from './workflow.service'

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
export { strategyEngineService } from './strategyEngine.service'
export {
  allocationService,
  reallocationService,
  failureAnalysisService,
} from './allocation.service'
export { repaymentService, digitalPaymentService } from './repayment.service'
export { workflowService } from './workflow.service'

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
  strategyEngine: strategyEngineServiceImport,
  allocation: allocationServiceImport,
  reallocation: reallocationServiceImport,
  failureAnalysis: failureAnalysisServiceImport,
  repayment: repaymentServiceImport,
  digitalPayment: digitalPaymentServiceImport,
  workflow: workflowServiceImport,
}

export default api
