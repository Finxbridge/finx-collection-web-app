/**
 * Workflow Service
 * API service for My Workflow module
 */

import { apiClient } from './axios.config'
import type { PageResponse } from '@types'
import type {
  WorkflowCaseListItem,
  CaseSummaryDTO,
  WorkflowLoanDetails,
  WorkflowCustomerDetails,
  WorkflowRepayment,
  WorkflowPTP,
  WorkflowNotice,
  WorkflowCallLog,
  WorkflowSmsHistory,
  WorkflowEmailHistory,
  WorkflowDocument,
  WorkflowCaseDetail,
  CaseTabsDataDTO,
} from '@types'

const BASE_URL = '/workflow'

// Workflow API Response interface (uses success/data pattern)
interface WorkflowApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp?: string
}

// Helper to check if response is successful
const isSuccess = <T>(response: WorkflowApiResponse<T>): boolean => {
  return response.success === true
}

// Helper to get payload from response
const getPayload = <T>(response: WorkflowApiResponse<T>): T => {
  return response.data
}

/**
 * Workflow Service - Case List and Case Details
 */
export const workflowService = {
  /**
   * Get cases for workflow
   * Shows all cases for admin, allocated cases for collectors
   */
  getCasesForWorkflow: async (
    page: number = 0,
    size: number = 20
  ): Promise<PageResponse<WorkflowCaseListItem>> => {
    const response = await apiClient.get<WorkflowApiResponse<PageResponse<WorkflowCaseListItem>>>(
      `${BASE_URL}/cases`,
      {
        params: { page, size },
      }
    );
    if (isSuccess(response.data)) {
      return getPayload(response.data);
    }
    throw new Error(response.data.message || 'Failed to fetch workflow cases');
  },

  /**
   * Get case summary
   */
  getCaseSummary: async (caseId: number): Promise<CaseSummaryDTO> => {
    const response = await apiClient.get<WorkflowApiResponse<CaseSummaryDTO>>(
      `${BASE_URL}/cases/${caseId}/summary`
    );
    if (isSuccess(response.data)) {
      return getPayload(response.data);
    }
    throw new Error(response.data.message || 'Failed to fetch case summary');
  },

  /**
   * Get all tabs data for a case (combined response)
   */
  getCaseDetails: async (caseId: number): Promise<WorkflowCaseDetail> => {
    const response = await apiClient.get<WorkflowApiResponse<CaseTabsDataDTO>>(
      `${BASE_URL}/cases/${caseId}/tabs`
    );
    if (isSuccess(response.data)) {
      return getPayload(response.data);
    }
    throw new Error(response.data.message || 'Failed to fetch case details');
  },

  /**
   * Get loan details tab data
   */
  getCaseLoanDetails: async (caseId: number): Promise<WorkflowLoanDetails> => {
    const response = await apiClient.get<WorkflowApiResponse<WorkflowLoanDetails>>(
      `${BASE_URL}/cases/${caseId}/loan-details`
    );
    if (isSuccess(response.data)) {
      return getPayload(response.data);
    }
    throw new Error(response.data.message || 'Failed to fetch loan details');
  },

  /**
   * Get customer details tab data
   */
  getCaseCustomerDetails: async (caseId: number): Promise<WorkflowCustomerDetails> => {
    const response = await apiClient.get<WorkflowApiResponse<WorkflowCustomerDetails>>(
      `${BASE_URL}/cases/${caseId}/customer-details`
    );
    if (isSuccess(response.data)) {
      return getPayload(response.data);
    }
    throw new Error(response.data.message || 'Failed to fetch customer details');
  },

  /**
   * Get repayment history for a case
   */
  getCaseRepayments: async (caseId: number): Promise<WorkflowRepayment[]> => {
    const response = await apiClient.get<WorkflowApiResponse<WorkflowRepayment[]>>(
      `${BASE_URL}/cases/${caseId}/repayments`
    );
    if (isSuccess(response.data)) {
      return getPayload(response.data);
    }
    throw new Error(response.data.message || 'Failed to fetch repayments');
  },

  /**
   * Get PTP history for a case
   */
  getCasePtps: async (caseId: number): Promise<WorkflowPTP[]> => {
    const response = await apiClient.get<WorkflowApiResponse<WorkflowPTP[]>>(
      `${BASE_URL}/cases/${caseId}/ptps`
    );
    if (isSuccess(response.data)) {
      return getPayload(response.data);
    }
    throw new Error(response.data.message || 'Failed to fetch PTP history');
  },

  /**
   * Get notices for a case
   */
  getCaseNotices: async (caseId: number): Promise<WorkflowNotice[]> => {
    const response = await apiClient.get<WorkflowApiResponse<WorkflowNotice[]>>(
      `${BASE_URL}/cases/${caseId}/notices`
    );
    if (isSuccess(response.data)) {
      return getPayload(response.data);
    }
    throw new Error(response.data.message || 'Failed to fetch notices');
  },

  /**
   * Get call logs for a case
   */
  getCaseCallLogs: async (caseId: number): Promise<WorkflowCallLog[]> => {
    const response = await apiClient.get<WorkflowApiResponse<WorkflowCallLog[]>>(
      `${BASE_URL}/cases/${caseId}/calls`
    );
    if (isSuccess(response.data)) {
      return getPayload(response.data);
    }
    throw new Error(response.data.message || 'Failed to fetch call logs');
  },

  /**
   * Get SMS history for a case
   */
  getCaseSmsHistory: async (caseId: number): Promise<WorkflowSmsHistory[]> => {
    const response = await apiClient.get<WorkflowApiResponse<WorkflowSmsHistory[]>>(
      `${BASE_URL}/cases/${caseId}/sms`
    );
    if (isSuccess(response.data)) {
      return getPayload(response.data);
    }
    throw new Error(response.data.message || 'Failed to fetch SMS history');
  },

  /**
   * Get email history for a case
   */
  getCaseEmailHistory: async (caseId: number): Promise<WorkflowEmailHistory[]> => {
    const response = await apiClient.get<WorkflowApiResponse<WorkflowEmailHistory[]>>(
      `${BASE_URL}/cases/${caseId}/emails`
    );
    if (isSuccess(response.data)) {
      return getPayload(response.data);
    }
    throw new Error(response.data.message || 'Failed to fetch email history');
  },

  /**
   * Get documents for a case
   */
  getCaseDocuments: async (caseId: number): Promise<WorkflowDocument[]> => {
    const response = await apiClient.get<WorkflowApiResponse<WorkflowDocument[]>>(
      `${BASE_URL}/cases/${caseId}/documents`
    );
    if (isSuccess(response.data)) {
      return getPayload(response.data);
    }
    throw new Error(response.data.message || 'Failed to fetch documents');
  },
};

export default workflowService;
