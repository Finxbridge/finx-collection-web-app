/**
 * Allocation Dashboard Page
 * Main dashboard for case allocation management
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { allocationService } from '@services/api'
import type { AllocationSummary, AllocationBatch, AgentWorkload } from '@types'
import './AllocationPage.css'

type TabType = 'overview' | 'upload' | 'rules'

export function AllocationPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [summary, setSummary] = useState<AllocationSummary | null>(null)
  const [recentBatches, setRecentBatches] = useState<AllocationBatch[]>([])
  const [topAgents, setTopAgents] = useState<AgentWorkload[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')

      const [summaryData, batchesData, workloadData] = await Promise.all([
        allocationService.getSummary(),
        allocationService.getBatches({ page: 0, size: 5 }),
        allocationService.getAgentWorkload(),
      ])

      setSummary(summaryData)
      setRecentBatches(batchesData)
      setTopAgents(workloadData.slice(0, 5))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'badge--success'
      case 'PROCESSING':
        return 'badge--warning'
      case 'FAILED':
        return 'badge--danger'
      case 'PARTIAL':
        return 'badge--info'
      default:
        return 'badge--default'
    }
  }

  const formatDateTime = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getUtilizationClass = (percentage: number) => {
    if (percentage >= 90) return 'utilization--high'
    if (percentage >= 70) return 'utilization--medium'
    return 'utilization--low'
  }

  if (isLoading) {
    return (
      <div className="allocation-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Loading allocation data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="allocation-page">
      {/* Header */}
      <div className="allocation-header">
        <div className="allocation-header__content">
          <h1 className="allocation-title">Allocation & Reallocation</h1>
          <p className="allocation-subtitle">
            Manage case allocations, rules, and agent workloads
          </p>
        </div>
        <div className="allocation-header__actions">
          <button
            className="btn-secondary"
            onClick={() => navigate('/allocation/upload')}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Upload Batch
          </button>
          <button
            className="btn-primary"
            onClick={() => navigate('/allocation/rules')}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Manage Rules
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
      {summary && (
        <div className="allocation-stats-grid">
          <div className="allocation-stat-card allocation-stat-card--blue">
            <div className="allocation-stat-card__icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="allocation-stat-card__content">
              <div className="allocation-stat-card__value">
                {summary.totalAllocations.toLocaleString()}
              </div>
              <div className="allocation-stat-card__label">Total Allocations</div>
            </div>
          </div>

          <div className="allocation-stat-card allocation-stat-card--green">
            <div className="allocation-stat-card__icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="allocation-stat-card__content">
              <div className="allocation-stat-card__value">
                {summary.successfulAllocations.toLocaleString()}
              </div>
              <div className="allocation-stat-card__label">Successful</div>
            </div>
          </div>

          <div className="allocation-stat-card allocation-stat-card--red">
            <div className="allocation-stat-card__icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="allocation-stat-card__content">
              <div className="allocation-stat-card__value">
                {summary.failedAllocations.toLocaleString()}
              </div>
              <div className="allocation-stat-card__label">Failed</div>
            </div>
          </div>

          <div className="allocation-stat-card allocation-stat-card--orange">
            <div className="allocation-stat-card__icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="allocation-stat-card__content">
              <div className="allocation-stat-card__value">
                {summary.pendingAllocations.toLocaleString()}
              </div>
              <div className="allocation-stat-card__label">Pending</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="allocation-tabs">
        <button
          className={`allocation-tab ${activeTab === 'overview' ? 'allocation-tab--active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`allocation-tab ${activeTab === 'upload' ? 'allocation-tab--active' : ''}`}
          onClick={() => navigate('/allocation/upload')}
        >
          Upload
        </button>
        <button
          className={`allocation-tab ${activeTab === 'rules' ? 'allocation-tab--active' : ''}`}
          onClick={() => navigate('/allocation/rules')}
        >
          Rules
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="allocation-content-grid">
        {/* Recent Batches */}
        <div className="allocation-card">
          <div className="allocation-card__header">
            <h2 className="allocation-card__title">Recent Batches</h2>
            <button
              className="btn-link"
              onClick={() => navigate('/allocation/batches')}
            >
              View All
            </button>
          </div>
          <div className="allocation-card__body">
            {recentBatches.length === 0 ? (
              <div className="empty-state">
                <p>No recent batches found</p>
              </div>
            ) : (
              <div className="batch-list">
                {recentBatches.map((batch) => (
                  <div key={batch.batchId} className="batch-item">
                    <div className="batch-item__info">
                      <div className="batch-item__id">{batch.batchId.substring(0, 12)}...</div>
                      <div className="batch-item__meta">
                        <span className="batch-item__type">{batch.batchType}</span>
                        <span className="batch-item__date">{formatDateTime(batch.createdAt)}</span>
                      </div>
                    </div>
                    <div className="batch-item__stats">
                      <span className="batch-item__count">
                        {batch.successful}/{batch.totalCases}
                      </span>
                      <span className={`badge ${getStatusBadgeClass(batch.status)}`}>
                        {batch.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Agent Workload */}
        <div className="allocation-card">
          <div className="allocation-card__header">
            <h2 className="allocation-card__title">Agent Workload</h2>
            <button
              className="btn-link"
              onClick={() => navigate('/allocation/workload')}
            >
              View All
            </button>
          </div>
          <div className="allocation-card__body">
            {topAgents.length === 0 ? (
              <div className="empty-state">
                <p>No agent data available</p>
              </div>
            ) : (
              <div className="agent-list">
                {topAgents.map((agent) => (
                  <div key={agent.agentId} className="agent-item">
                    <div className="agent-item__info">
                      <div className="agent-item__name">{agent.agentName}</div>
                      <div className="agent-item__geography">{agent.geography}</div>
                    </div>
                    <div className="agent-item__workload">
                      <div className="agent-item__progress">
                        <div
                          className={`agent-item__progress-bar ${getUtilizationClass(agent.utilizationPercentage)}`}
                          style={{ width: `${agent.utilizationPercentage}%` }}
                        />
                      </div>
                      <div className="agent-item__stats">
                        <span>{agent.activeAllocations}/{agent.capacity}</span>
                        <span className={`utilization-label ${getUtilizationClass(agent.utilizationPercentage)}`}>
                          {agent.utilizationPercentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2 className="quick-actions__title">Quick Actions</h2>
        <div className="quick-actions__grid">
          <button
            className="quick-action-card"
            onClick={() => navigate('/allocation/upload')}
          >
            <div className="quick-action-card__icon quick-action-card__icon--blue">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="quick-action-card__label">Upload Allocation</span>
          </button>

          <button
            className="quick-action-card"
            onClick={() => navigate('/allocation/reallocation')}
          >
            <div className="quick-action-card__icon quick-action-card__icon--green">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 1L21 5L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 11V9C3 7.93913 3.42143 6.92172 4.17157 6.17157C4.92172 5.42143 5.93913 5 7 5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 23L3 19L7 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 13V15C21 16.0609 20.5786 17.0783 19.8284 17.8284C19.0783 18.5786 18.0609 19 17 19H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="quick-action-card__label">Reallocate Cases</span>
          </button>

          <button
            className="quick-action-card"
            onClick={() => navigate('/allocation/rules')}
          >
            <div className="quick-action-card__icon quick-action-card__icon--purple">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="quick-action-card__label">Manage Rules</span>
          </button>

          <button
            className="quick-action-card"
            onClick={() => navigate('/allocation/failure-analysis')}
          >
            <div className="quick-action-card__icon quick-action-card__icon--red">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.29 3.86L1.82 18C1.64 18.3 1.55 18.65 1.55 19C1.55 19.35 1.64 19.7 1.82 20C2.00 20.3 2.26 20.56 2.58 20.74C2.90 20.92 3.25 21.01 3.62 21H20.38C20.74 21.01 21.1 20.92 21.42 20.74C21.74 20.56 22.00 20.3 22.18 20C22.36 19.7 22.45 19.35 22.45 19C22.45 18.65 22.36 18.3 22.18 18L13.71 3.86C13.53 3.56 13.27 3.32 12.96 3.15C12.65 2.98 12.30 2.89 11.95 2.89C11.60 2.89 11.25 2.98 10.94 3.15C10.63 3.32 10.37 3.56 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="quick-action-card__label">Failure Analysis</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AllocationPage
