/**
 * Batch Detail Page
 * View detailed batch information, status, and errors
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { caseSourcingService } from '@services/api'
import { Button } from '@components/common/Button'
import { Table, Column } from '@components/common/Table'
import { ROUTES } from '@config/constants'
import type { BatchStatusResponse, BatchSummary, BatchRowError } from '@types'
import './BatchDetailPage.css'

export function BatchDetailPage() {
  const { batchId } = useParams<{ batchId: string }>()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [batchStatus, setBatchStatus] = useState<BatchStatusResponse | null>(null)
  const [batchSummary, setBatchSummary] = useState<BatchSummary | null>(null)
  const [errors, setErrors] = useState<BatchRowError[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'errors'>('overview')
  const [isReuploading, setIsReuploading] = useState(false)

  const fetchBatchData = useCallback(async () => {
    if (!batchId) return

    try {
      setIsLoading(true)
      setError('')

      const [statusData, summaryData, errorsData] = await Promise.all([
        caseSourcingService.getBatchStatus(batchId),
        caseSourcingService.getBatchSummary(batchId),
        caseSourcingService.getBatchErrors(batchId).catch(() => []),
      ])

      setBatchStatus(statusData)
      setBatchSummary(summaryData)
      setErrors(errorsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch batch details')
    } finally {
      setIsLoading(false)
    }
  }, [batchId])

  useEffect(() => {
    fetchBatchData()
  }, [fetchBatchData])

  const handleExportCases = async () => {
    if (!batchId) return

    try {
      const blob = await caseSourcingService.exportBatchCases(batchId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `batch_${batchId}_cases.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export cases')
    }
  }

  const handleExportErrors = async () => {
    if (!batchId) return

    try {
      const blob = await caseSourcingService.exportBatchErrors(batchId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `batch_${batchId}_errors.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export errors')
    }
  }

  const handleReupload = async (file: File) => {
    if (!batchId) return

    try {
      setIsReuploading(true)
      const result = await caseSourcingService.reuploadBatch(batchId, file)
      navigate(`/case-sourcing/batches/${result.batchId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to re-upload batch')
    } finally {
      setIsReuploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleReupload(file)
    }
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
    return ((batchStatus.validCases / batchStatus.totalCases) * 100).toFixed(1) + '%'
  }

  const errorColumns: Column<BatchRowError>[] = [
    {
      key: 'rowNumber',
      header: 'Row #',
      width: '80px',
    },
    {
      key: 'externalCaseId',
      header: 'Case ID',
      render: (row) => (
        <span className="case-id">{row.externalCaseId}</span>
      ),
    },
    {
      key: 'errors',
      header: 'Errors',
      render: (row) => (
        <div className="error-list">
          {row.errors.map((err, idx) => (
            <div key={idx} className="error-item">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {err}
            </div>
          ))}
        </div>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="batch-detail-page">
        <div className="batch-detail-page__loading">
          <div className="spinner"></div>
          <span>Loading batch details...</span>
        </div>
      </div>
    )
  }

  if (!batchStatus) {
    return (
      <div className="batch-detail-page">
        <div className="batch-detail-page__error">
          <p>Batch not found</p>
          <Button onClick={() => navigate(ROUTES.CASE_SOURCING_UPLOAD)}>
            Back to Upload
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="batch-detail-page">
      {/* Header */}
      <div className="batch-detail-page__header">
        <button className="back-button" onClick={() => navigate(ROUTES.CASE_SOURCING_UPLOAD)}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Upload
        </button>
        <div className="batch-detail-page__header-content">
          <div>
            <h1 className="batch-detail-page__title">Batch Details</h1>
            <p className="batch-detail-page__batch-id">{batchId}</p>
          </div>
          <div className="batch-detail-page__actions">
            <Button variant="secondary" onClick={handleExportCases}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Export Cases
            </Button>
            {(batchStatus.status === 'FAILED' || batchStatus.status === 'PARTIAL') && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  isLoading={isReuploading}
                >
                  Re-upload Corrected File
                </Button>
              </>
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
      <div className="batch-detail-page__summary">
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
          <div className="summary-card__label">Valid Cases</div>
          <div className="summary-card__value text-success">{formatNumber(batchStatus.validCases)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card__label">Invalid Cases</div>
          <div className="summary-card__value text-danger">{formatNumber(batchStatus.invalidCases)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card__label">Success Rate</div>
          <div className="summary-card__value">{calculateSuccessRate()}</div>
        </div>
        {batchSummary && (
          <div className="summary-card">
            <div className="summary-card__label">Duplicates</div>
            <div className="summary-card__value text-warning">{formatNumber(batchSummary.duplicates)}</div>
          </div>
        )}
        {batchStatus.completedAt && (
          <div className="summary-card summary-card--wide">
            <div className="summary-card__label">Completed At</div>
            <div className="summary-card__value">{formatDate(batchStatus.completedAt)}</div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="batch-detail-page__tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'tab-button--active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'errors' ? 'tab-button--active' : ''}`}
          onClick={() => setActiveTab('errors')}
        >
          Errors ({errors.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="batch-detail-page__content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            {/* Progress Bar */}
            <div className="progress-section">
              <h3 className="section-title">Processing Progress</h3>
              <div className="progress-bar">
                <div
                  className="progress-bar__fill progress-bar__fill--success"
                  style={{ width: `${(batchStatus.validCases / batchStatus.totalCases) * 100}%` }}
                ></div>
                <div
                  className="progress-bar__fill progress-bar__fill--danger"
                  style={{ width: `${(batchStatus.invalidCases / batchStatus.totalCases) * 100}%` }}
                ></div>
              </div>
              <div className="progress-legend">
                <div className="progress-legend__item">
                  <span className="progress-legend__dot progress-legend__dot--success"></span>
                  Valid ({formatNumber(batchStatus.validCases)})
                </div>
                <div className="progress-legend__item">
                  <span className="progress-legend__dot progress-legend__dot--danger"></span>
                  Invalid ({formatNumber(batchStatus.invalidCases)})
                </div>
              </div>
            </div>

            {/* Quick Errors */}
            {batchStatus.errors && batchStatus.errors.length > 0 && (
              <div className="quick-errors-section">
                <h3 className="section-title">Recent Errors</h3>
                <div className="quick-errors">
                  {batchStatus.errors.slice(0, 5).map((err, idx) => (
                    <div key={idx} className="quick-error-item">
                      <span className="quick-error-item__case">{err.externalCaseId}</span>
                      <span className="quick-error-item__type">{err.errorType}</span>
                      <span className="quick-error-item__message">{err.message}</span>
                    </div>
                  ))}
                  {batchStatus.errors.length > 5 && (
                    <button
                      className="view-all-button"
                      onClick={() => setActiveTab('errors')}
                    >
                      View all {batchStatus.errors.length} errors
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'errors' && (
          <div className="errors-content">
            <div className="errors-header">
              <h3 className="section-title">Validation Errors</h3>
              {errors.length > 0 && (
                <Button variant="secondary" size="sm" onClick={handleExportErrors}>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Export Errors
                </Button>
              )}
            </div>
            <Table
              columns={errorColumns}
              data={errors}
              keyExtractor={(row) => `${row.rowNumber}-${row.externalCaseId}`}
              emptyMessage="No errors found"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default BatchDetailPage
