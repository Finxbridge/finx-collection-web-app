/**
 * Profile Page
 * Displays the logged-in user's profile information
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userManagementService } from '@services/api'
import { useAuth } from '@hooks'
import { Button } from '@components/common/Button'
import type { User } from '@types'
import { ROUTES } from '@config/constants'
import './ProfilePage.css'

export function ProfilePage() {
  const navigate = useNavigate()
  const { user: authUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!authUser?.id) {
        setError('User not authenticated')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const userData = await userManagementService.getById(authUser.id)
        setUser(userData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch profile details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [authUser?.id])

  const handleBack = () => {
    navigate(ROUTES.DASHBOARD)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="error-state">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <h3>Error Loading Profile</h3>
          <p>{error}</p>
          <Button onClick={handleBack}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="error-state">
          <h3>Profile Not Found</h3>
          <p>Your profile could not be loaded.</p>
          <Button onClick={handleBack}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <div className="page-header__content">
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">View your account information</p>
        </div>
      </div>

      <div className="profile-content">
        {/* User Header Card */}
        <div className="detail-card user-header-card">
          <div className="user-header">
            <div className="user-avatar-large">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="user-header-info">
              <h2>{user.firstName} {user.lastName}</h2>
              <span className="username">@{user.username}</span>
              <span className={`status-badge status-badge--${user.status.toLowerCase()}`}>
                {user.status}
              </span>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="detail-card">
          <h3 className="card-title">Basic Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{user.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Username</span>
              <span className="info-value">@{user.username}</span>
            </div>
            <div className="info-item">
              <span className="info-label">First Name</span>
              <span className="info-value">{user.firstName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Last Name</span>
              <span className="info-value">{user.lastName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Mobile Number</span>
              <span className="info-value">{user.mobileNumber || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">City</span>
              <span className="info-value">{user.city || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">State</span>
              <span className="info-value">{user.state || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Work Allocation */}
        <div className="detail-card">
          <h3 className="card-title">Work Allocation</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Max Case Capacity</span>
              <span className="info-value">{user.maxCaseCapacity ?? 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Current Case Count</span>
              <span className="info-value">{user.currentCaseCount ?? 0}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Allocation Percentage</span>
              <span className="info-value">{user.allocationPercentage ?? 0}%</span>
            </div>
          </div>
        </div>

        {/* Roles */}
        <div className="detail-card">
          <h3 className="card-title">Assigned Roles</h3>
          <div className="roles-list">
            {user.roles && user.roles.length > 0 ? (
              user.roles.map((role) => (
                <div key={role.id} className="role-card">
                  <div className="role-header">
                    <h4>{role.displayName}</h4>
                    <span className="role-code">{role.code}</span>
                    <span className={`status-badge status-badge--${role.status.toLowerCase()}`}>
                      {role.status}
                    </span>
                  </div>
                  <p className="role-description">{role.description}</p>
                  <div className="role-permissions">
                    <span className="permissions-label">Permissions ({role.permissions?.length || 0}):</span>
                    <div className="permissions-list">
                      {role.permissions?.map((perm) => (
                        <span key={perm.id} className="permission-tag" title={perm.description}>
                          {perm.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <span className="no-data">No roles assigned</span>
            )}
          </div>
        </div>

        {/* Timestamps */}
        <div className="detail-card">
          <h3 className="card-title">Activity</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Account Created</span>
              <span className="info-value">{formatDate(user.createdAt)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Last Updated</span>
              <span className="info-value">{formatDate(user.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
