/**
 * Allocation Upload Page
 * Upload CSV files for bulk case allocation with batch history
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { allocationService } from '@services/api'
import type { AllocationBatchUploadResponse, AllocationBatchStatusResponse, AllocationBatch } from '@types'
import './AllocationUploadPage.css'

export function AllocationUploadPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [uploadResult, setUploadResult] = useState<AllocationBatchUploadResponse | null>(null)
  const [batchStatus, setBatchStatus] = useState<AllocationBatchStatusResponse | null>(null)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Batches list state
  const [batches, setBatches] = useState<AllocationBatch[]>([])
  const [isLoadingBatches, setIsLoadingBatches] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Fetch batches list
  const fetchBatches = useCallback(async () => {
    try {
      setIsLoadingBatches(true)
      const data = await allocationService.getBatches({
        status: statusFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page: 0,
        size: 50,
      })
      setBatches(data)
    } catch (err) {
      console.error('Failed to fetch batches:', err)
    } finally {
      setIsLoadingBatches(false)
    }
  }, [statusFilter, startDate, endDate])

  useEffect(() => {
    fetchBatches()
  }, [fetchBatches])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setError('Please select a CSV file')
        return
      }
      setSelectedFile(file)
      setError('')
      setUploadResult(null)
      setBatchStatus(null)
    }
  }

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setError('Please select a CSV file')
        return
      }
      setSelectedFile(file)
      setError('')
      setUploadResult(null)
      setBatchStatus(null)
    }
  }, [])

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const downloadTemplate = async () => {
    try {
      setIsDownloading(true)
      setError('')

      const blob = await allocationService.downloadTemplate(true)
      const filename = 'allocation_template.csv'

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download template')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setIsUploading(true)
      setError('')
      setSuccessMessage('')

      const result = await allocationService.uploadBatch(selectedFile)

      setUploadResult(result)
      setSuccessMessage('File uploaded successfully! Processing in progress...')

      // Clear the selected file after successful upload
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Poll for status
      pollBatchStatus(result.batchId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file')
    } finally {
      setIsUploading(false)
    }
  }

  const pollBatchStatus = async (batchId: string) => {
    const checkStatus = async () => {
      try {
        const status = await allocationService.getBatchStatus(batchId)

        setBatchStatus(status)

        if (status.status === 'PROCESSING') {
          setTimeout(checkStatus, 2000)
        } else if (status.status === 'COMPLETED') {
          setSuccessMessage(`File uploaded and allocated successfully! ${status.successful} of ${status.totalCases} cases allocated.`)
          fetchBatches() // Refresh batches list
        } else if (status.status === 'FAILED') {
          setError('Batch processing failed')
          fetchBatches() // Refresh batches list
        } else if (status.status === 'PARTIAL') {
          setSuccessMessage(`File uploaded and partially allocated. ${status.successful} of ${status.totalCases} cases allocated, ${status.failed} failed.`)
          fetchBatches() // Refresh batches list
        }
      } catch (err) {
        console.error('Failed to fetch batch status:', err)
      }
    }

    checkStatus()
  }

  const handleExportErrors = async () => {
    if (!uploadResult) return

    try {
      const blob = await allocationService.exportFailedRows(uploadResult.batchId)

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `failed_allocation_${uploadResult.batchId}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export errors')
    }
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setUploadResult(null)
    setBatchStatus(null)
    setError('')
    setSuccessMessage('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

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

  const getBatchTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'ALLOCATION':
        return 'badge--blue'
      case 'REALLOCATION':
        return 'badge--purple'
      case 'CONTACT_UPDATE':
        return 'badge--green'
      default:
        return 'badge--default'
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

  const handleExportBatch = async (batchId: string) => {
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

  const handleExportBatchErrors = async (batchId: string) => {
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

  return (
    <div className="upload-page">
      {/* Header */}
      <div className="upload-header">
        <button className="btn-back" onClick={() => navigate('/allocation')}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Allocation
        </button>
        <div className="upload-header__content">
          <h1 className="upload-title">Upload Allocation Batch</h1>
          <p className="upload-subtitle">
            Upload CSV files for bulk case allocation
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert--error">
          <span>{error}</span>
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}
      {successMessage && (
        <div className="alert alert--success">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')}>Dismiss</button>
        </div>
      )}

      {/* Upload Card */}
      <div className="upload-card">
        <div className="upload-card__header">
          <h2 className="upload-card__title">
            Upload Allocation File
          </h2>
          <button
            className="btn-download-template"
            onClick={downloadTemplate}
            disabled={isDownloading}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {isDownloading ? 'Downloading...' : 'Download Template'}
          </button>
        </div>

        <div className="upload-card__body">
          {/* Dropzone */}
          <div
            className={`upload-dropzone ${selectedFile ? 'upload-dropzone--has-file' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            {selectedFile ? (
              <div className="upload-dropzone__file">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="upload-dropzone__file-info">
                  <span className="upload-dropzone__file-name">{selectedFile.name}</span>
                  <span className="upload-dropzone__file-size">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </span>
                </div>
                <button
                  className="upload-dropzone__remove"
                  onClick={(e) => { e.stopPropagation(); resetUpload(); }}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <div className="upload-dropzone__icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="upload-dropzone__text">
                  <span className="upload-dropzone__text--primary">Click to upload</span> or drag and drop
                </p>
                <p className="upload-dropzone__hint">CSV files only</p>
              </>
            )}
          </div>

          {/* Upload Button */}
          <div className="upload-actions">
            <button
              className="btn-primary btn-upload"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? (
                <>
                  <div className="spinner-small"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Upload File
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Batch Status */}
      {(uploadResult || batchStatus) && (
        <div className="batch-status-card">
          <div className="batch-status-card__header">
            <h2 className="batch-status-card__title">Batch Status</h2>
            <span className={`badge ${getStatusBadgeClass(batchStatus?.status || uploadResult?.status || '')}`}>
              {batchStatus?.status || uploadResult?.status}
            </span>
          </div>
          <div className="batch-status-card__body">
            <div className="batch-status-info">
              <div className="batch-status-item">
                <span className="batch-status-item__label">Batch ID</span>
                <span className="batch-status-item__value">
                  {uploadResult?.batchId}
                </span>
              </div>
              <div className="batch-status-item">
                <span className="batch-status-item__label">Total Records</span>
                <span className="batch-status-item__value">
                  {batchStatus?.totalCases || uploadResult?.totalCases}
                </span>
              </div>
              {batchStatus && (
                <>
                  <div className="batch-status-item">
                    <span className="batch-status-item__label">Successful</span>
                    <span className="batch-status-item__value batch-status-item__value--success">
                      {batchStatus.successful}
                    </span>
                  </div>
                  <div className="batch-status-item">
                    <span className="batch-status-item__label">Failed</span>
                    <span className="batch-status-item__value batch-status-item__value--error">
                      {batchStatus.failed}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Progress Bar */}
            {batchStatus && batchStatus.status === 'PROCESSING' && (
              <div className="batch-progress">
                <div className="batch-progress__bar">
                  <div
                    className="batch-progress__fill"
                    style={{
                      width: `${((batchStatus.successful + batchStatus.failed) / batchStatus.totalCases) * 100}%`,
                    }}
                  />
                </div>
                <span className="batch-progress__text">Processing...</span>
              </div>
            )}

            {/* Actions */}
            {batchStatus && batchStatus.failed > 0 && (
              <div className="batch-status-actions">
                <button className="btn-secondary" onClick={handleExportErrors}>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Export Failed Rows
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="instructions-card">
        <h3 className="instructions-card__title">Instructions</h3>
        <ul className="instructions-list">
          <li>Download the template to see the required format</li>
          <li>Fill in case_id, primary_agent_id, and optionally secondary_agent_id</li>
          <li>Save the file as CSV format</li>
          <li>Upload the file and wait for processing to complete</li>
        </ul>
      </div>

      {/* Batch History */}
      <div className="batches-section">
        <div className="batches-section__header">
          <h2 className="batches-section__title">Batch History</h2>
        </div>

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
          <button className="btn-secondary btn-filter" onClick={fetchBatches}>
            Apply Filters
          </button>
        </div>

        {/* Batches Table */}
        {isLoadingBatches ? (
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
                    <td className="batch-id">
                      <button
                        className="btn-link-batch"
                        onClick={() => navigate(`/allocation/batch/${batch.batchId}`)}
                      >
                        {batch.batchId.substring(0, 12)}...
                      </button>
                    </td>
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
                          onClick={() => handleExportBatch(batch.batchId)}
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
                            onClick={() => handleExportBatchErrors(batch.batchId)}
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
    </div>
  )
}

export default AllocationUploadPage
