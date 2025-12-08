/**
 * OTP Verification Page
 * Allows users to verify OTP code for password reset
 */

import { useState, useEffect, useRef, FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authService } from '@services/api'
import { ROUTES } from '@config/constants'
import './VerifyOtpPage.css'

interface LocationState {
  email?: string
  requestId?: string
  purpose?: 'RESET_PASSWORD' | 'LOGIN' | 'TWO_FACTOR' | string
  username?: string
  isFirstLogin?: boolean
}

export function VerifyOtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [currentRequestId, setCurrentRequestId] = useState(state?.requestId || '')

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Redirect if no state
  useEffect(() => {
    if (!state?.requestId) {
      // For LOGIN purpose, redirect to login page; otherwise to forgot password
      if (state?.purpose === 'LOGIN' || state?.purpose === 'TWO_FACTOR') {
        navigate(ROUTES.LOGIN)
      } else {
        navigate(ROUTES.FORGOT_PASSWORD)
      }
    }
  }, [state, navigate])

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [resendTimer])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedValue = value.slice(0, 6).split('')
      const newOtp = [...otp]
      pastedValue.forEach((char, i) => {
        if (index + i < 6 && /^\d$/.test(char)) {
          newOtp[index + i] = char
        }
      })
      setOtp(newOtp)
      const nextIndex = Math.min(index + pastedValue.length, 5)
      inputRefs.current[nextIndex]?.focus()
      return
    }

    if (/^\d?$/.test(value)) {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)

      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleResendOtp = async () => {
    if (!canResend) return

    try {
      setIsLoading(true)
      setError('')

      // Use appropriate API based on purpose
      if (state?.purpose === 'LOGIN' || state?.purpose === 'TWO_FACTOR') {
        const response = await authService.requestOtp({
          username: state?.email || state?.username || '',
          purpose: state?.purpose as 'LOGIN' | 'TWO_FACTOR'
        })
        // Update requestId with new one from response
        setCurrentRequestId(response.requestId)
      } else {
        // For password reset flow
        if (state?.email) {
          const response = await authService.forgetPassword({ email: state.email })
          // Update requestId with new one from response
          setCurrentRequestId(response.requestId)
        }
      }

      setResendTimer(60)
      setCanResend(false)
      setOtp(['', '', '', '', '', ''])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit OTP')
      return
    }

    if (!currentRequestId) {
      setError('Invalid session. Please start again.')
      return
    }

    try {
      setIsLoading(true)
      const response = await authService.verifyOtp({
        requestId: currentRequestId,
        otpCode,
        username: state?.email || state?.username || '',
      })

      if (response.verified) {
        // For first-time login, redirect to reset password to set new password
        if (state?.purpose === 'LOGIN' && state?.isFirstLogin) {
          navigate(ROUTES.RESET_PASSWORD, {
            state: {
              resetToken: response.resetToken,
              email: state.email,
              isFirstLogin: true,
            },
          })
        } else if (state?.purpose === 'TWO_FACTOR') {
          // For two-factor auth, redirect to dashboard after verification
          navigate(ROUTES.DASHBOARD)
        } else {
          // Default: password reset flow
          navigate(ROUTES.RESET_PASSWORD, {
            state: {
              resetToken: response.resetToken,
              email: state?.email,
            },
          })
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP. Please try again.')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const maskedEmail = state?.email
    ? state.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    : ''

  return (
    <div className="verify-otp-container">
      <div className="verify-otp-background">
        <div className="verify-otp-background__shape verify-otp-background__shape--1"></div>
        <div className="verify-otp-background__shape verify-otp-background__shape--2"></div>
      </div>

      <div className="verify-otp-card">
        {/* Header */}
        <div className="verify-otp-header">
          <div className="verify-otp-icon-wrapper">
            <svg
              className="verify-otp-icon"
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
          </div>
          <h1 className="verify-otp-title">Enter Verification Code</h1>
          <p className="verify-otp-subtitle">
            We've sent a 6-digit verification code to<br />
            <strong>{maskedEmail}</strong>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="verify-otp-alert verify-otp-alert--error" role="alert">
            <svg
              className="verify-otp-alert__icon"
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

        {/* OTP Form */}
        <form onSubmit={handleSubmit} className="verify-otp-form">
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="otp-input"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading}
                autoFocus={index === 0}
              />
            ))}
          </div>

          <button
            type="submit"
            className={`btn-submit ${isLoading ? 'btn-submit--loading' : ''}`}
            disabled={isLoading || otp.join('').length !== 6}
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
                <span>Verifying...</span>
              </>
            ) : (
              <span>Verify Code</span>
            )}
          </button>
        </form>

        {/* Resend Section */}
        <div className="verify-otp-resend">
          <p className="verify-otp-resend__text">
            Didn't receive the code?{' '}
            {canResend ? (
              <button
                type="button"
                className="verify-otp-resend__btn"
                onClick={handleResendOtp}
                disabled={isLoading}
              >
                Resend OTP
              </button>
            ) : (
              <span className="verify-otp-resend__timer">
                Resend in {resendTimer}s
              </span>
            )}
          </p>
        </div>

        {/* Footer Links */}
        <div className="verify-otp-footer">
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

export default VerifyOtpPage
