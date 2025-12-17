/**
 * Execution Logs Page
 * View historical runs of communication rules
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { strategyEngineService } from '@services/api'
import { Modal } from '@components/common/Modal'
import type { ExecutionLog, LegacyExecutionStatus } from '@types'
import './ExecutionLogsPage.css'

const statusIcons: Record<LegacyExecutionStatus, JSX.Element> = {
  success: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  failed: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  running: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  partial: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
}

export function ExecutionLogsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const ruleIdFilter = searchParams.get('ruleId')

  const [logs, setLogs] = useState<ExecutionLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalLogs, setTotalLogs] = useState(0)
  const pageSize = 20

  // Modal state
  const [selectedLog, setSelectedLog] = useState<ExecutionLog | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await strategyEngineService.getExecutionLogs(
        currentPage,
        pageSize,
        ruleIdFilter || undefined
      )
      setLogs(response.logs)
      setTotalLogs(response.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch execution logs')
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, ruleIdFilter])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // Auto-refresh for running statuses
  useEffect(() => {
    const hasRunning = logs.some((log) => log.status === 'running')
    if (hasRunning) {
      const interval = setInterval(fetchLogs, 5000)
      return () => clearInterval(interval)
    }
  }, [logs, fetchLogs])

  const formatDateTime = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '-'
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const totalPages = Math.ceil(totalLogs / pageSize)

  const handleViewDetails = (log: ExecutionLog) => {
    setSelectedLog(log)
    setIsDetailsModalOpen(true)
  }

  return (
    <div className="execution-logs-page">
      {/* Back Button */}
      <button className="back-button" onClick={() => navigate('/strategy-engine')}>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back to Strategy Engine
      </button>

      {/* Header */}
      <div className="logs-header">
        <div className="logs-header__content">
          <h1 className="logs-title">Execution Logs</h1>
          <p className="logs-subtitle">
            {ruleIdFilter
              ? 'Viewing logs for selected rule'
              : 'View historical runs of all communication rules'}
          </p>
        </div>
        {ruleIdFilter && (
          <div className="logs-header__actions">
            <button
              className="btn-secondary"
              onClick={() => navigate('/strategy-engine/logs')}
            >
              Clear Filter
            </button>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert--error">
          <span>{error}</span>
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      {/* Logs Table */}
      <div className="logs-table-container">
        <div className="logs-table-header">
          <h2 className="logs-table-title">Recent Executions</h2>
        </div>

        {isLoading ? (
          <div className="logs-loading">
            <div className="spinner"></div>
            <span>Loading logs...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="logs-empty">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p>No execution logs found.</p>
          </div>
        ) : (
          <>
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Strategy Name</th>
                  <th>Start Time</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Success</th>
                  <th>Failed</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className="rule-name">{log.ruleName}</span>
                    </td>
                    <td>{formatDateTime(log.startTime)}</td>
                    <td>
                      <span className={`log-status-badge log-status-badge--${log.status}`}>
                        {statusIcons[log.status]}
                        {log.status}
                      </span>
                    </td>
                    <td>
                      <span className="log-stat__value">{log.totalProcessed}</span>
                    </td>
                    <td>
                      <span className="log-stat__value log-stat__value--success">
                        {log.successCount}
                      </span>
                    </td>
                    <td>
                      <span className="log-stat__value log-stat__value--failed">
                        {log.failedCount}
                      </span>
                    </td>
                    <td>
                      <button
                        className="view-details-btn"
                        onClick={() => handleViewDetails(log)}
                        title="View Details"
                      >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="logs-pagination">
                <div className="logs-pagination__info">
                  Showing {currentPage * pageSize + 1} to{' '}
                  {Math.min((currentPage + 1) * pageSize, totalLogs)} of {totalLogs} logs
                </div>
                <div className="logs-pagination__controls">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1}
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Log Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedLog(null)
        }}
        title="Execution Details"
        size="md"
      >
        {selectedLog && (
          <div className="log-details">
            <div className="log-details__section">
              <h4 className="log-details__section-title">Execution Information</h4>
              <div className="log-details__grid">
                <div className="log-details__item">
                  <span className="log-details__label">Execution ID</span>
                  <span className="log-details__value">{selectedLog.runId}</span>
                </div>
                <div className="log-details__item">
                  <span className="log-details__label">Strategy Name</span>
                  <span className="log-details__value">{selectedLog.ruleName}</span>
                </div>
                <div className="log-details__item">
                  <span className="log-details__label">Status</span>
                  <span className={`log-status-badge log-status-badge--${selectedLog.status}`}>
                    {statusIcons[selectedLog.status]}
                    {selectedLog.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="log-details__section">
              <h4 className="log-details__section-title">Timing</h4>
              <div className="log-details__grid">
                <div className="log-details__item">
                  <span className="log-details__label">Started At</span>
                  <span className="log-details__value">
                    {formatDateTime(selectedLog.startTime)}
                  </span>
                </div>
                <div className="log-details__item">
                  <span className="log-details__label">Completed At</span>
                  <span className="log-details__value">
                    {selectedLog.endTime ? formatDateTime(selectedLog.endTime) : 'In Progress'}
                  </span>
                </div>
                <div className="log-details__item">
                  <span className="log-details__label">Duration</span>
                  <span className="log-details__value">
                    {formatDuration(selectedLog.duration)}
                  </span>
                </div>
              </div>
            </div>

            <div className="log-details__section">
              <h4 className="log-details__section-title">Results</h4>
              <div className="log-details__grid">
                <div className="log-details__item">
                  <span className="log-details__label">Total Cases Processed</span>
                  <span className="log-details__value">{selectedLog.totalProcessed}</span>
                </div>
                <div className="log-details__item">
                  <span className="log-details__label">Successful Actions</span>
                  <span className="log-details__value" style={{ color: '#16a34a' }}>
                    {selectedLog.successCount}
                  </span>
                </div>
                <div className="log-details__item">
                  <span className="log-details__label">Failed Actions</span>
                  <span className="log-details__value" style={{ color: '#dc2626' }}>
                    {selectedLog.failedCount}
                  </span>
                </div>
                <div className="log-details__item">
                  <span className="log-details__label">Success Rate</span>
                  <span className="log-details__value">
                    {selectedLog.totalProcessed > 0
                      ? ((selectedLog.successCount / selectedLog.totalProcessed) * 100).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>

            {selectedLog.errorMessage && (
              <div className="log-details__section">
                <h4 className="log-details__section-title">Error Details</h4>
                <div className="log-details__error">{selectedLog.errorMessage}</div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ExecutionLogsPage
