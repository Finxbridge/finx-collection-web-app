/**
 * User-related types and interfaces
 */

// User Status
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED'

// Permission Action Types
export type PermissionAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE'

// Role Status
export type RoleStatus = 'ACTIVE' | 'INACTIVE'

// OTP Purpose
export type OtpPurpose = 'RESET_PASSWORD' | 'VERIFY_EMAIL' | 'TWO_FACTOR' | 'LOGIN'

// Device Type
export type DeviceType = 'WEB' | 'MOBILE' | 'TABLET' | 'DESKTOP'

// ===================
// User Types
// ===================
export interface UserRole {
  id: number
  name: string
  code: string
  displayName: string
  description: string
  status: RoleStatus
  createdAt: string
  permissions: Permission[]
}

export interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  mobileNumber?: string
  status: UserStatus
  role?: LegacyUserRole
  roles?: UserRole[]
  avatar?: string
  city?: string
  state?: string
  maxCaseCapacity?: number
  currentCaseCount?: number
  allocationPercentage?: number
  isFirstLogin?: boolean
  permissions?: string[]
  createdAt?: string
  updatedAt?: string
}

// Legacy type for backwards compatibility
export type LegacyUserRole = 'ADMIN' | 'AGENT' | 'SUPERVISOR' | 'MANAGER'

export interface UserSummary {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  status: UserStatus
}

export interface RoleSummary {
  id: number
  name: string
}

export interface PermissionSummary {
  code: string
  name: string
  category?: string
}

// ===================
// Authentication Types
// ===================
export interface LoginCredentials {
  username: string
  password: string
  deviceType?: DeviceType
  ipAddress?: string
  userAgent?: string
}

export interface LoginResponse {
  userId: number
  username: string
  email: string
  firstName: string
  lastName: string
  role: LegacyUserRole
  isFirstLogin: boolean
  requiresOtp?: boolean
  hasActiveSession?: boolean
  message?: string
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresAt: string
  refreshExpiresAt: string
  sessionId: string
}

export interface AuthUser {
  user: User
  accessToken: string
  refreshToken: string
  sessionId: string
  expiresAt: string
}

export interface TokenRefreshRequest {
  refreshToken: string
}

export interface TokenRefreshResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresAt: string
  refreshExpiresAt: string
  sessionId: string
}

// ===================
// OTP Types
// ===================
export interface OtpRequest {
  username: string
  purpose: OtpPurpose
}

export interface OtpResponse {
  requestId: string
  message: string
  email: string
  expiresAt: string
  remainingAttempts: number
}

export interface OtpVerifyRequest {
  requestId: string
  otpCode: string
  username: string
}

export interface OtpVerifyResponse {
  verified: boolean
  message: string
  resetToken: string
}

// ===================
// Password Reset Types
// ===================
export interface ForgetPasswordRequest {
  email: string
}

export interface ForgetPasswordResponse {
  requestId: string
  email: string
  message: string
  otpSent: boolean
  otpExpiryMinutes: number
}

export interface ResetPasswordRequest {
  resetToken: string
  newPassword: string
  confirmPassword: string
}

export interface ResetPasswordResponse {
  success: boolean
  message: string
}

// ===================
// Account Lockout Types
// ===================
export interface LockoutStatus {
  isLocked: boolean
  failedAttempts: number
  lockedUntil?: string
  message: string
}

// ===================
// Permission Types
// ===================
export interface Permission {
  id: number
  code: string
  name: string
  resource: string
  action: PermissionAction
  description: string
  createdAt: string
}

export interface CreatePermissionRequest {
  code: string
  name: string
  resource: string
  action: PermissionAction
  description: string
}

export interface UpdatePermissionRequest {
  code: string
  name: string
  resource: string
  action: PermissionAction
  description: string
}

// ===================
// Role Types
// ===================
export interface Role {
  id: number
  name: string
  code?: string
  displayName: string
  description: string
  status: RoleStatus
  createdAt: string
  permissions?: Permission[]
}

export interface CreateRoleRequest {
  name: string
  displayName: string
  description: string
  permissionIds: number[]
}

export interface UpdateRoleRequest {
  displayName?: string
  description?: string
  permissionIds?: number[]
}

// ===================
// User Management Types
// ===================
export type AllocationBucket = 'DEFAULT' | 'HIGH' | 'MEDIUM' | 'LOW'

// Approved Agency for dropdown (when creating user with AGENT role)
export interface ApprovedAgency {
  id: number
  agencyCode: string
  agencyName: string
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  mobileNumber?: string
  status: UserStatus
  userGroupId?: number | null
  city: string
  state: string
  maxCaseCapacity: number
  allocationPercentage: number
  allocationBucket: AllocationBucket
  teamId?: number | null
  agencyId?: number | null
  roleIds: number[]
}

export interface UpdateUserRequest {
  firstName?: string
  lastName?: string
  mobileNumber?: string
  status?: UserStatus
  userGroupId?: number | null
  city?: string
  state?: string
  maxCaseCapacity?: number
  allocationPercentage?: number
  allocationBucket?: AllocationBucket
  teamId?: number | null
  agencyId?: number | null
  roleIds?: number[]
}

export interface UpdateUserProfile {
  firstName?: string
  lastName?: string
  avatar?: string
}

// Legacy types for compatibility
export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
}
