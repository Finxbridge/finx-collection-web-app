/**
 * Allocation/Reallocation Batch Detail Page
 * View detailed batch information, status, and errors
 */

import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { allocationService, reallocationService } from '@services/api'
import type { AllocationBatchStatusResponse } from '@types'
import './AllocationBatchDetailPage.css'

type BatchType = 'allocation' | 'reallocation'

export function AllocationBatchDetailPage() {
  const { batchId } = useParams<{ batchId: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  // Determine batch type from URL path
  const batchType: BatchType = location.pathname.includes('/reallocation/') ? 'reallocation' : 'allocation'

  const [batchStatus, setBatchStatus] = useState<AllocationBatchStatusResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchBatchData = useCallback(async () => {
    if (!batchId) return

    try {
      setIsLoading(true)
      setError('')

      const statusData = batchType === 'allocation'
        ? await allocationService.getBatchStatus(batchId)
        : await reallocationService.getBatchStatus(batchId)

      setBatchStatus(statusData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch batch details')
    } finally {
      setIsLoading(false)
    }
  }, [batchId, batchType])

  useEffect(() => {
    fetchBatchData()
  }, [fetchBatchData])

  const handleExportBatch = async () => {
    if (!batchId) return

    try {
      const blob = batchType === 'allocation'
        ? await allocationService.exportBatch(batchId)
        : await reallocationService.exportBatch(batchId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${batchType}_${batchId}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export batch')
    }
  }

  const handleExportErrors = async () => {
    if (!batchId) return

    try {
      const blob = batchType === 'allocation'
        ? await allocationService.exportFailedRows(batchId)
        : await reallocationService.exportFailedRows(batchId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${batchType}_errors_${batchId}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export errors')
    }
  }

  const handleBack = () => {
    if (batchType === 'reallocation') {
      navigate('/allocation/reallocation')
    } else {
      navigate('/allocation/upload')
    }
  }

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num)
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

  const calculateSuccessRate = (): string => {
    if (!batchStatus || batchStatus.totalCases === 0) return '0%'
    return ((batchStatus.successful / batchStatus.totalCases) * 100).toFixed(1) + '%'
  }

  if (isLoading) {
    return (
      <div className="allocation-batch-detail-page">
        <div className="allocation-batch-detail-page__loading">
          <div className="spinner"></div>
          <span>Loading batch details...</span>
        </div>
      </div>
    )
  }

  if (!batchStatus) {
    return (
      <div className="allocation-batch-detail-page">
        <div className="allocation-batch-detail-page__error">
          <p>Batch not found</p>
          <button className="btn-primary" onClick={handleBack}>
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="allocation-batch-detail-page">
      {/* Header */}
      <div className="allocation-batch-detail-page__header">
        <button className="back-button" onClick={handleBack}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to {batchType === 'reallocation' ? 'Reallocation' : 'Allocation Upload'}
        </button>
        <div className="allocation-batch-detail-page__header-content">
          <div>
            <h1 className="allocation-batch-detail-page__title">
              {batchType === 'reallocation' ? 'Reallocation' : 'Allocation'} Batch Details
            </h1>
            <p className="allocation-batch-detail-page__batch-id">{batchId}</p>
          </div>
          <div className="allocation-batch-detail-page__actions">
            <button className="btn-secondary" onClick={handleExportBatch}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Export Batch
            </button>
            {batchStatus.failed > 0 && (
              <button className="btn-secondary btn-secondary--danger" onClick={handleExportErrors}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Export Errors
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert--error">
          <span>{error}</span>
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="allocation-batch-detail-page__summary">
        <div className="summary-card">
          <div className="summary-card__label">Status</div>
          <div className="summary-card__value">
            <span className={`status-badge ${getStatusBadgeClass(batchStatus.status)}`}>
              {batchStatus.status}
            </span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card__label">Total Cases</div>
          <div className="summary-card__value">{formatNumber(batchStatus.totalCases)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card__label">Successful</div>
          <div className="summary-card__value text-success">{formatNumber(batchStatus.successful)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card__label">Failed</div>
          <div className="summary-card__value text-danger">{formatNumber(batchStatus.failed)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card__label">Success Rate</div>
          <div className="summary-card__value">{calculateSuccessRate()}</div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="allocation-batch-detail-page__content">
        <div className="progress-section">
          <h3 className="section-title">Processing Progress</h3>
          <div className="progress-bar">
            <div
              className="progress-bar__fill progress-bar__fill--success"
              style={{ width: `${(batchStatus.successful / batchStatus.totalCases) * 100}%` }}
            ></div>
            <div
              className="progress-bar__fill progress-bar__fill--danger"
              style={{ width: `${(batchStatus.failed / batchStatus.totalCases) * 100}%` }}
            ></div>
          </div>
          <div className="progress-legend">
            <div className="progress-legend__item">
              <span className="progress-legend__dot progress-legend__dot--success"></span>
              Successful ({formatNumber(batchStatus.successful)})
            </div>
            <div className="progress-legend__item">
              <span className="progress-legend__dot progress-legend__dot--danger"></span>
              Failed ({formatNumber(batchStatus.failed)})
            </div>
          </div>
        </div>

        {/* Processing Status Message */}
        {batchStatus.status === 'PROCESSING' && (
          <div className="processing-message">
            <div className="spinner-small"></div>
            <span>Batch is currently being processed. Please refresh to see updated status.</span>
            <button className="btn-link" onClick={fetchBatchData}>Refresh</button>
          </div>
        )}

        {/* Completed Message */}
        {batchStatus.status === 'COMPLETED' && batchStatus.failed === 0 && (
          <div className="success-message">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>All cases have been successfully {batchType === 'reallocation' ? 'reallocated' : 'allocated'}!</span>
          </div>
        )}

        {/* Partial/Failed Message */}
        {(batchStatus.status === 'PARTIAL' || batchStatus.status === 'FAILED' || batchStatus.failed > 0) && (
          <div className="warning-message">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>
              {batchStatus.failed} case(s) failed to {batchType === 'reallocation' ? 'reallocate' : 'allocate'}.
              Click "Export Errors" to download the failed records.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default AllocationBatchDetailPage
