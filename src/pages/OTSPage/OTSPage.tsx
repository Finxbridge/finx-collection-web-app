/**
 * OTS (One-Time Settlement) Page
 * Main page for OTS management with tabs for All OTS, Pending Approvals, Create OTS, and Settlement Letters
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { otsService, settlementLetterService } from '@services/api'
import type {
  OTSRequest,
  OTSStatus,
  CreateOTSRequest,
  OTSCaseSearchDTO,
  SettlementLetterDTO,
  LetterStatus,
} from '@types'
import { OTS_STATUS_LABELS, OTS_STATUS_COLORS, LETTER_STATUS_LABELS, LETTER_STATUS_COLORS } from '@types'
import './OTSPage.css'

type TabType = 'all' | 'pending' | 'create' | 'letters'

interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

// Interface for location state from MyWorkflow
interface LocationState {
  createOTS?: boolean
  caseId?: number
  loanAccountNumber?: string
  customerName?: string
  totalOutstanding?: number
  pos?: number
  penaltyAmount?: number
  charges?: number
  customerDetails?: Record<string, unknown>
  loanDetails?: Record<string, unknown>
}

export function OTSPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const locationState = location.state as LocationState | null
  const [activeTab, setActiveTab] = useState<TabType>(locationState?.createOTS ? 'create' : 'all')
  // Store the source case ID to navigate back after OTS creation
  const [sourceCaseId] = useState<number | undefined>(locationState?.caseId)
  const [otsList, setOtsList] = useState<OTSRequest[]>([])
  const [pendingList, setPendingList] = useState<OTSRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [selectedStatus, setSelectedStatus] = useState<OTSStatus | 'ALL'>('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingOTSId, setViewingOTSId] = useState<number | null>(null)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [reviewingOTSId, setReviewingOTSId] = useState<number | null>(null)
  const [modalLoading, setModalLoading] = useState(false)

  // Create form state
  const [createForm, setCreateForm] = useState<Partial<CreateOTSRequest>>({
    caseId: undefined,
    originalOutstanding: undefined,
    proposedSettlement: undefined,
    paymentMode: undefined,
    installmentCount: undefined,
    paymentDeadline: undefined,
    intentNotes: '',
    borrowerConsent: false,
  })
  const [createLoading, setCreateLoading] = useState(false)
  const [createSuccess, setCreateSuccess] = useState('')

  // Case search state
  const [caseSearchQuery, setCaseSearchQuery] = useState('')
  const [caseSearchResults, setCaseSearchResults] = useState<OTSCaseSearchDTO[]>([])
  const [caseSearchLoading, setCaseSearchLoading] = useState(false)
  const [showCaseDropdown, setShowCaseDropdown] = useState(false)
  const [selectedCase, setSelectedCase] = useState<OTSCaseSearchDTO | null>(null)
  const caseSearchRef = useRef<HTMLDivElement>(null)
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Settlement letters state
  const [lettersList, setLettersList] = useState<SettlementLetterDTO[]>([])
  const [lettersLoading, setLettersLoading] = useState(false)
  const [lettersPage, setLettersPage] = useState(0)
  const [lettersTotalPages, setLettersTotalPages] = useState(0)
  const [lettersTotalElements, setLettersTotalElements] = useState(0)

  // Settlement letter modal state (shown after approval)
  const [showLetterModal, setShowLetterModal] = useState(false)
  const [approvedOTSForLetter, setApprovedOTSForLetter] = useState<OTSRequest | null>(null)
  const [letterGenerating, setLetterGenerating] = useState(false)
  const [generatedLetter, setGeneratedLetter] = useState<SettlementLetterDTO | null>(null)

  const fetchOTSList = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      let response: PageResponse<OTSRequest>

      if (selectedStatus === 'ALL') {
        // Fetch PENDING_APPROVAL as default "all" view - adjust as needed
        response = await otsService.getOTSByStatus('PENDING_APPROVAL', page, 20)
      } else {
        response = await otsService.getOTSByStatus(selectedStatus, page, 20)
      }

      setOtsList(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load OTS data')
    } finally {
      setLoading(false)
    }
  }, [page, selectedStatus])

  const fetchPendingApprovals = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const response = await otsService.getPendingApprovals(0, 50)
      setPendingList(response.content)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pending approvals')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchSettlementLetters = useCallback(async () => {
    try {
      setLettersLoading(true)
      setError('')
      const response = await settlementLetterService.getAllLetters(lettersPage, 20)
      setLettersList(response.content)
      setLettersTotalPages(response.totalPages)
      setLettersTotalElements(response.totalElements)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settlement letters')
    } finally {
      setLettersLoading(false)
    }
  }, [lettersPage])

  useEffect(() => {
    if (activeTab === 'all') {
      fetchOTSList()
    } else if (activeTab === 'pending') {
      fetchPendingApprovals()
    } else if (activeTab === 'letters') {
      fetchSettlementLetters()
    }
  }, [activeTab, fetchOTSList, fetchPendingApprovals, fetchSettlementLetters])

  // Handle incoming state from MyWorkflow for auto-population
  useEffect(() => {
    if (locationState?.createOTS && locationState.caseId) {
      // Create a synthetic case object for display
      const syntheticCase: OTSCaseSearchDTO = {
        caseId: locationState.caseId,
        caseNumber: `CASE-${locationState.caseId}`,
        loanAccountNumber: locationState.loanAccountNumber || '',
        customerName: locationState.customerName || '',
        totalOutstanding: locationState.totalOutstanding || 0,
        bucket: '',
        dpd: 0,
      }
      setSelectedCase(syntheticCase)
      setCaseSearchQuery(locationState.loanAccountNumber || locationState.customerName || '')

      // Pre-populate form with case data
      setCreateForm((prev) => ({
        ...prev,
        caseId: locationState.caseId,
        originalOutstanding: locationState.totalOutstanding,
      }))

      // Clear location state after processing to prevent re-processing on navigation
      window.history.replaceState({}, document.title)
    }
  }, [locationState])

  // Handle click outside to close case search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (caseSearchRef.current && !caseSearchRef.current.contains(event.target as Node)) {
        setShowCaseDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search cases for OTS
  const handleCaseSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setCaseSearchResults([])
      setShowCaseDropdown(false)
      return
    }

    try {
      setCaseSearchLoading(true)
      const response = await otsService.searchCasesForOTS(query, 0, 10)
      setCaseSearchResults(response.content)
      setShowCaseDropdown(true)
    } catch (err) {
      console.error('Case search failed:', err)
      setCaseSearchResults([])
    } finally {
      setCaseSearchLoading(false)
    }
  }, [])

  // Debounced search handler
  const handleCaseSearchInput = (value: string) => {
    setCaseSearchQuery(value)

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }

    searchDebounceRef.current = setTimeout(() => {
      handleCaseSearch(value)
    }, 300)
  }

  // Handle case selection
  const handleCaseSelect = (caseData: OTSCaseSearchDTO) => {
    setSelectedCase(caseData)
    setCaseSearchQuery('')
    setShowCaseDropdown(false)
    setCaseSearchResults([])

    // Auto-populate form fields
    setCreateForm({
      ...createForm,
      caseId: caseData.caseId,
      originalOutstanding: caseData.totalOutstanding,
      proposedSettlement: undefined, // User needs to enter this
    })
  }

  // Clear selected case
  const handleClearCase = () => {
    setSelectedCase(null)
    setCreateForm({
      ...createForm,
      caseId: undefined,
      originalOutstanding: undefined,
      proposedSettlement: undefined,
    })
  }

  const formatCurrency = (amount: number | undefined): string => {
    if (amount === undefined || amount === null) return '-'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateString: string | undefined): string => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadgeClass = (status: OTSStatus | undefined): string => {
    if (!status) return 'badge--default'
    const color = OTS_STATUS_COLORS[status]
    switch (color) {
      case 'success':
        return 'badge--success'
      case 'warning':
        return 'badge--warning'
      case 'danger':
        return 'badge--danger'
      case 'info':
        return 'badge--info'
      default:
        return 'badge--default'
    }
  }

  const getStatusLabel = (status: OTSStatus | undefined): string => {
    if (!status) return '-'
    return OTS_STATUS_LABELS[status] || status
  }

  const handleApprove = async (otsId: number, comments?: string) => {
    try {
      setModalLoading(true)
      const approvedOTS = await otsService.approveOTS(otsId, comments)
      setShowApprovalModal(false)
      setReviewingOTSId(null)
      fetchPendingApprovals()
      fetchOTSList()

      // Show settlement letter modal after successful approval
      setApprovedOTSForLetter(approvedOTS)
      setLetterGenerating(true)
      setShowLetterModal(true)

      // Fetch the auto-generated settlement letter
      try {
        const letter = await settlementLetterService.getLetterByOtsId(approvedOTS.id)
        setGeneratedLetter(letter)
      } catch {
        // Letter might not exist yet, set to null
        setGeneratedLetter(null)
      } finally {
        setLetterGenerating(false)
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve OTS')
    } finally {
      setModalLoading(false)
    }
  }

  const handleReject = async (otsId: number, reason: string) => {
    try {
      setModalLoading(true)
      await otsService.rejectOTS(otsId, reason)
      setShowApprovalModal(false)
      setReviewingOTSId(null)
      fetchPendingApprovals()
      fetchOTSList()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject OTS')
    } finally {
      setModalLoading(false)
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createForm.caseId || !createForm.originalOutstanding || !createForm.proposedSettlement) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setCreateLoading(true)
      setError('')
      await otsService.createOTS({
        caseId: createForm.caseId,
        originalOutstanding: createForm.originalOutstanding,
        proposedSettlement: createForm.proposedSettlement,
        paymentMode: createForm.paymentMode,
        installmentCount: createForm.installmentCount,
        paymentDeadline: createForm.paymentDeadline,
        intentNotes: createForm.intentNotes,
        borrowerConsent: createForm.borrowerConsent,
      })
      setCreateSuccess('OTS created successfully!')
      const caseIdToNavigate = createForm.caseId
      setSelectedCase(null)
      setCreateForm({
        caseId: undefined,
        originalOutstanding: undefined,
        proposedSettlement: undefined,
        paymentMode: undefined,
        installmentCount: undefined,
        paymentDeadline: undefined,
        intentNotes: '',
        borrowerConsent: false,
      })
      setTimeout(() => {
        setCreateSuccess('')
        // If OTS was created from a case (via MyWorkflow), navigate back to that case's OTS tab
        if (sourceCaseId || caseIdToNavigate) {
          const targetCaseId = sourceCaseId || caseIdToNavigate
          navigate(`/workflow/case/${targetCaseId}`, { state: { activeTab: 'ots' } })
        } else {
          setActiveTab('all')
        }
      }, 2000)
    } catch (err: unknown) {
      // Handle different error formats - axios interceptor returns ApiError object
      const errorMessage =
        (err as { message?: string })?.message ||
        (err instanceof Error ? err.message : 'Failed to create OTS')
      setError(errorMessage)
    } finally {
      setCreateLoading(false)
    }
  }

  const filteredOTSList = otsList.filter((ots) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      ots.otsNumber?.toLowerCase().includes(term) ||
      ots.customerName?.toLowerCase().includes(term) ||
      ots.loanAccountNumber?.toLowerCase().includes(term)
    )
  })

  // Letter status badge helper
  const getLetterStatusBadgeClass = (status: LetterStatus | undefined): string => {
    if (!status) return 'badge--default'
    const color = LETTER_STATUS_COLORS[status]
    switch (color) {
      case 'success':
        return 'badge--success'
      case 'warning':
        return 'badge--warning'
      case 'danger':
        return 'badge--danger'
      case 'info':
        return 'badge--info'
      default:
        return 'badge--default'
    }
  }

  const getLetterStatusLabel = (status: LetterStatus | undefined): string => {
    if (!status) return '-'
    return LETTER_STATUS_LABELS[status] || status
  }

  // Download letter PDF
  const handleDownloadPdf = async (letterId: number, letterNumber: string) => {
    try {
      const blob = await settlementLetterService.downloadLetterPdf(letterId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Settlement_Letter_${letterNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      // Mark as downloaded and refresh if on letters tab
      await settlementLetterService.downloadLetter(letterId)
      if (activeTab === 'letters') {
        fetchSettlementLetters()
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to download PDF')
    }
  }

  // View letter PDF in new tab
  const handleViewLetter = async (letterId: number) => {
    try {
      const blob = await settlementLetterService.downloadLetterPdf(letterId)
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
      // Clean up the URL after a delay to allow the new tab to load
      setTimeout(() => window.URL.revokeObjectURL(url), 1000)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to view letter')
    }
  }

  if (loading && activeTab !== 'create' && activeTab !== 'letters') {
    return (
      <div className="ots-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Loading OTS data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="ots-page">
      {/* Header */}
      <div className="ots-header">
        <div className="ots-header__content">
          <h1 className="ots-title">One-Time Settlement (OTS)</h1>
          <p className="ots-subtitle">Manage settlement requests, approvals, and tracking</p>
        </div>
        <div className="ots-header__actions">
          <button className="btn-primary" onClick={() => setActiveTab('create')}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Create OTS
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert--error">
          <span>{error}</span>
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      {/* Success Alert */}
      {createSuccess && (
        <div className="alert alert--success">
          <span>{createSuccess}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="ots-tabs">
        <button
          className={`ots-tab ${activeTab === 'all' ? 'ots-tab--active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All OTS
        </button>
        <button
          className={`ots-tab ${activeTab === 'pending' ? 'ots-tab--active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Approvals
        </button>
        <button
          className={`ots-tab ${activeTab === 'create' ? 'ots-tab--active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Create OTS
        </button>
        <button
          className={`ots-tab ${activeTab === 'letters' ? 'ots-tab--active' : ''}`}
          onClick={() => setActiveTab('letters')}
        >
          Settlement Letters
        </button>
      </div>

      {/* All OTS Tab */}
      {activeTab === 'all' && (
        <>
          {/* Toolbar */}
          <div className="ots-toolbar">
            <div className="ots-toolbar__search">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Search by OTS number, customer, or loan account..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="ots-toolbar__filters">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value as OTSStatus | 'ALL')
                  setPage(0)
                }}
              >
                <option value="ALL">All Status</option>
                {otsService.getOTSStatusOptions().map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* OTS Table */}
          <div className="ots-card">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>OTS Number</th>
                    <th>Customer</th>
                    <th>Loan Account</th>
                    <th>Original Amount</th>
                    <th>Settlement Amount</th>
                    <th>Discount %</th>
                    <th>Status</th>
                    <th>Deadline</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOTSList.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="empty-row">
                        No OTS records found
                      </td>
                    </tr>
                  ) : (
                    filteredOTSList.map((ots) => (
                      <tr key={ots.id}>
                        <td className="cell-mono">{ots.otsNumber}</td>
                        <td>
                          <button
                            className="cell-link"
                            onClick={() => {
                              setViewingOTSId(ots.id)
                              setShowViewModal(true)
                            }}
                          >
                            {ots.customerName}
                          </button>
                        </td>
                        <td className="cell-mono">{ots.loanAccountNumber}</td>
                        <td>{formatCurrency(ots.originalOutstanding || ots.originalAmount)}</td>
                        <td>{formatCurrency(ots.proposedSettlement || ots.settlementAmount)}</td>
                        <td>
                          {ots.discountPercentage != null
                            ? `${ots.discountPercentage.toFixed(1)}%`
                            : ots.waiverPercentage != null
                            ? `${ots.waiverPercentage.toFixed(1)}%`
                            : '-'}
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(ots.otsStatus || ots.status)}`}>
                            {getStatusLabel(ots.otsStatus || ots.status)}
                          </span>
                        </td>
                        <td>{formatDate(ots.paymentDeadline || ots.validUntil)}</td>
                        <td className="cell-actions">
                          <button
                            className="btn-action btn-action--view"
                            title="View Details"
                            onClick={() => {
                              setViewingOTSId(ots.id)
                              setShowViewModal(true)
                            }}
                          >
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <span className="pagination__info">
                  Showing {page * 20 + 1} to {Math.min((page + 1) * 20, totalElements)} of{' '}
                  {totalElements} records
                </span>
                <div className="pagination__buttons">
                  <button
                    className="pagination__btn"
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </button>
                  <span className="pagination__page">
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    className="pagination__btn"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Pending Approvals Tab */}
      {activeTab === 'pending' && (
        <div className="ots-card">
          <div className="ots-card__header">
            <h2 className="ots-card__title">Pending Approvals</h2>
            <span className="ots-card__count">{pendingList.length} pending</span>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>OTS Number</th>
                  <th>Customer</th>
                  <th>Loan Account</th>
                  <th>Original Amount</th>
                  <th>Settlement Amount</th>
                  <th>Discount</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="empty-row">
                      No pending approvals
                    </td>
                  </tr>
                ) : (
                  pendingList.map((ots) => (
                    <tr key={ots.id}>
                      <td className="cell-mono">{ots.otsNumber}</td>
                      <td>{ots.customerName}</td>
                      <td className="cell-mono">{ots.loanAccountNumber}</td>
                      <td>{formatCurrency(ots.originalOutstanding || ots.originalAmount)}</td>
                      <td>{formatCurrency(ots.proposedSettlement || ots.settlementAmount)}</td>
                      <td>
                        {ots.discountPercentage != null
                          ? `${ots.discountPercentage.toFixed(1)}%`
                          : ots.waiverPercentage != null
                          ? `${ots.waiverPercentage.toFixed(1)}%`
                          : '-'}
                      </td>
                      <td>{formatDateTime(ots.createdAt)}</td>
                      <td className="cell-actions">
                        <button
                          className="btn btn--sm btn--primary"
                          onClick={() => {
                            setReviewingOTSId(ots.id)
                            setShowApprovalModal(true)
                          }}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create OTS Tab */}
      {activeTab === 'create' && (
        <div className="ots-card">
          <div className="ots-card__header">
            <h2 className="ots-card__title">Create New OTS</h2>
          </div>
          <form className="ots-form" onSubmit={handleCreateSubmit}>
            {/* Case Search Section */}
            <div className="case-search-section">
              <label className="form-label">
                Search Customer / Case <span className="required">*</span>
              </label>

              {!selectedCase ? (
                <div className="case-search-container" ref={caseSearchRef}>
                  <div className="case-search-input-wrapper">
                    <svg className="case-search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                      <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <input
                      type="text"
                      className="case-search-input"
                      value={caseSearchQuery}
                      onChange={(e) => handleCaseSearchInput(e.target.value)}
                      placeholder="Search by customer name, mobile, loan account, or case number..."
                      autoComplete="off"
                    />
                    {caseSearchLoading && <div className="case-search-spinner"></div>}
                  </div>

                  {showCaseDropdown && caseSearchResults.length > 0 && (
                    <div className="case-search-dropdown">
                      {caseSearchResults.map((caseItem) => (
                        <div
                          key={caseItem.caseId}
                          className="case-search-result"
                          onClick={() => handleCaseSelect(caseItem)}
                        >
                          <div className="case-search-result__header">
                            <span className="case-search-result__name">{caseItem.customerName}</span>
                            <span className="case-search-result__amount">
                              {formatCurrency(caseItem.totalOutstanding)}
                            </span>
                          </div>
                          <div className="case-search-result__details">
                            <span className="case-search-result__info">
                              <strong>Case:</strong> {caseItem.caseNumber}
                            </span>
                            <span className="case-search-result__info">
                              <strong>Loan:</strong> {caseItem.loanAccountNumber}
                            </span>
                            {caseItem.customerMobile && (
                              <span className="case-search-result__info">
                                <strong>Mobile:</strong> {caseItem.customerMobile}
                              </span>
                            )}
                          </div>
                          <div className="case-search-result__meta">
                            {caseItem.productType && (
                              <span className="case-search-result__tag">{caseItem.productType}</span>
                            )}
                            {caseItem.dpd != null && (
                              <span className="case-search-result__tag case-search-result__tag--dpd">
                                DPD: {caseItem.dpd}
                              </span>
                            )}
                            {caseItem.bucket && (
                              <span className="case-search-result__tag">{caseItem.bucket}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {showCaseDropdown && caseSearchResults.length === 0 && caseSearchQuery.length >= 2 && !caseSearchLoading && (
                    <div className="case-search-dropdown">
                      <div className="case-search-no-results">
                        No cases found for "{caseSearchQuery}"
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="selected-case-card">
                  <div className="selected-case-card__header">
                    <div className="selected-case-card__info">
                      <h4 className="selected-case-card__name">{selectedCase.customerName}</h4>
                      <p className="selected-case-card__case-number">
                        Case: {selectedCase.caseNumber} | Loan: {selectedCase.loanAccountNumber}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="selected-case-card__clear"
                      onClick={handleClearCase}
                      title="Clear selection"
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                  <div className="selected-case-card__details">
                    <div className="selected-case-card__detail">
                      <span className="selected-case-card__label">Total Outstanding</span>
                      <span className="selected-case-card__value selected-case-card__value--highlight">
                        {formatCurrency(selectedCase.totalOutstanding)}
                      </span>
                    </div>
                    {selectedCase.principalOutstanding != null && (
                      <div className="selected-case-card__detail">
                        <span className="selected-case-card__label">Principal</span>
                        <span className="selected-case-card__value">
                          {formatCurrency(selectedCase.principalOutstanding)}
                        </span>
                      </div>
                    )}
                    {selectedCase.interestOutstanding != null && (
                      <div className="selected-case-card__detail">
                        <span className="selected-case-card__label">Interest</span>
                        <span className="selected-case-card__value">
                          {formatCurrency(selectedCase.interestOutstanding)}
                        </span>
                      </div>
                    )}
                    {selectedCase.penaltyOutstanding != null && (
                      <div className="selected-case-card__detail">
                        <span className="selected-case-card__label">Penalty</span>
                        <span className="selected-case-card__value">
                          {formatCurrency(selectedCase.penaltyOutstanding)}
                        </span>
                      </div>
                    )}
                    {selectedCase.dpd != null && (
                      <div className="selected-case-card__detail">
                        <span className="selected-case-card__label">DPD</span>
                        <span className="selected-case-card__value">{selectedCase.dpd} days</span>
                      </div>
                    )}
                    {selectedCase.productType && (
                      <div className="selected-case-card__detail">
                        <span className="selected-case-card__label">Product</span>
                        <span className="selected-case-card__value">{selectedCase.productType}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Settlement Details Form */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Original Outstanding <span className="required">*</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={createForm.originalOutstanding || ''}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      originalOutstanding: parseFloat(e.target.value) || undefined,
                    })
                  }
                  placeholder="Enter original outstanding amount"
                  required
                  readOnly={!!selectedCase}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Proposed Settlement <span className="required">*</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={createForm.proposedSettlement || ''}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      proposedSettlement: parseFloat(e.target.value) || undefined,
                    })
                  }
                  placeholder="Enter proposed settlement amount"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Mode</label>
                <select
                  className="form-select"
                  value={createForm.paymentMode || ''}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      paymentMode: e.target.value as CreateOTSRequest['paymentMode'],
                    })
                  }
                >
                  <option value="">Select payment mode</option>
                  {otsService.getPaymentModeOptions().map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Payment Deadline</label>
                <input
                  type="date"
                  className="form-input"
                  value={createForm.paymentDeadline || ''}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, paymentDeadline: e.target.value })
                  }
                />
              </div>

              <div className="form-group form-group--full">
                <label className="form-label">Intent Notes</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={createForm.intentNotes || ''}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, intentNotes: e.target.value })
                  }
                  placeholder="Add notes about the settlement intent..."
                />
              </div>

              <div className="form-group form-group--full">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={createForm.borrowerConsent || false}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, borrowerConsent: e.target.checked })
                    }
                  />
                  <span>Borrower has provided consent for this settlement</span>
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setActiveTab('all')}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn--primary" disabled={createLoading}>
                {createLoading ? 'Creating...' : 'Create OTS'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Settlement Letters Tab */}
      {activeTab === 'letters' && (
        <div className="ots-card">
          <div className="ots-card__header">
            <h2 className="ots-card__title">Settlement Letters</h2>
            <span className="ots-card__count">{lettersTotalElements} letters</span>
          </div>

          {lettersLoading ? (
            <div className="loading-container" style={{ minHeight: '200px' }}>
              <div className="spinner"></div>
              <span>Loading settlement letters...</span>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Letter Number</th>
                      <th>OTS Number</th>
                      <th>Customer</th>
                      <th>Loan Account</th>
                      <th>Template</th>
                      <th>Status</th>
                      <th>Generated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lettersList.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="empty-row">
                          No settlement letters found
                        </td>
                      </tr>
                    ) : (
                      lettersList.map((letter) => (
                        <tr key={letter.id}>
                          <td className="cell-mono">{letter.letterNumber}</td>
                          <td className="cell-mono">{letter.otsNumber}</td>
                          <td>{letter.customerName}</td>
                          <td className="cell-mono">{letter.loanAccountNumber}</td>
                          <td>{letter.templateName}</td>
                          <td>
                            <span className={`badge ${getLetterStatusBadgeClass(letter.letterStatus)}`}>
                              {getLetterStatusLabel(letter.letterStatus)}
                            </span>
                          </td>
                          <td>{formatDateTime(letter.generatedAt)}</td>
                          <td className="cell-actions">
                            <button
                              className="btn-action btn-action--view"
                              title="View Letter"
                              onClick={() => handleViewLetter(letter.id)}
                            >
                              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                              </svg>
                            </button>
                            <button
                              className="btn-action btn-action--download"
                              title="Download PDF"
                              onClick={() => handleDownloadPdf(letter.id, letter.letterNumber)}
                            >
                              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {lettersTotalPages > 1 && (
                <div className="pagination">
                  <span className="pagination__info">
                    Showing {lettersPage * 20 + 1} to {Math.min((lettersPage + 1) * 20, lettersTotalElements)} of{' '}
                    {lettersTotalElements} records
                  </span>
                  <div className="pagination__buttons">
                    <button
                      className="pagination__btn"
                      disabled={lettersPage === 0}
                      onClick={() => setLettersPage(lettersPage - 1)}
                    >
                      Previous
                    </button>
                    <span className="pagination__page">
                      Page {lettersPage + 1} of {lettersTotalPages}
                    </span>
                    <button
                      className="pagination__btn"
                      disabled={lettersPage >= lettersTotalPages - 1}
                      onClick={() => setLettersPage(lettersPage + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* View OTS Modal */}
      <ViewOTSModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setViewingOTSId(null)
        }}
        otsId={viewingOTSId}
      />

      {/* Approval Modal */}
      <ApprovalModal
        isOpen={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false)
          setReviewingOTSId(null)
        }}
        otsId={reviewingOTSId}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={modalLoading}
      />

      {/* Settlement Letter Modal (shown after approval) */}
      {showLetterModal && approvedOTSForLetter && (
        <div className="modal-overlay" onClick={() => setShowLetterModal(false)}>
          <div className="modal modal--large" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>Settlement Letter</h2>
              <button
                type="button"
                className="modal__close"
                onClick={() => setShowLetterModal(false)}
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="modal__body">
              {letterGenerating ? (
                <div className="letter-generation-content">
                  <div className="loading-container" style={{ minHeight: '200px' }}>
                    <div className="spinner"></div>
                    <span>Loading settlement letter...</span>
                  </div>
                </div>
              ) : !generatedLetter ? (
                <div className="letter-generation-content">
                  <div className="letter-generation-success">
                    <div className="letter-generation-success__icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <h3>OTS Approved Successfully!</h3>
                    <p>OTS Number: <strong>{approvedOTSForLetter.otsNumber}</strong></p>
                    <p>Customer: <strong>{approvedOTSForLetter.customerName}</strong></p>
                  </div>

                  <div className="letter-generation-form">
                    <p className="letter-generation-form__info">
                      Settlement letter could not be loaded. You can view it later from the Settlement Letters tab.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="letter-generated-content">
                  <div className="letter-generated-success">
                    <div className="letter-generated-success__icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M9 15L11 17L15 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <h3>Settlement Letter Generated!</h3>
                    <p>Letter Number: <strong>{generatedLetter.letterNumber}</strong></p>
                  </div>

                  <div className="letter-generated-details">
                    <div className="letter-generated-details__item">
                      <span className="letter-generated-details__label">Customer</span>
                      <span className="letter-generated-details__value">{generatedLetter.customerName}</span>
                    </div>
                    <div className="letter-generated-details__item">
                      <span className="letter-generated-details__label">OTS Number</span>
                      <span className="letter-generated-details__value">{generatedLetter.otsNumber}</span>
                    </div>
                    <div className="letter-generated-details__item">
                      <span className="letter-generated-details__label">Template</span>
                      <span className="letter-generated-details__value">{generatedLetter.templateName}</span>
                    </div>
                    <div className="letter-generated-details__item">
                      <span className="letter-generated-details__label">Status</span>
                      <span className={`badge ${getLetterStatusBadgeClass(generatedLetter.letterStatus)}`}>
                        {getLetterStatusLabel(generatedLetter.letterStatus)}
                      </span>
                    </div>
                  </div>

                  <div className="letter-generated-actions">
                    <button
                      className="btn btn--primary"
                      onClick={() => handleViewLetter(generatedLetter.id)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      View Letter
                    </button>
                    <button
                      className="btn btn--secondary"
                      onClick={() => handleDownloadPdf(generatedLetter.id, generatedLetter.letterNumber)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Download
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="modal__footer">
              <button
                className="btn btn--secondary"
                onClick={() => {
                  setShowLetterModal(false)
                  setApprovedOTSForLetter(null)
                  setGeneratedLetter(null)
                }}
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

// View OTS Modal Component
interface ViewOTSModalProps {
  isOpen: boolean
  onClose: () => void
  otsId: number | null
}

function ViewOTSModal({ isOpen, onClose, otsId }: ViewOTSModalProps) {
  const [ots, setOts] = useState<OTSRequest | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && otsId) {
      const fetchOTSDetails = async () => {
        try {
          setLoading(true)
          setError(null)
          const otsData = await otsService.getOTSById(otsId)
          setOts(otsData)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch OTS details')
          setOts(null)
        } finally {
          setLoading(false)
        }
      }
      fetchOTSDetails()
    } else {
      setOts(null)
      setError(null)
    }
  }, [isOpen, otsId])

  if (!isOpen || !otsId) return null

  const formatCurrency = (amount: number | undefined): string => {
    if (amount === undefined || amount === null) return '-'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const getStatusBadgeClass = (status: OTSStatus | undefined): string => {
    if (!status) return 'badge--default'
    const color = OTS_STATUS_COLORS[status]
    switch (color) {
      case 'success':
        return 'badge--success'
      case 'warning':
        return 'badge--warning'
      case 'danger':
        return 'badge--danger'
      case 'info':
        return 'badge--info'
      default:
        return 'badge--default'
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--large" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>OTS Details</h2>
          <button type="button" className="modal__close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div className="modal__body">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading OTS details...</p>
            </div>
          ) : error ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p>Error loading OTS</p>
              <span>{error}</span>
            </div>
          ) : !ots ? (
            <div className="empty-state">
              <p>No OTS data available</p>
            </div>
          ) : (
            <div className="ots-detail-content">
              {/* Header */}
              <div className="ots-detail-header">
                <div className="ots-detail-header__info">
                  <h3 className="ots-detail-header__number">{ots.otsNumber}</h3>
                  <span className="ots-detail-header__customer">{ots.customerName}</span>
                </div>
                <span className={`badge ${getStatusBadgeClass(ots.otsStatus || ots.status)}`}>
                  {OTS_STATUS_LABELS[ots.otsStatus || ots.status || 'DRAFT']}
                </span>
              </div>

              {/* Settlement Details */}
              <div className="detail-section">
                <h4 className="detail-section__title">Settlement Details</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-item__label">Loan Account</span>
                    <span className="detail-item__value">{ots.loanAccountNumber}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Case Number</span>
                    <span className="detail-item__value">{ots.caseNumber || `#${ots.caseId}`}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Original Outstanding</span>
                    <span className="detail-item__value">{formatCurrency(ots.originalOutstanding || ots.originalAmount)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Settlement Amount</span>
                    <span className="detail-item__value detail-item__value--highlight">
                      {formatCurrency(ots.proposedSettlement || ots.settlementAmount)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Discount Amount</span>
                    <span className="detail-item__value detail-item__value--success">
                      {formatCurrency(ots.discountAmount || ots.waiverAmount)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Discount Percentage</span>
                    <span className="detail-item__value detail-item__value--success">
                      {ots.discountPercentage?.toFixed(1) || ots.waiverPercentage?.toFixed(1) || '-'}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="detail-section">
                <h4 className="detail-section__title">Payment Details</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-item__label">Payment Mode</span>
                    <span className="detail-item__value">{ots.paymentMode || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Installment Count</span>
                    <span className="detail-item__value">{ots.installmentCount || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Payment Deadline</span>
                    <span className="detail-item__value">{formatDate(ots.paymentDeadline)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Valid Until</span>
                    <span className="detail-item__value">{formatDate(ots.validUntil)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Borrower Consent</span>
                    <span className="detail-item__value">
                      {ots.borrowerConsent ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Approval Information */}
              {(ots.approvedBy || ots.rejectionReason || ots.cancellationReason) && (
                <div className="detail-section">
                  <h4 className="detail-section__title">Approval Information</h4>
                  <div className="detail-grid">
                    {ots.approvedBy && (
                      <>
                        <div className="detail-item">
                          <span className="detail-item__label">Approved By</span>
                          <span className="detail-item__value">User #{ots.approvedBy}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-item__label">Approval Date</span>
                          <span className="detail-item__value">{formatDate(ots.approvalDate)}</span>
                        </div>
                      </>
                    )}
                    {ots.rejectionReason && (
                      <div className="detail-item detail-item--full">
                        <span className="detail-item__label">Rejection Reason</span>
                        <span className="detail-item__value detail-item__value--danger">
                          {ots.rejectionReason}
                        </span>
                      </div>
                    )}
                    {ots.cancellationReason && (
                      <div className="detail-item detail-item--full">
                        <span className="detail-item__label">Cancellation Reason</span>
                        <span className="detail-item__value detail-item__value--danger">
                          {ots.cancellationReason}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {ots.notes && (
                <div className="detail-section">
                  <h4 className="detail-section__title">Notes</h4>
                  <p className="detail-notes">{ots.notes}</p>
                </div>
              )}

              {/* System Information */}
              <div className="detail-section detail-section--meta">
                <h4 className="detail-section__title">System Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-item__label">Created At</span>
                    <span className="detail-item__value">{formatDate(ots.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Updated At</span>
                    <span className="detail-item__value">{formatDate(ots.updatedAt)}</span>
                  </div>
                  {ots.intentCapturedBy && (
                    <div className="detail-item">
                      <span className="detail-item__label">Intent Captured By</span>
                      <span className="detail-item__value">
                        {ots.intentCapturedByName || `User #${ots.intentCapturedBy}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="modal__footer">
          <button className="btn btn--secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// Approval Modal Component
interface ApprovalModalProps {
  isOpen: boolean
  onClose: () => void
  otsId: number | null
  onApprove: (otsId: number, comments?: string) => Promise<void>
  onReject: (otsId: number, reason: string) => Promise<void>
  loading: boolean
}

function ApprovalModal({ isOpen, onClose, otsId, onApprove, onReject, loading }: ApprovalModalProps) {
  const [ots, setOts] = useState<OTSRequest | null>(null)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [comments, setComments] = useState('')
  const [reason, setReason] = useState('')
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && otsId) {
      const fetchOTSDetails = async () => {
        try {
          setFetchLoading(true)
          setFetchError(null)
          const otsData = await otsService.getOTSById(otsId)
          setOts(otsData)
        } catch (err) {
          setFetchError(err instanceof Error ? err.message : 'Failed to fetch OTS details')
          setOts(null)
        } finally {
          setFetchLoading(false)
        }
      }
      fetchOTSDetails()
    } else {
      setOts(null)
      setFetchError(null)
      setAction(null)
      setComments('')
      setReason('')
    }
  }, [isOpen, otsId])

  if (!isOpen || !otsId) return null

  const formatCurrency = (amount: number | undefined): string => {
    if (amount === undefined || amount === null) return '-'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const handleApprove = async () => {
    if (!ots) return
    await onApprove(ots.id, comments)
    setComments('')
    setAction(null)
  }

  const handleReject = async () => {
    if (!ots) return
    if (!reason.trim()) {
      alert('Please provide a rejection reason')
      return
    }
    await onReject(ots.id, reason)
    setReason('')
    setAction(null)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--large" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>Review OTS</h2>
          <button className="modal__close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div className="modal__body">
          {fetchLoading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading OTS details...</p>
            </div>
          ) : fetchError ? (
            <div className="empty-state">
              <p>Error loading OTS</p>
              <span>{fetchError}</span>
            </div>
          ) : !ots ? (
            <div className="empty-state">
              <p>No OTS data available</p>
            </div>
          ) : (
            <div className="ots-detail-content">
              {/* Header */}
              <div className="ots-detail-header">
                <div className="ots-detail-header__info">
                  <h3 className="ots-detail-header__number">{ots.otsNumber}</h3>
                  <span className="ots-detail-header__customer">{ots.customerName}</span>
                </div>
                <span className="badge badge--warning">Pending Approval</span>
              </div>

              {/* Settlement Summary */}
              <div className="approval-summary">
                <div className="approval-summary__item">
                  <span className="approval-summary__label">Original Outstanding</span>
                  <span className="approval-summary__value">
                    {formatCurrency(ots.originalOutstanding || ots.originalAmount)}
                  </span>
                </div>
                <div className="approval-summary__arrow">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="approval-summary__item approval-summary__item--highlight">
                  <span className="approval-summary__label">Settlement Amount</span>
                  <span className="approval-summary__value">
                    {formatCurrency(ots.proposedSettlement || ots.settlementAmount)}
                  </span>
                </div>
                <div className="approval-summary__discount">
                  <span className="approval-summary__discount-label">Discount</span>
                  <span className="approval-summary__discount-value">
                    {ots.discountPercentage?.toFixed(1) || ots.waiverPercentage?.toFixed(1) || '-'}%
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="detail-section">
                <h4 className="detail-section__title">Details</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-item__label">Loan Account</span>
                    <span className="detail-item__value">{ots.loanAccountNumber}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Payment Mode</span>
                    <span className="detail-item__value">{ots.paymentMode || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Payment Deadline</span>
                    <span className="detail-item__value">{formatDate(ots.paymentDeadline)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Borrower Consent</span>
                    <span className="detail-item__value">
                      {ots.borrowerConsent ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {ots.notes && (
                <div className="detail-section">
                  <h4 className="detail-section__title">Notes</h4>
                  <p className="detail-notes">{ots.notes}</p>
                </div>
              )}

              {/* Approval/Rejection Form */}
              {action === 'approve' && (
                <div className="approval-form">
                  <label className="form-label">Approval Comments (Optional)</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Add any comments for this approval..."
                  />
                </div>
              )}

              {action === 'reject' && (
                <div className="approval-form">
                  <label className="form-label">Rejection Reason *</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide a reason for rejection..."
                    required
                  />
                </div>
              )}
            </div>
          )}
        </div>
        <div className="modal__footer">
          {!ots ? (
            <button className="btn btn--secondary" onClick={onClose}>
              Close
            </button>
          ) : !action ? (
            <>
              <button className="btn btn--secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                className="btn btn--danger"
                onClick={() => setAction('reject')}
                disabled={loading || fetchLoading}
              >
                Reject
              </button>
              <button
                className="btn btn--success"
                onClick={() => setAction('approve')}
                disabled={loading || fetchLoading}
              >
                Approve
              </button>
            </>
          ) : action === 'approve' ? (
            <>
              <button className="btn btn--secondary" onClick={() => setAction(null)} disabled={loading}>
                Back
              </button>
              <button className="btn btn--success" onClick={handleApprove} disabled={loading}>
                {loading ? 'Approving...' : 'Confirm Approval'}
              </button>
            </>
          ) : (
            <>
              <button className="btn btn--secondary" onClick={() => setAction(null)} disabled={loading}>
                Back
              </button>
              <button className="btn btn--danger" onClick={handleReject} disabled={loading}>
                {loading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default OTSPage
