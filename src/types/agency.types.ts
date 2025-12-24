/**
 * Agency Management Types
 * Type definitions for agency management module
 */

// ============ Status Enums ============
export type AgencyStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'SUSPENDED'
  | 'TERMINATED'

export type AgencyType = 'INTERNAL' | 'EXTERNAL' | 'LEGAL' | 'FIELD'

export type AllocationStatus = 'ALLOCATED' | 'ASSIGNED' | 'DEALLOCATED'

export type AssignmentStatus = 'UNALLOCATED' | 'ALLOCATED_TO_AGENCY' | 'ASSIGNED_TO_AGENT'

// ============ KYC Document ============
export interface KycDocument {
  documentType: string
  documentName: string
  documentUrl: string
}

// ============ Agency ============
export interface Agency {
  id: number
  agencyCode: string
  agencyName: string
  agencyType: AgencyType
  status: AgencyStatus
  contactPerson: string
  contactEmail: string
  contactPhone: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  panNumber?: string
  gstNumber?: string
  bankAccountNumber?: string
  bankName?: string
  ifscCode?: string
  contractStartDate?: string
  contractEndDate?: string
  commissionRate?: number
  maxCaseLimit?: number
  currentCaseCount?: number
  approvedBy?: number
  approvalDate?: string
  rejectionReason?: string
  notes?: string
  kycDocuments?: KycDocument[]
  serviceAreas?: string[]
  servicePincodes?: string[]
  createdAt: string
  updatedAt: string
  createdBy?: number
  updatedBy?: number
}

// ============ Create/Update Agency Request ============
export interface CreateAgencyRequest {
  agencyName: string
  agencyType: AgencyType
  contactPerson: string
  contactEmail: string
  contactPhone: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  panNumber?: string
  gstNumber?: string
  bankAccountNumber?: string
  bankName?: string
  ifscCode?: string
  contractStartDate?: string
  contractEndDate?: string
  commissionRate?: number
  maxCaseLimit?: number
  notes?: string
  kycDocuments?: string // JSON string
  serviceAreas?: string // JSON string
  servicePincodes?: string // JSON string
}

// ============ Agency Approval Request ============
export interface AgencyApprovalRequest {
  agencyId: number
  approved: boolean
  notes?: string
  reason?: string
}

// ============ Agent ============
export interface Agent {
  id: number
  username: string
  firstName: string
  lastName: string
  email: string
  mobileNumber?: string
  state?: string
  city?: string
  maxCaseCapacity?: number
  currentCaseCount?: number
  status: string
}

// ============ Case Assignment Info ============
export interface CaseAssignmentInfo {
  agencyId: number
  agencyName: string
  agencyCode: string
  agentId?: number
  agentName?: string
  assignedAt: string
}

// ============ Case Allocation ============
export interface AgencyCaseAllocation {
  id: number
  agencyId: number
  agencyName?: string
  agencyCode?: string
  caseId: number
  externalCaseId?: string
  agentId?: number
  agentName?: string
  allocationStatus: AllocationStatus
  assignmentStatus: AssignmentStatus
  batchId?: string
  notes?: string
  allocatedAt: string
  allocatedBy?: number
  deallocatedAt?: string
  deallocatedBy?: number
  deallocatedReason?: string
  assignments?: CaseAssignmentInfo[]
  assignmentCount?: number
}

// ============ Case Allocation Request ============
export interface AgencyCaseAllocationRequest {
  agencyId: number
  caseIds: number[]
  agencyUserId?: number
  notes?: string
}

// ============ Agent Case Assignment Request ============
export interface AgentCaseAssignmentRequest {
  agentId: number
  caseIds: number[]
  notes?: string
}

// ============ Deallocate Request ============
export interface DeallocateCasesRequest {
  caseIds: number[]
  reason?: string
}

// ============ Agency Dashboard ============
export interface AgencyDashboard {
  agencyId: number
  agencyName: string
  totalCases: number
  activeCases: number
  resolvedCases: number
  totalCollected: number
  commissionEarned: number
  avgResolutionDays: number
  ptpKeptRate: number
  ptpBrokenRate: number
}

// ============ Status Labels ============
export const AgencyStatusLabels: Record<AgencyStatus, string> = {
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended',
  TERMINATED: 'Terminated',
}

export const AgencyStatusColors: Record<AgencyStatus, string> = {
  PENDING_APPROVAL: 'warning',
  APPROVED: 'info',
  REJECTED: 'danger',
  ACTIVE: 'success',
  INACTIVE: 'default',
  SUSPENDED: 'orange',
  TERMINATED: 'danger',
}

export const AgencyTypeLabels: Record<AgencyType, string> = {
  INTERNAL: 'Internal',
  EXTERNAL: 'External',
  LEGAL: 'Legal',
  FIELD: 'Field',
}

export const AllocationStatusLabels: Record<AllocationStatus, string> = {
  ALLOCATED: 'Allocated',
  ASSIGNED: 'Assigned',
  DEALLOCATED: 'Deallocated',
}

export const AssignmentStatusLabels: Record<AssignmentStatus, string> = {
  UNALLOCATED: 'Unallocated',
  ALLOCATED_TO_AGENCY: 'Allocated to Agency',
  ASSIGNED_TO_AGENT: 'Assigned to Agent',
}

export const AssignmentStatusColors: Record<AssignmentStatus, string> = {
  UNALLOCATED: 'default',
  ALLOCATED_TO_AGENCY: 'warning',
  ASSIGNED_TO_AGENT: 'success',
}
