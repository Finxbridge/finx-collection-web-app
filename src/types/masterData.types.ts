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

// Request to create master data
// Note: API uses 'categoryType' for creating
export interface MasterDataCreateRequest {
  categoryType: string
  code: string
  value: string
  displayOrder?: number
  isActive?: boolean
}

// Request to update master data
// Note: API uses 'dataType' for updating
export interface MasterDataUpdateRequest {
  dataType: string
  code: string
  value: string
  displayOrder?: number
  isActive?: boolean
}

// Category item from /master-data/all API
export interface MasterDataCategory {
  categoryName: string
  count: number
  status: string
}

// Response from /master-data/all API
export interface MasterDataCategoriesResponse {
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
// Note: Uses 'dataType' to match API, UI labels show 'Category Type'
export interface MasterDataFormData {
  dataType: string
  code: string
  value: string
  displayOrder: number
  isActive: boolean
}
