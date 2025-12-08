/**
 * Reset Password Page
 * Allows users to set a new password after OTP verification
 */

import { useState, useEffect, FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authService } from '@services/api'
import { ROUTES } from '@config/constants'
import './ResetPasswordPage.css'

interface LocationState {
  resetToken?: string
  email?: string
}

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Password strength indicators
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  })

  // Redirect if no reset token
  useEffect(() => {
    if (!state?.resetToken) {
      navigate(ROUTES.FORGOT_PASSWORD)
    }
  }, [state, navigate])

  // Check password strength
  useEffect(() => {
    setPasswordStrength({
      hasMinLength: newPassword.length >= 8,
      hasUpperCase: /[A-Z]/.test(newPassword),
      hasLowerCase: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    })
  }, [newPassword])

  const isPasswordStrong = Object.values(passwordStrength).every(Boolean)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (!isPasswordStrong) {
      setError('Password does not meet the requirements')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!state?.resetToken) {
      setError('Invalid reset token. Please start the process again.')
      return
    }

    try {
      setIsLoading(true)
      await authService.resetPassword({
        resetToken: state.resetToken,
        newPassword,
        confirmPassword,
      })
      setSuccess(true)

      // Redirect to login after success
      setTimeout(() => {
        navigate(ROUTES.LOGIN, {
          state: { message: 'Password reset successful. Please login with your new password.' },
        })
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-background">
        <div className="reset-password-background__shape reset-password-background__shape--1"></div>
        <div className="reset-password-background__shape reset-password-background__shape--2"></div>
      </div>

      <div className="reset-password-card">
        {/* Header */}
        <div className="reset-password-header">
          <div className="reset-password-icon-wrapper">
            <svg
              className="reset-password-icon"
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
            </svg>
          </div>
          <h1 className="reset-password-title">Create New Password</h1>
          <p className="reset-password-subtitle">
            Your new password must be different from previously used passwords.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="reset-password-alert reset-password-alert--success" role="alert">
            <svg
              className="reset-password-alert__icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18457 2.99721 7.13633 4.39828 5.49707C5.79935 3.85782 7.69279 2.71538 9.79619 2.24015C11.8996 1.76491 14.1003 1.98234 16.07 2.86"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M22 4L12 14.01L9 11.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Password reset successful! Redirecting to login...</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="reset-password-alert reset-password-alert--error" role="alert">
            <svg
              className="reset-password-alert__icon"
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

        {/* Form */}
        {!success && (
          <form onSubmit={handleSubmit} className="reset-password-form" noValidate>
            {/* New Password */}
            <div className="form-group">
              <label htmlFor="newPassword" className="form-label">
                New Password
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
                  />
                  <path
                    d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  className="form-input form-input--with-toggle"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65663 6.06 6.06M9.9 4.24C10.5883 4.07888 11.2931 3.99834 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1752 15.0074 10.8016 14.8565C10.4281 14.7056 10.0887 14.4811 9.80385 14.1962C9.51897 13.9113 9.29439 13.5719 9.14351 13.1984C8.99262 12.8248 8.91853 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2218 9.18488 10.8538C9.34884 10.4859 9.58525 10.1546 9.88 9.88"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M1 1L23 23"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Password Strength Indicators */}
            {newPassword && (
              <div className="password-requirements">
                <p className="password-requirements__title">Password must contain:</p>
                <ul className="password-requirements__list">
                  <li className={passwordStrength.hasMinLength ? 'met' : ''}>
                    <span className="check-icon"></span>
                    At least 8 characters
                  </li>
                  <li className={passwordStrength.hasUpperCase ? 'met' : ''}>
                    <span className="check-icon"></span>
                    One uppercase letter
                  </li>
                  <li className={passwordStrength.hasLowerCase ? 'met' : ''}>
                    <span className="check-icon"></span>
                    One lowercase letter
                  </li>
                  <li className={passwordStrength.hasNumber ? 'met' : ''}>
                    <span className="check-icon"></span>
                    One number
                  </li>
                  <li className={passwordStrength.hasSpecialChar ? 'met' : ''}>
                    <span className="check-icon"></span>
                    One special character
                  </li>
                </ul>
              </div>
            )}

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
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
                  />
                  <path
                    d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  className="form-input form-input--with-toggle"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65663 6.06 6.06M9.9 4.24C10.5883 4.07888 11.2931 3.99834 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1752 15.0074 10.8016 14.8565C10.4281 14.7056 10.0887 14.4811 9.80385 14.1962C9.51897 13.9113 9.29439 13.5719 9.14351 13.1984C8.99262 12.8248 8.91853 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2218 9.18488 10.8538C9.34884 10.4859 9.58525 10.1546 9.88 9.88"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M1 1L23 23"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <span className="form-error">Passwords do not match</span>
              )}
            </div>

            <button
              type="submit"
              className={`btn-submit ${isLoading ? 'btn-submit--loading' : ''}`}
              disabled={isLoading || !isPasswordStrong || newPassword !== confirmPassword}
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
                  <span>Resetting...</span>
                </>
              ) : (
                <span>Reset Password</span>
              )}
            </button>
          </form>
        )}

        {/* Footer Links */}
        <div className="reset-password-footer">
          <Link to={ROUTES.LOGIN} className="link-text link-text--secondary">
            <svg
              className="link-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 12H5M5 12L12 19M5 12L12 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
