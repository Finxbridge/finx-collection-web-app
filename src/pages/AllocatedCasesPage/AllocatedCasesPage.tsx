/**
 * Allocated Cases Page
 * View all cases that have been allocated to agents
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { allocationService } from '@services/api'
import type { AllocatedCase } from '@types'
import './AllocatedCasesPage.css'

export function AllocatedCasesPage() {
  const navigate = useNavigate()
  const [cases, setCases] = useState<AllocatedCase[]>([])
  const [filteredCases, setFilteredCases] = useState<AllocatedCase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchCases = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      const data = await allocationService.getAllocatedCases()
      setCases(data)
      setFilteredCases(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch allocated cases')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCases()
  }, [fetchCases])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCases(cases)
    } else {
      const term = searchTerm.toLowerCase()
      const filtered = cases.filter(
        (c) =>
          c.caseId.toString().includes(term) ||
          c.primaryAgent.username.toLowerCase().includes(term) ||
          (c.secondaryAgent && c.secondaryAgent.username.toLowerCase().includes(term))
      )
      setFilteredCases(filtered)
    }
  }, [searchTerm, cases])

  const formatDateTime = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num)
  }

  if (isLoading) {
    return (
      <div className="allocated-cases-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Loading allocated cases...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="allocated-cases-page">
      {/* Header */}
      <div className="allocated-cases-page__header">
        <button className="btn-back" onClick={() => navigate('/allocation')}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Allocation
        </button>
        <div className="allocated-cases-page__header-content">
          <div>
            <h1 className="allocated-cases-page__title">Allocated Cases</h1>
            <p className="allocated-cases-page__subtitle">
              Cases currently allocated to agents
            </p>
          </div>
          <div className="allocated-cases-page__stats">
            <div className="stat-chip">
              <span className="stat-chip__value">{formatNumber(cases.length)}</span>
              <span className="stat-chip__label">Total Cases</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert--error">
          <span>{error}</span>
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="allocated-cases-page__filters">
        <div className="search-input-wrapper">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search by case ID or agent name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn-secondary" onClick={fetchCases}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3.51 15C4.15839 16.8404 5.38734 18.4202 7.01166 19.5014C8.63598 20.5826 10.5677 21.1066 12.5157 20.9945C14.4637 20.8824 16.3226 20.1402 17.8121 18.8798C19.3017 17.6193 20.3413 15.9067 20.7742 14C21.2072 12.0933 21.0101 10.0958 20.2126 8.31569C19.4152 6.53557 18.0605 5.06901 16.3528 4.13413C14.6451 3.19925 12.6769 2.84538 10.7447 3.12286C8.81245 3.40034 7.02091 4.29454 5.64 5.68L1 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Cases Table */}
      <div className="allocated-cases-page__content">
        {filteredCases.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3>No allocated cases found</h3>
            <p>{searchTerm ? 'Try adjusting your search criteria' : 'No cases have been allocated yet'}</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="cases-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Primary Agent</th>
                  <th>Secondary Agent</th>
                  <th>Allocated At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((caseItem) => (
                  <tr key={caseItem.caseId}>
                    <td className="case-id">{caseItem.caseId}</td>
                    <td>
                      <div className="agent-info">
                        <span className="agent-name">{caseItem.primaryAgent.username}</span>
                        <span className="agent-id">ID: {caseItem.primaryAgent.userId}</span>
                      </div>
                    </td>
                    <td>
                      {caseItem.secondaryAgent ? (
                        <div className="agent-info">
                          <span className="agent-name">{caseItem.secondaryAgent.username}</span>
                          <span className="agent-id">ID: {caseItem.secondaryAgent.userId}</span>
                        </div>
                      ) : (
                        <span className="no-agent">-</span>
                      )}
                    </td>
                    <td className="allocated-at">{formatDateTime(caseItem.allocatedAt)}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn-icon"
                          onClick={() => navigate(`/case-sourcing/cases/${caseItem.caseId}`)}
                          title="View Case Details"
                        >
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => navigate(`/allocation/reallocation?fromAgent=${caseItem.primaryAgent.userId}`)}
                          title="Reallocate"
                        >
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 1L21 5L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M3 11V9C3 7.93913 3.42143 6.92172 4.17157 6.17157C4.92172 5.42143 5.93913 5 7 5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M7 23L3 19L7 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 13V15C21 16.0609 20.5786 17.0783 19.8284 17.8284C19.0783 18.5786 18.0609 19 17 19H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AllocatedCasesPage
