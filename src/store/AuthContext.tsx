/**
 * Authentication Context
 * Manages global authentication state
 */

import { createContext, useState, useEffect, ReactNode } from 'react'
import { User, LoginResponse } from '@types'
import { authService } from '@services/api'
import { setToken, removeToken, getStorageItem, setStorageItem, removeStorageItem } from '@utils'
import config from '@config'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  sessionId: string | null
  login: (username: string, password: string) => Promise<LoginResponse>
  logout: () => Promise<void>
  updateUser: (user: User) => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = getStorageItem<User>(config.storage.userKey)
        const storedSessionId = localStorage.getItem(config.storage.sessionIdKey)
        const token = localStorage.getItem(config.storage.tokenKey)

        if (storedUser && storedSessionId && token) {
          // First restore from storage to avoid flash of unauthenticated state
          setUser(storedUser)
          setSessionId(storedSessionId)

          // Optionally verify token is still valid by fetching current user
          // Only update if successful, don't logout on failure
          try {
            const currentUser = await authService.getCurrentUser()
            setUser(currentUser)
            setStorageItem(config.storage.userKey, currentUser)
          } catch (verifyError) {
            // Token might be expired but could be refreshed by interceptor
            // Keep user logged in with stored data
            console.warn('Token verification failed, using stored user data:', verifyError)
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error)
        removeToken()
        localStorage.removeItem(config.storage.sessionIdKey)
        removeStorageItem(config.storage.userKey)
        setUser(null)
        setSessionId(null)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (username: string, password: string): Promise<LoginResponse> => {
    try {
      setIsLoading(true)
      const loginResponse: LoginResponse = await authService.login({ username, password })

      // Store tokens
      setToken(loginResponse.accessToken)
      localStorage.setItem(config.storage.refreshTokenKey, loginResponse.refreshToken)
      localStorage.setItem(config.storage.sessionIdKey, loginResponse.sessionId)

      // Map LoginResponse to User object
      const userData: User = {
        id: loginResponse.userId,
        username: loginResponse.username,
        email: loginResponse.email,
        firstName: loginResponse.firstName,
        lastName: loginResponse.lastName,
        status: 'ACTIVE',
        role: loginResponse.role,
      }

      setStorageItem(config.storage.userKey, userData)
      setUser(userData)
      setSessionId(loginResponse.sessionId)

      return loginResponse
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      const currentUser = user || getStorageItem<User>(config.storage.userKey)
      if (currentUser?.username) {
        await authService.logout(currentUser.username)
      }
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      removeToken()
      localStorage.removeItem(config.storage.refreshTokenKey)
      localStorage.removeItem(config.storage.sessionIdKey)
      removeStorageItem(config.storage.userKey)
      setUser(null)
      setSessionId(null)
    }
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    setStorageItem(config.storage.userKey, updatedUser)
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    sessionId,
    login,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
