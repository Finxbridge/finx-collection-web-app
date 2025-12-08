/**
 * Case Search Page
 * Advanced search for cases with multiple filters
 */

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { caseSourcingService } from '@services/api'
import { Table, Pagination, Column } from '@components/common/Table'
import { Button } from '@components/common/Button'
import type { CaseSearchResult, CaseSearchParams, CaseStatus } from '@types'
import './CaseSearchPage.css'

export function CaseSearchPage() {
  const navigate = useNavigate()
  const [results, setResults] = useState<CaseSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  // Search filters
  const [filters, setFilters] = useState<CaseSearchParams>({
    caseNumber: '',
    loanAccountNumber: '',
    customerName: '',
    mobileNumber: '',
    caseStatus: undefined,
    bucket: '',
    minDpd: undefined,
    maxDpd: undefined,
    geographyCode: '',
    page: 0,
    size: 20,
  })

  // Pagination
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const handleSearch = useCallback(async (page: number = 0) => {
    try {
      setIsLoading(true)
      setError('')
      setHasSearched(true)

      const searchParams: CaseSearchParams = {
        ...filters,
        page,
        size: filters.size,
      }

      // Remove empty values
      Object.keys(searchParams).forEach((key) => {
        const value = searchParams[key as keyof CaseSearchParams]
        if (value === '' || value === undefined) {
          delete searchParams[key as keyof CaseSearchParams]
        }
      })

      const response = await caseSourcingService.searchCases(searchParams)
      setResults(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
      setFilters((prev) => ({ ...prev, page }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  const handleReset = () => {
    setFilters({
      caseNumber: '',
      loanAccountNumber: '',
      customerName: '',
      mobileNumber: '',
      caseStatus: undefined,
      bucket: '',
      minDpd: undefined,
      maxDpd: undefined,
      geographyCode: '',
      page: 0,
      size: 20,
    })
    setResults([])
    setHasSearched(false)
    setTotalPages(0)
    setTotalElements(0)
  }

  const handleViewCase = (caseItem: CaseSearchResult) => {
    navigate(`/case-sourcing/cases/${caseItem.caseId}`)
  }

  const handlePageChange = (page: number) => {
    handleSearch(page)
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadgeClass = (status: string): string => {
    const statusLower = status.toLowerCase()
    switch (statusLower) {
      case 'allocated':
        return 'status-badge--success'
      case 'unallocated':
        return 'status-badge--warning'
      case 'in_progress':
        return 'status-badge--info'
      case 'resolved':
        return 'status-badge--primary'
      case 'closed':
        return 'status-badge--default'
      default:
        return 'status-badge--default'
    }
  }

  const getBucketBadgeClass = (bucket: string): string => {
    if (bucket.includes('90')) return 'bucket-badge--danger'
    if (bucket.includes('60')) return 'bucket-badge--warning'
    if (bucket.includes('30')) return 'bucket-badge--info'
    return 'bucket-badge--default'
  }

  const statusOptions: { value: CaseStatus | ''; label: string }[] = [
    { value: '', label: 'All Statuses' },
    { value: 'UNALLOCATED', label: 'Unallocated' },
    { value: 'ALLOCATED', label: 'Allocated' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' },
  ]

  const bucketOptions = [
    { value: '', label: 'All Buckets' },
    { value: '0-30', label: '0-30 Days' },
    { value: '30-60', label: '30-60 Days' },
    { value: '60-90', label: '60-90 Days' },
    { value: '90+', label: '90+ Days' },
  ]

  const columns: Column<CaseSearchResult>[] = [
    {
      key: 'caseNumber',
      header: 'Case',
      render: (item) => (
        <div className="case-info">
          <span className="case-number">{item.caseNumber}</span>
          <span className="external-case-id">{item.externalCaseId}</span>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (item) => (
        <div className="customer-info">
          <span className="customer-name">{item.customerName}</span>
          <span className="customer-mobile">{item.mobileNumber}</span>
        </div>
      ),
    },
    {
      key: 'loanAccountNumber',
      header: 'Loan Account',
      render: (item) => (
        <span className="loan-account">{item.loanAccountNumber}</span>
      ),
    },
    {
      key: 'outstanding',
      header: 'Outstanding',
      render: (item) => (
        <span className="outstanding-amount">
          {formatCurrency(item.totalOutstanding)}
        </span>
      ),
    },
    {
      key: 'dpd',
      header: 'DPD',
      render: (item) => <span className="dpd-value">{item.dpd}</span>,
    },
    {
      key: 'bucket',
      header: 'Bucket',
      render: (item) => (
        <span className={`bucket-badge ${getBucketBadgeClass(item.bucket)}`}>
          {item.bucket}
        </span>
      ),
    },
    {
      key: 'caseStatus',
      header: 'Status',
      render: (item) => (
        <span className={`status-badge ${getStatusBadgeClass(item.caseStatus)}`}>
          {item.caseStatus.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'allocatedTo',
      header: 'Allocated To',
      render: (item) => (
        <span className="allocated-to">
          {item.allocatedToUserName || '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="table-actions">
          <button
            className="table-action-btn"
            onClick={(e) => {
              e.stopPropagation()
              handleViewCase(item)
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
    <div className="case-search-page">
      {/* Header */}
      <div className="case-search-page__header">
        <div>
          <h1 className="case-search-page__title">Case Search</h1>
          <p className="case-search-page__subtitle">
            Search cases using multiple filters
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert--error">
          <span>{error}</span>
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      {/* Search Form */}
      <div className="search-form">
        <div className="search-form__grid">
          <div className="form-group">
            <label className="form-label">Case Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter case number"
              value={filters.caseNumber}
              onChange={(e) => setFilters({ ...filters, caseNumber: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Loan Account</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter loan account number"
              value={filters.loanAccountNumber}
              onChange={(e) => setFilters({ ...filters, loanAccountNumber: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Customer Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter customer name"
              value={filters.customerName}
              onChange={(e) => setFilters({ ...filters, customerName: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter mobile number"
              value={filters.mobileNumber}
              onChange={(e) => setFilters({ ...filters, mobileNumber: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-input"
              value={filters.caseStatus || ''}
              onChange={(e) => setFilters({ ...filters, caseStatus: e.target.value as CaseStatus || undefined })}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Bucket</label>
            <select
              className="form-input"
              value={filters.bucket}
              onChange={(e) => setFilters({ ...filters, bucket: e.target.value })}
            >
              {bucketOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Min DPD</label>
            <input
              type="number"
              className="form-input"
              placeholder="Min DPD"
              value={filters.minDpd || ''}
              onChange={(e) => setFilters({ ...filters, minDpd: e.target.value ? parseInt(e.target.value) : undefined })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Max DPD</label>
            <input
              type="number"
              className="form-input"
              placeholder="Max DPD"
              value={filters.maxDpd || ''}
              onChange={(e) => setFilters({ ...filters, maxDpd: e.target.value ? parseInt(e.target.value) : undefined })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Geography Code</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter geography code"
              value={filters.geographyCode}
              onChange={(e) => setFilters({ ...filters, geographyCode: e.target.value })}
            />
          </div>
        </div>
        <div className="search-form__actions">
          <Button variant="secondary" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={() => handleSearch(0)} isLoading={isLoading}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Search
          </Button>
        </div>
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="search-results">
          <div className="search-results__header">
            <h2 className="search-results__title">
              Search Results
              {totalElements > 0 && (
                <span className="search-results__count">({totalElements} found)</span>
              )}
            </h2>
          </div>
          <div className="search-results__table">
            <Table
              columns={columns}
              data={results}
              keyExtractor={(item) => item.caseId}
              isLoading={isLoading}
              emptyMessage="No cases found matching your criteria"
              onRowClick={handleViewCase}
            />
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={filters.page || 0}
              totalPages={totalPages}
              totalItems={totalElements}
              pageSize={filters.size || 20}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default CaseSearchPage
