/**
 * OTS (One-Time Settlement) Types
 * Type definitions for OTS management module
 */

// ============ Status Enums ============
export type OTSStatus =
  | 'INTENT_CAPTURED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'SETTLED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'DRAFT'
  | 'ACTIVE'
  | 'COMPLETED'

export type OTSPaymentMode = 'CASH' | 'CHEQUE' | 'UPI' | 'CARD' | 'NEFT' | 'RTGS' | 'IMPS' | 'ONLINE'

// ============ OTS Request/Response ============
export interface OTSRequest {
  id: number
  otsNumber: string
  caseId: number
  caseNumber?: string
  loanAccountNumber: string
  customerName: string
  originalOutstanding?: number
  proposedSettlement?: number
  discountPercentage?: number
  discountAmount?: number
  originalAmount?: number
  settlementAmount?: number
  waiverAmount?: number
  waiverPercentage?: number
  paymentMode?: string
  installmentCount?: number
  paymentDeadline?: string
  otsStatus?: OTSStatus
  status?: OTSStatus
  currentApprovalLevel?: number
  maxApprovalLevel?: number
  approvalLevel?: number
  borrowerConsent?: boolean
  intentCapturedAt?: string
  intentCapturedBy?: number
  intentCapturedByName?: string
  settledAt?: string
  settledAmount?: number
  validUntil?: string
  requestedBy?: number
  approvedBy?: number
  approvalDate?: string
  rejectionReason?: string
  cancellationReason?: string
  notes?: string
  createdAt: string
  updatedAt?: string
}

// ============ Create OTS Request ============
export interface CreateOTSRequest {
  caseId: number
  originalOutstanding: number
  proposedSettlement: number
  paymentMode?: OTSPaymentMode
  installmentCount?: number
  paymentDeadline?: string
  intentNotes?: string
  borrowerConsent?: boolean
}

// ============ OTS Case Search DTO ============
export interface OTSCaseSearchDTO {
  caseId: number
  caseNumber: string
  loanAccountNumber: string
  customerName: string
  customerMobile?: string
  productType?: string
  totalOutstanding: number
  principalOutstanding?: number
  interestOutstanding?: number
  penaltyOutstanding?: number
  dpd?: number
  bucket?: string
  assignedAgentName?: string
  caseStatus?: string
}

// ============ Label Mappings ============
export const OTS_STATUS_LABELS: Record<OTSStatus, string> = {
  INTENT_CAPTURED: 'Intent Captured',
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  SETTLED: 'Settled',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
}

export const OTS_STATUS_COLORS: Record<OTSStatus, string> = {
  INTENT_CAPTURED: 'info',
  PENDING_APPROVAL: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  SETTLED: 'success',
  EXPIRED: 'default',
  CANCELLED: 'default',
  DRAFT: 'default',
  ACTIVE: 'info',
  COMPLETED: 'success',
}

export const OTS_PAYMENT_MODE_LABELS: Record<OTSPaymentMode, string> = {
  CASH: 'Cash',
  CHEQUE: 'Cheque',
  UPI: 'UPI',
  CARD: 'Card',
  NEFT: 'NEFT',
  RTGS: 'RTGS',
  IMPS: 'IMPS',
  ONLINE: 'Online',
}

// ============ Settlement Letter Types ============
export type LetterStatus = 'DRAFT' | 'GENERATED' | 'SENT' | 'DOWNLOADED' | 'EXPIRED' | 'CANCELLED'

export type SendVia = 'EMAIL' | 'SMS' | 'WHATSAPP' | 'COURIER'

export interface SettlementLetterDTO {
  id: number
  letterNumber: string
  otsId: number
  otsNumber: string
  caseId: number
  caseNumber: string
  loanAccountNumber: string
  customerName: string
  templateId: number
  templateCode: string
  templateName: string
  letterStatus: LetterStatus
  documentUrl: string
  dmsDocumentId: string
  generatedAt: string
  generatedBy: number
  generatedByName: string
  sentAt?: string
  sentVia?: SendVia
  sentTo?: string
  downloadedAt?: string
  downloadedBy?: number
  downloadCount: number
  expiresAt: string
  createdAt: string
  updatedAt?: string
}

export const LETTER_STATUS_LABELS: Record<LetterStatus, string> = {
  DRAFT: 'Draft',
  GENERATED: 'Generated',
  SENT: 'Sent',
  DOWNLOADED: 'Downloaded',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
}

export const LETTER_STATUS_COLORS: Record<LetterStatus, string> = {
  DRAFT: 'default',
  GENERATED: 'info',
  SENT: 'success',
  DOWNLOADED: 'success',
  EXPIRED: 'warning',
  CANCELLED: 'danger',
}

export const SEND_VIA_LABELS: Record<SendVia, string> = {
  EMAIL: 'Email',
  SMS: 'SMS',
  WHATSAPP: 'WhatsApp',
  COURIER: 'Courier',
}
