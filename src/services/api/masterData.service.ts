/**
 * Master Data API service
 * Handles all master data management API calls
 */

import { apiClient } from './axios.config'
import { API_ENDPOINTS } from '@config/constants'
import type {
  ApiResponse,
  MasterData,
  MasterDataRequest,
  MasterDataCategory,
  MasterDataCategoriesResponse,
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
   * Get all categories/data types
   * GET /master-data/all
   */
  async getCategories(): Promise<MasterDataCategory[]> {
    const response = await apiClient.get<ApiResponse<MasterDataCategoriesResponse>>(
      API_ENDPOINTS.MASTER_DATA.CATEGORIES
    )
    const payload = getPayload(response.data)
    if (isSuccess(response.data.status) && payload) {
      return payload.categories
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
   * POST /master-data
   */
  async create(data: MasterDataRequest): Promise<MasterData> {
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
   */
  async update(id: number, data: MasterDataRequest): Promise<MasterData> {
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
   * Bulk upload master data (without type - type is in CSV)
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
   * Bulk upload master data with type parameter
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
   * Download CSV template for attributes (within a category)
   * GET /master-data/upload/template?includeSample=true
   */
  async downloadTemplate(includeSample = true): Promise<Blob> {
    const response = await apiClient.get(API_ENDPOINTS.MASTER_DATA.TEMPLATE, {
      params: { includeSample },
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * Download CSV template for bulk categories upload
   * GET /master-data/upload/template-v2?includeSample=true
   */
  async downloadCategoryTemplate(includeSample = true): Promise<Blob> {
    const response = await apiClient.get(API_ENDPOINTS.MASTER_DATA.TEMPLATE_V2, {
      params: { includeSample },
      responseType: 'blob',
    })
    return response.data
  },
}

export default masterDataService
