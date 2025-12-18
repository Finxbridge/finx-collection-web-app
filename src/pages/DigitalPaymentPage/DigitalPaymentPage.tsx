/**
 * Digital Payment Page
 * Initiate digital payments via QR, Payment Link, or Collect Request
 */

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { digitalPaymentService, repaymentService } from '@services/api'
import type { PaymentServiceType, PaymentResponse, InstrumentType, Repayment } from '@types'
import { PAYMENT_SERVICE_TYPE_LABELS, DIGITAL_PAYMENT_STATUS_LABELS } from '@types'
import './DigitalPaymentPage.css'

export function DigitalPaymentPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Form state
  const [serviceType, setServiceType] = useState<PaymentServiceType>('DYNAMIC_QR')
  const [amount, setAmount] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [instrumentType, setInstrumentType] = useState<InstrumentType>('VPA')
  const [instrumentReference, setInstrumentReference] = useState('')
  const [message, setMessage] = useState('')
  const [caseId, setCaseId] = useState('')
  const [loanAccountNumber, setLoanAccountNumber] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')

  // Pre-fill form from URL query parameters (when coming from Workflow)
  useEffect(() => {
    const urlCaseId = searchParams.get('caseId')
    const urlLoanAccountNumber = searchParams.get('loanAccountNumber')
    const urlCustomerName = searchParams.get('customerName')

    if (urlCaseId) setCaseId(urlCaseId)
    if (urlLoanAccountNumber) setLoanAccountNumber(urlLoanAccountNumber)
    if (urlCustomerName) setCustomerName(urlCustomerName)
  }, [searchParams])

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [receiptDetails, setReceiptDetails] = useState<Repayment | null>(null)
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false)
  const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setPaymentResponse(null)

    // Validation
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (serviceType === 'PAYMENT_LINK' && !mobileNumber) {
      setError('Mobile number is required for Payment Link')
      return
    }

    if (serviceType === 'COLLECT_CALL' && (!instrumentType || !instrumentReference)) {
      setError('Instrument type and reference are required for Collect Request')
      return
    }

    try {
      setIsLoading(true)

      const request = {
        serviceType,
        amount: parseFloat(amount),
        mobileNumber: mobileNumber || undefined,
        instrumentType: serviceType === 'COLLECT_CALL' ? instrumentType : undefined,
        instrumentReference: serviceType === 'COLLECT_CALL' ? instrumentReference : undefined,
        message: message || undefined,
        caseId: caseId ? parseInt(caseId) : undefined,
        loanAccountNumber: loanAccountNumber || undefined,
        customerName: customerName || undefined,
        customerEmail: customerEmail || undefined,
      }

      const response = await digitalPaymentService.initiate(request)
      setPaymentResponse(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate payment')
    } finally {
      setIsLoading(false)
    }
  }

  const checkPaymentStatus = async () => {
    if (!paymentResponse) return

    try {
      setIsPolling(true)
      const response = await digitalPaymentService.checkStatus({
        serviceType: paymentResponse.serviceType,
        transactionId: paymentResponse.transactionId,
      })

      // Preserve QR code data if status is still pending and API didn't return it
      const updatedResponse = {
        ...response,
        qrCodeBase64: response.qrCodeBase64 || paymentResponse.qrCodeBase64,
        qrCodeUrl: response.qrCodeUrl || paymentResponse.qrCodeUrl,
        paymentLink: response.paymentLink || paymentResponse.paymentLink,
      }
      setPaymentResponse(updatedResponse)

      // If payment is successful, generate and fetch receipt
      if (response.status === 'SUCCESS' || response.status === 'COMPLETED') {
        await handleGenerateReceipt(response.transactionId)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check payment status')
    } finally {
      setIsPolling(false)
    }
  }

  const handleGenerateReceipt = async (transactionId: string) => {
    try {
      setIsGeneratingReceipt(true)
      // Generate receipt first
      const generatedReceipt = await digitalPaymentService.generateReceipt(transactionId)

      // Then fetch receipt details
      if (generatedReceipt && generatedReceipt.id) {
        const details = await repaymentService.getReceiptDetails(generatedReceipt.id)
        setReceiptDetails(details)
      } else {
        setReceiptDetails(generatedReceipt)
      }
    } catch (err) {
      console.error('Failed to generate receipt:', err)
      // Don't show error to user - receipt generation may not be available
    } finally {
      setIsGeneratingReceipt(false)
    }
  }

  const handleDownloadReceipt = async () => {
    if (!receiptDetails?.id && !paymentResponse?.transactionId) return

    try {
      setIsDownloadingReceipt(true)
      let blob: Blob

      if (receiptDetails?.id) {
        blob = await repaymentService.downloadReceipt(receiptDetails.id)
      } else if (paymentResponse?.transactionId) {
        blob = await digitalPaymentService.downloadReceipt(paymentResponse.transactionId)
      } else {
        return
      }

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `receipt_${receiptDetails?.repaymentNumber || paymentResponse?.transactionId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download receipt')
    } finally {
      setIsDownloadingReceipt(false)
    }
  }

  const handleCancel = async () => {
    if (!paymentResponse) return

    try {
      setIsLoading(true)
      await digitalPaymentService.cancel({
        serviceType: paymentResponse.serviceType,
        transactionId: paymentResponse.transactionId,
        reason: 'Cancelled by user',
      })
      setPaymentResponse(null)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel payment')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewPayment = () => {
    setPaymentResponse(null)
    setReceiptDetails(null)
    setAmount('')
    setMobileNumber('')
    setInstrumentReference('')
    setMessage('')
    // Keep customer details (caseId, loanAccountNumber, customerName) for repeat payments
    setError('')
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'badge--success'
      case 'PENDING':
      case 'INITIATED':
        return 'badge--warning'
      case 'FAILED':
      case 'CANCELLED':
      case 'EXPIRED':
        return 'badge--danger'
      case 'REFUNDED':
        return 'badge--info'
      default:
        return 'badge--default'
    }
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="digital-payment-page">
      {/* Header */}
      <div className="digital-payment-header">
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
        <div className="digital-payment-header__content">
          <h1 className="digital-payment-title">Digital Payment Collection</h1>
          <p className="digital-payment-subtitle">
            Collect payments via QR code, payment link, or UPI collect request
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert--error">
          <span>{error}</span>
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      <div className="digital-payment-content">
        {/* Payment Form */}
        {!paymentResponse && (
          <div className="payment-form-card">
            <div className="payment-form-card__header">
              <h2 className="payment-form-card__title">Initiate Payment</h2>
            </div>
            <form onSubmit={handleSubmit} className="payment-form">
              {/* Service Type Selection */}
              <div className="service-type-grid">
                {(['DYNAMIC_QR', 'PAYMENT_LINK', 'COLLECT_CALL'] as PaymentServiceType[]).map(
                  (type) => (
                    <button
                      key={type}
                      type="button"
                      className={`service-type-card ${serviceType === type ? 'service-type-card--active' : ''}`}
                      onClick={() => setServiceType(type)}
                    >
                      <div className="service-type-card__icon">
                        {type === 'DYNAMIC_QR' && (
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                            <rect x="14" y="14" width="3" height="3" stroke="currentColor" strokeWidth="2" />
                            <rect x="18" y="18" width="3" height="3" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        )}
                        {type === 'PAYMENT_LINK' && (
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M10 13C10.4295 13.5741 10.9774 14.0492 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9404 15.7513 14.6898C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59699 21.9548 8.33398 21.9434 7.02299C21.932 5.71199 21.4061 4.4583 20.479 3.52113C19.5518 2.58395 18.3044 2.04617 17.0004 2.03077C15.6964 2.01537 14.4334 2.51539 13.49 3.42L11.75 5.15"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M14 11C13.5705 10.4259 13.0226 9.9508 12.3934 9.60705C11.7643 9.2633 11.0685 9.05889 10.3533 9.00768C9.63821 8.95648 8.92039 9.05963 8.24869 9.31021C7.57698 9.5608 6.96692 9.95304 6.46 10.46L3.46 13.46C2.54917 14.403 2.04517 15.666 2.05656 16.977C2.06796 18.288 2.59388 19.5417 3.52105 20.4789C4.44823 21.416 5.69565 21.9538 6.99965 21.9692C8.30366 21.9846 9.56659 21.4846 10.51 20.58L12.24 18.85"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                        {type === 'COLLECT_CALL' && (
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M22 16.92V19.92C22 20.483 21.7893 21.0236 21.4142 21.4287C21.0391 21.8338 20.5304 22.0705 20 22.12C19.2864 22.1962 18.5689 22.2314 17.85 22.22C10.83 21.67 4.33 18.36 0 13.07C3.47 8.8 8.41 5.94 14 5.07C14.1114 5.05317 14.2243 5.04467 14.3375 5.04467C14.4507 5.04467 14.5636 5.05317 14.675 5.07C17.8372 5.43481 20.777 6.79655 23.05 8.95C23.6419 9.49168 23.9842 10.2399 24 11.03V16.92C24 17.8574 23.6279 18.7562 22.9672 19.4169C22.3064 20.0777 21.4074 20.45 20.47 20.45"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="service-type-card__label">
                        {PAYMENT_SERVICE_TYPE_LABELS[type]}
                      </span>
                    </button>
                  )
                )}
              </div>

              {/* Amount */}
              <div className="form-field">
                <label className="form-label">Amount (INR) *</label>
                <input
                  type="number"
                  className="form-input form-input--large"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="1"
                  required
                />
              </div>

              {/* Conditional Fields */}
              {serviceType === 'PAYMENT_LINK' && (
                <div className="form-field">
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="10-digit mobile number"
                    pattern="[0-9]{10}"
                    required
                  />
                </div>
              )}

              {serviceType === 'COLLECT_CALL' && (
                <>
                  <div className="form-row">
                    <div className="form-field">
                      <label className="form-label">Instrument Type *</label>
                      <select
                        className="form-select"
                        value={instrumentType}
                        onChange={(e) => setInstrumentType(e.target.value as InstrumentType)}
                        required
                      >
                        <option value="VPA">UPI VPA</option>
                        <option value="MOBILE">Mobile Number</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label className="form-label">
                        {instrumentType === 'VPA' ? 'UPI ID' : 'Mobile Number'} *
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={instrumentReference}
                        onChange={(e) => setInstrumentReference(e.target.value)}
                        placeholder={instrumentType === 'VPA' ? 'user@upi' : '10-digit mobile'}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Customer Details */}
              <div className="form-section">
                <h3 className="form-section__title">Customer Details (Optional)</h3>
                <div className="form-row">
                  <div className="form-field">
                    <label className="form-label">Case ID</label>
                    <input
                      type="number"
                      className="form-input"
                      value={caseId}
                      onChange={(e) => setCaseId(e.target.value)}
                      placeholder="Case ID"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Loan Account Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={loanAccountNumber}
                      onChange={(e) => setLoanAccountNumber(e.target.value)}
                      placeholder="Loan account number"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label className="form-label">Customer Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Customer name"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Customer Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="customer@email.com"
                    />
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="form-field">
                <label className="form-label">Message (Optional)</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a message for the customer..."
                />
              </div>

              <button type="submit" className="btn-primary btn-primary--full" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Initiate Payment'}
              </button>
            </form>
          </div>
        )}

        {/* Payment Response */}
        {paymentResponse && (
          <div className="payment-response-card">
            <div className="payment-response-card__header">
              <h2 className="payment-response-card__title">Payment Details</h2>
              <span className={`badge badge--large ${getStatusBadgeClass(paymentResponse.status)}`}>
                {DIGITAL_PAYMENT_STATUS_LABELS[paymentResponse.status as keyof typeof DIGITAL_PAYMENT_STATUS_LABELS] ||
                  paymentResponse.status}
              </span>
            </div>

            <div className="payment-response-card__body">
              {/* Check Status Section - shown when payment is not in a final state */}
              {!['SUCCESS', 'COMPLETED', 'FAILED', 'CANCELLED', 'EXPIRED', 'REFUNDED'].includes(paymentResponse.status) && (
                <div className="payment-initiated-section">
                  <div className="payment-initiated-message">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>
                      {paymentResponse.serviceType === 'DYNAMIC_QR' && 'Dynamic QR Generated Successfully'}
                      {paymentResponse.serviceType === 'PAYMENT_LINK' && 'Payment Link Generated Successfully'}
                      {paymentResponse.serviceType === 'COLLECT_CALL' && 'Collect Request Sent Successfully'}
                    </span>
                  </div>
                  <button
                    className="btn-check-status"
                    onClick={checkPaymentStatus}
                    disabled={isPolling}
                  >
                    {isPolling ? 'Checking...' : 'Check Status'}
                  </button>
                </div>
              )}

              {/* QR Code - show when payment is not in a final state */}
              {paymentResponse.qrCodeBase64 && !['SUCCESS', 'COMPLETED', 'FAILED', 'CANCELLED', 'EXPIRED', 'REFUNDED'].includes(paymentResponse.status) && (
                <div className="qr-code-container">
                  <img
                    src={`data:image/png;base64,${paymentResponse.qrCodeBase64}`}
                    alt="Payment QR Code"
                    className="qr-code"
                  />
                  <p className="qr-code-hint">Scan this QR code to pay</p>
                </div>
              )}

              {/* Payment Link */}
              {paymentResponse.paymentLink && (
                <div className="payment-link-container">
                  <label className="form-label">Payment Link</label>
                  <div className="payment-link-input">
                    <input
                      type="text"
                      className="form-input"
                      value={paymentResponse.paymentLink}
                      readOnly
                    />
                    <button
                      className="btn-icon"
                      onClick={() => navigator.clipboard.writeText(paymentResponse.paymentLink!)}
                      title="Copy to clipboard"
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
                        <path
                          d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Transaction Details */}
              <div className="transaction-details">
                <div className="transaction-detail">
                  <span className="transaction-detail__label">Transaction ID</span>
                  <span className="transaction-detail__value">{paymentResponse.transactionId}</span>
                </div>
                <div className="transaction-detail">
                  <span className="transaction-detail__label">Amount</span>
                  <span className="transaction-detail__value transaction-detail__value--amount">
                    {formatCurrency(paymentResponse.amount)}
                  </span>
                </div>
                <div className="transaction-detail">
                  <span className="transaction-detail__label">Service Type</span>
                  <span className="transaction-detail__value">
                    {PAYMENT_SERVICE_TYPE_LABELS[paymentResponse.serviceType]}
                  </span>
                </div>
                {paymentResponse.expiresAt && (
                  <div className="transaction-detail">
                    <span className="transaction-detail__label">Expires At</span>
                    <span className="transaction-detail__value">
                      {new Date(paymentResponse.expiresAt).toLocaleString()}
                    </span>
                  </div>
                )}
                {paymentResponse.message && (
                  <div className="transaction-detail">
                    <span className="transaction-detail__label">Message</span>
                    <span className="transaction-detail__value">{paymentResponse.message}</span>
                  </div>
                )}
              </div>

              {/* Receipt Section - shown when payment is successful */}
              {['SUCCESS', 'COMPLETED'].includes(paymentResponse.status) && (
                <div className="receipt-section">
                  <div className="receipt-section__header">
                    <div className="receipt-section__icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="receipt-section__title-wrap">
                      <h3 className="receipt-section__title">Payment Successful</h3>
                      <p className="receipt-section__subtitle">Your payment has been processed successfully</p>
                    </div>
                  </div>

                  {isGeneratingReceipt ? (
                    <div className="receipt-loading">
                      <span className="spinner-small"></span>
                      <span>Generating receipt...</span>
                    </div>
                  ) : receiptDetails ? (
                    <div className="receipt-details">
                      <div className="receipt-details__grid">
                        {receiptDetails.repaymentNumber && (
                          <div className="receipt-detail-item">
                            <span className="receipt-detail-item__label">Receipt Number</span>
                            <span className="receipt-detail-item__value">{receiptDetails.repaymentNumber}</span>
                          </div>
                        )}
                        {receiptDetails.paymentDate && (
                          <div className="receipt-detail-item">
                            <span className="receipt-detail-item__label">Payment Date</span>
                            <span className="receipt-detail-item__value">
                              {new Date(receiptDetails.paymentDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {receiptDetails.paymentMode && (
                          <div className="receipt-detail-item">
                            <span className="receipt-detail-item__label">Payment Mode</span>
                            <span className="receipt-detail-item__value">{receiptDetails.paymentMode}</span>
                          </div>
                        )}
                        {receiptDetails.amount && (
                          <div className="receipt-detail-item">
                            <span className="receipt-detail-item__label">Amount Paid</span>
                            <span className="receipt-detail-item__value receipt-detail-item__value--amount">
                              {formatCurrency(receiptDetails.amount)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="receipt-buttons-row">
                        <button
                          className="btn-view-receipt"
                          onClick={() => setShowReceiptModal(true)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          View Receipt
                        </button>
                        <button
                          className="btn-download-receipt"
                          onClick={handleDownloadReceipt}
                          disabled={isDownloadingReceipt}
                        >
                          {isDownloadingReceipt ? (
                            <>
                              <span className="spinner-small"></span>
                              Downloading...
                            </>
                          ) : (
                            <>
                              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              Download Receipt
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="btn-generate-receipt"
                      onClick={() => handleGenerateReceipt(paymentResponse.transactionId)}
                      disabled={isGeneratingReceipt}
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 18V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Generate Receipt
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="payment-response-card__footer">
              {!['SUCCESS', 'COMPLETED', 'FAILED', 'CANCELLED', 'EXPIRED', 'REFUNDED'].includes(paymentResponse.status) && (
                <button className="btn-secondary" onClick={handleCancel} disabled={isLoading}>
                  Cancel Payment
                </button>
              )}
              {['SUCCESS', 'COMPLETED', 'FAILED', 'CANCELLED', 'EXPIRED', 'REFUNDED'].includes(
                paymentResponse.status
              ) && (
                <button className="btn-primary" onClick={handleNewPayment}>
                  New Payment
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && receiptDetails && (
        <div className="receipt-modal-overlay" onClick={() => setShowReceiptModal(false)}>
          <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-modal__header">
              <h2 className="receipt-modal__title">Payment Receipt</h2>
              <button
                className="receipt-modal__close"
                onClick={() => setShowReceiptModal(false)}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="receipt-modal__body">
              <div className="receipt-modal__success-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="receipt-modal__status">Payment Successful</h3>

              <div className="receipt-modal__amount">
                {formatCurrency(receiptDetails.amount)}
              </div>

              <div className="receipt-modal__details">
                {receiptDetails.repaymentNumber && (
                  <div className="receipt-modal__detail-row">
                    <span className="receipt-modal__detail-label">Receipt Number</span>
                    <span className="receipt-modal__detail-value">{receiptDetails.repaymentNumber}</span>
                  </div>
                )}
                {paymentResponse?.transactionId && (
                  <div className="receipt-modal__detail-row">
                    <span className="receipt-modal__detail-label">Transaction ID</span>
                    <span className="receipt-modal__detail-value">{paymentResponse.transactionId}</span>
                  </div>
                )}
                {receiptDetails.paymentDate && (
                  <div className="receipt-modal__detail-row">
                    <span className="receipt-modal__detail-label">Payment Date</span>
                    <span className="receipt-modal__detail-value">
                      {new Date(receiptDetails.paymentDate).toLocaleString()}
                    </span>
                  </div>
                )}
                {receiptDetails.paymentMode && (
                  <div className="receipt-modal__detail-row">
                    <span className="receipt-modal__detail-label">Payment Mode</span>
                    <span className="receipt-modal__detail-value">{receiptDetails.paymentMode}</span>
                  </div>
                )}
                {receiptDetails.customerName && (
                  <div className="receipt-modal__detail-row">
                    <span className="receipt-modal__detail-label">Customer Name</span>
                    <span className="receipt-modal__detail-value">{receiptDetails.customerName}</span>
                  </div>
                )}
                {receiptDetails.loanAccountNumber && (
                  <div className="receipt-modal__detail-row">
                    <span className="receipt-modal__detail-label">Loan Account</span>
                    <span className="receipt-modal__detail-value">{receiptDetails.loanAccountNumber}</span>
                  </div>
                )}
                {receiptDetails.caseNumber && (
                  <div className="receipt-modal__detail-row">
                    <span className="receipt-modal__detail-label">Case Number</span>
                    <span className="receipt-modal__detail-value">{receiptDetails.caseNumber}</span>
                  </div>
                )}
                {receiptDetails.status && (
                  <div className="receipt-modal__detail-row">
                    <span className="receipt-modal__detail-label">Status</span>
                    <span className="receipt-modal__detail-value receipt-modal__detail-value--success">
                      {receiptDetails.status}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="receipt-modal__footer">
              <button
                className="btn-download-receipt"
                onClick={handleDownloadReceipt}
                disabled={isDownloadingReceipt}
              >
                {isDownloadingReceipt ? (
                  <>
                    <span className="spinner-small"></span>
                    Downloading...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Download PDF
                  </>
                )}
              </button>
              <button
                className="btn-secondary"
                onClick={() => setShowReceiptModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DigitalPaymentPage
