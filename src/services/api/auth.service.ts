/**
 * Authentication API service
 * Handles all authentication-related API calls
 */

import { apiClient } from './axios.config'
import { API_ENDPOINTS } from '@config/constants'
import type {
  ApiResponse,
  LoginCredentials,
  LoginResponse,
  RegisterData,
  User,
  AuthUser,
  TokenRefreshResponse,
  OtpRequest,
  OtpResponse,
  OtpVerifyRequest,
  OtpVerifyResponse,
  ForgetPasswordRequest,
  ForgetPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  LockoutStatus,
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

export const authService = {
  /**
   * Login user with username and password
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const loginData = {
      ...credentials,
      deviceType: credentials.deviceType || 'WEB',
      userAgent: credentials.userAgent || navigator.userAgent,
    }
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      loginData
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Login failed')
  },

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthUser> {
    const response = await apiClient.post<ApiResponse<AuthUser>>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Registration failed')
  },

  /**
   * Logout user by username
   */
  async logout(username: string): Promise<void> {
    const encodedUsername = encodeURIComponent(username)
    await apiClient.post(`${API_ENDPOINTS.AUTH.LOGOUT}?username=${encodedUsername}`)
  },

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(API_ENDPOINTS.AUTH.ME)
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to get user')
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<TokenRefreshResponse> {
    const response = await apiClient.post<ApiResponse<TokenRefreshResponse>>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      { refreshToken }
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Token refresh failed')
  },

  /**
   * Request OTP for password reset or other purposes
   */
  async requestOtp(data: OtpRequest): Promise<OtpResponse> {
    const response = await apiClient.post<ApiResponse<OtpResponse>>(
      API_ENDPOINTS.AUTH.REQUEST_OTP,
      data
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'OTP request failed')
  },

  /**
   * Verify OTP code
   */
  async verifyOtp(data: OtpVerifyRequest): Promise<OtpVerifyResponse> {
    const response = await apiClient.post<ApiResponse<OtpVerifyResponse>>(
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      data
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'OTP verification failed')
  },

  /**
   * Initiate forgot password flow
   */
  async forgetPassword(data: ForgetPasswordRequest): Promise<ForgetPasswordResponse> {
    const response = await apiClient.post<ApiResponse<ForgetPasswordResponse>>(
      API_ENDPOINTS.AUTH.FORGET_PASSWORD,
      data
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Password reset request failed')
  },

  /**
   * Reset password with reset token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const response = await apiClient.post<ApiResponse<ResetPasswordResponse>>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      data
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Password reset failed')
  },

  /**
   * Unlock a locked user account (Admin only)
   */
  async unlockAccount(username: string): Promise<string> {
    const encodedUsername = encodeURIComponent(username)
    const response = await apiClient.post<ApiResponse<string>>(
      API_ENDPOINTS.AUTH.UNLOCK_ACCOUNT(encodedUsername)
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Account unlock failed')
  },

  /**
   * Get lockout status for a user
   */
  async getLockoutStatus(username: string): Promise<LockoutStatus> {
    const encodedUsername = encodeURIComponent(username)
    const response = await apiClient.get<ApiResponse<LockoutStatus>>(
      API_ENDPOINTS.AUTH.LOCKOUT_STATUS(encodedUsername)
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to get lockout status')
  },
}

export default authService
