/**
 * Reconciliation Page
 * Manage pending reconciliation with bulk actions
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { repaymentService } from '@services/api'
import type { ReconciliationDTO, PageResponse } from '@types'
import { PAYMENT_MODE_LABELS } from '@types'
import './ReconciliationPage.css'

export function ReconciliationPage() {
  const navigate = useNavigate()

  const [items, setItems] = useState<ReconciliationDTO[]>([])
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
  const [showReconcileModal, setShowReconcileModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ReconciliationDTO | null>(null)
  const [bankReferenceNumber, setBankReferenceNumber] = useState('')
  const [discrepancyAmount, setDiscrepancyAmount] = useState('')
  const [discrepancyNotes, setDiscrepancyNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchPendingReconciliation = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')

      const response: PageResponse<ReconciliationDTO> = await repaymentService.getPendingReconciliation(
        currentPage,
        pageSize
      )
      setItems(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reconciliation data')
    } finally {
      setIsLoading(false)
    }
  }, [currentPage])

  useEffect(() => {
    fetchPendingReconciliation()
  }, [fetchPendingReconciliation])

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map((i) => i.repaymentId)))
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

  const openReconcileModal = (item?: ReconciliationDTO) => {
    setSelectedItem(item || null)
    setBankReferenceNumber('')
    setDiscrepancyAmount('')
    setDiscrepancyNotes('')
    setShowReconcileModal(true)
  }

  const handleReconcile = async () => {
    try {
      setIsProcessing(true)
      setError('')

      if (selectedItem) {
        // Single reconciliation
        await repaymentService.updateReconciliation({
          repaymentId: selectedItem.repaymentId,
          isReconciled: true,
          bankReferenceNumber: bankReferenceNumber || undefined,
          discrepancyAmount: discrepancyAmount ? parseFloat(discrepancyAmount) : undefined,
          discrepancyNotes: discrepancyNotes || undefined,
        })
        setSuccessMessage('Repayment reconciled successfully')
      } else {
        // Bulk reconciliation
        const ids = Array.from(selectedIds)
        await repaymentService.bulkReconcile({
          repaymentIds: ids,
          isReconciled: true,
          bankReferenceNumber: bankReferenceNumber || undefined,
        })
        setSuccessMessage(`${ids.length} repayments reconciled successfully`)
        setSelectedIds(new Set())
      }

      setShowReconcileModal(false)
      fetchPendingReconciliation()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reconcile')
    } finally {
      setIsProcessing(false)
    }
  }

  const getTotalSelectedAmount = () => {
    return items.filter((i) => selectedIds.has(i.repaymentId)).reduce((sum, i) => sum + i.amount, 0)
  }

  return (
    <div className="reconciliation-page">
      {/* Header */}
      <div className="reconciliation-header">
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
        <div className="reconciliation-header__content">
          <h1 className="reconciliation-title">Reconciliation</h1>
          <p className="reconciliation-subtitle">{totalElements} items pending reconciliation</p>
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
            <button className="btn-primary" onClick={() => openReconcileModal()}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Mark as Reconciled
            </button>
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="table-card">
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <span>Loading reconciliation data...</span>
          </div>
        ) : items.length === 0 ? (
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
            <p>No pending reconciliation</p>
            <span>All repayments have been reconciled</span>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="reconciliation-table">
                <thead>
                  <tr>
                    <th className="th-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === items.length && items.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Repayment #</th>
                    <th>Customer</th>
                    <th>Case ID</th>
                    <th>Amount</th>
                    <th>Payment Mode</th>
                    <th>Payment Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.repaymentId}
                      className={selectedIds.has(item.repaymentId) ? 'row--selected' : ''}
                    >
                      <td className="td-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.repaymentId)}
                          onChange={() => handleSelectOne(item.repaymentId)}
                        />
                      </td>
                      <td
                        className="cell-link"
                        onClick={() => navigate(`/repayment/${item.repaymentId}`)}
                      >
                        {item.repaymentNumber}
                      </td>
                      <td>{item.customerName}</td>
                      <td className="cell-mono">#{item.caseId}</td>
                      <td className="cell-amount">{formatCurrency(item.amount)}</td>
                      <td>
                        {PAYMENT_MODE_LABELS[item.paymentMode as keyof typeof PAYMENT_MODE_LABELS] ||
                          item.paymentMode}
                      </td>
                      <td>{formatDate(item.paymentDate)}</td>
                      <td>
                        <span className={`badge ${item.isReconciled ? 'badge--success' : 'badge--warning'}`}>
                          {item.isReconciled ? 'Reconciled' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="btn-icon btn-icon--primary"
                            title="Reconcile"
                            onClick={() => openReconcileModal(item)}
                          >
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                          <button
                            className="btn-icon"
                            title="View Details"
                            onClick={() => navigate(`/repayment/${item.repaymentId}`)}
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

      {/* Reconcile Modal */}
      {showReconcileModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal__header">
              <h3 className="modal__title">
                {selectedItem ? 'Reconcile Repayment' : `Reconcile ${selectedIds.size} Repayments`}
              </h3>
              <button className="modal__close" onClick={() => setShowReconcileModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="modal__body">
              {selectedItem ? (
                <div className="reconcile-summary">
                  <div className="reconcile-summary__row">
                    <span>Repayment #:</span>
                    <strong>{selectedItem.repaymentNumber}</strong>
                  </div>
                  <div className="reconcile-summary__row">
                    <span>Customer:</span>
                    <strong>{selectedItem.customerName}</strong>
                  </div>
                  <div className="reconcile-summary__row">
                    <span>Amount:</span>
                    <strong className="text-success">{formatCurrency(selectedItem.amount)}</strong>
                  </div>
                </div>
              ) : (
                <p className="modal__message">
                  Mark <strong>{selectedIds.size} repayments</strong> with a total value of{' '}
                  <strong>{formatCurrency(getTotalSelectedAmount())}</strong> as reconciled?
                </p>
              )}

              <div className="form-field">
                <label className="form-label">Bank Reference Number (optional)</label>
                <input
                  type="text"
                  className="form-input"
                  value={bankReferenceNumber}
                  onChange={(e) => setBankReferenceNumber(e.target.value)}
                  placeholder="Enter bank reference number"
                />
              </div>

              {selectedItem && (
                <>
                  <div className="form-field">
                    <label className="form-label">Discrepancy Amount (optional)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={discrepancyAmount}
                      onChange={(e) => setDiscrepancyAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Discrepancy Notes (optional)</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      value={discrepancyNotes}
                      onChange={(e) => setDiscrepancyNotes(e.target.value)}
                      placeholder="Add any notes about discrepancies..."
                    />
                  </div>
                </>
              )}
            </div>
            <div className="modal__footer">
              <button className="btn-secondary" onClick={() => setShowReconcileModal(false)} disabled={isProcessing}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleReconcile} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Mark as Reconciled'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReconciliationPage
