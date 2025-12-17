/**
 * Rule Wizard Component
 * 5-step wizard for creating/editing communication rules
 */

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { masterDataService } from '@services/api'
import { templateService } from '@services/api/template.service'
import type {
  Rule,
  RuleWizardData,
  LegacyCommunicationChannel,
  LegacyFrequencyType,
  LegacyDayOfWeek,
  MasterData,
} from '@types'
import type { TemplateDropdownItem, TemplateChannelType, TemplateDetail } from '../../../types/template.types'
import './RuleWizard.css'

interface RuleWizardProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: RuleWizardData) => Promise<void>
  editRule?: Rule | null
  isSubmitting?: boolean
}

// Text filter data structure - supports multiple selections
interface TextFilterData {
  language: string[]
  product: string[]
  state: string[]
  pinCode: string[]
  city: string[]
}

// Numeric filter data structure
interface NumericFilterData {
  field: string
  sign: string
  minValue: string
  maxValue: string
  equalValue: string
}

// Date filter data structure
interface DateFilterData {
  field: string
  fromDate: string
  toDate: string
}

// Filter state structure
interface FilterState {
  textFilters: TextFilterData
  numericFilters: NumericFilterData[]
  dateFilters: DateFilterData[]
}

const STEPS = [
  { id: 1, label: 'Basic Info' },
  { id: 2, label: 'Channel' },
  { id: 3, label: 'Filters' },
  { id: 4, label: 'Template' },
  { id: 5, label: 'Triggers' },
]

const DAYS_OF_WEEK: LegacyDayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

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
  selectedDays: [], // Selected days for weekly frequency (supports multiple)
}

const initialTextFilters: TextFilterData = {
  language: [],
  product: [],
  state: [],
  pinCode: [],
  city: [],
}

const initialNumericFilter: NumericFilterData = {
  field: '',
  sign: '',
  minValue: '',
  maxValue: '',
  equalValue: '',
}

const initialDateFilter: DateFilterData = {
  field: '',
  fromDate: '',
  toDate: '',
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
  const [channels, setChannels] = useState<MasterData[]>([])
  const [isLoadingChannels, setIsLoadingChannels] = useState(false)
  const [templates, setTemplates] = useState<TemplateDropdownItem[]>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)

  // Master data for filters
  const [languages, setLanguages] = useState<MasterData[]>([])
  const [products, setProducts] = useState<MasterData[]>([])
  const [states, setStates] = useState<MasterData[]>([])
  const [pinCodes, setPinCodes] = useState<MasterData[]>([])
  const [cities, setCities] = useState<MasterData[]>([])
  const [numericFields, setNumericFields] = useState<MasterData[]>([])
  const [numericSigns, setNumericSigns] = useState<MasterData[]>([])
  const [dateFields, setDateFields] = useState<MasterData[]>([])
  const [isLoadingFilters, setIsLoadingFilters] = useState(false)

  // Filter state
  const [filterState, setFilterState] = useState<FilterState>({
    textFilters: initialTextFilters,
    numericFilters: [{ ...initialNumericFilter }],
    dateFilters: [{ ...initialDateFilter }],
  })

  // Template details modal state
  const [isTemplateDetailsOpen, setIsTemplateDetailsOpen] = useState(false)
  const [templateDetails, setTemplateDetails] = useState<TemplateDetail | null>(null)
  const [isLoadingTemplateDetails, setIsLoadingTemplateDetails] = useState(false)

  // Multi-select dropdown open state
  const [openDropdown, setOpenDropdown] = useState<keyof TextFilterData | null>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!openDropdown) return

      const target = event.target as HTMLElement
      // Check if click is inside the multi-select container
      const isInsideMultiSelect = target.closest('.multi-select-container')

      if (!isInsideMultiSelect) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openDropdown])

  // Map channel codes to template channel types
  const mapChannelToTemplateChannel = (channel: string | null): TemplateChannelType | null => {
    if (!channel) return null
    const channelMap: Record<string, TemplateChannelType> = {
      'SMS': 'SMS',
      'WHATSAPP': 'WHATSAPP',
      'EMAIL': 'EMAIL',
      'IVR': 'IVR',
      'NOTICE': 'NOTICE'
    }
    return channelMap[channel.toUpperCase()] || null
  }

  // Fetch templates when channel changes
  useEffect(() => {
    const templateChannel = mapChannelToTemplateChannel(formData.channel)

    if (templateChannel && isOpen) {
      setIsLoadingTemplates(true)
      templateService.getTemplatesDropdown(templateChannel)
        .then((data) => {
          setTemplates(data)
        })
        .catch((err) => {
          console.error('Failed to fetch templates:', err)
          setTemplates([])
        })
        .finally(() => setIsLoadingTemplates(false))
    } else {
      setTemplates([])
    }
  }, [formData.channel, isOpen])

  // Load filter fields and communication channels
  useEffect(() => {
    if (isOpen) {

      // Fetch communication channels from master data
      setIsLoadingChannels(true)
      masterDataService.getByType('COMMUNICATION_CHANNEL')
        .then((data) => {
          setChannels(data.filter(ch => ch.isActive))
        })
        .catch((err) => {
          console.error('Failed to fetch communication channels:', err)
          setChannels([])
        })
        .finally(() => setIsLoadingChannels(false))

      // Fetch all filter dropdown data from master data
      // Note: Master data category names should match what's configured in the backend
      setIsLoadingFilters(true)
      Promise.all([
        masterDataService.getByType('LANGUAGE').catch(() => []),
        masterDataService.getByType('PRODUCT').catch(() => []),
        masterDataService.getByType('STATE').catch(() => []),
        masterDataService.getByType('PIN_CODE').catch(() => []),
        masterDataService.getByType('CITY').catch(() => []),
        masterDataService.getByType('NUMERIC_FIELD').catch(() => []),
        masterDataService.getByType('CHOOSE_A_SIGN').catch(() => []),
        masterDataService.getByType('DATE_FIELD').catch(() => []),
      ])
        .then(([langData, prodData, stateData, pinData, cityData, numFieldData, numSignData, dateFieldData]) => {
          setLanguages(langData.filter(d => d.isActive))
          setProducts(prodData.filter(d => d.isActive))
          setStates(stateData.filter(d => d.isActive))
          setPinCodes(pinData.filter(d => d.isActive))
          setCities(cityData.filter(d => d.isActive))
          setNumericFields(numFieldData.filter(d => d.isActive))
          setNumericSigns(numSignData.filter(d => d.isActive))
          setDateFields(dateFieldData.filter(d => d.isActive))
        })
        .finally(() => setIsLoadingFilters(false))
    }
  }, [isOpen])

  // Helper to find master data code by display value (case-insensitive)
  // Tries multiple matching strategies: exact match, lowercase match, contains match
  const findCodeByValue = (list: MasterData[], displayValue: string): string => {
    if (!displayValue) return ''

    // If master data list is empty, return the original value
    // This ensures we preserve API values even if master data isn't configured
    if (list.length === 0) {
      console.log(`findCodeByValue: Master data list is empty, returning original value "${displayValue}"`)
      return displayValue
    }

    const normalizedSearch = displayValue.toLowerCase().trim()

    // Strategy 1: Try exact match on code (case-insensitive)
    let item = list.find(i => i.code?.toLowerCase() === normalizedSearch)
    if (item) {
      console.log(`findCodeByValue: Found "${displayValue}" by exact code match -> ${item.code}`)
      return item.code || ''
    }

    // Strategy 2: Try exact match on value (case-insensitive)
    item = list.find(i => i.value?.toLowerCase() === normalizedSearch)
    if (item) {
      console.log(`findCodeByValue: Found "${displayValue}" by exact value match -> ${item.code}`)
      return item.code || ''
    }

    // Strategy 3: For numeric values like pincodes, try direct match
    // API might return "502255" and master data might have code="502255" or value="502255"
    if (/^\d+$/.test(displayValue)) {
      item = list.find(i => i.code === displayValue || i.value === displayValue)
      if (item) {
        console.log(`findCodeByValue: Found numeric "${displayValue}" -> ${item.code}`)
        return item.code || ''
      }
    }

    // Strategy 4: Partial match - value contains search or vice versa
    item = list.find(i =>
      i.value?.toLowerCase().includes(normalizedSearch) ||
      i.code?.toLowerCase().includes(normalizedSearch)
    )
    if (item) {
      console.log(`findCodeByValue: Found "${displayValue}" by partial match -> ${item.code}`)
      return item.code || ''
    }

    // Strategy 5: Search contains master data value (for cases like "TELANGANA" matching "Telangana State")
    item = list.find(i =>
      normalizedSearch.includes(i.value?.toLowerCase() || '') ||
      normalizedSearch.includes(i.code?.toLowerCase() || '')
    )
    if (item) {
      console.log(`findCodeByValue: Found "${displayValue}" by reverse partial match -> ${item.code}`)
      return item.code || ''
    }

    // If no match found, return the original value as-is
    // This allows the dropdown to potentially match if the value IS the code
    console.log(`findCodeByValue: No match found for "${displayValue}", returning as-is`)
    return displayValue
  }

  // Initialize form data when editing
  useEffect(() => {
    if (editRule) {
      // Map channel from legacy format to new format for the select
      const channelMap: Record<string, string> = {
        'SMS': 'SMS',
        'Email': 'EMAIL',
        'WhatsApp': 'WHATSAPP',
        'IVR': 'IVR',
        'PushNotification': 'NOTICE',
      }
      const mappedChannel = channelMap[editRule.channel] || editRule.channel

      setFormData({
        name: editRule.name,
        description: editRule.description || '',
        channel: mappedChannel as any,
        filters: editRule.filters.length > 0 ? editRule.filters : initialWizardData.filters,
        templateId: editRule.templateId || '',
        ownership: editRule.ownership,
        priority: editRule.priority || 1,
        dpdTrigger: editRule.dpdTrigger || 30,
        frequency: editRule.frequency,
        selectedDays: editRule.frequency.days || [],
      })

      // Reset filter state initially - will be populated once master data loads
      setFilterState({
        textFilters: initialTextFilters,
        numericFilters: [{ ...initialNumericFilter }],
        dateFilters: [{ ...initialDateFilter }],
      })
    } else {
      setFormData(initialWizardData)
      setFilterState({
        textFilters: initialTextFilters,
        numericFilters: [{ ...initialNumericFilter }],
        dateFilters: [{ ...initialDateFilter }],
      })
    }
    setCurrentStep(1)
    setErrors({})
  }, [editRule, isOpen])

  // Helper to find codes for multiple API values
  const findCodesForValues = (list: MasterData[], displayValues: string[] | undefined): string[] => {
    if (!displayValues || displayValues.length === 0) return []
    return displayValues
      .map(val => findCodeByValue(list, val))
      .filter(code => code !== '')
  }

  // Populate filter state from API filters after master data is loaded
  useEffect(() => {
    // Only run when we have an editRule with filters and master data is loaded
    if (editRule?.apiFilters && !isLoadingFilters) {
      const apiFilters = editRule.apiFilters

      // Debug: Log API filters and master data
      console.log('=== Edit Mode Filter Population Debug ===')
      console.log('API Filters:', apiFilters)
      console.log('Languages available:', languages.map(l => ({ code: l.code, value: l.value })))
      console.log('Products available:', products.map(p => ({ code: p.code, value: p.value })))
      console.log('States available:', states.map(s => ({ code: s.code, value: s.value })))
      console.log('Cities available:', cities.map(c => ({ code: c.code, value: c.value })))
      console.log('PinCodes available:', pinCodes.map(p => ({ code: p.code, value: p.value })))

      // Build the text filters object - now supports multiple values
      const languageCodes = findCodesForValues(languages, apiFilters.language)
      const productCodes = findCodesForValues(products, apiFilters.product)
      const stateCodes = findCodesForValues(states, apiFilters.state)
      const pinCodeCodes = findCodesForValues(pinCodes, apiFilters.pincode)
      const cityCodes = findCodesForValues(cities, apiFilters.city)

      console.log('Matched codes:', { languageCodes, productCodes, stateCodes, pinCodeCodes, cityCodes })

      const newTextFilters: TextFilterData = {
        language: languageCodes,
        product: productCodes,
        state: stateCodes,
        pinCode: pinCodeCodes,
        city: cityCodes,
      }

      console.log('Setting filterState.textFilters to:', newTextFilters)

      setFilterState(prev => ({
        ...prev,
        textFilters: newTextFilters,
      }))
    }
  }, [editRule, isLoadingFilters, languages, products, states, pinCodes, cities])

  // Fetch template details
  const handleViewTemplateDetails = async (templateId: string) => {
    if (!templateId) return

    try {
      setIsLoadingTemplateDetails(true)
      setIsTemplateDetailsOpen(true)
      const details = await templateService.getTemplateById(parseInt(templateId))
      setTemplateDetails(details)
    } catch (err) {
      console.error('Failed to fetch template details:', err)
      setTemplateDetails(null)
    } finally {
      setIsLoadingTemplateDetails(false)
    }
  }

  const closeTemplateDetails = () => {
    setIsTemplateDetailsOpen(false)
    setTemplateDetails(null)
  }

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
        // Filters are optional
        break
      case 4:
        if (!formData.templateId.trim()) {
          newErrors.templateId = 'Please select a template'
        }
        break
      case 5:
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

  // Helper to get display value from master data by code
  const getValueFromCode = (list: MasterData[], code: string): string => {
    const item = list.find(i => i.code === code)
    return item?.value || code
  }

  // Helper to get display values from master data by codes (for arrays)
  const getValuesFromCodes = (list: MasterData[], codes: string[]): string[] => {
    return codes.map(code => getValueFromCode(list, code))
  }

  // Build API filters from filter state
  const buildApiFilters = () => {
    const apiFilters: Array<{
      field: string
      filterType: 'TEXT' | 'NUMERIC' | 'DATE'
      operator: string
      value1?: string
      value2?: string
      values?: string[]
    }> = []

    // Text filters - use IN operator with values array (supports multiple selections)
    const { textFilters } = filterState

    if (textFilters.language.length > 0) {
      // Use the display values from master data for the API
      const displayValues = getValuesFromCodes(languages, textFilters.language)
      apiFilters.push({
        field: 'LANGUAGE',
        filterType: 'TEXT',
        operator: 'IN',
        values: displayValues,
      })
    }

    if (textFilters.product.length > 0) {
      const displayValues = getValuesFromCodes(products, textFilters.product)
      apiFilters.push({
        field: 'PRODUCT',
        filterType: 'TEXT',
        operator: 'IN',
        values: displayValues,
      })
    }

    if (textFilters.state.length > 0) {
      const displayValues = getValuesFromCodes(states, textFilters.state)
      apiFilters.push({
        field: 'STATE',
        filterType: 'TEXT',
        operator: 'IN',
        values: displayValues,
      })
    }

    if (textFilters.pinCode.length > 0) {
      const displayValues = getValuesFromCodes(pinCodes, textFilters.pinCode)
      apiFilters.push({
        field: 'PINCODE',
        filterType: 'TEXT',
        operator: 'IN',
        values: displayValues,
      })
    }

    if (textFilters.city.length > 0) {
      const displayValues = getValuesFromCodes(cities, textFilters.city)
      apiFilters.push({
        field: 'CITY',
        filterType: 'TEXT',
        operator: 'IN',
        values: displayValues,
      })
    }

    // Numeric filters
    filterState.numericFilters.forEach((filter) => {
      if (!filter.field || !filter.sign) return

      const signCode = filter.sign
      const selectedSign = numericSigns.find(s => s.code === signCode)
      const signValue = selectedSign?.value?.toLowerCase() || signCode.toLowerCase()

      let operator = '='
      let value1 = ''
      let value2: string | undefined

      if (signValue.includes('greater') && signValue.includes('equal') || signValue === '>=') {
        operator = '>='
        value1 = filter.minValue
      } else if (signValue.includes('greater') || signValue === '>') {
        operator = '>'
        value1 = filter.minValue
      } else if (signValue.includes('less') && signValue.includes('equal') || signValue === '<=') {
        operator = '<='
        value1 = filter.maxValue
      } else if (signValue.includes('less') || signValue === '<') {
        operator = '<'
        value1 = filter.maxValue
      } else if (signValue.includes('equal') || signValue === '=') {
        operator = '='
        value1 = filter.equalValue
      } else if (signValue.includes('range') || signValue.includes('between')) {
        operator = 'RANGE'
        value1 = filter.minValue
        value2 = filter.maxValue
      }

      if (value1) {
        apiFilters.push({
          field: filter.field,
          filterType: 'NUMERIC',
          operator,
          value1,
          value2,
        })
      }
    })

    // Date filters
    filterState.dateFilters.forEach((filter) => {
      if (!filter.field) return

      // If both dates provided, use BETWEEN operator
      if (filter.fromDate && filter.toDate) {
        apiFilters.push({
          field: filter.field,
          filterType: 'DATE',
          operator: 'BETWEEN',
          value1: filter.fromDate,
          value2: filter.toDate,
        })
      } else if (filter.fromDate) {
        // Only from date - use >= operator
        apiFilters.push({
          field: filter.field,
          filterType: 'DATE',
          operator: '>=',
          value1: filter.fromDate,
        })
      } else if (filter.toDate) {
        // Only to date - use <= operator
        apiFilters.push({
          field: filter.field,
          filterType: 'DATE',
          operator: '<=',
          value1: filter.toDate,
        })
      }
    })

    return apiFilters
  }

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      // Build the API filters from the filter state
      const apiFilters = buildApiFilters()

      // Get selected template info for templateName
      const selectedTemplate = templates.find(t => t.id.toString() === formData.templateId)

      // Build frequency with days array for weekly schedule
      const frequency = {
        ...formData.frequency,
        days: formData.selectedDays || [], // Pass selected days for weekly
      }

      // Create the submission data with properly formatted filters
      const submissionData = {
        ...formData,
        frequency,
        apiFilters, // Pass the API-formatted filters
        templateName: selectedTemplate?.templateName || '', // Pass template name for API
      }

      await onSubmit(submissionData as RuleWizardData)
    }
  }

  // Text filter handlers - toggle value in array for multi-select
  const toggleTextFilter = (field: keyof TextFilterData, value: string) => {
    setFilterState(prev => {
      const currentValues = prev.textFilters[field]
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value) // Remove if already selected
        : [...currentValues, value] // Add if not selected
      return {
        ...prev,
        textFilters: { ...prev.textFilters, [field]: newValues }
      }
    })
  }

  // Remove a single item from text filter
  const removeTextFilterItem = (field: keyof TextFilterData, value: string) => {
    setFilterState(prev => ({
      ...prev,
      textFilters: {
        ...prev.textFilters,
        [field]: prev.textFilters[field].filter(v => v !== value)
      }
    }))
  }

  // Toggle dropdown open/close
  const toggleDropdown = (field: keyof TextFilterData) => {
    setOpenDropdown(openDropdown === field ? null : field)
  }

  // Numeric filter handlers
  const addNumericFilter = () => {
    setFilterState(prev => ({
      ...prev,
      numericFilters: [...prev.numericFilters, { ...initialNumericFilter }]
    }))
  }

  const removeNumericFilter = (index: number) => {
    setFilterState(prev => ({
      ...prev,
      numericFilters: prev.numericFilters.filter((_, i) => i !== index)
    }))
  }

  const updateNumericFilter = (index: number, field: keyof NumericFilterData, value: string) => {
    setFilterState(prev => ({
      ...prev,
      numericFilters: prev.numericFilters.map((filter, i) =>
        i === index ? { ...filter, [field]: value } : filter
      )
    }))
  }

  // Date filter handlers
  const addDateFilter = () => {
    setFilterState(prev => ({
      ...prev,
      dateFilters: [...prev.dateFilters, { ...initialDateFilter }]
    }))
  }

  const removeDateFilter = (index: number) => {
    setFilterState(prev => ({
      ...prev,
      dateFilters: prev.dateFilters.filter((_, i) => i !== index)
    }))
  }

  const updateDateFilter = (index: number, field: keyof DateFilterData, value: string) => {
    setFilterState(prev => ({
      ...prev,
      dateFilters: prev.dateFilters.map((filter, i) =>
        i === index ? { ...filter, [field]: value } : filter
      )
    }))
  }

  // Get dynamic value fields based on numeric sign selection
  const renderNumericValueFields = (filter: NumericFilterData, index: number) => {
    const signCode = filter.sign
    const selectedSign = numericSigns.find(s => s.code === signCode)
    const signValue = selectedSign?.value?.toLowerCase() || signCode.toLowerCase()

    if (signValue.includes('greater') || signValue === '>' || signValue === '>=') {
      return (
        <div className="filter-field">
          <label className="filter-field-label">Minimum Value</label>
          <input
            type="number"
            className="wizard-input"
            placeholder="Enter minimum value"
            value={filter.minValue}
            onChange={(e) => updateNumericFilter(index, 'minValue', e.target.value)}
          />
        </div>
      )
    }

    if (signValue.includes('less') || signValue === '<' || signValue === '<=') {
      return (
        <div className="filter-field">
          <label className="filter-field-label">Maximum Value</label>
          <input
            type="number"
            className="wizard-input"
            placeholder="Enter maximum value"
            value={filter.maxValue}
            onChange={(e) => updateNumericFilter(index, 'maxValue', e.target.value)}
          />
        </div>
      )
    }

    if (signValue.includes('equal') || signValue === '=') {
      return (
        <div className="filter-field">
          <label className="filter-field-label">Value</label>
          <input
            type="number"
            className="wizard-input"
            placeholder="Enter value"
            value={filter.equalValue}
            onChange={(e) => updateNumericFilter(index, 'equalValue', e.target.value)}
          />
        </div>
      )
    }

    if (signValue.includes('range') || signValue.includes('between')) {
      return (
        <>
          <div className="filter-field">
            <label className="filter-field-label">Minimum Value</label>
            <input
              type="number"
              className="wizard-input"
              placeholder="Min value"
              value={filter.minValue}
              onChange={(e) => updateNumericFilter(index, 'minValue', e.target.value)}
            />
          </div>
          <div className="filter-field">
            <label className="filter-field-label">Maximum Value</label>
            <input
              type="number"
              className="wizard-input"
              placeholder="Max value"
              value={filter.maxValue}
              onChange={(e) => updateNumericFilter(index, 'maxValue', e.target.value)}
            />
          </div>
        </>
      )
    }

    return null
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
            <div className="wizard-form-group">
              <label className="wizard-label wizard-label--required">Communication Channel</label>
              {isLoadingChannels ? (
                <div className="channel-loading">Loading channels...</div>
              ) : (
                <select
                  className="wizard-input wizard-select"
                  value={formData.channel || ''}
                  onChange={(e) => {
                    const value = e.target.value as LegacyCommunicationChannel
                    setFormData((prev) => ({ ...prev, channel: value || null }))
                  }}
                >
                  <option value="">Select a channel</option>
                  {channels.map((channel) => (
                    <option key={channel.id} value={channel.code}>
                      {channel.value}
                    </option>
                  ))}
                </select>
              )}
              {errors.channel && <div className="wizard-error">{errors.channel}</div>}
            </div>
          </>
        )

      case 3:
        return (
          <>
            <h3 className="wizard-step-title">Configure Filters</h3>
            <p className="wizard-step-description">
              Define conditions to filter eligible customers for this rule.
            </p>

            {isLoadingFilters ? (
              <div className="channel-loading">Loading filter options...</div>
            ) : (
              <div className="filters-container">
                {/* Text Filters Section */}
                <div className="filter-section">
                  <div className="filter-section__header">
                    <h4 className="filter-section__title">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 7V4H20V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 20H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 4V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Text Filters
                    </h4>
                  </div>
                  <div className="filter-section__content">
                    <div className="filter-grid">
                      {/* Language Multi-Select */}
                      <div className="filter-field">
                        <label className="filter-field-label">Language</label>
                        <div className="multi-select-container">
                          <div
                            className="multi-select-header"
                            onClick={() => toggleDropdown('language')}
                          >
                            <span className="multi-select-placeholder">
                              {filterState.textFilters.language.length === 0
                                ? 'Select Languages'
                                : `${filterState.textFilters.language.length} selected`}
                            </span>
                            {filterState.textFilters.language.length > 0 && (
                              <button
                                type="button"
                                className="multi-select-clear"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setFilterState(prev => ({
                                    ...prev,
                                    textFilters: { ...prev.textFilters, language: [] }
                                  }))
                                }}
                              >
                                ×
                              </button>
                            )}
                          </div>
                          {openDropdown === 'language' && (
                            <div className="multi-select-options">
                              {languages.length === 0 ? (
                                <div className="multi-select-empty">No options available</div>
                              ) : (
                                languages.map((lang) => (
                                  <div
                                    key={lang.id}
                                    className="multi-select-option"
                                    onClick={() => toggleTextFilter('language', lang.code || '')}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={filterState.textFilters.language.includes(lang.code || '')}
                                      readOnly
                                    />
                                    <span className="multi-select-option-text">{lang.value}</span>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                          {filterState.textFilters.language.length > 0 && (
                            <div className="multi-select-tags">
                              {filterState.textFilters.language.map(code => {
                                const item = languages.find(l => l.code === code)
                                return (
                                  <span key={code} className="multi-select-tag">
                                    {item?.value || code}
                                    <button
                                      type="button"
                                      className="multi-select-tag-remove"
                                      onClick={(e) => { e.stopPropagation(); removeTextFilterItem('language', code) }}
                                    >
                                      ×
                                    </button>
                                  </span>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Multi-Select */}
                      <div className="filter-field">
                        <label className="filter-field-label">Product</label>
                        <div className="multi-select-container">
                          <div
                            className="multi-select-header"
                            onClick={() => toggleDropdown('product')}
                          >
                            <span className="multi-select-placeholder">
                              {filterState.textFilters.product.length === 0
                                ? 'Select Products'
                                : `${filterState.textFilters.product.length} selected`}
                            </span>
                            {filterState.textFilters.product.length > 0 && (
                              <button
                                type="button"
                                className="multi-select-clear"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setFilterState(prev => ({
                                    ...prev,
                                    textFilters: { ...prev.textFilters, product: [] }
                                  }))
                                }}
                              >
                                ×
                              </button>
                            )}
                          </div>
                          {openDropdown === 'product' && (
                            <div className="multi-select-options">
                              {products.length === 0 ? (
                                <div className="multi-select-empty">No options available</div>
                              ) : (
                                products.map((prod) => (
                                  <div
                                    key={prod.id}
                                    className="multi-select-option"
                                    onClick={() => toggleTextFilter('product', prod.code || '')}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={filterState.textFilters.product.includes(prod.code || '')}
                                      readOnly
                                    />
                                    <span className="multi-select-option-text">{prod.value}</span>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                          {filterState.textFilters.product.length > 0 && (
                            <div className="multi-select-tags">
                              {filterState.textFilters.product.map(code => {
                                const item = products.find(p => p.code === code)
                                return (
                                  <span key={code} className="multi-select-tag">
                                    {item?.value || code}
                                    <button
                                      type="button"
                                      className="multi-select-tag-remove"
                                      onClick={(e) => { e.stopPropagation(); removeTextFilterItem('product', code) }}
                                    >
                                      ×
                                    </button>
                                  </span>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* State Multi-Select */}
                      <div className="filter-field">
                        <label className="filter-field-label">State</label>
                        <div className="multi-select-container">
                          <div
                            className="multi-select-header"
                            onClick={() => toggleDropdown('state')}
                          >
                            <span className="multi-select-placeholder">
                              {filterState.textFilters.state.length === 0
                                ? 'Select States'
                                : `${filterState.textFilters.state.length} selected`}
                            </span>
                            {filterState.textFilters.state.length > 0 && (
                              <button
                                type="button"
                                className="multi-select-clear"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setFilterState(prev => ({
                                    ...prev,
                                    textFilters: { ...prev.textFilters, state: [] }
                                  }))
                                }}
                              >
                                ×
                              </button>
                            )}
                          </div>
                          {openDropdown === 'state' && (
                            <div className="multi-select-options">
                              {states.length === 0 ? (
                                <div className="multi-select-empty">No options available</div>
                              ) : (
                                states.map((state) => (
                                  <div
                                    key={state.id}
                                    className="multi-select-option"
                                    onClick={() => toggleTextFilter('state', state.code || '')}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={filterState.textFilters.state.includes(state.code || '')}
                                      readOnly
                                    />
                                    <span className="multi-select-option-text">{state.value}</span>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                          {filterState.textFilters.state.length > 0 && (
                            <div className="multi-select-tags">
                              {filterState.textFilters.state.map(code => {
                                const item = states.find(s => s.code === code)
                                return (
                                  <span key={code} className="multi-select-tag">
                                    {item?.value || code}
                                    <button
                                      type="button"
                                      className="multi-select-tag-remove"
                                      onClick={(e) => { e.stopPropagation(); removeTextFilterItem('state', code) }}
                                    >
                                      ×
                                    </button>
                                  </span>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pin Code Multi-Select */}
                      <div className="filter-field">
                        <label className="filter-field-label">Pin Code</label>
                        <div className="multi-select-container">
                          <div
                            className="multi-select-header"
                            onClick={() => toggleDropdown('pinCode')}
                          >
                            <span className="multi-select-placeholder">
                              {filterState.textFilters.pinCode.length === 0
                                ? 'Select Pin Codes'
                                : `${filterState.textFilters.pinCode.length} selected`}
                            </span>
                            {filterState.textFilters.pinCode.length > 0 && (
                              <button
                                type="button"
                                className="multi-select-clear"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setFilterState(prev => ({
                                    ...prev,
                                    textFilters: { ...prev.textFilters, pinCode: [] }
                                  }))
                                }}
                              >
                                ×
                              </button>
                            )}
                          </div>
                          {openDropdown === 'pinCode' && (
                            <div className="multi-select-options">
                              {pinCodes.length === 0 ? (
                                <div className="multi-select-empty">No options available</div>
                              ) : (
                                pinCodes.map((pin) => (
                                  <div
                                    key={pin.id}
                                    className="multi-select-option"
                                    onClick={() => toggleTextFilter('pinCode', pin.code || '')}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={filterState.textFilters.pinCode.includes(pin.code || '')}
                                      readOnly
                                    />
                                    <span className="multi-select-option-text">{pin.value}</span>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                          {filterState.textFilters.pinCode.length > 0 && (
                            <div className="multi-select-tags">
                              {filterState.textFilters.pinCode.map(code => {
                                const item = pinCodes.find(p => p.code === code)
                                return (
                                  <span key={code} className="multi-select-tag">
                                    {item?.value || code}
                                    <button
                                      type="button"
                                      className="multi-select-tag-remove"
                                      onClick={(e) => { e.stopPropagation(); removeTextFilterItem('pinCode', code) }}
                                    >
                                      ×
                                    </button>
                                  </span>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* City Multi-Select */}
                      <div className="filter-field">
                        <label className="filter-field-label">City</label>
                        <div className="multi-select-container">
                          <div
                            className="multi-select-header"
                            onClick={() => toggleDropdown('city')}
                          >
                            <span className="multi-select-placeholder">
                              {filterState.textFilters.city.length === 0
                                ? 'Select Cities'
                                : `${filterState.textFilters.city.length} selected`}
                            </span>
                            {filterState.textFilters.city.length > 0 && (
                              <button
                                type="button"
                                className="multi-select-clear"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setFilterState(prev => ({
                                    ...prev,
                                    textFilters: { ...prev.textFilters, city: [] }
                                  }))
                                }}
                              >
                                ×
                              </button>
                            )}
                          </div>
                          {openDropdown === 'city' && (
                            <div className="multi-select-options">
                              {cities.length === 0 ? (
                                <div className="multi-select-empty">No options available</div>
                              ) : (
                                cities.map((city) => (
                                  <div
                                    key={city.id}
                                    className="multi-select-option"
                                    onClick={() => toggleTextFilter('city', city.code || '')}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={filterState.textFilters.city.includes(city.code || '')}
                                      readOnly
                                    />
                                    <span className="multi-select-option-text">{city.value}</span>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                          {filterState.textFilters.city.length > 0 && (
                            <div className="multi-select-tags">
                              {filterState.textFilters.city.map(code => {
                                const item = cities.find(c => c.code === code)
                                return (
                                  <span key={code} className="multi-select-tag">
                                    {item?.value || code}
                                    <button
                                      type="button"
                                      className="multi-select-tag-remove"
                                      onClick={(e) => { e.stopPropagation(); removeTextFilterItem('city', code) }}
                                    >
                                      ×
                                    </button>
                                  </span>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Numeric Filters Section */}
                <div className="filter-section">
                  <div className="filter-section__header">
                    <h4 className="filter-section__title">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 15S5 14 8 14C11 14 13 16 16 16C19 16 20 15 20 15V3S19 4 16 4C13 4 11 2 8 2C5 2 4 3 4 3V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M4 22V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Numeric Filters
                    </h4>
                  </div>
                  <div className="filter-section__content">
                    {filterState.numericFilters.map((filter, index) => (
                      <div key={index} className="numeric-filter-row">
                        <div className="numeric-filter-fields">
                          <div className="filter-field">
                            <label className="filter-field-label">Numeric Field</label>
                            <select
                              className="wizard-input wizard-select"
                              value={filter.field}
                              onChange={(e) => updateNumericFilter(index, 'field', e.target.value)}
                            >
                              <option value="">Select Field</option>
                              {numericFields.map((field) => (
                                <option key={field.id} value={field.code}>
                                  {field.value}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="filter-field">
                            <label className="filter-field-label">Choose a Sign</label>
                            <select
                              className="wizard-input wizard-select"
                              value={filter.sign}
                              onChange={(e) => updateNumericFilter(index, 'sign', e.target.value)}
                            >
                              <option value="">Select Sign</option>
                              {numericSigns.map((sign) => (
                                <option key={sign.id} value={sign.code}>
                                  {sign.value}
                                </option>
                              ))}
                            </select>
                          </div>
                          {filter.sign && renderNumericValueFields(filter, index)}
                        </div>
                        {filterState.numericFilters.length > 1 && (
                          <button
                            type="button"
                            className="filter-remove-btn"
                            onClick={() => removeNumericFilter(index)}
                            title="Remove filter"
                          >
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="filter-add-btn"
                      onClick={addNumericFilter}
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Add Numeric Filter
                    </button>
                  </div>
                </div>

                {/* Date Filters Section */}
                <div className="filter-section">
                  <div className="filter-section__header">
                    <h4 className="filter-section__title">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Date Filters
                    </h4>
                  </div>
                  <div className="filter-section__content">
                    {filterState.dateFilters.map((filter, index) => (
                      <div key={index} className="date-filter-row">
                        <div className="date-filter-fields">
                          <div className="filter-field">
                            <label className="filter-field-label">Date Field</label>
                            <select
                              className="wizard-input wizard-select"
                              value={filter.field}
                              onChange={(e) => updateDateFilter(index, 'field', e.target.value)}
                            >
                              <option value="">Select Date Field</option>
                              {dateFields.map((field) => (
                                <option key={field.id} value={field.code}>
                                  {field.value}
                                </option>
                              ))}
                            </select>
                          </div>
                          {filter.field && (
                            <>
                              <div className="filter-field">
                                <label className="filter-field-label">From Date</label>
                                <input
                                  type="date"
                                  className="wizard-input"
                                  value={filter.fromDate}
                                  onChange={(e) => updateDateFilter(index, 'fromDate', e.target.value)}
                                />
                              </div>
                              <div className="filter-field">
                                <label className="filter-field-label">To Date</label>
                                <input
                                  type="date"
                                  className="wizard-input"
                                  value={filter.toDate}
                                  onChange={(e) => updateDateFilter(index, 'toDate', e.target.value)}
                                />
                              </div>
                            </>
                          )}
                        </div>
                        {filterState.dateFilters.length > 1 && (
                          <button
                            type="button"
                            className="filter-remove-btn"
                            onClick={() => removeDateFilter(index)}
                            title="Remove filter"
                          >
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="filter-add-btn"
                      onClick={addDateFilter}
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Add Date Filter
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )

      case 4:
        return (
          <>
            <h3 className="wizard-step-title">Template Selection</h3>
            <p className="wizard-step-description">
              Select a message template for this rule.
            </p>
            <div className="wizard-form-group">
              <label className="wizard-label wizard-label--required">Template</label>
              {!formData.channel ? (
                <div className="wizard-info-box">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>Please select a communication channel in Step 2 first to view available templates.</span>
                </div>
              ) : isLoadingTemplates ? (
                <div className="channel-loading">Loading templates...</div>
              ) : templates.length === 0 ? (
                <div className="wizard-info-box wizard-info-box--warning">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.29 3.86L1.82 18C1.64537 18.3024 1.55296 18.6453 1.55199 18.9945C1.55101 19.3437 1.64151 19.6871 1.81445 19.9905C1.98738 20.2939 2.23675 20.5467 2.53773 20.7239C2.83871 20.9011 3.18082 20.9962 3.53 21H20.47C20.8192 20.9962 21.1613 20.9011 21.4623 20.7239C21.7633 20.5467 22.0126 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>No templates found for the selected channel. Please create a template first.</span>
                </div>
              ) : (
                <div className="template-select-row">
                  <select
                    className="wizard-input wizard-select"
                    value={formData.templateId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, templateId: e.target.value }))}
                  >
                    <option value="">Select a template</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id.toString()}>
                        {template.templateName} ({template.language})
                      </option>
                    ))}
                  </select>
                  {formData.templateId && (
                    <button
                      type="button"
                      className="template-view-btn"
                      onClick={() => handleViewTemplateDetails(formData.templateId)}
                      title="View template details"
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      View Details
                    </button>
                  )}
                </div>
              )}
              {errors.templateId && <div className="wizard-error">{errors.templateId}</div>}
            </div>
          </>
        )

      case 5:
        return (
          <>
            <h3 className="wizard-step-title">Schedule & Frequency</h3>
            <p className="wizard-step-description">
              Configure when and how often this rule should execute.
            </p>
            <div className="wizard-form-group">
              <label className="wizard-label">Frequency</label>
              <div className="frequency-options">
                {(['daily', 'weekly', 'monthly'] as LegacyFrequencyType[]).map((freq) => (
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
                  <label className="wizard-label">Days of Week (select multiple)</label>
                  <div className="day-selector">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day}
                        type="button"
                        className={`day-btn ${(formData.selectedDays || []).includes(day) ? 'day-btn--selected' : ''}`}
                        onClick={() => {
                          setFormData((prev) => {
                            const currentDays = prev.selectedDays || []
                            const newDays = currentDays.includes(day)
                              ? currentDays.filter(d => d !== day)
                              : [...currentDays, day]
                            return {
                              ...prev,
                              selectedDays: newDays,
                              // Also set dayOfWeek to first selected day for backward compatibility
                              frequency: { ...prev.frequency, dayOfWeek: newDays[0] },
                            }
                          })
                        }}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  <small style={{ color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                    Click to select/deselect multiple days
                  </small>
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

        {/* Template Details Modal */}
        {isTemplateDetailsOpen && (
          <div className="template-details-overlay" onClick={closeTemplateDetails}>
            <div className="template-details-modal" onClick={(e) => e.stopPropagation()}>
              <div className="template-details-header">
                <h3 className="template-details-title">Template Details</h3>
                <button className="template-details-close" onClick={closeTemplateDetails}>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <div className="template-details-content">
                {isLoadingTemplateDetails ? (
                  <div className="template-details-loading">
                    <div className="spinner"></div>
                    <span>Loading template details...</span>
                  </div>
                ) : templateDetails ? (
                  <>
                    <div className="template-details-info">
                      <div className="template-details-row">
                        <span className="template-details-label">Template Name</span>
                        <span className="template-details-value">{templateDetails.templateName}</span>
                      </div>
                      <div className="template-details-row">
                        <span className="template-details-label">Template Code</span>
                        <span className="template-details-value">{templateDetails.templateCode}</span>
                      </div>
                      <div className="template-details-row">
                        <span className="template-details-label">Channel</span>
                        <span className="template-details-value template-details-badge">{templateDetails.channel}</span>
                      </div>
                      <div className="template-details-row">
                        <span className="template-details-label">Language</span>
                        <span className="template-details-value">{templateDetails.language}</span>
                      </div>
                      {templateDetails.provider && (
                        <div className="template-details-row">
                          <span className="template-details-label">Provider</span>
                          <span className="template-details-value">{templateDetails.provider}</span>
                        </div>
                      )}
                      {templateDetails.providerTemplateId && (
                        <div className="template-details-row">
                          <span className="template-details-label">Provider Template ID</span>
                          <span className="template-details-value">{templateDetails.providerTemplateId}</span>
                        </div>
                      )}
                      <div className="template-details-row">
                        <span className="template-details-label">Status</span>
                        <span className={`template-details-value template-details-status ${templateDetails.isActive ? 'template-details-status--active' : 'template-details-status--inactive'}`}>
                          {templateDetails.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {templateDetails.description && (
                        <div className="template-details-row template-details-row--full">
                          <span className="template-details-label">Description</span>
                          <span className="template-details-value">{templateDetails.description}</span>
                        </div>
                      )}
                    </div>

                    <div className="template-details-section">
                      <h4 className="template-details-section-title">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Content
                      </h4>
                      <div className="template-details-content-box">
                        {templateDetails.content?.subject && (
                          <div className="template-content-subject">
                            <strong>Subject:</strong> {templateDetails.content.subject}
                          </div>
                        )}
                        <pre className="template-content-body">{templateDetails.content?.content || 'No content available'}</pre>
                      </div>
                    </div>

                    {templateDetails.variables && templateDetails.variables.length > 0 && (
                      <div className="template-details-section">
                        <h4 className="template-details-section-title">
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Variables ({templateDetails.variables.length})
                        </h4>
                        <div className="template-variables-list">
                          {templateDetails.variables.map((variable) => (
                            <div key={variable.id} className="template-variable-item">
                              <div className="template-variable-name">
                                <code>{`{{${variable.variableKey}}}`}</code>
                                {variable.isRequired && <span className="template-variable-required">Required</span>}
                              </div>
                              {variable.description && (
                                <div className="template-variable-desc">{variable.description}</div>
                              )}
                              {variable.defaultValue && (
                                <div className="template-variable-default">
                                  Default: <code>{variable.defaultValue}</code>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="template-details-meta">
                      <span>Created: {new Date(templateDetails.createdAt).toLocaleDateString()}</span>
                      <span>Updated: {new Date(templateDetails.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </>
                ) : (
                  <div className="template-details-error">
                    Failed to load template details. Please try again.
                  </div>
                )}
              </div>
              <div className="template-details-footer">
                <button type="button" className="wizard-btn wizard-btn--secondary" onClick={closeTemplateDetails}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

export default RuleWizard
