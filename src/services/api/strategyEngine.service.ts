/**
 * Strategy Engine API service
 * Handles all strategy engine API calls with mock data
 */

import type {
  Rule,
  RuleRequest,
  ExecutionLog,
  StrategyEngineStats,
  RuleTemplate,
  FilterField,
  RulesListResponse,
  ExecutionLogsResponse,
} from '@types'

// Mock templates
const mockTemplates: RuleTemplate[] = [
  { id: '1', name: 'Gentle Reminder', channel: 'SMS', content: 'Dear {name}, this is a gentle reminder about your pending payment.' },
  { id: '2', name: 'Payment Due Notice', channel: 'Email', content: 'Your payment of {amount} is due on {date}.' },
  { id: '3', name: 'Legal Notice', channel: 'Email', content: 'This is a legal notice regarding your outstanding balance.' },
  { id: '4', name: 'WhatsApp Reminder', channel: 'WhatsApp', content: 'Hi {name}! Quick reminder about your upcoming payment.' },
  { id: '5', name: 'Urgent Collection', channel: 'SMS', content: 'URGENT: Please contact us regarding your account.' },
  { id: '6', name: 'Settlement Offer', channel: 'Email', content: 'Special settlement offer for your account.' },
]

// Mock filter fields
const mockFilterFields: FilterField[] = [
  { id: 'dpd', name: 'Days Past Due (DPD)', type: 'number' },
  { id: 'region', name: 'Region', type: 'select', options: ['North', 'South', 'East', 'West', 'Central'] },
  { id: 'loanAmount', name: 'Loan Amount', type: 'number' },
  { id: 'outstandingAmount', name: 'Outstanding Amount', type: 'number' },
  { id: 'productType', name: 'Product Type', type: 'select', options: ['Personal Loan', 'Home Loan', 'Credit Card', 'Auto Loan'] },
  { id: 'bucket', name: 'Bucket', type: 'select', options: ['X', '1', '2', '3', 'NPA'] },
  { id: 'customerSegment', name: 'Customer Segment', type: 'select', options: ['Premium', 'Regular', 'High Risk'] },
  { id: 'lastContactDate', name: 'Last Contact Date', type: 'date' },
  { id: 'city', name: 'City', type: 'text' },
]

// Mock rules data
let mockRules: Rule[] = [
  {
    id: '1',
    name: '30+ DPD Payment Reminder',
    description: 'Send SMS reminder to customers with 30+ days past due',
    channel: 'SMS',
    status: 'active',
    eligibleCount: 1250,
    nextRun: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    lastRunStatus: 'success',
    templateId: '1',
    templateName: 'Gentle Reminder',
    ownership: 'internal',
    priority: 1,
    dpdTrigger: 30,
    frequency: { type: 'daily', time: '09:00' },
    filters: [
      {
        id: 'f1',
        logic: 'AND',
        conditions: [
          { id: 'c1', field: 'dpd', operator: 'greater_than_or_equal', value: 30 },
          { id: 'c2', field: 'dpd', operator: 'less_than', value: 60 },
        ],
      },
    ],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:00:00Z',
  },
  {
    id: '2',
    name: '60+ DPD Email Campaign',
    description: 'Email campaign for 60+ DPD customers with legal notice',
    channel: 'Email',
    status: 'active',
    eligibleCount: 850,
    nextRun: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    lastRun: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    lastRunStatus: 'success',
    templateId: '3',
    templateName: 'Legal Notice',
    ownership: 'internal',
    priority: 2,
    dpdTrigger: 60,
    frequency: { type: 'weekly', time: '10:00', dayOfWeek: 'Mon' },
    filters: [
      {
        id: 'f2',
        logic: 'AND',
        conditions: [
          { id: 'c3', field: 'dpd', operator: 'greater_than_or_equal', value: 60 },
          { id: 'c4', field: 'outstandingAmount', operator: 'greater_than', value: 50000 },
        ],
      },
    ],
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-18T16:30:00Z',
  },
  {
    id: '3',
    name: 'WhatsApp Quick Reminder',
    description: 'WhatsApp reminder for 15+ DPD customers',
    channel: 'WhatsApp',
    status: 'active',
    eligibleCount: 2100,
    nextRun: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    lastRun: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    lastRunStatus: 'running',
    templateId: '4',
    templateName: 'WhatsApp Reminder',
    ownership: 'internal',
    priority: 1,
    dpdTrigger: 15,
    frequency: { type: 'daily', time: '11:00' },
    filters: [
      {
        id: 'f3',
        logic: 'AND',
        conditions: [
          { id: 'c5', field: 'dpd', operator: 'greater_than_or_equal', value: 15 },
          { id: 'c6', field: 'dpd', operator: 'less_than', value: 30 },
        ],
      },
    ],
    createdAt: '2024-01-12T09:15:00Z',
    updatedAt: '2024-01-19T11:00:00Z',
  },
  {
    id: '4',
    name: 'High Value Account Alert',
    description: 'SMS alert for high value accounts with 45+ DPD',
    channel: 'SMS',
    status: 'inactive',
    eligibleCount: 320,
    lastRun: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    lastRunStatus: 'failed',
    templateId: '5',
    templateName: 'Urgent Collection',
    ownership: 'agency',
    priority: 3,
    dpdTrigger: 45,
    frequency: { type: 'monthly', time: '14:00', dayOfMonth: 1 },
    filters: [
      {
        id: 'f4',
        logic: 'AND',
        conditions: [
          { id: 'c7', field: 'dpd', operator: 'greater_than_or_equal', value: 45 },
          { id: 'c8', field: 'loanAmount', operator: 'greater_than', value: 500000 },
        ],
      },
    ],
    createdAt: '2024-01-08T11:00:00Z',
    updatedAt: '2024-01-17T09:30:00Z',
  },
  {
    id: '5',
    name: 'Settlement Offer Campaign',
    description: 'Email settlement offers for 90+ DPD customers',
    channel: 'Email',
    status: 'active',
    eligibleCount: 450,
    nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    lastRun: new Date(Date.now() - 168 * 60 * 60 * 1000).toISOString(),
    lastRunStatus: 'success',
    templateId: '6',
    templateName: 'Settlement Offer',
    ownership: 'hybrid',
    priority: 2,
    dpdTrigger: 90,
    frequency: { type: 'weekly', time: '09:00', dayOfWeek: 'Wed' },
    filters: [
      {
        id: 'f5',
        logic: 'AND',
        conditions: [
          { id: 'c9', field: 'dpd', operator: 'greater_than_or_equal', value: 90 },
        ],
      },
    ],
    createdAt: '2024-01-05T14:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  },
]

// Mock execution logs
const mockExecutionLogs: ExecutionLog[] = [
  {
    id: 'log1',
    runId: 'RUN-2024-001',
    ruleId: '1',
    ruleName: '30+ DPD Payment Reminder',
    triggerType: 'scheduled',
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 300000).toISOString(),
    duration: 300,
    status: 'success',
    totalProcessed: 1250,
    successCount: 1235,
    failedCount: 15,
  },
  {
    id: 'log2',
    runId: 'RUN-2024-002',
    ruleId: '2',
    ruleName: '60+ DPD Email Campaign',
    triggerType: 'scheduled',
    startTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 48 * 60 * 60 * 1000 + 450000).toISOString(),
    duration: 450,
    status: 'success',
    totalProcessed: 850,
    successCount: 842,
    failedCount: 8,
  },
  {
    id: 'log3',
    runId: 'RUN-2024-003',
    ruleId: '3',
    ruleName: 'WhatsApp Quick Reminder',
    triggerType: 'manual',
    startTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    status: 'running',
    totalProcessed: 1500,
    successCount: 1500,
    failedCount: 0,
  },
  {
    id: 'log4',
    runId: 'RUN-2024-004',
    ruleId: '4',
    ruleName: 'High Value Account Alert',
    triggerType: 'scheduled',
    startTime: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 72 * 60 * 60 * 1000 + 60000).toISOString(),
    duration: 60,
    status: 'failed',
    totalProcessed: 320,
    successCount: 0,
    failedCount: 320,
    errorMessage: 'SMS gateway connection timeout',
  },
  {
    id: 'log5',
    runId: 'RUN-2024-005',
    ruleId: '1',
    ruleName: '30+ DPD Payment Reminder',
    triggerType: 'scheduled',
    startTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 48 * 60 * 60 * 1000 + 280000).toISOString(),
    duration: 280,
    status: 'partial',
    totalProcessed: 1180,
    successCount: 1050,
    failedCount: 130,
  },
]

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const strategyEngineService = {
  /**
   * Get dashboard stats
   */
  async getStats(): Promise<StrategyEngineStats> {
    await delay(500)
    const activeRules = mockRules.filter(r => r.status === 'active').length
    const totalEligible = mockRules.reduce((sum, r) => sum + r.eligibleCount, 0)
    const nextScheduled = mockRules
      .filter(r => r.status === 'active' && r.nextRun)
      .sort((a, b) => new Date(a.nextRun!).getTime() - new Date(b.nextRun!).getTime())[0]?.nextRun

    return {
      activeRules,
      activeRulesTrend: 12.5,
      totalEligible,
      nextScheduledRun: nextScheduled,
      successRate: 94.2,
      successRateTrend: 2.3,
    }
  },

  /**
   * Get all rules
   */
  async getRules(page: number = 0, pageSize: number = 20, search?: string): Promise<RulesListResponse> {
    await delay(500)
    let filteredRules = [...mockRules]

    if (search) {
      const searchLower = search.toLowerCase()
      filteredRules = filteredRules.filter(
        r => r.name.toLowerCase().includes(searchLower) ||
             r.channel.toLowerCase().includes(searchLower)
      )
    }

    const start = page * pageSize
    const end = start + pageSize
    const paginatedRules = filteredRules.slice(start, end)

    return {
      rules: paginatedRules,
      total: filteredRules.length,
      page,
      pageSize,
    }
  },

  /**
   * Get rule by ID
   */
  async getRuleById(id: string): Promise<Rule | null> {
    await delay(300)
    return mockRules.find(r => r.id === id) || null
  },

  /**
   * Create new rule
   */
  async createRule(data: RuleRequest): Promise<Rule> {
    await delay(800)
    const newRule: Rule = {
      id: String(mockRules.length + 1),
      ...data,
      eligibleCount: Math.floor(Math.random() * 1000) + 100,
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockRules.push(newRule)
    return newRule
  },

  /**
   * Update rule
   */
  async updateRule(id: string, data: Partial<RuleRequest>): Promise<Rule> {
    await delay(600)
    const index = mockRules.findIndex(r => r.id === id)
    if (index === -1) {
      throw new Error('Rule not found')
    }
    mockRules[index] = {
      ...mockRules[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    return mockRules[index]
  },

  /**
   * Delete rule
   */
  async deleteRule(id: string): Promise<void> {
    await delay(500)
    const index = mockRules.findIndex(r => r.id === id)
    if (index === -1) {
      throw new Error('Rule not found')
    }
    mockRules.splice(index, 1)
  },

  /**
   * Toggle rule status
   */
  async toggleRuleStatus(id: string): Promise<Rule> {
    await delay(400)
    const index = mockRules.findIndex(r => r.id === id)
    if (index === -1) {
      throw new Error('Rule not found')
    }
    mockRules[index].status = mockRules[index].status === 'active' ? 'inactive' : 'active'
    mockRules[index].updatedAt = new Date().toISOString()
    return mockRules[index]
  },

  /**
   * Run rule manually
   */
  async runRuleManually(id: string): Promise<ExecutionLog> {
    await delay(1000)
    const rule = mockRules.find(r => r.id === id)
    if (!rule) {
      throw new Error('Rule not found')
    }

    // Update rule's last run status to running
    rule.lastRunStatus = 'running'
    rule.lastRun = new Date().toISOString()

    const log: ExecutionLog = {
      id: `log${mockExecutionLogs.length + 1}`,
      runId: `RUN-2024-${String(mockExecutionLogs.length + 1).padStart(3, '0')}`,
      ruleId: rule.id,
      ruleName: rule.name,
      triggerType: 'manual',
      startTime: new Date().toISOString(),
      status: 'running',
      totalProcessed: 0,
      successCount: 0,
      failedCount: 0,
    }

    mockExecutionLogs.unshift(log)

    // Simulate completion after 3 seconds
    setTimeout(() => {
      log.status = 'success'
      log.endTime = new Date().toISOString()
      log.duration = 3
      log.totalProcessed = rule.eligibleCount
      log.successCount = Math.floor(rule.eligibleCount * 0.98)
      log.failedCount = rule.eligibleCount - log.successCount
      rule.lastRunStatus = 'success'
    }, 3000)

    return log
  },

  /**
   * Get execution logs
   */
  async getExecutionLogs(
    page: number = 0,
    pageSize: number = 20,
    ruleId?: string
  ): Promise<ExecutionLogsResponse> {
    await delay(500)
    let filteredLogs = [...mockExecutionLogs]

    if (ruleId) {
      filteredLogs = filteredLogs.filter(l => l.ruleId === ruleId)
    }

    // Sort by start time descending
    filteredLogs.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())

    const start = page * pageSize
    const end = start + pageSize
    const paginatedLogs = filteredLogs.slice(start, end)

    return {
      logs: paginatedLogs,
      total: filteredLogs.length,
      page,
      pageSize,
    }
  },

  /**
   * Get available templates
   */
  async getTemplates(channel?: string): Promise<RuleTemplate[]> {
    await delay(300)
    if (channel) {
      return mockTemplates.filter(t => t.channel === channel)
    }
    return mockTemplates
  },

  /**
   * Get available filter fields
   */
  async getFilterFields(): Promise<FilterField[]> {
    await delay(200)
    return mockFilterFields
  },
}

export default strategyEngineService
