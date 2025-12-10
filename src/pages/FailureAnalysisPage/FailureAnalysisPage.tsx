/**
 * Failure Analysis Page
 * Analyze and view failure patterns across batches
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { failureAnalysisService } from '@services/api'
import type { BatchFailureAnalysis, FailureSummary, FailureReason, ErrorTypeBreakdown, FieldFailure } from '@types'
import './FailureAnalysisPage.css'

export function FailureAnalysisPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const batchIdParam = searchParams.get('batchId')

  const [batchId, setBatchId] = useState(batchIdParam || '')
  const [batchAnalysis, setBatchAnalysis] = useState<BatchFailureAnalysis | null>(null)
  const [summary, setSummary] = useState<FailureSummary | null>(null)
  const [topReasons, setTopReasons] = useState<FailureReason[]>([])
  const [errorTypes, setErrorTypes] = useState<ErrorTypeBreakdown | null>(null)
  const [fieldFailures, setFieldFailures] = useState<FieldFailure[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Date range for summary
  const today = new Date()
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0])

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')

      const [summaryData, topReasonsData, errorTypesData, fieldFailuresData] = await Promise.all([
        failureAnalysisService.getSummary(startDate, endDate),
        failureAnalysisService.getTopReasons(10),
        failureAnalysisService.getByErrorType(batchId || undefined),
        failureAnalysisService.getByField(batchId || undefined),
      ])

      setSummary(summaryData)
      setTopReasons(topReasonsData)
      setErrorTypes(errorTypesData)
      setFieldFailures(fieldFailuresData)

      if (batchId) {
        const batchData = await failureAnalysisService.analyzeBatch(batchId)
        setBatchAnalysis(batchData)
      } else {
        setBatchAnalysis(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch failure analysis')
    } finally {
      setIsLoading(false)
    }
  }, [startDate, endDate, batchId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleBatchSearch = () => {
    fetchData()
  }

  return (
    <div className="failure-page">
      {/* Header */}
      <div className="failure-header">
        <button className="btn-back" onClick={() => navigate('/allocation')}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Allocation
        </button>
        <div className="failure-header__content">
          <h1 className="failure-title">Failure Analysis</h1>
          <p className="failure-subtitle">Analyze failure patterns and identify issues</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert--error">
          <span>{error}</span>
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      {/* Filters */}
      <div className="failure-filters">
        <div className="filter-group">
          <label>Date Range:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span>to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Batch ID:</label>
          <input
            type="text"
            placeholder="Enter batch ID (optional)"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
          />
          <button className="btn-primary" onClick={handleBatchSearch}>
            Analyze
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Loading analysis...</span>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          {summary && (
            <div className="failure-stats-grid">
              <div className="failure-stat-card">
                <div className="failure-stat-card__value">{summary.totalBatches}</div>
                <div className="failure-stat-card__label">Total Batches</div>
              </div>
              <div className="failure-stat-card">
                <div className="failure-stat-card__value">{summary.totalRecords.toLocaleString()}</div>
                <div className="failure-stat-card__label">Total Records</div>
              </div>
              <div className="failure-stat-card failure-stat-card--danger">
                <div className="failure-stat-card__value">{summary.totalFailures.toLocaleString()}</div>
                <div className="failure-stat-card__label">Total Failures</div>
              </div>
              <div className="failure-stat-card">
                <div className="failure-stat-card__value">{summary.overallFailureRate.toFixed(1)}%</div>
                <div className="failure-stat-card__label">Failure Rate</div>
              </div>
            </div>
          )}

          {/* Batch Analysis */}
          {batchAnalysis && (
            <div className="analysis-card">
              <h2>Batch Analysis: {batchAnalysis.batchId}</h2>
              <div className="batch-summary">
                <div className="batch-summary__item">
                  <span>Total Records</span>
                  <strong>{batchAnalysis.totalRecords}</strong>
                </div>
                <div className="batch-summary__item">
                  <span>Failed Records</span>
                  <strong className="text-danger">{batchAnalysis.failedRecords}</strong>
                </div>
                <div className="batch-summary__item">
                  <span>Failure Rate</span>
                  <strong>{batchAnalysis.failureRate.toFixed(1)}%</strong>
                </div>
              </div>
              {batchAnalysis.topReasons.length > 0 && (
                <div className="reasons-list">
                  <h3>Top Failure Reasons</h3>
                  {batchAnalysis.topReasons.map((reason, index) => (
                    <div key={index} className="reason-item">
                      <div className="reason-item__info">
                        <span className="reason-item__text">{reason.reason}</span>
                        <span className="reason-item__count">{reason.count} occurrences</span>
                      </div>
                      <div className="reason-item__bar">
                        <div
                          className="reason-item__fill"
                          style={{ width: `${reason.percentage}%` }}
                        />
                      </div>
                      <span className="reason-item__percentage">{reason.percentage.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Content Grid */}
          <div className="analysis-grid">
            {/* Top Reasons */}
            <div className="analysis-card">
              <h2>Top Failure Reasons</h2>
              {topReasons.length === 0 ? (
                <p className="empty-text">No failure data available</p>
              ) : (
                <div className="reasons-list">
                  {topReasons.map((reason, index) => (
                    <div key={index} className="reason-item">
                      <div className="reason-item__info">
                        <span className="reason-item__text">{reason.reason}</span>
                        <span className="reason-item__count">{reason.count}</span>
                      </div>
                      <div className="reason-item__bar">
                        <div
                          className="reason-item__fill"
                          style={{ width: `${reason.percentage}%` }}
                        />
                      </div>
                      <span className="reason-item__percentage">{reason.percentage.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Error Types */}
            {errorTypes && (
              <div className="analysis-card">
                <h2>Error Type Breakdown</h2>
                <div className="error-types-grid">
                  <div className="error-type-item">
                    <span className="error-type-item__count">{errorTypes.validationErrors}</span>
                    <span className="error-type-item__label">Validation Errors</span>
                  </div>
                  <div className="error-type-item">
                    <span className="error-type-item__count">{errorTypes.notFoundErrors}</span>
                    <span className="error-type-item__label">Not Found Errors</span>
                  </div>
                  <div className="error-type-item">
                    <span className="error-type-item__count">{errorTypes.duplicateErrors}</span>
                    <span className="error-type-item__label">Duplicate Errors</span>
                  </div>
                  <div className="error-type-item">
                    <span className="error-type-item__count">{errorTypes.systemErrors}</span>
                    <span className="error-type-item__label">System Errors</span>
                  </div>
                </div>
              </div>
            )}

            {/* Field Failures */}
            <div className="analysis-card">
              <h2>Failures by Field</h2>
              {fieldFailures.length === 0 ? (
                <p className="empty-text">No field failure data available</p>
              ) : (
                <div className="field-failures-list">
                  {fieldFailures.map((field, index) => (
                    <div key={index} className="field-failure-item">
                      <div className="field-failure-item__header">
                        <span className="field-failure-item__name">{field.fieldName}</span>
                        <span className="field-failure-item__count">{field.failureCount} failures</span>
                      </div>
                      <div className="field-failure-item__errors">
                        {field.commonErrors.map((err, i) => (
                          <span key={i} className="error-tag">{err}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default FailureAnalysisPage
