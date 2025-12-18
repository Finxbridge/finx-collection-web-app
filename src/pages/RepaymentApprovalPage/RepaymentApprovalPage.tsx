/**
 * Repayment Approval Page
 * Manage pending repayment approvals with bulk actions
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { repaymentService } from '@services/api'
import type { Repayment, PageResponse } from '@types'
import { PAYMENT_MODE_LABELS } from '@types'
import './RepaymentApprovalPage.css'

export function RepaymentApprovalPage() {
  const navigate = useNavigate()

  const [repayments, setRepayments] = useState<Repayment[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const pageSize = 20

  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedRepayment, setSelectedRepayment] = useState<Repayment | null>(null)
  const [approvalComments, setApprovalComments] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchPendingApprovals = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')

      const response: PageResponse<Repayment> = await repaymentService.getPendingApprovals(
        currentPage,
        pageSize
      )
      setRepayments(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pending approvals')
    } finally {
      setIsLoading(false)
    }
  }, [currentPage])

  useEffect(() => {
    fetchPendingApprovals()
  }, [fetchPendingApprovals])

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDateTime = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleSelectAll = () => {
    if (selectedIds.size === repayments.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(repayments.map((r) => r.id)))
    }
  }

  const handleSelectOne = (id: number) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const openApproveModal = (repayment?: Repayment) => {
    setSelectedRepayment(repayment || null)
    setApprovalComments('')
    setShowApproveModal(true)
  }

  const openRejectModal = (repayment?: Repayment) => {
    setSelectedRepayment(repayment || null)
    setRejectionReason('')
    setShowRejectModal(true)
  }

  const handleApprove = async () => {
    try {
      setIsProcessing(true)
      setError('')

      if (selectedRepayment) {
        // Single approval
        await repaymentService.approve(selectedRepayment.id, approvalComments || undefined)
        setSuccessMessage('Repayment approved successfully')
      } else {
        // Bulk approval
        const ids = Array.from(selectedIds)
        for (const id of ids) {
          await repaymentService.approve(id, approvalComments || undefined)
        }
        setSuccessMessage(`${ids.length} repayments approved successfully`)
        setSelectedIds(new Set())
      }

      setShowApproveModal(false)
      setApprovalComments('')
      fetchPendingApprovals()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve repayment(s)')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) return

    try {
      setIsProcessing(true)
      setError('')

      if (selectedRepayment) {
        // Single rejection
        await repaymentService.reject(selectedRepayment.id, rejectionReason)
        setSuccessMessage('Repayment rejected successfully')
      } else {
        // Bulk rejection
        const ids = Array.from(selectedIds)
        for (const id of ids) {
          await repaymentService.reject(id, rejectionReason)
        }
        setSuccessMessage(`${ids.length} repayments rejected successfully`)
        setSelectedIds(new Set())
      }

      setShowRejectModal(false)
      setRejectionReason('')
      fetchPendingApprovals()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject repayment(s)')
    } finally {
      setIsProcessing(false)
    }
  }

  const getTotalSelectedAmount = () => {
    return repayments
      .filter((r) => selectedIds.has(r.id))
      .reduce((sum, r) => sum + r.amount, 0)
  }

  return (
    <div className="approval-page">
      {/* Header */}
      <div className="approval-header">
        <button className="btn-back" onClick={() => navigate('/repayment')}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M19 12H5M5 12L12 19M5 12L12 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </button>
        <div className="approval-header__content">
          <h1 className="approval-title">Pending Approvals</h1>
          <p className="approval-subtitle">{totalElements} repayments awaiting approval</p>
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

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bulk-actions-bar">
          <div className="bulk-actions-bar__info">
            <span className="bulk-actions-bar__count">{selectedIds.size} selected</span>
            <span className="bulk-actions-bar__amount">
              Total: {formatCurrency(getTotalSelectedAmount())}
            </span>
          </div>
          <div className="bulk-actions-bar__actions">
            <button className="btn-danger-outline" onClick={() => openRejectModal()}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Reject Selected
            </button>
            <button className="btn-success" onClick={() => openApproveModal()}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Approve Selected
            </button>
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="table-card">
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <span>Loading pending approvals...</span>
          </div>
        ) : repayments.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p>No pending approvals</p>
            <span>All repayments have been processed</span>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="approval-table">
                <thead>
                  <tr>
                    <th className="th-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === repayments.length && repayments.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Repayment #</th>
                    <th>Customer</th>
                    <th>Loan Account</th>
                    <th>Amount</th>
                    <th>Payment Mode</th>
                    <th>Date</th>
                    <th>Collector</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {repayments.map((repayment) => (
                    <tr
                      key={repayment.id}
                      className={selectedIds.has(repayment.id) ? 'row--selected' : ''}
                    >
                      <td className="td-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(repayment.id)}
                          onChange={() => handleSelectOne(repayment.id)}
                        />
                      </td>
                      <td
                        className="cell-link"
                        onClick={() => navigate(`/repayment/${repayment.id}`)}
                      >
                        {repayment.repaymentNumber || `#${repayment.id}`}
                      </td>
                      <td>{repayment.customerName}</td>
                      <td className="cell-mono">{repayment.loanAccountNumber || '-'}</td>
                      <td className="cell-amount">{formatCurrency(repayment.amount)}</td>
                      <td>
                        {PAYMENT_MODE_LABELS[repayment.paymentMode as keyof typeof PAYMENT_MODE_LABELS] ||
                          repayment.paymentMode}
                      </td>
                      <td>{formatDateTime(repayment.paymentDate)}</td>
                      <td>{repayment.collectorName || '-'}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="btn-icon btn-icon--success"
                            title="Approve"
                            onClick={() => openApproveModal(repayment)}
                          >
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                          <button
                            className="btn-icon btn-icon--danger"
                            title="Reject"
                            onClick={() => openRejectModal(repayment)}
                          >
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                          <button
                            className="btn-icon"
                            title="View Details"
                            onClick={() => navigate(`/repayment/${repayment.id}`)}
                          >
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage + 1} of {totalPages} ({totalElements} items)
                </span>
                <button
                  className="pagination-btn"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal__header">
              <h3 className="modal__title">
                {selectedRepayment ? 'Approve Repayment' : `Approve ${selectedIds.size} Repayments`}
              </h3>
              <button className="modal__close" onClick={() => setShowApproveModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="modal__body">
              {selectedRepayment ? (
                <p className="modal__message">
                  Are you sure you want to approve this repayment of{' '}
                  <strong>{formatCurrency(selectedRepayment.amount)}</strong> from{' '}
                  <strong>{selectedRepayment.customerName}</strong>?
                </p>
              ) : (
                <p className="modal__message">
                  Are you sure you want to approve <strong>{selectedIds.size} repayments</strong> with a
                  total value of <strong>{formatCurrency(getTotalSelectedAmount())}</strong>?
                </p>
              )}
              <div className="form-field">
                <label className="form-label">Comments (optional)</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                  placeholder="Add any approval comments..."
                />
              </div>
            </div>
            <div className="modal__footer">
              <button className="btn-secondary" onClick={() => setShowApproveModal(false)} disabled={isProcessing}>
                Cancel
              </button>
              <button className="btn-success" onClick={handleApprove} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal__header">
              <h3 className="modal__title">
                {selectedRepayment ? 'Reject Repayment' : `Reject ${selectedIds.size} Repayments`}
              </h3>
              <button className="modal__close" onClick={() => setShowRejectModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="modal__body">
              {selectedRepayment ? (
                <p className="modal__message">
                  Are you sure you want to reject this repayment of{' '}
                  <strong>{formatCurrency(selectedRepayment.amount)}</strong> from{' '}
                  <strong>{selectedRepayment.customerName}</strong>?
                </p>
              ) : (
                <p className="modal__message">
                  Are you sure you want to reject <strong>{selectedIds.size} repayments</strong> with a
                  total value of <strong>{formatCurrency(getTotalSelectedAmount())}</strong>?
                </p>
              )}
              <div className="form-field">
                <label className="form-label">Rejection Reason (required)</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  required
                />
              </div>
            </div>
            <div className="modal__footer">
              <button className="btn-secondary" onClick={() => setShowRejectModal(false)} disabled={isProcessing}>
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={handleReject}
                disabled={isProcessing || !rejectionReason.trim()}
              >
                {isProcessing ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RepaymentApprovalPage
