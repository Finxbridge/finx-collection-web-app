/**
 * Repayment List Page
 * Search and list repayments with filters
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { repaymentService } from '@services/api'
import type { Repayment, RepaymentStatus, PageResponse } from '@types'
import { REPAYMENT_STATUS_LABELS, PAYMENT_MODE_LABELS } from '@types'
import './RepaymentListPage.css'

export function RepaymentListPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [repayments, setRepayments] = useState<Repayment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const pageSize = 20

  // Filters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [statusFilter, setStatusFilter] = useState<RepaymentStatus | ''>(
    (searchParams.get('status') as RepaymentStatus) || ''
  )
  const [fromDate, setFromDate] = useState(searchParams.get('fromDate') || '')
  const [toDate, setToDate] = useState(searchParams.get('toDate') || '')

  const fetchRepayments = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')

      const params = {
        searchTerm: searchTerm || undefined,
        status: statusFilter || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        page: currentPage,
        size: pageSize,
      }

      const response: PageResponse<Repayment> = await repaymentService.search(params)
      setRepayments(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch repayments')
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, statusFilter, fromDate, toDate, currentPage])

  useEffect(() => {
    fetchRepayments()
  }, [fetchRepayments])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(0)

    // Update URL params
    const params = new URLSearchParams()
    if (searchTerm) params.set('search', searchTerm)
    if (statusFilter) params.set('status', statusFilter)
    if (fromDate) params.set('fromDate', fromDate)
    if (toDate) params.set('toDate', toDate)
    setSearchParams(params)

    fetchRepayments()
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setFromDate('')
    setToDate('')
    setCurrentPage(0)
    setSearchParams({})
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDateTime = (dateStr: string): string => {
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

  const handleDownloadReceipt = async (repaymentId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const blob = await repaymentService.downloadReceipt(repaymentId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `receipt-${repaymentId}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download receipt')
    }
  }

  return (
    <div className="repayment-list-page">
      {/* Header */}
      <div className="repayment-list-header">
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
        <div className="repayment-list-header__content">
          <h1 className="repayment-list-title">Search Repayments</h1>
          <p className="repayment-list-subtitle">
            {totalElements} repayments found
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

      {/* Search & Filters */}
      <div className="search-card">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-row">
            <div className="search-field search-field--large">
              <label className="search-label">Search</label>
              <input
                type="text"
                className="search-input"
                placeholder="Search by repayment number, customer name, loan account..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="search-field">
              <label className="search-label">Status</label>
              <select
                className="search-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as RepaymentStatus | '')}
              >
                <option value="">All Status</option>
                {Object.entries(REPAYMENT_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="search-row">
            <div className="search-field">
              <label className="search-label">From Date</label>
              <input
                type="date"
                className="search-input"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="search-field">
              <label className="search-label">To Date</label>
              <input
                type="date"
                className="search-input"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="search-actions">
              <button type="button" className="btn-secondary" onClick={handleClearFilters}>
                Clear
              </button>
              <button type="submit" className="btn-primary">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Search
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results Table */}
      <div className="table-card">
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <span>Loading repayments...</span>
          </div>
        ) : repayments.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
            </svg>
            <p>No repayments found</p>
            <span>Try adjusting your search criteria</span>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="repayment-table">
                <thead>
                  <tr>
                    <th>Repayment #</th>
                    <th>Customer</th>
                    <th>Loan Account</th>
                    <th>Amount</th>
                    <th>Payment Mode</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {repayments.map((repayment) => (
                    <tr
                      key={repayment.id}
                      onClick={() => navigate(`/repayment/${repayment.id}`)}
                      className="table-row--clickable"
                    >
                      <td className="cell-mono">
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
                      <td>
                        <span className={`badge ${getStatusBadgeClass(repayment.status)}`}>
                          {REPAYMENT_STATUS_LABELS[repayment.status] || repayment.status}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="btn-icon"
                            title="View Details"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/repayment/${repayment.id}`)
                            }}
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
                          {repayment.status === 'APPROVED' && (
                            <button
                              className="btn-icon"
                              title="Download Receipt"
                              onClick={(e) => handleDownloadReceipt(repayment.id, e)}
                            >
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
                                <line
                                  x1="12"
                                  y1="15"
                                  x2="12"
                                  y2="3"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          )}
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
    </div>
  )
}

export default RepaymentListPage
