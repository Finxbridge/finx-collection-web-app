/**
 * Strategy Engine API service
 * Handles all strategy engine API calls
 */

import { apiClient } from './axios.config'
import type { ApiResponse } from '@types'
import type {
  Strategy,
  StrategyRequest,
  StrategyExecution,
  StrategyExecutionDetail,
  DashboardResponse,
  SimulationResult,
  ExecutionInitiatedResponse,
  RuleTemplate,
  FilterField,
  CommunicationChannel,
  StrategyEngineStats,
  RulesListResponse,
  ExecutionLogsResponse,
  StrategyFilter,
  Rule,
  FilterGroup,
} from '@types'

const BASE_URL = '/strategies'
const TEMPLATES_URL = '/templates'

// Available filter fields based on API documentation
const FILTER_FIELDS: FilterField[] = [
  // Numeric Fields
  { id: 'DPD', name: 'Days Past Due (DPD)', type: 'number' },
  { id: 'OVERDUE_AMOUNT', name: 'Overdue Amount', type: 'number' },
  { id: 'LOAN_AMOUNT', name: 'Loan Amount', type: 'number' },
  { id: 'EMI_AMOUNT', name: 'EMI Amount', type: 'number' },
  { id: 'PAID_EMI', name: 'Paid EMI Count', type: 'number' },
  { id: 'PENDING_EMI', name: 'Pending EMI Count', type: 'number' },
  { id: 'POS', name: 'Principal Outstanding', type: 'number' },
  { id: 'TOS', name: 'Total Outstanding', type: 'number' },
  { id: 'PENALTY_AMOUNT', name: 'Penalty Amount', type: 'number' },
  { id: 'LATE_FEES', name: 'Late Fees', type: 'number' },
  { id: 'OD_INTEREST', name: 'Overdue Interest', type: 'number' },
  { id: 'BUREAU_SCORE', name: 'Bureau Score', type: 'number' },
  // Text Fields
  { id: 'LANGUAGE', name: 'Language', type: 'select', options: ['HINDI', 'ENGLISH', 'MARATHI', 'TAMIL', 'TELUGU', 'KANNADA', 'GUJARATI', 'BENGALI'] },
  { id: 'STATE', name: 'State', type: 'select', options: ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Delhi', 'Uttar Pradesh', 'West Bengal', 'Rajasthan'] },
  { id: 'CITY', name: 'City', type: 'text' },
  { id: 'PINCODE', name: 'Pincode', type: 'text' },
  { id: 'STATUS', name: 'Case Status', type: 'select', options: ['ACTIVE', 'CLOSED', 'SETTLED', 'WRITTEN_OFF'] },
  { id: 'CHANNEL', name: 'Communication Channel', type: 'select', options: ['SMS', 'WHATSAPP', 'EMAIL', 'IVR', 'NOTICE'] },
  { id: 'SOURCE_TYPE', name: 'Source Type', type: 'text' },
  { id: 'OWNERSHIP', name: 'Ownership', type: 'select', options: ['INTERNAL', 'AGENCY', 'HYBRID'] },
  // Date Fields
  { id: 'DUE_DATE', name: 'Due Date', type: 'date' },
  { id: 'DISB_DATE', name: 'Disbursement Date', type: 'date' },
  { id: 'EMI_START_DATE', name: 'EMI Start Date', type: 'date' },
  { id: 'MATURITY_DATE', name: 'Maturity Date', type: 'date' },
  { id: 'LAST_PAYMENT_DATE', name: 'Last Payment Date', type: 'date' },
  { id: 'NEXT_EMI_DATE', name: 'Next EMI Date', type: 'date' },
]

export const strategyEngineService = {
  // ============ Strategy CRUD APIs ============

  /**
   * Create a new strategy
   */
  createStrategy: async (data: StrategyRequest): Promise<Strategy> => {
    const response = await apiClient.post<ApiResponse<Strategy>>(
      `${BASE_URL}/create`,
      data
    )
    return response.data.payload!
  },

  /**
   * Update an existing strategy
   */
  updateStrategy: async (strategyId: number, data: StrategyRequest): Promise<Strategy> => {
    const response = await apiClient.put<ApiResponse<Strategy>>(
      `${BASE_URL}/${strategyId}`,
      data
    )
    return response.data.payload!
  },

  /**
   * Get strategy by ID
   */
  getStrategyById: async (strategyId: number): Promise<Strategy> => {
    const response = await apiClient.get<ApiResponse<Strategy>>(
      `${BASE_URL}/${strategyId}`
    )
    return response.data.payload!
  },

  /**
   * Get all strategies
   */
  getStrategies: async (status?: string): Promise<Strategy[]> => {
    const params = status ? { status } : undefined
    const response = await apiClient.get<ApiResponse<Strategy[]>>(
      BASE_URL,
      { params }
    )
    return response.data.payload || []
  },

  /**
   * Delete a strategy
   */
  deleteStrategy: async (strategyId: number): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${strategyId}`)
  },

  /**
   * Update strategy status
   * PATCH /strategies/{id}/status?status=ACTIVE|INACTIVE
   */
  updateStrategyStatus: async (strategyId: number, status: string): Promise<Strategy> => {
    const response = await apiClient.patch<ApiResponse<Strategy>>(
      `${BASE_URL}/${strategyId}/status?status=${status}`,
      {}
    )
    return response.data.payload!
  },

  // ============ Simulation & Execution APIs ============

  /**
   * Simulate strategy (preview matching cases)
   */
  simulateStrategy: async (strategyId: number): Promise<SimulationResult> => {
    const response = await apiClient.post<ApiResponse<SimulationResult>>(
      `${BASE_URL}/${strategyId}/simulate`
    )
    return response.data.payload!
  },

  /**
   * Execute strategy manually
   */
  executeStrategy: async (strategyId: number): Promise<ExecutionInitiatedResponse> => {
    const response = await apiClient.post<ApiResponse<ExecutionInitiatedResponse>>(
      `${BASE_URL}/${strategyId}/execute`
    )
    return response.data.payload!
  },

  /**
   * Enable/Disable scheduler for a strategy
   */
  toggleScheduler: async (strategyId: number, enabled: boolean): Promise<Strategy> => {
    const response = await apiClient.patch<ApiResponse<Strategy>>(
      `${BASE_URL}/${strategyId}/scheduler`,
      null,
      { params: { enabled } }
    )
    return response.data.payload!
  },

  // ============ Dashboard API ============

  /**
   * Get dashboard with summary and all strategies
   */
  getDashboard: async (): Promise<DashboardResponse> => {
    const response = await apiClient.get<ApiResponse<DashboardResponse>>(
      `${BASE_URL}/dashboard`
    )
    return response.data.payload!
  },

  // ============ Execution History APIs ============

  /**
   * Get all execution runs
   */
  getExecutions: async (): Promise<StrategyExecution[]> => {
    const response = await apiClient.get<ApiResponse<StrategyExecution[]>>(
      `${BASE_URL}/executions`
    )
    return response.data.payload || []
  },

  /**
   * Get execution details by ID
   */
  getExecutionById: async (executionId: string): Promise<StrategyExecution> => {
    const response = await apiClient.get<ApiResponse<StrategyExecution>>(
      `${BASE_URL}/executions/${executionId}`
    )
    return response.data.payload!
  },

  /**
   * Get detailed execution run info including errors
   */
  getExecutionDetails: async (executionId: string): Promise<StrategyExecutionDetail> => {
    const response = await apiClient.get<ApiResponse<StrategyExecutionDetail>>(
      `${BASE_URL}/executions/${executionId}/details`
    )
    return response.data.payload!
  },

  // ============ Template APIs ============

  /**
   * Get templates for dropdown by channel
   */
  getTemplatesByChannel: async (channel: CommunicationChannel): Promise<RuleTemplate[]> => {
    const response = await apiClient.get<ApiResponse<RuleTemplate[]>>(
      `${TEMPLATES_URL}/dropdown/${channel}`
    )
    return response.data.payload || []
  },

  // ============ Helper/Utility Methods ============

  /**
   * Get available filter fields
   */
  getFilterFields: async (): Promise<FilterField[]> => {
    // Return predefined filter fields based on API documentation
    return Promise.resolve(FILTER_FIELDS)
  },

  // ============ Legacy Methods for Backward Compatibility ============
  // These methods maintain compatibility with existing components

  /**
   * Get dashboard stats (legacy format)
   */
  getStats: async (): Promise<StrategyEngineStats> => {
    const dashboard = await strategyEngineService.getDashboard()
    const { summary, strategies } = dashboard

    // Find next scheduled run
    const nextRun = strategies
      .filter(s => s.status === 'ACTIVE' && s.nextRun)
      .sort((a, b) => new Date(a.nextRun!).getTime() - new Date(b.nextRun!).getTime())[0]?.nextRun

    return {
      activeRules: summary.activeStrategies,
      activeRulesTrend: 0, // Not provided by API
      totalEligible: summary.totalExecutions,
      nextScheduledRun: nextRun || undefined,
      successRate: summary.overallSuccessRate,
      successRateTrend: 0, // Not provided by API
    }
  },

  /**
   * Get rules (legacy format - maps strategies to rules)
   */
  getRules: async (page: number = 0, pageSize: number = 20, search?: string): Promise<RulesListResponse> => {
    const strategies = await strategyEngineService.getStrategies()

    // Filter by search if provided
    let filtered = strategies
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = strategies.filter(s =>
        s.strategyName.toLowerCase().includes(searchLower) ||
        s.channel.type.toLowerCase().includes(searchLower)
      )
    }

    // Map to legacy format
    const rules: Rule[] = filtered.map(s => ({
      id: String(s.strategyId),
      name: s.strategyName,
      description: s.description,
      channel: s.channel.type === 'WHATSAPP' ? 'WhatsApp' as const : s.channel.type === 'EMAIL' ? 'Email' as const : s.channel.type as 'SMS' | 'IVR' | 'PushNotification',
      status: s.status === 'ACTIVE' ? 'active' as const : 'inactive' as const,
      eligibleCount: s.filters.estimatedCasesMatched || 0,
      nextRun: s.schedule.nextRunAt || undefined,
      lastRun: s.lastRunAt || undefined,
      lastRunStatus: s.successCount > 0 ? 'success' as const : s.failureCount > 0 ? 'failed' as const : undefined,
      templateId: s.channel.templateId,
      templateName: s.channel.templateName,
      ownership: 'internal' as const,
      priority: s.priority,
      dpdTrigger: s.filters.dpdRange ? parseInt(s.filters.dpdRange.replace(/[^\d]/g, '')) : undefined,
      frequency: {
        type: s.schedule.frequency.toLowerCase() as 'daily' | 'weekly' | 'monthly',
        time: s.schedule.time,
        dayOfWeek: s.schedule.days?.[0]?.slice(0, 3) as 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun' | undefined,
        days: s.schedule.days?.map(d => d.slice(0, 3) as 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'),
        dayOfMonth: s.schedule.dayOfMonth || undefined,
      },
      filters: [] as FilterGroup[],
      // Include API filter data for edit mode
      apiFilters: {
        language: s.filters.language || undefined,
        product: s.filters.product || undefined,
        state: s.filters.state || undefined,
        city: s.filters.city || undefined,
        pincode: s.filters.pincode || undefined,
        dpdRange: s.filters.dpdRange || undefined,
        outstandingAmount: s.filters.outstandingAmount || undefined,
        bucket: s.filters.bucket || undefined,
      },
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }))

    // Paginate
    const start = page * pageSize
    const end = start + pageSize
    const paginatedRules = rules.slice(start, end)

    return {
      rules: paginatedRules,
      total: rules.length,
      page,
      pageSize,
    }
  },

  /**
   * Delete rule (legacy - wraps deleteStrategy)
   */
  deleteRule: async (id: string): Promise<void> => {
    await strategyEngineService.deleteStrategy(parseInt(id))
  },

  /**
   * Toggle rule status (legacy - wraps updateStrategyStatus)
   */
  toggleRuleStatus: async (id: string): Promise<void> => {
    const strategy = await strategyEngineService.getStrategyById(parseInt(id))
    const newStatus = strategy.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    await strategyEngineService.updateStrategyStatus(parseInt(id), newStatus)
  },

  /**
   * Run rule manually (legacy - wraps executeStrategy)
   */
  runRuleManually: async (id: string): Promise<ExecutionInitiatedResponse> => {
    return strategyEngineService.executeStrategy(parseInt(id))
  },

  /**
   * Get execution logs (legacy format)
   */
  getExecutionLogs: async (page: number = 0, pageSize: number = 20, ruleId?: string): Promise<ExecutionLogsResponse> => {
    const executions = await strategyEngineService.getExecutions()

    // Filter by ruleId if provided
    let filtered = executions
    if (ruleId) {
      filtered = executions.filter(e => String(e.strategyId) === ruleId)
    }

    // Map execution status to legacy format
    const mapStatus = (status: string): 'success' | 'failed' | 'running' | 'partial' => {
      switch (status) {
        case 'COMPLETED': return 'success'
        case 'FAILED': return 'failed'
        case 'RUNNING':
        case 'INITIATED': return 'running'
        case 'PARTIAL': return 'partial'
        default: return 'running'
      }
    }

    // Map to legacy format (using new backend field names)
    const logs = filtered.map(e => {
      const startTime = new Date(e.startedAt)
      const endTime = e.completedAt ? new Date(e.completedAt) : null
      const duration = endTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : undefined

      return {
        id: e.executionId,
        runId: e.executionId,
        ruleId: String(e.strategyId),
        ruleName: e.strategyName,
        triggerType: 'scheduled' as const,
        startTime: e.startedAt,
        endTime: e.completedAt || undefined,
        duration,
        status: mapStatus(e.status),
        totalProcessed: e.totalCasesProcessed,
        successCount: e.successfulActions,
        failedCount: e.failedActions,
        errorMessage: e.errorSummary || undefined,
      }
    })

    // Sort by start time descending
    logs.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())

    // Paginate
    const start = page * pageSize
    const end = start + pageSize
    const paginatedLogs = logs.slice(start, end)

    return {
      logs: paginatedLogs,
      total: logs.length,
      page,
      pageSize,
    }
  },

  /**
   * Get templates (legacy format)
   */
  getTemplates: async (channel?: string): Promise<RuleTemplate[]> => {
    if (channel) {
      // Map legacy channel names
      const channelMap: Record<string, CommunicationChannel> = {
        'SMS': 'SMS',
        'Email': 'EMAIL',
        'WhatsApp': 'WHATSAPP',
        'IVR': 'IVR',
        'PushNotification': 'NOTICE',
      }
      const apiChannel = channelMap[channel] || channel as CommunicationChannel
      return strategyEngineService.getTemplatesByChannel(apiChannel)
    }

    // If no channel specified, return empty array (must select channel first)
    return []
  },

  /**
   * Create rule (legacy - wraps createStrategy)
   */
  createRule: async (data: {
    name: string
    description?: string
    channel: string
    status: string
    templateId?: string
    templateName?: string
    ownership: string
    priority?: number
    dpdTrigger?: number
    frequency: { type: string; time: string; dayOfWeek?: string; dayOfMonth?: number; days?: string[] }
    filters: Array<{ id: string; logic: string; conditions: Array<{ id: string; field: string; operator: string; value: string | number | string[] }> }>
    apiFilters?: Array<{ field: string; filterType: 'TEXT' | 'NUMERIC' | 'DATE'; operator: string; value1?: string; value2?: string; values?: string[] }>
  }): Promise<Strategy> => {
    // Map legacy channel names to new format
    const channelMap: Record<string, CommunicationChannel> = {
      'SMS': 'SMS',
      'Email': 'EMAIL',
      'WhatsApp': 'WHATSAPP',
      'WHATSAPP': 'WHATSAPP',
      'EMAIL': 'EMAIL',
      'IVR': 'IVR',
      'PushNotification': 'NOTICE',
      'NOTICE': 'NOTICE',
    }

    // Map frequency type
    const frequencyMap: Record<string, 'DAILY' | 'WEEKLY' | 'MONTHLY'> = {
      'daily': 'DAILY',
      'weekly': 'WEEKLY',
      'monthly': 'MONTHLY',
    }

    // Map day of week to full day name
    const dayMap: Record<string, 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'> = {
      'Mon': 'MONDAY',
      'Tue': 'TUESDAY',
      'Wed': 'WEDNESDAY',
      'Thu': 'THURSDAY',
      'Fri': 'FRIDAY',
      'Sat': 'SATURDAY',
      'Sun': 'SUNDAY',
    }

    // Use apiFilters if available (from new wizard), otherwise convert legacy filters
    let filters: StrategyFilter[] = []

    if (data.apiFilters && data.apiFilters.length > 0) {
      // Use the pre-formatted API filters from the wizard
      filters = data.apiFilters.map(f => ({
        field: f.field,
        filterType: f.filterType,
        operator: f.operator as '>=' | '<=' | '=' | '>' | '<' | 'RANGE' | 'BETWEEN' | 'IN',
        value1: f.value1,
        value2: f.value2,
        values: f.values,
      }))
    } else {
      // Convert legacy filters format
      filters = data.filters.flatMap(group =>
        group.conditions.map(c => {
          const field = FILTER_FIELDS.find(f => f.id === c.field)
          const filterType = field?.type === 'number' ? 'NUMERIC' : field?.type === 'date' ? 'DATE' : 'TEXT'

          // Map operators
          const opMap: Record<string, '>=' | '<=' | '=' | '>' | '<' | 'RANGE' | 'BETWEEN' | 'IN'> = {
            'equals': '=',
            'greater_than': '>',
            'less_than': '<',
            'greater_than_or_equal': '>=',
            'less_than_or_equal': '<=',
            'in': 'IN',
          }

          return {
            field: c.field,
            filterType: filterType as 'TEXT' | 'NUMERIC' | 'DATE',
            operator: opMap[c.operator] || '=' as const,
            value1: String(c.value),
          }
        })
      )
    }

    // Add DPD filter if specified and not already in apiFilters
    if (data.dpdTrigger) {
      const hasDpdFilter = filters.some(f => f.field === 'DPD')
      if (!hasDpdFilter) {
        filters.push({
          field: 'DPD',
          filterType: 'NUMERIC',
          operator: '>=',
          value1: String(data.dpdTrigger),
        })
      }
    }

    // Build schedule days array based on frequency type
    let scheduleDays: ('MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY')[] | undefined

    if (data.frequency.type === 'daily') {
      // For daily frequency, include weekdays by default
      scheduleDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
    } else if (data.frequency.type === 'weekly') {
      // For weekly, use provided days array or single dayOfWeek
      if (data.frequency.days && data.frequency.days.length > 0) {
        scheduleDays = data.frequency.days.map(d => dayMap[d]).filter(Boolean) as ('MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY')[]
      } else if (data.frequency.dayOfWeek) {
        scheduleDays = [dayMap[data.frequency.dayOfWeek]]
      }
    }

    const request: StrategyRequest = {
      strategyName: data.name,
      status: data.status === 'active' ? 'ACTIVE' : 'DRAFT',
      priority: data.priority || 1,
      description: data.description,
      channel: {
        type: channelMap[data.channel] || 'SMS',
        templateName: data.templateName || 'Default Template',
        templateId: data.templateId,
      },
      filters,
      schedule: {
        frequency: frequencyMap[data.frequency.type] || 'DAILY',
        time: data.frequency.time,
        days: scheduleDays,
        dayOfMonth: data.frequency.dayOfMonth,
      },
    }

    // Debug: Log the request being sent to the API
    console.log('Creating Strategy - API Request:', JSON.stringify(request, null, 2))

    return strategyEngineService.createStrategy(request)
  },

  /**
   * Update rule (legacy - wraps updateStrategy)
   */
  updateRule: async (id: string, data: {
    name: string
    description?: string
    channel: string
    status: string
    templateId?: string
    templateName?: string
    ownership: string
    priority?: number
    dpdTrigger?: number
    frequency: { type: string; time: string; dayOfWeek?: string; dayOfMonth?: number; days?: string[] }
    filters: Array<{ id: string; logic: string; conditions: Array<{ id: string; field: string; operator: string; value: string | number | string[] }> }>
    apiFilters?: Array<{ field: string; filterType: 'TEXT' | 'NUMERIC' | 'DATE'; operator: string; value1?: string; value2?: string; values?: string[] }>
  }): Promise<Strategy> => {
    // Use same mapping logic as createRule
    const channelMap: Record<string, CommunicationChannel> = {
      'SMS': 'SMS',
      'Email': 'EMAIL',
      'WhatsApp': 'WHATSAPP',
      'WHATSAPP': 'WHATSAPP',
      'EMAIL': 'EMAIL',
      'IVR': 'IVR',
      'PushNotification': 'NOTICE',
      'NOTICE': 'NOTICE',
    }

    const frequencyMap: Record<string, 'DAILY' | 'WEEKLY' | 'MONTHLY'> = {
      'daily': 'DAILY',
      'weekly': 'WEEKLY',
      'monthly': 'MONTHLY',
    }

    const dayMap: Record<string, 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'> = {
      'Mon': 'MONDAY',
      'Tue': 'TUESDAY',
      'Wed': 'WEDNESDAY',
      'Thu': 'THURSDAY',
      'Fri': 'FRIDAY',
      'Sat': 'SATURDAY',
      'Sun': 'SUNDAY',
    }

    // Use apiFilters if available (from new wizard), otherwise convert legacy filters
    let filters: StrategyFilter[] = []

    if (data.apiFilters && data.apiFilters.length > 0) {
      // Use the pre-formatted API filters from the wizard
      filters = data.apiFilters.map(f => ({
        field: f.field,
        filterType: f.filterType,
        operator: f.operator as '>=' | '<=' | '=' | '>' | '<' | 'RANGE' | 'BETWEEN' | 'IN',
        value1: f.value1,
        value2: f.value2,
        values: f.values,
      }))
    } else {
      // Convert legacy filters format
      filters = data.filters.flatMap(group =>
        group.conditions.map(c => {
          const field = FILTER_FIELDS.find(f => f.id === c.field)
          const filterType = field?.type === 'number' ? 'NUMERIC' : field?.type === 'date' ? 'DATE' : 'TEXT'

          const opMap: Record<string, '>=' | '<=' | '=' | '>' | '<' | 'RANGE' | 'BETWEEN' | 'IN'> = {
            'equals': '=',
            'greater_than': '>',
            'less_than': '<',
            'greater_than_or_equal': '>=',
            'less_than_or_equal': '<=',
            'in': 'IN',
          }

          return {
            field: c.field,
            filterType: filterType as 'TEXT' | 'NUMERIC' | 'DATE',
            operator: opMap[c.operator] || '=' as const,
            value1: String(c.value),
          }
        })
      )
    }

    // Add DPD filter if specified and not already present
    if (data.dpdTrigger) {
      const hasDpdFilter = filters.some(f => f.field === 'DPD')
      if (!hasDpdFilter) {
        filters.push({
          field: 'DPD',
          filterType: 'NUMERIC',
          operator: '>=',
          value1: String(data.dpdTrigger),
        })
      }
    }

    // Build schedule days array based on frequency type
    let scheduleDays: ('MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY')[] | undefined

    if (data.frequency.type === 'daily') {
      // For daily frequency, include weekdays by default
      scheduleDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
    } else if (data.frequency.type === 'weekly') {
      // For weekly, use provided days array or single dayOfWeek
      if (data.frequency.days && data.frequency.days.length > 0) {
        scheduleDays = data.frequency.days.map(d => dayMap[d]).filter(Boolean) as ('MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY')[]
      } else if (data.frequency.dayOfWeek) {
        scheduleDays = [dayMap[data.frequency.dayOfWeek]]
      }
    }

    const request: StrategyRequest = {
      strategyName: data.name,
      status: data.status === 'active' ? 'ACTIVE' : data.status === 'inactive' ? 'INACTIVE' : 'DRAFT',
      priority: data.priority || 1,
      description: data.description,
      channel: {
        type: channelMap[data.channel] || 'SMS',
        templateName: data.templateName || 'Default Template',
        templateId: data.templateId,
      },
      filters,
      schedule: {
        frequency: frequencyMap[data.frequency.type] || 'DAILY',
        time: data.frequency.time,
        days: scheduleDays,
        dayOfMonth: data.frequency.dayOfMonth,
      },
    }

    return strategyEngineService.updateStrategy(parseInt(id), request)
  },
}

export default strategyEngineService
