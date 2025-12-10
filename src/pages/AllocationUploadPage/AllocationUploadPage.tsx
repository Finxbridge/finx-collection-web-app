/**
 * Allocation Upload Page
 * Upload CSV files for bulk case allocation
 */

import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { allocationService, reallocationService } from '@services/api'
import type { AllocationBatchUploadResponse, AllocationBatchStatusResponse } from '@types'
import './AllocationUploadPage.css'

type UploadType = 'allocation' | 'reallocation' | 'contact'

export function AllocationUploadPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [uploadType, setUploadType] = useState<UploadType>('allocation')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [uploadResult, setUploadResult] = useState<AllocationBatchUploadResponse | null>(null)
  const [batchStatus, setBatchStatus] = useState<AllocationBatchStatusResponse | null>(null)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

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

      let blob: Blob
      let filename: string

      if (uploadType === 'allocation') {
        blob = await allocationService.downloadTemplate(true)
        filename = 'allocation_template.csv'
      } else if (uploadType === 'reallocation') {
        blob = await allocationService.downloadTemplate(true)
        filename = 'reallocation_template.csv'
      } else {
        blob = await allocationService.downloadContactTemplate(true)
        filename = 'contact_update_template.csv'
      }

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

      let result: AllocationBatchUploadResponse

      if (uploadType === 'allocation') {
        result = await allocationService.uploadBatch(selectedFile)
      } else if (uploadType === 'reallocation') {
        result = await reallocationService.uploadBatch(selectedFile)
      } else {
        result = await allocationService.uploadContactBatch(selectedFile)
      }

      setUploadResult(result)
      setSuccessMessage('File uploaded successfully! Processing in progress...')

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
        let status: AllocationBatchStatusResponse

        if (uploadType === 'allocation') {
          status = await allocationService.getBatchStatus(batchId)
        } else if (uploadType === 'reallocation') {
          status = await reallocationService.getBatchStatus(batchId)
        } else {
          status = await allocationService.getContactBatchStatus(batchId) as unknown as AllocationBatchStatusResponse
        }

        setBatchStatus(status)

        if (status.status === 'PROCESSING') {
          setTimeout(checkStatus, 2000)
        } else if (status.status === 'COMPLETED') {
          setSuccessMessage(`Processing complete! ${status.successful} of ${status.totalCases} records successful.`)
        } else if (status.status === 'FAILED') {
          setError('Batch processing failed')
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
      let blob: Blob

      if (uploadType === 'allocation') {
        blob = await allocationService.exportFailedRows(uploadResult.batchId)
      } else if (uploadType === 'reallocation') {
        blob = await reallocationService.exportFailedRows(uploadResult.batchId)
      } else {
        blob = await allocationService.exportFailedContactRows(uploadResult.batchId)
      }

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `failed_${uploadType}_${uploadResult.batchId}.csv`
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
          <h1 className="upload-title">Upload Batch</h1>
          <p className="upload-subtitle">
            Upload CSV files for bulk allocation, reallocation, or contact updates
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

      {/* Upload Type Selection */}
      <div className="upload-type-selector">
        <button
          className={`upload-type-btn ${uploadType === 'allocation' ? 'upload-type-btn--active' : ''}`}
          onClick={() => { setUploadType('allocation'); resetUpload(); }}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Allocation
        </button>
        <button
          className={`upload-type-btn ${uploadType === 'reallocation' ? 'upload-type-btn--active' : ''}`}
          onClick={() => { setUploadType('reallocation'); resetUpload(); }}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 1L21 5L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 11V9C3 7.93913 3.42143 6.92172 4.17157 6.17157C4.92172 5.42143 5.93913 5 7 5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 23L3 19L7 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 13V15C21 16.0609 20.5786 17.0783 19.8284 17.8284C19.0783 18.5786 18.0609 19 17 19H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Reallocation
        </button>
        <button
          className={`upload-type-btn ${uploadType === 'contact' ? 'upload-type-btn--active' : ''}`}
          onClick={() => { setUploadType('contact'); resetUpload(); }}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 16.92V19.92C22.0011 20.4832 21.7723 21.0234 21.3654 21.4292C20.9586 21.8351 20.4086 22.0754 19.83 22.09C16.7429 21.7679 13.787 20.7264 11.19 19.05C8.77383 17.5384 6.72534 15.4899 5.21366 13.0737C3.53009 10.4626 2.48834 7.4896 2.17 4.38631C2.15528 3.80889 2.3949 3.25988 2.80078 2.85376C3.20666 2.44764 3.74732 2.21921 4.31 2.22001H7.31C8.30649 2.21001 9.16098 2.87932 9.43 3.83001C9.66355 4.66031 9.98738 5.46253 10.39 6.22001C10.6706 6.7648 10.5396 7.43832 10.07 7.82001L8.82 9.07001C10.2265 11.5672 12.4328 13.7735 14.93 15.18L16.18 13.93C16.5617 13.4604 17.2352 13.3294 17.78 13.61C18.5375 14.0126 19.3397 14.3365 20.17 14.57C21.1318 14.8428 21.8038 15.7118 21.78 16.7233V16.92H22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Contact Update
        </button>
      </div>

      {/* Upload Card */}
      <div className="upload-card">
        <div className="upload-card__header">
          <h2 className="upload-card__title">
            Upload {uploadType === 'allocation' ? 'Allocation' : uploadType === 'reallocation' ? 'Reallocation' : 'Contact Update'} File
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
          {uploadType === 'allocation' && (
            <>
              <li>Download the template to see the required format</li>
              <li>Fill in case_id, primary_agent_id, and optionally secondary_agent_id</li>
              <li>Save the file as CSV format</li>
              <li>Upload the file and wait for processing to complete</li>
            </>
          )}
          {uploadType === 'reallocation' && (
            <>
              <li>Download the template to see the required format</li>
              <li>Specify case_id and the new agent_id to reallocate to</li>
              <li>Optionally include a reason for reallocation</li>
              <li>Upload the file and wait for processing to complete</li>
            </>
          )}
          {uploadType === 'contact' && (
            <>
              <li>Download the template for contact updates</li>
              <li>Include case_id and the fields to update (mobile, email, address)</li>
              <li>Save the file as CSV format</li>
              <li>Upload the file and wait for processing to complete</li>
            </>
          )}
        </ul>
      </div>
    </div>
  )
}

export default AllocationUploadPage
