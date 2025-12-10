/**
 * Unallocated Cases Page
 * View and manage cases pending allocation
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { caseSourcingService } from '@services/api'
import { Table, Column } from '@components/common/Table'
import type { UnallocatedCaseSummary } from '@types'
import './UnallocatedCasesPage.css'

export function UnallocatedCasesPage() {
  const navigate = useNavigate()
  const [cases, setCases] = useState<UnallocatedCaseSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [totalElements, setTotalElements] = useState(0)

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setIsLoading(true)
        setError('')

        const response = await caseSourcingService.getUnallocatedCases()
        setCases(response.content || [])
        setTotalElements(response.totalElements || 0)
      } catch (err: unknown) {
        const errorObj = err as { message?: string; statusCode?: number }
        const errorMessage = errorObj?.message || 'Failed to fetch unallocated cases'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCases()
  }, [])

  const handleViewCase = (caseItem: UnallocatedCaseSummary) => {
    navigate(`/case-sourcing/unallocated/${caseItem.id}`)
  }

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num)
  }

  const getBucketBadgeClass = (bucket: string | null): string => {
    if (!bucket) return 'bucket-badge--default'
    if (bucket.includes('90')) return 'bucket-badge--danger'
    if (bucket.includes('60')) return 'bucket-badge--warning'
    if (bucket.includes('30')) return 'bucket-badge--info'
    return 'bucket-badge--default'
  }

  const columns: Column<UnallocatedCaseSummary>[] = [
    {
      key: 'caseNumber',
      header: 'Case Number',
      render: (caseItem) => (
        <div className="case-info">
          <span className="case-number">{caseItem.caseNumber}</span>
          <span className="external-case-id">{caseItem.externalCaseId}</span>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (caseItem) => (
        <div className="customer-info">
          <span className="customer-name">{caseItem.customer.name}</span>
          <span className="customer-mobile">{caseItem.customer.mobile}</span>
        </div>
      ),
    },
    {
      key: 'loanAccountNumber',
      header: 'Loan Account',
      render: (caseItem) => (
        <span className="loan-account">{caseItem.loanDetails.loanAccountNumber || '-'}</span>
      ),
    },
    {
      key: 'outstanding',
      header: 'Outstanding',
      render: (caseItem) => (
        <span className="outstanding-amount">
          {formatCurrency(caseItem.loanDetails.totalOutstanding)}
        </span>
      ),
    },
    {
      key: 'dpd',
      header: 'DPD',
      render: (caseItem) => (
        <span className="dpd-value">{caseItem.loanDetails.dpd}</span>
      ),
    },
    {
      key: 'bucket',
      header: 'Bucket',
      render: (caseItem) => (
        <span className={`bucket-badge ${getBucketBadgeClass(caseItem.loanDetails.bucket || '')}`}>
          {caseItem.loanDetails.bucket || '-'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (caseItem) => (
        <span className="status-badge status-badge--warning">{caseItem.status}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (caseItem) => formatDate(caseItem.createdAt),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (caseItem) => (
        <div className="table-actions">
          <button
            className="table-action-btn"
            onClick={(e) => {
              e.stopPropagation()
              handleViewCase(caseItem)
            }}
            title="View Details"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="unallocated-page">
      {/* Header */}
      <div className="unallocated-page__header">
        <div>
          <h1 className="unallocated-page__title">Unallocated Cases</h1>
          <p className="unallocated-page__subtitle">
            Cases pending allocation to agents
          </p>
        </div>
        <div className="unallocated-page__stats">
          <div className="stat-chip">
            <span className="stat-chip__value">{formatNumber(totalElements)}</span>
            <span className="stat-chip__label">Total Cases</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert--error">
          <span>{error}</span>
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      {/* Table */}
      <div className="unallocated-page__table">
        <Table
          columns={columns}
          data={cases}
          keyExtractor={(caseItem) => caseItem.id}
          isLoading={isLoading}
          emptyMessage="No unallocated cases found"
          onRowClick={handleViewCase}
        />
      </div>

    </div>
  )
}

export default UnallocatedCasesPage
