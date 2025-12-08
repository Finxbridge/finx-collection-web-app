/**
 * Case Sourcing Reports Page
 * View intake and unallocated reports with date filters
 */

import { useState, useEffect, useCallback } from 'react'
import { caseSourcingService } from '@services/api'
import { Button } from '@components/common/Button'
import type { IntakeReport, UnallocatedReport } from '@types'
import './CaseSourcingReportsPage.css'

type ReportTab = 'intake' | 'unallocated'

export function CaseSourcingReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('intake')
  const [intakeReport, setIntakeReport] = useState<IntakeReport | null>(null)
  const [unallocatedReport, setUnallocatedReport] = useState<UnallocatedReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Date filters
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchReports = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')

      const params = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }

      if (activeTab === 'intake') {
        const data = await caseSourcingService.getIntakeReport(params)
        setIntakeReport(data)
      } else {
        const data = await caseSourcingService.getUnallocatedReport(params)
        setUnallocatedReport(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch report')
    } finally {
      setIsLoading(false)
    }
  }, [activeTab, startDate, endDate])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const handleApplyFilters = () => {
    fetchReports()
  }

  const handleResetFilters = () => {
    setStartDate('')
    setEndDate('')
  }

  return (
    <div className="reports-page">
      {/* Header */}
      <div className="reports-page__header">
        <div>
          <h1 className="reports-page__title">Case Sourcing Reports</h1>
          <p className="reports-page__subtitle">
            View intake and unallocated case reports
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert--error">
          <span>{error}</span>
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      {/* Tabs */}
      <div className="reports-page__tabs">
        <button
          className={`tab-button ${activeTab === 'intake' ? 'tab-button--active' : ''}`}
          onClick={() => setActiveTab('intake')}
        >
          Intake Report
        </button>
        <button
          className={`tab-button ${activeTab === 'unallocated' ? 'tab-button--active' : ''}`}
          onClick={() => setActiveTab('unallocated')}
        >
          Unallocated Report
        </button>
      </div>

      {/* Date Filters */}
      <div className="reports-page__filters">
        <div className="filter-group">
          <label className="filter-label">Start Date</label>
          <input
            type="date"
            className="filter-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label className="filter-label">End Date</label>
          <input
            type="date"
            className="filter-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="filter-actions">
          <Button variant="secondary" size="sm" onClick={handleResetFilters}>
            Reset
          </Button>
          <Button size="sm" onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </div>
      </div>

      {/* Report Content */}
      <div className="reports-page__content">
        {isLoading ? (
          <div className="reports-page__loading">
            <div className="spinner"></div>
            <span>Loading report...</span>
          </div>
        ) : activeTab === 'intake' && intakeReport ? (
          <IntakeReportView report={intakeReport} />
        ) : activeTab === 'unallocated' && unallocatedReport ? (
          <UnallocatedReportView report={unallocatedReport} />
        ) : (
          <div className="reports-page__empty">No data available</div>
        )}
      </div>
    </div>
  )
}

// Intake Report Component
function IntakeReportView({ report }: { report: IntakeReport }) {
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num)
  }

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="report-view">
      {/* Summary Cards */}
      <div className="report-summary">
        <div className="report-summary__card">
          <div className="report-summary__value">{formatNumber(report.totalReceived)}</div>
          <div className="report-summary__label">Total Received</div>
        </div>
        <div className="report-summary__card report-summary__card--success">
          <div className="report-summary__value">{formatNumber(report.totalValidated)}</div>
          <div className="report-summary__label">Total Validated</div>
        </div>
        <div className="report-summary__card report-summary__card--danger">
          <div className="report-summary__value">{formatNumber(report.totalFailed)}</div>
          <div className="report-summary__label">Total Failed</div>
        </div>
        <div className="report-summary__card report-summary__card--info">
          <div className="report-summary__value">{report.successRate.toFixed(1)}%</div>
          <div className="report-summary__label">Success Rate</div>
        </div>
      </div>

      {/* Date Range */}
      <div className="report-date-range">
        {formatDate(report.startDate)} - {formatDate(report.endDate)}
      </div>

      <div className="report-sections">
        {/* Source Breakdown */}
        <div className="report-section">
          <h3 className="report-section__title">Source Breakdown</h3>
          <div className="breakdown-table">
            <div className="breakdown-table__header">
              <span>Source</span>
              <span>Received</span>
              <span>Validated</span>
              <span>Failed</span>
              <span>Success Rate</span>
            </div>
            {report.sourceBreakdown.map((item) => (
              <div key={item.source} className="breakdown-table__row">
                <span className="breakdown-table__source">{item.source.replace('_', ' ')}</span>
                <span>{formatNumber(item.totalReceived)}</span>
                <span className="text-success">{formatNumber(item.validated)}</span>
                <span className="text-danger">{formatNumber(item.failed)}</span>
                <span className="text-info">{item.successRate.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Breakdown */}
        <div className="report-section">
          <h3 className="report-section__title">Daily Breakdown</h3>
          <div className="breakdown-table">
            <div className="breakdown-table__header">
              <span>Date</span>
              <span>Received</span>
              <span>Validated</span>
              <span>Failed</span>
              <span>Success Rate</span>
            </div>
            {report.dailyBreakdown.slice(0, 10).map((item) => (
              <div key={item.date} className="breakdown-table__row">
                <span className="breakdown-table__date">{formatDate(item.date)}</span>
                <span>{formatNumber(item.totalReceived)}</span>
                <span className="text-success">{formatNumber(item.validated)}</span>
                <span className="text-danger">{formatNumber(item.failed)}</span>
                <span className="text-info">{item.successRate.toFixed(1)}%</span>
              </div>
            ))}
          </div>
          {report.dailyBreakdown.length > 10 && (
            <div className="breakdown-more">
              +{report.dailyBreakdown.length - 10} more days
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Unallocated Report Component
function UnallocatedReportView({ report }: { report: UnallocatedReport }) {
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num)
  }

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const getBucketColor = (bucket: string): string => {
    if (bucket.includes('90')) return 'var(--color-danger)'
    if (bucket.includes('60')) return 'var(--color-warning)'
    if (bucket.includes('30')) return 'var(--color-primary)'
    return 'var(--color-success)'
  }

  const totalBuckets = report.bucketBreakdown.reduce((sum, b) => sum + b.count, 0)

  return (
    <div className="report-view">
      {/* Summary */}
      <div className="report-summary">
        <div className="report-summary__card report-summary__card--warning">
          <div className="report-summary__value">{formatNumber(report.totalUnallocated)}</div>
          <div className="report-summary__label">Total Unallocated</div>
        </div>
      </div>

      {/* Date Range */}
      <div className="report-date-range">
        {formatDate(report.startDate)} - {formatDate(report.endDate)}
      </div>

      <div className="report-sections">
        {/* Bucket Breakdown */}
        <div className="report-section">
          <h3 className="report-section__title">Bucket Breakdown</h3>
          <div className="bucket-breakdown">
            {report.bucketBreakdown.map((item) => (
              <div key={item.bucket} className="bucket-item">
                <div className="bucket-item__header">
                  <span className="bucket-item__name">{item.bucket} Days</span>
                  <span className="bucket-item__count">{formatNumber(item.count)}</span>
                </div>
                <div className="bucket-item__bar">
                  <div
                    className="bucket-item__progress"
                    style={{
                      width: `${(item.count / totalBuckets) * 100}%`,
                      backgroundColor: getBucketColor(item.bucket),
                    }}
                  ></div>
                </div>
                <div className="bucket-item__percentage">
                  {((item.count / totalBuckets) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Source Breakdown */}
        <div className="report-section">
          <h3 className="report-section__title">Source Breakdown</h3>
          <div className="source-breakdown">
            {report.sourceBreakdown.map((item) => (
              <div key={item.source} className="source-item">
                <div className="source-item__info">
                  <span className="source-item__name">{item.source.replace('_', ' ')}</span>
                  <span className="source-item__count">{formatNumber(item.count)}</span>
                </div>
                <div className="source-item__bar">
                  <div
                    className="source-item__progress"
                    style={{
                      width: `${(item.count / report.totalUnallocated) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CaseSourcingReportsPage
