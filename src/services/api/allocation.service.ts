/**
 * Allocation & Reallocation Service
 * API endpoints for case allocation, reallocation, and related operations
 */

import { apiClient } from './axios.config'
import type {
  AllocationRule,
  AllocationRuleCreate,
  AllocationBatch,
  AllocationBatchUploadResponse,
  AllocationBatchStatusResponse,
  AllocationSummary,
  DateAllocationSummary,
  AgentWorkload,
  CaseAllocation,
  CaseAllocationHistory,
  RuleSimulationResult,
  ApplyRuleResponse,
  ReallocationByAgentRequest,
  ReallocationByFilterRequest,
  ReallocationResponse,
  BulkDeallocateRequest,
  BulkDeallocateResponse,
  AllocationError,
  AllocationErrorDetail,
  AuditEntry,
  BatchFailureAnalysis,
  FailureSummary,
  FailureReason,
  ErrorTypeBreakdown,
  FieldFailure,
  ContactUpdateBatchStatus,
  ContactUpdateType,
  AllocatedCase,
} from '@types'

const BASE_URL = '/allocations'
const REALLOCATION_URL = '/reallocations'
const FAILURE_ANALYSIS_URL = '/failure-analysis'

// Helper to handle API responses
interface ApiResponse<T> {
  status: 'success' | 'failure'
  message: string
  payload: T
  errorCode?: string
}

export const allocationService = {
  // ============ Allocation Template & Upload APIs ============

  /**
   * Download allocation CSV template
   */
  downloadTemplate: async (includeSample = false): Promise<Blob> => {
    const response = await apiClient.get(`${BASE_URL}/upload/template`, {
      params: { includeSample },
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * Upload allocation batch CSV
   */
  uploadBatch: async (file: File): Promise<AllocationBatchUploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post<ApiResponse<AllocationBatchUploadResponse>>(
      `${BASE_URL}/upload`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    )
    return response.data.payload
  },

  /**
   * Get allocation batch status
   */
  getBatchStatus: async (batchId: string): Promise<AllocationBatchStatusResponse> => {
    const response = await apiClient.get<ApiResponse<AllocationBatchStatusResponse>>(
      `${BASE_URL}/${batchId}/status`
    )
    return response.data.payload
  },

  /**
   * Export failed allocation rows as CSV
   */
  exportFailedRows: async (batchId: string): Promise<Blob> => {
    const response = await apiClient.get(`${BASE_URL}/${batchId}/errors`, {
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * Export all allocations for a batch
   */
  exportBatch: async (batchId: string): Promise<Blob> => {
    const response = await apiClient.get(`${BASE_URL}/${batchId}/export`, {
      responseType: 'blob',
    })
    return response.data
  },

  // ============ Summary APIs ============

  /**
   * Get overall allocation summary
   */
  getSummary: async (): Promise<AllocationSummary> => {
    const response = await apiClient.get<ApiResponse<AllocationSummary>>(
      `${BASE_URL}/summary`
    )
    return response.data.payload
  },

  /**
   * Get allocation summary by date
   */
  getSummaryByDate: async (date: string): Promise<DateAllocationSummary> => {
    const response = await apiClient.get<ApiResponse<DateAllocationSummary>>(
      `${BASE_URL}/summary/${date}`
    )
    return response.data.payload
  },

  // ============ Allocation Rules APIs ============

  /**
   * Get all allocation rules
   */
  getRules: async (): Promise<AllocationRule[]> => {
    const response = await apiClient.get<ApiResponse<AllocationRule[]>>(
      `${BASE_URL}/allocation-rules`
    )
    return response.data.payload
  },

  /**
   * Get allocation rule by ID
   * API: GET /allocations/allocation-rules/{ruleId}
   */
  getRuleById: async (ruleId: number): Promise<AllocationRule> => {
    const response = await apiClient.get<ApiResponse<AllocationRule>>(
      `${BASE_URL}/allocation-rules/${ruleId}`
    )
    return response.data.payload
  },

  /**
   * Create allocation rule
   */
  createRule: async (rule: AllocationRuleCreate): Promise<AllocationRule> => {
    const response = await apiClient.post<ApiResponse<AllocationRule>>(
      `${BASE_URL}/allocation-rules`,
      rule
    )
    return response.data.payload
  },

  /**
   * Update allocation rule
   */
  updateRule: async (ruleId: number, rule: AllocationRuleCreate): Promise<AllocationRule> => {
    const response = await apiClient.put<ApiResponse<AllocationRule>>(
      `${BASE_URL}/allocation-rules/${ruleId}`,
      rule
    )
    return response.data.payload
  },

  /**
   * Delete allocation rule
   */
  deleteRule: async (ruleId: number): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/allocation-rules/${ruleId}`)
  },

  /**
   * Simulate allocation rule
   */
  simulateRule: async (ruleId: number): Promise<RuleSimulationResult> => {
    const response = await apiClient.post<ApiResponse<RuleSimulationResult>>(
      `${BASE_URL}/allocation-rules/${ruleId}/simulate`
    )
    return response.data.payload
  },

  /**
   * Apply allocation rule
   * Auto-detects agents from the rule - pass empty body {}
   * For GEOGRAPHY: Auto-detects agents matching geography
   * For CAPACITY_BASED: Auto-detects ALL active agents
   */
  applyRule: async (ruleId: number): Promise<ApplyRuleResponse> => {
    const response = await apiClient.post<ApiResponse<ApplyRuleResponse>>(
      `${BASE_URL}/allocation-rules/${ruleId}/apply`,
      {}
    )
    return response.data.payload
  },

  // ============ Case Allocation APIs ============

  /**
   * Get case allocation details
   */
  getCaseAllocation: async (caseId: number): Promise<CaseAllocation> => {
    const response = await apiClient.get<ApiResponse<CaseAllocation>>(
      `${BASE_URL}/cases/${caseId}/allocation`
    )
    return response.data.payload
  },

  /**
   * Get case allocation history
   */
  getCaseAllocationHistory: async (caseId: number): Promise<CaseAllocationHistory> => {
    const response = await apiClient.get<ApiResponse<CaseAllocationHistory>>(
      `${BASE_URL}/cases/${caseId}/allocation-history`
    )
    return response.data.payload
  },

  /**
   * Deallocate a case
   */
  deallocateCase: async (caseId: number, reason: string): Promise<string> => {
    const response = await apiClient.delete<ApiResponse<string>>(
      `${BASE_URL}/cases/${caseId}`,
      { params: { reason } }
    )
    return response.data.payload
  },

  /**
   * Bulk deallocate cases
   */
  bulkDeallocate: async (request: BulkDeallocateRequest): Promise<BulkDeallocateResponse> => {
    const response = await apiClient.post<ApiResponse<BulkDeallocateResponse>>(
      `${BASE_URL}/deallocate/bulk`,
      request
    )
    return response.data.payload
  },

  // ============ Agent Workload APIs ============

  /**
   * Get agent workload
   */
  getAgentWorkload: async (
    agentIds?: number[],
    geographies?: string[]
  ): Promise<AgentWorkload[]> => {
    const response = await apiClient.get<ApiResponse<AgentWorkload[]>>(
      `${BASE_URL}/agents/workload`,
      {
        params: {
          agentIds: agentIds?.join(','),
          geographies: geographies?.join(','),
        },
      }
    )
    return response.data.payload
  },

  // ============ Batch APIs ============

  /**
   * Get all allocation batches
   */
  getBatches: async (params?: {
    status?: string
    startDate?: string
    endDate?: string
    page?: number
    size?: number
  }): Promise<AllocationBatch[]> => {
    const response = await apiClient.get<ApiResponse<AllocationBatch[]>>(
      `${BASE_URL}/batches`,
      { params }
    )
    return response.data.payload
  },

  // ============ Allocated Cases APIs ============

  /**
   * Get all allocated cases
   */
  getAllocatedCases: async (): Promise<AllocatedCase[]> => {
    const response = await apiClient.get<ApiResponse<AllocatedCase[]>>(
      `${BASE_URL}/cases/allocated`
    )
    return response.data.payload
  },

  // ============ Contact Update APIs ============

  /**
   * Download contact update template
   */
  downloadContactTemplate: async (
    includeSample = false,
    updateType?: ContactUpdateType
  ): Promise<Blob> => {
    const response = await apiClient.get(`${BASE_URL}/contacts/upload/template`, {
      params: { includeSample, updateType },
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * Upload contact update batch
   */
  uploadContactBatch: async (file: File): Promise<AllocationBatchUploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post<ApiResponse<AllocationBatchUploadResponse>>(
      `${BASE_URL}/contacts/upload`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    )
    return response.data.payload
  },

  /**
   * Get contact update batch status
   */
  getContactBatchStatus: async (batchId: string): Promise<ContactUpdateBatchStatus> => {
    const response = await apiClient.get<ApiResponse<ContactUpdateBatchStatus>>(
      `${BASE_URL}/contacts/${batchId}/status`
    )
    return response.data.payload
  },

  /**
   * Export failed contact update rows
   */
  exportFailedContactRows: async (batchId: string): Promise<Blob> => {
    const response = await apiClient.get(`${BASE_URL}/contacts/${batchId}/errors`, {
      responseType: 'blob',
    })
    return response.data
  },

  // ============ Error & Audit APIs ============

  /**
   * Get all errors
   */
  getErrors: async (): Promise<AllocationError[]> => {
    const response = await apiClient.get<ApiResponse<AllocationError[]>>(
      `${BASE_URL}/errors`
    )
    return response.data.payload
  },

  /**
   * Get error details
   */
  getErrorDetails: async (errorId: string): Promise<AllocationErrorDetail> => {
    const response = await apiClient.get<ApiResponse<AllocationErrorDetail>>(
      `${BASE_URL}/errors/${errorId}`
    )
    return response.data.payload
  },

  /**
   * Get allocation audit trail
   */
  getAuditTrail: async (): Promise<AuditEntry[]> => {
    const response = await apiClient.get<ApiResponse<AuditEntry[]>>(
      `${BASE_URL}/audit`
    )
    return response.data.payload
  },

  /**
   * Get audit trail for specific case
   */
  getCaseAuditTrail: async (caseId: number): Promise<AuditEntry[]> => {
    const response = await apiClient.get<ApiResponse<AuditEntry[]>>(
      `${BASE_URL}/audit/${caseId}`
    )
    return response.data.payload
  },
}

export const reallocationService = {
  /**
   * Upload reallocation batch
   */
  uploadBatch: async (file: File): Promise<AllocationBatchUploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post<ApiResponse<AllocationBatchUploadResponse>>(
      `${REALLOCATION_URL}/upload`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    )
    return response.data.payload
  },

  /**
   * Reallocate by agent
   */
  reallocateByAgent: async (request: ReallocationByAgentRequest): Promise<ReallocationResponse> => {
    const response = await apiClient.post<ApiResponse<ReallocationResponse>>(
      `${REALLOCATION_URL}/by-agent`,
      request
    )
    return response.data.payload
  },

  /**
   * Reallocate by filter
   */
  reallocateByFilter: async (request: ReallocationByFilterRequest): Promise<ReallocationResponse> => {
    const response = await apiClient.post<ApiResponse<ReallocationResponse>>(
      `${REALLOCATION_URL}/by-filter`,
      request
    )
    return response.data.payload
  },

  /**
   * Get reallocation batch status
   */
  getBatchStatus: async (batchId: string): Promise<AllocationBatchStatusResponse> => {
    const response = await apiClient.get<ApiResponse<AllocationBatchStatusResponse>>(
      `${REALLOCATION_URL}/${batchId}/status`
    )
    return response.data.payload
  },

  /**
   * Export failed reallocation rows
   */
  exportFailedRows: async (batchId: string): Promise<Blob> => {
    const response = await apiClient.get(`${REALLOCATION_URL}/${batchId}/errors`, {
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * Get reallocation batches
   */
  getBatches: async (params?: {
    status?: string
    startDate?: string
    endDate?: string
    page?: number
    size?: number
  }): Promise<AllocationBatch[]> => {
    const response = await apiClient.get<ApiResponse<AllocationBatch[]>>(
      `${REALLOCATION_URL}/batches`,
      { params }
    )
    return response.data.payload
  },

  /**
   * Export reallocation batch as CSV
   * Note: Uses allocations endpoint as per API design
   */
  exportBatch: async (batchId: string): Promise<Blob> => {
    const response = await apiClient.get(`${BASE_URL}/${batchId}/export`, {
      responseType: 'blob',
    })
    return response.data
  },
}

export const failureAnalysisService = {
  /**
   * Analyze batch failures
   */
  analyzeBatch: async (batchId: string): Promise<BatchFailureAnalysis> => {
    const response = await apiClient.get<ApiResponse<BatchFailureAnalysis>>(
      `${FAILURE_ANALYSIS_URL}/batch/${batchId}`
    )
    return response.data.payload
  },

  /**
   * Get failure summary
   */
  getSummary: async (startDate: string, endDate: string): Promise<FailureSummary> => {
    const response = await apiClient.get<ApiResponse<FailureSummary>>(
      `${FAILURE_ANALYSIS_URL}/summary`,
      { params: { startDate, endDate } }
    )
    return response.data.payload
  },

  /**
   * Get top failure reasons
   */
  getTopReasons: async (limit = 10): Promise<FailureReason[]> => {
    const response = await apiClient.get<ApiResponse<FailureReason[]>>(
      `${FAILURE_ANALYSIS_URL}/top-reasons`,
      { params: { limit } }
    )
    return response.data.payload
  },

  /**
   * Get failures by error type
   */
  getByErrorType: async (batchId?: string): Promise<ErrorTypeBreakdown> => {
    const response = await apiClient.get<ApiResponse<ErrorTypeBreakdown>>(
      `${FAILURE_ANALYSIS_URL}/by-error-type`,
      { params: { batchId } }
    )
    return response.data.payload
  },

  /**
   * Get failures by field
   */
  getByField: async (batchId?: string): Promise<FieldFailure[]> => {
    const response = await apiClient.get<ApiResponse<FieldFailure[]>>(
      `${FAILURE_ANALYSIS_URL}/by-field`,
      { params: { batchId } }
    )
    return response.data.payload
  },
}

export default {
  allocation: allocationService,
  reallocation: reallocationService,
  failureAnalysis: failureAnalysisService,
}
