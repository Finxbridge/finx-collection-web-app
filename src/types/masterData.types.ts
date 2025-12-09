/**
 * Master Data types and interfaces
 * Matches backend Master Data Service API format
 */

// Master Data item returned from API
export interface MasterData {
  id: number
  dataType: string
  code: string
  value: string
  parentCode: string | null
  displayOrder: number
  isActive: boolean
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

// Request to update master data (matches PUT /master-data/{id})
export interface MasterDataUpdateRequest {
  value: string
  displayOrder?: number
  isActive?: boolean
}

// Legacy request type (for backwards compatibility in forms)
export interface MasterDataRequest {
  dataType: string
  code: string
  value: string
  parentCode?: string | null
  displayOrder?: number
  isActive?: boolean
  metadata?: Record<string, unknown> | null
}

// Request to create master data (matches POST /master-data/create)
export interface MasterDataCreateRequest {
  categoryType: string
  code: string
  value: string
  displayOrder?: number
  isActive?: boolean
}

// Category summary from GET /master-data/all
export interface MasterDataCategory {
  categoryName: string
  count: number
  status: 'ACTIVE' | 'INACTIVE'
}

// Response from GET /master-data/all
export interface MasterDataAllResponse {
  categories: MasterDataCategory[]
}

// Bulk upload response
export interface BulkUploadResult {
  uploadId: string
  totalRecords: number
  successCount: number
  failureCount: number
  errors: BulkUploadError[]
  message: string
}

export interface BulkUploadError {
  row: number
  field: string
  message: string
}

// Common master data types (can be extended based on backend)
export type MasterDataType =
  | 'STATUS'
  | 'CATEGORY'
  | 'PRIORITY'
  | 'GEOGRAPHY'
  | 'PRODUCT_TYPE'
  | 'LOAN_TYPE'
  | 'DISPOSITION_CODE'
  | 'CALL_OUTCOME'
  | string

// Form data for creating/editing master data
export interface MasterDataFormData {
  dataType: string
  code: string
  value: string
  parentCode: string
  displayOrder: number
  isActive: boolean
  metadata: string // JSON string for form input
}
