/**
 * Dashboard Page
 * Main dashboard view for authenticated users
 */

import { useAuth } from '@hooks'
import './DashboardPage.css'

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-page__title">Dashboard</h1>
      <p className="dashboard-page__welcome">
        Welcome back, {user?.firstName || 'User'}!
      </p>

      <div className="dashboard-page__grid">
        <div className="dashboard-card">
          <h3>Total Collections</h3>
          <p className="dashboard-card__value">$0</p>
        </div>

        <div className="dashboard-card">
          <h3>Active Cases</h3>
          <p className="dashboard-card__value">0</p>
        </div>

        <div className="dashboard-card">
          <h3>Pending Reviews</h3>
          <p className="dashboard-card__value">0</p>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
