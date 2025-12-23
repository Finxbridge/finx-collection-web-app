/**
 * Receipt View Page
 * Displays repayment receipt details
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { repaymentService } from '@services/api/repayment.service';
import type { Repayment } from '@types';
import './ReceiptViewPage.css';

export function ReceiptViewPage() {
  const { repaymentId } = useParams<{ repaymentId: string }>();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<Repayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (repaymentId) {
      fetchReceipt(parseInt(repaymentId));
    }
  }, [repaymentId]);

  const fetchReceipt = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await repaymentService.getById(id);
      setReceipt(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch receipt details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleDownload = async () => {
    if (!repaymentId) return;

    try {
      setDownloading(true);
      const blob = await repaymentService.downloadReceipt(parseInt(repaymentId));
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${receipt?.repaymentNumber || repaymentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading receipt:', err);
      alert('Failed to download receipt. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const formatCurrency = (amount: number | undefined): string => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string | undefined | null): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeClass = (status: string | undefined): string => {
    switch (status) {
      case 'APPROVED':
        return 'badge--success';
      case 'PENDING':
        return 'badge--warning';
      case 'REJECTED':
        return 'badge--danger';
      default:
        return 'badge--default';
    }
  };

  if (loading) {
    return (
      <div className="receipt-view-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading receipt details...</p>
        </div>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="receipt-view-page">
        <div className="error-container">
          <p>{error || 'Receipt not found'}</p>
          <button className="btn-secondary" onClick={handleBack}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="receipt-view-page">
      {/* Header */}
      <div className="receipt-header">
        <button className="btn-back" onClick={handleBack}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <div className="receipt-header__content">
          <h1 className="receipt-title">Payment Receipt</h1>
          <p className="receipt-subtitle">{receipt.repaymentNumber}</p>
        </div>
        <button
          className="btn-download"
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? (
            <>
              <div className="btn-spinner"></div>
              Downloading...
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Download Receipt
            </>
          )}
        </button>
      </div>

      {/* Receipt Card */}
      <div className="receipt-card">
        {/* Receipt Header */}
        <div className="receipt-card__header">
          <div className="receipt-logo">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 1V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="receipt-card__title">
            <h2>Payment Receipt</h2>
            <span className={`badge ${getStatusBadgeClass(receipt.approvalStatus || receipt.status)}`}>
              {receipt.approvalStatus || receipt.status}
            </span>
          </div>
          <div className="receipt-card__number">
            <span>Receipt No.</span>
            <strong>{receipt.repaymentNumber}</strong>
          </div>
        </div>

        {/* Amount Section */}
        <div className="receipt-amount-section">
          <div className="receipt-amount">
            <span className="receipt-amount__label">Payment Amount</span>
            <span className="receipt-amount__value">{formatCurrency(receipt.paymentAmount)}</span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="receipt-details">
          <div className="receipt-details__section">
            <h3>Payment Information</h3>
            <div className="receipt-details__grid">
              <div className="receipt-detail-item">
                <span className="receipt-detail-item__label">Payment Date</span>
                <span className="receipt-detail-item__value">{formatDate(receipt.paymentDate)}</span>
              </div>
              <div className="receipt-detail-item">
                <span className="receipt-detail-item__label">Payment Mode</span>
                <span className="receipt-detail-item__value">{receipt.paymentMode}</span>
              </div>
              <div className="receipt-detail-item">
                <span className="receipt-detail-item__label">Case ID</span>
                <span className="receipt-detail-item__value">{receipt.caseId}</span>
              </div>
              {receipt.caseNumber && (
                <div className="receipt-detail-item">
                  <span className="receipt-detail-item__label">Case Number</span>
                  <span className="receipt-detail-item__value">{receipt.caseNumber}</span>
                </div>
              )}
              {receipt.customerName && (
                <div className="receipt-detail-item">
                  <span className="receipt-detail-item__label">Customer Name</span>
                  <span className="receipt-detail-item__value">{receipt.customerName}</span>
                </div>
              )}
              {receipt.collectionLocation && (
                <div className="receipt-detail-item">
                  <span className="receipt-detail-item__label">Collection Location</span>
                  <span className="receipt-detail-item__value">{receipt.collectionLocation}</span>
                </div>
              )}
            </div>
          </div>

          <div className="receipt-details__section">
            <h3>Approval Details</h3>
            <div className="receipt-details__grid">
              <div className="receipt-detail-item">
                <span className="receipt-detail-item__label">Approval Status</span>
                <span className={`badge ${getStatusBadgeClass(receipt.approvalStatus)}`}>
                  {receipt.approvalStatus}
                </span>
              </div>
              <div className="receipt-detail-item">
                <span className="receipt-detail-item__label">Approval Level</span>
                <span className="receipt-detail-item__value">Level {receipt.currentApprovalLevel}</span>
              </div>
              {receipt.approverName && (
                <div className="receipt-detail-item">
                  <span className="receipt-detail-item__label">Approved By</span>
                  <span className="receipt-detail-item__value">{receipt.approverName}</span>
                </div>
              )}
              {receipt.approvedAt && (
                <div className="receipt-detail-item">
                  <span className="receipt-detail-item__label">Approved At</span>
                  <span className="receipt-detail-item__value">{formatDateTime(receipt.approvedAt)}</span>
                </div>
              )}
              {receipt.rejectionReason && (
                <div className="receipt-detail-item receipt-detail-item--full">
                  <span className="receipt-detail-item__label">Rejection Reason</span>
                  <span className="receipt-detail-item__value receipt-detail-item__value--danger">
                    {receipt.rejectionReason}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="receipt-details__section">
            <h3>Additional Information</h3>
            <div className="receipt-details__grid">
              <div className="receipt-detail-item">
                <span className="receipt-detail-item__label">OTS Payment</span>
                <span className={`badge ${receipt.isOtsPayment ? 'badge--info' : 'badge--default'}`}>
                  {receipt.isOtsPayment ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="receipt-detail-item">
                <span className="receipt-detail-item__label">Created At</span>
                <span className="receipt-detail-item__value">{formatDateTime(receipt.createdAt)}</span>
              </div>
              {receipt.notes && (
                <div className="receipt-detail-item receipt-detail-item--full">
                  <span className="receipt-detail-item__label">Notes</span>
                  <span className="receipt-detail-item__value">{receipt.notes}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="receipt-card__footer">
          <p>This is a computer-generated receipt and does not require a signature.</p>
        </div>
      </div>
    </div>
  );
}

export default ReceiptViewPage;
