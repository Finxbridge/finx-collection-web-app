/**
 * Template Management API Service
 * Handles all template and variable management API calls
 */

import { apiClient } from './axios.config';
import type {
  ApiResponse,
  TemplateListItem,
  TemplateDetail,
  TemplateDropdownItem,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  ResolveTemplateRequest,
  ResolvedTemplate,
  VariableDefinition,
  AvailableVariable,
  CreateVariableRequest,
  UpdateVariableRequest,
  TemplateChannelType,
  VariableCategory,
} from '../../types/template.types';

/**
 * Helper to check if API response is successful
 */
const isSuccess = (status: string): boolean => {
  return status.toLowerCase() === 'success';
};

/**
 * Helper to get payload from API response
 */
const getPayload = <T>(response: ApiResponse<T>): T | null => {
  return response.payload ?? null;
};

/**
 * Template Management Service
 */
export const templateService = {
  // ==================== Template APIs ====================

  /**
   * Get all templates
   */
  getAllTemplates: async (): Promise<TemplateListItem[]> => {
    const response = await apiClient.get<ApiResponse<TemplateListItem[]>>('/templates');
    const payload = getPayload(response.data);
    if (isSuccess(response.data.status) && payload) {
      return payload;
    }
    throw new Error(response.data.message || 'Failed to fetch templates');
  },

  /**
   * Get template by ID
   */
  getTemplateById: async (id: number): Promise<TemplateDetail> => {
    const response = await apiClient.get<ApiResponse<TemplateDetail>>(`/templates/${id}`);
    const payload = getPayload(response.data);
    if (isSuccess(response.data.status) && payload) {
      return payload;
    }
    throw new Error(response.data.message || `Failed to fetch template ${id}`);
  },

  /**
   * Get templates by channel
   */
  getTemplatesByChannel: async (channel: TemplateChannelType): Promise<TemplateListItem[]> => {
    const response = await apiClient.get<ApiResponse<TemplateListItem[]>>(`/templates/channel/${channel}`);
    const payload = getPayload(response.data);
    if (isSuccess(response.data.status) && payload) {
      return payload;
    }
    throw new Error(response.data.message || `Failed to fetch templates for channel ${channel}`);
  },

  /**
   * Get templates for dropdown by channel
   */
  getTemplatesDropdown: async (channel: TemplateChannelType): Promise<TemplateDropdownItem[]> => {
    const response = await apiClient.get<ApiResponse<TemplateDropdownItem[]>>(`/templates/dropdown/${channel}`);
    const payload = getPayload(response.data);
    if (isSuccess(response.data.status) && payload) {
      return payload;
    }
    throw new Error(response.data.message || `Failed to fetch dropdown templates for channel ${channel}`);
  },

  /**
   * Create template (JSON only)
   */
  createTemplate: async (templateData: CreateTemplateRequest): Promise<TemplateDetail> => {
    const response = await apiClient.post<ApiResponse<TemplateDetail>>('/templates', templateData);
    const payload = getPayload(response.data);
    if (isSuccess(response.data.status) && payload) {
      return payload;
    }
    throw new Error(response.data.message || 'Failed to create template');
  },

  /**
   * Create template with document (Multipart)
   */
  createTemplateWithDocument: async (
    templateData: CreateTemplateRequest,
    document: File
  ): Promise<TemplateDetail> => {
    const formData = new FormData();
    formData.append('template', new Blob([JSON.stringify(templateData)], { type: 'application/json' }));
    formData.append('document', document);

    const response = await apiClient.post<ApiResponse<TemplateDetail>>('/templates', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const payload = getPayload(response.data);
    if (isSuccess(response.data.status) && payload) {
      return payload;
    }
    throw new Error(response.data.message || 'Failed to create template with document');
  },

  /**
   * Update template (JSON only)
   */
  updateTemplate: async (id: number, templateData: UpdateTemplateRequest): Promise<TemplateDetail> => {
    const response = await apiClient.put<ApiResponse<TemplateDetail>>(`/templates/${id}`, templateData);
    const payload = getPayload(response.data);
    if (isSuccess(response.data.status) && payload) {
      return payload;
    }
    throw new Error(response.data.message || `Failed to update template ${id}`);
  },

  /**
   * Update template with document (Multipart)
   */
  updateTemplateWithDocument: async (
    id: number,
    templateData: UpdateTemplateRequest,
    document: File
  ): Promise<TemplateDetail> => {
    const formData = new FormData();
    formData.append('template', new Blob([JSON.stringify(templateData)], { type: 'application/json' }));
    formData.append('document', document);

    const response = await apiClient.put<ApiResponse<TemplateDetail>>(`/templates/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const payload = getPayload(response.data);
    if (isSuccess(response.data.status) && payload) {
      return payload;
    }
    throw new Error(response.data.message || `Failed to update template ${id} with document`);
  },

  /**
   * Delete template
   */
  deleteTemplate: async (id: number): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/templates/${id}`);
    if (!isSuccess(response.data.status)) {
      throw new Error(response.data.message || `Failed to delete template ${id}`);
    }
  },

  /**
   * Resolve template variables
   */
  resolveTemplate: async (id: number, resolveData: ResolveTemplateRequest): Promise<ResolvedTemplate> => {
    const response = await apiClient.post<ApiResponse<ResolvedTemplate>>(`/templates/${id}/resolve`, resolveData);
    const payload = getPayload(response.data);
    if (isSuccess(response.data.status) && payload) {
      return payload;
    }
    throw new Error(response.data.message || `Failed to resolve template ${id}`);
  },

  // ==================== Variable APIs ====================

  /**
   * Get available variables
   */
  getAvailableVariables: async (): Promise<AvailableVariable[]> => {
    const response = await apiClient.get<ApiResponse<AvailableVariable[]>>('/templates/variables/available');
    const payload = getPayload(response.data);
    if (isSuccess(response.data.status) && payload) {
      return payload;
    }
    throw new Error(response.data.message || 'Failed to fetch available variables');
  },

  /**
   * Get all variables
   */
  getAllVariables: async (activeOnly?: boolean, category?: VariableCategory): Promise<VariableDefinition[]> => {
    const params = new URLSearchParams();
    if (activeOnly !== undefined) params.append('activeOnly', String(activeOnly));
    if (category) params.append('category', category);

    const response = await apiClient.get<ApiResponse<VariableDefinition[]>>(
      `/templates/variables?${params.toString()}`
    );
    const payload = getPayload(response.data);
    if (isSuccess(response.data.status) && payload) {
      return payload;
    }
    throw new Error(response.data.message || 'Failed to fetch variables');
  },

  /**
   * Get variable by ID
   */
  getVariableById: async (id: number): Promise<VariableDefinition> => {
    const response = await apiClient.get<ApiResponse<VariableDefinition>>(`/templates/variables/${id}`);
    const payload = getPayload(response.data);
    if (isSuccess(response.data.status) && payload) {
      return payload;
    }
    throw new Error(response.data.message || `Failed to fetch variable ${id}`);
  },

  /**
   * Get variable by key
   */
  getVariableByKey: async (variableKey: string): Promise<VariableDefinition> => {
    const response = await apiClient.get<ApiResponse<VariableDefinition>>(`/templates/variables/key/${variableKey}`);
    const payload = getPayload(response.data);
    if (isSuccess(response.data.status) && payload) {
      return payload;
    }
    throw new Error(response.data.message || `Failed to fetch variable ${variableKey}`);
  },

  /**
   * Create variable
   */
  createVariable: async (variableData: CreateVariableRequest): Promise<VariableDefinition> => {
    const response = await apiClient.post<ApiResponse<VariableDefinition>>('/templates/variables', variableData);
    const payload = getPayload(response.data);
    if (isSuccess(response.data.status) && payload) {
      return payload;
    }
    throw new Error(response.data.message || 'Failed to create variable');
  },

  /**
   * Update variable
   */
  updateVariable: async (id: number, variableData: UpdateVariableRequest): Promise<VariableDefinition> => {
    const response = await apiClient.put<ApiResponse<VariableDefinition>>(`/templates/variables/${id}`, variableData);
    const payload = getPayload(response.data);
    if (isSuccess(response.data.status) && payload) {
      return payload;
    }
    throw new Error(response.data.message || `Failed to update variable ${id}`);
  },

  /**
   * Delete variable
   */
  deleteVariable: async (id: number): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/templates/variables/${id}`);
    if (!isSuccess(response.data.status)) {
      throw new Error(response.data.message || `Failed to delete variable ${id}`);
    }
  },

  /**
   * Toggle variable status
   */
  toggleVariableStatus: async (id: number, isActive: boolean): Promise<void> => {
    const response = await apiClient.patch<ApiResponse<void>>(
      `/templates/variables/${id}/status?isActive=${isActive}`
    );
    if (!isSuccess(response.data.status)) {
      throw new Error(response.data.message || `Failed to toggle variable ${id} status`);
    }
  },
};

export default templateService;
