/**
 * TopBar Navigation Component
 * Top header with search, notifications, and user menu
 */

import { useState } from 'react'
import { useAuth } from '@hooks'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@config/constants'
import './TopBar.css'

export function TopBar() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate(ROUTES.LOGIN)
  }

  return (
    <header className="topbar">
      <div className="topbar__content">
        {/* Search Bar */}
        <div className="topbar__search">
          <svg
            className="topbar__search-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="11"
              cy="11"
              r="8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
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
            className="topbar__search-input"
            placeholder="Search customers, collections..."
          />
          <kbd className="topbar__search-kbd">Ctrl K</kbd>
        </div>

        {/* Right Section */}
        <div className="topbar__actions">
          {/* Notifications */}
          <div className="topbar__notification">
            <button
              className="topbar__icon-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="topbar__badge">3</span>
            </button>

            {showNotifications && (
              <div className="topbar__dropdown">
                <div className="topbar__dropdown-header">
                  <h3>Notifications</h3>
                  <button className="topbar__dropdown-clear">Mark all as read</button>
                </div>
                <div className="topbar__dropdown-content">
                  <div className="topbar__notification-item topbar__notification-item--unread">
                    <div className="topbar__notification-icon topbar__notification-icon--success">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M20 6L9 17L4 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="topbar__notification-text">
                      <div className="topbar__notification-title">Payment Received</div>
                      <div className="topbar__notification-desc">
                        Customer #1234 paid $500
                      </div>
                      <div className="topbar__notification-time">5 minutes ago</div>
                    </div>
                  </div>
                  <div className="topbar__notification-item">
                    <div className="topbar__notification-icon topbar__notification-icon--warning">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path
                          d="M12 8V12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M12 16H12.01"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <div className="topbar__notification-text">
                      <div className="topbar__notification-title">Overdue Payment</div>
                      <div className="topbar__notification-desc">
                        Customer #5678 payment is 5 days overdue
                      </div>
                      <div className="topbar__notification-time">2 hours ago</div>
                    </div>
                  </div>
                  <div className="topbar__notification-item">
                    <div className="topbar__notification-icon topbar__notification-icon--info">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path
                          d="M12 16V12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M12 8H12.01"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <div className="topbar__notification-text">
                      <div className="topbar__notification-title">New Report Available</div>
                      <div className="topbar__notification-desc">
                        Monthly collection report is ready
                      </div>
                      <div className="topbar__notification-time">1 day ago</div>
                    </div>
                  </div>
                </div>
                <div className="topbar__dropdown-footer">
                  <a href="/notifications">View all notifications</a>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="topbar__user">
            <button
              className="topbar__user-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="topbar__user-avatar">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              </div>
              <div className="topbar__user-info">
                <div className="topbar__user-name">Admin User</div>
                <div className="topbar__user-role">Administrator</div>
              </div>
              <svg
                className="topbar__user-chevron"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 9L12 15L18 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {showUserMenu && (
              <div className="topbar__dropdown topbar__dropdown--right">
                <div className="topbar__dropdown-content">
                  <a href={ROUTES.PROFILE} className="topbar__menu-item">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                    <span>Profile</span>
                  </a>
                  <a href={ROUTES.SETTINGS} className="topbar__menu-item">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Settings</span>
                  </a>
                  <div className="topbar__menu-divider"></div>
                  <button className="topbar__menu-item" onClick={handleLogout}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16 17L21 12L16 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M21 12H9"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default TopBar
