/**
 * Rule Wizard Component
 * 5-step wizard for creating/editing communication rules
 */

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { strategyEngineService } from '@services/api'
import type {
  Rule,
  RuleWizardData,
  CommunicationChannel,
  FrequencyType,
  DayOfWeek,
  FilterField,
  FilterCondition,
  FilterOperator,
  RuleTemplate,
  OwnershipType,
} from '@types'
import './RuleWizard.css'

interface RuleWizardProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: RuleWizardData) => Promise<void>
  editRule?: Rule | null
  isSubmitting?: boolean
}

const STEPS = [
  { id: 1, label: 'Basic Info' },
  { id: 2, label: 'Channel' },
  { id: 3, label: 'Filters' },
  { id: 4, label: 'Template' },
  { id: 5, label: 'Triggers' },
]

const CHANNELS: { value: CommunicationChannel; label: string; icon: JSX.Element }[] = [
  {
    value: 'SMS',
    label: 'SMS',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    value: 'Email',
    label: 'Email',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    value: 'WhatsApp',
    label: 'WhatsApp',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    value: 'IVR',
    label: 'IVR',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7294C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5342 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.5953 1.99522 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04207 3.23945 9.10999 3.72C9.23662 4.68007 9.47144 5.62273 9.80999 6.53C9.94454 6.88792 9.97366 7.27691 9.8939 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.64L8.08999 9.91C9.51355 12.4135 11.5765 14.4765 14.08 15.9L15.35 14.63C15.6219 14.3611 15.9651 14.1758 16.3391 14.0961C16.7131 14.0163 17.1021 14.0455 17.46 14.18C18.3672 14.5186 19.3099 14.7534 20.27 14.88C20.7558 14.9485 21.1996 15.1907 21.5177 15.5627C21.8359 15.9347 22.006 16.4108 22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    value: 'PushNotification',
    label: 'Push',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

const DAYS_OF_WEEK: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'greater_than_or_equal', label: '>= (GTE)' },
  { value: 'less_than_or_equal', label: '<= (LTE)' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Not Contains' },
]

const initialWizardData: RuleWizardData = {
  name: '',
  description: '',
  channel: null,
  filters: [
    {
      id: 'group-1',
      logic: 'AND',
      conditions: [],
    },
  ],
  templateId: '',
  ownership: 'internal',
  priority: 1,
  dpdTrigger: 30,
  frequency: {
    type: 'daily',
    time: '09:00',
  },
}

export function RuleWizard({
  isOpen,
  onClose,
  onSubmit,
  editRule,
  isSubmitting = false,
}: RuleWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<RuleWizardData>(initialWizardData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [filterFields, setFilterFields] = useState<FilterField[]>([])
  const [templates, setTemplates] = useState<RuleTemplate[]>([])

  // Load filter fields and templates
  useEffect(() => {
    if (isOpen) {
      strategyEngineService.getFilterFields().then(setFilterFields)
      strategyEngineService.getTemplates().then(setTemplates)
    }
  }, [isOpen])

  // Initialize form data when editing
  useEffect(() => {
    if (editRule) {
      setFormData({
        name: editRule.name,
        description: editRule.description || '',
        channel: editRule.channel,
        filters: editRule.filters.length > 0 ? editRule.filters : initialWizardData.filters,
        templateId: editRule.templateId || '',
        ownership: editRule.ownership,
        priority: editRule.priority || 1,
        dpdTrigger: editRule.dpdTrigger || 30,
        frequency: editRule.frequency,
      })
    } else {
      setFormData(initialWizardData)
    }
    setCurrentStep(1)
    setErrors({})
  }, [editRule, isOpen])

  // Filter templates by selected channel
  useEffect(() => {
    if (formData.channel) {
      strategyEngineService.getTemplates(formData.channel).then(setTemplates)
    }
  }, [formData.channel])

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          newErrors.name = 'Rule name is required'
        }
        break
      case 2:
        if (!formData.channel) {
          newErrors.channel = 'Please select a communication channel'
        }
        break
      case 3:
        // Filters are optional but if present, validate
        break
      case 4:
        if (!formData.templateId) {
          newErrors.templateId = 'Please select a template'
        }
        break
      case 5:
        if (!formData.dpdTrigger || formData.dpdTrigger < 0) {
          newErrors.dpdTrigger = 'Please enter a valid DPD trigger value'
        }
        if (!formData.frequency.time) {
          newErrors.time = 'Please select an execution time'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5))
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      await onSubmit(formData)
    }
  }

  const addCondition = (groupId: string) => {
    setFormData((prev) => ({
      ...prev,
      filters: prev.filters.map((group) =>
        group.id === groupId
          ? {
              ...group,
              conditions: [
                ...group.conditions,
                {
                  id: `condition-${Date.now()}`,
                  field: filterFields[0]?.id || '',
                  operator: 'equals',
                  value: '',
                },
              ],
            }
          : group
      ),
    }))
  }

  const removeCondition = (groupId: string, conditionId: string) => {
    setFormData((prev) => ({
      ...prev,
      filters: prev.filters.map((group) =>
        group.id === groupId
          ? {
              ...group,
              conditions: group.conditions.filter((c) => c.id !== conditionId),
            }
          : group
      ),
    }))
  }

  const updateCondition = (
    groupId: string,
    conditionId: string,
    field: keyof FilterCondition,
    value: string | number | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      filters: prev.filters.map((group) =>
        group.id === groupId
          ? {
              ...group,
              conditions: group.conditions.map((c) =>
                c.id === conditionId ? { ...c, [field]: value } : c
              ),
            }
          : group
      ),
    }))
  }

  const toggleGroupLogic = (groupId: string) => {
    setFormData((prev) => ({
      ...prev,
      filters: prev.filters.map((group) =>
        group.id === groupId
          ? { ...group, logic: group.logic === 'AND' ? 'OR' : 'AND' }
          : group
      ),
    }))
  }

  if (!isOpen) return null

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h3 className="wizard-step-title">Basic Information</h3>
            <p className="wizard-step-description">
              Enter the basic details for your communication rule.
            </p>
            <div className="wizard-form-group">
              <label className="wizard-label wizard-label--required">Rule Name</label>
              <input
                type="text"
                className="wizard-input"
                placeholder="e.g., 30+ DPD Payment Reminder"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
              {errors.name && <div className="wizard-error">{errors.name}</div>}
            </div>
            <div className="wizard-form-group">
              <label className="wizard-label">Description (Optional)</label>
              <textarea
                className="wizard-input wizard-textarea"
                placeholder="Describe the purpose of this rule..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </>
        )

      case 2:
        return (
          <>
            <h3 className="wizard-step-title">Select Channel</h3>
            <p className="wizard-step-description">
              Choose the communication channel for this rule.
            </p>
            <div className="channel-grid">
              {CHANNELS.map((channel) => (
                <button
                  key={channel.value}
                  type="button"
                  className={`channel-card ${formData.channel === channel.value ? 'channel-card--selected' : ''}`}
                  onClick={() => setFormData((prev) => ({ ...prev, channel: channel.value }))}
                >
                  <div className="channel-card__icon">{channel.icon}</div>
                  <span className="channel-card__label">{channel.label}</span>
                </button>
              ))}
            </div>
            {errors.channel && <div className="wizard-error">{errors.channel}</div>}
          </>
        )

      case 3:
        return (
          <>
            <h3 className="wizard-step-title">Configure Filters</h3>
            <p className="wizard-step-description">
              Define conditions to filter eligible customers for this rule.
            </p>
            <div className="filter-builder">
              {formData.filters.map((group) => (
                <div key={group.id} className="filter-group">
                  <div className="filter-group__header">
                    <span>Match</span>
                    <button
                      type="button"
                      className="filter-group__logic"
                      onClick={() => toggleGroupLogic(group.id)}
                    >
                      {group.logic}
                    </button>
                    <span>of the following conditions:</span>
                  </div>
                  <div className="filter-conditions">
                    {group.conditions.map((condition) => (
                      <div key={condition.id} className="filter-condition">
                        <div className="filter-condition__field">
                          <select
                            value={condition.field}
                            onChange={(e) =>
                              updateCondition(group.id, condition.id, 'field', e.target.value)
                            }
                          >
                            <option value="">Select Field</option>
                            {filterFields.map((field) => (
                              <option key={field.id} value={field.id}>
                                {field.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="filter-condition__operator">
                          <select
                            value={condition.operator}
                            onChange={(e) =>
                              updateCondition(
                                group.id,
                                condition.id,
                                'operator',
                                e.target.value as FilterOperator
                              )
                            }
                          >
                            {OPERATORS.map((op) => (
                              <option key={op.value} value={op.value}>
                                {op.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="filter-condition__value">
                          {(() => {
                            const field = filterFields.find((f) => f.id === condition.field)
                            if (field?.type === 'select' && field.options) {
                              return (
                                <select
                                  value={condition.value as string}
                                  onChange={(e) =>
                                    updateCondition(group.id, condition.id, 'value', e.target.value)
                                  }
                                >
                                  <option value="">Select Value</option>
                                  {field.options.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              )
                            }
                            return (
                              <input
                                type={field?.type === 'number' ? 'number' : 'text'}
                                placeholder="Enter value"
                                value={condition.value as string}
                                onChange={(e) =>
                                  updateCondition(group.id, condition.id, 'value', e.target.value)
                                }
                              />
                            )
                          })()}
                        </div>
                        <button
                          type="button"
                          className="filter-condition__remove"
                          onClick={() => removeCondition(group.id, condition.id)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="filter-add-btn"
                    onClick={() => addCondition(group.id)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Add Condition
                  </button>
                </div>
              ))}
            </div>
          </>
        )

      case 4:
        return (
          <>
            <h3 className="wizard-step-title">Template & Strategy</h3>
            <p className="wizard-step-description">
              Select the message template and define ownership strategy.
            </p>
            <div className="wizard-form-group">
              <label className="wizard-label wizard-label--required">Message Template</label>
              <select
                className="wizard-input wizard-select"
                value={formData.templateId}
                onChange={(e) => setFormData((prev) => ({ ...prev, templateId: e.target.value }))}
              >
                <option value="">Select a template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              {errors.templateId && <div className="wizard-error">{errors.templateId}</div>}
            </div>
            <div className="wizard-form-row">
              <div className="wizard-form-group">
                <label className="wizard-label">Ownership</label>
                <select
                  className="wizard-input wizard-select"
                  value={formData.ownership}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ownership: e.target.value as OwnershipType,
                    }))
                  }
                >
                  <option value="internal">Internal Team</option>
                  <option value="agency">Agency</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div className="wizard-form-group">
                <label className="wizard-label">Priority Score</label>
                <input
                  type="number"
                  className="wizard-input"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, priority: parseInt(e.target.value) || 1 }))
                  }
                />
              </div>
            </div>
          </>
        )

      case 5:
        return (
          <>
            <h3 className="wizard-step-title">Triggers & Frequency</h3>
            <p className="wizard-step-description">
              Configure when and how often this rule should execute.
            </p>
            <div className="wizard-form-group">
              <label className="wizard-label wizard-label--required">DPD Trigger</label>
              <input
                type="number"
                className="wizard-input"
                placeholder="e.g., 30"
                min="0"
                value={formData.dpdTrigger}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, dpdTrigger: parseInt(e.target.value) || 0 }))
                }
              />
              <small style={{ color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                Rule will trigger when DPD equals or exceeds this value
              </small>
              {errors.dpdTrigger && <div className="wizard-error">{errors.dpdTrigger}</div>}
            </div>
            <div className="wizard-form-group">
              <label className="wizard-label">Frequency</label>
              <div className="frequency-options">
                {(['daily', 'weekly', 'monthly'] as FrequencyType[]).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    className={`frequency-option ${formData.frequency.type === freq ? 'frequency-option--selected' : ''}`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        frequency: { ...prev.frequency, type: freq },
                      }))
                    }
                  >
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="frequency-details">
              {formData.frequency.type === 'weekly' && (
                <div className="wizard-form-group">
                  <label className="wizard-label">Day of Week</label>
                  <div className="day-selector">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day}
                        type="button"
                        className={`day-btn ${formData.frequency.dayOfWeek === day ? 'day-btn--selected' : ''}`}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            frequency: { ...prev.frequency, dayOfWeek: day },
                          }))
                        }
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {formData.frequency.type === 'monthly' && (
                <div className="wizard-form-group">
                  <label className="wizard-label">Day of Month</label>
                  <input
                    type="number"
                    className="wizard-input"
                    min="1"
                    max="31"
                    value={formData.frequency.dayOfMonth || 1}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        frequency: {
                          ...prev.frequency,
                          dayOfMonth: parseInt(e.target.value) || 1,
                        },
                      }))
                    }
                  />
                </div>
              )}
              <div className="wizard-form-group">
                <label className="wizard-label wizard-label--required">Execution Time</label>
                <input
                  type="time"
                  className="wizard-input"
                  value={formData.frequency.time}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      frequency: { ...prev.frequency, time: e.target.value },
                    }))
                  }
                />
                {errors.time && <div className="wizard-error">{errors.time}</div>}
              </div>
            </div>
          </>
        )

      default:
        return null
    }
  }

  return createPortal(
    <div className="wizard-overlay" onClick={onClose}>
      <div className="wizard-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wizard-header">
          <h2 className="wizard-title">{editRule ? 'Edit Rule' : 'Create New Rule'}</h2>
          <button className="wizard-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Stepper */}
        <div className="wizard-stepper">
          {STEPS.map((step, index) => (
            <>
              <div
                key={step.id}
                className={`wizard-step ${
                  currentStep === step.id
                    ? 'wizard-step--active'
                    : currentStep > step.id
                    ? 'wizard-step--completed'
                    : ''
                }`}
              >
                <div className="wizard-step__number">
                  {currentStep > step.id ? (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                <span className="wizard-step__label">{step.label}</span>
              </div>
              {index < STEPS.length - 1 && <div className="wizard-step__connector" />}
            </>
          ))}
        </div>

        {/* Content */}
        <div className="wizard-content">{renderStepContent()}</div>

        {/* Footer */}
        <div className="wizard-footer">
          <div className="wizard-footer__left">
            {currentStep > 1 && (
              <button type="button" className="wizard-btn wizard-btn--secondary" onClick={handleBack}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back
              </button>
            )}
          </div>
          <div className="wizard-footer__right">
            <button type="button" className="wizard-btn wizard-btn--secondary" onClick={onClose}>
              Cancel
            </button>
            {currentStep < 5 ? (
              <button type="button" className="wizard-btn wizard-btn--primary" onClick={handleNext}>
                Next
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ) : (
              <button
                type="button"
                className="wizard-btn wizard-btn--primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : editRule ? 'Update Rule' : 'Create Rule'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default RuleWizard
