/**
 * Dashboard Page
 * Main dashboard view for authenticated users with stats and overview
 */

import { useAuth } from '@hooks'
import './DashboardPage.css'

export function DashboardPage() {
  const { user } = useAuth()

  const stats = [
    {
      title: 'Total Collections',
      value: '$124,500',
      change: '+12.5%',
      trend: 'up',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      color: 'blue',
    },
    {
      title: 'Active Customers',
      value: '1,234',
      change: '+8.2%',
      trend: 'up',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
          <path
            d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      color: 'green',
    },
    {
      title: 'Pending Cases',
      value: '87',
      change: '-3.1%',
      trend: 'down',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" />
          <path d="M16 13H8" stroke="currentColor" strokeWidth="2" />
          <path d="M16 17H8" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
      color: 'orange',
    },
    {
      title: 'Success Rate',
      value: '94.5%',
      change: '+2.3%',
      trend: 'up',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polyline
            points="22 12 18 12 15 21 9 3 6 12 2 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      color: 'purple',
    },
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'payment',
      customer: 'John Doe',
      amount: '$2,500',
      status: 'completed',
      time: '2 hours ago',
    },
    {
      id: 2,
      type: 'new_case',
      customer: 'Jane Smith',
      amount: '$5,000',
      status: 'pending',
      time: '4 hours ago',
    },
    {
      id: 3,
      type: 'payment',
      customer: 'Bob Johnson',
      amount: '$1,200',
      status: 'completed',
      time: '6 hours ago',
    },
    {
      id: 4,
      type: 'overdue',
      customer: 'Alice Williams',
      amount: '$3,800',
      status: 'overdue',
      time: '1 day ago',
    },
  ]

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back, {user?.firstName || 'Admin'}! Here's what's happening today.
          </p>
        </div>
        <button className="dashboard-btn">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M21 15V19C21 19.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 19.5304 3 19V15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="7 10 12 15 17 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="12"
              y1="15"
              x2="12"
              y2="3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Download Report</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.title} className={`stat-card stat-card--${stat.color}`}>
            <div className="stat-card__header">
              <div className="stat-card__icon">{stat.icon}</div>
              <div className={`stat-card__trend stat-card__trend--${stat.trend}`}>
                {stat.change}
              </div>
            </div>
            <div className="stat-card__body">
              <div className="stat-card__value">{stat.value}</div>
              <div className="stat-card__title">{stat.title}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="dashboard-card dashboard-card--full">
        <div className="dashboard-card__header">
          <h2 className="dashboard-card__title">Recent Activity</h2>
          <a href="/activity" className="dashboard-card__link">
            View all
          </a>
        </div>
        <div className="dashboard-card__content">
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className={`activity-icon activity-icon--${activity.type}`}>
                  {activity.type === 'payment' && (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M20 6L9 17L4 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {activity.type === 'new_case' && (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 5V19M5 12H19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {activity.type === 'overdue' && (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <path
                        d="M12 8V12M12 16H12.01"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </div>
                <div className="activity-details">
                  <div className="activity-customer">{activity.customer}</div>
                  <div className="activity-time">{activity.time}</div>
                </div>
                <div className="activity-amount">{activity.amount}</div>
                <div className={`activity-status activity-status--${activity.status}`}>
                  {activity.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
