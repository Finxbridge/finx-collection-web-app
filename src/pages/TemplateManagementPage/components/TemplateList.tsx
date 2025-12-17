import React, { useState } from 'react';
import type { TemplateListItem, TemplateChannelType } from '../../../types/template.types';

interface TemplateListProps {
  templates: TemplateListItem[];
  onView: (template: TemplateListItem) => void;
  onEdit: (template: TemplateListItem) => void;
  onDelete: (id: number) => void;
  loading?: boolean;
}

const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  onView,
  onEdit,
  onDelete,
  loading = false,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<TemplateChannelType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const channels: Array<TemplateChannelType | 'ALL'> = ['ALL', 'SMS', 'WHATSAPP', 'EMAIL', 'IVR', 'NOTICE'];

  const getChannelIcon = (channel: TemplateChannelType) => {
    const icons: Record<TemplateChannelType, string> = {
      SMS: '📱',
      WHATSAPP: '💬',
      EMAIL: '✉️',
      IVR: '📞',
      NOTICE: '📄',
    };
    return icons[channel] || '📝';
  };

  const getChannelClass = (channel: TemplateChannelType) => {
    const classes: Record<TemplateChannelType, string> = {
      SMS: 'channel-badge--sms',
      WHATSAPP: 'channel-badge--whatsapp',
      EMAIL: 'channel-badge--email',
      IVR: 'channel-badge--ivr',
      NOTICE: 'channel-badge--notice',
    };
    return `channel-badge ${classes[channel] || ''}`;
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesChannel = selectedChannel === 'ALL' || template.channel === selectedChannel;
    const matchesSearch = template.templateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.templateCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChannel && matchesSearch;
  });

  const getChannelCount = (channel: TemplateChannelType | 'ALL') => {
    if (channel === 'ALL') return templates.length;
    return templates.filter(t => t.channel === channel).length;
  };

  return (
    <div>
      {/* Search and Filter */}
      <div className="filter-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search templates by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Channel Tabs */}
      <div className="channel-tabs">
        {channels.map((channel) => (
          <button
            key={channel}
            onClick={() => setSelectedChannel(channel)}
            className={`channel-tab ${selectedChannel === channel ? 'active' : ''}`}
          >
            {channel === 'ALL' ? 'All' : channel}
            <span className="channel-tab__badge">
              {getChannelCount(channel)}
            </span>
          </button>
        ))}
      </div>

      {/* Templates Table */}
      <div className="template-table-container">
        {loading ? (
          <div className="loading-state">Loading templates...</div>
        ) : filteredTemplates.length === 0 ? (
          <div className="empty-state">
            {searchQuery || selectedChannel !== 'ALL'
              ? 'No templates found matching your filters'
              : 'No templates available. Create your first template!'}
          </div>
        ) : (
          <table className="template-table">
            <thead>
              <tr>
                <th>Template Name</th>
                <th>Code</th>
                <th>Channel</th>
                <th>Language</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTemplates.map((template) => (
                <tr
                  key={template.id}
                  onClick={() => onView(template)}
                  className="template-row--clickable"
                >
                  <td>{template.templateName}</td>
                  <td>
                    <code>{template.templateCode}</code>
                  </td>
                  <td>
                    <span className={getChannelClass(template.channel)}>
                      <span>{getChannelIcon(template.channel)}</span>
                      {template.channel}
                    </span>
                  </td>
                  <td>{template.language}</td>
                  <td>
                    <span className={`status-badge ${template.isActive ? 'status-badge--active' : 'status-badge--inactive'}`}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onView(template)}
                        className="action-btn action-btn--view"
                        title="View Details"
                      >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => onEdit(template)}
                        className="action-btn action-btn--edit"
                        title="Edit"
                      >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${template.templateName}"?`)) {
                            onDelete(template.id);
                          }
                        }}
                        className="action-btn action-btn--delete"
                        title="Delete"
                      >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TemplateList;
