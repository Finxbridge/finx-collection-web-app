/**
 * Unallocated Case Detail Page
 * View details of a specific unallocated case
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { caseSourcingService } from '@services/api'
import { Button } from '@components/common/Button'
import { ROUTES } from '@config/constants'
import type { UnallocatedCaseDetail } from '@types'
import './UnallocatedCaseDetailPage.css'

export function UnallocatedCaseDetailPage() {
  const { caseId } = useParams<{ caseId: string }>()
  const navigate = useNavigate()

  const [caseDetail, setCaseDetail] = useState<UnallocatedCaseDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCaseDetail = async () => {
      if (!caseId) return

      try {
        setIsLoading(true)
        setError('')

        const data = await caseSourcingService.getUnallocatedCaseDetail(parseInt(caseId))
        setCaseDetail(data)
      } catch (err: unknown) {
        const errorObj = err as { message?: string }
        setError(errorObj?.message || 'Failed to fetch case details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCaseDetail()
  }, [caseId])

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
          <p>{error || 'Case not found'}</p>
          <Button onClick={() => navigate(ROUTES.CASE_SOURCING_UNALLOCATED)}>
            Back to Unallocated Cases
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="unallocated-detail-page">
      {/* Header */}
      <div className="unallocated-detail-page__header">
        <button className="back-button" onClick={() => navigate(ROUTES.CASE_SOURCING_UNALLOCATED)}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Unallocated Cases
        </button>
        <div className="unallocated-detail-page__header-content">
          <div>
            <h1 className="unallocated-detail-page__title">{caseDetail.caseNumber}</h1>
            <p className="unallocated-detail-page__subtitle">
              External ID: {caseDetail.externalCaseId}
            </p>
          </div>
          <div className="unallocated-detail-page__status">
            <span className="status-badge status-badge--warning">{caseDetail.status}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert--error">
          <span>{error}</span>
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      <div className="unallocated-detail-page__content">
        {/* Customer Information */}
        <div className="detail-card">
          <h2 className="detail-card__title">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Customer Information
          </h2>
          <div className="detail-card__grid">
            <div className="detail-item">
              <span className="detail-item__label">Name</span>
              <span className="detail-item__value">{caseDetail.customer.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Mobile</span>
              <span className="detail-item__value">{caseDetail.customer.mobile}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Customer ID</span>
              <span className="detail-item__value">{caseDetail.customer.id}</span>
            </div>
          </div>
        </div>

        {/* Loan Details */}
        <div className="detail-card">
          <h2 className="detail-card__title">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
              <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Loan Details
          </h2>
          <div className="detail-card__grid">
            <div className="detail-item detail-item--highlight">
              <span className="detail-item__label">Total Outstanding</span>
              <span className="detail-item__value detail-item__value--large">
                {formatCurrency(caseDetail.loanDetails.totalOutstanding)}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">DPD (Days Past Due)</span>
              <span className="detail-item__value">{caseDetail.loanDetails.dpd} days</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Bucket</span>
              <span className="detail-item__value">{caseDetail.loanDetails.bucket || '-'}</span>
            </div>
          </div>
        </div>

        {/* Case Information */}
        <div className="detail-card">
          <h2 className="detail-card__title">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Case Information
          </h2>
          <div className="detail-card__grid">
            <div className="detail-item">
              <span className="detail-item__label">Case Number</span>
              <span className="detail-item__value">{caseDetail.caseNumber}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">External Case ID</span>
              <span className="detail-item__value">{caseDetail.externalCaseId}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Status</span>
              <span className="detail-item__value">
                <span className="status-badge status-badge--warning">{caseDetail.status}</span>
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
  )
}

export default UnallocatedCaseDetailPage
