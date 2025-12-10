/**
 * Allocation Rule Wizard Component
 * Multi-step wizard for creating and editing allocation rules
 */

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { allocationService } from '@services/api'
import type { AllocationRule, AllocationRuleCreate, RuleType, AgentWorkload } from '@types'
import './AllocationRuleWizard.css'

interface AllocationRuleWizardProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
  editRule: AllocationRule | null
}

type WizardStep = 'basic' | 'type' | 'geography' | 'agents' | 'review'

const STEPS: { key: WizardStep; label: string }[] = [
  { key: 'basic', label: 'Basic Info' },
  { key: 'type', label: 'Rule Type' },
  { key: 'geography', label: 'Geography' },
  { key: 'agents', label: 'Agents' },
  { key: 'review', label: 'Review' },
]

const RULE_TYPES: { value: RuleType; label: string; description: string }[] = [
  {
    value: 'PERCENTAGE_SPLIT',
    label: 'Percentage Split',
    description: 'Distribute cases among agents based on percentage allocation',
  },
  {
    value: 'CAPACITY_BASED',
    label: 'Capacity Based',
    description: 'Allocate based on agent capacity and current workload',
  },
  {
    value: 'GEOGRAPHY',
    label: 'Geography',
    description: 'Allocate cases based on geographic region mapping',
  },
]

const DPD_BUCKETS = ['0-30', '30-60', '60-90', '90+']

const GEOGRAPHIES = [
  { code: 'MH_MUM', name: 'Mumbai, Maharashtra' },
  { code: 'MH_PUN', name: 'Pune, Maharashtra' },
  { code: 'KA_BLR', name: 'Bangalore, Karnataka' },
  { code: 'TN_CHE', name: 'Chennai, Tamil Nadu' },
  { code: 'DL_DEL', name: 'Delhi' },
  { code: 'UP_NCR', name: 'NCR, Uttar Pradesh' },
  { code: 'GJ_AMD', name: 'Ahmedabad, Gujarat' },
  { code: 'WB_KOL', name: 'Kolkata, West Bengal' },
]

interface FormData {
  name: string
  description: string
  ruleType: RuleType | ''
  geographies: string[]
  buckets: string[]
  maxCasesPerAgent: number
  agentIds: number[]
  percentages: number[]
  priority: number
}

export function AllocationRuleWizard({
  isOpen,
  onClose,
  onSubmit,
  editRule,
}: AllocationRuleWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('basic')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [agents, setAgents] = useState<AgentWorkload[]>([])
  const [isLoadingAgents, setIsLoadingAgents] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    ruleType: '',
    geographies: [],
    buckets: [],
    maxCasesPerAgent: 50,
    agentIds: [],
    percentages: [],
    priority: 1,
  })

  // Fetch agents from API
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setIsLoadingAgents(true)
        const workloadData = await allocationService.getAgentWorkload()
        setAgents(workloadData)
      } catch (err) {
        console.error('Failed to fetch agents:', err)
        setAgents([])
      } finally {
        setIsLoadingAgents(false)
      }
    }

    if (isOpen) {
      fetchAgents()
    }
  }, [isOpen])

  // Initialize form with edit data
  useEffect(() => {
    if (editRule) {
      setFormData({
        name: editRule.name,
        description: editRule.description || '',
        ruleType: editRule.ruleType,
        geographies: editRule.geographies,
        buckets: editRule.buckets || [],
        maxCasesPerAgent: editRule.maxCasesPerAgent || 50,
        agentIds: editRule.agentIds || [],
        percentages: editRule.percentages || [],
        priority: editRule.priority,
      })
    } else {
      setFormData({
        name: '',
        description: '',
        ruleType: '',
        geographies: [],
        buckets: [],
        maxCasesPerAgent: 50,
        agentIds: [],
        percentages: [],
        priority: 1,
      })
    }
    setCurrentStep('basic')
    setError('')
  }, [editRule, isOpen])

  const getCurrentStepIndex = () => STEPS.findIndex((s) => s.key === currentStep)

  const goToNextStep = () => {
    const currentIndex = getCurrentStepIndex()
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].key)
    }
  }

  const goToPrevStep = () => {
    const currentIndex = getCurrentStepIndex()
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].key)
    }
  }

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 'basic':
        if (!formData.name.trim()) {
          setError('Rule name is required')
          return false
        }
        break
      case 'type':
        if (!formData.ruleType) {
          setError('Please select a rule type')
          return false
        }
        break
      case 'geography':
        if (formData.geographies.length === 0) {
          setError('Please select at least one geography')
          return false
        }
        break
      case 'agents':
        if (formData.agentIds.length === 0) {
          setError('Please select at least one agent')
          return false
        }
        if (formData.ruleType === 'PERCENTAGE_SPLIT') {
          const totalPercentage = formData.percentages.reduce((sum, p) => sum + p, 0)
          if (totalPercentage !== 100) {
            setError('Percentages must add up to 100%')
            return false
          }
        }
        break
    }
    setError('')
    return true
  }

  const handleNext = () => {
    if (validateStep()) {
      goToNextStep()
    }
  }

  const handleSubmit = async () => {
    if (!validateStep()) return

    try {
      setIsSubmitting(true)
      setError('')

      const ruleData: AllocationRuleCreate = {
        name: formData.name,
        description: formData.description || undefined,
        ruleType: formData.ruleType as RuleType,
        geographies: formData.geographies,
        buckets: formData.buckets.length > 0 ? formData.buckets : undefined,
        maxCasesPerAgent: formData.maxCasesPerAgent,
        agentIds: formData.agentIds,
        percentages: formData.ruleType === 'PERCENTAGE_SPLIT' ? formData.percentages : undefined,
        priority: formData.priority,
      }

      if (editRule) {
        await allocationService.updateRule(editRule.id, ruleData)
      } else {
        await allocationService.createRule(ruleData)
      }

      onSubmit()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save rule')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleGeography = (code: string) => {
    setFormData((prev) => ({
      ...prev,
      geographies: prev.geographies.includes(code)
        ? prev.geographies.filter((g) => g !== code)
        : [...prev.geographies, code],
    }))
  }

  const toggleBucket = (bucket: string) => {
    setFormData((prev) => ({
      ...prev,
      buckets: prev.buckets.includes(bucket)
        ? prev.buckets.filter((b) => b !== bucket)
        : [...prev.buckets, bucket],
    }))
  }

  const toggleAgent = (agentId: number) => {
    setFormData((prev) => {
      const isSelected = prev.agentIds.includes(agentId)
      if (isSelected) {
        const index = prev.agentIds.indexOf(agentId)
        return {
          ...prev,
          agentIds: prev.agentIds.filter((id) => id !== agentId),
          percentages: prev.percentages.filter((_, i) => i !== index),
        }
      } else {
        return {
          ...prev,
          agentIds: [...prev.agentIds, agentId],
          percentages: [...prev.percentages, 0],
        }
      }
    })
  }

  const updatePercentage = (index: number, value: number) => {
    setFormData((prev) => ({
      ...prev,
      percentages: prev.percentages.map((p, i) => (i === index ? value : p)),
    }))
  }

  const distributeEvenly = () => {
    const count = formData.agentIds.length
    if (count === 0) return
    const evenShare = Math.floor(100 / count)
    const remainder = 100 - evenShare * count
    setFormData((prev) => ({
      ...prev,
      percentages: prev.agentIds.map((_, i) => (i === 0 ? evenShare + remainder : evenShare)),
    }))
  }

  const getRuleTypeLabel = (type: string) => {
    return RULE_TYPES.find((t) => t.value === type)?.label || type
  }

  if (!isOpen) return null

  const modalContent = (
    <div className="wizard-overlay" onClick={onClose}>
      <div className="wizard-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wizard-header">
          <h2 className="wizard-title">
            {editRule ? 'Edit Allocation Rule' : 'Create Allocation Rule'}
          </h2>
          <button className="wizard-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Stepper */}
        <div className="wizard-stepper">
          {STEPS.map((step, index) => (
            <div
              key={step.key}
              className={`wizard-step ${currentStep === step.key ? 'wizard-step--active' : ''} ${
                index < getCurrentStepIndex() ? 'wizard-step--completed' : ''
              }`}
            >
              <div className="wizard-step__number">
                {index < getCurrentStepIndex() ? (
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span className="wizard-step__label">{step.label}</span>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="wizard-error">
            <span>{error}</span>
          </div>
        )}

        {/* Content */}
        <div className="wizard-content">
          {/* Step 1: Basic Info */}
          {currentStep === 'basic' && (
            <div className="wizard-step-content">
              <h3>Basic Information</h3>
              <p>Enter the basic details for your allocation rule</p>

              <div className="form-group">
                <label className="form-label">Rule Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter rule name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  placeholder="Enter rule description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <input
                  type="number"
                  className="form-input form-input--small"
                  min={1}
                  max={100}
                  value={formData.priority}
                  onChange={(e) => setFormData((prev) => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                />
                <span className="form-hint">Lower number = higher priority</span>
              </div>
            </div>
          )}

          {/* Step 2: Rule Type */}
          {currentStep === 'type' && (
            <div className="wizard-step-content">
              <h3>Select Rule Type</h3>
              <p>Choose how cases should be allocated to agents</p>

              <div className="rule-type-options">
                {RULE_TYPES.map((type) => (
                  <button
                    key={type.value}
                    className={`rule-type-card ${formData.ruleType === type.value ? 'rule-type-card--selected' : ''}`}
                    onClick={() => setFormData((prev) => ({ ...prev, ruleType: type.value }))}
                  >
                    <div className="rule-type-card__header">
                      <span className="rule-type-card__title">{type.label}</span>
                      {formData.ruleType === type.value && (
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <p className="rule-type-card__description">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Geography */}
          {currentStep === 'geography' && (
            <div className="wizard-step-content">
              <h3>Select Geographies</h3>
              <p>Choose the geographic regions this rule applies to</p>

              <div className="geography-grid">
                {GEOGRAPHIES.map((geo) => (
                  <button
                    key={geo.code}
                    className={`geography-card ${formData.geographies.includes(geo.code) ? 'geography-card--selected' : ''}`}
                    onClick={() => toggleGeography(geo.code)}
                  >
                    <span className="geography-card__code">{geo.code}</span>
                    <span className="geography-card__name">{geo.name}</span>
                    {formData.geographies.includes(geo.code) && (
                      <svg className="geography-card__check" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              <div className="form-group">
                <label className="form-label">DPD Buckets (Optional)</label>
                <div className="bucket-options">
                  {DPD_BUCKETS.map((bucket) => (
                    <button
                      key={bucket}
                      className={`bucket-btn ${formData.buckets.includes(bucket) ? 'bucket-btn--selected' : ''}`}
                      onClick={() => toggleBucket(bucket)}
                    >
                      {bucket}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Agents */}
          {currentStep === 'agents' && (
            <div className="wizard-step-content">
              <h3>Assign Agents</h3>
              <p>Select agents and configure allocation settings</p>

              <div className="form-group">
                <label className="form-label">Max Cases Per Agent</label>
                <input
                  type="number"
                  className="form-input form-input--small"
                  min={1}
                  max={500}
                  value={formData.maxCasesPerAgent}
                  onChange={(e) => setFormData((prev) => ({ ...prev, maxCasesPerAgent: parseInt(e.target.value) || 50 }))}
                />
              </div>

              <div className="agents-section">
                <div className="agents-section__header">
                  <label className="form-label">Select Agents *</label>
                  {formData.ruleType === 'PERCENTAGE_SPLIT' && formData.agentIds.length > 0 && (
                    <button className="btn-link" onClick={distributeEvenly}>
                      Distribute Evenly
                    </button>
                  )}
                </div>

                {isLoadingAgents ? (
                  <div className="agents-loading">Loading agents...</div>
                ) : agents.length === 0 ? (
                  <div className="agents-empty">No agents found</div>
                ) : (
                  <div className="agent-list">
                    {agents.map((agent) => (
                      <div
                        key={agent.agentId}
                        className={`agent-card ${formData.agentIds.includes(agent.agentId) ? 'agent-card--selected' : ''}`}
                      >
                        <div className="agent-card__main" onClick={() => toggleAgent(agent.agentId)}>
                          <div className="agent-card__checkbox">
                            {formData.agentIds.includes(agent.agentId) && (
                              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                          <div className="agent-card__info">
                            <span className="agent-card__name">{agent.agentName}</span>
                            <span className="agent-card__meta">
                              {agent.geography} | Capacity: {agent.capacity} | Available: {agent.availableCapacity}
                            </span>
                          </div>
                        </div>
                        {formData.ruleType === 'PERCENTAGE_SPLIT' && formData.agentIds.includes(agent.agentId) && (
                          <div className="agent-card__percentage">
                            <input
                              type="number"
                              className="percentage-input"
                              min={0}
                              max={100}
                              value={formData.percentages[formData.agentIds.indexOf(agent.agentId)] || 0}
                              onChange={(e) => updatePercentage(formData.agentIds.indexOf(agent.agentId), parseInt(e.target.value) || 0)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span>%</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {formData.ruleType === 'PERCENTAGE_SPLIT' && formData.agentIds.length > 0 && (
                  <div className="percentage-total">
                    Total: {formData.percentages.reduce((sum, p) => sum + p, 0)}%
                    {formData.percentages.reduce((sum, p) => sum + p, 0) !== 100 && (
                      <span className="percentage-total--error"> (must equal 100%)</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 'review' && (
            <div className="wizard-step-content">
              <h3>Review & Confirm</h3>
              <p>Review your allocation rule before saving</p>

              <div className="review-section">
                <div className="review-item">
                  <span className="review-item__label">Rule Name</span>
                  <span className="review-item__value">{formData.name}</span>
                </div>
                {formData.description && (
                  <div className="review-item">
                    <span className="review-item__label">Description</span>
                    <span className="review-item__value">{formData.description}</span>
                  </div>
                )}
                <div className="review-item">
                  <span className="review-item__label">Rule Type</span>
                  <span className="review-item__value">{getRuleTypeLabel(formData.ruleType)}</span>
                </div>
                <div className="review-item">
                  <span className="review-item__label">Priority</span>
                  <span className="review-item__value">{formData.priority}</span>
                </div>
                <div className="review-item">
                  <span className="review-item__label">Geographies</span>
                  <span className="review-item__value">{formData.geographies.join(', ')}</span>
                </div>
                {formData.buckets.length > 0 && (
                  <div className="review-item">
                    <span className="review-item__label">DPD Buckets</span>
                    <span className="review-item__value">{formData.buckets.join(', ')}</span>
                  </div>
                )}
                <div className="review-item">
                  <span className="review-item__label">Max Cases/Agent</span>
                  <span className="review-item__value">{formData.maxCasesPerAgent}</span>
                </div>
                <div className="review-item">
                  <span className="review-item__label">Agents</span>
                  <span className="review-item__value">
                    {formData.agentIds.map((id, i) => {
                      const agent = agents.find((a) => a.agentId === id)
                      const percentage = formData.ruleType === 'PERCENTAGE_SPLIT' ? ` (${formData.percentages[i]}%)` : ''
                      return agent ? `${agent.agentName}${percentage}` : id
                    }).join(', ')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="wizard-footer">
          <button
            className="btn-secondary"
            onClick={getCurrentStepIndex() === 0 ? onClose : goToPrevStep}
          >
            {getCurrentStepIndex() === 0 ? 'Cancel' : 'Back'}
          </button>
          {currentStep === 'review' ? (
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : editRule ? 'Update Rule' : 'Create Rule'}
            </button>
          ) : (
            <button className="btn-primary" onClick={handleNext}>
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default AllocationRuleWizard
