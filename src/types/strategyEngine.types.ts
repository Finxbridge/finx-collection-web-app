/**
 * Strategy Engine types and interfaces
 * Types for communication strategies and execution workflows
 */

// Channel types for communication
export type CommunicationChannel = 'SMS' | 'WHATSAPP' | 'EMAIL' | 'IVR' | 'NOTICE'

// Legacy channel type alias for backward compatibility
export type LegacyCommunicationChannel = 'SMS' | 'Email' | 'WhatsApp' | 'IVR' | 'PushNotification'

// Strategy status
export type StrategyStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE'

// Legacy rule status alias
export type RuleStatus = 'active' | 'inactive'

// Execution status
export type ExecutionStatus = 'INITIATED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PARTIAL'

// Legacy execution status alias
export type LegacyExecutionStatus = 'success' | 'failed' | 'running' | 'partial'

// Trigger types
export type TriggerType = 'scheduled' | 'manual'

// Frequency types
export type FrequencyType = 'DAILY' | 'WEEKLY' | 'MONTHLY'

// Legacy frequency type alias
export type LegacyFrequencyType = 'daily' | 'weekly' | 'monthly'

// Days of week
export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'

// Legacy day of week alias
export type LegacyDayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'

// Filter types
export type FilterType = 'TEXT' | 'NUMERIC' | 'DATE'

// Filter operators
export type FilterOperator = '>=' | '<=' | '=' | '>' | '<' | 'RANGE' | 'BETWEEN' | 'IN'

// Legacy filter operators
export type LegacyFilterOperator =
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

// Filter field definition (for UI dropdown)
export interface FilterField {
  id: string
  name: string
  type: FilterFieldType
  options?: string[] // For select type fields
}

// New unified filter structure from API
export interface StrategyFilter {
  field: string
  filterType: FilterType
  operator: FilterOperator
  value1?: string
  value2?: string
  values?: string[]
}

// Legacy filter condition (for backward compatibility)
export interface FilterCondition {
  id: string
  field: string
  operator: LegacyFilterOperator
  value: string | number | string[]
}

// Legacy filter group with AND/OR logic
export interface FilterGroup {
  id: string
  logic: 'AND' | 'OR'
  conditions: FilterCondition[]
}

// Channel configuration
export interface ChannelConfig {
  type: CommunicationChannel
  templateName: string
  templateId?: string
}

// Schedule configuration
export interface ScheduleConfig {
  frequency: FrequencyType
  time: string // HH:mm format
  days?: DayOfWeek[] // For DAILY/WEEKLY
  dayOfMonth?: number // For MONTHLY (1-31)
  timezone?: string
}

// Schedule response from API
export interface ScheduleResponse {
  frequency: FrequencyType
  time: string
  days?: DayOfWeek[]
  dayOfMonth?: number | null
  scheduleText: string
  nextRunAt: string | null
  isEnabled: boolean
}

// Filter response from API
export interface FiltersResponse {
  dpdRange?: string | null
  outstandingAmount?: string | null
  language?: string[] | null
  product?: string[] | null
  pincode?: string[] | null
  state?: string[] | null
  city?: string[] | null
  bucket?: string | null
  status?: string | null
  estimatedCasesMatched?: number | null
}

// Legacy frequency configuration
export interface FrequencyConfig {
  type: LegacyFrequencyType
  time: string // HH:mm format
  dayOfWeek?: LegacyDayOfWeek // For weekly (backward compatibility)
  days?: LegacyDayOfWeek[] // For weekly (multiple days)
  dayOfMonth?: number // For monthly (1-31)
}

// Template definition
export interface RuleTemplate {
  id: string | number
  templateName: string
  templateCode?: string
  channel: CommunicationChannel | LegacyCommunicationChannel
  language?: string
  languageShortCode?: string
  content?: string
  name?: string // Legacy field
}

// Ownership options (legacy)
export type OwnershipType = 'internal' | 'agency' | 'hybrid'

// Strategy definition (new API structure)
export interface Strategy {
  strategyId: number
  strategyCode: string
  strategyName: string
  status: StrategyStatus
  priority: number
  description?: string
  channel: {
    type: CommunicationChannel
    templateId?: string
    templateName: string
  }
  filters: FiltersResponse
  schedule: ScheduleResponse
  createdAt: string
  updatedAt: string
  lastRunAt?: string | null
  successCount: number
  failureCount: number
}

// Strategy create/update request
export interface StrategyRequest {
  strategyName: string
  status: StrategyStatus
  priority: number
  description?: string
  channel: ChannelConfig
  filters: StrategyFilter[]
  schedule: ScheduleConfig
}

// Legacy Rule definition (for backward compatibility)
export interface Rule {
  id: string
  name: string
  description?: string
  channel: LegacyCommunicationChannel
  status: RuleStatus
  eligibleCount: number
  nextRun?: string
  lastRun?: string
  lastRunStatus?: LegacyExecutionStatus
  templateId?: string
  templateName?: string
  ownership: OwnershipType
  priority?: number
  dpdTrigger?: number
  frequency: FrequencyConfig
  filters: FilterGroup[]
  // API filter data for edit mode
  apiFilters?: {
    language?: string[]
    product?: string[]
    state?: string[]
    city?: string[]
    pincode?: string[]
    dpdRange?: string
    outstandingAmount?: string | null
    bucket?: string | null
  }
  createdAt: string
  updatedAt: string
  createdBy?: string
}

// Legacy rule creation/update request
export interface RuleRequest {
  name: string
  description?: string
  channel: LegacyCommunicationChannel
  status: RuleStatus
  templateId?: string
  ownership: OwnershipType
  priority?: number
  dpdTrigger?: number
  frequency: FrequencyConfig
  filters: FilterGroup[]
}

// Execution log entry (new API structure)
export interface StrategyExecution {
  executionId: string
  strategyId: number
  strategyName: string
  status: ExecutionStatus // Backend uses 'status' not 'executionStatus'
  startedAt: string // Backend uses 'startedAt' not 'startTime'
  completedAt?: string | null // Backend uses 'completedAt' not 'endTime'
  totalCasesProcessed: number // Backend uses 'totalCasesProcessed' not 'totalCases'
  successfulActions: number // Backend uses 'successfulActions' not 'successCount'
  failedActions: number // Backend uses 'failedActions' not 'failureCount'
  channel?: CommunicationChannel
  errorSummary?: string | null
}

// Detailed execution info
export interface StrategyExecutionDetail extends StrategyExecution {
  errors?: ExecutionError[]
}

// Execution error
export interface ExecutionError {
  caseId: number
  errorCode: string
  errorMessage: string
}

// Legacy execution log entry
export interface ExecutionLog {
  id: string
  runId: string
  ruleId: string
  ruleName: string
  triggerType: TriggerType
  startTime: string
  endTime?: string
  duration?: number // in seconds
  status: LegacyExecutionStatus
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
  channel: CommunicationChannel | LegacyCommunicationChannel
  status: 'sent' | 'delivered' | 'failed' | 'pending'
  sentAt?: string
  deliveredAt?: string
  errorMessage?: string
}

// Dashboard summary from API
export interface StrategyDashboardSummary {
  totalStrategies: number
  activeStrategies: number
  inactiveStrategies: number
  draftStrategies: number
  totalExecutions: number
  overallSuccessRate: number
  enabledSchedulers: number
}

// Dashboard strategy item
export interface DashboardStrategy {
  strategyId: number
  strategyName: string
  lastRun: string | null
  nextRun: string | null
  channel: CommunicationChannel
  successRate: number
  totalExecutions: number
  successCount: number
  failureCount: number
  status: StrategyStatus
  isSchedulerEnabled: boolean
  priority: number
  frequency: FrequencyType
}

// Dashboard response from API
export interface DashboardResponse {
  summary: StrategyDashboardSummary
  strategies: DashboardStrategy[]
}

// Legacy dashboard stats
export interface StrategyEngineStats {
  activeRules: number
  activeRulesTrend: number
  totalEligible: number
  nextScheduledRun?: string
  successRate: number
  successRateTrend: number
}

// Simulation response
export interface SimulationResult {
  matchedCasesCount: number
  matchedCases: SimulatedCase[]
}

export interface SimulatedCase {
  caseId: string
  customerName: string
  loanAccountNumber: string
  dpd: number
  totalOutstanding: number
}

// Manual execution response
export interface ExecutionInitiatedResponse {
  executionId: string
  strategyId: number
  strategyName: string
  status: string
  initiatedAt: string
}

// Wizard step data (updated for new API)
export interface StrategyWizardData {
  // Step 1: Basic Info
  strategyName: string
  description: string
  status: StrategyStatus
  priority: number
  // Step 2: Channel
  channel: CommunicationChannel | null
  templateId: string
  templateName: string
  // Step 3: Filters
  filters: StrategyFilter[]
  // Step 4: Schedule
  frequency: FrequencyType
  time: string
  days: DayOfWeek[]
  dayOfMonth?: number
}

// API filter format for strategy creation
export interface ApiFilter {
  field: string
  filterType: 'TEXT' | 'NUMERIC' | 'DATE'
  operator: string
  value1?: string
  value2?: string
  values?: string[]
}

// Legacy wizard step data
export interface RuleWizardData {
  name: string
  description: string
  channel: LegacyCommunicationChannel | null
  filters: FilterGroup[]
  templateId: string
  templateName?: string // Template name for API
  ownership: OwnershipType
  priority: number
  dpdTrigger: number
  frequency: FrequencyConfig
  selectedDays?: LegacyDayOfWeek[] // Selected days for weekly frequency
  apiFilters?: ApiFilter[] // Filters in API format
}

// API response types
export interface StrategiesListResponse {
  strategies: Strategy[]
}

export interface ExecutionsListResponse {
  executions: StrategyExecution[]
}

// Legacy API response types
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

// Communication History types
export interface CommunicationHistory {
  id: number
  communicationId: string
  caseId: number
  channel: CommunicationChannel
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED'
  templateId: number
  content: string
  sentAt: string
  deliveredAt?: string
}
