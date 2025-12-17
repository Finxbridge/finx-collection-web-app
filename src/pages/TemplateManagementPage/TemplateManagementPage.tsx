import React, { useState, useEffect } from 'react';
import TemplateList from './components/TemplateList';
import TemplateForm from './components/TemplateForm';
import templateService from '../../services/api/template.service';
import type {
  TemplateListItem,
  TemplateDetail,
  AvailableVariable,
  CreateTemplateRequest,
} from '../../types/template.types';
import './TemplateManagementPage.css';

type ViewMode = 'list' | 'create' | 'edit' | 'view';

const TemplateManagementPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [availableVariables, setAvailableVariables] = useState<AvailableVariable[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates();
    fetchAvailableVariables();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await templateService.getAllTemplates();
      setTemplates(data);
      setError(null);
    } catch (err) {
      setError('Failed to load templates');
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableVariables = async () => {
    try {
      const data = await templateService.getAvailableVariables();
      setAvailableVariables(data);
    } catch (err) {
      console.error('Error fetching variables:', err);
    }
  };

  const handleCreate = () => {
    setSelectedTemplate(null);
    setViewMode('create');
  };

  const handleView = async (template: TemplateListItem) => {
    try {
      setLoading(true);
      const fullTemplate = await templateService.getTemplateById(template.id);
      setSelectedTemplate(fullTemplate);
      setViewMode('view');
    } catch (err) {
      setError('Failed to load template details');
      console.error('Error fetching template:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (template: TemplateListItem) => {
    try {
      setLoading(true);
      const fullTemplate = await templateService.getTemplateById(template.id);
      setSelectedTemplate(fullTemplate);
      setViewMode('edit');
    } catch (err) {
      setError('Failed to load template details');
      console.error('Error fetching template:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await templateService.deleteTemplate(id);
      await fetchTemplates();
      setError(null);
    } catch (err) {
      setError('Failed to delete template');
      console.error('Error deleting template:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: CreateTemplateRequest, document?: File) => {
    try {
      setLoading(true);

      if (viewMode === 'create') {
        if (document) {
          await templateService.createTemplateWithDocument(data, document);
        } else {
          await templateService.createTemplate(data);
        }
      } else if (viewMode === 'edit' && selectedTemplate) {
        if (document) {
          await templateService.updateTemplateWithDocument(selectedTemplate.id, data, document);
        } else {
          await templateService.updateTemplate(selectedTemplate.id, data);
        }
      }

      await fetchTemplates();
      setViewMode('list');
      setSelectedTemplate(null);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save template');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedTemplate(null);
  };

  return (
    <div className="template-management-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header__content">
          <h1 className="page-title">Template Management</h1>
          <p className="page-subtitle">
            Create and manage communication templates for SMS, WhatsApp, Email, IVR, and Notices
          </p>
        </div>
        {viewMode === 'list' && (
          <div className="page-header__actions">
            <button onClick={handleCreate} className="btn btn-primary">
              <span>+</span>
              Create Template
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="error-message__dismiss">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content */}
      {viewMode === 'list' ? (
        <TemplateList
          templates={templates}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      ) : viewMode === 'view' && selectedTemplate ? (
        <div className="template-details-container">
          <div className="template-details-header">
            <button onClick={handleCancel} className="template-form__back-btn">
              <span>←</span> Back to Templates
            </button>
            <div className="template-details-header-content">
              <h2 className="template-details-title">{selectedTemplate.templateName}</h2>
              <div className="template-details-actions">
                <button
                  onClick={() => setViewMode('edit')}
                  className="btn btn-primary"
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Edit Template
                </button>
              </div>
            </div>
          </div>

          <div className="template-details-body">
            {/* Basic Info Card */}
            <div className="template-info-card">
              <h3 className="template-info-card__title">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Basic Information
              </h3>
              <div className="template-info-grid">
                <div className="template-info-item">
                  <span className="template-info-label">Template Code</span>
                  <span className="template-info-value"><code>{selectedTemplate.templateCode}</code></span>
                </div>
                <div className="template-info-item">
                  <span className="template-info-label">Channel</span>
                  <span className={`template-info-value channel-badge channel-badge--${selectedTemplate.channel.toLowerCase()}`}>
                    {selectedTemplate.channel}
                  </span>
                </div>
                <div className="template-info-item">
                  <span className="template-info-label">Language</span>
                  <span className="template-info-value">{selectedTemplate.language}</span>
                </div>
                <div className="template-info-item">
                  <span className="template-info-label">Status</span>
                  <span className={`template-info-value status-badge ${selectedTemplate.isActive ? 'status-badge--active' : 'status-badge--inactive'}`}>
                    {selectedTemplate.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {selectedTemplate.provider && (
                  <div className="template-info-item">
                    <span className="template-info-label">Provider</span>
                    <span className="template-info-value">{selectedTemplate.provider}</span>
                  </div>
                )}
                {selectedTemplate.providerTemplateId && (
                  <div className="template-info-item">
                    <span className="template-info-label">Provider Template ID</span>
                    <span className="template-info-value">{selectedTemplate.providerTemplateId}</span>
                  </div>
                )}
                {selectedTemplate.description && (
                  <div className="template-info-item template-info-item--full">
                    <span className="template-info-label">Description</span>
                    <span className="template-info-value">{selectedTemplate.description}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content Card */}
            <div className="template-info-card">
              <h3 className="template-info-card__title">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Template Content
              </h3>
              <div className="template-content-preview">
                {selectedTemplate.content?.subject && (
                  <div className="template-content-subject">
                    <strong>Subject:</strong> {selectedTemplate.content.subject}
                  </div>
                )}
                <pre className="template-content-body">{selectedTemplate.content?.content || 'No content available'}</pre>
              </div>
            </div>

            {/* Variables Card */}
            {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
              <div className="template-info-card">
                <h3 className="template-info-card__title">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Variables ({selectedTemplate.variables.length})
                </h3>
                <div className="template-variables-grid">
                  {selectedTemplate.variables.map((variable) => (
                    <div key={variable.id} className="template-variable-card">
                      <div className="template-variable-header">
                        <code className="template-variable-key">{`{{${variable.variableKey}}}`}</code>
                        {variable.isRequired && (
                          <span className="template-variable-required">Required</span>
                        )}
                      </div>
                      {variable.description && (
                        <p className="template-variable-description">{variable.description}</p>
                      )}
                      <div className="template-variable-meta">
                        <span className="template-variable-type">{variable.dataType}</span>
                        {variable.defaultValue && (
                          <span className="template-variable-default">
                            Default: <code>{variable.defaultValue}</code>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meta Info */}
            <div className="template-meta-info">
              <span>Created: {new Date(selectedTemplate.createdAt).toLocaleString()}</span>
              <span>Last Updated: {new Date(selectedTemplate.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="template-form">
          <div className="template-form__header">
            <button onClick={handleCancel} className="template-form__back-btn">
              <span>←</span> Back to Templates
            </button>
            <h2 className="template-form__title">
              {viewMode === 'create' ? 'Create New Template' : 'Edit Template'}
            </h2>
          </div>
          <TemplateForm
            template={selectedTemplate}
            availableVariables={availableVariables}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
};

export default TemplateManagementPage;
