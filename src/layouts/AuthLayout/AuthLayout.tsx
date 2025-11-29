/**
 * Auth Layout Component
 * Layout for authentication pages (login, register)
 */

import { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import './AuthLayout.css'

interface AuthLayoutProps {
  children?: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      <div className="auth-layout__container">
        <div className="auth-layout__content">
          {children || <Outlet />}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
