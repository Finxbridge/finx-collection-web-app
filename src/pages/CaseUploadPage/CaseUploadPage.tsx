/**
 * Case Upload Page
 * Upload CSV files for case data with validation and view uploaded batches
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { caseSourcingService } from '@services/api'
import { Button } from '@components/common/Button'
import { Table, Pagination, Column } from '@components/common/Table'
import type { HeaderValidationResult, BatchUploadResponse, BatchInfo, BatchStatus, BatchesListParams } from '@types'
import './CaseUploadPage.css'

type UploadStep = 'select' | 'validate' | 'uploading' | 'success' | 'error'
type StatusFilter = 'ALL' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PARTIAL'

export function CaseUploadPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Upload state
  const [currentStep, setCurrentStep] = useState<UploadStep>('select')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [validationResult, setValidationResult] = useState<HeaderValidationResult | null>(null)
  const [uploadResult, setUploadResult] = useState<BatchUploadResponse | null>(null)
  const [uploadError, setUploadError] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  // Batches list state
  const [batches, setBatches] = useState<BatchInfo[]>([])
  const [isBatchesLoading, setIsBatchesLoading] = useState(true)
  const [batchesError, setBatchesError] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const pageSize = 10

  // Fetch batches
  const fetchBatches = useCallback(async () => {
    try {
      setIsBatchesLoading(true)
      setBatchesError('')

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
      setBatchesError(err instanceof Error ? err.message : 'Failed to fetch batches')
    } finally {
      setIsBatchesLoading(false)
    }
  }, [currentPage, statusFilter])

  useEffect(() => {
    fetchBatches()
  }, [fetchBatches])

  // Upload handlers
  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setUploadError('Please select a CSV file')
      return
    }
    setSelectedFile(file)
    setUploadError('')
    setCurrentStep('select')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleValidateHeaders = async () => {
    if (!selectedFile) return

    try {
      setCurrentStep('validate')
      setUploadError('')
      const result = await caseSourcingService.validateHeaders(selectedFile)
      setValidationResult(result)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to validate headers')
      setCurrentStep('select')
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setCurrentStep('uploading')
      setUploadError('')
      const result = await caseSourcingService.uploadCases(selectedFile)
      setUploadResult(result)
      setCurrentStep('success')
      // Refresh batches list after successful upload
      fetchBatches()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload file')
      setCurrentStep('error')
    }
  }

  const handleDownloadTemplate = async (includeSample: boolean) => {
    try {
      const blob = await caseSourcingService.downloadTemplate(includeSample)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = includeSample ? 'case_upload_template_with_sample.csv' : 'case_upload_template.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to download template')
    }
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setValidationResult(null)
    setUploadResult(null)
    setUploadError('')
    setCurrentStep('select')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Batch handlers
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
      setBatchesError(err instanceof Error ? err.message : 'Failed to export batch')
    }
  }

  // Formatters
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
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

  // Batch table columns
  const batchColumns: Column<BatchInfo>[] = [
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
    <div className="case-upload-page">
      {/* Header */}
      <div className="case-upload-page__header">
        <div>
          <h1 className="case-upload-page__title">Upload Cases</h1>
          <p className="case-upload-page__subtitle">
            Upload a CSV file containing case data for validation and processing
          </p>
        </div>
      </div>

      {uploadError && (
        <div className="alert alert--error">
          <span>{uploadError}</span>
          <button onClick={() => setUploadError('')}>Dismiss</button>
        </div>
      )}

      <div className="case-upload-page__content">
        {/* Upload Section */}
        <div className="upload-section">
          {currentStep === 'select' && (
            <>
              {/* Drop Zone */}
              <div
                className={`drop-zone ${isDragging ? 'drop-zone--active' : ''} ${selectedFile ? 'drop-zone--has-file' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleInputChange}
                  className="drop-zone__input"
                />
                {selectedFile ? (
                  <div className="drop-zone__file">
                    <div className="drop-zone__file-icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="drop-zone__file-info">
                      <div className="drop-zone__file-name">{selectedFile.name}</div>
                      <div className="drop-zone__file-size">{formatFileSize(selectedFile.size)}</div>
                    </div>
                    <button
                      className="drop-zone__file-remove"
                      onClick={(e) => {
                        e.stopPropagation()
                        resetUpload()
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="drop-zone__placeholder">
                    <div className="drop-zone__icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="drop-zone__text">
                      <span className="drop-zone__text-primary">Click to upload</span> or drag and drop
                    </div>
                    <div className="drop-zone__text-secondary">CSV files only</div>
                  </div>
                )}
              </div>

              {/* Actions */}
              {selectedFile && (
                <div className="upload-actions">
                  <Button variant="secondary" onClick={handleValidateHeaders}>
                    Validate Headers
                  </Button>
                  <Button onClick={handleUpload}>
                    Upload File
                  </Button>
                </div>
              )}
            </>
          )}

          {currentStep === 'validate' && validationResult && (
            <div className="validation-result">
              <div className={`validation-result__status ${validationResult.isValid ? 'validation-result__status--valid' : 'validation-result__status--invalid'}`}>
                {validationResult.isValid ? (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Headers Valid
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Header Issues Found
                  </>
                )}
              </div>

              <p className="validation-result__message">{validationResult.message}</p>

              {validationResult.missingHeaders.length > 0 && (
                <div className="validation-result__section">
                  <h3 className="validation-result__section-title">Missing Headers</h3>
                  <div className="validation-result__tags">
                    {validationResult.missingHeaders.map((header) => (
                      <span key={header} className="validation-result__tag validation-result__tag--error">
                        {header}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {validationResult.unknownHeaders.length > 0 && (
                <div className="validation-result__section">
                  <h3 className="validation-result__section-title">Unknown Headers</h3>
                  <div className="validation-result__tags">
                    {validationResult.unknownHeaders.map((header) => (
                      <span key={header} className="validation-result__tag validation-result__tag--warning">
                        {header}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {validationResult.suggestions.length > 0 && (
                <div className="validation-result__section">
                  <h3 className="validation-result__section-title">Suggestions</h3>
                  <div className="validation-result__suggestions">
                    {validationResult.suggestions.map((suggestion, idx) => (
                      <div key={idx} className="validation-result__suggestion">
                        <span className="validation-result__suggestion-from">{suggestion.providedHeader}</span>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="validation-result__suggestion-to">{suggestion.suggestedHeader}</span>
                        <span className="validation-result__suggestion-score">({suggestion.similarityScore}% match)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="validation-result__section">
                <h3 className="validation-result__section-title">Expected Headers</h3>
                <div className="validation-result__tags">
                  {validationResult.expectedHeaders.map((header) => (
                    <span key={header} className="validation-result__tag">
                      {header}
                    </span>
                  ))}
                </div>
              </div>

              <div className="upload-actions">
                <Button variant="secondary" onClick={resetUpload}>
                  Select Different File
                </Button>
                {validationResult.isValid && (
                  <Button onClick={handleUpload}>
                    Proceed with Upload
                  </Button>
                )}
              </div>
            </div>
          )}

          {currentStep === 'uploading' && (
            <div className="upload-progress">
              <div className="upload-progress__spinner">
                <div className="spinner spinner--lg"></div>
              </div>
              <div className="upload-progress__text">Uploading and processing file...</div>
              <div className="upload-progress__subtext">This may take a few moments</div>
            </div>
          )}

          {currentStep === 'success' && uploadResult && (
            <div className="upload-success">
              <div className="upload-success__icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="upload-success__title">Upload Successful</h2>
              <p className="upload-success__message">
                Your file has been uploaded and is being processed.
              </p>
              <div className="upload-success__details">
                <div className="upload-success__detail">
                  <span className="upload-success__label">Batch ID</span>
                  <span className="upload-success__value">{uploadResult.batchId}</span>
                </div>
                <div className="upload-success__detail">
                  <span className="upload-success__label">Total Cases</span>
                  <span className="upload-success__value">{uploadResult.totalCases}</span>
                </div>
                <div className="upload-success__detail">
                  <span className="upload-success__label">Status</span>
                  <span className="upload-success__value status-badge status-badge--info">
                    {uploadResult.status}
                  </span>
                </div>
              </div>
              <div className="upload-actions">
                <Button variant="secondary" onClick={resetUpload}>
                  Upload Another File
                </Button>
                <Button onClick={() => navigate(`/case-sourcing/batches/${uploadResult.batchId}`)}>
                  View Batch Details
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'error' && (
            <div className="upload-error">
              <div className="upload-error__icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h2 className="upload-error__title">Upload Failed</h2>
              <p className="upload-error__message">{uploadError}</p>
              <div className="upload-actions">
                <Button variant="secondary" onClick={resetUpload}>
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Template Section */}
        <div className="template-section">
          <div className="template-card">
            <div className="template-card__icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 18V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 15L12 12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="template-card__title">Download Template</h3>
            <p className="template-card__desc">
              Get the CSV template with all required columns
            </p>
            <div className="template-card__actions">
              <button
                className="template-card__btn"
                onClick={() => handleDownloadTemplate(false)}
              >
                Headers Only
              </button>
              <button
                className="template-card__btn template-card__btn--primary"
                onClick={() => handleDownloadTemplate(true)}
              >
                With Sample Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Batches List Section */}
      <div className="batches-section">
        <div className="batches-section__header">
          <h2 className="batches-section__title">Uploaded Batches</h2>
          <div className="batches-section__filters">
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
            <span className="filter-info">
              {formatNumber(totalElements)} batches
            </span>
          </div>
        </div>

        {batchesError && (
          <div className="alert alert--error">
            <span>{batchesError}</span>
            <button onClick={() => setBatchesError('')}>Dismiss</button>
          </div>
        )}

        <div className="batches-section__table">
          <Table
            columns={batchColumns}
            data={batches}
            keyExtractor={(batch) => batch.batchId}
            isLoading={isBatchesLoading}
            emptyMessage="No batches found"
            onRowClick={handleViewBatch}
          />
        </div>

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
    </div>
  )
}

export default CaseUploadPage
