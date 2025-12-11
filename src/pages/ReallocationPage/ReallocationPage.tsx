/**
 * Reallocation Page
 * Manage case reallocations between agents
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { reallocationService, allocationService, apiClient } from '@services/api'
import { API_ENDPOINTS } from '@config/constants'
import type { AllocationBatchUploadResponse, AllocationBatchStatusResponse, User } from '@types'
import './ReallocationPage.css'

type ReallocationMethod = 'upload' | 'agent'

export function ReallocationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fromAgentParam = searchParams.get('fromAgent')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [method, setMethod] = useState<ReallocationMethod>(fromAgentParam ? 'agent' : 'upload')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadResult, setUploadResult] = useState<AllocationBatchUploadResponse | null>(null)
  const [batchStatus, setBatchStatus] = useState<AllocationBatchStatusResponse | null>(null)

  // Users/Agents state
  const [users, setUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)

  // Agent reallocation state
  const [fromAgentId, setFromAgentId] = useState(fromAgentParam || '')
  const [toAgentId, setToAgentId] = useState('')
  const [agentReason, setAgentReason] = useState('')

  // Fetch users from system using management API
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoadingUsers(true)
      const response = await apiClient.get<{ status: string; payload: { content: User[] }; message: string }>(
        API_ENDPOINTS.MANAGEMENT.USERS.LIST,
        { params: { page: 0, size: 100 } }
      )
      // Response format: { status, payload: { content: [...users] }, message }
      const allUsers = response.data.payload?.content || []
      // Filter only active users
      const activeUsers = allUsers.filter((user: User) => user.status === 'ACTIVE')
      setUsers(activeUsers)
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setError('Failed to load users')
    } finally {
      setIsLoadingUsers(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

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

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setIsSubmitting(true)
      setError('')
      const result = await reallocationService.uploadBatch(selectedFile)
      setUploadResult(result)
      setSuccessMessage('File uploaded successfully!')
      pollBatchStatus(result.batchId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file')
    } finally {
      setIsSubmitting(false)
    }
  }

  const pollBatchStatus = async (batchId: string) => {
    const checkStatus = async () => {
      try {
        const status = await reallocationService.getBatchStatus(batchId)
        setBatchStatus(status)
        if (status.status === 'PROCESSING') {
          setTimeout(checkStatus, 2000)
        } else if (status.status === 'COMPLETED') {
          setSuccessMessage(`Reallocation complete! ${status.successful} of ${status.totalCases} cases reallocated.`)
        }
      } catch (err) {
        console.error('Failed to fetch batch status:', err)
      }
    }
    checkStatus()
  }

  const handleAgentReallocation = async () => {
    if (!fromAgentId || !toAgentId) {
      setError('Please select both source and destination agents')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')
      const result = await reallocationService.reallocateByAgent({
        fromUserId: parseInt(fromAgentId),
        toUserId: parseInt(toAgentId),
        reason: agentReason || undefined,
      })
      setSuccessMessage(`Reallocation initiated. ${result.totalReallocated || 0} cases being reallocated.`)
      // Reset form
      setFromAgentId('')
      setToAgentId('')
      setAgentReason('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reallocate cases')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExportErrors = async () => {
    if (!uploadResult) return
    try {
      const blob = await reallocationService.exportFailedRows(uploadResult.batchId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `failed_reallocations_${uploadResult.batchId}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export errors')
    }
  }

  const downloadTemplate = async () => {
    try {
      const blob = await allocationService.downloadTemplate(true)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'reallocation_template.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download template')
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'badge--success'
      case 'PROCESSING': return 'badge--warning'
      case 'FAILED': return 'badge--danger'
      default: return 'badge--default'
    }
  }

  return (
    <div className="reallocation-page">
      {/* Header */}
      <div className="reallocation-header">
        <button className="btn-back" onClick={() => navigate('/allocation')}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Allocation
        </button>
        <div className="reallocation-header__content">
          <h1 className="reallocation-title">Reallocate Cases</h1>
          <p className="reallocation-subtitle">
            Move cases between agents using bulk upload or agent transfer
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

      {/* Method Selection */}
      <div className="method-selector">
        <button
          className={`method-btn ${method === 'upload' ? 'method-btn--active' : ''}`}
          onClick={() => setMethod('upload')}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Bulk Upload
        </button>
        <button
          className={`method-btn ${method === 'agent' ? 'method-btn--active' : ''}`}
          onClick={() => setMethod('agent')}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 1L21 5L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 11V9C3 7.93913 3.42143 6.92172 4.17157 6.17157C4.92172 5.42143 5.93913 5 7 5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 23L3 19L7 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 13V15C21 16.0609 20.5786 17.0783 19.8284 17.8284C19.0783 18.5786 18.0609 19 17 19H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          By Agent
        </button>
      </div>

      {/* Bulk Upload Method */}
      {method === 'upload' && (
        <div className="reallocation-card">
          <div className="reallocation-card__header">
            <h2>Upload Reallocation File</h2>
            <button className="btn-link" onClick={downloadTemplate}>
              Download Template
            </button>
          </div>
          <div className="reallocation-card__body">
            <div
              className="upload-dropzone"
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
                  </svg>
                  <span>{selectedFile.name}</span>
                </div>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p>Click to upload or drag and drop</p>
                  <span>CSV files only</span>
                </>
              )}
            </div>
            <button
              className="btn-primary btn-full"
              onClick={handleUpload}
              disabled={!selectedFile || isSubmitting}
            >
              {isSubmitting ? 'Uploading...' : 'Upload & Process'}
            </button>

            {batchStatus && (
              <div className="batch-status">
                <div className="batch-status__header">
                  <span>Batch: {uploadResult?.batchId}</span>
                  <span className={`badge ${getStatusBadgeClass(batchStatus.status)}`}>
                    {batchStatus.status}
                  </span>
                </div>
                <div className="batch-status__stats">
                  <span>Total: {batchStatus.totalCases}</span>
                  <span className="text-success">Success: {batchStatus.successful}</span>
                  <span className="text-danger">Failed: {batchStatus.failed}</span>
                </div>
                {batchStatus.failed > 0 && (
                  <button className="btn-secondary btn-sm" onClick={handleExportErrors}>
                    Export Failed Rows
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* By Agent Method */}
      {method === 'agent' && (
        <div className="reallocation-card">
          <div className="reallocation-card__header">
            <h2>Reallocate by Agent</h2>
          </div>
          <div className="reallocation-card__body">
            <p className="method-description">
              Transfer all cases from one agent to another
            </p>

            {isLoadingUsers ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <span>Loading users...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="empty-state">
                <p>No active users found in the system</p>
              </div>
            ) : (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">From Agent *</label>
                  <select
                    className="form-select"
                    value={fromAgentId}
                    onChange={(e) => setFromAgentId(e.target.value)}
                  >
                    <option value="">Select source agent</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} {user.state || user.city ? `(${[user.state, user.city].filter(Boolean).join(', ')})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">To Agent *</label>
                  <select
                    className="form-select"
                    value={toAgentId}
                    onChange={(e) => setToAgentId(e.target.value)}
                  >
                    <option value="">Select destination agent</option>
                    {users.filter((u) => u.id.toString() !== fromAgentId).map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} {user.state || user.city ? `(${[user.state, user.city].filter(Boolean).join(', ')})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Reason</label>
              <textarea
                className="form-textarea"
                placeholder="Enter reason for reallocation"
                rows={2}
                value={agentReason}
                onChange={(e) => setAgentReason(e.target.value)}
              />
            </div>

            <button
              className="btn-primary btn-full"
              onClick={handleAgentReallocation}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Reallocate Cases'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReallocationPage
