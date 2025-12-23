/**
 * My Workflow Types
 * Type definitions for workflow module
 */

// Case list item for workflow
export interface WorkflowCaseListItem {
  caseId: number;
  caseNumber: string;
  loanAccountNumber: string;
  customerName: string;
  mobileNumber?: string;
  lender: string;
  dpd: number;
  bucket?: string;
  region?: string;
  city?: string;
  state?: string;
  totalOutstanding: number;
  overdueAmount: number;
  caseStatus: string;
  allocatedToUserId?: number;
  allocatedAgent?: string;
  lastEventDate?: string;
  createdAt?: string;
}

// Case summary
export interface CaseSummaryDTO {
  caseId: number;
  caseNumber: string;
  customerName: string;
  loanAccountNumber: string;
  lender: string;
  dpd: number;
  totalOutstanding: number;
  overdueAmount: number;
  caseStatus: string;
  allocatedAgent?: string;
  lastEventDate?: string;
}

// Loan details
export interface WorkflowLoanDetails {
  // Account identification
  loanAccountNumber?: string;
  lender?: string;
  coLender?: string;
  productType?: string;
  schemeCode?: string;

  // Amounts
  loanAmount?: number;
  totalOutstanding?: number;
  pos?: number;
  tos?: number;
  emiAmount?: number;
  penaltyAmount?: number;
  charges?: number;
  odInterest?: number;

  // Overdue breakdown
  principalOverdue?: number;
  interestOverdue?: number;
  feesOverdue?: number;
  penaltyOverdue?: number;

  // EMI details
  emiStartDate?: string;
  noOfPaidEmi?: number;
  noOfPendingEmi?: number;
  emiOverdueFrom?: string;
  nextEmiDate?: string;

  // DPD & Bucket
  dpd?: number;
  bucket?: string;
  riskBucket?: string;
  somBucket?: string;
  somDpd?: number;
  cycleDue?: string;

  // Rates & Duration
  roi?: number;
  loanDuration?: string;

  // Dates
  loanDisbursementDate?: string;
  loanMaturityDate?: string;
  dueDate?: string;

  // Payment info
  lastPaymentDate?: string;
  lastPaymentMode?: string;
  lastPaidAmount?: number;

  // Bank details
  beneficiaryAccountNumber?: string;
  beneficiaryAccountName?: string;
  repaymentBankName?: string;
  repaymentIfscCode?: string;
}

// Customer details
export interface WorkflowCustomerDetails {
  // Basic info
  customerId?: string;
  customerCode?: string;
  fullName?: string;

  // Contact numbers
  mobileNumber?: string;
  secondaryMobileNumber?: string;
  resiPhone?: string;
  additionalPhone2?: string;
  email?: string;

  // Address
  primaryAddress?: string;
  secondaryAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;

  // Family & Employment
  fatherSpouseName?: string;
  employerOrBusinessEntity?: string;

  // References
  reference1Name?: string;
  reference1Number?: string;
  reference2Name?: string;
  reference2Number?: string;

  // Preferences
  languagePreference?: string;
}

// Repayment history
export interface WorkflowRepayment {
  id: number;
  repaymentNumber: string;
  caseId: number;
  amount: number;
  paymentMode: string;
  paymentDate: string;
  status: string;
  referenceNumber?: string;
  receiptNumber?: string;
  remarks?: string;
  createdAt: string;
}

// PTP (Promise to Pay)
export interface WorkflowPTP {
  id: number;
  ptpDate?: string;
  ptpAmount?: number;
  commitmentDate?: string;
  ptpStatus?: string;
  paymentReceivedAmount?: number;
  paymentReceivedDate?: string;
  brokenReason?: string;
  notes?: string;
  createdAt?: string;
}

// Notice
export interface WorkflowNotice {
  id: number;
  noticeNumber: string;
  caseId: number;
  noticeType: string;
  status: string;
  sentDate?: string;
  deliveredDate?: string;
  content?: string;
  createdAt: string;
}

// Call log
export interface WorkflowCallLog {
  id: number;
  caseId: number;
  callerId?: string;
  calledNumber?: string;
  callType?: string;
  callStatus?: string;
  duration?: number;
  startTime?: string;
  endTime?: string;
  notes?: string;
  createdAt: string;
}

// SMS history
export interface WorkflowSmsHistory {
  id: number;
  caseId: number;
  phoneNumber?: string;
  message?: string;
  status?: string;
  sentAt?: string;
  deliveredAt?: string;
  createdAt: string;
}

// Email history
export interface WorkflowEmailHistory {
  id: number;
  caseId: number;
  toEmail?: string;
  subject?: string;
  status?: string;
  sentAt?: string;
  deliveredAt?: string;
  createdAt: string;
}

// WhatsApp history
export interface WorkflowWhatsAppHistory {
  id: number;
  caseId: number;
  phoneNumber?: string;
  message?: string;
  messageType?: string;
  templateName?: string;
  status?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
}

// Document
export interface WorkflowDocument {
  id: number;
  caseId: number;
  documentName: string;
  documentType?: string;
  fileSize?: number;
  uploadedBy?: string;
  uploadedAt: string;
  downloadUrl?: string;
}

// Audit log
export interface AuditLog {
  id: number;
  entityType: string;
  entityId: number;
  action: string;
  performedBy: number;
  performedByName?: string;
  performedAt: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  userAgent?: string;
}

// Combined case tabs data
export interface CaseTabsDataDTO {
  caseId: number;
  loanDetails: WorkflowLoanDetails;
  customerDetails: WorkflowCustomerDetails;
  repayments: WorkflowRepayment[];
  ptps: WorkflowPTP[];
  notices: WorkflowNotice[];
  callLogs: WorkflowCallLog[];
  smsHistory: WorkflowSmsHistory[];
  whatsappHistory: WorkflowWhatsAppHistory[];
  emailHistory: WorkflowEmailHistory[];
  documents: WorkflowDocument[];
  auditTrail: AuditLog[];
}

// Combined case detail type
export interface WorkflowCaseDetail {
  caseId: number;
  loanDetails: WorkflowLoanDetails;
  customerDetails: WorkflowCustomerDetails;
  repayments: WorkflowRepayment[];
  ptps: WorkflowPTP[];
  notices: WorkflowNotice[];
  callLogs: WorkflowCallLog[];
  smsHistory: WorkflowSmsHistory[];
  whatsappHistory: WorkflowWhatsAppHistory[];
  emailHistory: WorkflowEmailHistory[];
  documents: WorkflowDocument[];
  auditTrail: AuditLog[];
}

// Tab types
export type WorkflowTabType =
  | 'loan-details'
  | 'customer-details'
  | 'repayments'
  | 'ptps'
  | 'notices'
  | 'calls'
  | 'sms'
  | 'whatsapp'
  | 'emails'
  | 'documents';

// Case status enum
export enum WorkflowCaseStatus {
  ALLOCATED = 'ALLOCATED',
  UNALLOCATED = 'UNALLOCATED',
  CLOSED = 'CLOSED',
  PTP = 'PTP',
  BROKEN_PTP = 'BROKEN_PTP',
}

// Status labels
export const WorkflowCaseStatusLabels: Record<string, string> = {
  ALLOCATED: 'Allocated',
  UNALLOCATED: 'Unallocated',
  CLOSED: 'Closed',
  PTP: 'Promise to Pay',
  BROKEN_PTP: 'Broken PTP',
};

// DPD badge colors
export const getDpdBadgeColor = (dpd: number): string => {
  if (dpd <= 30) return 'success';
  if (dpd <= 60) return 'warning';
  if (dpd <= 90) return 'orange';
  return 'danger';
};
