/**
 * Case Sourcing API service
 * Handles all case sourcing, batch uploads, and related API calls
 */

import { apiClient } from './axios.config'
import { API_ENDPOINTS } from '@config/constants'
import type {
  ApiResponse,
  DashboardSummary,
  DataSourceStats,
  BatchUploadResponse,
  RecentUpload,
  BatchListResponse,
  BatchStatusResponse,
  BatchSummary,
  BatchRowError,
  HeaderValidationResult,
  UnallocatedCasesResponse,
  UnallocatedCaseDetail,
  CaseSearchParams,
  CaseSearchResponse,
  CaseTimeline,
  IntakeReport,
  UnallocatedReport,
  BatchesListParams,
  ReportDateParams,
} from '@types'

/**
 * Helper to check if API response is successful
 */
const isSuccess = (status: string): boolean => {
  return status.toLowerCase() === 'success'
}

/**
 * Helper to get payload from API response (handles both 'payload' and 'data' fields)
 */
const getPayload = <T>(response: ApiResponse<T>): T | null => {
  return response.payload ?? response.data ?? null
}

export const caseSourcingService = {
  // ===================
  // Dashboard & Statistics
  // ===================

  /**
   * Get dashboard summary with case intake metrics
   */
  async getDashboardSummary(): Promise<DashboardSummary> {
    const response = await apiClient.get<ApiResponse<DashboardSummary>>(
      API_ENDPOINTS.CASE_SOURCING.DASHBOARD_SUMMARY
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to fetch dashboard summary')
  },

  /**
   * Get data source-wise intake statistics
   */
  async getStats(): Promise<DataSourceStats[]> {
    const response = await apiClient.get<ApiResponse<DataSourceStats[]>>(
      API_ENDPOINTS.CASE_SOURCING.STATS
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to fetch statistics')
  },

  // ===================
  // Upload Operations
  // ===================

  /**
   * Upload case data via CSV file
   */
  async uploadCases(file: File, uploadedBy?: string): Promise<BatchUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    if (uploadedBy) {
      formData.append('uploadedBy', uploadedBy)
    }

    const response = await apiClient.post<ApiResponse<BatchUploadResponse>>(
      API_ENDPOINTS.CASE_SOURCING.UPLOAD,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to upload cases')
  },

  /**
   * Re-upload corrected CSV for a failed batch
   */
  async reuploadBatch(batchId: string, file: File, uploadedBy?: string): Promise<BatchUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    if (uploadedBy) {
      formData.append('uploadedBy', uploadedBy)
    }

    const response = await apiClient.post<ApiResponse<BatchUploadResponse>>(
      API_ENDPOINTS.CASE_SOURCING.BATCH_REUPLOAD(batchId),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to re-upload batch')
  },

  /**
   * Validate CSV headers before upload
   */
  async validateHeaders(file: File): Promise<HeaderValidationResult> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<ApiResponse<HeaderValidationResult>>(
      API_ENDPOINTS.CASE_SOURCING.VALIDATE_HEADERS,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to validate headers')
  },

  /**
   * Download CSV template for case uploads
   */
  async downloadTemplate(includeSample: boolean = false): Promise<Blob> {
    const response = await apiClient.get(
      API_ENDPOINTS.CASE_SOURCING.UPLOAD_TEMPLATE,
      {
        params: { includeSample },
        responseType: 'blob',
      }
    )
    return response.data
  },

  // ===================
  // Batch Operations
  // ===================

  /**
   * Get recent batch uploads
   */
  async getRecentUploads(page: number = 0, size: number = 10): Promise<RecentUpload[]> {
    const response = await apiClient.get<ApiResponse<RecentUpload[]>>(
      API_ENDPOINTS.CASE_SOURCING.RECENT_UPLOADS,
      { params: { page, size } }
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to fetch recent uploads')
  },

  /**
   * Get all batches with optional status filter and pagination
   */
  async getBatches(params?: BatchesListParams): Promise<BatchListResponse> {
    const response = await apiClient.get<ApiResponse<BatchListResponse>>(
      API_ENDPOINTS.CASE_SOURCING.BATCHES,
      { params }
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to fetch batches')
  },

  /**
   * Get batch processing status
   */
  async getBatchStatus(batchId: string): Promise<BatchStatusResponse> {
    const response = await apiClient.get<ApiResponse<BatchStatusResponse>>(
      API_ENDPOINTS.CASE_SOURCING.BATCH_STATUS(batchId)
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to fetch batch status')
  },

  /**
   * Get batch summary with validation counts
   */
  async getBatchSummary(batchId: string): Promise<BatchSummary> {
    const response = await apiClient.get<ApiResponse<BatchSummary>>(
      API_ENDPOINTS.CASE_SOURCING.BATCH_SUMMARY(batchId)
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to fetch batch summary')
  },

  /**
   * Get batch errors
   */
  async getBatchErrors(batchId: string): Promise<BatchRowError[]> {
    const response = await apiClient.get<ApiResponse<BatchRowError[]>>(
      API_ENDPOINTS.CASE_SOURCING.BATCH_ERRORS(batchId)
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to fetch batch errors')
  },

  /**
   * Export batch errors to CSV
   */
  async exportBatchErrors(batchId: string): Promise<Blob> {
    const response = await apiClient.get(
      API_ENDPOINTS.CASE_SOURCING.BATCH_ERRORS_EXPORT(batchId),
      { responseType: 'blob' }
    )
    return response.data
  },

  /**
   * Export batch cases to CSV
   */
  async exportBatchCases(batchId: string): Promise<Blob> {
    const response = await apiClient.get(
      API_ENDPOINTS.CASE_SOURCING.BATCH_EXPORT(batchId),
      { responseType: 'blob' }
    )
    return response.data
  },

  // ===================
  // Unallocated Cases
  // ===================

  /**
   * Get paginated list of unallocated cases
   */
  async getUnallocatedCases(page: number = 0, size: number = 20): Promise<UnallocatedCasesResponse> {
    const response = await apiClient.get<ApiResponse<UnallocatedCasesResponse>>(
      API_ENDPOINTS.CASE_SOURCING.UNALLOCATED,
      { params: { page, size } }
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    // Handle case where API returns success but empty/null payload
    if (isSuccess(response.data.status)) {
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
      }
    }
    throw new Error(response.data.message || 'Failed to fetch unallocated cases')
  },

  /**
   * Get detailed view of a specific unallocated case
   */
  async getUnallocatedCaseDetail(caseId: number): Promise<UnallocatedCaseDetail> {
    const response = await apiClient.get<ApiResponse<UnallocatedCaseDetail>>(
      API_ENDPOINTS.CASE_SOURCING.UNALLOCATED_DETAIL(caseId)
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to fetch case detail')
  },

  // ===================
  // Case Search & Timeline
  // ===================

  /**
   * Advanced case search with multiple filters
   */
  async searchCases(params: CaseSearchParams): Promise<CaseSearchResponse> {
    const response = await apiClient.get<ApiResponse<CaseSearchResponse>>(
      API_ENDPOINTS.CASE_SOURCING.SEARCH,
      { params }
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to search cases')
  },

  /**
   * Get case activity timeline
   */
  async getCaseTimeline(caseId: number): Promise<CaseTimeline> {
    const response = await apiClient.get<ApiResponse<CaseTimeline>>(
      API_ENDPOINTS.CASE_SOURCING.CASE_TIMELINE(caseId)
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to fetch case timeline')
  },

  // ===================
  // Reports
  // ===================

  /**
   * Get intake report with date-wise metrics
   */
  async getIntakeReport(params?: ReportDateParams): Promise<IntakeReport> {
    const response = await apiClient.get<ApiResponse<IntakeReport>>(
      API_ENDPOINTS.CASE_SOURCING.REPORTS_INTAKE,
      { params }
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to fetch intake report')
  },

  /**
   * Get unallocated cases report
   */
  async getUnallocatedReport(params?: ReportDateParams): Promise<UnallocatedReport> {
    const response = await apiClient.get<ApiResponse<UnallocatedReport>>(
      API_ENDPOINTS.CASE_SOURCING.REPORTS_UNALLOCATED,
      { params }
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to fetch unallocated report')
  },
}

export default caseSourcingService
