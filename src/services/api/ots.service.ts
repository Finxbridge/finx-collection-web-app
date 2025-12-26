/**
 * OTS (One-Time Settlement) Service
 * API endpoints for OTS management
 */

import { apiClient } from './axios.config'
import type { OTSRequest, CreateOTSRequest, OTSStatus, OTSCaseSearchDTO } from '@types'

const BASE_URL = '/collections/ots'

// Paginated Response
interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

// API Response interface - supports CommonApiResponse pattern
interface ApiResponse<T> {
  success: boolean
  message: string
  data: T | null
  timestamp?: string
  traceId?: string
}

// Helper function
const isSuccessResponse = <T>(response: ApiResponse<T>): boolean => {
  return response.success === true
}

export const otsService = {
  // ============ Case Search ============

  /**
   * Search cases for OTS creation
   */
  async searchCasesForOTS(
    query: string,
    page = 0,
    size = 10
  ): Promise<PageResponse<OTSCaseSearchDTO>> {
    const response = await apiClient.get<ApiResponse<PageResponse<OTSCaseSearchDTO>>>(
      `${BASE_URL}/cases/search`,
      { params: { query, page, size } }
    )
    if (isSuccessResponse(response.data) && response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.message || 'Failed to search cases')
  },

  // ============ OTS CRUD Operations ============

  /**
   * Create a new OTS
   */
  async createOTS(data: CreateOTSRequest): Promise<OTSRequest> {
    const response = await apiClient.post<ApiResponse<OTSRequest>>(BASE_URL, data)
    if (isSuccessResponse(response.data) && response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.message || 'Failed to create OTS')
  },

  /**
   * Get OTS by ID
   */
  async getOTSById(id: number): Promise<OTSRequest> {
    const response = await apiClient.get<ApiResponse<OTSRequest>>(`${BASE_URL}/${id}`)
    if (isSuccessResponse(response.data) && response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.message || 'Failed to fetch OTS')
  },

  /**
   * Get OTS by Number
   */
  async getOTSByNumber(otsNumber: string): Promise<OTSRequest> {
    const response = await apiClient.get<ApiResponse<OTSRequest>>(`${BASE_URL}/number/${otsNumber}`)
    if (isSuccessResponse(response.data) && response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.message || 'Failed to fetch OTS')
  },

  /**
   * Get OTS by Case ID
   */
  async getOTSByCase(caseId: number): Promise<OTSRequest[]> {
    const response = await apiClient.get<ApiResponse<OTSRequest[]>>(`${BASE_URL}/case/${caseId}`)
    if (isSuccessResponse(response.data) && response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.message || 'Failed to fetch OTS list')
  },

  /**
   * Get OTS by Status with pagination
   */
  async getOTSByStatus(
    status: OTSStatus,
    page = 0,
    size = 20
  ): Promise<PageResponse<OTSRequest>> {
    const response = await apiClient.get<ApiResponse<PageResponse<OTSRequest>>>(
      `${BASE_URL}/status/${status}`,
      { params: { page, size } }
    )
    if (isSuccessResponse(response.data) && response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.message || 'Failed to fetch OTS by status')
  },

  // ============ Approval Workflow ============

  /**
   * Approve OTS
   */
  async approveOTS(id: number, comments?: string): Promise<OTSRequest> {
    const response = await apiClient.post<ApiResponse<OTSRequest>>(
      `${BASE_URL}/${id}/approve`,
      null,
      { params: comments ? { comments } : undefined }
    )
    if (isSuccessResponse(response.data) && response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.message || 'Failed to approve OTS')
  },

  /**
   * Reject OTS
   */
  async rejectOTS(id: number, reason: string): Promise<OTSRequest> {
    const response = await apiClient.post<ApiResponse<OTSRequest>>(
      `${BASE_URL}/${id}/reject`,
      null,
      { params: { reason } }
    )
    if (isSuccessResponse(response.data) && response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.message || 'Failed to reject OTS')
  },

  /**
   * Cancel OTS
   */
  async cancelOTS(id: number, reason: string): Promise<OTSRequest> {
    const response = await apiClient.post<ApiResponse<OTSRequest>>(
      `${BASE_URL}/${id}/cancel`,
      null,
      { params: { reason } }
    )
    if (isSuccessResponse(response.data) && response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.message || 'Failed to cancel OTS')
  },

  /**
   * Get pending approvals with pagination
   */
  async getPendingApprovals(page = 0, size = 20): Promise<PageResponse<OTSRequest>> {
    const response = await apiClient.get<ApiResponse<PageResponse<OTSRequest>>>(
      `${BASE_URL}/pending-approvals`,
      { params: { page, size } }
    )
    if (isSuccessResponse(response.data) && response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.message || 'Failed to fetch pending approvals')
  },

  /**
   * Process expired OTS
   */
  async processExpiredOTS(): Promise<number> {
    const response = await apiClient.post<ApiResponse<number>>(`${BASE_URL}/process-expired`)
    if (isSuccessResponse(response.data) && response.data.data !== null) {
      return response.data.data
    }
    throw new Error(response.data.message || 'Failed to process expired OTS')
  },

  // ============ Helper Methods ============

  /**
   * Get OTS status options for dropdowns
   */
  getOTSStatusOptions(): { value: OTSStatus; label: string }[] {
    return [
      { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
      { value: 'APPROVED', label: 'Approved' },
      { value: 'REJECTED', label: 'Rejected' },
      { value: 'EXPIRED', label: 'Expired' },
    ]
  },

  /**
   * Get payment mode options for dropdowns
   */
  getPaymentModeOptions(): { value: string; label: string }[] {
    return [
      { value: 'CASH', label: 'Cash' },
      { value: 'CHEQUE', label: 'Cheque' },
      { value: 'UPI', label: 'UPI' },
      { value: 'CARD', label: 'Card' },
      { value: 'NEFT', label: 'NEFT' },
      { value: 'RTGS', label: 'RTGS' },
      { value: 'IMPS', label: 'IMPS' },
      { value: 'ONLINE', label: 'Online' },
    ]
  },
}

export default otsService
