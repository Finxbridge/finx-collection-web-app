/**
 * Master Data Management Page
 * List, create, edit, delete, and bulk upload master data
 */

import { useState, useEffect, useCallback } from 'react'
import { masterDataService } from '@services/api'
import { Table, Column } from '@components/common/Table'
import { Modal } from '@components/common/Modal'
import { Button } from '@components/common/Button'
import type { MasterData, MasterDataRequest, BulkUploadResult, BulkUploadError } from '@types'
import './MasterDataPage.css'

// Type for category configuration
interface CategoryConfig {
  code: string
  label: string
  description: string
}

// Default master data types - these can be extended by user
const DEFAULT_CATEGORIES: CategoryConfig[] = [
  { code: 'BANK', label: 'Bank', description: 'Bank master data for financial institutions' },
  { code: 'LANGUAGE', label: 'Language', description: 'Supported languages for communication' },
  { code: 'DPD', label: 'DPD', description: 'Days Past Due buckets for loan classification' },
]

export function MasterDataPage() {
  // View state - null means landing page, string means detail view
  const [selectedType, setSelectedType] = useState<string | null>(null)

  // Categories state
  const [categories, setCategories] = useState<CategoryConfig[]>(DEFAULT_CATEGORIES)

  const [masterData, setMasterData] = useState<MasterData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false)
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false)
  const [isAddAttributeModalOpen, setIsAddAttributeModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MasterData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Bulk upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null)

  // Form state for edit
  const [formData, setFormData] = useState<MasterDataRequest>({
    dataType: '',
    code: '',
    value: '',
    parentCode: null,
    displayOrder: 1,
    isActive: true,
    metadata: null,
  })
  const [metadataString, setMetadataString] = useState('')

  // Form state for add category
  const [newCategory, setNewCategory] = useState<CategoryConfig>({
    code: '',
    label: '',
    description: '',
  })

  // Form state for add attribute
  const [newAttribute, setNewAttribute] = useState<MasterDataRequest>({
    dataType: '',
    code: '',
    value: '',
    parentCode: null,
    displayOrder: 1,
    isActive: true,
    metadata: null,
  })

  // Fetch categories from API on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiCategories = await masterDataService.getCategories()
        if (apiCategories && apiCategories.length > 0) {
          // Merge API categories with defaults
          const mergedCategories = apiCategories.map(code => {
            const existing = DEFAULT_CATEGORIES.find(c => c.code === code)
            return existing || {
              code,
              label: code.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              description: `${code} master data`,
            }
          })
          setCategories(mergedCategories)
        }
      } catch {
        // If API fails, use default categories
        setCategories(DEFAULT_CATEGORIES)
      }
    }
    fetchCategories()
  }, [])

  const fetchMasterData = useCallback(async () => {
    if (!selectedType) return

    try {
      setIsLoading(true)
      setError('')
      const data = await masterDataService.getByType(selectedType)
      setMasterData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch master data')
      setMasterData([])
    } finally {
      setIsLoading(false)
    }
  }, [selectedType])

  useEffect(() => {
    if (selectedType) {
      fetchMasterData()
    }
  }, [selectedType, fetchMasterData])

  const handleTypeClick = (typeCode: string) => {
    setSelectedType(typeCode)
    setError('')
    setSuccessMessage('')
  }

  const handleBackToList = () => {
    setSelectedType(null)
    setMasterData([])
    setError('')
    setSuccessMessage('')
  }

  const handleEditClick = (item: MasterData) => {
    setSelectedItem(item)
    setFormData({
      dataType: item.dataType,
      code: item.code,
      value: item.value,
      parentCode: item.parentCode,
      displayOrder: item.displayOrder,
      isActive: item.isActive,
      metadata: item.metadata,
    })
    setMetadataString(item.metadata ? JSON.stringify(item.metadata, null, 2) : '')
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (item: MasterData) => {
    setSelectedItem(item)
    setIsDeleteModalOpen(true)
  }

  const handleUpdate = async () => {
    if (!selectedItem) return

    try {
      setIsSubmitting(true)
      setError('')

      // Parse metadata if provided
      let metadata: Record<string, unknown> | null = null
      if (metadataString.trim()) {
        try {
          metadata = JSON.parse(metadataString)
        } catch {
          setError('Invalid JSON format for metadata')
          return
        }
      }

      await masterDataService.update(selectedItem.id, {
        ...formData,
        metadata,
      })

      setIsEditModalOpen(false)
      setSuccessMessage('Master data updated successfully')
      fetchMasterData()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update master data')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedItem) return

    try {
      setIsSubmitting(true)
      setError('')
      await masterDataService.delete(selectedItem.id)
      setIsDeleteModalOpen(false)
      setSelectedItem(null)
      setSuccessMessage('Master data deleted successfully')
      fetchMasterData()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete master data')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.code || !newCategory.label) {
      setError('Code and Label are required')
      return
    }

    // Check if category already exists
    if (categories.some(c => c.code === newCategory.code.toUpperCase())) {
      setError('Category with this code already exists')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')

      const categoryToAdd: CategoryConfig = {
        code: newCategory.code.toUpperCase().replace(/\s+/g, '_'),
        label: newCategory.label,
        description: newCategory.description || `${newCategory.label} master data`,
      }

      // Add to local state
      setCategories(prev => [...prev, categoryToAdd])

      setIsAddCategoryModalOpen(false)
      setNewCategory({ code: '', label: '', description: '' })
      setSuccessMessage(`Category "${categoryToAdd.label}" added successfully`)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add category')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddAttribute = async () => {
    if (!newAttribute.code || !newAttribute.value) {
      setError('Code and Value are required')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')

      await masterDataService.create({
        dataType: selectedType!,
        code: newAttribute.code,
        value: newAttribute.value,
        displayOrder: newAttribute.displayOrder,
        isActive: newAttribute.isActive,
        parentCode: null,
        metadata: null,
      })

      setIsAddAttributeModalOpen(false)
      resetNewAttributeForm()
      setSuccessMessage('Attribute added successfully')
      fetchMasterData()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add attribute')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBulkUpload = async () => {
    if (!uploadFile) {
      setError('Please select a file to upload')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')
      setUploadResult(null)

      let result: BulkUploadResult
      if (selectedType) {
        // Inside a data type - use V1 (type as parameter)
        result = await masterDataService.bulkUploadV1(selectedType, uploadFile)
      } else {
        // Landing page - use V2 (type in CSV column)
        result = await masterDataService.bulkUploadV2(uploadFile)
      }

      setUploadResult(result)

      if (result.failureCount === 0) {
        setSuccessMessage(`Successfully uploaded ${result.successCount} records`)
        if (selectedType) {
          fetchMasterData()
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const blob = await masterDataService.downloadTemplate()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'master_data_template.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download template')
    }
  }

  const openBulkUploadModal = () => {
    setUploadFile(null)
    setUploadResult(null)
    setIsBulkUploadModalOpen(true)
  }

  const openAddAttributeModal = () => {
    resetNewAttributeForm()
    setIsAddAttributeModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      dataType: selectedType || '',
      code: '',
      value: '',
      parentCode: null,
      displayOrder: 1,
      isActive: true,
      metadata: null,
    })
    setMetadataString('')
    setSelectedItem(null)
  }

  const resetNewAttributeForm = () => {
    setNewAttribute({
      dataType: selectedType || '',
      code: '',
      value: '',
      parentCode: null,
      displayOrder: 1,
      isActive: true,
      metadata: null,
    })
  }

  const getTypeLabel = (code: string) => {
    const type = categories.find(t => t.code === code)
    return type?.label || code.replace(/_/g, ' ')
  }

  const columns: Column<MasterData>[] = [
    {
      key: 'code',
      header: 'Code',
      render: (item) => <span className="code-badge">{item.code}</span>,
    },
    {
      key: 'value',
      header: 'Value',
    },
    {
      key: 'parentCode',
      header: 'Parent Code',
      render: (item) => item.parentCode || '-',
    },
    {
      key: 'displayOrder',
      header: 'Order',
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (item) => (
        <span className={`status-badge status-badge--${item.isActive ? 'active' : 'inactive'}`}>
          {item.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Last Updated',
      render: (item) => new Date(item.updatedAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="table-actions">
          <button
            className="table-action-btn table-action-btn--edit"
            onClick={(e) => {
              e.stopPropagation()
              handleEditClick(item)
            }}
            title="Edit"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            className="table-action-btn table-action-btn--delete"
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteClick(item)
            }}
            title="Delete"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M3 6H5H21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      ),
    },
  ]

  // Landing Page - Show list of data types
  if (!selectedType) {
    return (
      <div className="master-data-page">
        <div className="page-header">
          <div className="page-header__content">
            <h1 className="page-title">Master Data Management</h1>
            <p className="page-subtitle">Select a data type to view and manage its attributes</p>
          </div>
          <div className="page-header__actions">
            <Button variant="secondary" onClick={handleDownloadTemplate}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: 18, height: 18 }}
              >
                <path
                  d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 10L12 15L17 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 15V3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Download Template
            </Button>
            <Button variant="secondary" onClick={openBulkUploadModal}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: 18, height: 18 }}
              >
                <path
                  d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17 8L12 3L7 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 3V15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Bulk Upload
            </Button>
            <Button onClick={() => setIsAddCategoryModalOpen(true)}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: 18, height: 18 }}
              >
                <path
                  d="M12 5V19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5 12H19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Add Category
            </Button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="alert alert--error">
            <span>{error}</span>
            <button onClick={() => setError('')}>Dismiss</button>
          </div>
        )}

        {successMessage && (
          <div className="alert alert--success">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage('')}>Dismiss</button>
          </div>
        )}

        {/* Data Types Grid */}
        <div className="data-types-grid">
          {categories.map((type) => (
            <div
              key={type.code}
              className="data-type-card"
              onClick={() => handleTypeClick(type.code)}
            >
              <div className="data-type-card__icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M4 7V4H20V7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 20H15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 4V20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="data-type-card__content">
                <h3 className="data-type-card__title">{type.label}</h3>
                <p className="data-type-card__description">{type.description}</p>
              </div>
              <div className="data-type-card__arrow">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Add Category Modal */}
        <Modal
          isOpen={isAddCategoryModalOpen}
          onClose={() => {
            setIsAddCategoryModalOpen(false)
            setNewCategory({ code: '', label: '', description: '' })
            setError('')
          }}
          title="Add New Category"
          size="md"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsAddCategoryModalOpen(false)
                  setNewCategory({ code: '', label: '', description: '' })
                  setError('')
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddCategory} isLoading={isSubmitting}>
                Add Category
              </Button>
            </>
          }
        >
          <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label className="form-label">Code *</label>
              <input
                type="text"
                className="form-input"
                value={newCategory.code}
                onChange={(e) => setNewCategory({ ...newCategory, code: e.target.value })}
                placeholder="e.g., BANK, LANGUAGE, DPD"
                required
              />
              <span className="form-hint">Unique identifier (will be converted to uppercase)</span>
            </div>
            <div className="form-group">
              <label className="form-label">Label *</label>
              <input
                type="text"
                className="form-input"
                value={newCategory.label}
                onChange={(e) => setNewCategory({ ...newCategory, label: e.target.value })}
                placeholder="e.g., Bank, Language, DPD"
                required
              />
              <span className="form-hint">Display name for the category</span>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input form-textarea"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                placeholder="Brief description of this category"
                rows={3}
              />
            </div>
          </form>
        </Modal>

        {/* Bulk Upload Modal */}
        <Modal
          isOpen={isBulkUploadModalOpen}
          onClose={() => {
            setIsBulkUploadModalOpen(false)
            setUploadFile(null)
            setUploadResult(null)
          }}
          title="Bulk Upload Master Data"
          size="md"
          footer={
            !uploadResult ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setIsBulkUploadModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleBulkUpload} isLoading={isSubmitting} disabled={!uploadFile}>
                  Upload
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsBulkUploadModalOpen(false)}>Close</Button>
            )
          }
        >
          {!uploadResult ? (
            <div className="bulk-upload-form">
              <div className="form-group">
                <label className="form-label">CSV File</label>
                <div className="file-upload">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    id="file-upload"
                    className="file-input"
                  />
                  <label htmlFor="file-upload" className="file-label">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M17 8L12 3L7 8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 3V15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{uploadFile ? uploadFile.name : 'Choose a CSV file'}</span>
                  </label>
                </div>
              </div>

              <div className="upload-info">
                <h4>CSV Format:</h4>
                <p className="upload-info__description">
                  Upload a CSV file with multiple data types. Each row must include the category type.
                </p>
                <ul>
                  <li><strong>categoryType</strong> - The data type/category (required)</li>
                  <li><strong>code</strong> - Unique identifier (required)</li>
                  <li><strong>value</strong> - Display value (required)</li>
                  <li><strong>parentCode</strong> - Reference to parent code (optional)</li>
                  <li><strong>displayOrder</strong> - Display order (optional)</li>
                  <li><strong>isActive</strong> - true/false (optional, default: true)</li>
                  <li><strong>metadata</strong> - JSON object as string (optional)</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="upload-result">
              <div
                className={`upload-result__summary ${
                  uploadResult.failureCount > 0 ? 'upload-result__summary--warning' : 'upload-result__summary--success'
                }`}
              >
                <div className="upload-result__stat">
                  <span className="upload-result__stat-value">{uploadResult.totalRecords}</span>
                  <span className="upload-result__stat-label">Total Records</span>
                </div>
                <div className="upload-result__stat upload-result__stat--success">
                  <span className="upload-result__stat-value">{uploadResult.successCount}</span>
                  <span className="upload-result__stat-label">Successful</span>
                </div>
                <div className="upload-result__stat upload-result__stat--error">
                  <span className="upload-result__stat-value">{uploadResult.failureCount}</span>
                  <span className="upload-result__stat-label">Failed</span>
                </div>
              </div>

              {uploadResult.errors.length > 0 && (
                <div className="upload-result__errors">
                  <h4>Errors:</h4>
                  <div className="error-list">
                    {uploadResult.errors.map((err: BulkUploadError, index: number) => (
                      <div key={index} className="error-item">
                        <span className="error-row">Row {err.row}</span>
                        <span className="error-field">{err.field}</span>
                        <span className="error-message">{err.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    )
  }

  // Detail View - Show attributes for selected type
  return (
    <div className="master-data-page">
      <div className="page-header">
        <div className="page-header__content">
          <button className="back-button" onClick={handleBackToList}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19 12H5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 19L5 12L12 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to Data Types
          </button>
          <h1 className="page-title">{getTypeLabel(selectedType)}</h1>
          <p className="page-subtitle">Manage attributes for {getTypeLabel(selectedType)} master data</p>
        </div>
        <div className="page-header__actions">
          <Button variant="secondary" onClick={openBulkUploadModal}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: 18, height: 18 }}
            >
              <path
                d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17 8L12 3L7 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 3V15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Bulk Upload
          </Button>
          <Button onClick={openAddAttributeModal}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: 18, height: 18 }}
            >
              <path
                d="M12 5V19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 12H19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Add Attribute
          </Button>
        </div>
      </div>

      {/* Info Bar */}
      <div className="filter-section">
        <div className="filter-info">
          Showing <strong>{masterData.length}</strong> records for <strong>{getTypeLabel(selectedType)}</strong>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="alert alert--error">
          <span>{error}</span>
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      {successMessage && (
        <div className="alert alert--success">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')}>Dismiss</button>
        </div>
      )}

      {/* Data Table */}
      <Table
        columns={columns}
        data={masterData}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage={`No attributes found for "${getTypeLabel(selectedType)}". Click "Add Attribute" to create one.`}
      />

      {/* Add Attribute Modal */}
      <Modal
        isOpen={isAddAttributeModalOpen}
        onClose={() => {
          setIsAddAttributeModalOpen(false)
          resetNewAttributeForm()
          setError('')
        }}
        title={`Add Attribute to ${getTypeLabel(selectedType)}`}
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsAddAttributeModalOpen(false)
                resetNewAttributeForm()
                setError('')
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddAttribute} isLoading={isSubmitting}>
              Add Attribute
            </Button>
          </>
        }
      >
        <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label className="form-label">Data Type</label>
            <input
              type="text"
              className="form-input"
              value={getTypeLabel(selectedType)}
              disabled
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Code *</label>
              <input
                type="text"
                className="form-input"
                value={newAttribute.code}
                onChange={(e) => setNewAttribute({ ...newAttribute, code: e.target.value })}
                placeholder="e.g., HDFC, EN, DPD_0_30"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Value *</label>
              <input
                type="text"
                className="form-input"
                value={newAttribute.value}
                onChange={(e) => setNewAttribute({ ...newAttribute, value: e.target.value })}
                placeholder="e.g., HDFC Bank, English"
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Display Order</label>
              <input
                type="number"
                className="form-input"
                value={newAttribute.displayOrder}
                onChange={(e) =>
                  setNewAttribute({ ...newAttribute, displayOrder: parseInt(e.target.value) || 1 })
                }
                min="1"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-input"
                value={newAttribute.isActive ? 'true' : 'false'}
                onChange={(e) => setNewAttribute({ ...newAttribute, isActive: e.target.value === 'true' })}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          resetForm()
        }}
        title="Edit Master Data"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} isLoading={isSubmitting}>
              Save Changes
            </Button>
          </>
        }
      >
        <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Data Type</label>
              <input type="text" className="form-input" value={formData.dataType} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Code</label>
              <input type="text" className="form-input" value={formData.code} disabled />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Value</label>
            <input
              type="text"
              className="form-input"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Parent Code</label>
              <input
                type="text"
                className="form-input"
                value={formData.parentCode || ''}
                onChange={(e) =>
                  setFormData({ ...formData, parentCode: e.target.value || null })
                }
                placeholder="Optional"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Display Order</label>
              <input
                type="number"
                className="form-input"
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })
                }
                min="1"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-input"
              value={formData.isActive ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Metadata (JSON)</label>
            <textarea
              className="form-input form-textarea"
              value={metadataString}
              onChange={(e) => setMetadataString(e.target.value)}
              placeholder='{"key": "value"}'
              rows={4}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Master Data"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isSubmitting}>
              Delete
            </Button>
          </>
        }
      >
        <div className="delete-confirmation">
          <svg
            className="delete-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path
              d="M12 8V12M12 16H12.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <p>
            Are you sure you want to delete master data{' '}
            <strong>
              {selectedItem?.code} ({selectedItem?.value})
            </strong>
            ? This action cannot be undone.
          </p>
        </div>
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal
        isOpen={isBulkUploadModalOpen}
        onClose={() => {
          setIsBulkUploadModalOpen(false)
          setUploadFile(null)
          setUploadResult(null)
        }}
        title={`Bulk Upload ${getTypeLabel(selectedType)} Data`}
        size="md"
        footer={
          !uploadResult ? (
            <>
              <Button
                variant="secondary"
                onClick={() => setIsBulkUploadModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleBulkUpload} isLoading={isSubmitting} disabled={!uploadFile}>
                Upload
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsBulkUploadModalOpen(false)}>Close</Button>
          )
        }
      >
        {!uploadResult ? (
          <div className="bulk-upload-form">
            <div className="form-group">
              <label className="form-label">Data Type</label>
              <input
                type="text"
                className="form-input"
                value={getTypeLabel(selectedType)}
                disabled
              />
            </div>

            <div className="form-group">
              <label className="form-label">CSV File</label>
              <div className="file-upload">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  id="file-upload-detail"
                  className="file-input"
                />
                <label htmlFor="file-upload-detail" className="file-label">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M17 8L12 3L7 8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 3V15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>{uploadFile ? uploadFile.name : 'Choose a CSV file'}</span>
                </label>
              </div>
            </div>

            <div className="upload-info">
              <h4>CSV Format:</h4>
              <p className="upload-info__description">
                Upload a CSV file with attributes for {getTypeLabel(selectedType)} only.
              </p>
              <ul>
                <li><strong>code</strong> - Unique identifier (required)</li>
                <li><strong>value</strong> - Display value (required)</li>
                <li><strong>parentCode</strong> - Reference to parent code (optional)</li>
                <li><strong>displayOrder</strong> - Display order (optional)</li>
                <li><strong>isActive</strong> - true/false (optional, default: true)</li>
                <li><strong>metadata</strong> - JSON object as string (optional)</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="upload-result">
            <div
              className={`upload-result__summary ${
                uploadResult.failureCount > 0 ? 'upload-result__summary--warning' : 'upload-result__summary--success'
              }`}
            >
              <div className="upload-result__stat">
                <span className="upload-result__stat-value">{uploadResult.totalRecords}</span>
                <span className="upload-result__stat-label">Total Records</span>
              </div>
              <div className="upload-result__stat upload-result__stat--success">
                <span className="upload-result__stat-value">{uploadResult.successCount}</span>
                <span className="upload-result__stat-label">Successful</span>
              </div>
              <div className="upload-result__stat upload-result__stat--error">
                <span className="upload-result__stat-value">{uploadResult.failureCount}</span>
                <span className="upload-result__stat-label">Failed</span>
              </div>
            </div>

            {uploadResult.errors.length > 0 && (
              <div className="upload-result__errors">
                <h4>Errors:</h4>
                <div className="error-list">
                  {uploadResult.errors.map((err: BulkUploadError, index: number) => (
                    <div key={index} className="error-item">
                      <span className="error-row">Row {err.row}</span>
                      <span className="error-field">{err.field}</span>
                      <span className="error-message">{err.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default MasterDataPage
