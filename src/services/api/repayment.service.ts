/**
 * Repayment & Digital Payment Service
 * API endpoints for repayment management and digital payments
 */

import { apiClient } from './axios.config'
import type {
  Repayment,
  CreateRepaymentRequest,
  PartialPaymentRequest,
  ReconciliationDTO,
  ReconciliationUpdateRequest,
  BulkReconciliationRequest,
  RepaymentDashboard,
  SlaDashboard,
  RepaymentSearchParams,
  PageResponse,
  PaymentResponse,
  PaymentInitRequest,
  PaymentStatusRequest,
  PaymentCancelRequest,
  PaymentRefundRequest,
} from '@types'

const BASE_URL = '/collections/repayments'

// API Response interfaces - supports both patterns
interface ApiResponse<T> {
  // Old pattern (status/payload)
  status?: 'success' | 'failure'
  payload?: T
  error?: string | null
  // New pattern (success/data)
  success?: boolean
  data?: T
  // Common
  message: string
  timestamp?: string
  traceId?: string
}

// Helper functions - handles both response patterns
const isSuccessResponse = <T>(response: ApiResponse<T>): boolean => {
  // Check new pattern first (success boolean)
  if (typeof response.success === 'boolean') {
    return response.success === true
  }
  // Fallback to old pattern (status string)
  if (typeof response.status === 'string') {
    return response.status.toLowerCase() === 'success'
  }
  return false
}

const getPayloadFromResponse = <T>(response: ApiResponse<T>): T | null => {
  // Check new pattern first (data)
  if (response.data !== undefined) {
    return response.data
  }
  // Fallback to old pattern (payload)
  return response.payload ?? null
}

// Transform backend response to frontend format
const transformRepayment = (data: Repayment): Repayment => {
  return {
    ...data,
    amount: data.paymentAmount ?? data.amount,
    status: data.approvalStatus ?? data.status,
  }
}

export const repaymentService = {
  // ============ Repayment CRUD APIs ============

  /**
   * Create a new repayment
   */
  async create(request: CreateRepaymentRequest): Promise<Repayment> {
    const response = await apiClient.post<ApiResponse<Repayment>>(BASE_URL, request)
    const payload = getPayloadFromResponse(response.data)
    if (isSuccessResponse(response.data) && payload) {
      return transformRepayment(payload)
    }
    throw new Error(response.data.message || 'Failed to create repayment')
  },

  /**
   * Get repayment by ID
   */
  async getById(id: number): Promise<Repayment> {
    const response = await apiClient.get<ApiResponse<Repayment>>(`${BASE_URL}/${id}`)
    const payload = getPayloadFromResponse(response.data)
    if (isSuccessResponse(response.data) && payload) {
      return transformRepayment(payload)
    }
    throw new Error(response.data.message || 'Failed to fetch repayment')
  },

  /**
   * Get repayment by repayment number
   */
  async getByNumber(repaymentNumber: string): Promise<Repayment> {
    const response = await apiClient.get<ApiResponse<Repayment>>(
      `${BASE_URL}/number/${repaymentNumber}`
    )
    const payload = getPayloadFromResponse(response.data)
    if (isSuccessResponse(response.data) && payload) {
      return transformRepayment(payload)
    }
    throw new Error(response.data.message || 'Failed to fetch repayment')
  },

  /**
   * Get repayments by case ID
   */
  async getByCase(caseId: number): Promise<Repayment[]> {
    const response = await apiClient.get<ApiResponse<Repayment[]>>(`${BASE_URL}/case/${caseId}`)
    const payload = getPayloadFromResponse(response.data)
    if (isSuccessResponse(response.data) && payload) {
      return payload.map(transformRepayment)
    }
    throw new Error(response.data.message || 'Failed to fetch repayments')
  },

  /**
   * Get repayments by status with pagination
   */
  async getByStatus(
    status: string,
    page = 0,
    size = 20
  ): Promise<PageResponse<Repayment>> {
    const response = await apiClient.get<ApiResponse<PageResponse<Repayment>>>(
      `${BASE_URL}/status/${status}`,
      { params: { page, size } }
    )
    const payload = getPayloadFromResponse(response.data)
    if (isSuccessResponse(response.data) && payload) {
      return {
        ...payload,
        content: payload.content.map(transformRepayment),
      }
    }
    throw new Error(response.data.message || 'Failed to fetch repayments')
  },

  /**
   * Search repayments with filters
   */
  async search(params: RepaymentSearchParams): Promise<PageResponse<Repayment>> {
    const response = await apiClient.get<ApiResponse<PageResponse<Repayment>>>(
      `${BASE_URL}/search`,
      { params }
    )
    const payload = getPayloadFromResponse(response.data)
    if (isSuccessResponse(response.data) && payload) {
      return {
        ...payload,
        content: payload.content.map(transformRepayment),
      }
    }
    throw new Error(response.data.message || 'Failed to search repayments')
  },

  // ============ Approval APIs ============

  /**
   * Approve a repayment
   */
  async approve(id: number, comments?: string): Promise<Repayment> {
    const response = await apiClient.post<ApiResponse<Repayment>>(
      `${BASE_URL}/${id}/approve`,
      null,
      { params: { comments } }
    )
    const payload = getPayloadFromResponse(response.data)
    if (isSuccessResponse(response.data) && payload) {
      return transformRepayment(payload)
    }
    throw new Error(response.data.message || 'Failed to approve repayment')
  },

  /**
   * Reject a repayment
   */
  async reject(id: number, reason: string): Promise<Repayment> {
    const response = await apiClient.post<ApiResponse<Repayment>>(
      `${BASE_URL}/${id}/reject`,
      null,
      { params: { reason } }
    )
    const payload = getPayloadFromResponse(response.data)
    if (isSuccessResponse(response.data) && payload) {
      return transformRepayment(payload)
    }
    throw new Error(response.data.message || 'Failed to reject repayment')
  },

  /**
   * Get pending approvals with pagination
   */
  async getPendingApprovals(page = 0, size = 20): Promise<PageResponse<Repayment>> {
    const response = await apiClient.get<ApiResponse<PageResponse<Repayment>>>(
      `${BASE_URL}/pending-approvals`,
      { params: { page, size } }
    )
    const payload = getPayloadFromResponse(response.data)
    if (isSuccessResponse(response.data) && payload) {
      return {
        ...payload,
        content: payload.content.map(transformRepayment),
      }
    }
    throw new Error(response.data.message || 'Failed to fetch pending approvals')
  },

  // ============ Dashboard APIs ============

  /**
   * Get repayment dashboard data
   */
  async getDashboard(): Promise<RepaymentDashboard> {
    const response = await apiClient.get<ApiResponse<RepaymentDashboard>>(
      `${BASE_URL}/dashboard`
    )
    const payload = getPayloadFromResponse(response.data)
    if (isSuccessResponse(response.data) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to fetch dashboard')
  },

  /**
   * Get SLA dashboard data
   */
  async getSlaDashboard(): Promise<SlaDashboard> {
    const response = await apiClient.get<ApiResponse<SlaDashboard>>(
      `${BASE_URL}/sla-dashboard`
    )
    const payload = getPayloadFromResponse(response.data)
    if (isSuccessResponse(response.data) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to fetch SLA dashboard')
  },

  /**
   * Get SLA breached repayments
   */
  async getSlaBreached(): Promise<Repayment[]> {
    const response = await apiClient.get<ApiResponse<Repayment[]>>(`${BASE_URL}/sla-breached`)
    const payload = getPayloadFromResponse(response.data)
    if (isSuccessResponse(response.data) && payload) {
      return payload.map(transformRepayment)
    }
    throw new Error(response.data.message || 'Failed to fetch SLA breached repayments')
  },

  // ============ Reconciliation APIs ============

  /**
   * Get pending reconciliation items with pagination
   */
  async getPendingReconciliation(page = 0, size = 20): Promise<PageResponse<ReconciliationDTO>> {
    const response = await apiClient.get<ApiResponse<PageResponse<ReconciliationDTO>>>(
      `${BASE_URL}/reconciliation/pending`,
      { params: { page, size } }
    )
    const payload = getPayloadFromResponse(response.data)
    if (isSuccessResponse(response.data) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to fetch pending reconciliation')
  },

  /**
   * Update reconciliation status
   */
  async updateReconciliation(request: ReconciliationUpdateRequest): Promise<ReconciliationDTO> {
    const response = await apiClient.post<ApiResponse<ReconciliationDTO>>(
      `${BASE_URL}/reconciliation/update`,
      request
    )
    const payload = getPayloadFromResponse(response.data)
    if (isSuccessResponse(response.data) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to update reconciliation')
  },

  /**
   * Bulk reconcile multiple repayments
   */
  async bulkReconcile(request: BulkReconciliationRequest): Promise<ReconciliationDTO[]> {
    const response = await apiClient.post<ApiResponse<ReconciliationDTO[]>>(
      `${BASE_URL}/reconciliation/bulk`,
      request
    )
    const payload = getPayloadFromResponse(response.data)
    if (isSuccessResponse(response.data) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to bulk reconcile')
  },

  // ============ Partial Payment API ============

  /**
   * Record a partial payment
   */
  async recordPartialPayment(request: PartialPaymentRequest): Promise<Repayment> {
    const response = await apiClient.post<ApiResponse<Repayment>>(
      `${BASE_URL}/partial-payment`,
      request
    )
    const payload = getPayloadFromResponse(response.data)
    if (isSuccessResponse(response.data) && payload) {
      return transformRepayment(payload)
    }
    throw new Error(response.data.message || 'Failed to record partial payment')
  },

  // ============ Receipt APIs ============

  /**
   * Download repayment receipt as PDF
   */
  async downloadReceipt(repaymentId: number): Promise<Blob> {
    const response = await apiClient.get(`${BASE_URL}/${repaymentId}/receipt`, {
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * Get receipt details
   */
  async getReceiptDetails(repaymentId: number): Promise<Repayment> {
    const response = await apiClient.get<ApiResponse<Repayment>>(
      `${BASE_URL}/${repaymentId}/receipt/details`
    )
    const payload = getPayloadFromResponse(response.data)
    if (isSuccessResponse(response.data) && payload) {
      return transformRepayment(payload)
    }
    throw new Error(response.data.message || 'Failed to fetch receipt details')
  },
}

export const digitalPaymentService = {
  // ============ Digital Payment APIs ============

  /**
   * Initiate a digital payment
   */
  async initiate(request: PaymentInitRequest): Promise<PaymentResponse> {
    const response = await apiClient.post<ApiResponse<PaymentResponse>>(
      `${BASE_URL}/payments/initiate`,
      request
    )
    const payload = getPayloadFromResponse(response.data)
    if (isSuccessResponse(response.data) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to initiate payment')
  },

  /**
   * Check payment status
   */
  async checkStatus(request: PaymentStatusRequest): Promise<PaymentResponse> {
    const response = await apiClient.post<ApiResponse<PaymentResponse>>(
      `${BASE_URL}/payments/status`,
      request
    )
    const payload = getPayloadFromResponse(response.data)
    if (isSuccessResponse(response.data) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to check payment status')
  },

  /**
   * Cancel a payment
   */
  async cancel(request: PaymentCancelRequest): Promise<PaymentResponse> {
    const response = await apiClient.post<ApiResponse<PaymentResponse>>(
      `${BASE_URL}/payments/cancel`,
      request
    )
    const payload = getPayloadFromResponse(response.data)
    if (isSuccessResponse(response.data) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to cancel payment')
  },

  /**
   * Refund a payment
   */
  async refund(request: PaymentRefundRequest): Promise<PaymentResponse> {
    const response = await apiClient.post<ApiResponse<PaymentResponse>>(
      `${BASE_URL}/payments/refund`,
      request
    )
    const payload = getPayloadFromResponse(response.data)
    if (isSuccessResponse(response.data) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to refund payment')
  },

  /**
   * Get payment transaction by ID
   */
  async getTransaction(transactionId: string): Promise<PaymentResponse> {
    const response = await apiClient.get<ApiResponse<PaymentResponse>>(
      `${BASE_URL}/payments/transaction/${transactionId}`
    )
    const payload = getPayloadFromResponse(response.data)
    if (isSuccessResponse(response.data) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to fetch transaction')
  },

  /**
   * Get payment transactions by case ID
   */
  async getTransactionsByCase(caseId: number): Promise<PaymentResponse[]> {
    const response = await apiClient.get<ApiResponse<PaymentResponse[]>>(
      `${BASE_URL}/payments/case/${caseId}`
    )
    const payload = getPayloadFromResponse(response.data)
    if (isSuccessResponse(response.data) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to fetch transactions')
  },

  /**
   * Generate receipt for a digital payment
   */
  async generateReceipt(transactionId: string): Promise<Repayment> {
    const response = await apiClient.post<ApiResponse<Repayment>>(
      `${BASE_URL}/payments/${transactionId}/generate-receipt`
    )
    const payload = getPayloadFromResponse(response.data)
    if (isSuccessResponse(response.data) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to generate receipt')
  },

  /**
   * Download receipt for a digital payment
   */
  async downloadReceipt(transactionId: string): Promise<Blob> {
    const response = await apiClient.get(
      `${BASE_URL}/payments/${transactionId}/receipt/download`,
      { responseType: 'blob' }
    )
    return response.data
  },
}

export default {
  repayment: repaymentService,
  digitalPayment: digitalPaymentService,
}
