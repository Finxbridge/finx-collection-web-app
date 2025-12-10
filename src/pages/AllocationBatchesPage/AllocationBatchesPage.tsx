/**
 * Allocation Batches Page
 * View and manage batch history
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { allocationService } from '@services/api'
import type { AllocationBatch } from '@types'
import './AllocationBatchesPage.css'

export function AllocationBatchesPage() {
  const navigate = useNavigate()
  const [batches, setBatches] = useState<AllocationBatch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchBatches = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      const data = await allocationService.getBatches({
        status: statusFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page: 0,
        size: 50,
      })
      setBatches(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch batches')
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, startDate, endDate])

  useEffect(() => {
    fetchBatches()
  }, [fetchBatches])

  const handleExport = async (batchId: string) => {
    try {
      const blob = await allocationService.exportBatch(batchId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `allocations_${batchId}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export batch')
    }
  }

  const handleExportErrors = async (batchId: string) => {
    try {
      const blob = await allocationService.exportFailedRows(batchId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `failed_${batchId}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export errors')
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'badge--success'
      case 'PROCESSING': return 'badge--warning'
      case 'FAILED': return 'badge--danger'
      case 'PARTIAL': return 'badge--info'
      default: return 'badge--default'
    }
  }

  const getBatchTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'ALLOCATION': return 'badge--blue'
      case 'REALLOCATION': return 'badge--purple'
      case 'CONTACT_UPDATE': return 'badge--green'
      default: return 'badge--default'
    }
  }

  const formatDateTime = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="batches-page">
      {/* Header */}
      <div className="batches-header">
        <button className="btn-back" onClick={() => navigate('/allocation')}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Allocation
        </button>
        <div className="batches-header__content">
          <h1 className="batches-title">Batch History</h1>
          <p className="batches-subtitle">View and manage allocation batch history</p>
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
      <div className="batches-filters">
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="PROCESSING">Processing</option>
          <option value="FAILED">Failed</option>
          <option value="PARTIAL">Partial</option>
        </select>
        <input
          type="date"
          className="filter-input"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Start Date"
        />
        <input
          type="date"
          className="filter-input"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="End Date"
        />
        <button className="btn-secondary" onClick={fetchBatches}>
          Apply Filters
        </button>
      </div>

      {/* Batches Table */}
      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Loading batches...</span>
        </div>
      ) : batches.length === 0 ? (
        <div className="empty-state">
          <h3>No batches found</h3>
          <p>No batches match your filter criteria</p>
        </div>
      ) : (
        <div className="batches-table-container">
          <table className="batches-table">
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Type</th>
                <th>Total</th>
                <th>Success</th>
                <th>Failed</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => (
                <tr key={batch.batchId}>
                  <td className="batch-id">{batch.batchId.substring(0, 12)}...</td>
                  <td>
                    <span className={`badge ${getBatchTypeBadgeClass(batch.batchType)}`}>
                      {batch.batchType}
                    </span>
                  </td>
                  <td>{batch.totalCases}</td>
                  <td className="text-success">{batch.successful}</td>
                  <td className="text-danger">{batch.failed}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(batch.status)}`}>
                      {batch.status}
                    </span>
                  </td>
                  <td>{formatDateTime(batch.createdAt)}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-icon"
                        onClick={() => handleExport(batch.batchId)}
                        title="Export"
                      >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      {batch.failed > 0 && (
                        <button
                          className="btn-icon btn-icon--danger"
                          onClick={() => handleExportErrors(batch.batchId)}
                          title="Export Errors"
                        >
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                      <button
                        className="btn-icon"
                        onClick={() => navigate(`/allocation/failure-analysis?batchId=${batch.batchId}`)}
                        title="Analyze"
                      >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 20V10M12 20V4M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AllocationBatchesPage
