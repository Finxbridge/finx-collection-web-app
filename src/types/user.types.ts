/**
 * User-related types and interfaces
 */

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  avatar?: string
  createdAt: string
  updatedAt: string
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}

export interface AuthUser {
  user: User
  accessToken: string
  refreshToken: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface UpdateUserProfile {
  firstName?: string
  lastName?: string
  avatar?: string
}
