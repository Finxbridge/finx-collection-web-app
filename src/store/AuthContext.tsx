/**
 * Authentication Context
 * Manages global authentication state
 */

import { createContext, useState, useEffect, ReactNode } from 'react'
import { User, AuthUser } from '@types'
import { authService } from '@services/api'
import { setToken, removeToken, getStorageItem, setStorageItem } from '@utils'
import config from '@config'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: User) => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = getStorageItem<User>(config.storage.userKey)
        if (storedUser) {
          // Verify token is still valid by fetching current user
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
          setStorageItem(config.storage.userKey, currentUser)
        }
      } catch (error) {
        console.error('Auth initialization failed:', error)
        removeToken()
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const authUser: AuthUser = await authService.login({ email, password })

      setToken(authUser.accessToken)
      localStorage.setItem(config.storage.refreshTokenKey, authUser.refreshToken)
      setStorageItem(config.storage.userKey, authUser.user)
      setUser(authUser.user)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    try {
      setIsLoading(true)
      const authUser: AuthUser = await authService.register({
        email,
        password,
        firstName,
        lastName,
      })

      setToken(authUser.accessToken)
      localStorage.setItem(config.storage.refreshTokenKey, authUser.refreshToken)
      setStorageItem(config.storage.userKey, authUser.user)
      setUser(authUser.user)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      removeToken()
      setUser(null)
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
    login,
    register,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
