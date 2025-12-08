/**
 * Case Detail Page
 * View case details and activity timeline
 */

import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { caseSourcingService } from '@services/api'
import { Button } from '@components/common/Button'
import { ROUTES } from '@config/constants'
import type { CaseTimeline, TimelineEvent } from '@types'
import './CaseDetailPage.css'

export function CaseDetailPage() {
  const { caseId } = useParams<{ caseId: string }>()
  const navigate = useNavigate()

  const [timeline, setTimeline] = useState<CaseTimeline | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchTimeline = useCallback(async () => {
    if (!caseId) return

    try {
      setIsLoading(true)
      setError('')

      const data = await caseSourcingService.getCaseTimeline(parseInt(caseId))
      setTimeline(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch case timeline')
    } finally {
      setIsLoading(false)
    }
  }, [caseId])

  useEffect(() => {
    fetchTimeline()
  }, [fetchTimeline])

  const formatDateTime = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getEventIcon = (event: TimelineEvent): JSX.Element => {
    switch (event.eventType) {
      case 'CALL':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7294C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.09501 3.90347 2.12787 3.62476 2.2165 3.36162C2.30513 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.5953 1.99522 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04207 3.23945 9.10999 3.72C9.23662 4.68007 9.47144 5.62273 9.80999 6.53C9.94454 6.88792 9.97366 7.27691 9.89391 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.64L8.08999 9.91C9.51355 12.4135 11.5865 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
      case 'SMS':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
      case 'EMAIL':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
      case 'ALLOCATION':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          </svg>
        )
      case 'STATUS_CHANGE':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polyline points="23 4 23 10 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20.49 15C19.84 16.81 18.6 18.32 17 19.32C15.4 20.33 13.5 20.75 11.65 20.49C9.79 20.22 8.09 19.3 6.83 17.89C5.56 16.47 4.8 14.66 4.68 12.78C4.56 10.9 5.09 9.03 6.19 7.49C7.28 5.95 8.87 4.84 10.68 4.34C12.5 3.84 14.42 3.99 16.13 4.76C17.84 5.53 19.23 6.87 20.07 8.55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )
    }
  }

  const getEventColorClass = (event: TimelineEvent): string => {
    const colorCode = event.colorCode?.toLowerCase() || 'gray'
    return `timeline-event--${colorCode}`
  }

  if (isLoading) {
    return (
      <div className="case-detail-page">
        <div className="case-detail-page__loading">
          <div className="spinner"></div>
          <span>Loading case details...</span>
        </div>
      </div>
    )
  }

  if (!timeline) {
    return (
      <div className="case-detail-page">
        <div className="case-detail-page__error">
          <p>{error || 'Case not found'}</p>
          <Button onClick={() => navigate(ROUTES.CASE_SOURCING_SEARCH)}>
            Back to Search
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="case-detail-page">
      {/* Header */}
      <div className="case-detail-page__header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <div className="case-detail-page__header-content">
          <div>
            <h1 className="case-detail-page__title">{timeline.caseNumber}</h1>
            <p className="case-detail-page__subtitle">
              {timeline.customerName} • {timeline.loanAccountNumber}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert--error">
          <span>{error}</span>
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      <div className="case-detail-page__content">
        {/* Summary Section */}
        <div className="case-detail-page__summary">
          <h2 className="section-title">Activity Summary</h2>
          <div className="summary-grid">
            <div className="summary-item">
              <div className="summary-item__value">{timeline.summary.totalEvents}</div>
              <div className="summary-item__label">Total Events</div>
            </div>
            <div className="summary-item">
              <div className="summary-item__value">{timeline.summary.totalCalls}</div>
              <div className="summary-item__label">Total Calls</div>
            </div>
            <div className="summary-item">
              <div className="summary-item__value">{timeline.summary.connectedCalls}</div>
              <div className="summary-item__label">Connected</div>
            </div>
            <div className="summary-item">
              <div className="summary-item__value">{timeline.summary.failedCalls}</div>
              <div className="summary-item__label">Failed Calls</div>
            </div>
            <div className="summary-item">
              <div className="summary-item__value">{timeline.summary.totalMessages}</div>
              <div className="summary-item__label">Messages</div>
            </div>
            <div className="summary-item">
              <div className="summary-item__value">{timeline.summary.daysSinceLastActivity}</div>
              <div className="summary-item__label">Days Inactive</div>
            </div>
          </div>
          {timeline.summary.lastContactedAt && (
            <div className="summary-footer">
              <span className="summary-footer__label">Last Contacted:</span>
              <span className="summary-footer__value">
                {formatDateTime(timeline.summary.lastContactedAt)}
              </span>
              {timeline.summary.lastContactResult && (
                <span className="summary-footer__badge">
                  {timeline.summary.lastContactResult}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Timeline Section */}
        <div className="case-detail-page__timeline">
          <h2 className="section-title">Activity Timeline</h2>
          {timeline.events.length === 0 ? (
            <div className="timeline-empty">No activity recorded</div>
          ) : (
            <div className="timeline">
              {timeline.events.map((event) => (
                <div
                  key={event.eventId}
                  className={`timeline-event ${getEventColorClass(event)}`}
                >
                  <div className="timeline-event__marker">
                    <div className="timeline-event__icon">
                      {getEventIcon(event)}
                    </div>
                    <div className="timeline-event__line"></div>
                  </div>
                  <div className="timeline-event__content">
                    <div className="timeline-event__header">
                      <span className="timeline-event__title">{event.eventTitle}</span>
                      <span className="timeline-event__time">
                        {formatDateTime(event.eventTimestamp)}
                      </span>
                    </div>
                    <div className="timeline-event__body">
                      <p className="timeline-event__description">{event.eventDescription}</p>
                      {event.userName && (
                        <div className="timeline-event__meta">
                          <span className="timeline-event__meta-item">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            {event.userName}
                          </span>
                        </div>
                      )}
                      <div className="timeline-event__details">
                        {event.disposition && (
                          <span className="timeline-event__badge timeline-event__badge--disposition">
                            {event.disposition}
                          </span>
                        )}
                        {event.subDisposition && (
                          <span className="timeline-event__badge">
                            {event.subDisposition}
                          </span>
                        )}
                        {event.contactResult && (
                          <span className={`timeline-event__badge timeline-event__badge--${event.contactResult === 'CONNECTED' ? 'success' : 'danger'}`}>
                            {event.contactResult}
                          </span>
                        )}
                        {event.callDurationSeconds !== undefined && event.callDurationSeconds > 0 && (
                          <span className="timeline-event__duration">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                              <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {formatDuration(event.callDurationSeconds)}
                          </span>
                        )}
                        {event.messageStatus && (
                          <span className={`timeline-event__badge timeline-event__badge--${event.messageStatus === 'DELIVERED' ? 'success' : 'warning'}`}>
                            {event.messageStatus}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CaseDetailPage
