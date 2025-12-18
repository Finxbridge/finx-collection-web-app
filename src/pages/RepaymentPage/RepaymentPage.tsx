/**
 * Repayment Dashboard Page
 * Main dashboard for repayment management with stats, approvals, and SLA tracking
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { repaymentService } from '@services/api'
import type { RepaymentDashboard, SlaDashboard, Repayment } from '@types'
import './RepaymentPage.css'

type TabType = 'overview' | 'pending' | 'sla'

export function RepaymentPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [dashboard, setDashboard] = useState<RepaymentDashboard | null>(null)
  const [slaDashboard, setSlaDashboard] = useState<SlaDashboard | null>(null)
  const [pendingApprovals, setPendingApprovals] = useState<Repayment[]>([])
  const [slaBreached, setSlaBreached] = useState<Repayment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')

      const [dashboardData, slaData, pendingData, breachedData] = await Promise.all([
        repaymentService.getDashboard(),
        repaymentService.getSlaDashboard(),
        repaymentService.getPendingApprovals(0, 5),
        repaymentService.getSlaBreached(),
      ])

      setDashboard(dashboardData)
      setSlaDashboard(slaData)
      setPendingApprovals(pendingData.content)
      setSlaBreached(breachedData.slice(0, 5))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDateTime = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'badge--success'
      case 'PENDING':
        return 'badge--warning'
      case 'REJECTED':
        return 'badge--danger'
      case 'REVERSED':
        return 'badge--info'
      default:
        return 'badge--default'
    }
  }

  const getSlaStatusClass = (breachHours?: number) => {
    if (!breachHours || breachHours <= 0) return 'sla--ok'
    if (breachHours < 24) return 'sla--warning'
    return 'sla--critical'
  }

  if (isLoading) {
    return (
      <div className="repayment-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Loading repayment data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="repayment-page">
      {/* Header */}
      <div className="repayment-header">
        <div className="repayment-header__content">
          <h1 className="repayment-title">Repayments & Payments</h1>
          <p className="repayment-subtitle">
            Manage repayments, approvals, reconciliation, and digital payments
          </p>
        </div>
        <div className="repayment-header__actions">
          <button className="btn-secondary" onClick={() => navigate('/repayment/list')}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Search Repayments
          </button>
          <button className="btn-primary" onClick={() => navigate('/repayment/digital-payment')}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2V6M12 18V22M6 12H2M22 12H18M19.07 4.93L16.24 7.76M7.76 16.24L4.93 19.07M19.07 19.07L16.24 16.24M7.76 7.76L4.93 4.93"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Collect Payment
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert--error">
          <span>{error}</span>
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      {/* Stats Grid */}
      {dashboard && (
        <div className="repayment-stats-grid">
          <div className="repayment-stat-card repayment-stat-card--blue">
            <div className="repayment-stat-card__icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 16.5C11.17 16.5 10.5 15.83 10.5 15V12C10.5 11.17 11.17 10.5 12 10.5C12.83 10.5 13.5 11.17 13.5 12V15C13.5 15.83 12.83 16.5 12 16.5ZM13.5 9H10.5V6H13.5V9Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
            <div className="repayment-stat-card__content">
              <div className="repayment-stat-card__value">{dashboard.todayTotalCount}</div>
              <div className="repayment-stat-card__label">Today's Collections</div>
              <div className="repayment-stat-card__amount">
                {formatCurrency(dashboard.todayTotalAmount)}
              </div>
            </div>
          </div>

          <div className="repayment-stat-card repayment-stat-card--orange">
            <div className="repayment-stat-card__icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="repayment-stat-card__content">
              <div className="repayment-stat-card__value">{dashboard.pendingApprovalCount}</div>
              <div className="repayment-stat-card__label">Pending Approvals</div>
            </div>
          </div>

          <div className="repayment-stat-card repayment-stat-card--red">
            <div className="repayment-stat-card__icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M10.29 3.86L1.82 18C1.64 18.3 1.55 18.65 1.55 19C1.55 19.35 1.64 19.7 1.82 20C2.00 20.3 2.26 20.56 2.58 20.74C2.90 20.92 3.25 21.01 3.62 21H20.38C20.74 21.01 21.1 20.92 21.42 20.74C21.74 20.56 22.00 20.3 22.18 20C22.36 19.7 22.45 19.35 22.45 19C22.45 18.65 22.36 18.3 22.18 18L13.71 3.86C13.53 3.56 13.27 3.32 12.96 3.15C12.65 2.98 12.30 2.89 11.95 2.89C11.60 2.89 11.25 2.98 10.94 3.15C10.63 3.32 10.37 3.56 10.29 3.86Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="repayment-stat-card__content">
              <div className="repayment-stat-card__value">{dashboard.slaBreachedCount}</div>
              <div className="repayment-stat-card__label">SLA Breached</div>
            </div>
          </div>

          <div className="repayment-stat-card repayment-stat-card--purple">
            <div className="repayment-stat-card__icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="repayment-stat-card__content">
              <div className="repayment-stat-card__value">{dashboard.pendingReconciliationCount}</div>
              <div className="repayment-stat-card__label">Pending Reconciliation</div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Progress */}
      {dashboard && (
        <div className="repayment-progress-card">
          <div className="repayment-progress-card__header">
            <h2 className="repayment-progress-card__title">Monthly Collection Progress</h2>
            <span className="repayment-progress-card__percentage">
              {dashboard.monthAchievementPercentage?.toFixed(1) || 0}%
            </span>
          </div>
          <div className="repayment-progress-card__bar">
            <div
              className="repayment-progress-card__fill"
              style={{ width: `${Math.min(dashboard.monthAchievementPercentage || 0, 100)}%` }}
            />
          </div>
          <div className="repayment-progress-card__stats">
            <div className="repayment-progress-stat">
              <span className="repayment-progress-stat__label">Collected</span>
              <span className="repayment-progress-stat__value">
                {formatCurrency(dashboard.monthTotalAmount)}
              </span>
            </div>
            <div className="repayment-progress-stat">
              <span className="repayment-progress-stat__label">Target</span>
              <span className="repayment-progress-stat__value">
                {formatCurrency(dashboard.monthTargetAmount || 0)}
              </span>
            </div>
            <div className="repayment-progress-stat">
              <span className="repayment-progress-stat__label">Total Transactions</span>
              <span className="repayment-progress-stat__value">{dashboard.monthTotalCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="repayment-tabs">
        <button
          className={`repayment-tab ${activeTab === 'overview' ? 'repayment-tab--active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`repayment-tab ${activeTab === 'pending' ? 'repayment-tab--active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Approvals ({dashboard?.pendingApprovalCount || 0})
        </button>
        <button
          className={`repayment-tab ${activeTab === 'sla' ? 'repayment-tab--active' : ''}`}
          onClick={() => setActiveTab('sla')}
        >
          SLA Tracking ({dashboard?.slaBreachedCount || 0})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="repayment-content-grid">
          {/* Today's Breakdown */}
          <div className="repayment-card">
            <div className="repayment-card__header">
              <h2 className="repayment-card__title">Today's Breakdown</h2>
            </div>
            <div className="repayment-card__body">
              {dashboard && (
                <div className="breakdown-list">
                  <div className="breakdown-item">
                    <span className="breakdown-item__label">Approved</span>
                    <span className="breakdown-item__value breakdown-item__value--success">
                      {dashboard.todayApprovedCount}
                    </span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-item__label">Pending</span>
                    <span className="breakdown-item__value breakdown-item__value--warning">
                      {dashboard.todayPendingCount}
                    </span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-item__label">Rejected</span>
                    <span className="breakdown-item__value breakdown-item__value--danger">
                      {dashboard.todayRejectedCount}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Digital Payments */}
          <div className="repayment-card">
            <div className="repayment-card__header">
              <h2 className="repayment-card__title">Digital Payments</h2>
              <button className="btn-link" onClick={() => navigate('/repayment/digital-payment')}>
                Collect
              </button>
            </div>
            <div className="repayment-card__body">
              {dashboard && (
                <div className="breakdown-list">
                  <div className="breakdown-item">
                    <span className="breakdown-item__label">Initiated</span>
                    <span className="breakdown-item__value">
                      {dashboard.digitalPaymentInitiatedCount || 0}
                    </span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-item__label">Successful</span>
                    <span className="breakdown-item__value breakdown-item__value--success">
                      {dashboard.digitalPaymentSuccessCount || 0}
                    </span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-item__label">Failed</span>
                    <span className="breakdown-item__value breakdown-item__value--danger">
                      {dashboard.digitalPaymentFailedCount || 0}
                    </span>
                  </div>
                  <div className="breakdown-item breakdown-item--total">
                    <span className="breakdown-item__label">Total Amount</span>
                    <span className="breakdown-item__value">
                      {formatCurrency(dashboard.digitalPaymentTotalAmount || 0)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SLA Compliance */}
          <div className="repayment-card">
            <div className="repayment-card__header">
              <h2 className="repayment-card__title">SLA Compliance</h2>
            </div>
            <div className="repayment-card__body">
              {slaDashboard && (
                <>
                  <div className="sla-gauge">
                    <div className="sla-gauge__circle">
                      <svg viewBox="0 0 100 100">
                        <circle
                          className="sla-gauge__bg"
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          strokeWidth="10"
                        />
                        <circle
                          className="sla-gauge__fill"
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          strokeWidth="10"
                          strokeDasharray={`${slaDashboard.slaCompliancePercentage * 2.83} 283`}
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <span className="sla-gauge__value">
                        {slaDashboard.slaCompliancePercentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="sla-stats">
                    <div className="sla-stat">
                      <span className="sla-stat__value">{slaDashboard.withinSla}</span>
                      <span className="sla-stat__label">Within SLA</span>
                    </div>
                    <div className="sla-stat">
                      <span className="sla-stat__value sla-stat__value--warning">
                        {slaDashboard.breached}
                      </span>
                      <span className="sla-stat__label">Breached</span>
                    </div>
                    <div className="sla-stat">
                      <span className="sla-stat__value sla-stat__value--danger">
                        {slaDashboard.criticalBreaches}
                      </span>
                      <span className="sla-stat__label">Critical</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="repayment-card">
          <div className="repayment-card__header">
            <h2 className="repayment-card__title">Pending Approvals</h2>
            <button className="btn-link" onClick={() => navigate('/repayment/approvals')}>
              View All
            </button>
          </div>
          <div className="repayment-card__body">
            {pendingApprovals.length === 0 ? (
              <div className="empty-state">
                <p>No pending approvals</p>
              </div>
            ) : (
              <div className="repayment-list">
                {pendingApprovals.map((repayment) => (
                  <div
                    key={repayment.id}
                    className="repayment-item"
                    onClick={() => navigate(`/repayment/${repayment.id}`)}
                  >
                    <div className="repayment-item__info">
                      <div className="repayment-item__number">
                        {repayment.repaymentNumber || `#${repayment.id}`}
                      </div>
                      <div className="repayment-item__customer">{repayment.customerName}</div>
                      <div className="repayment-item__meta">
                        <span>{repayment.paymentMode}</span>
                        <span>{formatDateTime(repayment.paymentDate)}</span>
                      </div>
                    </div>
                    <div className="repayment-item__details">
                      <div className="repayment-item__amount">{formatCurrency(repayment.amount)}</div>
                      <span className={`badge ${getStatusBadgeClass(repayment.status)}`}>
                        {repayment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'sla' && (
        <div className="repayment-card">
          <div className="repayment-card__header">
            <h2 className="repayment-card__title">SLA Breached Repayments</h2>
            <button className="btn-link" onClick={() => navigate('/repayment/list?status=breached')}>
              View All
            </button>
          </div>
          <div className="repayment-card__body">
            {slaBreached.length === 0 ? (
              <div className="empty-state">
                <p>No SLA breaches</p>
              </div>
            ) : (
              <div className="repayment-list">
                {slaBreached.map((repayment) => (
                  <div
                    key={repayment.id}
                    className="repayment-item"
                    onClick={() => navigate(`/repayment/${repayment.id}`)}
                  >
                    <div className="repayment-item__info">
                      <div className="repayment-item__number">
                        {repayment.repaymentNumber || `#${repayment.id}`}
                      </div>
                      <div className="repayment-item__customer">{repayment.customerName}</div>
                      <div className="repayment-item__meta">
                        <span>{repayment.paymentMode}</span>
                        <span>{formatDateTime(repayment.paymentDate)}</span>
                      </div>
                    </div>
                    <div className="repayment-item__details">
                      <div className="repayment-item__amount">{formatCurrency(repayment.amount)}</div>
                      <span
                        className={`sla-badge ${getSlaStatusClass(repayment.depositSlaBreachHours)}`}
                      >
                        {repayment.depositSlaBreachHours
                          ? `${repayment.depositSlaBreachHours}h breach`
                          : 'Breached'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2 className="quick-actions__title">Quick Actions</h2>
        <div className="quick-actions__grid">
          <button className="quick-action-card" onClick={() => navigate('/repayment/list')}>
            <div className="quick-action-card__icon quick-action-card__icon--blue">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="quick-action-card__label">Search Repayments</span>
          </button>

          <button className="quick-action-card" onClick={() => navigate('/repayment/approvals')}>
            <div className="quick-action-card__icon quick-action-card__icon--orange">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="quick-action-card__label">Pending Approvals</span>
          </button>

          <button className="quick-action-card" onClick={() => navigate('/repayment/reconciliation')}>
            <div className="quick-action-card__icon quick-action-card__icon--purple">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <span className="quick-action-card__label">Reconciliation</span>
          </button>

          <button className="quick-action-card" onClick={() => navigate('/repayment/digital-payment')}>
            <div className="quick-action-card__icon quick-action-card__icon--green">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M2 10H22" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <span className="quick-action-card__label">Digital Payment</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default RepaymentPage
