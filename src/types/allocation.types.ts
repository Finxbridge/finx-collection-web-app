/**
 * Allocation & Reallocation Types
 */

// Enumerations
export type RuleType = 'PERCENTAGE_SPLIT' | 'CAPACITY_BASED' | 'GEOGRAPHY'
export type AllocationBatchStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PARTIAL'
export type AllocationAction = 'ALLOCATED' | 'REALLOCATED' | 'DEALLOCATED'
export type ContactUpdateType = 'MOBILE_UPDATE' | 'EMAIL_UPDATE' | 'ADDRESS_UPDATE'
export type AllocationErrorType = 'VALIDATION_ERROR' | 'NOT_FOUND' | 'BUSINESS_ERROR' | 'INTERNAL_ERROR'

// Allocation Rule
export interface AllocationRule {
  id: number
  name: string
  description?: string
  ruleType: RuleType
  geographies: string[]
  buckets?: string[]
  maxCasesPerAgent?: number
  agentIds?: number[]
  percentages?: number[]
  status: 'ACTIVE' | 'INACTIVE'
  priority: number
  createdBy: number
  createdAt: string
  updatedAt: string
}

export interface AllocationRuleCreate {
  name: string
  description?: string
  ruleType: RuleType
  geographies: string[]
  buckets?: string[]
  maxCasesPerAgent?: number
  agentIds?: number[]
  percentages?: number[]
  priority?: number
}

// Batch Types
export interface AllocationBatch {
  batchId: string
  batchType: 'ALLOCATION' | 'REALLOCATION' | 'CONTACT_UPDATE'
  totalCases: number
  successful: number
  failed: number
  status: AllocationBatchStatus
  createdAt: string
  completedAt?: string
}

export interface AllocationBatchUploadResponse {
  batchId: string
  totalCases: number
  status: AllocationBatchStatus
}

export interface AllocationBatchStatusResponse {
  batchId: string
  totalCases: number
  successful: number
  failed: number
  status: AllocationBatchStatus
}

// Summary Types
export interface AllocationSummary {
  totalAllocations: number
  successfulAllocations: number
  failedAllocations: number
  pendingAllocations: number
}

export interface DateAllocationSummary {
  date: string
  totalAllocations: number
  successfulAllocations: number
  failedAllocations: number
}

// Agent Types
export interface AgentInfo {
  userId: number
  username: string
}

export interface AgentWorkload {
  agentId: number
  agentName: string
  geography: string
  totalAllocated: number
  activeAllocations: number
  capacity: number
  availableCapacity: number
  utilizationPercentage: number
}

export interface AgentAllocationPreview {
  agentId: number
  agentName: string
  casesToAllocate: number
}

// Case Allocation Types
export interface CaseAllocation {
  caseId: number
  primaryAgent: AgentInfo
  secondaryAgent?: AgentInfo
  allocatedAt: string
}

export interface AllocationHistoryEntry {
  allocatedToUserId: number
  allocatedToUsername: string
  allocatedAt: string
  action: AllocationAction
  reason?: string
}

export interface CaseAllocationHistory {
  caseId: number
  history: AllocationHistoryEntry[]
}

// Simulation & Apply Types
export interface RuleSimulationResult {
  ruleId: number
  ruleName: string
  totalMatchingCases: number
  caseIds: number[]
  agentAllocationPreview: AgentAllocationPreview[]
}

export interface ApplyRuleRequest {
  agentIds: number[]
  percentages?: number[]
  caseIds?: number[]
  maxCases?: number
}

export interface ApplyRuleResponse {
  batchId: string
  totalAllocated: number
  allocationBreakdown: {
    agentId: number
    allocated: number
  }[]
}

// Reallocation Types
export interface ReallocationByAgentRequest {
  fromUserId: number
  toUserId: number
  reason?: string
}

export interface ReallocationByFilterRequest {
  filterCriteria: {
    geography?: string
    bucket?: string
    minDpd?: number
    maxDpd?: number
  }
  toUserId: number
  reason?: string
}

export interface ReallocationResponse {
  batchId: string
  totalReallocated?: number
  totalMatchingCases?: number
  status: AllocationBatchStatus
}

// Deallocation Types
export interface BulkDeallocateRequest {
  caseIds: number[]
  reason: string
}

export interface BulkDeallocateResponse {
  totalRequested: number
  successfullyDeallocated: number
  failed: number
  errors: string[]
}

// Error Types
export interface AllocationError {
  errorId: string
  batchId: string
  entityType: 'ALLOCATION' | 'REALLOCATION' | 'CONTACT_UPDATE'
  errorType: AllocationErrorType
  errorMessage: string
  timestamp: string
}

export interface AllocationErrorDetail extends AllocationError {
  entityId: number
  rowData: Record<string, string>
}

// Audit Types
export interface AuditEntry {
  auditId: string
  entityType: 'CASE' | 'RULE'
  entityId: number
  action: AllocationAction
  userId: number
  username: string
  timestamp: string
  changes: Record<string, { old: unknown; newValue: unknown }>
}

// Failure Analysis Types
export interface FailureReason {
  reason: string
  count: number
  percentage: number
}

export interface BatchFailureAnalysis {
  batchId: string
  totalRecords: number
  failedRecords: number
  failureRate: number
  topReasons: FailureReason[]
}

export interface DailyFailureBreakdown {
  date: string
  totalRecords: number
  failures: number
  failureRate: number
}

export interface FailureSummary {
  startDate: string
  endDate: string
  totalBatches: number
  totalRecords: number
  totalFailures: number
  overallFailureRate: number
  dailyBreakdown: DailyFailureBreakdown[]
}

export interface ErrorTypeBreakdown {
  validationErrors: number
  notFoundErrors: number
  duplicateErrors: number
  systemErrors: number
}

export interface FieldFailure {
  fieldName: string
  failureCount: number
  commonErrors: string[]
}

// Contact Update Types
export interface ContactUpdateBatchStatus {
  batchId: string
  totalRecords: number
  successful: number
  failed: number
  status: AllocationBatchStatus
}
