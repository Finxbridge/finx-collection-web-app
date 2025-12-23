/**
 * Agent Workload Page
 * Dashboard for viewing and managing agent workloads
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { allocationService } from '@services/api'
import type { AgentWorkload } from '@types'
import './AgentWorkloadPage.css'

const GEOGRAPHIES = [
  { code: '', name: 'All Geographies' },
  { code: 'MH_MUM', name: 'Mumbai' },
  { code: 'MH_PUN', name: 'Pune' },
  { code: 'KA_BLR', name: 'Bangalore' },
  { code: 'TN_CHE', name: 'Chennai' },
  { code: 'DL_DEL', name: 'Delhi' },
]

export function AgentWorkloadPage() {
  const navigate = useNavigate()
  const [agents, setAgents] = useState<AgentWorkload[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedGeography, setSelectedGeography] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'utilization' | 'capacity' | 'name'>('utilization')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const fetchAgents = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      const geographies = selectedGeography ? [selectedGeography] : undefined
      const data = await allocationService.getAgentWorkload(undefined, geographies)
      console.log('Agent workload data:', data, 'Count:', data?.length)
      setAgents(data)
    } catch (err) {
      console.error('Error fetching agents:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch agent workload')
    } finally {
      setIsLoading(false)
    }
  }, [selectedGeography])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  const filteredAgents = agents
    .filter((agent) => {
      if (searchQuery) {
        return agent.agentName.toLowerCase().includes(searchQuery.toLowerCase())
      }
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'utilization':
          comparison = a.utilizationPercentage - b.utilizationPercentage
          break
        case 'capacity':
          comparison = a.capacity - b.capacity
          break
        case 'name':
          comparison = a.agentName.localeCompare(b.agentName)
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const getUtilizationClass = (percentage: number) => {
    if (percentage >= 90) return 'utilization--critical'
    if (percentage >= 75) return 'utilization--high'
    if (percentage >= 50) return 'utilization--medium'
    return 'utilization--low'
  }

  const getUtilizationLabel = (percentage: number) => {
    if (percentage >= 90) return 'Critical'
    if (percentage >= 75) return 'High'
    if (percentage >= 50) return 'Medium'
    return 'Low'
  }

  const totalCapacity = agents.reduce((sum, a) => sum + a.capacity, 0)
  const totalAllocated = agents.reduce((sum, a) => sum + a.activeAllocations, 0)
  const avgUtilization = agents.length > 0
    ? agents.reduce((sum, a) => sum + a.utilizationPercentage, 0) / agents.length
    : 0
  const criticalAgents = agents.filter((a) => a.utilizationPercentage >= 90).length

  return (
    <div className="workload-page">
      {/* Header */}
      <div className="workload-header">
        <button className="btn-back" onClick={() => navigate('/allocation')}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Allocation
        </button>
        <div className="workload-header__content">
          <h1 className="workload-title">Agent Workload</h1>
          <p className="workload-subtitle">
            Monitor agent capacity and allocation utilization
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

      {/* Stats Grid */}
      <div className="workload-stats-grid">
        <div className="workload-stat-card">
          <div className="workload-stat-card__icon workload-stat-card__icon--blue">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="workload-stat-card__content">
            <div className="workload-stat-card__value">{agents.length}</div>
            <div className="workload-stat-card__label">Total Agents</div>
          </div>
        </div>

        <div className="workload-stat-card">
          <div className="workload-stat-card__icon workload-stat-card__icon--green">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="workload-stat-card__content">
            <div className="workload-stat-card__value">{totalAllocated}/{totalCapacity}</div>
            <div className="workload-stat-card__label">Allocated/Capacity</div>
          </div>
        </div>

        <div className="workload-stat-card">
          <div className="workload-stat-card__icon workload-stat-card__icon--purple">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 20V10M12 20V4M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="workload-stat-card__content">
            <div className="workload-stat-card__value">{avgUtilization.toFixed(1)}%</div>
            <div className="workload-stat-card__label">Avg Utilization</div>
          </div>
        </div>

        <div className="workload-stat-card">
          <div className="workload-stat-card__icon workload-stat-card__icon--red">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="workload-stat-card__content">
            <div className="workload-stat-card__value">{criticalAgents}</div>
            <div className="workload-stat-card__label">Critical Load</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="workload-filters">
        <div className="search-input-wrapper">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search by agent name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            className="filter-select"
            value={selectedGeography}
            onChange={(e) => setSelectedGeography(e.target.value)}
          >
            {GEOGRAPHIES.map((geo) => (
              <option key={geo.code} value={geo.code}>
                {geo.name}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder]
              setSortBy(newSortBy)
              setSortOrder(newSortOrder)
            }}
          >
            <option value="utilization-desc">Utilization (High to Low)</option>
            <option value="utilization-asc">Utilization (Low to High)</option>
            <option value="capacity-desc">Capacity (High to Low)</option>
            <option value="capacity-asc">Capacity (Low to High)</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Agent Grid */}
      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Loading agents...</span>
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <h3>No agents found</h3>
          <p>No agents match your search criteria</p>
        </div>
      ) : (
        <div className="agent-list">
          {filteredAgents.map((agent) => (
            <div key={agent.agentId} className="agent-row">
              <div className="agent-row__info">
                <div className="agent-row__avatar">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="agent-row__details">
                  <h3 className="agent-row__name">{agent.agentName}</h3>
                  <span className="agent-row__geography">{agent.geography}</span>
                </div>
              </div>

              <div className="agent-row__progress">
                <div className="agent-row__progress-info">
                  <span className="agent-row__progress-label">Utilization</span>
                  <span className="agent-row__progress-value">{agent.utilizationPercentage.toFixed(0)}%</span>
                </div>
                <div className="agent-row__progress-bar">
                  <div
                    className={`agent-row__progress-fill ${getUtilizationClass(agent.utilizationPercentage)}`}
                    style={{ width: `${Math.min(agent.utilizationPercentage, 100)}%` }}
                  />
                </div>
              </div>

              <div className="agent-row__stats">
                <div className="agent-row__stat">
                  <span className="agent-row__stat-value">{agent.activeAllocations}</span>
                  <span className="agent-row__stat-label">Active</span>
                </div>
                <div className="agent-row__stat">
                  <span className="agent-row__stat-value">{agent.capacity}</span>
                  <span className="agent-row__stat-label">Capacity</span>
                </div>
                <div className="agent-row__stat">
                  <span className="agent-row__stat-value">{agent.availableCapacity}</span>
                  <span className="agent-row__stat-label">Available</span>
                </div>
              </div>

              <span className={`utilization-badge ${getUtilizationClass(agent.utilizationPercentage)}`}>
                {getUtilizationLabel(agent.utilizationPercentage)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AgentWorkloadPage
