/**
 * Rule Details Page
 * Shows detailed information about a specific allocation rule
 * API: GET /allocations/rules/:ruleId
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { allocationService } from '@services/api'
import { Modal } from '@components/common/Modal'
import { AllocationRuleWizard } from './components/AllocationRuleWizard'
import type { AllocationRule, RuleSimulationResult } from '@types'
import './RuleDetailsPage.css'

export function RuleDetailsPage() {
  const navigate = useNavigate()
  const { ruleId } = useParams<{ ruleId: string }>()

  const [rule, setRule] = useState<AllocationRule | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Modal states
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false)
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [simulationResult, setSimulationResult] = useState<RuleSimulationResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchRule = useCallback(async () => {
    if (!ruleId) return

    try {
      setIsLoading(true)
      setError('')
      const data = await allocationService.getRuleById(Number(ruleId))
      setRule(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rule details')
    } finally {
      setIsLoading(false)
    }
  }, [ruleId])

  useEffect(() => {
    fetchRule()
  }, [fetchRule])

  const handleEditRule = () => {
    setIsWizardOpen(true)
  }

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!rule) return

    try {
      setIsSubmitting(true)
      await allocationService.deleteRule(rule.id)
      setIsDeleteModalOpen(false)
      setSuccessMessage('Rule deleted successfully')
      setTimeout(() => {
        navigate('/allocation/rules')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete rule')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSimulateClick = async () => {
    if (!rule) return

    setIsSimulateModalOpen(true)
    try {
      setIsSubmitting(true)
      const result = await allocationService.simulateRule(rule.id)
      setSimulationResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to simulate rule')
      setIsSimulateModalOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApplyClick = () => {
    setIsApplyModalOpen(true)
  }

  const handleApplyConfirm = async () => {
    if (!rule) return

    try {
      setIsSubmitting(true)
      // Apply rule with empty body - agents are auto-detected by backend
      const result = await allocationService.applyRule(rule.id)
      setIsApplyModalOpen(false)
      setSuccessMessage(`Rule applied successfully. ${result.totalCasesAllocated} cases allocated.`)
      fetchRule() // Refresh to show updated status
      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply rule')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleWizardSubmit = async () => {
    setIsWizardOpen(false)
    setSuccessMessage('Rule updated successfully')
    fetchRule()
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const getRuleTypeLabel = (type: string) => {
    switch (type) {
      case 'PERCENTAGE_SPLIT':
        return 'Percentage Split'
      case 'CAPACITY_BASED':
        return 'Capacity Based'
      case 'GEOGRAPHY':
        return 'Geography'
      default:
        return type
    }
  }

  const getRuleTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'PERCENTAGE_SPLIT':
        return 'badge--blue'
      case 'CAPACITY_BASED':
        return 'badge--purple'
      case 'GEOGRAPHY':
        return 'badge--green'
      default:
        return 'badge--default'
    }
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

  if (isLoading) {
    return (
      <div className="rule-details-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Loading rule details...</span>
        </div>
      </div>
    )
  }

  if (error && !rule) {
    return (
      <div className="rule-details-page">
        <div className="error-container">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>Failed to load rule</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={() => navigate('/allocation/rules')}>
            Back to Rules
          </button>
        </div>
      </div>
    )
  }

  if (!rule) return null

  return (
    <div className="rule-details-page">
      {/* Header */}
      <div className="rule-details-header">
        <button className="btn-back" onClick={() => navigate('/allocation/rules')}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Rules
        </button>
        <div className="rule-details-header__content">
          <div className="rule-details-header__text">
            <div className="rule-details-header__title-row">
              <h1 className="rule-details-title">{rule.name}</h1>
              <div className="rule-details-badges">
                <span className={`badge ${getRuleTypeBadgeClass(rule.ruleType)}`}>
                  {getRuleTypeLabel(rule.ruleType)}
                </span>
                <span className={`badge ${rule.status === 'ACTIVE' ? 'badge--success' : 'badge--default'}`}>
                  {rule.status}
                </span>
              </div>
            </div>
            {rule.description && (
              <p className="rule-details-description">{rule.description}</p>
            )}
          </div>
          <div className="rule-details-header__actions">
            <button className="btn-action btn-action--simulate" onClick={handleSimulateClick}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <polygon points="10,8 16,12 10,16" fill="currentColor"/>
              </svg>
              Simulate
            </button>
            <button className="btn-action btn-action--apply" onClick={handleApplyClick}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Apply
            </button>
            <button className="btn-action btn-action--edit" onClick={handleEditRule}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Edit
            </button>
            <button className="btn-action btn-action--delete" onClick={handleDeleteClick}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert--error">
          <span>{error}</span>
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}
      {successMessage && (
        <div className="alert alert--success">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')}>Dismiss</button>
        </div>
      )}

      {/* Rule Details Card */}
      <div className="rule-details-card">
        <h2 className="rule-details-card__title">Rule Configuration</h2>

        <div className="rule-details-grid">
          <div className="rule-detail-item">
            <span className="rule-detail-item__label">Rule Type</span>
            <span className="rule-detail-item__value">{getRuleTypeLabel(rule.ruleType)}</span>
          </div>

          <div className="rule-detail-item">
            <span className="rule-detail-item__label">Status</span>
            <span className="rule-detail-item__value">{rule.status}</span>
          </div>

          <div className="rule-detail-item">
            <span className="rule-detail-item__label">Priority</span>
            <span className="rule-detail-item__value">{rule.priority}</span>
          </div>

          {/* Geography fields - only shown for GEOGRAPHY rule type */}
          {rule.ruleType === 'GEOGRAPHY' && (
            <>
              {rule.states && rule.states.length > 0 && (
                <div className="rule-detail-item rule-detail-item--full">
                  <span className="rule-detail-item__label">States</span>
                  <div className="rule-detail-item__tags">
                    {rule.states.map((state) => (
                      <span key={state} className="tag">{state}</span>
                    ))}
                  </div>
                </div>
              )}

              {rule.cities && rule.cities.length > 0 && (
                <div className="rule-detail-item rule-detail-item--full">
                  <span className="rule-detail-item__label">Cities</span>
                  <div className="rule-detail-item__tags">
                    {rule.cities.map((city) => (
                      <span key={city} className="tag">{city}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Info about how the rule works */}
          <div className="rule-detail-item rule-detail-item--full">
            <span className="rule-detail-item__label">How It Works</span>
            <div className="rule-detail-item__info">
              {rule.ruleType === 'GEOGRAPHY' ? (
                <p>This rule matches unallocated cases to agents based on geographic location. Cases are filtered by the selected state/city, and agents are auto-detected based on their state/city profile settings.</p>
              ) : (
                <p>This rule distributes ALL unallocated cases to ALL active agents based on their current workload capacity. Agents with fewer cases get priority (workload equalization).</p>
              )}
            </div>
          </div>
        </div>

        <div className="rule-details-meta">
          <span>Created: {formatDateTime(rule.createdAt)}</span>
          <span>Last Updated: {formatDateTime(rule.updatedAt)}</span>
          <span>Created By: User #{rule.createdBy}</span>
        </div>
      </div>

      {/* Rule Wizard Modal */}
      <AllocationRuleWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSubmit={handleWizardSubmit}
        editRule={rule}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Rule"
        size="sm"
      >
        <div className="delete-modal-content">
          <svg className="delete-modal-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>Are you sure?</h3>
          <p>
            This will permanently delete the rule <strong>"{rule.name}"</strong>.
            This action cannot be undone.
          </p>
          <div className="delete-modal-actions">
            <button
              className="btn-secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className="btn-danger"
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete Rule'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Simulation Results Modal */}
      <Modal
        isOpen={isSimulateModalOpen}
        onClose={() => {
          setIsSimulateModalOpen(false)
          setSimulationResult(null)
        }}
        title="Simulation Results"
        size="md"
      >
        <div className="simulation-modal-content">
          {isSubmitting ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <span>Running simulation...</span>
            </div>
          ) : simulationResult ? (
            <>
              <div className="simulation-summary">
                <div className="simulation-stat">
                  <span className="simulation-stat__value">{simulationResult.unallocatedCases}</span>
                  <span className="simulation-stat__label">Unallocated Cases</span>
                </div>
                <div className="simulation-stat">
                  <span className="simulation-stat__value">{simulationResult.eligibleAgents.length}</span>
                  <span className="simulation-stat__label">Eligible Agents</span>
                </div>
              </div>

              <h4>Eligible Agents & Suggested Distribution</h4>
              <div className="simulation-agents">
                {simulationResult.eligibleAgents.map((agent) => (
                  <div key={agent.agentId} className="simulation-agent">
                    <div className="simulation-agent__info">
                      <span className="simulation-agent__name">{agent.agentName}</span>
                      <span className="simulation-agent__meta">
                        Capacity: {agent.capacity} | Current: {agent.currentWorkload} | Available: {agent.availableCapacity}
                      </span>
                    </div>
                    <span className="simulation-agent__count">
                      {simulationResult.suggestedDistribution[agent.agentId.toString()] || 0} cases
                    </span>
                  </div>
                ))}
              </div>

              <div className="simulation-actions">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setIsSimulateModalOpen(false)
                    setSimulationResult(null)
                  }}
                >
                  Close
                </button>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setIsSimulateModalOpen(false)
                    setSimulationResult(null)
                    handleApplyClick()
                  }}
                >
                  Apply Rule
                </button>
              </div>
            </>
          ) : null}
        </div>
      </Modal>

      {/* Apply Confirmation Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply Rule"
        size="sm"
      >
        <div className="apply-modal-content">
          <svg className="apply-modal-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>Apply Allocation Rule?</h3>
          <p>
            This will apply the rule <strong>"{rule.name}"</strong> and allocate matching cases to agents.
          </p>
          <div className="apply-modal-actions">
            <button
              className="btn-secondary"
              onClick={() => setIsApplyModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleApplyConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Applying...' : 'Apply Rule'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default RuleDetailsPage
