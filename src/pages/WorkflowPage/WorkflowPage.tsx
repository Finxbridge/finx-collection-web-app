/**
 * My Workflow Page
 * Case list page for collectors and agents
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workflowService } from '@services/api/workflow.service';
import type { WorkflowCaseListItem } from '@types';
import { WorkflowCaseStatusLabels, getDpdBadgeColor } from '@types';
import { ROUTES } from '@config/constants';
import './WorkflowPage.css';

export function WorkflowPage() {
  const navigate = useNavigate();
  const [cases, setCases] = useState<WorkflowCaseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const pageSize = 20;

  useEffect(() => {
    fetchCases();
  }, [page]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await workflowService.getCasesForWorkflow(page, pageSize);
      setCases(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cases');
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCase = (caseId: number) => {
    navigate(ROUTES.WORKFLOW_CASE_DETAIL.replace(':caseId', String(caseId)));
  };

  const formatCurrency = (amount: number | undefined): string => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'ALLOCATED':
        return 'badge--info';
      case 'UNALLOCATED':
        return 'badge--warning';
      case 'CLOSED':
        return 'badge--success';
      case 'PTP':
        return 'badge--primary';
      case 'BROKEN_PTP':
        return 'badge--danger';
      default:
        return 'badge--default';
    }
  };

  const getDpdBadgeClass = (dpd: number): string => {
    const color = getDpdBadgeColor(dpd);
    switch (color) {
      case 'success':
        return 'badge--success';
      case 'warning':
        return 'badge--warning';
      case 'orange':
        return 'badge--orange';
      case 'danger':
        return 'badge--danger';
      default:
        return 'badge--default';
    }
  };

  // Filter cases based on search and status
  const filteredCases = cases.filter((caseItem) => {
    const matchesSearch =
      !searchTerm ||
      caseItem.caseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.loanAccountNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.mobileNumber?.includes(searchTerm);
    const matchesStatus = !statusFilter || caseItem.caseStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="workflow-page">
      {/* Header */}
      <div className="workflow-header">
        <div className="workflow-header__content">
          <h1 className="workflow-title">My Workflow</h1>
          <p className="workflow-subtitle">
            Manage and work on your allocated cases
          </p>
        </div>
        <div className="workflow-header__stats">
          <div className="stat-card">
            <span className="stat-card__value">{totalElements}</span>
            <span className="stat-card__label">Total Cases</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="workflow-filters">
        <div className="filter-group">
          <div className="search-input-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              type="text"
              className="form-input search-input"
              placeholder="Search by case number, customer name, loan account..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="filter-group">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="ALLOCATED">Allocated</option>
            <option value="UNALLOCATED">Unallocated</option>
            <option value="PTP">PTP</option>
            <option value="BROKEN_PTP">Broken PTP</option>
            <option value="CLOSED">Closed</option>
          </select>
          <button className="btn-secondary" onClick={fetchCases}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert--error">
          <span>{error}</span>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* Cases Table */}
      <div className="table-card">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading cases...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p>No cases found</p>
            <span>Your workflow is empty or no cases match your filters</span>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="workflow-table">
                <thead>
                  <tr>
                    <th>Case Number</th>
                    <th>Customer</th>
                    <th>Loan Account</th>
                    <th>Lender</th>
                    <th>DPD</th>
                    <th>Outstanding</th>
                    <th>Overdue</th>
                    <th>Status</th>
                    <th>Last Event</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCases.map((caseItem) => (
                    <tr key={caseItem.caseId}>
                      <td>
                        <span
                          className="cell-link"
                          onClick={() => handleViewCase(caseItem.caseId)}
                        >
                          {caseItem.caseNumber}
                        </span>
                      </td>
                      <td>
                        <div className="customer-cell">
                          <span className="customer-name">{caseItem.customerName}</span>
                          {caseItem.mobileNumber && (
                            <span className="customer-phone">{caseItem.mobileNumber}</span>
                          )}
                        </div>
                      </td>
                      <td className="cell-mono">{caseItem.loanAccountNumber}</td>
                      <td>{caseItem.lender}</td>
                      <td>
                        <span className={`badge ${getDpdBadgeClass(caseItem.dpd)}`}>
                          {caseItem.dpd} days
                        </span>
                      </td>
                      <td className="cell-amount">{formatCurrency(caseItem.totalOutstanding)}</td>
                      <td className="cell-amount cell-amount--overdue">
                        {formatCurrency(caseItem.overdueAmount)}
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(caseItem.caseStatus)}`}>
                          {WorkflowCaseStatusLabels[caseItem.caseStatus] || caseItem.caseStatus}
                        </span>
                      </td>
                      <td>{formatDate(caseItem.lastEventDate)}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="btn-icon btn-icon--primary"
                            title="View Details"
                            onClick={() => handleViewCase(caseItem.caseId)}
                          >
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {page + 1} of {totalPages} ({totalElements} cases)
              </span>
              <button
                className="pagination-btn"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default WorkflowPage;
