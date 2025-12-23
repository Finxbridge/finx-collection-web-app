/**
 * Record Payment Page
 * Form for recording Cash/Cheque payments
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { repaymentService } from '@services/api'
import type { CreateRepaymentRequest, Repayment } from '@types'
import './RecordPaymentPage.css'

type PaymentMode = 'CASH' | 'CHEQUE'

export function RecordPaymentPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Form state
  const [caseId, setCaseId] = useState('')
  const [loanAccountNumber, setLoanAccountNumber] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH')
  const [paymentDate, setPaymentDate] = useState('')
  const [collectionLocation, setCollectionLocation] = useState('')
  const [notes, setNotes] = useState('')

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successResponse, setSuccessResponse] = useState<Repayment | null>(null)

  // Populate from URL params (when coming from workflow)
  useEffect(() => {
    const caseIdParam = searchParams.get('caseId')
    const loanAccountParam = searchParams.get('loanAccountNumber')
    const customerNameParam = searchParams.get('customerName')

    if (caseIdParam) setCaseId(caseIdParam)
    if (loanAccountParam) setLoanAccountNumber(loanAccountParam)
    if (customerNameParam) setCustomerName(customerNameParam)

    // Set default payment date to today
    const today = new Date().toISOString().split('T')[0]
    setPaymentDate(today)
  }, [searchParams])

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!caseId) {
      setError('Case ID is required')
      return
    }
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      setError('Please enter a valid payment amount')
      return
    }
    if (!paymentDate) {
      setError('Payment date is required')
      return
    }

    try {
      setIsSubmitting(true)

      const request: CreateRepaymentRequest = {
        caseId: parseInt(caseId, 10),
        paymentAmount: parseFloat(paymentAmount),
        paymentMode,
        paymentDate: `${paymentDate}T00:00:00`,
        collectionLocation: collectionLocation || undefined,
        notes: notes || undefined,
      }

      const response = await repaymentService.create(request)
      setSuccessResponse(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record payment')
    } finally {
      setIsSubmitting(false)
    }
  }, [caseId, paymentAmount, paymentMode, paymentDate, collectionLocation, notes])

  const handleNewPayment = () => {
    // Keep customer details, reset payment fields
    setPaymentAmount('')
    setPaymentDate(new Date().toISOString().split('T')[0])
    setNotes('')
    setSuccessResponse(null)
    setError('')
  }

  const handleViewRepayment = () => {
    if (successResponse) {
      navigate(`/repayment/${successResponse.id}`)
    }
  }

  return (
    <div className="record-payment-page">
      {/* Header */}
      <div className="record-payment-header">
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
        <div className="record-payment-header__content">
          <h1 className="record-payment-title">Record Payment</h1>
          <p className="record-payment-subtitle">Record Cash or Cheque payments for cases</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert--error">
          <span>{error}</span>
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      {/* Success View */}
      {successResponse ? (
        <div className="payment-success-card">
          <div className="payment-success-card__header">
            <div className="payment-success-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="payment-success-info">
              <h2 className="payment-success-title">Payment Recorded Successfully</h2>
              <p className="payment-success-subtitle">
                Your payment has been submitted for approval
              </p>
            </div>
          </div>

          <div className="payment-success-body">
            <div className="payment-success-amount">
              {formatCurrency(successResponse.amount)}
            </div>
            <span className="badge badge--warning badge--large">
              {successResponse.status}
            </span>

            <div className="payment-success-details">
              <div className="payment-detail-row">
                <span className="payment-detail-label">Repayment Number</span>
                <span className="payment-detail-value">
                  {successResponse.repaymentNumber || `#${successResponse.id}`}
                </span>
              </div>
              <div className="payment-detail-row">
                <span className="payment-detail-label">Customer Name</span>
                <span className="payment-detail-value">{successResponse.customerName}</span>
              </div>
              <div className="payment-detail-row">
                <span className="payment-detail-label">Case ID</span>
                <span className="payment-detail-value">{successResponse.caseId}</span>
              </div>
              {successResponse.loanAccountNumber && (
                <div className="payment-detail-row">
                  <span className="payment-detail-label">Loan Account</span>
                  <span className="payment-detail-value">{successResponse.loanAccountNumber}</span>
                </div>
              )}
              <div className="payment-detail-row">
                <span className="payment-detail-label">Payment Mode</span>
                <span className="payment-detail-value">{successResponse.paymentMode}</span>
              </div>
              <div className="payment-detail-row">
                <span className="payment-detail-label">Payment Date</span>
                <span className="payment-detail-value">
                  {formatDateTime(successResponse.paymentDate)}
                </span>
              </div>
              {successResponse.collectionLocation && (
                <div className="payment-detail-row">
                  <span className="payment-detail-label">Collection Location</span>
                  <span className="payment-detail-value">{successResponse.collectionLocation}</span>
                </div>
              )}
              {successResponse.notes && (
                <div className="payment-detail-row">
                  <span className="payment-detail-label">Notes</span>
                  <span className="payment-detail-value">{successResponse.notes}</span>
                </div>
              )}
            </div>
          </div>

          <div className="payment-success-footer">
            <button className="btn-secondary" onClick={handleNewPayment}>
              Record Another Payment
            </button>
            <button className="btn-primary" onClick={handleViewRepayment}>
              View Details
            </button>
          </div>
        </div>
      ) : (
        /* Payment Form */
        <div className="payment-form-card">
          <div className="payment-form-card__header">
            <h2 className="payment-form-card__title">Payment Details</h2>
          </div>

          <form className="payment-form" onSubmit={handleSubmit}>
            {/* Payment Mode Selection */}
            <div className="form-field">
              <label className="form-label">Payment Mode</label>
              <div className="payment-mode-grid">
                <button
                  type="button"
                  className={`payment-mode-card ${paymentMode === 'CASH' ? 'payment-mode-card--active' : ''}`}
                  onClick={() => setPaymentMode('CASH')}
                >
                  <div className="payment-mode-card__icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                      <path d="M6 12H6.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M18 12H18.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="payment-mode-card__label">Cash</span>
                </button>

                <button
                  type="button"
                  className={`payment-mode-card ${paymentMode === 'CHEQUE' ? 'payment-mode-card--active' : ''}`}
                  onClick={() => setPaymentMode('CHEQUE')}
                >
                  <div className="payment-mode-card__icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M2 10H22" stroke="currentColor" strokeWidth="2" />
                      <path d="M6 15H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="payment-mode-card__label">Cheque</span>
                </button>
              </div>
            </div>

            {/* Amount */}
            <div className="form-field">
              <label className="form-label">Payment Amount (INR)</label>
              <input
                type="number"
                className="form-input form-input--large"
                placeholder="0.00"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                min="0"
                step="0.01"
                required
              />
            </div>

            {/* Case Details Section */}
            <div className="form-section">
              <h3 className="form-section__title">Case Details</h3>
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Case ID</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter case ID"
                    value={caseId}
                    onChange={(e) => setCaseId(e.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Loan Account Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter loan account number"
                    value={loanAccountNumber}
                    onChange={(e) => setLoanAccountNumber(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Customer Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
            </div>

            {/* Payment Details Section */}
            <div className="form-section">
              <h3 className="form-section__title">Payment Information</h3>
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Payment Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Collection Location</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Office, Customer Home"
                    value={collectionLocation}
                    onChange={(e) => setCollectionLocation(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Notes (Optional)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Add any additional notes about this payment..."
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary btn-primary--full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-small"></span>
                  Recording Payment...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                    <path
                      d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Record Payment
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default RecordPaymentPage
