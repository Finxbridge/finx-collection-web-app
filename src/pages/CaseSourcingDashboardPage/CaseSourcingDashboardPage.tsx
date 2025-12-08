/**
 * Case Sourcing Dashboard Page
 * Overview of case intake metrics, statistics, and recent uploads
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { caseSourcingService } from '@services/api'
import { Button } from '@components/common/Button'
import { ROUTES } from '@config/constants'
import type {
  DashboardSummary,
  DataSourceStats,
  RecentUpload,
} from '@types'
import './CaseSourcingDashboardPage.css'

export function CaseSourcingDashboardPage() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [stats, setStats] = useState<DataSourceStats[]>([])
  const [recentUploads, setRecentUploads] = useState<RecentUpload[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')

      const [summaryData, statsData, uploadsData] = await Promise.all([
        caseSourcingService.getDashboardSummary(),
        caseSourcingService.getStats(),
        caseSourcingService.getRecentUploads(0, 5),
      ])

      setSummary(summaryData)
      setStats(statsData)
      setRecentUploads(uploadsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num)
  }

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadgeClass = (status: string): string => {
    const statusLower = status.toLowerCase()
    switch (statusLower) {
      case 'completed':
        return 'status-badge--success'
      case 'processing':
        return 'status-badge--info'
      case 'failed':
        return 'status-badge--danger'
      case 'partial':
        return 'status-badge--warning'
      default:
        return 'status-badge--default'
    }
  }

  const calculateSuccessRate = (successful: number, total: number): string => {
    if (total === 0) return '0%'
    return ((successful / total) * 100).toFixed(1) + '%'
  }

  if (isLoading) {
    return (
      <div className="cs-dashboard">
        <div className="cs-dashboard__loading">
          <div className="spinner"></div>
          <span>Loading dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="cs-dashboard">
      {/* Header */}
      <div className="cs-dashboard__header">
        <div>
          <h1 className="cs-dashboard__title">Case Sourcing Dashboard</h1>
          <p className="cs-dashboard__subtitle">
            Overview of case intake metrics and recent uploads
          </p>
        </div>
        <div className="cs-dashboard__actions">
          <Button variant="secondary" onClick={() => navigate(ROUTES.CASE_SOURCING_REPORTS)}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            View Reports
          </Button>
          <Button onClick={() => navigate(ROUTES.CASE_SOURCING_UPLOAD)}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Upload Cases
          </Button>
        </div>
      </div>

      {error && (
        <div className="alert alert--error">
          <span>{error}</span>
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      {/* Summary Stats */}
      {summary && (
        <div className="cs-dashboard__stats-grid">
          <div className="stat-card stat-card--blue">
            <div className="stat-card__header">
              <div className="stat-card__icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="stat-card__body">
              <div className="stat-card__value">{formatNumber(summary.totalReceived)}</div>
              <div className="stat-card__title">Total Received</div>
            </div>
          </div>

          <div className="stat-card stat-card--green">
            <div className="stat-card__header">
              <div className="stat-card__icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="stat-card__body">
              <div className="stat-card__value">{formatNumber(summary.validated)}</div>
              <div className="stat-card__title">Validated</div>
            </div>
          </div>

          <div className="stat-card stat-card--red">
            <div className="stat-card__header">
              <div className="stat-card__icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            <div className="stat-card__body">
              <div className="stat-card__value">{formatNumber(summary.failed)}</div>
              <div className="stat-card__title">Failed</div>
            </div>
          </div>

          <div className="stat-card stat-card--orange">
            <div className="stat-card__header">
              <div className="stat-card__icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="stat-card__body">
              <div className="stat-card__value">{formatNumber(summary.unallocated)}</div>
              <div className="stat-card__title">Unallocated</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="cs-dashboard__grid">
        {/* Data Source Statistics */}
        <div className="cs-dashboard__card">
          <div className="cs-dashboard__card-header">
            <h2 className="cs-dashboard__card-title">Source Statistics</h2>
            <button
              className="cs-dashboard__card-link"
              onClick={() => navigate(ROUTES.CASE_SOURCING_BATCHES)}
            >
              View all batches
            </button>
          </div>
          <div className="cs-dashboard__card-content">
            {stats.length === 0 ? (
              <div className="cs-dashboard__empty">No statistics available</div>
            ) : (
              <div className="source-stats">
                {stats.map((stat) => (
                  <div key={stat.source} className="source-stat-item">
                    <div className="source-stat-item__header">
                      <span className="source-stat-item__source">{stat.source.replace('_', ' ')}</span>
                      <span className="source-stat-item__rate">
                        {calculateSuccessRate(stat.successful, stat.total)}
                      </span>
                    </div>
                    <div className="source-stat-item__bar">
                      <div
                        className="source-stat-item__progress source-stat-item__progress--success"
                        style={{ width: `${(stat.successful / stat.total) * 100}%` }}
                      ></div>
                      <div
                        className="source-stat-item__progress source-stat-item__progress--failed"
                        style={{ width: `${(stat.failed / stat.total) * 100}%` }}
                      ></div>
                    </div>
                    <div className="source-stat-item__details">
                      <span>Total: {formatNumber(stat.total)}</span>
                      <span className="text-success">Success: {formatNumber(stat.successful)}</span>
                      <span className="text-danger">Failed: {formatNumber(stat.failed)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="cs-dashboard__card">
          <div className="cs-dashboard__card-header">
            <h2 className="cs-dashboard__card-title">Recent Uploads</h2>
            <button
              className="cs-dashboard__card-link"
              onClick={() => navigate(ROUTES.CASE_SOURCING_BATCHES)}
            >
              View all
            </button>
          </div>
          <div className="cs-dashboard__card-content">
            {recentUploads.length === 0 ? (
              <div className="cs-dashboard__empty">No recent uploads</div>
            ) : (
              <div className="recent-uploads">
                {recentUploads.map((upload) => (
                  <div
                    key={upload.batchId}
                    className="recent-upload-item"
                    onClick={() => navigate(`/case-sourcing/batches/${upload.batchId}`)}
                  >
                    <div className="recent-upload-item__icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="recent-upload-item__details">
                      <div className="recent-upload-item__batch">
                        {upload.batchId.substring(0, 8)}...
                      </div>
                      <div className="recent-upload-item__meta">
                        {upload.source.replace('_', ' ')} • {formatNumber(upload.totalCases)} cases
                      </div>
                      <div className="recent-upload-item__time">
                        {formatDate(upload.uploadedAt)}
                      </div>
                    </div>
                    <div className="recent-upload-item__status">
                      <span className={`status-badge ${getStatusBadgeClass(upload.status)}`}>
                        {upload.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="cs-dashboard__quick-actions">
        <h2 className="cs-dashboard__section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          <button
            className="quick-action-card"
            onClick={() => navigate(ROUTES.CASE_SOURCING_UPLOAD)}
          >
            <div className="quick-action-card__icon quick-action-card__icon--blue">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="quick-action-card__content">
              <div className="quick-action-card__title">Upload Cases</div>
              <div className="quick-action-card__desc">Upload CSV file with case data</div>
            </div>
          </button>

          <button
            className="quick-action-card"
            onClick={() => navigate(ROUTES.CASE_SOURCING_UNALLOCATED)}
          >
            <div className="quick-action-card__icon quick-action-card__icon--orange">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="quick-action-card__content">
              <div className="quick-action-card__title">Unallocated Cases</div>
              <div className="quick-action-card__desc">View cases pending allocation</div>
            </div>
          </button>

          <button
            className="quick-action-card"
            onClick={() => navigate(ROUTES.CASE_SOURCING_SEARCH)}
          >
            <div className="quick-action-card__icon quick-action-card__icon--green">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="quick-action-card__content">
              <div className="quick-action-card__title">Search Cases</div>
              <div className="quick-action-card__desc">Advanced case search</div>
            </div>
          </button>

          <button
            className="quick-action-card"
            onClick={() => navigate(ROUTES.CASE_SOURCING_REPORTS)}
          >
            <div className="quick-action-card__icon quick-action-card__icon--purple">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="quick-action-card__content">
              <div className="quick-action-card__title">Reports</div>
              <div className="quick-action-card__desc">View intake & allocation reports</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CaseSourcingDashboardPage
