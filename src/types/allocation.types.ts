/**
 * Allocation & Reallocation Types
 */

// Enumerations
export type RuleType = 'PERCENTAGE_SPLIT' | 'CAPACITY_BASED' | 'GEOGRAPHY'
export type AllocationBatchStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PARTIAL'
export type AllocationAction = 'ALLOCATED' | 'REALLOCATED' | 'DEALLOCATED'
export type ContactUpdateType = 'MOBILE_UPDATE' | 'EMAIL_UPDATE' | 'ADDRESS_UPDATE'
export type AllocationErrorType = 'VALIDATION_ERROR' | 'NOT_FOUND' | 'BUSINESS_ERROR' | 'INTERNAL_ERROR'

// Allocation Rule Status
export type AllocationRuleStatus = 'DRAFT' | 'READY_FOR_APPLY' | 'ACTIVE' | 'INACTIVE'

// Allocation Rule
export interface AllocationRule {
  id: number
  name: string
  description?: string
  ruleType: RuleType
  // Geography fields (required for GEOGRAPHY rule type)
  states?: string[]
  cities?: string[]
  status: AllocationRuleStatus
  priority: number
  createdBy: number
  createdAt: string
  updatedAt: string
}

/**
 * Create Allocation Rule Request
 *
 * GEOGRAPHY Rule:
 * - At least one geography filter (states or cities) is required
 * - Matches cases to agents based on geographic location
 *
 * CAPACITY_BASED Rule:
 * - No geography fields required
 * - Distributes ALL unallocated cases to ALL active agents based on workload
 */
export interface AllocationRuleCreate {
  name: string
  description?: string
  ruleType: RuleType
  // Geography fields (required for GEOGRAPHY rule, not needed for CAPACITY_BASED)
  states?: string[]
  cities?: string[]
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

// Eligible Agent in simulation result
export interface EligibleAgent {
  agentId: number
  agentName: string
  capacity: number
  currentWorkload: number
  availableCapacity: number
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
/**
 * Simulation Result Response
 * Returns preview of allocation before applying
 */
export interface RuleSimulationResult {
  ruleId: number
  unallocatedCases: number
  caseIds: number[]
  agentIds: number[]
  eligibleAgents: EligibleAgent[]
  suggestedDistribution: Record<string, number>
}

/**
 * Apply Rule Response
 * Auto-detects agents from the rule - pass empty body {}
 */
export interface ApplyRuleResponse {
  ruleId: number
  totalCasesAllocated: number
  allocations: {
    agentId: number
    allocated: number
  }[]
  status: AllocationRuleStatus
}

// Reallocation Types
export interface ReallocationByAgentRequest {
  fromAgent: string
  toAgent: string
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
  jobId?: string
  batchId?: string
  casesReallocated?: number
  totalReallocated?: number
  estimatedCases?: number | null
  totalMatchingCases?: number
  status: AllocationBatchStatus | string
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

// Allocated Cases Types
export interface AllocatedCaseAgent {
  userId: number
  username: string
}

export interface AllocatedCase {
  caseId: number
  primaryAgent: AllocatedCaseAgent
  secondaryAgent: AllocatedCaseAgent | null
  allocatedAt: string
}
