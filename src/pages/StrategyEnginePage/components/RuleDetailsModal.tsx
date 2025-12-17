/**
 * Rule Details Modal Component
 * Displays comprehensive details of a strategy/rule
 */

import { Modal } from '@components/common/Modal'
import type { Strategy } from '@types'
import './RuleDetailsModal.css'

interface RuleDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  strategy: Strategy | null
  isLoading: boolean
}

export function RuleDetailsModal({
  isOpen,
  onClose,
  strategy,
  isLoading,
}: RuleDetailsModalProps) {
  const formatDateTime = (dateStr: string | null | undefined): string => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'ACTIVE':
        return 'status-badge--active'
      case 'INACTIVE':
        return 'status-badge--inactive'
      case 'DRAFT':
        return 'status-badge--draft'
      default:
        return ''
    }
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rule Details" size="lg">
      <div className="rule-details-modal">
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <span>Loading rule details...</span>
          </div>
        ) : strategy ? (
          <>
            {/* Header Section */}
            <div className="rule-details-header">
              <div className="rule-details-header__info">
                <h2 className="rule-details-header__name">{strategy.strategyName}</h2>
                <p className="rule-details-header__code">{strategy.strategyCode}</p>
              </div>
              <span className={`status-badge ${getStatusBadgeClass(strategy.status)}`}>
                {strategy.status}
              </span>
            </div>

            {strategy.description && (
              <div className="rule-details-section">
                <p className="rule-details-description">{strategy.description}</p>
              </div>
            )}

            {/* Basic Info Section */}
            <div className="rule-details-section">
              <h3 className="rule-details-section__title">Basic Information</h3>
              <div className="rule-details-grid">
                <div className="rule-details-item">
                  <span className="rule-details-item__label">Priority</span>
                  <span className="rule-details-item__value">{strategy.priority}</span>
                </div>
                <div className="rule-details-item">
                  <span className="rule-details-item__label">Success Count</span>
                  <span className="rule-details-item__value">{strategy.successCount}</span>
                </div>
                <div className="rule-details-item">
                  <span className="rule-details-item__label">Failure Count</span>
                  <span className="rule-details-item__value">{strategy.failureCount}</span>
                </div>
                <div className="rule-details-item">
                  <span className="rule-details-item__label">Last Run</span>
                  <span className="rule-details-item__value">
                    {formatDateTime(strategy.lastRunAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Channel Section */}
            <div className="rule-details-section">
              <h3 className="rule-details-section__title">Channel Configuration</h3>
              <div className="rule-details-grid">
                <div className="rule-details-item">
                  <span className="rule-details-item__label">Channel Type</span>
                  <span className="rule-details-item__value rule-details-channel">
                    {strategy.channel.type}
                  </span>
                </div>
                <div className="rule-details-item">
                  <span className="rule-details-item__label">Template Name</span>
                  <span className="rule-details-item__value">
                    {strategy.channel.templateName}
                  </span>
                </div>
                {strategy.channel.templateId && (
                  <div className="rule-details-item">
                    <span className="rule-details-item__label">Template ID</span>
                    <span className="rule-details-item__value">
                      {strategy.channel.templateId}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Filters Section */}
            <div className="rule-details-section">
              <h3 className="rule-details-section__title">Filters</h3>
              <div className="rule-details-grid">
                {strategy.filters.dpdRange && (
                  <div className="rule-details-item">
                    <span className="rule-details-item__label">DPD Range</span>
                    <span className="rule-details-item__value">
                      {strategy.filters.dpdRange}
                    </span>
                  </div>
                )}
                {strategy.filters.outstandingAmount && (
                  <div className="rule-details-item">
                    <span className="rule-details-item__label">Outstanding Amount</span>
                    <span className="rule-details-item__value">
                      {strategy.filters.outstandingAmount}
                    </span>
                  </div>
                )}
                {strategy.filters.language && strategy.filters.language.length > 0 && (
                  <div className="rule-details-item">
                    <span className="rule-details-item__label">Languages</span>
                    <span className="rule-details-item__value">
                      {strategy.filters.language.join(', ')}
                    </span>
                  </div>
                )}
                {strategy.filters.estimatedCasesMatched !== null && (
                  <div className="rule-details-item">
                    <span className="rule-details-item__label">Estimated Cases Matched</span>
                    <span className="rule-details-item__value">
                      {strategy.filters.estimatedCasesMatched || 'N/A'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Schedule Section */}
            <div className="rule-details-section">
              <h3 className="rule-details-section__title">Schedule</h3>
              <div className="rule-details-grid">
                <div className="rule-details-item">
                  <span className="rule-details-item__label">Frequency</span>
                  <span className="rule-details-item__value">{strategy.schedule.frequency}</span>
                </div>
                <div className="rule-details-item">
                  <span className="rule-details-item__label">Time</span>
                  <span className="rule-details-item__value">{strategy.schedule.time}</span>
                </div>
                {strategy.schedule.days && strategy.schedule.days.length > 0 && (
                  <div className="rule-details-item rule-details-item--full-width">
                    <span className="rule-details-item__label">Days</span>
                    <span className="rule-details-item__value">
                      {strategy.schedule.days.join(', ')}
                    </span>
                  </div>
                )}
                {strategy.schedule.dayOfMonth && (
                  <div className="rule-details-item">
                    <span className="rule-details-item__label">Day of Month</span>
                    <span className="rule-details-item__value">
                      {strategy.schedule.dayOfMonth}
                    </span>
                  </div>
                )}
                <div className="rule-details-item">
                  <span className="rule-details-item__label">Schedule Text</span>
                  <span className="rule-details-item__value">
                    {strategy.schedule.scheduleText}
                  </span>
                </div>
                <div className="rule-details-item">
                  <span className="rule-details-item__label">Next Run</span>
                  <span className="rule-details-item__value">
                    {formatDateTime(strategy.schedule.nextRunAt)}
                  </span>
                </div>
                <div className="rule-details-item">
                  <span className="rule-details-item__label">Scheduler Status</span>
                  <span className={`rule-details-item__value ${strategy.schedule.isEnabled ? 'text-success' : 'text-muted'}`}>
                    {strategy.schedule.isEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            {/* Metadata Section */}
            <div className="rule-details-section">
              <h3 className="rule-details-section__title">Metadata</h3>
              <div className="rule-details-grid">
                <div className="rule-details-item">
                  <span className="rule-details-item__label">Created At</span>
                  <span className="rule-details-item__value">
                    {formatDateTime(strategy.createdAt)}
                  </span>
                </div>
                <div className="rule-details-item">
                  <span className="rule-details-item__label">Updated At</span>
                  <span className="rule-details-item__value">
                    {formatDateTime(strategy.updatedAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="rule-details-actions">
              <button className="btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        ) : (
          <div className="rule-details-error">
            <p>Failed to load strategy details. Please try again.</p>
            <button className="btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default RuleDetailsModal
