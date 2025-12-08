/**
 * Account Lockout Status Page
 * Admin page to check and unlock user accounts
 */

import { useState, FormEvent } from 'react'
import { authService } from '@services/api'
import { Button } from '@components/common/Button'
import type { LockoutStatus } from '@types'
import './AccountLockoutPage.css'

export function AccountLockoutPage() {
  const [username, setUsername] = useState('')
  const [lockoutStatus, setLockoutStatus] = useState<LockoutStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleCheckStatus = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLockoutStatus(null)

    if (!username.trim()) {
      setError('Please enter a username')
      return
    }

    try {
      setIsLoading(true)
      const status = await authService.getLockoutStatus(username.trim())
      setLockoutStatus(status)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get lockout status')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnlockAccount = async () => {
    if (!username.trim()) return

    setError('')
    setSuccessMessage('')

    try {
      setIsUnlocking(true)
      await authService.unlockAccount(username.trim())
      setSuccessMessage(`Account for "${username}" has been successfully unlocked.`)
      // Refresh the status
      const status = await authService.getLockoutStatus(username.trim())
      setLockoutStatus(status)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock account')
    } finally {
      setIsUnlocking(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <div className="account-lockout-page">
      <div className="page-header">
        <div className="page-header__content">
          <h1 className="page-title">Account Lockout Status</h1>
          <p className="page-subtitle">
            Check if a user account is locked and unlock it if necessary
          </p>
        </div>
      </div>

      {/* Search Form */}
      <div className="lockout-card">
        <form onSubmit={handleCheckStatus} className="search-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username or Email
            </label>
            <div className="search-input-wrapper">
              <svg
                className="search-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M21 21L16.65 16.65"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type="text"
                id="username"
                className="form-input search-input"
                placeholder="Enter username or email to check"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
              <Button type="submit" isLoading={isLoading}>
                Check Status
              </Button>
            </div>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="alert alert--error" role="alert">
            <svg
              className="alert__icon"
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

        {/* Success Message */}
        {successMessage && (
          <div className="alert alert--success" role="alert">
            <svg
              className="alert__icon"
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
            <span>{successMessage}</span>
          </div>
        )}

        {/* Lockout Status Display */}
        {lockoutStatus && (
          <div className="lockout-status">
            <div
              className={`status-header ${
                lockoutStatus.isLocked ? 'status-header--locked' : 'status-header--unlocked'
              }`}
            >
              <div className="status-indicator">
                {lockoutStatus.isLocked ? (
                  <svg
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
                ) : (
                  <svg
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
                      d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C12.662 2 13.318 2.12644 13.934 2.37152"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                )}
              </div>
              <div className="status-text">
                <h3>{lockoutStatus.isLocked ? 'Account Locked' : 'Account Active'}</h3>
                <p>{lockoutStatus.message}</p>
              </div>
            </div>

            <div className="status-details">
              <div className="detail-row">
                <span className="detail-label">Username</span>
                <span className="detail-value">{username}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Failed Attempts</span>
                <span className="detail-value">
                  <span
                    className={`attempts-badge ${
                      lockoutStatus.failedAttempts > 0
                        ? 'attempts-badge--warning'
                        : 'attempts-badge--normal'
                    }`}
                  >
                    {lockoutStatus.failedAttempts}
                  </span>
                </span>
              </div>
              {lockoutStatus.isLocked && lockoutStatus.lockedUntil && (
                <div className="detail-row">
                  <span className="detail-label">Locked Until</span>
                  <span className="detail-value">{formatDate(lockoutStatus.lockedUntil)}</span>
                </div>
              )}
            </div>

            {lockoutStatus.isLocked && (
              <div className="unlock-action">
                <Button
                  variant="primary"
                  onClick={handleUnlockAccount}
                  isLoading={isUnlocking}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ width: 18, height: 18 }}
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
                      d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C12.662 2 13.318 2.12644 13.934 2.37152"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                  Unlock Account
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="help-section">
        <h3>About Account Lockouts</h3>
        <div className="help-content">
          <div className="help-item">
            <div className="help-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M12 16V12M12 8H12.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <h4>Why do accounts get locked?</h4>
              <p>
                Accounts are automatically locked after multiple failed login attempts to
                protect against brute force attacks.
              </p>
            </div>
          </div>
          <div className="help-item">
            <div className="help-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M12 6V12L16 14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <h4>Auto-unlock</h4>
              <p>
                Locked accounts will automatically unlock after a cooling-off period.
                Administrators can manually unlock accounts before this time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountLockoutPage
