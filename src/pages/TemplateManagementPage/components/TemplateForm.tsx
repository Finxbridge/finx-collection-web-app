import React, { useState, useRef } from 'react';
import type {
  TemplateChannelType,
  TemplateLanguage,
  AvailableVariable,
  CreateTemplateRequest,
  TemplateDetail,
} from '../../../types/template.types';

interface TemplateFormProps {
  template?: TemplateDetail | null;
  availableVariables: AvailableVariable[];
  onSubmit: (data: CreateTemplateRequest, document?: File) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const TemplateForm: React.FC<TemplateFormProps> = ({
  template,
  availableVariables,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateTemplateRequest>({
    templateName: template?.templateName || '',
    channel: template?.channel || 'SMS',
    content: template?.content.content || '',
    language: (template?.language as TemplateLanguage) || 'ENGLISH',
  });
  const [document, setDocument] = useState<File | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const channels: TemplateChannelType[] = ['SMS', 'WHATSAPP', 'EMAIL', 'IVR', 'NOTICE'];
  const languages: TemplateLanguage[] = [
    'ENGLISH', 'HINDI', 'TAMIL', 'TELUGU', 'KANNADA',
    'MALAYALAM', 'MARATHI', 'GUJARATI', 'BENGALI', 'PUNJABI'
  ];

  const channelSupportsDocument = (channel: TemplateChannelType): boolean => {
    return ['WHATSAPP', 'EMAIL', 'NOTICE'].includes(channel);
  };

  const handleInputChange = (field: keyof CreateTemplateRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const insertVariable = (variableKey: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent =
      formData.content.substring(0, start) +
      `{{${variableKey}}}` +
      formData.content.substring(end);

    setFormData((prev) => ({ ...prev, content: newContent }));

    setTimeout(() => {
      textarea.focus();
      const newPosition = start + variableKey.length + 4;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.templateName.trim()) {
      newErrors.templateName = 'Template name is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Template content is required';
    }

    if (formData.channel === 'SMS' && formData.content.length > 160) {
      newErrors.content = `SMS content exceeds 160 characters (${formData.content.length}/160)`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await onSubmit(formData, document);
    } catch (error) {
      console.error('Error submitting template:', error);
    }
  };

  const charLimit = formData.channel === 'SMS' ? 160 : null;
  const charCount = formData.content.length;
  const isOverLimit = charLimit && charCount > charLimit;

  return (
    <form onSubmit={handleSubmit}>
      {/* Template Name */}
      <div className="form-group">
        <label className="form-label">
          Template Name <span className="form-label__required">*</span>
        </label>
        <input
          type="text"
          value={formData.templateName}
          onChange={(e) => handleInputChange('templateName', e.target.value)}
          className={`form-input ${errors.templateName ? 'form-input--error' : ''}`}
          placeholder="Enter template name"
        />
        {errors.templateName && <span className="form-error">{errors.templateName}</span>}
      </div>

      {/* Channel */}
      <div className="form-group">
        <label className="form-label">
          Channel <span className="form-label__required">*</span>
        </label>
        <select
          value={formData.channel}
          onChange={(e) => handleInputChange('channel', e.target.value as TemplateChannelType)}
          className="form-select"
        >
          {channels.map((channel) => (
            <option key={channel} value={channel}>
              {channel}
            </option>
          ))}
        </select>
      </div>

      {/* Language */}
      <div className="form-group">
        <label className="form-label">
          Language <span className="form-label__required">*</span>
        </label>
        <select
          value={formData.language}
          onChange={(e) => handleInputChange('language', e.target.value as TemplateLanguage)}
          className="form-select"
        >
          {languages.map((language) => (
            <option key={language} value={language}>
              {language}
            </option>
          ))}
        </select>
      </div>

      {/* Document Upload (if supported) */}
      {channelSupportsDocument(formData.channel) && (
        <div className="form-group">
          <label className="form-label">
            Document Attachment (Optional)
          </label>
          <input
            type="file"
            onChange={(e) => setDocument(e.target.files?.[0])}
            className="form-input"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          {document && (
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
              Selected: {document.name}
            </p>
          )}
        </div>
      )}

      {/* Content Editor with Variables */}
      <div className="form-grid">
        <div>
          <label className="form-label">
            Content <span className="form-label__required">*</span>
          </label>
          <textarea
            ref={contentRef}
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            className={`form-textarea ${errors.content || isOverLimit ? 'form-textarea--error' : ''}`}
            rows={12}
            placeholder="Enter template content using {{variable_name}} for placeholders"
          />
          {charLimit && (
            <p className={`char-counter ${isOverLimit ? 'char-counter--error' : ''}`}>
              {charCount} / {charLimit} characters
            </p>
          )}
          {errors.content && <span className="form-error">{errors.content}</span>}
        </div>

        {/* Variable Palette */}
        <div>
          <label className="form-label">Available Variables</label>
          <div className="variable-palette">
            <p className="variable-palette__title">Available Variables</p>
            <p className="variable-palette__subtitle">Click to insert</p>
            {availableVariables
              .filter((v) => v.isActive)
              .map((variable) => (
                <button
                  key={variable.variableKey}
                  type="button"
                  onClick={() => insertVariable(variable.variableKey)}
                  className="variable-item"
                >
                  <span className="variable-item__key">
                    {`{{${variable.variableKey}}}`}
                  </span>
                  <span className="variable-item__example">
                    Ex: {variable.exampleValue}
                  </span>
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
        </button>
      </div>
    </form>
  );
};

export default TemplateForm;
