/**
 * Unallocated Case Detail Page
 * View detailed information of an unallocated case
 */

import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { caseSourcingService } from '@services/api'
import { ROUTES } from '@config/constants'
import type { UnallocatedCaseDetail } from '@types'
import './UnallocatedCaseDetailPage.css'

export function UnallocatedCaseDetailPage() {
  const { caseId } = useParams<{ caseId: string }>()
  const navigate = useNavigate()

  const [caseDetail, setCaseDetail] = useState<UnallocatedCaseDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchCaseDetail = useCallback(async () => {
    if (!caseId) return

    try {
      setIsLoading(true)
      setError('')

      const data = await caseSourcingService.getUnallocatedCaseDetail(parseInt(caseId))
      setCaseDetail(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch case details')
    } finally {
      setIsLoading(false)
    }
  }, [caseId])

  useEffect(() => {
    fetchCaseDetail()
  }, [fetchCaseDetail])

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getBucketBadgeClass = (bucket: string): string => {
    if (bucket.includes('90')) return 'bucket-badge--danger'
    if (bucket.includes('60')) return 'bucket-badge--warning'
    if (bucket.includes('30')) return 'bucket-badge--info'
    return 'bucket-badge--default'
  }

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'UNALLOCATED': return 'status-badge--warning'
      case 'ALLOCATED': return 'status-badge--info'
      case 'IN_PROGRESS': return 'status-badge--primary'
      case 'RESOLVED': return 'status-badge--success'
      case 'CLOSED': return 'status-badge--default'
      default: return 'status-badge--default'
    }
  }

  if (isLoading) {
    return (
      <div className="unallocated-detail-page">
        <div className="unallocated-detail-page__loading">
          <div className="spinner"></div>
          <span>Loading case details...</span>
        </div>
      </div>
    )
  }

  if (!caseDetail) {
    return (
      <div className="unallocated-detail-page">
        <div className="unallocated-detail-page__error">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p>{error || 'Case not found'}</p>
          <button
            className="btn-primary"
            onClick={() => navigate(ROUTES.CASE_SOURCING_UNALLOCATED)}
          >
            Back to Unallocated Cases
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="unallocated-detail-page">
      {/* Header */}
      <div className="unallocated-detail-page__header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <div className="unallocated-detail-page__header-content">
          <div>
            <h1 className="unallocated-detail-page__title">
              Case: {caseDetail.caseNumber}
            </h1>
            <p className="unallocated-detail-page__subtitle">
              External ID: {caseDetail.externalCaseId}
            </p>
          </div>
          <span className={`status-badge ${getStatusBadgeClass(caseDetail.status)}`}>
            {caseDetail.status}
          </span>
        </div>
      </div>

      {error && (
        <div className="alert alert--error">
          <span>{error}</span>
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      <div className="unallocated-detail-page__content">
        {/* Customer Information Section */}
        <div className="detail-card">
          <div className="detail-card__header">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <h2>Customer Information</h2>
          </div>
          <div className="detail-card__body">
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-item__label">Customer Code</span>
                <span className="detail-item__value">{caseDetail.customer.customerCode}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item__label">Name</span>
                <span className="detail-item__value">{caseDetail.customer.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item__label">Mobile</span>
                <span className="detail-item__value">{caseDetail.customer.mobile}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item__label">Email</span>
                <span className="detail-item__value">{caseDetail.customer.email || '-'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item__label">City</span>
                <span className="detail-item__value">{caseDetail.customer.city || '-'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item__label">State</span>
                <span className="detail-item__value">{caseDetail.customer.state || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Loan Information Section */}
        <div className="detail-card">
          <div className="detail-card__header">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M2 10H22" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <h2>Loan Details</h2>
          </div>
          <div className="detail-card__body">
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-item__label">Loan Account Number</span>
                <span className="detail-item__value highlight">{caseDetail.loanDetails.loanAccountNumber}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item__label">Product Type</span>
                <span className="detail-item__value">{caseDetail.loanDetails.productType || '-'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item__label">Total Outstanding</span>
                <span className="detail-item__value currency">{formatCurrency(caseDetail.loanDetails.totalOutstanding)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item__label">DPD (Days Past Due)</span>
                <span className="detail-item__value dpd">{caseDetail.loanDetails.dpd}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item__label">Bucket</span>
                <span className={`bucket-badge ${getBucketBadgeClass(caseDetail.loanDetails.bucket || '')}`}>
                  {caseDetail.loanDetails.bucket || '-'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-item__label">Geography Code</span>
                <span className="detail-item__value">{caseDetail.geographyCode || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Case Information Section */}
        <div className="detail-card">
          <div className="detail-card__header">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h2>Case Information</h2>
          </div>
          <div className="detail-card__body">
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-item__label">Case ID</span>
                <span className="detail-item__value">{caseDetail.id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item__label">Case Number</span>
                <span className="detail-item__value highlight">{caseDetail.caseNumber}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item__label">External Case ID</span>
                <span className="detail-item__value">{caseDetail.externalCaseId}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item__label">Status</span>
                <span className={`status-badge ${getStatusBadgeClass(caseDetail.status)}`}>
                  {caseDetail.status}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-item__label">Created At</span>
                <span className="detail-item__value">{formatDate(caseDetail.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UnallocatedCaseDetailPage
