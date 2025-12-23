/**
 * Workflow Case Detail Page
 * Case detail page with tabs for loan details, customer info, repayments, etc.
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workflowService } from '@services/api/workflow.service';
import { repaymentService } from '@services/api/repayment.service';
import type {
  WorkflowCaseDetail,
  WorkflowLoanDetails,
  WorkflowCustomerDetails,
  WorkflowRepayment,
  WorkflowPTP,
  WorkflowNotice,
  WorkflowCallLog,
  WorkflowSmsHistory,
  WorkflowWhatsAppHistory,
  WorkflowEmailHistory,
  WorkflowDocument,
  WorkflowTabType,
  CaseSummaryDTO,
} from '@types';
import { getDpdBadgeColor } from '@types';
import { ROUTES } from '@config/constants';
import './WorkflowCaseDetailPage.css';

export function WorkflowCaseDetailPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<WorkflowTabType>('loan-details');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<CaseSummaryDTO | null>(null);
  const [caseDetail, setCaseDetail] = useState<WorkflowCaseDetail | null>(null);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  const paymentDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (paymentDropdownRef.current && !paymentDropdownRef.current.contains(event.target as Node)) {
        setShowPaymentDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (caseId) {
      fetchCaseData(parseInt(caseId));
    }
  }, [caseId]);

  const fetchCaseData = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const [summaryData, detailData] = await Promise.all([
        workflowService.getCaseSummary(id),
        workflowService.getCaseDetails(id),
      ]);
      setSummary(summaryData);
      setCaseDetail(detailData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch case details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(ROUTES.WORKFLOW);
  };

  const getPaymentParams = () => {
    const params = new URLSearchParams();
    if (caseId) params.set('caseId', caseId);
    if (summary?.loanAccountNumber) params.set('loanAccountNumber', summary.loanAccountNumber);
    if (summary?.customerName) params.set('customerName', summary.customerName);
    return params.toString();
  };

  const handleDigitalPayment = () => {
    setShowPaymentDropdown(false);
    navigate(`${ROUTES.REPAYMENT_DIGITAL_PAYMENT}?${getPaymentParams()}`);
  };

  const handleRecordPayment = () => {
    setShowPaymentDropdown(false);
    navigate(`${ROUTES.REPAYMENT_RECORD_PAYMENT}?${getPaymentParams()}`);
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

  const formatDateTime = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number | undefined): string => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
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

  const tabs: { id: WorkflowTabType; label: string; icon: JSX.Element }[] = [
    {
      id: 'loan-details',
      label: 'Loan Details',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 1V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'customer-details',
      label: 'Customer',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
    {
      id: 'repayments',
      label: 'Repayments',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M2 10H22" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
    {
      id: 'ptps',
      label: 'PTP',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
    {
      id: 'notices',
      label: 'Notices',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'calls',
      label: 'Calls',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7294C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6408 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.17999C2.09501 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 1.99999H7.10999C7.5953 1.9952 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04207 3.23945 9.10999 3.71999C9.23662 4.68006 9.47144 5.62273 9.80999 6.52999C9.94454 6.88792 9.97366 7.27691 9.8939 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.63999L8.08999 9.90999C9.51355 12.4135 11.5765 14.4765 14.08 15.9L15.35 14.63C15.6219 14.3611 15.9651 14.1759 16.3391 14.0961C16.7131 14.0163 17.1021 14.0454 17.46 14.18C18.3673 14.5185 19.3099 14.7534 20.27 14.88C20.7558 14.9485 21.1996 15.1926 21.5177 15.5668C21.8357 15.941 22.0057 16.4179 22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'sms',
      label: 'SMS',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'emails',
      label: 'Emails',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  const renderLoanDetails = (loan: WorkflowLoanDetails) => (
    <div className="tab-content">
      <div className="detail-grid">
        {/* Account Identification */}
        <div className="detail-section">
          <h3 className="detail-section__title">Account Information</h3>
          <div className="detail-grid__items">
            <div className="detail-item">
              <span className="detail-item__label">Loan Account Number</span>
              <span className="detail-item__value">{loan.loanAccountNumber || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Lender</span>
              <span className="detail-item__value">{loan.lender || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Co-Lender</span>
              <span className="detail-item__value">{loan.coLender || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Product Type</span>
              <span className="detail-item__value">{loan.productType || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Scheme Code</span>
              <span className="detail-item__value">{loan.schemeCode || '-'}</span>
            </div>
          </div>
        </div>

        {/* Amounts */}
        <div className="detail-section">
          <h3 className="detail-section__title">Outstanding Amounts</h3>
          <div className="detail-grid__items">
            <div className="detail-item">
              <span className="detail-item__label">Loan Amount</span>
              <span className="detail-item__value">{formatCurrency(loan.loanAmount)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Total Outstanding</span>
              <span className="detail-item__value detail-item__value--highlight">{formatCurrency(loan.totalOutstanding)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Principal Outstanding (POS)</span>
              <span className="detail-item__value">{formatCurrency(loan.pos)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">EMI Amount</span>
              <span className="detail-item__value">{formatCurrency(loan.emiAmount)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Penalty Amount</span>
              <span className="detail-item__value">{formatCurrency(loan.penaltyAmount)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Charges</span>
              <span className="detail-item__value">{formatCurrency(loan.charges)}</span>
            </div>
          </div>
        </div>

        {/* Overdue Breakdown */}
        <div className="detail-section">
          <h3 className="detail-section__title">Overdue Breakdown</h3>
          <div className="detail-grid__items">
            <div className="detail-item">
              <span className="detail-item__label">Principal Overdue</span>
              <span className="detail-item__value detail-item__value--danger">{formatCurrency(loan.principalOverdue)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Interest Overdue</span>
              <span className="detail-item__value detail-item__value--danger">{formatCurrency(loan.interestOverdue)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Fees Overdue</span>
              <span className="detail-item__value detail-item__value--danger">{formatCurrency(loan.feesOverdue)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Penalty Overdue</span>
              <span className="detail-item__value detail-item__value--danger">{formatCurrency(loan.penaltyOverdue)}</span>
            </div>
          </div>
        </div>

        {/* DPD & Bucket */}
        <div className="detail-section">
          <h3 className="detail-section__title">DPD & Bucket</h3>
          <div className="detail-grid__items">
            <div className="detail-item">
              <span className="detail-item__label">DPD</span>
              <span className={`badge ${getDpdBadgeClass(loan.dpd || 0)}`}>{loan.dpd || 0} days</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Bucket</span>
              <span className="detail-item__value">{loan.bucket || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Risk Bucket</span>
              <span className="detail-item__value">{loan.riskBucket || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">ROI</span>
              <span className="detail-item__value">{loan.roi ? `${loan.roi}%` : '-'}</span>
            </div>
          </div>
        </div>

        {/* EMI Details */}
        <div className="detail-section">
          <h3 className="detail-section__title">EMI Details</h3>
          <div className="detail-grid__items">
            <div className="detail-item">
              <span className="detail-item__label">EMI Start Date</span>
              <span className="detail-item__value">{formatDate(loan.emiStartDate)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">No. of Paid EMI</span>
              <span className="detail-item__value">{loan.noOfPaidEmi ?? '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">No. of Pending EMI</span>
              <span className="detail-item__value">{loan.noOfPendingEmi ?? '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Next EMI Date</span>
              <span className="detail-item__value">{formatDate(loan.nextEmiDate)}</span>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="detail-section">
          <h3 className="detail-section__title">Important Dates</h3>
          <div className="detail-grid__items">
            <div className="detail-item">
              <span className="detail-item__label">Disbursement Date</span>
              <span className="detail-item__value">{formatDate(loan.loanDisbursementDate)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Maturity Date</span>
              <span className="detail-item__value">{formatDate(loan.loanMaturityDate)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Due Date</span>
              <span className="detail-item__value">{formatDate(loan.dueDate)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Last Payment Date</span>
              <span className="detail-item__value">{formatDate(loan.lastPaymentDate)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Last Payment Amount</span>
              <span className="detail-item__value">{formatCurrency(loan.lastPaidAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCustomerDetails = (customer: WorkflowCustomerDetails) => (
    <div className="tab-content">
      <div className="detail-grid">
        {/* Basic Info */}
        <div className="detail-section">
          <h3 className="detail-section__title">Basic Information</h3>
          <div className="detail-grid__items">
            <div className="detail-item">
              <span className="detail-item__label">Customer ID</span>
              <span className="detail-item__value">{customer.customerId || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Customer Code</span>
              <span className="detail-item__value">{customer.customerCode || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Full Name</span>
              <span className="detail-item__value">{customer.fullName || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Language Preference</span>
              <span className="detail-item__value">{customer.languagePreference || '-'}</span>
            </div>
          </div>
        </div>

        {/* Contact Numbers */}
        <div className="detail-section">
          <h3 className="detail-section__title">Contact Numbers</h3>
          <div className="detail-grid__items">
            <div className="detail-item">
              <span className="detail-item__label">Mobile Number</span>
              <span className="detail-item__value detail-item__value--phone">{customer.mobileNumber || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Secondary Mobile</span>
              <span className="detail-item__value">{customer.secondaryMobileNumber || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Residence Phone</span>
              <span className="detail-item__value">{customer.resiPhone || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Email</span>
              <span className="detail-item__value">{customer.email || '-'}</span>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="detail-section">
          <h3 className="detail-section__title">Address</h3>
          <div className="detail-grid__items">
            <div className="detail-item detail-item--full">
              <span className="detail-item__label">Primary Address</span>
              <span className="detail-item__value">{customer.primaryAddress || '-'}</span>
            </div>
            <div className="detail-item detail-item--full">
              <span className="detail-item__label">Secondary Address</span>
              <span className="detail-item__value">{customer.secondaryAddress || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">City</span>
              <span className="detail-item__value">{customer.city || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">State</span>
              <span className="detail-item__value">{customer.state || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Pincode</span>
              <span className="detail-item__value">{customer.pincode || '-'}</span>
            </div>
          </div>
        </div>

        {/* Family & Employment */}
        <div className="detail-section">
          <h3 className="detail-section__title">Family & Employment</h3>
          <div className="detail-grid__items">
            <div className="detail-item">
              <span className="detail-item__label">Father/Spouse Name</span>
              <span className="detail-item__value">{customer.fatherSpouseName || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Employer/Business</span>
              <span className="detail-item__value">{customer.employerOrBusinessEntity || '-'}</span>
            </div>
          </div>
        </div>

        {/* References */}
        <div className="detail-section">
          <h3 className="detail-section__title">References</h3>
          <div className="detail-grid__items">
            <div className="detail-item">
              <span className="detail-item__label">Reference 1 Name</span>
              <span className="detail-item__value">{customer.reference1Name || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Reference 1 Number</span>
              <span className="detail-item__value">{customer.reference1Number || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Reference 2 Name</span>
              <span className="detail-item__value">{customer.reference2Name || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Reference 2 Number</span>
              <span className="detail-item__value">{customer.reference2Number || '-'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const handleViewReceipt = (repaymentId: number) => {
    navigate(`/repayment/receipt/${repaymentId}`);
  };

  const handleDownloadReceipt = async (repaymentId: number) => {
    try {
      const blob = await repaymentService.downloadReceipt(repaymentId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${repaymentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading receipt:', err);
      alert('Failed to download receipt. Please try again.');
    }
  };

  const renderRepayments = (repayments: WorkflowRepayment[]) => (
    <div className="tab-content">
      {repayments.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M2 10H22" stroke="currentColor" strokeWidth="2" />
          </svg>
          <p>No repayments found</p>
          <span>No repayment history available for this case</span>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Repayment #</th>
              <th>Amount</th>
              <th>Mode</th>
              <th>Date</th>
              <th>Status</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {repayments.map((r) => (
              <tr key={r.id}>
                <td className="cell-mono">{r.repaymentNumber}</td>
                <td className="cell-amount">{formatCurrency(r.amount)}</td>
                <td>{r.paymentMode}</td>
                <td>{formatDate(r.paymentDate)}</td>
                <td>
                  <span className={`badge ${r.status === 'APPROVED' ? 'badge--success' : r.status === 'PENDING' ? 'badge--warning' : 'badge--default'}`}>
                    {r.status}
                  </span>
                </td>
                <td className="cell-actions">
                  <button
                    className="btn-action btn-action--view"
                    onClick={() => handleViewReceipt(r.id)}
                    title="View Receipt"
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </button>
                  <button
                    className="btn-action btn-action--download"
                    onClick={() => handleDownloadReceipt(r.id)}
                    title="Download Receipt"
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderPtps = (ptps: WorkflowPTP[]) => (
    <div className="tab-content">
      {ptps.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          </svg>
          <p>No PTP history found</p>
          <span>No promise to pay records available for this case</span>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>PTP Date</th>
              <th>Amount</th>
              <th>Commitment Date</th>
              <th>Status</th>
              <th>Received Amount</th>
              <th>Received Date</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {ptps.map((ptp) => (
              <tr key={ptp.id}>
                <td>{formatDate(ptp.ptpDate)}</td>
                <td className="cell-amount">{formatCurrency(ptp.ptpAmount)}</td>
                <td>{formatDate(ptp.commitmentDate)}</td>
                <td>
                  <span className={`badge ${ptp.ptpStatus === 'KEPT' ? 'badge--success' : ptp.ptpStatus === 'BROKEN' ? 'badge--danger' : 'badge--warning'}`}>
                    {ptp.ptpStatus || '-'}
                  </span>
                </td>
                <td className="cell-amount">{formatCurrency(ptp.paymentReceivedAmount)}</td>
                <td>{formatDate(ptp.paymentReceivedDate)}</td>
                <td>{ptp.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderNotices = (notices: WorkflowNotice[]) => (
    <div className="tab-content">
      {notices.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p>No notices found</p>
          <span>No notices have been sent for this case</span>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Notice #</th>
              <th>Type</th>
              <th>Status</th>
              <th>Sent Date</th>
              <th>Delivered Date</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {notices.map((notice) => (
              <tr key={notice.id}>
                <td className="cell-mono">{notice.noticeNumber}</td>
                <td>{notice.noticeType}</td>
                <td>
                  <span className={`badge ${notice.status === 'DELIVERED' ? 'badge--success' : notice.status === 'SENT' ? 'badge--info' : 'badge--warning'}`}>
                    {notice.status}
                  </span>
                </td>
                <td>{formatDate(notice.sentDate)}</td>
                <td>{formatDate(notice.deliveredDate)}</td>
                <td>{formatDateTime(notice.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderCallLogs = (calls: WorkflowCallLog[]) => (
    <div className="tab-content">
      {calls.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7294C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6408 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.17999C2.09501 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 1.99999H7.10999C7.5953 1.9952 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04207 3.23945 9.10999 3.71999C9.23662 4.68006 9.47144 5.62273 9.80999 6.52999C9.94454 6.88792 9.97366 7.27691 9.8939 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.63999L8.08999 9.90999C9.51355 12.4135 11.5765 14.4765 14.08 15.9L15.35 14.63C15.6219 14.3611 15.9651 14.1759 16.3391 14.0961C16.7131 14.0163 17.1021 14.0454 17.46 14.18C18.3673 14.5185 19.3099 14.7534 20.27 14.88C20.7558 14.9485 21.1996 15.1926 21.5177 15.5668C21.8357 15.941 22.0057 16.4179 22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p>No call logs found</p>
          <span>No call history available for this case</span>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Called Number</th>
              <th>Type</th>
              <th>Status</th>
              <th>Duration</th>
              <th>Start Time</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => (
              <tr key={call.id}>
                <td className="cell-mono">{call.calledNumber || '-'}</td>
                <td>{call.callType || '-'}</td>
                <td>
                  <span className={`badge ${call.callStatus === 'CONNECTED' ? 'badge--success' : call.callStatus === 'MISSED' ? 'badge--danger' : 'badge--warning'}`}>
                    {call.callStatus || '-'}
                  </span>
                </td>
                <td>{formatDuration(call.duration)}</td>
                <td>{formatDateTime(call.startTime)}</td>
                <td>{call.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderSmsHistory = (smsHistory: WorkflowSmsHistory[]) => (
    <div className="tab-content">
      {smsHistory.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p>No SMS history found</p>
          <span>No SMS messages have been sent for this case</span>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Phone Number</th>
              <th>Message</th>
              <th>Status</th>
              <th>Sent At</th>
              <th>Delivered At</th>
            </tr>
          </thead>
          <tbody>
            {smsHistory.map((sms) => (
              <tr key={sms.id}>
                <td className="cell-mono">{sms.phoneNumber || '-'}</td>
                <td className="cell-message">{sms.message || '-'}</td>
                <td>
                  <span className={`badge ${sms.status === 'DELIVERED' ? 'badge--success' : sms.status === 'SENT' ? 'badge--info' : 'badge--warning'}`}>
                    {sms.status || '-'}
                  </span>
                </td>
                <td>{formatDateTime(sms.sentAt)}</td>
                <td>{formatDateTime(sms.deliveredAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderWhatsAppHistory = (whatsappHistory: WorkflowWhatsAppHistory[]) => (
    <div className="tab-content">
      {whatsappHistory.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p>No WhatsApp history found</p>
          <span>No WhatsApp messages have been sent for this case</span>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Phone Number</th>
              <th>Message</th>
              <th>Type</th>
              <th>Status</th>
              <th>Sent At</th>
              <th>Delivered At</th>
              <th>Read At</th>
            </tr>
          </thead>
          <tbody>
            {whatsappHistory.map((wa) => (
              <tr key={wa.id}>
                <td className="cell-mono">{wa.phoneNumber || '-'}</td>
                <td className="cell-message">{wa.message || wa.templateName || '-'}</td>
                <td>{wa.messageType || '-'}</td>
                <td>
                  <span className={`badge ${wa.status === 'READ' ? 'badge--success' : wa.status === 'DELIVERED' ? 'badge--info' : wa.status === 'SENT' ? 'badge--warning' : 'badge--default'}`}>
                    {wa.status || '-'}
                  </span>
                </td>
                <td>{formatDateTime(wa.sentAt)}</td>
                <td>{formatDateTime(wa.deliveredAt)}</td>
                <td>{formatDateTime(wa.readAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderEmailHistory = (emails: WorkflowEmailHistory[]) => (
    <div className="tab-content">
      {emails.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p>No email history found</p>
          <span>No emails have been sent for this case</span>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>To Email</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Sent At</th>
              <th>Delivered At</th>
            </tr>
          </thead>
          <tbody>
            {emails.map((email) => (
              <tr key={email.id}>
                <td>{email.toEmail || '-'}</td>
                <td>{email.subject || '-'}</td>
                <td>
                  <span className={`badge ${email.status === 'DELIVERED' ? 'badge--success' : email.status === 'SENT' ? 'badge--info' : 'badge--warning'}`}>
                    {email.status || '-'}
                  </span>
                </td>
                <td>{formatDateTime(email.sentAt)}</td>
                <td>{formatDateTime(email.deliveredAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderDocuments = (documents: WorkflowDocument[]) => (
    <div className="tab-content">
      {documents.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p>No documents found</p>
          <span>No documents have been uploaded for this case</span>
        </div>
      ) : (
        <div className="documents-grid">
          {documents.map((doc) => (
            <div key={doc.id} className="document-card">
              <div className="document-card__icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="document-card__info">
                <span className="document-card__name">{doc.documentName}</span>
                <span className="document-card__meta">
                  {doc.documentType || 'Document'} • {doc.fileSize ? `${Math.round(doc.fileSize / 1024)} KB` : '-'}
                </span>
                <span className="document-card__date">Uploaded {formatDate(doc.uploadedAt)}</span>
              </div>
              {doc.downloadUrl && (
                <a href={doc.downloadUrl} className="document-card__download" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    if (!caseDetail) return null;

    switch (activeTab) {
      case 'loan-details':
        return renderLoanDetails(caseDetail.loanDetails || {});
      case 'customer-details':
        return renderCustomerDetails(caseDetail.customerDetails || {});
      case 'repayments':
        return renderRepayments(caseDetail.repayments || []);
      case 'ptps':
        return renderPtps(caseDetail.ptps || []);
      case 'notices':
        return renderNotices(caseDetail.notices || []);
      case 'calls':
        return renderCallLogs(caseDetail.callLogs || []);
      case 'sms':
        return renderSmsHistory(caseDetail.smsHistory || []);
      case 'whatsapp':
        return renderWhatsAppHistory(caseDetail.whatsappHistory || []);
      case 'emails':
        return renderEmailHistory(caseDetail.emailHistory || []);
      case 'documents':
        return renderDocuments(caseDetail.documents || []);
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="workflow-case-detail-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading case details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="workflow-case-detail-page">
        <div className="error-container">
          <p>{error}</p>
          <button className="btn-secondary" onClick={handleBack}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="workflow-case-detail-page">
      {/* Header */}
      <div className="case-detail-header">
        <button className="btn-back" onClick={handleBack}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <div className="case-detail-header__content">
          <h1 className="case-detail-title">
            Case: {summary?.caseNumber || caseId}
          </h1>
          <p className="case-detail-subtitle">
            {summary?.customerName} • {summary?.loanAccountNumber}
          </p>
        </div>
        <div className="collect-payment-dropdown" ref={paymentDropdownRef}>
          <button
            className="btn-collect-payment"
            onClick={() => setShowPaymentDropdown(!showPaymentDropdown)}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M2 10H22" stroke="currentColor" strokeWidth="2" />
              <path d="M6 16H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Collect Payment
            <svg className={`dropdown-arrow ${showPaymentDropdown ? 'dropdown-arrow--open' : ''}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {showPaymentDropdown && (
            <div className="payment-dropdown-menu">
              <button className="payment-dropdown-item" onClick={handleDigitalPayment}>
                <div className="payment-dropdown-item__icon payment-dropdown-item__icon--digital">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M7 15H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M14 15H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M2 10H22" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <div className="payment-dropdown-item__content">
                  <span className="payment-dropdown-item__title">Digital Payment</span>
                  <span className="payment-dropdown-item__desc">UPI, QR Code, Payment Link</span>
                </div>
              </button>
              <button className="payment-dropdown-item" onClick={handleRecordPayment}>
                <div className="payment-dropdown-item__icon payment-dropdown-item__icon--cash">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                    <path d="M6 12H6.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M18 12H18.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="payment-dropdown-item__content">
                  <span className="payment-dropdown-item__title">Record Payment</span>
                  <span className="payment-dropdown-item__desc">Cash or Cheque</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {(summary || caseDetail) && (
        <div className="summary-cards">
          <div className="summary-card">
            <span className="summary-card__label">DPD</span>
            <span className={`badge badge--large ${getDpdBadgeClass(caseDetail?.loanDetails?.dpd || summary?.dpd || 0)}`}>
              {caseDetail?.loanDetails?.dpd || summary?.dpd || 0} days
            </span>
          </div>
          <div className="summary-card">
            <span className="summary-card__label">Total Outstanding</span>
            <span className="summary-card__value summary-card__value--amount">
              {formatCurrency(caseDetail?.loanDetails?.totalOutstanding || summary?.totalOutstanding)}
            </span>
          </div>
          <div className="summary-card">
            <span className="summary-card__label">Overdue Amount</span>
            <span className="summary-card__value summary-card__value--overdue">
              {formatCurrency(
                (caseDetail?.loanDetails?.principalOverdue || 0) +
                (caseDetail?.loanDetails?.interestOverdue || 0) +
                (caseDetail?.loanDetails?.feesOverdue || 0) +
                (caseDetail?.loanDetails?.penaltyOverdue || 0) ||
                summary?.overdueAmount
              )}
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="case-detail-tabs">
        <div className="tabs-header">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'tab-button--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-button__icon">{tab.icon}</span>
              <span className="tab-button__label">{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="tabs-content">{renderTabContent()}</div>
      </div>
    </div>
  );
}

export default WorkflowCaseDetailPage;
