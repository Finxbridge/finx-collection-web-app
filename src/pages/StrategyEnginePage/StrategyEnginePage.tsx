/**
 * Strategy Engine Page
 * Main dashboard for managing communication rules and execution workflows
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { strategyEngineService } from '@services/api'
import { Modal } from '@components/common/Modal'
import { RuleCard } from './components/RuleCard'
import { RuleWizard } from './components/RuleWizard'
import type { Rule, StrategyEngineStats, RuleWizardData } from '@types'
import './StrategyEnginePage.css'

type TabType = 'rules' | 'logs'

export function StrategyEnginePage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('rules')
  const [stats, setStats] = useState<StrategyEngineStats | null>(null)
  const [rules, setRules] = useState<Rule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal states
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await strategyEngineService.getStats()
      setStats(data)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }, [])

  // Fetch rules
  const fetchRules = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await strategyEngineService.getRules(0, 50, searchQuery || undefined)
      setRules(response.rules)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rules')
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery])

  useEffect(() => {
    fetchStats()
    fetchRules()
  }, [fetchStats, fetchRules])

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRules()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, fetchRules])

  const handleCreateRule = () => {
    setSelectedRule(null)
    setIsWizardOpen(true)
  }

  const handleEditRule = (rule: Rule) => {
    setSelectedRule(rule)
    setIsWizardOpen(true)
  }

  const handleDeleteClick = (rule: Rule) => {
    setSelectedRule(rule)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedRule) return

    try {
      setIsSubmitting(true)
      await strategyEngineService.deleteRule(selectedRule.id)
      setIsDeleteModalOpen(false)
      setSelectedRule(null)
      setSuccessMessage('Rule deleted successfully')
      fetchRules()
      fetchStats()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete rule')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (rule: Rule) => {
    try {
      await strategyEngineService.toggleRuleStatus(rule.id)
      fetchRules()
      fetchStats()
      setSuccessMessage(`Rule ${rule.status === 'active' ? 'deactivated' : 'activated'} successfully`)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update rule status')
    }
  }

  const handleRunNow = async (rule: Rule) => {
    try {
      await strategyEngineService.runRuleManually(rule.id)
      setSuccessMessage(`Rule "${rule.name}" execution started`)
      fetchRules()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run rule')
    }
  }

  const handleViewLogs = (rule: Rule) => {
    navigate(`/strategy-engine/logs?ruleId=${rule.id}`)
  }

  const handleWizardSubmit = async (data: RuleWizardData) => {
    try {
      setIsSubmitting(true)
      if (selectedRule) {
        await strategyEngineService.updateRule(selectedRule.id, {
          name: data.name,
          description: data.description,
          channel: data.channel!,
          status: selectedRule.status,
          templateId: data.templateId,
          ownership: data.ownership,
          priority: data.priority,
          dpdTrigger: data.dpdTrigger,
          frequency: data.frequency,
          filters: data.filters,
        })
        setSuccessMessage('Rule updated successfully')
      } else {
        await strategyEngineService.createRule({
          name: data.name,
          description: data.description,
          channel: data.channel!,
          status: 'active',
          templateId: data.templateId,
          ownership: data.ownership,
          priority: data.priority,
          dpdTrigger: data.dpdTrigger,
          frequency: data.frequency,
          filters: data.filters,
        })
        setSuccessMessage('Rule created successfully')
      }
      setIsWizardOpen(false)
      setSelectedRule(null)
      fetchRules()
      fetchStats()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save rule')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDateTime = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="strategy-engine-page">
      {/* Header */}
      <div className="strategy-header">
        <div className="strategy-header__content">
          <h1 className="strategy-title">Strategy Engine</h1>
          <p className="strategy-subtitle">
            Manage communication rules and execution workflows
          </p>
        </div>
        <div className="strategy-header__actions">
          <button className="btn-primary" onClick={handleCreateRule}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 5V19M5 12H19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
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

      {/* Stats Grid */}
      {stats && (
        <div className="strategy-stats-grid">
          <div className="strategy-stat-card strategy-stat-card--blue">
            <div className="strategy-stat-card__header">
              <div className="strategy-stat-card__icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className={`strategy-stat-card__trend strategy-stat-card__trend--up`}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                +{stats.activeRulesTrend}%
              </div>
            </div>
            <div className="strategy-stat-card__body">
              <div className="strategy-stat-card__value">{stats.activeRules}</div>
              <div className="strategy-stat-card__title">Active Rules</div>
            </div>
          </div>

          <div className="strategy-stat-card strategy-stat-card--green">
            <div className="strategy-stat-card__header">
              <div className="strategy-stat-card__icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M3 3V21H21M7 16V12M11 16V8M15 16V14M19 16V10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div className="strategy-stat-card__body">
              <div className="strategy-stat-card__value">
                {stats.totalEligible.toLocaleString()}
              </div>
              <div className="strategy-stat-card__title">Total Eligible</div>
            </div>
          </div>

          <div className="strategy-stat-card strategy-stat-card--orange">
            <div className="strategy-stat-card__header">
              <div className="strategy-stat-card__icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div className="strategy-stat-card__body">
              <div className="strategy-stat-card__value">
                {stats.nextScheduledRun ? formatDateTime(stats.nextScheduledRun) : 'N/A'}
              </div>
              <div className="strategy-stat-card__title">Next Scheduled</div>
            </div>
          </div>

          <div className="strategy-stat-card strategy-stat-card--purple">
            <div className="strategy-stat-card__header">
              <div className="strategy-stat-card__icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className={`strategy-stat-card__trend strategy-stat-card__trend--up`}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                +{stats.successRateTrend}%
              </div>
            </div>
            <div className="strategy-stat-card__body">
              <div className="strategy-stat-card__value">{stats.successRate}%</div>
              <div className="strategy-stat-card__title">Success Rate</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="strategy-tabs">
        <button
          className={`strategy-tab ${activeTab === 'rules' ? 'strategy-tab--active' : ''}`}
          onClick={() => setActiveTab('rules')}
        >
          Rules
        </button>
        <button
          className={`strategy-tab ${activeTab === 'logs' ? 'strategy-tab--active' : ''}`}
          onClick={() => navigate('/strategy-engine/logs')}
        >
          Execution Logs
        </button>
      </div>

      {/* Rules Section */}
      <div className="rules-section">
        <div className="rules-section__header">
          <h2 className="rules-section__title">Communication Rules</h2>
          <div className="rules-section__controls">
            <div className="search-box">
              <svg className="search-box__icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type="text"
                className="search-box__input"
                placeholder="Search rules by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="rules-list">
          {isLoading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <span>Loading rules...</span>
            </div>
          ) : rules.length === 0 ? (
            <div className="rules-list--empty">
              <p>No rules found. Click "Create Rule" to add your first communication rule.</p>
            </div>
          ) : (
            rules.map((rule) => (
              <RuleCard
                key={rule.id}
                rule={rule}
                onEdit={() => handleEditRule(rule)}
                onDelete={() => handleDeleteClick(rule)}
                onToggleStatus={() => handleToggleStatus(rule)}
                onRunNow={() => handleRunNow(rule)}
                onViewLogs={() => handleViewLogs(rule)}
              />
            ))
          )}
        </div>
      </div>

      {/* Rule Wizard Modal */}
      <RuleWizard
        isOpen={isWizardOpen}
        onClose={() => {
          setIsWizardOpen(false)
          setSelectedRule(null)
        }}
        onSubmit={handleWizardSubmit}
        editRule={selectedRule}
        isSubmitting={isSubmitting}
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
            <path
              d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
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
    </div>
  )
}

export default StrategyEnginePage
