/**
 * User Management API service
 * Handles all user, role, and permission management API calls
 */

import { apiClient } from './axios.config'
import { API_ENDPOINTS } from '@config/constants'
import type {
  ApiResponse,
  SpringPaginatedResponse,
  PaginationParams,
  Permission,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  User,
  UserSummary,
  CreateUserRequest,
  UpdateUserRequest,
  PermissionSummary,
  ApprovedAgency,
} from '@types'

/**
 * Helper to check if API response is successful
 */
const isSuccess = (status: string): boolean => {
  return status.toLowerCase() === 'success'
}

/**
 * Helper to get payload from API response (handles both 'payload' and 'data' fields)
 */
const getPayload = <T>(response: ApiResponse<T>): T | null => {
  return response.payload ?? response.data ?? null
}

// ===================
// Permission Service
// ===================
export const permissionService = {
  /**
   * Get all permissions
   */
  async getAll(): Promise<Permission[]> {
    const response = await apiClient.get<ApiResponse<Permission[]>>(
      API_ENDPOINTS.MANAGEMENT.PERMISSIONS.LIST
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to fetch permissions')
  },

  /**
   * Get permission by ID
   */
  async getById(id: number): Promise<Permission> {
    const response = await apiClient.get<ApiResponse<Permission>>(
      API_ENDPOINTS.MANAGEMENT.PERMISSIONS.DETAIL(id)
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Permission not found')
  },

  /**
   * Create a new permission
   */
  async create(data: CreatePermissionRequest): Promise<Permission> {
    const response = await apiClient.post<ApiResponse<Permission>>(
      API_ENDPOINTS.MANAGEMENT.PERMISSIONS.CREATE,
      data
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to create permission')
  },

  /**
   * Update an existing permission
   */
  async update(id: number, data: UpdatePermissionRequest): Promise<Permission> {
    const response = await apiClient.put<ApiResponse<Permission>>(
      API_ENDPOINTS.MANAGEMENT.PERMISSIONS.UPDATE(id),
      data
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to update permission')
  },

  /**
   * Delete a permission
   */
  async delete(id: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.MANAGEMENT.PERMISSIONS.DELETE(id)
    )
    if (!isSuccess(response.data.status)) {
      throw new Error(response.data.message || 'Failed to delete permission')
    }
  },
}

// ===================
// Role Service
// ===================
export const roleService = {
  /**
   * Get all roles
   */
  async getAll(): Promise<Role[]> {
    const response = await apiClient.get<ApiResponse<Role[]>>(
      API_ENDPOINTS.MANAGEMENT.ROLES.LIST
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to fetch roles')
  },

  /**
   * Get role by ID
   */
  async getById(id: number): Promise<Role> {
    const response = await apiClient.get<ApiResponse<Role>>(
      API_ENDPOINTS.MANAGEMENT.ROLES.DETAIL(id)
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Role not found')
  },

  /**
   * Create a new role
   */
  async create(data: CreateRoleRequest): Promise<Role> {
    const response = await apiClient.post<ApiResponse<Role>>(
      API_ENDPOINTS.MANAGEMENT.ROLES.CREATE,
      data
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to create role')
  },

  /**
   * Update an existing role
   */
  async update(id: number, data: UpdateRoleRequest): Promise<Role> {
    const response = await apiClient.put<ApiResponse<Role>>(
      API_ENDPOINTS.MANAGEMENT.ROLES.UPDATE(id),
      data
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to update role')
  },

  /**
   * Delete a role
   */
  async delete(id: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.MANAGEMENT.ROLES.DELETE(id)
    )
    if (!isSuccess(response.data.status)) {
      throw new Error(response.data.message || 'Failed to delete role')
    }
  },
}

// ===================
// User Management Service
// ===================
export const userManagementService = {
  /**
   * Get all users with pagination
   */
  async getAll(params?: PaginationParams): Promise<SpringPaginatedResponse<UserSummary>> {
    const response = await apiClient.get<ApiResponse<SpringPaginatedResponse<UserSummary>>>(
      API_ENDPOINTS.MANAGEMENT.USERS.LIST,
      { params }
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to fetch users')
  },

  /**
   * Get user by ID
   */
  async getById(id: number): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(
      API_ENDPOINTS.MANAGEMENT.USERS.DETAIL(id)
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'User not found')
  },

  /**
   * Create a new user
   */
  async create(data: CreateUserRequest): Promise<UserSummary> {
    const response = await apiClient.post<ApiResponse<UserSummary>>(
      API_ENDPOINTS.MANAGEMENT.USERS.CREATE,
      data
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to create user')
  },

  /**
   * Update an existing user
   */
  async update(id: number, data: UpdateUserRequest): Promise<UserSummary> {
    const response = await apiClient.put<ApiResponse<UserSummary>>(
      API_ENDPOINTS.MANAGEMENT.USERS.UPDATE(id),
      data
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to update user')
  },

  /**
   * Delete a user
   */
  async delete(id: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.MANAGEMENT.USERS.DELETE(id)
    )
    if (!isSuccess(response.data.status)) {
      throw new Error(response.data.message || 'Failed to delete user')
    }
  },

  /**
   * Get user permissions
   */
  async getPermissions(userId: number): Promise<PermissionSummary[]> {
    const response = await apiClient.get<ApiResponse<PermissionSummary[]>>(
      API_ENDPOINTS.MANAGEMENT.USERS.PERMISSIONS(userId)
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to fetch user permissions')
  },

  /**
   * Get approved agencies for dropdown (when creating user with AGENT role)
   */
  async getApprovedAgencies(): Promise<ApprovedAgency[]> {
    const response = await apiClient.get<ApiResponse<ApprovedAgency[]>>(
      API_ENDPOINTS.MANAGEMENT.USERS.APPROVED_AGENCIES
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to fetch approved agencies')
  },
}

export default {
  permission: permissionService,
  role: roleService,
  user: userManagementService,
}
