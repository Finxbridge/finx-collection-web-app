/**
 * Strategy Engine types and interfaces
 * Types for communication rules and execution workflows
 */

// Channel types for communication
export type CommunicationChannel = 'SMS' | 'Email' | 'WhatsApp' | 'IVR' | 'PushNotification'

// Rule status
export type RuleStatus = 'active' | 'inactive'

// Execution status
export type ExecutionStatus = 'success' | 'failed' | 'running' | 'partial'

// Trigger types
export type TriggerType = 'scheduled' | 'manual'

// Frequency types
export type FrequencyType = 'daily' | 'weekly' | 'monthly'

// Days of week
export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'

// Filter operators
export type FilterOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  | 'contains'
  | 'not_contains'
  | 'in'
  | 'not_in'

// Filter field types
export type FilterFieldType = 'text' | 'number' | 'date' | 'select'

// Filter field definition
export interface FilterField {
  id: string
  name: string
  type: FilterFieldType
  options?: string[] // For select type fields
}

// Filter condition
export interface FilterCondition {
  id: string
  field: string
  operator: FilterOperator
  value: string | number | string[]
}

// Filter group with AND/OR logic
export interface FilterGroup {
  id: string
  logic: 'AND' | 'OR'
  conditions: FilterCondition[]
}

// Frequency configuration
export interface FrequencyConfig {
  type: FrequencyType
  time: string // HH:mm format
  dayOfWeek?: DayOfWeek // For weekly
  dayOfMonth?: number // For monthly (1-31)
}

// Template definition
export interface RuleTemplate {
  id: string
  name: string
  channel: CommunicationChannel
  content: string
}

// Ownership options
export type OwnershipType = 'internal' | 'agency' | 'hybrid'

// Rule definition
export interface Rule {
  id: string
  name: string
  description?: string
  channel: CommunicationChannel
  status: RuleStatus
  eligibleCount: number
  nextRun?: string // ISO date string
  lastRun?: string // ISO date string
  lastRunStatus?: ExecutionStatus
  templateId?: string
  templateName?: string
  ownership: OwnershipType
  priority?: number
  dpdTrigger?: number
  frequency: FrequencyConfig
  filters: FilterGroup[]
  createdAt: string
  updatedAt: string
  createdBy?: string
}

// Rule creation/update request
export interface RuleRequest {
  name: string
  description?: string
  channel: CommunicationChannel
  status: RuleStatus
  templateId?: string
  ownership: OwnershipType
  priority?: number
  dpdTrigger?: number
  frequency: FrequencyConfig
  filters: FilterGroup[]
}

// Execution log entry
export interface ExecutionLog {
  id: string
  runId: string
  ruleId: string
  ruleName: string
  triggerType: TriggerType
  startTime: string
  endTime?: string
  duration?: number // in seconds
  status: ExecutionStatus
  totalProcessed: number
  successCount: number
  failedCount: number
  errorMessage?: string
}

// Execution log detail
export interface ExecutionLogDetail extends ExecutionLog {
  processedRecords: ExecutionRecord[]
}

// Individual execution record
export interface ExecutionRecord {
  id: string
  caseId: string
  customerId: string
  customerName: string
  channel: CommunicationChannel
  status: 'sent' | 'delivered' | 'failed' | 'pending'
  sentAt?: string
  deliveredAt?: string
  errorMessage?: string
}

// Dashboard stats
export interface StrategyEngineStats {
  activeRules: number
  activeRulesTrend: number // percentage change
  totalEligible: number
  nextScheduledRun?: string
  successRate: number
  successRateTrend: number
}

// Wizard step data
export interface RuleWizardData {
  // Step 1: Basic Info
  name: string
  description: string
  // Step 2: Channel
  channel: CommunicationChannel | null
  // Step 3: Filters
  filters: FilterGroup[]
  // Step 4: Template & Strategy
  templateId: string
  ownership: OwnershipType
  priority: number
  // Step 5: Triggers & Frequency
  dpdTrigger: number
  frequency: FrequencyConfig
}

// API response types
export interface RulesListResponse {
  rules: Rule[]
  total: number
  page: number
  pageSize: number
}

export interface ExecutionLogsResponse {
  logs: ExecutionLog[]
  total: number
  page: number
  pageSize: number
}
