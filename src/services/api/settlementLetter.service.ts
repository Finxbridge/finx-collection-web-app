/**
 * Settlement Letter Service
 * API endpoints for settlement letter management
 */

import { apiClient } from './axios.config'
import type { SettlementLetterDTO, SendVia } from '@types'

const BASE_URL = '/collections/settlement-letters'

// Paginated Response
interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

// API Response interface
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

export const settlementLetterService = {
  /**
   * Generate a settlement letter for an approved OTS
   */
  async generateLetter(otsId: number, templateId: number): Promise<SettlementLetterDTO> {
    const response = await apiClient.post<ApiResponse<SettlementLetterDTO>>(
      `${BASE_URL}/generate`,
      null,
      { params: { otsId, templateId } }
    )
    if (isSuccessResponse(response.data) && response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.message || 'Failed to generate settlement letter')
  },

  /**
   * Get settlement letter by OTS ID
   */
  async getLetterByOtsId(otsId: number): Promise<SettlementLetterDTO> {
    const response = await apiClient.get<ApiResponse<SettlementLetterDTO>>(
      `${BASE_URL}/ots/${otsId}`
    )
    if (isSuccessResponse(response.data) && response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.message || 'Failed to fetch settlement letter')
  },

  /**
   * Get settlement letters by Case ID
   */
  async getLettersByCaseId(caseId: number): Promise<SettlementLetterDTO[]> {
    const response = await apiClient.get<ApiResponse<SettlementLetterDTO[]>>(
      `${BASE_URL}/case/${caseId}`
    )
    if (isSuccessResponse(response.data) && response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.message || 'Failed to fetch settlement letters')
  },

  /**
   * Get all settlement letters with pagination
   */
  async getAllLetters(page = 0, size = 20): Promise<PageResponse<SettlementLetterDTO>> {
    const response = await apiClient.get<ApiResponse<PageResponse<SettlementLetterDTO>>>(
      BASE_URL,
      { params: { page, size } }
    )
    if (isSuccessResponse(response.data) && response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.message || 'Failed to fetch settlement letters')
  },

  /**
   * Mark letter as downloaded
   */
  async downloadLetter(letterId: number): Promise<SettlementLetterDTO> {
    const response = await apiClient.post<ApiResponse<SettlementLetterDTO>>(
      `${BASE_URL}/${letterId}/download`
    )
    if (isSuccessResponse(response.data) && response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.message || 'Failed to download letter')
  },

  /**
   * Download letter as PDF - returns blob
   */
  async downloadLetterPdf(letterId: number): Promise<Blob> {
    const response = await apiClient.get(`${BASE_URL}/${letterId}/pdf`, {
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * Send settlement letter via specified channel
   */
  async sendLetter(letterId: number, sendVia: SendVia): Promise<SettlementLetterDTO> {
    const response = await apiClient.post<ApiResponse<SettlementLetterDTO>>(
      `${BASE_URL}/${letterId}/send`,
      null,
      { params: { sendVia } }
    )
    if (isSuccessResponse(response.data) && response.data.data) {
      return response.data.data
    }
    throw new Error(response.data.message || 'Failed to send letter')
  },

  /**
   * Get send via options for dropdowns
   */
  getSendViaOptions(): { value: SendVia; label: string }[] {
    return [
      { value: 'EMAIL', label: 'Email' },
      { value: 'SMS', label: 'SMS' },
      { value: 'WHATSAPP', label: 'WhatsApp' },
      { value: 'COURIER', label: 'Courier' },
    ]
  },
}

export default settlementLetterService
