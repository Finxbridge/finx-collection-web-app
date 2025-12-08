/**
 * Batches List Page
 * View all case batch uploads with filtering and pagination
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { caseSourcingService } from '@services/api'
import { Table, Pagination, Column } from '@components/common/Table'
import { Button } from '@components/common/Button'
import { ROUTES } from '@config/constants'
import type { BatchInfo, BatchStatus, BatchesListParams } from '@types'
import './BatchesPage.css'

type StatusFilter = 'ALL' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PARTIAL'

export function BatchesPage() {
  const navigate = useNavigate()
  const [batches, setBatches] = useState<BatchInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')

  // Pagination
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const pageSize = 20

  const fetchBatches = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')

      const params: BatchesListParams = {
        page: currentPage,
        size: pageSize,
      }

      if (statusFilter !== 'ALL') {
        params.status = statusFilter as BatchStatus
      }

      const response = await caseSourcingService.getBatches(params)
      setBatches(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch batches')
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, statusFilter])

  useEffect(() => {
    fetchBatches()
  }, [fetchBatches])

  const handleStatusFilterChange = (status: StatusFilter) => {
    setStatusFilter(status)
    setCurrentPage(0)
  }

  const handleViewBatch = (batch: BatchInfo) => {
    navigate(`/case-sourcing/batches/${batch.batchId}`)
  }

  const handleExportBatch = async (batch: BatchInfo, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const blob = await caseSourcingService.exportBatchCases(batch.batchId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `batch_${batch.batchId}_cases.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export batch')
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

  const calculateSuccessRate = (valid: number, total: number): string => {
    if (total === 0) return '0%'
    return ((valid / total) * 100).toFixed(1) + '%'
  }

  const columns: Column<BatchInfo>[] = [
    {
      key: 'batchId',
      header: 'Batch ID',
      render: (batch) => (
        <span className="batch-id">{batch.batchId.substring(0, 12)}...</span>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      render: (batch) => (
        <span className="source-label">{batch.source.replace('_', ' ')}</span>
      ),
    },
    {
      key: 'uploadedBy',
      header: 'Uploaded By',
    },
    {
      key: 'uploadedAt',
      header: 'Upload Date',
      render: (batch) => formatDate(batch.uploadedAt),
    },
    {
      key: 'totalCases',
      header: 'Total',
      render: (batch) => formatNumber(batch.totalCases),
    },
    {
      key: 'validCases',
      header: 'Valid',
      render: (batch) => (
        <span className="text-success">{formatNumber(batch.validCases)}</span>
      ),
    },
    {
      key: 'invalidCases',
      header: 'Invalid',
      render: (batch) => (
        <span className={batch.invalidCases > 0 ? 'text-danger' : ''}>
          {formatNumber(batch.invalidCases)}
        </span>
      ),
    },
    {
      key: 'successRate',
      header: 'Success Rate',
      render: (batch) => (
        <span className="success-rate">
          {calculateSuccessRate(batch.validCases, batch.totalCases)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (batch) => (
        <span className={`status-badge ${getStatusBadgeClass(batch.status)}`}>
          {batch.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (batch) => (
        <div className="table-actions">
          <button
            className="table-action-btn"
            onClick={(e) => {
              e.stopPropagation()
              handleViewBatch(batch)
            }}
            title="View Details"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
          <button
            className="table-action-btn"
            onClick={(e) => handleExportBatch(batch, e)}
            title="Export"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      ),
    },
  ]

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'FAILED', label: 'Failed' },
    { value: 'PARTIAL', label: 'Partial' },
  ]

  return (
    <div className="batches-page">
      {/* Header */}
      <div className="batches-page__header">
        <div>
          <h1 className="batches-page__title">Batch Uploads</h1>
          <p className="batches-page__subtitle">
            View and manage all case batch uploads
          </p>
        </div>
        <Button onClick={() => navigate(ROUTES.CASE_SOURCING_UPLOAD)}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Upload New Batch
        </Button>
      </div>

      {error && (
        <div className="alert alert--error">
          <span>{error}</span>
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      {/* Filters */}
      <div className="batches-page__filters">
        <div className="filter-group">
          <label className="filter-label">Status</label>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value as StatusFilter)}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <span className="filter-info">
            Showing {formatNumber(totalElements)} batches
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="batches-page__table">
        <Table
          columns={columns}
          data={batches}
          keyExtractor={(batch) => batch.batchId}
          isLoading={isLoading}
          emptyMessage="No batches found"
          onRowClick={handleViewBatch}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalElements}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}

export default BatchesPage
