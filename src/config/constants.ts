/**
 * Application-wide constants
 */

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_OTP: '/verify-otp',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  // Access Management Routes
  ACCESS_MANAGEMENT: '/access-management',
  USERS: '/access-management/users',
  USER_DETAIL: '/access-management/users/:id',
  ROLES: '/access-management/roles',
  PERMISSIONS: '/access-management/permissions',
  ACCOUNT_LOCKOUT: '/access-management/account-lockout',
  // Master Data Routes
  MASTER_DATA: '/master-data',
  // Case Sourcing Routes
  CASE_SOURCING: '/case-sourcing',
  CASE_SOURCING_DASHBOARD: '/case-sourcing/dashboard',
  CASE_SOURCING_UPLOAD: '/case-sourcing/upload',
  CASE_SOURCING_BATCHES: '/case-sourcing/batches',
  CASE_SOURCING_BATCH_DETAIL: '/case-sourcing/batches/:batchId',
  CASE_SOURCING_UNALLOCATED: '/case-sourcing/unallocated',
  CASE_SOURCING_UNALLOCATED_DETAIL: '/case-sourcing/unallocated/:caseId',
  CASE_SOURCING_SEARCH: '/case-sourcing/search',
  CASE_SOURCING_CASE_DETAIL: '/case-sourcing/cases/:caseId',
  CASE_SOURCING_REPORTS: '/case-sourcing/reports',
  // Strategy Engine Routes
  STRATEGY_ENGINE: '/strategy-engine',
  STRATEGY_ENGINE_LOGS: '/strategy-engine/logs',
  // Allocation Routes
  ALLOCATION: '/allocation',
  ALLOCATION_UPLOAD: '/allocation/upload',
  ALLOCATION_RULES: '/allocation/rules',
  ALLOCATION_RULE_DETAIL: '/allocation/rules/:ruleId',
  ALLOCATION_WORKLOAD: '/allocation/workload',
  ALLOCATION_REALLOCATION: '/allocation/reallocation',
  ALLOCATION_BATCHES: '/allocation/batches',
  ALLOCATION_BATCH_DETAIL: '/allocation/batch/:batchId',
  REALLOCATION_BATCH_DETAIL: '/allocation/reallocation/batch/:batchId',
  ALLOCATED_CASES: '/allocation/cases',
  // Template Management Routes
  TEMPLATE_MANAGEMENT: '/template-management',
  NOT_FOUND: '*',
} as const

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/access/auth/login',
    REGISTER: '/access/auth/register',
    LOGOUT: '/access/auth/logout',
    REFRESH_TOKEN: '/access/auth/refresh-token',
    ME: '/access/auth/me',
    // OTP endpoints
    REQUEST_OTP: '/access/auth/request-otp',
    VERIFY_OTP: '/access/auth/verify-otp',
    // Password reset endpoints
    FORGET_PASSWORD: '/access/auth/forget-password',
    RESET_PASSWORD: '/access/auth/reset-password',
    // Account lockout endpoints
    UNLOCK_ACCOUNT: (username: string) => `/access/auth/unlock-account/${username}`,
    LOCKOUT_STATUS: (username: string) => `/access/auth/lockout-status/${username}`,
  },
  MANAGEMENT: {
    // Permission endpoints
    PERMISSIONS: {
      LIST: '/access/management/permissions',
      DETAIL: (id: number) => `/access/management/permissions/${id}`,
      CREATE: '/access/management/permissions',
      UPDATE: (id: number) => `/access/management/permissions/${id}`,
      DELETE: (id: number) => `/access/management/permissions/${id}`,
    },
    // Role endpoints
    ROLES: {
      LIST: '/access/management/roles',
      DETAIL: (id: number) => `/access/management/roles/${id}`,
      CREATE: '/access/management/roles',
      UPDATE: (id: number) => `/access/management/roles/${id}`,
      DELETE: (id: number) => `/access/management/roles/${id}`,
    },
    // User endpoints
    USERS: {
      LIST: '/access/management/users',
      DETAIL: (id: number) => `/access/management/users/${id}`,
      CREATE: '/access/management/users',
      UPDATE: (id: number) => `/access/management/users/${id}`,
      DELETE: (id: number) => `/access/management/users/${id}`,
      PERMISSIONS: (userId: number) => `/access/management/users/${userId}/permissions`,
    },
  },
  // Legacy endpoints for backwards compatibility
  USERS: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },
  // Master Data endpoints
  MASTER_DATA: {
    LIST: '/master-data',
    GET_BY_TYPE: '/master-data',
    CREATE: '/master-data/create',
    UPDATE: (id: number) => `/master-data/${id}`,
    DELETE: (id: number) => `/master-data/${id}`,
    DELETE_BY_TYPE: (type: string) => `/master-data/type/${type}`,
    BULK_UPLOAD: '/master-data/bulk-upload',
    BULK_UPLOAD_BY_TYPE: '/master-data/bulk-upload-by-type',
    TEMPLATE: '/master-data/upload/template',
    TEMPLATE_V2: '/master-data/upload/template-v2',
    CATEGORIES: '/master-data/all',
  },
  // Case Sourcing endpoints
  CASE_SOURCING: {
    DASHBOARD_SUMMARY: '/case/source/dashboard/summary',
    STATS: '/case/source/stats',
    UPLOAD: '/case/source/upload',
    RECENT_UPLOADS: '/case/source/recent-uploads',
    BATCHES: '/case/source/batches',
    BATCH_STATUS: (batchId: string) => `/case/source/${batchId}/status`,
    BATCH_SUMMARY: (batchId: string) => `/case/source/${batchId}/summary`,
    BATCH_REUPLOAD: (batchId: string) => `/case/source/${batchId}/reupload`,
    UPLOAD_TEMPLATE: '/case/source/upload/template',
    VALIDATE_HEADERS: '/case/source/validate-headers',
    BATCH_ERRORS: (batchId: string) => `/case/source/${batchId}/errors`,
    BATCH_ERRORS_EXPORT: (batchId: string) => `/case/source/${batchId}/errors/export`,
    BATCH_EXPORT: (batchId: string) => `/case/source/${batchId}/export`,
    UNALLOCATED: '/case/source/unallocated',
    UNALLOCATED_DETAIL: (caseId: number) => `/source/unallocated/${caseId}`,
    SEARCH: '/case/source/search',
    CASE_TIMELINE: (caseId: number) => `/case/source/${caseId}/timeline`,
    REPORTS_INTAKE: '/case/source/reports/intake',
    REPORTS_UNALLOCATED: '/case/source/reports/unallocated',
  },
} as const

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const

export const PAGINATION = {
  DEFAULT_PAGE: 0,
  DEFAULT_SIZE: 20,
  MAX_SIZE: 100,
} as const

export const PERMISSION_ACTIONS = ['CREATE', 'READ', 'UPDATE', 'DELETE'] as const

export const USER_STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'LOCKED'] as const

export const ROLE_STATUSES = ['ACTIVE', 'INACTIVE'] as const
