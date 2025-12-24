/**
 * Agency Management Service
 * API endpoints for agency management, approval workflow, and case allocation
 */

import { apiClient } from './axios.config'
import type {
  Agency,
  CreateAgencyRequest,
  AgencyApprovalRequest,
  Agent,
  AgencyCaseAllocation,
  AgencyCaseAllocationRequest,
  AgentCaseAssignmentRequest,
  AgencyDashboard,
  AgencyStatus,
  AgencyType,
  PageResponse,
} from '@types'

const BASE_URL = '/agency'

// API Response interface
interface ApiResponse<T> {
  status: 'success' | 'failure'
  message: string
  payload: T | null
  errorCode: string | null
  errors: Record<string, string> | null
}

// Helper function
const isSuccessResponse = <T>(response: ApiResponse<T>): boolean => {
  return response.status === 'success'
}

export const agencyService = {
  // ============ Agency CRUD Operations ============

  /**
   * Create a new agency
   */
  async createAgency(data: CreateAgencyRequest): Promise<Agency> {
    const response = await apiClient.post<ApiResponse<Agency>>(BASE_URL, data)
    if (isSuccessResponse(response.data) && response.data.payload) {
      return response.data.payload
    }
    throw new Error(response.data.message || 'Failed to create agency')
  },

  /**
   * Get agency by ID
   */
  async getAgencyById(agencyId: number): Promise<Agency> {
    const response = await apiClient.get<ApiResponse<Agency>>(`${BASE_URL}/${agencyId}`)
    if (isSuccessResponse(response.data) && response.data.payload) {
      return response.data.payload
    }
    throw new Error(response.data.message || 'Failed to fetch agency')
  },

  /**
   * Get agency by code
   */
  async getAgencyByCode(agencyCode: string): Promise<Agency> {
    const response = await apiClient.get<ApiResponse<Agency>>(`${BASE_URL}/code/${agencyCode}`)
    if (isSuccessResponse(response.data) && response.data.payload) {
      return response.data.payload
    }
    throw new Error(response.data.message || 'Failed to fetch agency')
  },

  /**
   * Update agency
   */
  async updateAgency(agencyId: number, data: CreateAgencyRequest): Promise<Agency> {
    const response = await apiClient.put<ApiResponse<Agency>>(`${BASE_URL}/${agencyId}`, data)
    if (isSuccessResponse(response.data) && response.data.payload) {
      return response.data.payload
    }
    throw new Error(response.data.message || 'Failed to update agency')
  },

  /**
   * Delete agency (soft delete)
   */
  async deleteAgency(agencyId: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>(`${BASE_URL}/${agencyId}`)
    if (!isSuccessResponse(response.data)) {
      throw new Error(response.data.message || 'Failed to delete agency')
    }
  },

  /**
   * Get all agencies with pagination
   */
  async getAllAgencies(page = 0, size = 20): Promise<PageResponse<Agency>> {
    const response = await apiClient.get<ApiResponse<PageResponse<Agency>>>(BASE_URL, {
      params: { page, size },
    })
    if (isSuccessResponse(response.data) && response.data.payload) {
      return response.data.payload
    }
    throw new Error(response.data.message || 'Failed to fetch agencies')
  },

  /**
   * Get agencies by status
   */
  async getAgenciesByStatus(
    status: AgencyStatus,
    page = 0,
    size = 20
  ): Promise<PageResponse<Agency>> {
    const response = await apiClient.get<ApiResponse<PageResponse<Agency>>>(
      `${BASE_URL}/status/${status}`,
      { params: { page, size } }
    )
    if (isSuccessResponse(response.data) && response.data.payload) {
      return response.data.payload
    }
    throw new Error(response.data.message || 'Failed to fetch agencies')
  },

  /**
   * Get agencies by type
   */
  async getAgenciesByType(
    type: AgencyType,
    page = 0,
    size = 20
  ): Promise<PageResponse<Agency>> {
    const response = await apiClient.get<ApiResponse<PageResponse<Agency>>>(
      `${BASE_URL}/type/${type}`,
      { params: { page, size } }
    )
    if (isSuccessResponse(response.data) && response.data.payload) {
      return response.data.payload
    }
    throw new Error(response.data.message || 'Failed to fetch agencies')
  },

  /**
   * Search agencies
   */
  async searchAgencies(term: string, page = 0, size = 20): Promise<PageResponse<Agency>> {
    const response = await apiClient.get<ApiResponse<PageResponse<Agency>>>(
      `${BASE_URL}/search`,
      { params: { term, page, size } }
    )
    if (isSuccessResponse(response.data) && response.data.payload) {
      return response.data.payload
    }
    throw new Error(response.data.message || 'Failed to search agencies')
  },

  // ============ Approval Workflow ============

  /**
   * Get pending approval agencies
   * Note: API returns array directly, not PageResponse
   */
  async getPendingApprovalAgencies(page = 0, size = 20): Promise<PageResponse<Agency>> {
    const response = await apiClient.get<ApiResponse<Agency[] | PageResponse<Agency>>>(
      `${BASE_URL}/pending-approval`,
      { params: { page, size } }
    )
    if (isSuccessResponse(response.data) && response.data.payload) {
      // Handle both array and PageResponse formats
      const payload = response.data.payload
      if (Array.isArray(payload)) {
        // API returns array directly - convert to PageResponse format
        return {
          content: payload,
          totalElements: payload.length,
          totalPages: 1,
          size: size,
          number: page,
        }
      }
      // API returns PageResponse format
      return payload
    }
    throw new Error(response.data.message || 'Failed to fetch pending approvals')
  },

  /**
   * Approve agency
   */
  async approveAgency(agencyId: number, notes?: string): Promise<Agency> {
    const response = await apiClient.post<ApiResponse<Agency>>(
      `${BASE_URL}/${agencyId}/approve`,
      null,
      { params: { notes } }
    )
    if (isSuccessResponse(response.data) && response.data.payload) {
      return response.data.payload
    }
    throw new Error(response.data.message || 'Failed to approve agency')
  },

  /**
   * Reject agency
   */
  async rejectAgency(agencyId: number, reason: string): Promise<Agency> {
    const response = await apiClient.post<ApiResponse<Agency>>(
      `${BASE_URL}/${agencyId}/reject`,
      null,
      { params: { reason } }
    )
    if (isSuccessResponse(response.data) && response.data.payload) {
      return response.data.payload
    }
    throw new Error(response.data.message || 'Failed to reject agency')
  },

  /**
   * Process approval (unified API)
   */
  async processApproval(data: AgencyApprovalRequest): Promise<Agency> {
    const response = await apiClient.post<ApiResponse<Agency>>(
      `${BASE_URL}/process-approval`,
      data
    )
    if (isSuccessResponse(response.data) && response.data.payload) {
      return response.data.payload
    }
    throw new Error(response.data.message || 'Failed to process approval')
  },

  // ============ Status Management ============

  /**
   * Activate agency
   */
  async activateAgency(agencyId: number): Promise<Agency> {
    const response = await apiClient.post<ApiResponse<Agency>>(
      `${BASE_URL}/${agencyId}/activate`
    )
    if (isSuccessResponse(response.data) && response.data.payload) {
      return response.data.payload
    }
    throw new Error(response.data.message || 'Failed to activate agency')
  },

  /**
   * Deactivate agency
   */
  async deactivateAgency(agencyId: number, reason?: string): Promise<Agency> {
    const response = await apiClient.post<ApiResponse<Agency>>(
      `${BASE_URL}/${agencyId}/deactivate`,
      null,
      { params: { reason } }
    )
    if (isSuccessResponse(response.data) && response.data.payload) {
      return response.data.payload
    }
    throw new Error(response.data.message || 'Failed to deactivate agency')
  },

  /**
   * Suspend agency
   */
  async suspendAgency(agencyId: number, reason?: string): Promise<Agency> {
    const response = await apiClient.post<ApiResponse<Agency>>(
      `${BASE_URL}/${agencyId}/suspend`,
      null,
      { params: { reason } }
    )
    if (isSuccessResponse(response.data) && response.data.payload) {
      return response.data.payload
    }
    throw new Error(response.data.message || 'Failed to suspend agency')
  },

  // ============ Agent Management ============

  /**
   * Get all active agents
   */
  async getActiveAgents(): Promise<Agent[]> {
    const response = await apiClient.get<ApiResponse<Agent[]>>(`${BASE_URL}/agents/active`)
    if (isSuccessResponse(response.data) && response.data.payload) {
      return response.data.payload
    }
    throw new Error(response.data.message || 'Failed to fetch agents')
  },

  /**
   * Get agents by agency
   */
  async getAgencyAgents(agencyId: number): Promise<Agent[]> {
    const response = await apiClient.get<ApiResponse<Agent[]>>(
      `${BASE_URL}/${agencyId}/agents`
    )
    if (isSuccessResponse(response.data) && response.data.payload) {
      return response.data.payload
    }
    throw new Error(response.data.message || 'Failed to fetch agency agents')
  },

  // ============ Case Allocation ============

  /**
   * Allocate cases to agency (first level)
   */
  async allocateCasesToAgency(data: AgencyCaseAllocationRequest): Promise<void> {
    const response = await apiClient.post<ApiResponse<null>>(
      `${BASE_URL}/allocate-cases`,
      data
    )
    if (!isSuccessResponse(response.data)) {
      throw new Error(response.data.message || 'Failed to allocate cases')
    }
  },

  /**
   * Assign cases to agent (second level)
   */
  async assignCasesToAgent(
    agencyId: number,
    data: AgentCaseAssignmentRequest
  ): Promise<void> {
    const response = await apiClient.post<ApiResponse<null>>(
      `${BASE_URL}/${agencyId}/assign-to-agent`,
      data
    )
    if (!isSuccessResponse(response.data)) {
      throw new Error(response.data.message || 'Failed to assign cases to agent')
    }
  },

  /**
   * Deallocate cases from agency
   * Note: API expects array of caseIds as request body, reason as query param
   */
  async deallocateCasesFromAgency(
    agencyId: number,
    caseIds: number[],
    reason?: string
  ): Promise<void> {
    const response = await apiClient.post<ApiResponse<null>>(
      `${BASE_URL}/${agencyId}/deallocate-cases`,
      caseIds,
      { params: { reason } }
    )
    if (!isSuccessResponse(response.data)) {
      throw new Error(response.data.message || 'Failed to deallocate cases')
    }
  },

  /**
   * Get agency case allocations
   */
  async getAgencyCaseAllocations(
    agencyId: number,
    page = 0,
    size = 20
  ): Promise<PageResponse<AgencyCaseAllocation>> {
    const response = await apiClient.get<ApiResponse<PageResponse<AgencyCaseAllocation>>>(
      `${BASE_URL}/${agencyId}/case-allocations`,
      { params: { page, size } }
    )
    if (isSuccessResponse(response.data) && response.data.payload) {
      return response.data.payload
    }
    throw new Error(response.data.message || 'Failed to fetch case allocations')
  },

  /**
   * Get unassigned cases for an agency
   */
  async getUnassignedCases(
    agencyId: number,
    page = 0,
    size = 20
  ): Promise<PageResponse<AgencyCaseAllocation>> {
    const response = await apiClient.get<ApiResponse<PageResponse<AgencyCaseAllocation>>>(
      `${BASE_URL}/${agencyId}/unassigned-cases`,
      { params: { page, size } }
    )
    if (isSuccessResponse(response.data) && response.data.payload) {
      return response.data.payload
    }
    throw new Error(response.data.message || 'Failed to fetch unassigned cases')
  },

  /**
   * Get all unassigned cases across all agencies
   */
  async getAllUnassignedCases(page = 0, size = 20): Promise<PageResponse<AgencyCaseAllocation>> {
    const response = await apiClient.get<ApiResponse<PageResponse<AgencyCaseAllocation>>>(
      `${BASE_URL}/cases/unassigned-to-agent`,
      { params: { page, size } }
    )
    if (isSuccessResponse(response.data) && response.data.payload) {
      return response.data.payload
    }
    throw new Error(response.data.message || 'Failed to fetch unassigned cases')
  },

  /**
   * Get cases not allocated to any agency
   * Returns cases from allocation-service that are NOT yet allocated to ANY agency
   */
  async getCasesNotAllocatedToAgency(page = 0, size = 20): Promise<PageResponse<AgencyCaseAllocation>> {
    const response = await apiClient.get<ApiResponse<PageResponse<AgencyCaseAllocation>>>(
      `${BASE_URL}/cases/unallocated-to-agency`,
      { params: { page, size } }
    )
    if (isSuccessResponse(response.data) && response.data.payload) {
      return response.data.payload
    }
    throw new Error(response.data.message || 'Failed to fetch unallocated cases')
  },

  /**
   * Get all allocated cases with status
   * Returns all cases with their allocation/assignment status
   */
  async getAllAllocatedCasesWithStatus(page = 0, size = 20): Promise<PageResponse<AgencyCaseAllocation>> {
    const response = await apiClient.get<ApiResponse<PageResponse<AgencyCaseAllocation>>>(
      `${BASE_URL}/cases/all-with-status`,
      { params: { page, size } }
    )
    if (isSuccessResponse(response.data) && response.data.payload) {
      return response.data.payload
    }
    throw new Error(response.data.message || 'Failed to fetch allocated cases with status')
  },

  // ============ Dashboard ============

  /**
   * Get agency dashboard
   */
  async getAgencyDashboard(agencyId: number): Promise<AgencyDashboard> {
    const response = await apiClient.get<ApiResponse<AgencyDashboard>>(
      `${BASE_URL}/${agencyId}/dashboard`
    )
    if (isSuccessResponse(response.data) && response.data.payload) {
      return response.data.payload
    }
    throw new Error(response.data.message || 'Failed to fetch agency dashboard')
  },

  // ============ Helper Methods ============

  /**
   * Get agency type options for dropdowns
   */
  getAgencyTypeOptions(): { value: AgencyType; label: string }[] {
    return [
      { value: 'INTERNAL', label: 'Internal' },
      { value: 'EXTERNAL', label: 'External' },
      { value: 'LEGAL', label: 'Legal' },
      { value: 'FIELD', label: 'Field' },
    ]
  },

  /**
   * Get agency status options for dropdowns
   */
  getAgencyStatusOptions(): { value: AgencyStatus; label: string; color: string }[] {
    return [
      { value: 'PENDING_APPROVAL', label: 'Pending Approval', color: 'warning' },
      { value: 'APPROVED', label: 'Approved', color: 'info' },
      { value: 'REJECTED', label: 'Rejected', color: 'danger' },
      { value: 'ACTIVE', label: 'Active', color: 'success' },
      { value: 'INACTIVE', label: 'Inactive', color: 'default' },
      { value: 'SUSPENDED', label: 'Suspended', color: 'orange' },
      { value: 'TERMINATED', label: 'Terminated', color: 'danger' },
    ]
  },
}

export default agencyService
