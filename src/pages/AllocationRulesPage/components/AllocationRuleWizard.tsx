/**
 * Allocation Rule Wizard Component
 * Multi-step wizard for creating and editing allocation rules
 *
 * Supports two rule types:
 * 1. GEOGRAPHY - Matches cases to agents based on geographic location (state/city)
 * 2. CAPACITY_BASED - Distributes ALL unallocated cases to ALL active agents
 */

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { allocationService, masterDataService } from '@services/api'
import type { AllocationRule, AllocationRuleCreate, RuleType, MasterData } from '@types'
import './AllocationRuleWizard.css'

interface AllocationRuleWizardProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
  editRule: AllocationRule | null
}

type WizardStep = 'basic' | 'type' | 'geography' | 'review'

// Steps are dynamically determined based on rule type
const getStepsForRuleType = (ruleType: RuleType | ''): { key: WizardStep; label: string }[] => {
  const baseSteps = [
    { key: 'basic' as WizardStep, label: 'Basic Info' },
    { key: 'type' as WizardStep, label: 'Rule Type' },
  ]

  // GEOGRAPHY requires geography selection step
  // CAPACITY_BASED skips geography (allocates ALL cases to ALL agents)
  if (ruleType === 'GEOGRAPHY') {
    return [...baseSteps, { key: 'geography' as WizardStep, label: 'Geography' }, { key: 'review' as WizardStep, label: 'Review' }]
  }

  // CAPACITY_BASED or not selected yet - no geography step needed
  return [...baseSteps, { key: 'review' as WizardStep, label: 'Review' }]
}

const RULE_TYPES: { value: RuleType; label: string; description: string }[] = [
  {
    value: 'GEOGRAPHY',
    label: 'Geography',
    description: 'Matches cases to agents based on geographic location (state/city matching). Agent state and city fields must be set in user profile.',
  },
  {
    value: 'CAPACITY_BASED',
    label: 'Capacity Based',
    description: 'Distributes ALL unallocated cases to ALL active agents based on workload capacity. Agents with fewer cases get priority.',
  },
]

// Master data type constants for states and cities
const MASTER_DATA_TYPES = {
  STATE: 'STATE',
  CITY: 'CITY',
}

interface FormData {
  name: string
  description: string
  ruleType: RuleType | ''
  // Geography fields (required for GEOGRAPHY rule type only)
  states: string[]
  cities: string[]
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

  // Master data for states and cities
  const [masterStates, setMasterStates] = useState<MasterData[]>([])
  const [masterCities, setMasterCities] = useState<MasterData[]>([])
  const [isLoadingMasterData, setIsLoadingMasterData] = useState(false)

  // Dropdown open states
  const [isStatesDropdownOpen, setIsStatesDropdownOpen] = useState(false)
  const [isCitiesDropdownOpen, setIsCitiesDropdownOpen] = useState(false)
  const [statesSearchTerm, setStatesSearchTerm] = useState('')
  const [citiesSearchTerm, setCitiesSearchTerm] = useState('')

  // Refs for click outside detection
  const statesDropdownRef = useRef<HTMLDivElement>(null)
  const citiesDropdownRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    ruleType: '',
    states: [],
    cities: [],
    priority: 1,
  })

  // Get steps based on current rule type
  const steps = getStepsForRuleType(formData.ruleType)

  // Fetch master data for states and cities
  useEffect(() => {
    const fetchMasterData = async () => {
      if (!isOpen) return

      try {
        setIsLoadingMasterData(true)
        const [statesData, citiesData] = await Promise.all([
          masterDataService.getByType(MASTER_DATA_TYPES.STATE),
          masterDataService.getByType(MASTER_DATA_TYPES.CITY),
        ])
        // Filter only active entries and sort by displayOrder
        setMasterStates(statesData.filter(s => s.isActive).sort((a, b) => a.displayOrder - b.displayOrder))
        setMasterCities(citiesData.filter(c => c.isActive).sort((a, b) => a.displayOrder - b.displayOrder))
      } catch (err) {
        console.error('Failed to fetch master data:', err)
        // Set empty arrays on error - UI will show appropriate message
        setMasterStates([])
        setMasterCities([])
      } finally {
        setIsLoadingMasterData(false)
      }
    }

    fetchMasterData()
  }, [isOpen])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statesDropdownRef.current && !statesDropdownRef.current.contains(event.target as Node)) {
        setIsStatesDropdownOpen(false)
      }
      if (citiesDropdownRef.current && !citiesDropdownRef.current.contains(event.target as Node)) {
        setIsCitiesDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Initialize form with edit data
  useEffect(() => {
    if (editRule) {
      setFormData({
        name: editRule.name,
        description: editRule.description || '',
        ruleType: editRule.ruleType,
        states: editRule.states || [],
        cities: editRule.cities || [],
        priority: editRule.priority,
      })
    } else {
      setFormData({
        name: '',
        description: '',
        ruleType: '',
        states: [],
        cities: [],
        priority: 1,
      })
    }
    setCurrentStep('basic')
    setError('')
  }, [editRule, isOpen])

  const getCurrentStepIndex = () => steps.findIndex((s) => s.key === currentStep)

  const goToNextStep = () => {
    const currentIndex = getCurrentStepIndex()
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].key)
    }
  }

  const goToPrevStep = () => {
    const currentIndex = getCurrentStepIndex()
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].key)
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
        // For GEOGRAPHY rule type, at least one geography filter (states or cities) is required
        if (formData.ruleType === 'GEOGRAPHY') {
          const hasGeographyFilter = formData.states.length > 0 || formData.cities.length > 0
          if (!hasGeographyFilter) {
            setError('Please select at least one state or city')
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

      // Build rule data based on rule type
      const ruleData: AllocationRuleCreate = {
        name: formData.name,
        description: formData.description || undefined,
        ruleType: formData.ruleType as RuleType,
        priority: formData.priority,
      }

      // For GEOGRAPHY rule type, include states and cities
      // For CAPACITY_BASED, no geography fields needed (allocates ALL cases to ALL agents)
      if (formData.ruleType === 'GEOGRAPHY') {
        if (formData.states.length > 0) {
          ruleData.states = formData.states
        }
        if (formData.cities.length > 0) {
          ruleData.cities = formData.cities
        }
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

  const getRuleTypeLabel = (type: string) => {
    return RULE_TYPES.find((t) => t.value === type)?.label || type
  }

  // Toggle state selection
  const toggleStateSelection = (stateValue: string) => {
    setFormData(prev => ({
      ...prev,
      states: prev.states.includes(stateValue)
        ? prev.states.filter(s => s !== stateValue)
        : [...prev.states, stateValue]
    }))
  }

  // Toggle city selection
  const toggleCitySelection = (cityValue: string) => {
    setFormData(prev => ({
      ...prev,
      cities: prev.cities.includes(cityValue)
        ? prev.cities.filter(c => c !== cityValue)
        : [...prev.cities, cityValue]
    }))
  }

  // Filtered states based on search
  const filteredStates = masterStates.filter(state =>
    state.value.toLowerCase().includes(statesSearchTerm.toLowerCase())
  )

  // Filtered cities based on search
  const filteredCities = masterCities.filter(city =>
    city.value.toLowerCase().includes(citiesSearchTerm.toLowerCase())
  )

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
          {steps.map((step, index) => (
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

          {/* Step 3: Geography (only shown for GEOGRAPHY rule type) */}
          {currentStep === 'geography' && (
            <div className="wizard-step-content">
              <h3>Select Geographic Filters</h3>
              <p>Choose states and/or cities to filter cases. Cases will be matched to agents based on their state/city profile.</p>

              {isLoadingMasterData ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <span>Loading geography options...</span>
                </div>
              ) : (
                <>
                  {/* States Dropdown */}
                  <div className="form-group">
                    <label className="form-label">States *</label>
                    <p className="form-hint">Select one or more states (at least one state or city is required)</p>
                    {masterStates.length === 0 ? (
                      <div className="empty-master-data">
                        No states found in master data. Please add states in Master Data management.
                      </div>
                    ) : (
                      <div className="custom-dropdown" ref={statesDropdownRef}>
                        <div
                          className={`custom-dropdown__trigger ${isStatesDropdownOpen ? 'custom-dropdown__trigger--open' : ''}`}
                          onClick={() => {
                            setIsStatesDropdownOpen(!isStatesDropdownOpen)
                            setIsCitiesDropdownOpen(false)
                          }}
                        >
                          <span className="custom-dropdown__placeholder">
                            {formData.states.length > 0
                              ? `${formData.states.length} state${formData.states.length > 1 ? 's' : ''} selected`
                              : 'Select states...'}
                          </span>
                          <svg className="custom-dropdown__arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        {isStatesDropdownOpen && (
                          <div className="custom-dropdown__menu">
                            <div className="custom-dropdown__search">
                              <input
                                type="text"
                                placeholder="Search states..."
                                value={statesSearchTerm}
                                onChange={(e) => setStatesSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <div className="custom-dropdown__list">
                              {filteredStates.length === 0 ? (
                                <div className="custom-dropdown__empty">No states found</div>
                              ) : (
                                filteredStates.map((state) => (
                                  <div
                                    key={state.id}
                                    className={`custom-dropdown__item ${formData.states.includes(state.value) ? 'custom-dropdown__item--selected' : ''}`}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleStateSelection(state.value)
                                    }}
                                  >
                                    <span className="custom-dropdown__checkbox">
                                      {formData.states.includes(state.value) && (
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                      )}
                                    </span>
                                    <span className="custom-dropdown__label">{state.value}</span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {formData.states.length > 0 && (
                      <div className="selected-tags">
                        {formData.states.map((state) => (
                          <span key={state} className="selected-tag">
                            {state}
                            <button
                              type="button"
                              className="selected-tag__remove"
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                states: prev.states.filter(s => s !== state)
                              }))}
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Cities Dropdown */}
                  <div className="form-group">
                    <label className="form-label">Cities</label>
                    <p className="form-hint">Select specific cities (optional if states are selected)</p>
                    {masterCities.length === 0 ? (
                      <div className="empty-master-data">
                        No cities found in master data. Please add cities in Master Data management.
                      </div>
                    ) : (
                      <div className="custom-dropdown" ref={citiesDropdownRef}>
                        <div
                          className={`custom-dropdown__trigger ${isCitiesDropdownOpen ? 'custom-dropdown__trigger--open' : ''}`}
                          onClick={() => {
                            setIsCitiesDropdownOpen(!isCitiesDropdownOpen)
                            setIsStatesDropdownOpen(false)
                          }}
                        >
                          <span className="custom-dropdown__placeholder">
                            {formData.cities.length > 0
                              ? `${formData.cities.length} cit${formData.cities.length > 1 ? 'ies' : 'y'} selected`
                              : 'Select cities...'}
                          </span>
                          <svg className="custom-dropdown__arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        {isCitiesDropdownOpen && (
                          <div className="custom-dropdown__menu">
                            <div className="custom-dropdown__search">
                              <input
                                type="text"
                                placeholder="Search cities..."
                                value={citiesSearchTerm}
                                onChange={(e) => setCitiesSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <div className="custom-dropdown__list">
                              {filteredCities.length === 0 ? (
                                <div className="custom-dropdown__empty">No cities found</div>
                              ) : (
                                filteredCities.map((city) => (
                                  <div
                                    key={city.id}
                                    className={`custom-dropdown__item ${formData.cities.includes(city.value) ? 'custom-dropdown__item--selected' : ''}`}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleCitySelection(city.value)
                                    }}
                                  >
                                    <span className="custom-dropdown__checkbox">
                                      {formData.cities.includes(city.value) && (
                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                      )}
                                    </span>
                                    <span className="custom-dropdown__label">{city.value}</span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {formData.cities.length > 0 && (
                      <div className="selected-tags">
                        {formData.cities.map((city) => (
                          <span key={city} className="selected-tag">
                            {city}
                            <button
                              type="button"
                              className="selected-tag__remove"
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                cities: prev.cities.filter(c => c !== city)
                              }))}
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selection Summary */}
                  {(formData.states.length > 0 || formData.cities.length > 0) && (
                    <div className="geography-summary">
                      <span className="geography-summary__label">Selected:</span>
                      {formData.states.length > 0 && (
                        <span className="geography-summary__item">
                          {formData.states.length} state{formData.states.length > 1 ? 's' : ''}
                        </span>
                      )}
                      {formData.cities.length > 0 && (
                        <span className="geography-summary__item">
                          {formData.cities.length} cit{formData.cities.length > 1 ? 'ies' : 'y'}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Info box about how geography matching works */}
                  <div className="geography-info">
                    <strong>How Geography Matching Works:</strong>
                    <ul>
                      <li>Cases are filtered by the selected state/city (case-insensitive matching)</li>
                      <li>Agents are auto-detected based on their state/city profile settings</li>
                      <li>Cases are distributed using workload equalization (agents with fewer cases get more)</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Review Step */}
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
                {formData.ruleType === 'GEOGRAPHY' && formData.states.length > 0 && (
                  <div className="review-item">
                    <span className="review-item__label">States</span>
                    <span className="review-item__value">{formData.states.join(', ')}</span>
                  </div>
                )}
                {formData.ruleType === 'GEOGRAPHY' && formData.cities.length > 0 && (
                  <div className="review-item">
                    <span className="review-item__label">Cities</span>
                    <span className="review-item__value">{formData.cities.join(', ')}</span>
                  </div>
                )}

                {/* Info about how allocation will work */}
                <div className="review-info">
                  {formData.ruleType === 'GEOGRAPHY' ? (
                    <>
                      <strong>How this rule will work:</strong>
                      <p>When applied, this rule will find all unallocated cases matching the selected geography and distribute them to agents whose profile matches the same geography.</p>
                    </>
                  ) : (
                    <>
                      <strong>How this rule will work:</strong>
                      <p>When applied, this rule will distribute ALL unallocated cases to ALL active agents based on their current workload capacity. Agents with fewer cases will get priority.</p>
                    </>
                  )}
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
