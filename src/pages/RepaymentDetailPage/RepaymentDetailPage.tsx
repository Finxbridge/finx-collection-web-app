/**
 * Repayment Detail Page
 * View repayment details with approval/rejection actions
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { repaymentService } from '@services/api'
import type { Repayment } from '@types'
import { REPAYMENT_STATUS_LABELS, PAYMENT_MODE_LABELS } from '@types'
import './RepaymentDetailPage.css'

export function RepaymentDetailPage() {
  const navigate = useNavigate()
  const { repaymentId } = useParams<{ repaymentId: string }>()

  const [repayment, setRepayment] = useState<Repayment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [approvalComments, setApprovalComments] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  const fetchRepayment = useCallback(async () => {
    if (!repaymentId) return

    try {
      setIsLoading(true)
      setError('')
      const data = await repaymentService.getById(parseInt(repaymentId))
      setRepayment(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch repayment')
    } finally {
      setIsLoading(false)
    }
  }, [repaymentId])

  useEffect(() => {
    fetchRepayment()
  }, [fetchRepayment])

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDateTime = (dateStr?: string): string => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'badge--success'
      case 'PENDING':
        return 'badge--warning'
      case 'REJECTED':
        return 'badge--danger'
      case 'REVERSED':
        return 'badge--info'
      default:
        return 'badge--default'
    }
  }

  const handleApprove = async () => {
    if (!repayment) return

    try {
      setIsProcessing(true)
      await repaymentService.approve(repayment.id, approvalComments || undefined)
      setShowApproveModal(false)
      setApprovalComments('')
      fetchRepayment()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve repayment')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!repayment || !rejectionReason.trim()) return

    try {
      setIsProcessing(true)
      await repaymentService.reject(repayment.id, rejectionReason)
      setShowRejectModal(false)
      setRejectionReason('')
      fetchRepayment()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject repayment')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadReceipt = async () => {
    if (!repayment) return

    try {
      const blob = await repaymentService.downloadReceipt(repayment.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `receipt-${repayment.repaymentNumber || repayment.id}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download receipt')
    }
  }

  if (isLoading) {
    return (
      <div className="repayment-detail-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Loading repayment details...</span>
        </div>
      </div>
    )
  }

  if (!repayment) {
    return (
      <div className="repayment-detail-page">
        <div className="error-container">
          <p>Repayment not found</p>
          <button className="btn-primary" onClick={() => navigate('/repayment')}>
            Back to Repayments
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="repayment-detail-page">
      {/* Header */}
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
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
        <div className="detail-header__content">
          <div className="detail-header__title-row">
            <h1 className="detail-title">
              {repayment.repaymentNumber || `Repayment #${repayment.id}`}
            </h1>
            <span className={`badge badge--large ${getStatusBadgeClass(repayment.status)}`}>
              {REPAYMENT_STATUS_LABELS[repayment.status] || repayment.status}
            </span>
          </div>
          <p className="detail-subtitle">
            Created on {formatDateTime(repayment.createdAt)}
          </p>
        </div>
        <div className="detail-header__actions">
          {repayment.status === 'PENDING' && (
            <>
              <button className="btn-danger" onClick={() => setShowRejectModal(true)}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Reject
              </button>
              <button className="btn-success" onClick={() => setShowApproveModal(true)}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Approve
              </button>
            </>
          )}
          {repayment.status === 'APPROVED' && (
            <button className="btn-secondary" onClick={handleDownloadReceipt}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="7 10 12 15 17 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Download Receipt
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert--error">
          <span>{error}</span>
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      {/* Main Content */}
      <div className="detail-grid">
        {/* Payment Information */}
        <div className="detail-card">
          <div className="detail-card__header">
            <h2 className="detail-card__title">Payment Information</h2>
          </div>
          <div className="detail-card__body">
            <div className="detail-amount">
              <span className="detail-amount__label">Amount</span>
              <span className="detail-amount__value">{formatCurrency(repayment.amount)}</span>
            </div>
            <div className="detail-fields">
              <div className="detail-field">
                <span className="detail-field__label">Payment Mode</span>
                <span className="detail-field__value">
                  {PAYMENT_MODE_LABELS[repayment.paymentMode as keyof typeof PAYMENT_MODE_LABELS] ||
                    repayment.paymentMode}
                </span>
              </div>
              <div className="detail-field">
                <span className="detail-field__label">Payment Date</span>
                <span className="detail-field__value">{formatDateTime(repayment.paymentDate)}</span>
              </div>
              <div className="detail-field">
                <span className="detail-field__label">Transaction Reference</span>
                <span className="detail-field__value">
                  {repayment.transactionReference || '-'}
                </span>
              </div>
              <div className="detail-field">
                <span className="detail-field__label">Collection Location</span>
                <span className="detail-field__value">
                  {repayment.collectionLocation || '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="detail-card">
          <div className="detail-card__header">
            <h2 className="detail-card__title">Customer Information</h2>
          </div>
          <div className="detail-card__body">
            <div className="detail-fields">
              <div className="detail-field">
                <span className="detail-field__label">Customer Name</span>
                <span className="detail-field__value">{repayment.customerName}</span>
              </div>
              <div className="detail-field">
                <span className="detail-field__label">Loan Account Number</span>
                <span className="detail-field__value detail-field__value--mono">
                  {repayment.loanAccountNumber || '-'}
                </span>
              </div>
              <div className="detail-field">
                <span className="detail-field__label">Case Number</span>
                <span className="detail-field__value detail-field__value--mono">
                  {repayment.caseNumber || `#${repayment.caseId}`}
                </span>
              </div>
              <div className="detail-field">
                <span className="detail-field__label">Collected By</span>
                <span className="detail-field__value">
                  {repayment.collectorName || '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Approval Information */}
        <div className="detail-card">
          <div className="detail-card__header">
            <h2 className="detail-card__title">Approval Information</h2>
          </div>
          <div className="detail-card__body">
            <div className="detail-fields">
              <div className="detail-field">
                <span className="detail-field__label">Approval Status</span>
                <span className={`badge ${getStatusBadgeClass(repayment.status)}`}>
                  {REPAYMENT_STATUS_LABELS[repayment.status] || repayment.status}
                </span>
              </div>
              <div className="detail-field">
                <span className="detail-field__label">Approved By</span>
                <span className="detail-field__value">
                  {repayment.approverName || '-'}
                </span>
              </div>
              <div className="detail-field">
                <span className="detail-field__label">Approved At</span>
                <span className="detail-field__value">{formatDateTime(repayment.approvedAt)}</span>
              </div>
              {repayment.rejectionReason && (
                <div className="detail-field detail-field--full">
                  <span className="detail-field__label">Rejection Reason</span>
                  <span className="detail-field__value detail-field__value--error">
                    {repayment.rejectionReason}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SLA & Reconciliation */}
        <div className="detail-card">
          <div className="detail-card__header">
            <h2 className="detail-card__title">SLA & Reconciliation</h2>
          </div>
          <div className="detail-card__body">
            <div className="detail-fields">
              <div className="detail-field">
                <span className="detail-field__label">Deposit SLA Status</span>
                <span className="detail-field__value">
                  {repayment.depositSlaStatus || '-'}
                </span>
              </div>
              <div className="detail-field">
                <span className="detail-field__label">SLA Breach Hours</span>
                <span className={`detail-field__value ${repayment.depositSlaBreachHours ? 'detail-field__value--error' : ''}`}>
                  {repayment.depositSlaBreachHours ? `${repayment.depositSlaBreachHours}h` : '-'}
                </span>
              </div>
              <div className="detail-field">
                <span className="detail-field__label">Reconciliation Status</span>
                <span className={`badge ${repayment.isReconciled ? 'badge--success' : 'badge--warning'}`}>
                  {repayment.isReconciled ? 'Reconciled' : 'Pending'}
                </span>
              </div>
              <div className="detail-field">
                <span className="detail-field__label">OTS Payment</span>
                <span className="detail-field__value">
                  {repayment.isOtsPayment ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {repayment.notes && (
          <div className="detail-card detail-card--full">
            <div className="detail-card__header">
              <h2 className="detail-card__title">Notes</h2>
            </div>
            <div className="detail-card__body">
              <p className="detail-notes">{repayment.notes}</p>
            </div>
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal__header">
              <h3 className="modal__title">Approve Repayment</h3>
              <button className="modal__close" onClick={() => setShowApproveModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="modal__body">
              <p className="modal__message">
                Are you sure you want to approve this repayment of{' '}
                <strong>{formatCurrency(repayment.amount)}</strong> from{' '}
                <strong>{repayment.customerName}</strong>?
              </p>
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
              <h3 className="modal__title">Reject Repayment</h3>
              <button className="modal__close" onClick={() => setShowRejectModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="modal__body">
              <p className="modal__message">
                Are you sure you want to reject this repayment of{' '}
                <strong>{formatCurrency(repayment.amount)}</strong> from{' '}
                <strong>{repayment.customerName}</strong>?
              </p>
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

export default RepaymentDetailPage
