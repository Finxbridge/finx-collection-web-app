/**
 * Template Management Types
 * Based on backend API specification
 */

// Channel types
export type TemplateChannelType = 'SMS' | 'WHATSAPP' | 'EMAIL' | 'IVR' | 'NOTICE';

// Variable categories
export type VariableCategory = 'CUSTOMER' | 'LOAN' | 'PAYMENT' | 'CASE' | 'OTHER' | 'COMPANY' | 'DYNAMIC' | 'AGENT';

// Variable data types
export type VariableDataType = 'STRING' | 'INTEGER' | 'DECIMAL' | 'DATE' | 'BOOLEAN';

// Template languages
export type TemplateLanguage = 'ENGLISH' | 'HINDI' | 'TAMIL' | 'TELUGU' | 'KANNADA' | 'MALAYALAM' | 'MARATHI' | 'GUJARATI' | 'BENGALI' | 'PUNJABI';

// Language mapping
export const LANGUAGE_CODES: Record<TemplateLanguage, string> = {
  ENGLISH: 'EN',
  HINDI: 'HI',
  TAMIL: 'TA',
  TELUGU: 'TE',
  KANNADA: 'KN',
  MALAYALAM: 'ML',
  MARATHI: 'MR',
  GUJARATI: 'GU',
  BENGALI: 'BN',
  PUNJABI: 'PA',
};

// Template Variable
export interface TemplateVariable {
  id: number;
  variableName: string;
  variableKey: string;
  dataType: VariableDataType;
  defaultValue: string | null;
  isRequired: boolean;
  description: string | null;
  displayOrder: number;
}

// Template Content Object
export interface TemplateContentObject {
  languageCode: string;
  subject: string | null;
  content: string;
}

// Template List Item (for table display)
export interface TemplateListItem {
  id: number;
  templateName: string;
  templateCode: string;
  channel: TemplateChannelType;
  language: string;
  isActive: boolean;
}

// Template Dropdown Item
export interface TemplateDropdownItem {
  id: number;
  templateName: string;
  templateCode: string;
  channel: TemplateChannelType;
  language: string;
  languageShortCode: string;
}

// Template Detail (full template info)
export interface TemplateDetail {
  id: number;
  templateName: string;
  templateCode: string;
  channel: TemplateChannelType;
  language: string;
  languageShortCode: string;
  provider: string | null;
  providerTemplateId: string | null;
  description: string | null;
  isActive: boolean;
  variables: TemplateVariable[];
  content: TemplateContentObject;
  dmsDocumentId: number | null;
  documentUrl: string | null;
  documentOriginalName: string | null;
  documentType: string | null;
  documentSizeBytes: number | null;
  hasDocumentVariables: boolean;
  documentPlaceholders: string[] | null;
  createdAt: string;
  updatedAt: string;
}

// Create Template Request
export interface CreateTemplateRequest {
  templateName: string;
  channel: TemplateChannelType;
  content: string;
  language: TemplateLanguage;
  documentId?: number | null;
}

// Update Template Request
export interface UpdateTemplateRequest {
  templateName: string;
  channel: TemplateChannelType;
  content: string;
  language: TemplateLanguage;
  documentId?: number | null;
}

// Resolve Template Request
export interface ResolveTemplateRequest {
  caseId: number;
  templateVariables: Record<string, string>;
}

// Resolved Template Response
export interface ResolvedTemplate {
  templateId: number;
  resolvedContent: string;
  documentUrl: string | null;
  channel: TemplateChannelType;
}

// Variable Definition
export interface VariableDefinition {
  id: number;
  variableKey: string;
  displayName?: string;
  entityPath?: string;
  dataType?: VariableDataType;
  description: string | null;
  exampleValue: string | null;
  category: VariableCategory;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Available Variable (simplified for dropdown)
export interface AvailableVariable {
  variableKey: string;
  exampleValue: string;
  isActive: boolean;
}

// Create Variable Request
export interface CreateVariableRequest {
  variableKey: string;
  description?: string | null;
  exampleValue?: string | null;
  category?: VariableCategory;
  isActive?: boolean;
}

// Update Variable Request
export interface UpdateVariableRequest {
  variableKey: string;
  description?: string | null;
  exampleValue?: string | null;
  category?: VariableCategory;
  isActive?: boolean;
}

// API Response Structure
export interface ApiResponse<T> {
  status: 'success' | 'failure';
  message: string;
  payload: T;
  error: string | null;
}
