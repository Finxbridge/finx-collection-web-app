/**
 * Agency Management Page
 * Manages agencies, approvals, case allocations, and agent assignments
 */

import { useState, useEffect, useCallback } from 'react';
import { agencyService } from '@services/api/agency.service';
import type {
  Agency,
  CreateAgencyRequest,
  Agent,
  AgencyCaseAllocation,
  AgencyStatus,
  AgencyType,
  PageResponse,
} from '@types';
import {
  AgencyStatusLabels,
  AgencyStatusColors,
  AgencyTypeLabels,
} from '@types';
import './AgencyManagementPage.css';

type TabType = 'agencies' | 'pending-approval' | 'agency-cases' | 'case-assignment';

// Form Modal Component
interface AgencyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAgencyRequest) => Promise<void>;
  agency?: Agency | null;
  loading: boolean;
}

function AgencyFormModal({ isOpen, onClose, onSubmit, agency, loading }: AgencyFormModalProps) {
  const [formData, setFormData] = useState<CreateAgencyRequest>({
    agencyName: '',
    agencyType: 'EXTERNAL',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    panNumber: '',
    gstNumber: '',
    bankAccountNumber: '',
    bankName: '',
    ifscCode: '',
    contractStartDate: '',
    contractEndDate: '',
    commissionRate: undefined,
    maxCaseLimit: undefined,
    notes: '',
  });

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  useEffect(() => {
    if (agency) {
      setFormData({
        agencyName: agency.agencyName,
        agencyType: agency.agencyType,
        contactPerson: agency.contactPerson,
        contactEmail: agency.contactEmail,
        contactPhone: agency.contactPhone,
        address: agency.address || '',
        city: agency.city || '',
        state: agency.state || '',
        pincode: agency.pincode || '',
        panNumber: agency.panNumber || '',
        gstNumber: agency.gstNumber || '',
        bankAccountNumber: agency.bankAccountNumber || '',
        bankName: agency.bankName || '',
        ifscCode: agency.ifscCode || '',
        contractStartDate: agency.contractStartDate || '',
        contractEndDate: agency.contractEndDate || '',
        commissionRate: agency.commissionRate,
        maxCaseLimit: agency.maxCaseLimit,
        notes: agency.notes || '',
      });
    } else {
      setFormData({
        agencyName: '',
        agencyType: 'EXTERNAL',
        contactPerson: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        panNumber: '',
        gstNumber: '',
        bankAccountNumber: '',
        bankName: '',
        ifscCode: '',
        contractStartDate: '',
        contractEndDate: '',
        commissionRate: undefined,
        maxCaseLimit: undefined,
        notes: '',
      });
    }
  }, [agency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--large" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="modal__form">
          <div className="modal__header">
            <h2>{agency ? 'Edit Agency' : 'Add New Agency'}</h2>
            <button type="button" className="modal__close" onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div className="modal__body">
            <div className="form-section">
              <h3 className="form-section__title">Basic Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Agency Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.agencyName}
                    onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Agency Type *</label>
                  <select
                    className="form-select"
                    value={formData.agencyType}
                    onChange={(e) => setFormData({ ...formData, agencyType: e.target.value as AgencyType })}
                    required
                  >
                    <option value="INTERNAL">Internal</option>
                    <option value="EXTERNAL">External</option>
                    <option value="LEGAL">Legal</option>
                    <option value="FIELD">Field</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Person *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Phone *</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section__title">Address</h3>
              <div className="form-grid">
                <div className="form-group form-group--full">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section__title">KYC & Bank Details</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">PAN Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.panNumber}
                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">GST Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Bank Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Bank Account Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.bankAccountNumber}
                    onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">IFSC Code</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.ifscCode}
                    onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section__title">Contract Details</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Contract Start Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.contractStartDate}
                    onChange={(e) => setFormData({ ...formData, contractStartDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contract End Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.contractEndDate}
                    onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Commission Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={formData.commissionRate || ''}
                    onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) || undefined })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Case Limit</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.maxCaseLimit || ''}
                    onChange={(e) => setFormData({ ...formData, maxCaseLimit: parseInt(e.target.value) || undefined })}
                  />
                </div>
                <div className="form-group form-group--full">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="modal__footer">
            <button type="button" className="btn btn--secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? 'Saving...' : agency ? 'Update Agency' : 'Create Agency'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Approval Modal Component
interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  agencyId: number | null;
  onApprove: (agencyId: number, notes?: string) => Promise<void>;
  onReject: (agencyId: number, reason: string) => Promise<void>;
  loading: boolean;
}

function ApprovalModal({ isOpen, onClose, agencyId, onApprove, onReject, loading }: ApprovalModalProps) {
  const [agency, setAgency] = useState<Agency | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  // Fetch agency details when modal opens
  useEffect(() => {
    if (isOpen && agencyId) {
      const fetchAgencyDetails = async () => {
        try {
          setFetchLoading(true);
          setFetchError(null);
          const agencyData = await agencyService.getAgencyById(agencyId);
          setAgency(agencyData);
        } catch (err) {
          console.error('Error fetching agency details:', err);
          setFetchError(err instanceof Error ? err.message : 'Failed to fetch agency details');
          setAgency(null);
        } finally {
          setFetchLoading(false);
        }
      };
      fetchAgencyDetails();
    } else {
      setAgency(null);
      setFetchError(null);
      setAction(null);
      setNotes('');
      setReason('');
    }
  }, [isOpen, agencyId]);

  if (!isOpen || !agencyId) return null;

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleApprove = async () => {
    if (!agency) return;
    await onApprove(agency.id, notes);
    setNotes('');
    setAction(null);
  };

  const handleReject = async () => {
    if (!agency) return;
    if (!reason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    await onReject(agency.id, reason);
    setReason('');
    setAction(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--large" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>Review Agency</h2>
          <button className="modal__close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div className="modal__body">
          {fetchLoading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading agency details...</p>
            </div>
          ) : fetchError ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p>Error loading agency</p>
              <span>{fetchError}</span>
            </div>
          ) : !agency ? (
            <div className="empty-state">
              <p>No agency data available</p>
            </div>
          ) : (
            <div className="agency-detail-content">
              {/* Header with status */}
              <div className="agency-detail-header">
                <div className="agency-detail-header__info">
                  <h3 className="agency-detail-header__name">{agency.agencyName}</h3>
                  <span className="agency-detail-header__code">{agency.agencyCode}</span>
                </div>
                <span className="badge badge--warning">
                  {AgencyStatusLabels[agency.status]}
                </span>
              </div>

              {/* Basic Information */}
              <div className="detail-section">
                <h4 className="detail-section__title">Basic Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-item__label">Agency Type</span>
                    <span className="detail-item__value">{AgencyTypeLabels[agency.agencyType]}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Contact Person</span>
                    <span className="detail-item__value">{agency.contactPerson}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Contact Email</span>
                    <span className="detail-item__value">{agency.contactEmail}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Contact Phone</span>
                    <span className="detail-item__value">{agency.contactPhone}</span>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="detail-section">
                <h4 className="detail-section__title">Address</h4>
                <div className="detail-grid">
                  <div className="detail-item detail-item--full">
                    <span className="detail-item__label">Address</span>
                    <span className="detail-item__value">{agency.address || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">City</span>
                    <span className="detail-item__value">{agency.city || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">State</span>
                    <span className="detail-item__value">{agency.state || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Pincode</span>
                    <span className="detail-item__value">{agency.pincode || '-'}</span>
                  </div>
                </div>
              </div>

              {/* KYC & Bank Details */}
              <div className="detail-section">
                <h4 className="detail-section__title">KYC & Bank Details</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-item__label">PAN Number</span>
                    <span className="detail-item__value">{agency.panNumber || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">GST Number</span>
                    <span className="detail-item__value">{agency.gstNumber || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Bank Name</span>
                    <span className="detail-item__value">{agency.bankName || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Account Number</span>
                    <span className="detail-item__value">{agency.bankAccountNumber || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">IFSC Code</span>
                    <span className="detail-item__value">{agency.ifscCode || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Contract Details */}
              <div className="detail-section">
                <h4 className="detail-section__title">Contract Details</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-item__label">Contract Start Date</span>
                    <span className="detail-item__value">{formatDate(agency.contractStartDate)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Contract End Date</span>
                    <span className="detail-item__value">{formatDate(agency.contractEndDate)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Commission Rate</span>
                    <span className="detail-item__value">{agency.commissionRate ? `${agency.commissionRate}%` : '-'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Max Case Limit</span>
                    <span className="detail-item__value">{agency.maxCaseLimit ?? '-'}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {agency.notes && agency.notes.trim() !== '' && (
                <div className="detail-section">
                  <h4 className="detail-section__title">Notes</h4>
                  <p className="detail-notes">{agency.notes}</p>
                </div>
              )}

              {/* System Information */}
              <div className="detail-section detail-section--meta">
                <h4 className="detail-section__title">Submission Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-item__label">Submitted At</span>
                    <span className="detail-item__value">{formatDate(agency.createdAt)}</span>
                  </div>
                  {agency.createdBy && (
                    <div className="detail-item">
                      <span className="detail-item__label">Submitted By</span>
                      <span className="detail-item__value">User #{agency.createdBy}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Approval/Rejection Form */}
              {action === 'approve' && (
                <div className="approval-form">
                  <label className="form-label">Approval Notes (Optional)</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes for this approval..."
                  />
                </div>
              )}

              {action === 'reject' && (
                <div className="approval-form">
                  <label className="form-label">Rejection Reason *</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide a reason for rejection..."
                    required
                  />
                </div>
              )}
            </div>
          )}
        </div>
        <div className="modal__footer">
          {!agency ? (
            <button className="btn btn--secondary" onClick={onClose}>
              Close
            </button>
          ) : !action ? (
            <>
              <button className="btn btn--secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="btn btn--danger" onClick={() => setAction('reject')} disabled={loading || fetchLoading}>
                Reject
              </button>
              <button className="btn btn--success" onClick={() => setAction('approve')} disabled={loading || fetchLoading}>
                Approve
              </button>
            </>
          ) : action === 'approve' ? (
            <>
              <button className="btn btn--secondary" onClick={() => setAction(null)} disabled={loading}>
                Back
              </button>
              <button className="btn btn--success" onClick={handleApprove} disabled={loading}>
                {loading ? 'Approving...' : 'Confirm Approval'}
              </button>
            </>
          ) : (
            <>
              <button className="btn btn--secondary" onClick={() => setAction(null)} disabled={loading}>
                Back
              </button>
              <button className="btn btn--danger" onClick={handleReject} disabled={loading}>
                {loading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Case Assignment Modal
interface CaseAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCases: AgencyCaseAllocation[];
  agents: Agent[];
  onAssign: (agentId: number, notes?: string) => Promise<void>;
  loading: boolean;
}

function CaseAssignmentModal({ isOpen, onClose, selectedCases, agents, onAssign, loading }: CaseAssignmentModalProps) {
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAssign = async () => {
    if (!selectedAgent) {
      alert('Please select an agent');
      return;
    }
    await onAssign(selectedAgent, notes);
    setSelectedAgent(null);
    setNotes('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal__header">
          <h2>Assign Cases to Agent</h2>
          <button className="modal__close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div className="modal__body">
          <p className="assignment-info">
            Assigning <strong>{selectedCases.length}</strong> case(s) to an agent
          </p>
          <div className="form-group">
            <label className="form-label">Select Agent *</label>
            <select
              className="form-select"
              value={selectedAgent || ''}
              onChange={(e) => setSelectedAgent(parseInt(e.target.value) || null)}
            >
              <option value="">-- Select Agent --</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.firstName} {agent.lastName} ({agent.currentCaseCount || 0}/{agent.maxCaseCapacity || '-'} cases)
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes..."
            />
          </div>
        </div>
        <div className="modal__footer">
          <button className="btn btn--secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn--primary" onClick={handleAssign} disabled={loading || !selectedAgent}>
            {loading ? 'Assigning...' : 'Assign Cases'}
          </button>
        </div>
      </div>
    </div>
  );
}

// View Agency Details Modal
interface ViewAgencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  agencyId: number | null;
}

function ViewAgencyModal({ isOpen, onClose, agencyId }: ViewAgencyModalProps) {
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  // Fetch agency details when modal opens
  useEffect(() => {
    if (isOpen && agencyId) {
      const fetchAgencyDetails = async () => {
        try {
          setLoading(true);
          setError(null);
          const agencyData = await agencyService.getAgencyById(agencyId);
          setAgency(agencyData);
        } catch (err) {
          console.error('Error fetching agency details:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch agency details');
          setAgency(null);
        } finally {
          setLoading(false);
        }
      };
      fetchAgencyDetails();
    } else {
      setAgency(null);
      setError(null);
    }
  }, [isOpen, agencyId]);

  if (!isOpen || !agencyId) return null;

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadgeClass = (status: AgencyStatus): string => {
    const colorMap: Record<AgencyStatus, string> = {
      PENDING_APPROVAL: 'warning',
      APPROVED: 'info',
      REJECTED: 'danger',
      ACTIVE: 'success',
      INACTIVE: 'default',
      SUSPENDED: 'orange',
      TERMINATED: 'danger',
    };
    return `badge--${colorMap[status] || 'default'}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--large" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>Agency Details</h2>
          <button type="button" className="modal__close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div className="modal__body">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading agency details...</p>
            </div>
          ) : error ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p>Error loading agency</p>
              <span>{error}</span>
            </div>
          ) : !agency ? (
            <div className="empty-state">
              <p>No agency data available</p>
            </div>
          ) : (
            <div className="agency-detail-content">
              {/* Header with status */}
              <div className="agency-detail-header">
                <div className="agency-detail-header__info">
                  <h3 className="agency-detail-header__name">{agency.agencyName}</h3>
                  <span className="agency-detail-header__code">{agency.agencyCode}</span>
                </div>
                <span className={`badge ${getStatusBadgeClass(agency.status)}`}>
                  {AgencyStatusLabels[agency.status]}
                </span>
              </div>

              {/* Basic Information */}
              <div className="detail-section">
                <h4 className="detail-section__title">Basic Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-item__label">Agency Type</span>
                    <span className="detail-item__value">{AgencyTypeLabels[agency.agencyType]}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Contact Person</span>
                    <span className="detail-item__value">{agency.contactPerson}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Contact Email</span>
                    <span className="detail-item__value">{agency.contactEmail}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Contact Phone</span>
                    <span className="detail-item__value">{agency.contactPhone}</span>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="detail-section">
                <h4 className="detail-section__title">Address</h4>
                <div className="detail-grid">
                  <div className="detail-item detail-item--full">
                    <span className="detail-item__label">Address</span>
                    <span className="detail-item__value">{agency.address || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">City</span>
                    <span className="detail-item__value">{agency.city || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">State</span>
                    <span className="detail-item__value">{agency.state || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Pincode</span>
                    <span className="detail-item__value">{agency.pincode || '-'}</span>
                  </div>
                </div>
              </div>

              {/* KYC & Bank Details */}
              <div className="detail-section">
                <h4 className="detail-section__title">KYC & Bank Details</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-item__label">PAN Number</span>
                    <span className="detail-item__value">{agency.panNumber || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">GST Number</span>
                    <span className="detail-item__value">{agency.gstNumber || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Bank Name</span>
                    <span className="detail-item__value">{agency.bankName || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Account Number</span>
                    <span className="detail-item__value">{agency.bankAccountNumber || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">IFSC Code</span>
                    <span className="detail-item__value">{agency.ifscCode || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Contract Details */}
              <div className="detail-section">
                <h4 className="detail-section__title">Contract Details</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-item__label">Contract Start Date</span>
                    <span className="detail-item__value">{formatDate(agency.contractStartDate)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Contract End Date</span>
                    <span className="detail-item__value">{formatDate(agency.contractEndDate)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Commission Rate</span>
                    <span className="detail-item__value">{agency.commissionRate ? `${agency.commissionRate}%` : '-'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Max Case Limit</span>
                    <span className="detail-item__value">{agency.maxCaseLimit ?? '-'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Current Case Count</span>
                    <span className="detail-item__value">{agency.currentCaseCount ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* Service Areas */}
              {agency.serviceAreas && agency.serviceAreas.length > 0 && (
                <div className="detail-section">
                  <h4 className="detail-section__title">Service Areas</h4>
                  <div className="detail-tags">
                    {agency.serviceAreas.map((area, index) => (
                      <span key={index} className="detail-tag">{area}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Pincodes */}
              {agency.servicePincodes && agency.servicePincodes.length > 0 && (
                <div className="detail-section">
                  <h4 className="detail-section__title">Service Pincodes</h4>
                  <div className="detail-tags">
                    {agency.servicePincodes.map((pincode, index) => (
                      <span key={index} className="detail-tag detail-tag--mono">{pincode}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {agency.notes && agency.notes.trim() !== '' && (
                <div className="detail-section">
                  <h4 className="detail-section__title">Notes</h4>
                  <p className="detail-notes">{agency.notes}</p>
                </div>
              )}

              {/* Approval Info */}
              {(agency.approvedBy || agency.rejectionReason) && (
                <div className="detail-section">
                  <h4 className="detail-section__title">Approval Information</h4>
                  <div className="detail-grid">
                    {agency.approvedBy && (
                      <>
                        <div className="detail-item">
                          <span className="detail-item__label">Approved By</span>
                          <span className="detail-item__value">User #{agency.approvedBy}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-item__label">Approval Date</span>
                          <span className="detail-item__value">{formatDate(agency.approvalDate)}</span>
                        </div>
                      </>
                    )}
                    {agency.rejectionReason && (
                      <div className="detail-item detail-item--full">
                        <span className="detail-item__label">Rejection Reason</span>
                        <span className="detail-item__value detail-item__value--danger">{agency.rejectionReason}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="detail-section detail-section--meta">
                <h4 className="detail-section__title">System Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-item__label">Created At</span>
                    <span className="detail-item__value">{formatDate(agency.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Updated At</span>
                    <span className="detail-item__value">{formatDate(agency.updatedAt)}</span>
                  </div>
                  {agency.createdBy && (
                    <div className="detail-item">
                      <span className="detail-item__label">Created By</span>
                      <span className="detail-item__value">User #{agency.createdBy}</span>
                    </div>
                  )}
                  {agency.updatedBy && (
                    <div className="detail-item">
                      <span className="detail-item__label">Updated By</span>
                      <span className="detail-item__value">User #{agency.updatedBy}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="modal__footer">
          <button className="btn btn--secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function AgencyManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>('agencies');
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [pendingAgencies, setPendingAgencies] = useState<Agency[]>([]);
  const [caseAllocations, setCaseAllocations] = useState<AgencyCaseAllocation[]>([]);
  const [unassignedCases, setUnassignedCases] = useState<AgencyCaseAllocation[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AgencyStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<AgencyType | ''>('');
  const [selectedAgencyId, setSelectedAgencyId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [reviewingAgencyId, setReviewingAgencyId] = useState<number | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedCases, setSelectedCases] = useState<AgencyCaseAllocation[]>([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingAgencyId, setViewingAgencyId] = useState<number | null>(null);

  // Fetch Agencies
  const fetchAgencies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let response: PageResponse<Agency>;

      if (searchTerm) {
        response = await agencyService.searchAgencies(searchTerm, page, 20);
      } else if (statusFilter) {
        response = await agencyService.getAgenciesByStatus(statusFilter, page, 20);
      } else if (typeFilter) {
        response = await agencyService.getAgenciesByType(typeFilter, page, 20);
      } else {
        response = await agencyService.getAllAgencies(page, 20);
      }

      setAgencies(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err) {
      console.error('Error fetching agencies:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch agencies');
      setAgencies([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, typeFilter, page]);

  // Fetch Pending Agencies
  const fetchPendingAgencies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await agencyService.getPendingApprovalAgencies(page, 20);
      setPendingAgencies(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err) {
      console.error('Error fetching pending agencies:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch pending agencies');
      setPendingAgencies([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  // Fetch Agency Cases
  const fetchAgencyCases = useCallback(async () => {
    if (!selectedAgencyId) return;
    try {
      setLoading(true);
      const response = await agencyService.getAgencyCaseAllocations(selectedAgencyId, page, 20);
      setCaseAllocations(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err) {
      console.error('Error fetching case allocations:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedAgencyId, page]);

  // Fetch Unassigned Cases
  const fetchUnassignedCases = useCallback(async () => {
    try {
      setLoading(true);
      const response = await agencyService.getAllUnassignedCases(page, 20);
      setUnassignedCases(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err) {
      console.error('Error fetching unassigned cases:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  // Fetch Agents
  const fetchAgents = useCallback(async () => {
    try {
      const agentList = await agencyService.getActiveAgents();
      setAgents(agentList);
    } catch (err) {
      console.error('Error fetching agents:', err);
    }
  }, []);

  // Effect for tab changes - reset page, error and set loading
  useEffect(() => {
    setPage(0);
    setSelectedCases([]);
    setError(null);
    setLoading(true);
  }, [activeTab]);

  // Effect to fetch data based on activeTab and page
  useEffect(() => {
    const fetchData = async () => {
      switch (activeTab) {
        case 'agencies':
          await fetchAgencies();
          break;
        case 'pending-approval':
          await fetchPendingAgencies();
          break;
        case 'agency-cases':
          if (selectedAgencyId) {
            await fetchAgencyCases();
          }
          break;
        case 'case-assignment':
          await fetchUnassignedCases();
          await fetchAgents();
          break;
      }
    };
    fetchData();
  }, [activeTab, page, selectedAgencyId, fetchAgencies, fetchPendingAgencies, fetchAgencyCases, fetchUnassignedCases, fetchAgents]);

  // Handlers
  const handleCreateAgency = async (data: CreateAgencyRequest) => {
    try {
      setModalLoading(true);
      await agencyService.createAgency(data);
      setShowFormModal(false);
      fetchAgencies();
    } catch (err) {
      console.error('Error creating agency:', err);
      alert(err instanceof Error ? err.message : 'Failed to create agency');
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateAgency = async (data: CreateAgencyRequest) => {
    if (!editingAgency) return;
    try {
      setModalLoading(true);
      await agencyService.updateAgency(editingAgency.id, data);
      setShowFormModal(false);
      setEditingAgency(null);
      fetchAgencies();
    } catch (err) {
      console.error('Error updating agency:', err);
      alert(err instanceof Error ? err.message : 'Failed to update agency');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteAgency = async (agencyId: number) => {
    if (!confirm('Are you sure you want to delete this agency?')) return;
    try {
      await agencyService.deleteAgency(agencyId);
      fetchAgencies();
    } catch (err) {
      console.error('Error deleting agency:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete agency');
    }
  };

  const handleApprove = async (agencyId: number, notes?: string) => {
    try {
      setModalLoading(true);
      await agencyService.approveAgency(agencyId, notes);
      setShowApprovalModal(false);
      setReviewingAgencyId(null);
      fetchPendingAgencies();
    } catch (err) {
      console.error('Error approving agency:', err);
      alert(err instanceof Error ? err.message : 'Failed to approve agency');
    } finally {
      setModalLoading(false);
    }
  };

  const handleReject = async (agencyId: number, reason: string) => {
    try {
      setModalLoading(true);
      await agencyService.rejectAgency(agencyId, reason);
      setShowApprovalModal(false);
      setReviewingAgencyId(null);
      fetchPendingAgencies();
    } catch (err) {
      console.error('Error rejecting agency:', err);
      alert(err instanceof Error ? err.message : 'Failed to reject agency');
    } finally {
      setModalLoading(false);
    }
  };

  const handleActivate = async (agencyId: number) => {
    try {
      await agencyService.activateAgency(agencyId);
      fetchAgencies();
    } catch (err) {
      console.error('Error activating agency:', err);
      alert(err instanceof Error ? err.message : 'Failed to activate agency');
    }
  };

  const handleDeactivate = async (agencyId: number) => {
    const reason = prompt('Enter deactivation reason (optional):');
    try {
      await agencyService.deactivateAgency(agencyId, reason || undefined);
      fetchAgencies();
    } catch (err) {
      console.error('Error deactivating agency:', err);
      alert(err instanceof Error ? err.message : 'Failed to deactivate agency');
    }
  };

  const handleAssignCases = async (agentId: number, notes?: string) => {
    if (selectedCases.length === 0) return;

    const agencyId = selectedCases[0].agencyId;
    const caseIds = selectedCases.map((c) => c.caseId);

    try {
      setModalLoading(true);
      await agencyService.assignCasesToAgent(agencyId, {
        agentId,
        caseIds,
        notes,
      });
      setShowAssignmentModal(false);
      setSelectedCases([]);
      fetchUnassignedCases();
    } catch (err) {
      console.error('Error assigning cases:', err);
      alert(err instanceof Error ? err.message : 'Failed to assign cases');
    } finally {
      setModalLoading(false);
    }
  };

  const toggleCaseSelection = (allocation: AgencyCaseAllocation) => {
    setSelectedCases((prev) => {
      const exists = prev.find((c) => c.id === allocation.id);
      if (exists) {
        return prev.filter((c) => c.id !== allocation.id);
      }
      return [...prev, allocation];
    });
  };

  const selectAllCases = () => {
    if (selectedCases.length === unassignedCases.length) {
      setSelectedCases([]);
    } else {
      setSelectedCases([...unassignedCases]);
    }
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadgeClass = (status: AgencyStatus): string => {
    const color = AgencyStatusColors[status] || 'default';
    return `badge--${color}`;
  };

  // Render tabs content
  const renderAgenciesTab = () => (
    <>
      <div className="tab-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search agencies..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <div className="toolbar-actions">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as AgencyStatus | '');
              setPage(0);
            }}
          >
            <option value="">All Statuses</option>
            {agencyService.getAgencyStatusOptions().map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as AgencyType | '');
              setPage(0);
            }}
          >
            <option value="">All Types</option>
            {agencyService.getAgencyTypeOptions().map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            className="btn btn--primary"
            onClick={() => {
              setEditingAgency(null);
              setShowFormModal(true);
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Add Agency
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading agencies...</p>
        </div>
      ) : agencies.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 21V5C19 3.89543 18.1046 3 17 3H7C5.89543 3 5 3.89543 5 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 7H10M9 11H10M14 7H15M14 11H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p>No agencies found</p>
          <span>Create your first agency to get started</span>
        </div>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Agency Code</th>
                <th>Agency Name</th>
                <th>Type</th>
                <th>Contact Person</th>
                <th>Cases</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {agencies.map((agency) => (
                <tr key={agency.id}>
                  <td className="cell-mono">{agency.agencyCode}</td>
                  <td>
                    <button
                      className="cell-link"
                      onClick={() => {
                        setViewingAgencyId(agency.id);
                        setShowViewModal(true);
                      }}
                    >
                      {agency.agencyName}
                    </button>
                  </td>
                  <td>{AgencyTypeLabels[agency.agencyType]}</td>
                  <td>
                    <div>{agency.contactPerson}</div>
                    <div className="cell-sub">{agency.contactEmail}</div>
                  </td>
                  <td>{agency.currentCaseCount || 0} / {agency.maxCaseLimit || '-'}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(agency.status)}`}>
                      {AgencyStatusLabels[agency.status]}
                    </span>
                  </td>
                  <td className="cell-actions">
                    <button
                      className="btn-action btn-action--view"
                      title="View Details"
                      onClick={() => {
                        setViewingAgencyId(agency.id);
                        setShowViewModal(true);
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </button>
                    <button
                      className="btn-action btn-action--view"
                      title="Edit"
                      onClick={() => {
                        setEditingAgency(agency);
                        setShowFormModal(true);
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    {agency.status === 'ACTIVE' ? (
                      <button
                        className="btn-action btn-action--warning"
                        title="Deactivate"
                        onClick={() => handleDeactivate(agency.id)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                          <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    ) : agency.status === 'APPROVED' || agency.status === 'INACTIVE' ? (
                      <button
                        className="btn-action btn-action--success"
                        title="Activate"
                        onClick={() => handleActivate(agency.id)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    ) : null}
                    <button
                      className="btn-action btn-action--danger"
                      title="Delete"
                      onClick={() => handleDeleteAgency(agency.id)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M19 6V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination__btn"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span className="pagination__info">
                Page {page + 1} of {totalPages} ({totalElements} total)
              </span>
              <button
                className="pagination__btn"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </>
  );

  const renderPendingApprovalTab = () => (
    <>
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading pending approvals...</p>
        </div>
      ) : error ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p>Error loading data</p>
          <span>{error}</span>
          <button className="btn btn--primary btn--sm" style={{ marginTop: '16px' }} onClick={() => fetchPendingAgencies()}>
            Retry
          </button>
        </div>
      ) : pendingAgencies.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          </svg>
          <p>No pending approvals</p>
          <span>All agencies have been reviewed</span>
        </div>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Agency Code</th>
                <th>Agency Name</th>
                <th>Type</th>
                <th>Contact Person</th>
                <th>Contact Email</th>
                <th>Submitted On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingAgencies.map((agency) => (
                <tr key={agency.id}>
                  <td className="cell-mono">{agency.agencyCode}</td>
                  <td>{agency.agencyName}</td>
                  <td>{AgencyTypeLabels[agency.agencyType]}</td>
                  <td>{agency.contactPerson}</td>
                  <td>{agency.contactEmail}</td>
                  <td>{formatDate(agency.createdAt)}</td>
                  <td className="cell-actions">
                    <button
                      className="btn btn--sm btn--primary"
                      onClick={() => {
                        setReviewingAgencyId(agency.id);
                        setShowApprovalModal(true);
                      }}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination__btn"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span className="pagination__info">
                Page {page + 1} of {totalPages} ({totalElements} total)
              </span>
              <button
                className="pagination__btn"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </>
  );

  const renderAgencyCasesTab = () => (
    <>
      <div className="tab-toolbar">
        <div className="agency-selector">
          <label>Select Agency:</label>
          <select
            className="filter-select"
            value={selectedAgencyId || ''}
            onChange={(e) => {
              setSelectedAgencyId(parseInt(e.target.value) || null);
              setPage(0);
            }}
          >
            <option value="">-- Select Agency --</option>
            {agencies.map((agency) => (
              <option key={agency.id} value={agency.id}>
                {agency.agencyName} ({agency.agencyCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedAgencyId ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p>Select an agency</p>
          <span>Choose an agency to view its case allocations</span>
        </div>
      ) : loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading case allocations...</p>
        </div>
      ) : caseAllocations.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M2 10H22" stroke="currentColor" strokeWidth="2" />
          </svg>
          <p>No case allocations</p>
          <span>No cases have been allocated to this agency</span>
        </div>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>External Case ID</th>
                <th>Assigned Agent</th>
                <th>Status</th>
                <th>Allocated On</th>
                <th>Batch ID</th>
              </tr>
            </thead>
            <tbody>
              {caseAllocations.map((allocation) => (
                <tr key={allocation.id}>
                  <td className="cell-mono">{allocation.caseId}</td>
                  <td className="cell-mono">{allocation.externalCaseId || '-'}</td>
                  <td>{allocation.agentId ? `Agent #${allocation.agentId}` : '-'}</td>
                  <td>
                    <span className={`badge ${allocation.allocationStatus === 'ASSIGNED' ? 'badge--success' : allocation.allocationStatus === 'ALLOCATED' ? 'badge--info' : 'badge--default'}`}>
                      {allocation.allocationStatus}
                    </span>
                  </td>
                  <td>{formatDate(allocation.allocatedAt)}</td>
                  <td className="cell-mono">{allocation.batchId || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination__btn"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span className="pagination__info">
                Page {page + 1} of {totalPages} ({totalElements} total)
              </span>
              <button
                className="pagination__btn"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </>
  );

  const renderCaseAssignmentTab = () => (
    <>
      <div className="tab-toolbar">
        <div className="selection-info">
          {selectedCases.length > 0 && (
            <span>{selectedCases.length} case(s) selected</span>
          )}
        </div>
        <button
          className="btn btn--primary"
          disabled={selectedCases.length === 0}
          onClick={() => setShowAssignmentModal(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
            <path d="M20 8V14M17 11H23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Assign to Agent
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading unassigned cases...</p>
        </div>
      ) : unassignedCases.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          </svg>
          <p>No unassigned cases</p>
          <span>All cases have been assigned to agents</span>
        </div>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedCases.length === unassignedCases.length}
                    onChange={selectAllCases}
                  />
                </th>
                <th>Case ID</th>
                <th>External Case ID</th>
                <th>Agency ID</th>
                <th>Status</th>
                <th>Allocated On</th>
              </tr>
            </thead>
            <tbody>
              {unassignedCases.map((allocation) => (
                <tr key={allocation.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedCases.some((c) => c.id === allocation.id)}
                      onChange={() => toggleCaseSelection(allocation)}
                    />
                  </td>
                  <td className="cell-mono">{allocation.caseId}</td>
                  <td className="cell-mono">{allocation.externalCaseId || '-'}</td>
                  <td>{allocation.agencyId}</td>
                  <td>
                    <span className="badge badge--info">{allocation.allocationStatus}</span>
                  </td>
                  <td>{formatDate(allocation.allocatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination__btn"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span className="pagination__info">
                Page {page + 1} of {totalPages} ({totalElements} total)
              </span>
              <button
                className="pagination__btn"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </>
  );

  return (
    <div className="agency-management-page">
      <div className="page-header">
        <h1 className="page-title">Agency Management</h1>
        <p className="page-subtitle">Manage agencies, approvals, and case assignments</p>
      </div>

      <div className="tabs">
        <div className="tabs__header">
          <button
            className={`tab-button ${activeTab === 'agencies' ? 'tab-button--active' : ''}`}
            onClick={() => setActiveTab('agencies')}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 21V5C19 3.89543 18.1046 3 17 3H7C5.89543 3 5 3.89543 5 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 7H10M9 11H10M14 7H15M14 11H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Agencies
          </button>
          <button
            className={`tab-button ${activeTab === 'pending-approval' ? 'tab-button--active' : ''}`}
            onClick={() => setActiveTab('pending-approval')}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Pending Approval
          </button>
          <button
            className={`tab-button ${activeTab === 'agency-cases' ? 'tab-button--active' : ''}`}
            onClick={() => setActiveTab('agency-cases')}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M2 10H22" stroke="currentColor" strokeWidth="2" />
            </svg>
            Agency Cases
          </button>
          <button
            className={`tab-button ${activeTab === 'case-assignment' ? 'tab-button--active' : ''}`}
            onClick={() => setActiveTab('case-assignment')}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
              <path d="M20 8V14M17 11H23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Case Assignment
          </button>
        </div>

        <div className="tabs__content">
          {activeTab === 'agencies' && renderAgenciesTab()}
          {activeTab === 'pending-approval' && renderPendingApprovalTab()}
          {activeTab === 'agency-cases' && renderAgencyCasesTab()}
          {activeTab === 'case-assignment' && renderCaseAssignmentTab()}
        </div>
      </div>

      {/* Modals */}
      <AgencyFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingAgency(null);
        }}
        onSubmit={editingAgency ? handleUpdateAgency : handleCreateAgency}
        agency={editingAgency}
        loading={modalLoading}
      />

      <ApprovalModal
        isOpen={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false);
          setReviewingAgencyId(null);
        }}
        agencyId={reviewingAgencyId}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={modalLoading}
      />

      <CaseAssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => {
          setShowAssignmentModal(false);
          setSelectedCases([]);
        }}
        selectedCases={selectedCases}
        agents={agents}
        onAssign={handleAssignCases}
        loading={modalLoading}
      />

      <ViewAgencyModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setViewingAgencyId(null);
        }}
        agencyId={viewingAgencyId}
      />
    </div>
  );
}

export default AgencyManagementPage;
