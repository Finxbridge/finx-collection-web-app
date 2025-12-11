/**
 * Allocation Rules Page
 * Manage allocation rules for automatic case distribution
 * Shows compact list view with navigation to rule details
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { allocationService } from '@services/api'
import { Modal } from '@components/common/Modal'
import { AllocationRuleWizard } from './components/AllocationRuleWizard'
import type { AllocationRule, RuleSimulationResult } from '@types'
import './AllocationRulesPage.css'

export function AllocationRulesPage() {
  const navigate = useNavigate()
  const [rules, setRules] = useState<AllocationRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Modal states
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false)
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [selectedRule, setSelectedRule] = useState<AllocationRule | null>(null)
  const [simulationResult, setSimulationResult] = useState<RuleSimulationResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Navigate to rule details page
  const handleRuleClick = (ruleId: number) => {
    navigate(`/allocation/rules/${ruleId}`)
  }

  const fetchRules = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      const data = await allocationService.getRules()
      setRules(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rules')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRules()
  }, [fetchRules])

  const handleCreateRule = () => {
    setSelectedRule(null)
    setIsWizardOpen(true)
  }

  const handleEditRule = (rule: AllocationRule) => {
    setSelectedRule(rule)
    setIsWizardOpen(true)
  }

  const handleDeleteClick = (rule: AllocationRule) => {
    setSelectedRule(rule)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedRule) return

    try {
      setIsSubmitting(true)
      await allocationService.deleteRule(selectedRule.id)
      setIsDeleteModalOpen(false)
      setSelectedRule(null)
      setSuccessMessage('Rule deleted successfully')
      fetchRules()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete rule')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSimulateClick = async (rule: AllocationRule) => {
    setSelectedRule(rule)
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

  const handleApplyClick = (rule: AllocationRule) => {
    setSelectedRule(rule)
    setIsApplyModalOpen(true)
  }

  const handleApplyConfirm = async () => {
    if (!selectedRule) return

    try {
      setIsSubmitting(true)
      // Apply rule with empty body - agents are auto-detected by backend
      const result = await allocationService.applyRule(selectedRule.id)
      setIsApplyModalOpen(false)
      setSelectedRule(null)
      setSuccessMessage(`Rule applied successfully. ${result.totalCasesAllocated} cases allocated.`)
      fetchRules() // Refresh to show updated status
      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply rule')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleWizardSubmit = async () => {
    setIsWizardOpen(false)
    setSelectedRule(null)
    setSuccessMessage(selectedRule ? 'Rule updated successfully' : 'Rule created successfully')
    fetchRules()
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

  return (
    <div className="rules-page">
      {/* Header */}
      <div className="rules-header">
        <button className="btn-back" onClick={() => navigate('/allocation')}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Allocation
        </button>
        <div className="rules-header__content">
          <div className="rules-header__text">
            <h1 className="rules-title">Allocation Rules</h1>
            <p className="rules-subtitle">
              Create and manage rules for automatic case allocation
            </p>
          </div>
          <button className="btn-primary" onClick={handleCreateRule}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Create Rule
          </button>
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

      {/* Rules List - Compact Table View */}
      <div className="rules-list">
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <span>Loading rules...</span>
          </div>
        ) : rules.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3>No rules created yet</h3>
            <p>Create your first allocation rule to start automating case distribution</p>
            <button className="btn-primary" onClick={handleCreateRule}>
              Create Rule
            </button>
          </div>
        ) : (
          <div className="rules-table-container">
            <table className="rules-table">
              <thead>
                <tr>
                  <th>Rule Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id} className="rule-row">
                    <td>
                      <button
                        className="rule-name-link"
                        onClick={() => handleRuleClick(rule.id)}
                        title="View rule details"
                      >
                        {rule.name}
                      </button>
                    </td>
                    <td>
                      <span className={`badge ${getRuleTypeBadgeClass(rule.ruleType)}`}>
                        {getRuleTypeLabel(rule.ruleType)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${rule.status === 'ACTIVE' ? 'badge--success' : 'badge--default'}`}>
                        {rule.status}
                      </span>
                    </td>
                    <td>
                      <div className="rule-actions">
                        <button
                          className="btn-action-icon btn-action--simulate"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSimulateClick(rule)
                          }}
                          title="Simulate"
                        >
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                            <polygon points="10,8 16,12 10,16" fill="currentColor"/>
                          </svg>
                        </button>
                        <button
                          className="btn-action-icon btn-action--apply"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleApplyClick(rule)
                          }}
                          title="Apply"
                        >
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button
                          className="btn-action-icon btn-action--edit"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditRule(rule)
                          }}
                          title="Edit"
                        >
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button
                          className="btn-action-icon btn-action--delete"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteClick(rule)
                          }}
                          title="Delete"
                        >
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

      {/* Rule Wizard Modal */}
      <AllocationRuleWizard
        isOpen={isWizardOpen}
        onClose={() => {
          setIsWizardOpen(false)
          setSelectedRule(null)
        }}
        onSubmit={handleWizardSubmit}
        editRule={selectedRule}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedRule(null)
        }}
        title="Delete Rule"
        size="sm"
      >
        <div className="delete-modal-content">
          <svg className="delete-modal-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>Are you sure?</h3>
          <p>
            This will permanently delete the rule <strong>"{selectedRule?.name}"</strong>.
            This action cannot be undone.
          </p>
          <div className="delete-modal-actions">
            <button
              className="btn-secondary"
              onClick={() => {
                setIsDeleteModalOpen(false)
                setSelectedRule(null)
              }}
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
          setSelectedRule(null)
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
                    setSelectedRule(null)
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
                    if (selectedRule) {
                      handleApplyClick(selectedRule)
                    }
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
        onClose={() => {
          setIsApplyModalOpen(false)
          setSelectedRule(null)
        }}
        title="Apply Rule"
        size="sm"
      >
        <div className="apply-modal-content">
          <svg className="apply-modal-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>Apply Allocation Rule?</h3>
          <p>
            This will apply the rule <strong>"{selectedRule?.name}"</strong> and allocate matching cases to agents.
          </p>
          <div className="apply-modal-actions">
            <button
              className="btn-secondary"
              onClick={() => {
                setIsApplyModalOpen(false)
                setSelectedRule(null)
              }}
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

export default AllocationRulesPage
