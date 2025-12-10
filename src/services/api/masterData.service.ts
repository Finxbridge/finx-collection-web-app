/**
 * Master Data API service
 * Handles all master data management API calls
 */

import { apiClient } from './axios.config'
import { API_ENDPOINTS } from '@config/constants'
import type {
  ApiResponse,
  MasterData,
  MasterDataUpdateRequest,
  MasterDataCreateRequest,
  MasterDataAllResponse,
  BulkUploadResult,
} from '@types'

/**
 * Helper to check if API response is successful
 */
const isSuccess = (status: string): boolean => {
  return status.toLowerCase() === 'success'
}

/**
 * Helper to get payload from API response
 */
const getPayload = <T>(response: ApiResponse<T>): T | null => {
  return response.payload ?? response.data ?? null
}

export const masterDataService = {
  /**
   * Get all master data categories with counts and status
   * GET /master-data/all
   */
  async getAllCategories(): Promise<MasterDataAllResponse> {
    const response = await apiClient.get<ApiResponse<MasterDataAllResponse>>(
      API_ENDPOINTS.MASTER_DATA.GET_ALL
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to fetch categories')
  },

  /**
   * Get all categories/data types (legacy)
   * GET /master-data/categories
   */
  async getCategories(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>(
      API_ENDPOINTS.MASTER_DATA.CATEGORIES
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to fetch categories')
  },

  /**
   * Get master data by type
   * GET /master-data?type={type}
   */
  async getByType(type: string): Promise<MasterData[]> {
    const response = await apiClient.get<ApiResponse<MasterData[]>>(
      API_ENDPOINTS.MASTER_DATA.GET_BY_TYPE,
      { params: { type } }
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to fetch master data')
  },

  /**
   * Create master data
   * POST /master-data/create
   */
  async create(data: MasterDataCreateRequest): Promise<MasterData> {
    const response = await apiClient.post<ApiResponse<MasterData>>(
      API_ENDPOINTS.MASTER_DATA.CREATE,
      data
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to create master data')
  },

  /**
   * Update master data
   * PUT /master-data/{id}
   * Only sends value, displayOrder, and isActive fields
   */
  async update(id: number, data: MasterDataUpdateRequest): Promise<MasterData> {
    const response = await apiClient.put<ApiResponse<MasterData>>(
      API_ENDPOINTS.MASTER_DATA.UPDATE(id),
      data
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to update master data')
  },

  /**
   * Delete master data
   * DELETE /master-data/{id}
   */
  async delete(id: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.MASTER_DATA.DELETE(id)
    )
    if (!isSuccess(response.data.status)) {
      throw new Error(response.data.message || 'Failed to delete master data')
    }
  },

  /**
   * Delete all master data by type
   * DELETE /master-data/type/{type}
   */
  async deleteByType(type: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<null>>(
      API_ENDPOINTS.MASTER_DATA.DELETE_BY_TYPE(type)
    )
    if (!isSuccess(response.data.status)) {
      throw new Error(response.data.message || 'Failed to delete master data by type')
    }
  },

  /**
   * Bulk upload master data by type (type as query parameter)
   * POST /master-data/bulk-upload-by-type?type={type}
   */
  async bulkUploadByType(type: string, file: File): Promise<BulkUploadResult> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<ApiResponse<BulkUploadResult>>(
      API_ENDPOINTS.MASTER_DATA.BULK_UPLOAD_BY_TYPE,
      formData,
      {
        params: { type },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload
    }
    throw new Error(response.data.message || 'Failed to upload master data')
  },

  /**
   * Bulk upload master data (type included in CSV)
   * POST /master-data/bulk-upload
   */
  async bulkUpload(file: File): Promise<BulkUploadResult> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<ApiResponse<BulkUploadResult>>(
      API_ENDPOINTS.MASTER_DATA.BULK_UPLOAD,
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
    throw new Error(response.data.message || 'Failed to upload master data')
  },

  /**
   * Download CSV template (single type format)
   * GET /master-data/upload/template
   */
  async downloadTemplate(): Promise<Blob> {
    const response = await apiClient.get(API_ENDPOINTS.MASTER_DATA.TEMPLATE, {
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * Download CSV template V2 (multi-type format with type column)
   * GET /master-data/upload/template-v2
   */
  async downloadTemplateV2(): Promise<Blob> {
    const response = await apiClient.get(API_ENDPOINTS.MASTER_DATA.TEMPLATE_V2, {
      responseType: 'blob',
    })
    return response.data
  },
}

export default masterDataService
