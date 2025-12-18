/**
 * Repayment & Digital Payment Types
 * Type definitions for repayment management and digital payments
 */

// ============ Status Enums ============
export type RepaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVERSED'

export type PaymentMode =
  | 'CASH'
  | 'CHEQUE'
  | 'NEFT'
  | 'RTGS'
  | 'UPI'
  | 'CARD'
  | 'DD'
  | 'DIGITAL'
  | 'OTHER'

export type PaymentServiceType = 'DYNAMIC_QR' | 'PAYMENT_LINK' | 'COLLECT_CALL'

export type DigitalPaymentStatus =
  | 'INITIATED'
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUNDED'

export type InstrumentType = 'VPA' | 'MOBILE'

// ============ Core Repayment Types ============
export interface Repayment {
  id: number
  repaymentNumber?: string
  caseId: number
  caseNumber?: string
  loanAccountNumber?: string
  customerName: string
  paymentAmount?: number
  amount: number
  paymentDate: string
  paymentMode: PaymentMode | string
  approvalStatus?: RepaymentStatus
  status: RepaymentStatus
  currentApprovalLevel?: number
  approvedBy?: number
  approverName?: string
  approvedAt?: string
  rejectionReason?: string
  correctionNotes?: string
  depositSlaStatus?: string
  depositSlaBreachHours?: number
  isReconciled?: boolean
  collectedBy?: number
  collectorName?: string
  collectionLocation?: string
  notes?: string
  isOtsPayment?: boolean
  transactionReference?: string
  receiptId?: number
  capturedBy?: number
  capturedAt?: string
  createdAt: string
  updatedAt?: string
}

// ============ Request Types ============
export interface CreateRepaymentRequest {
  caseId: number
  paymentAmount: number
  paymentMode: string
  paymentDate: string
  collectedBy?: number
  collectionLocation?: string
  notes?: string
  otsId?: number
}

export interface PartialPaymentRequest {
  caseId: number
  partialAmount: number
  paymentDate: string
  paymentMode?: string
  transactionId?: string
  notes?: string
  previousOutstanding?: number
  newOutstanding?: number
}

export interface ReconciliationUpdateRequest {
  repaymentId: number
  isReconciled: boolean
  bankReferenceNumber?: string
  discrepancyAmount?: number
  discrepancyNotes?: string
}

export interface BulkReconciliationRequest {
  repaymentIds: number[]
  isReconciled: boolean
  bankReferenceNumber?: string
}

export interface RepaymentSearchParams {
  searchTerm?: string
  status?: RepaymentStatus
  fromDate?: string
  toDate?: string
  page?: number
  size?: number
}

// ============ Digital Payment Request Types ============
export interface PaymentInitRequest {
  serviceType: PaymentServiceType
  amount: number
  mobileNumber?: string
  instrumentType?: InstrumentType
  instrumentReference?: string
  message?: string
  caseId?: number
  loanAccountNumber?: string
  customerName?: string
  customerEmail?: string
}

export interface PaymentStatusRequest {
  serviceType: PaymentServiceType
  transactionId: string
}

export interface PaymentCancelRequest {
  serviceType: PaymentServiceType
  transactionId: string
  reason?: string
}

export interface PaymentRefundRequest {
  serviceType: PaymentServiceType
  transactionId: string
  amount?: number
  reason?: string
}

// ============ Response Types ============
export interface ReconciliationDTO {
  repaymentId: number
  repaymentNumber: string
  caseId: number
  customerName: string
  amount: number
  paymentDate: string
  paymentMode: string
  isReconciled: boolean
  reconciledBy?: number
  reconciledAt?: string
  bankReferenceNumber?: string
  discrepancyAmount?: number
  discrepancyNotes?: string
}

export interface PaymentResponse {
  serviceType: PaymentServiceType
  transactionId: string
  merchantOrderId?: string
  providerReferenceId?: string
  amount: number
  status: DigitalPaymentStatus | string
  message?: string
  paymentLink?: string
  qrCodeBase64?: string
  qrCodeUrl?: string
  refundAmount?: number
  caseId?: number
  loanAccountNumber?: string
  createdAt?: string
  paidAt?: string
  refundedAt?: string
  expiresAt?: string
  gatewayResponse?: Record<string, unknown>
}

// ============ Dashboard Types ============
export interface RepaymentDashboard {
  todayTotalCount: number
  todayTotalAmount: number
  todayPendingCount: number
  todayApprovedCount: number
  todayRejectedCount: number
  monthTotalCount: number
  monthTotalAmount: number
  monthTargetAmount?: number
  monthAchievementPercentage?: number
  paymentModeCount?: Record<string, number>
  paymentModeAmount?: Record<string, number>
  pendingApprovalCount: number
  slaBreachedCount: number
  pendingReconciliationCount: number
  digitalPaymentInitiatedCount?: number
  digitalPaymentSuccessCount?: number
  digitalPaymentFailedCount?: number
  digitalPaymentTotalAmount?: number
}

export interface SlaDashboard {
  totalPending: number
  withinSla: number
  breached: number
  criticalBreaches: number
  slaCompliancePercentage: number
  averageProcessingTime?: number
  breachesByCategory?: Record<string, number>
}

// ============ Paginated Response ============
export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

// ============ Label Mappings ============
export const REPAYMENT_STATUS_LABELS: Record<RepaymentStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  REVERSED: 'Reversed',
}

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  CASH: 'Cash',
  CHEQUE: 'Cheque',
  NEFT: 'NEFT',
  RTGS: 'RTGS',
  UPI: 'UPI',
  CARD: 'Card',
  DD: 'Demand Draft',
  DIGITAL: 'Digital Payment',
  OTHER: 'Other',
}

export const PAYMENT_SERVICE_TYPE_LABELS: Record<PaymentServiceType, string> = {
  DYNAMIC_QR: 'Dynamic QR',
  PAYMENT_LINK: 'Payment Link',
  COLLECT_CALL: 'Collect Request',
}

export const DIGITAL_PAYMENT_STATUS_LABELS: Record<DigitalPaymentStatus, string> = {
  INITIATED: 'Initiated',
  PENDING: 'Pending',
  SUCCESS: 'Success',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
  REFUNDED: 'Refunded',
}

export const DIGITAL_PAYMENT_STATUS_COLORS: Record<DigitalPaymentStatus, string> = {
  INITIATED: 'blue',
  PENDING: 'orange',
  SUCCESS: 'green',
  FAILED: 'red',
  CANCELLED: 'gray',
  EXPIRED: 'gray',
  REFUNDED: 'purple',
}
