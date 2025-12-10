/**
 * Enterprise Login Form Component
 * Professional login interface for collection management system
 */

import { useState, useRef, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@hooks'
import { authService } from '@services/api'
import { ROUTES } from '@config/constants'
import type { LoginResponse } from '@types'
import './LoginForm.css'

interface ActiveSessionInfo {
  username: string
  message: string
  password: string
}

export function LoginForm() {
  const navigate = useNavigate()
  const { login } = useAuth()

  // Use refs instead of state to allow browser autofill to work
  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeSessionModal, setActiveSessionModal] = useState<ActiveSessionInfo | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLoginSuccess = async (loginResponse: LoginResponse) => {
    // Handle first login - request OTP and redirect to verification
    if (loginResponse.isFirstLogin) {
      // Request OTP for first time login
      const otpResponse = await authService.requestOtp({
        username: loginResponse.email,
        purpose: 'LOGIN'
      })

      navigate(ROUTES.VERIFY_OTP, {
        state: {
          email: loginResponse.email,
          username: loginResponse.username,
          requestId: otpResponse.requestId,
          purpose: 'LOGIN',
          isFirstLogin: true
        }
      })
      return
    }

    // Handle OTP requirement (two-factor auth)
    if (loginResponse.requiresOtp) {
      navigate(ROUTES.VERIFY_OTP, {
        state: {
          username: loginResponse.username,
          purpose: 'TWO_FACTOR'
        }
      })
      return
    }

    // Normal login - redirect to dashboard
    navigate(ROUTES.DASHBOARD)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    const username = usernameRef.current?.value || ''
    const password = passwordRef.current?.value || ''

    // Validation
    if (!username || !password) {
      setError('Please fill in all fields')
      return
    }

    try {
      setIsLoading(true)
      const loginResponse = await login(username, password)

      // Check if there's an active session conflict
      if (loginResponse.hasActiveSession && !loginResponse.accessToken) {
        setActiveSessionModal({
          username: loginResponse.username,
          message: loginResponse.message || 'Active session exists in another browser.',
          password: password
        })
        return
      }

      await handleLoginSuccess(loginResponse)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForceLogout = async () => {
    if (!activeSessionModal) return

    try {
      setIsLoggingOut(true)
      // Force logout the existing session using username
      await authService.logout(activeSessionModal.username)

      // Now try to login again
      const loginResponse = await login(activeSessionModal.username, activeSessionModal.password)
      setActiveSessionModal(null)

      await handleLoginSuccess(loginResponse)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout. Please try again.')
      setActiveSessionModal(null)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleCancelModal = () => {
    setActiveSessionModal(null)
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-background__shape login-background__shape--1"></div>
        <div className="login-background__shape login-background__shape--2"></div>
        <div className="login-background__shape login-background__shape--3"></div>
      </div>

      <div className="login-card">
        {/* Logo Section */}
        <div className="login-header">
          <div className="login-logo">
            <svg
              className="login-logo__icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="login-logo__text">FinxCollection</span>
          </div>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to your account to continue</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="login-alert login-alert--error" role="alert">
            <svg
              className="login-alert__icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path
                d="M12 8V12M12 16H12.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form - name attribute helps browser identify the form for password saving */}
        <form onSubmit={handleSubmit} className="login-form" name="login" autoComplete="on">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <div className="input-wrapper">
              <svg
                className="input-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                ref={usernameRef}
                type="text"
                id="username"
                name="username"
                className="form-input"
                placeholder="Enter your username"
                autoComplete="username"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-wrapper">
              <svg
                className="input-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="3"
                  y="11"
                  width="18"
                  height="11"
                  rx="2"
                  ry="2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                ref={passwordRef}
                type="password"
                id="password"
                name="password"
                className="form-input"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="form-options">
            <Link to={ROUTES.FORGOT_PASSWORD} className="link-text link-text--primary">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`btn-submit ${isLoading ? 'btn-submit--loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="btn-spinner" viewBox="0 0 24 24">
                  <circle
                    className="btn-spinner__circle"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <svg
                  className="btn-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 12H19M19 12L12 5M19 12L12 19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="login-footer">
          <p className="login-footer__text">
            Need assistance?{' '}
            <a href="/support" className="link-text link-text--secondary">
              Contact Support
            </a>
          </p>
          <div className="login-footer__divider"></div>
          <p className="login-footer__info">
            Secure enterprise-grade authentication
            <svg
              className="login-footer__shield"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 12L11 14L15 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </p>
        </div>
      </div>

      {/* Active Session Modal */}
      {activeSessionModal && (
        <div className="session-modal-overlay">
          <div className="session-modal">
            <div className="session-modal__icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="session-modal__title">Active Session Detected</h2>
            <p className="session-modal__message">{activeSessionModal.message}</p>
            <p className="session-modal__info">
              Would you like to logout from the other session and continue here?
            </p>
            <div className="session-modal__actions">
              <button
                type="button"
                className="session-modal__btn session-modal__btn--cancel"
                onClick={handleCancelModal}
                disabled={isLoggingOut}
              >
                Cancel
              </button>
              <button
                type="button"
                className="session-modal__btn session-modal__btn--logout"
                onClick={handleForceLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <svg className="btn-spinner btn-spinner--sm" viewBox="0 0 24 24">
                      <circle
                        className="btn-spinner__circle"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                    </svg>
                    <span>Logging out...</span>
                  </>
                ) : (
                  'Logout & Continue'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoginForm
