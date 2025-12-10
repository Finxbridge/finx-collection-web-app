/**
 * Case Sourcing API Types and Interfaces
 * Matches backend Case Sourcing Service API
 */

// ===================
// Enumerations
// ===================

export type BatchStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PARTIAL'

export type SourceType = 'CSV_UPLOAD' | 'API' | 'BULK_IMPORT'

export type CaseStatus = 'UNALLOCATED' | 'ALLOCATED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'

export type ErrorType = 'VALIDATION_ERROR' | 'DUPLICATE_RECORD' | 'MISSING_FIELD' | 'TYPE_MISMATCH'

// ===================
// Dashboard & Statistics
// ===================

export interface DashboardSummary {
  totalReceived: number
  validated: number
  failed: number
  unallocated: number
}

export interface DataSourceStats {
  source: SourceType
  total: number
  successful: number
  failed: number
}

// ===================
// Batch Types
// ===================

export interface BatchUploadResponse {
  batchId: string
  totalCases: number
  status: BatchStatus
  validationJobId: string
}

export interface RecentUpload {
  batchId: string
  source: SourceType
  uploadedBy: string
  uploadedAt: string
  totalCases: number
  status: BatchStatus
}

export interface BatchInfo {
  batchId: string
  source: SourceType
  uploadedBy: string
  uploadedAt: string
  totalCases: number
  validCases: number
  invalidCases: number
  status: BatchStatus
}

export interface BatchListResponse {
  content: BatchInfo[]
  totalElements: number
  totalPages: number
}

export interface BatchError {
  externalCaseId: string
  errorType: ErrorType
  message: string
}

export interface BatchStatusResponse {
  batchId: string
  totalCases: number
  validCases: number
  invalidCases: number
  status: BatchStatus
  errors: BatchError[]
  completedAt: string
}

export interface BatchSummary {
  batchId: string
  validCases: number
  invalidCases: number
  duplicates: number
}

export interface BatchRowError {
  rowNumber: number
  externalCaseId: string
  errors: string[]
}

// ===================
// Header Validation
// ===================

export interface HeaderSuggestion {
  providedHeader: string
  suggestedHeader: string
  similarityScore: number
}

export interface HeaderValidationResult {
  isValid: boolean
  message: string
  missingHeaders: string[]
  unknownHeaders: string[]
  suggestions: HeaderSuggestion[]
  expectedHeaders: string[]
}

// ===================
// Customer Types
// ===================

export interface CustomerSummary {
  id: number
  name: string
  mobile: string
}

export interface CustomerDetail {
  id: number
  customerCode: string
  name: string
  mobile: string
  email: string
  city: string
  state: string
}

// ===================
// Loan Types
// ===================

export interface LoanDetailsSummary {
  loanAccountNumber: string
  totalOutstanding: number
  dpd: number
  bucket: string
}

export interface LoanDetailsDetail {
  loanAccountNumber: string
  productType: string
  totalOutstanding: number
  dpd: number
  bucket: string
}

// ===================
// Case Types
// ===================

export interface UnallocatedCaseSummary {
  id: number
  caseNumber: string
  externalCaseId: string
  customer: CustomerSummary
  loanDetails: LoanDetailsSummary
  status: CaseStatus
  createdAt: string
}

export interface UnallocatedCaseDetail {
  id: number
  caseNumber: string
  externalCaseId: string
  customer: CustomerDetail
  loanDetails: LoanDetailsDetail
  status: CaseStatus
  geographyCode: string
  createdAt: string
}

export interface UnallocatedCasesResponse {
  content: UnallocatedCaseSummary[]
  totalElements: number
  totalPages: number
}

// ===================
// Case Search
// ===================

export interface CaseSearchParams {
  caseNumber?: string
  loanAccountNumber?: string
  customerName?: string
  mobileNumber?: string
  caseStatus?: CaseStatus
  bucket?: string
  minDpd?: number
  maxDpd?: number
  geographyCode?: string
  allocatedToUserId?: number
  page?: number
  size?: number
}

export interface CaseSearchResult {
  caseId: number
  caseNumber: string
  externalCaseId: string
  caseStatus: CaseStatus
  casePriority: string
  caseOpenedAt: string
  customerCode: string
  customerName: string
  mobileNumber: string
  email: string
  city: string
  state: string
  pincode: string
  loanAccountNumber: string
  productType: string
  bankCode: string
  totalOutstanding: number
  dpd: number
  bucket: string
  allocatedToUserId: number | null
  allocatedToUserName: string | null
  allocatedAt: string | null
  totalActivities: number
  lastContactedAt: string | null
  lastDisposition: string | null
}

export interface CaseSearchResponse {
  content: CaseSearchResult[]
  totalElements: number
  totalPages: number
}

// ===================
// Case Timeline
// ===================

export interface TimelineEvent {
  eventId: number
  eventType: string
  eventSubType?: string
  eventTitle: string
  eventDescription: string
  eventTimestamp: string
  userId?: number
  userName?: string
  disposition?: string
  subDisposition?: string
  contactResult?: string
  callDurationSeconds?: number
  messageChannel?: string
  messageStatus?: string
  iconType: string
  colorCode: string
}

export interface TimelineSummary {
  totalEvents: number
  totalCalls: number
  totalMessages: number
  connectedCalls: number
  failedCalls: number
  lastContactedAt: string | null
  lastContactResult: string | null
  firstEventAt: string
  lastEventAt: string
  daysSinceLastActivity: number
}

export interface CaseTimeline {
  caseId: number
  caseNumber: string
  customerName: string
  loanAccountNumber: string
  events: TimelineEvent[]
  summary: TimelineSummary
}

// ===================
// Reports
// ===================

export interface DailyBreakdown {
  date: string
  totalReceived: number
  validated: number
  failed: number
  successRate: number
}

export interface SourceBreakdown {
  source: SourceType
  totalReceived: number
  validated: number
  failed: number
  successRate: number
}

export interface IntakeReport {
  startDate: string
  endDate: string
  totalReceived: number
  totalValidated: number
  totalFailed: number
  successRate: number
  dailyBreakdown: DailyBreakdown[]
  sourceBreakdown: SourceBreakdown[]
}

export interface BucketBreakdown {
  bucket: string
  count: number
}

export interface UnallocatedSourceBreakdown {
  source: SourceType
  count: number
}

export interface UnallocatedReport {
  startDate: string
  endDate: string
  totalUnallocated: number
  bucketBreakdown: BucketBreakdown[]
  sourceBreakdown: UnallocatedSourceBreakdown[]
}

// ===================
// Request Types
// ===================

export interface BatchesListParams {
  status?: BatchStatus
  page?: number
  size?: number
}

export interface ReportDateParams {
  startDate?: string
  endDate?: string
}
