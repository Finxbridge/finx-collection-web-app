/**
 * Permissions Management Page
 * List, create, edit, and delete permissions
 */

import { useState, useEffect, useCallback } from 'react'
import { permissionService } from '@services/api'
import { Table, Column } from '@components/common/Table'
import { Modal } from '@components/common/Modal'
import { Button } from '@components/common/Button'
import { PERMISSION_ACTIONS } from '@config/constants'
import type { Permission, CreatePermissionRequest, UpdatePermissionRequest, PermissionAction } from '@types'
import './PermissionsPage.css'

export function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states
  const [formData, setFormData] = useState<CreatePermissionRequest>({
    code: '',
    name: '',
    resource: '',
    action: 'READ',
    description: '',
  })

  const fetchPermissions = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await permissionService.getAll()
      setPermissions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch permissions')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPermissions()
  }, [fetchPermissions])

  const handleEditPermission = (permission: Permission) => {
    setSelectedPermission(permission)
    setFormData({
      code: permission.code,
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
      description: permission.description,
    })
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (permission: Permission) => {
    setSelectedPermission(permission)
    setIsDeleteModalOpen(true)
  }

  const handleCreatePermission = async () => {
    try {
      setIsSubmitting(true)
      await permissionService.create(formData)
      setIsCreateModalOpen(false)
      resetForm()
      fetchPermissions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create permission')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdatePermission = async () => {
    if (!selectedPermission) return

    try {
      setIsSubmitting(true)
      const updateData: UpdatePermissionRequest = {
        code: formData.code,
        name: formData.name,
        resource: formData.resource,
        action: formData.action,
        description: formData.description,
      }
      await permissionService.update(selectedPermission.id, updateData)
      setIsEditModalOpen(false)
      resetForm()
      fetchPermissions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update permission')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePermission = async () => {
    if (!selectedPermission) return

    try {
      setIsSubmitting(true)
      await permissionService.delete(selectedPermission.id)
      setIsDeleteModalOpen(false)
      setSelectedPermission(null)
      fetchPermissions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete permission')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      resource: '',
      action: 'READ',
      description: '',
    })
    setSelectedPermission(null)
  }

  const openCreateModal = () => {
    resetForm()
    setIsCreateModalOpen(true)
  }

  // Generate code from resource and action
  const generateCode = (resource: string, action: string) => {
    return `${resource.toUpperCase().replace(/\s+/g, '_')}_${action}`
  }

  const columns: Column<Permission>[] = [
    {
      key: 'code',
      header: 'Code',
      render: (permission) => (
        <code className="permission-code">{permission.code}</code>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (permission) => (
        <span className="permission-name">{permission.name}</span>
      ),
    },
    {
      key: 'resource',
      header: 'Resource',
      render: (permission) => (
        <span className="resource-tag">{permission.resource}</span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (permission) => (
        <span className={`action-badge action-badge--${permission.action.toLowerCase()}`}>
          {permission.action}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (permission) => (
        <div className="table-actions">
          <button
            className="table-action-btn table-action-btn--edit"
            onClick={(e) => {
              e.stopPropagation()
              handleEditPermission(permission)
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
              handleDeleteClick(permission)
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

  return (
    <div className="permissions-page">
      <div className="page-header">
        <div className="page-header__content">
          <h1 className="page-title">Permission Management</h1>
          <p className="page-subtitle">Manage system permissions for resources and actions</p>
        </div>
        <Button onClick={openCreateModal}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: 18, height: 18 }}
          >
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Add Permission
        </Button>
      </div>

      {error && (
        <div className="alert alert--error">
          <span>{error}</span>
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      <Table
        columns={columns}
        data={permissions}
        keyExtractor={(permission) => permission.id}
        isLoading={isLoading}
        emptyMessage="No permissions found"
      />

      {/* Create Permission Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Permission"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePermission} isLoading={isSubmitting}>
              Create Permission
            </Button>
          </>
        }
      >
        <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Resource</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., User, Role, Report"
                value={formData.resource}
                onChange={(e) => {
                  const resource = e.target.value
                  setFormData({
                    ...formData,
                    resource,
                    code: generateCode(resource, formData.action),
                  })
                }}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Action</label>
              <select
                className="form-input form-select"
                value={formData.action}
                onChange={(e) => {
                  const action = e.target.value as PermissionAction
                  setFormData({
                    ...formData,
                    action,
                    code: generateCode(formData.resource, action),
                  })
                }}
                required
              >
                {PERMISSION_ACTIONS.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Code (auto-generated)</label>
            <input
              type="text"
              className="form-input"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="RESOURCE_ACTION"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Display Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Read User"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input form-textarea"
              placeholder="Describe what this permission allows..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
        </form>
      </Modal>

      {/* Edit Permission Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Permission"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePermission} isLoading={isSubmitting}>
              Save Changes
            </Button>
          </>
        }
      >
        <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Resource</label>
              <input
                type="text"
                className="form-input"
                value={formData.resource}
                disabled
              />
            </div>
            <div className="form-group">
              <label className="form-label">Action</label>
              <input
                type="text"
                className="form-input"
                value={formData.action}
                disabled
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Code</label>
            <input
              type="text"
              className="form-input"
              value={formData.code}
              disabled
            />
          </div>
          <div className="form-group">
            <label className="form-label">Display Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input form-textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Permission"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeletePermission} isLoading={isSubmitting}>
              Delete Permission
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
            Are you sure you want to delete the permission{' '}
            <strong>{selectedPermission?.name}</strong>? Roles using this permission will
            be affected.
          </p>
        </div>
      </Modal>
    </div>
  )
}

export default PermissionsPage
