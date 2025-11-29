/**
 * Protected Route Component
 * Wrapper for routes that require authentication
 */

import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@hooks'
import { ROUTES } from '@config/constants'

interface ProtectedRouteProps {
  children: ReactNode
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  redirectTo = ROUTES.LOGIN,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p>Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
