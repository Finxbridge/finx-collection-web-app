/**
 * Roles Management Page
 * List, create, edit, and delete roles
 */

import { useState, useEffect, useCallback } from 'react'
import { roleService, permissionService } from '@services/api'
import { Table, Column } from '@components/common/Table'
import { Modal } from '@components/common/Modal'
import { Button } from '@components/common/Button'
import type { Role, Permission, CreateRoleRequest, UpdateRoleRequest } from '@types'
import './RolesPage.css'

export function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states
  const [formData, setFormData] = useState<CreateRoleRequest>({
    name: '',
    displayName: '',
    description: '',
    permissionIds: [],
  })

  const fetchRoles = useCallback(async () => {
    try {
      setIsLoading(true)
      const rolesData = await roleService.getAll()
      setRoles(rolesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch roles')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchPermissions = useCallback(async () => {
    try {
      const permissionsData = await permissionService.getAll()
      setPermissions(permissionsData)
    } catch (err) {
      console.error('Failed to fetch permissions:', err)
    }
  }, [])

  useEffect(() => {
    fetchRoles()
    fetchPermissions()
  }, [fetchRoles, fetchPermissions])

  const handleViewRole = async (role: Role) => {
    try {
      const fullRole = await roleService.getById(role.id)
      setSelectedRole(fullRole)
      setIsViewModalOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch role details')
    }
  }

  const handleEditRole = async (role: Role) => {
    try {
      const fullRole = await roleService.getById(role.id)
      setSelectedRole(fullRole)
      setFormData({
        name: fullRole.name,
        displayName: fullRole.displayName,
        description: fullRole.description,
        permissionIds: fullRole.permissions?.map((p) => p.id) || [],
      })
      setIsEditModalOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch role details')
    }
  }

  const handleDeleteClick = (role: Role) => {
    setSelectedRole(role)
    setIsDeleteModalOpen(true)
  }

  const handleCreateRole = async () => {
    try {
      setIsSubmitting(true)
      await roleService.create(formData)
      setIsCreateModalOpen(false)
      resetForm()
      fetchRoles()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create role')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateRole = async () => {
    if (!selectedRole) return

    try {
      setIsSubmitting(true)
      const updateData: UpdateRoleRequest = {
        displayName: formData.displayName,
        description: formData.description,
        permissionIds: formData.permissionIds,
      }
      await roleService.update(selectedRole.id, updateData)
      setIsEditModalOpen(false)
      resetForm()
      fetchRoles()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteRole = async () => {
    if (!selectedRole) return

    try {
      setIsSubmitting(true)
      await roleService.delete(selectedRole.id)
      setIsDeleteModalOpen(false)
      setSelectedRole(null)
      fetchRoles()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete role')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      displayName: '',
      description: '',
      permissionIds: [],
    })
    setSelectedRole(null)
  }

  const openCreateModal = () => {
    resetForm()
    setIsCreateModalOpen(true)
  }

  // Group permissions by resource
  const groupedPermissions = permissions.reduce(
    (acc, permission) => {
      const resource = permission.resource
      if (!acc[resource]) {
        acc[resource] = []
      }
      acc[resource].push(permission)
      return acc
    },
    {} as Record<string, Permission[]>
  )

  const columns: Column<Role>[] = [
    {
      key: 'displayName',
      header: 'Role',
      render: (role) => (
        <div className="role-info">
          <div className="role-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="role-details">
            <span className="role-name">{role.displayName}</span>
            <span className="role-code">{role.name}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
    },
    {
      key: 'status',
      header: 'Status',
      render: (role) => (
        <span className={`status-badge status-badge--${role.status.toLowerCase()}`}>
          {role.status}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (role) =>
        role.createdAt ? new Date(role.createdAt).toLocaleDateString() : 'N/A',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (role) => (
        <div className="table-actions">
          <button
            className="table-action-btn"
            onClick={(e) => {
              e.stopPropagation()
              handleViewRole(role)
            }}
            title="View"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
          <button
            className="table-action-btn table-action-btn--edit"
            onClick={(e) => {
              e.stopPropagation()
              handleEditRole(role)
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
              handleDeleteClick(role)
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
    <div className="roles-page">
      <div className="page-header">
        <div className="page-header__content">
          <h1 className="page-title">Role Management</h1>
          <p className="page-subtitle">Manage roles and their permissions</p>
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
          Add Role
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
        data={roles}
        keyExtractor={(role) => role.id}
        isLoading={isLoading}
        emptyMessage="No roles found"
      />

      {/* Create Role Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Role"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRole} isLoading={isSubmitting}>
              Create Role
            </Button>
          </>
        }
      >
        <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Role Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Supervisor"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Team Supervisor"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input form-textarea"
              placeholder="Describe the role's responsibilities..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Permissions</label>
            <div className="permissions-grid">
              {Object.entries(groupedPermissions).map(([resource, perms]) => (
                <div key={resource} className="permission-group">
                  <h4 className="permission-group__title">{resource}</h4>
                  <div className="permission-group__items">
                    {perms.map((permission) => (
                      <label key={permission.id} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={formData.permissionIds.includes(permission.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                permissionIds: [...formData.permissionIds, permission.id],
                              })
                            } else {
                              setFormData({
                                ...formData,
                                permissionIds: formData.permissionIds.filter(
                                  (id) => id !== permission.id
                                ),
                              })
                            }
                          }}
                        />
                        <span>{permission.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Role"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole} isLoading={isSubmitting}>
              Save Changes
            </Button>
          </>
        }
      >
        <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Role Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                disabled
              />
            </div>
            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                required
              />
            </div>
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
          <div className="form-group">
            <label className="form-label">Permissions</label>
            <div className="permissions-grid">
              {Object.entries(groupedPermissions).map(([resource, perms]) => (
                <div key={resource} className="permission-group">
                  <h4 className="permission-group__title">{resource}</h4>
                  <div className="permission-group__items">
                    {perms.map((permission) => (
                      <label key={permission.id} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={formData.permissionIds.includes(permission.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                permissionIds: [...formData.permissionIds, permission.id],
                              })
                            } else {
                              setFormData({
                                ...formData,
                                permissionIds: formData.permissionIds.filter(
                                  (id) => id !== permission.id
                                ),
                              })
                            }
                          }}
                        />
                        <span>{permission.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      {/* View Role Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Role Details"
        size="md"
      >
        {selectedRole && (
          <div className="role-view">
            <div className="role-view__header">
              <div className="role-view__icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="role-view__name">
                <h3>{selectedRole.displayName}</h3>
                <span>{selectedRole.name}</span>
              </div>
              <span className={`status-badge status-badge--${selectedRole.status.toLowerCase()}`}>
                {selectedRole.status}
              </span>
            </div>
            <div className="role-view__details">
              <div className="detail-item">
                <span className="detail-label">Description</span>
                <span className="detail-value">{selectedRole.description || 'No description'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Permissions</span>
                <div className="permissions-list">
                  {selectedRole.permissions?.length ? (
                    selectedRole.permissions.map((perm, index) => (
                      <span key={index} className="permission-tag">
                        {perm.name}
                      </span>
                    ))
                  ) : (
                    <span className="no-permissions">No permissions assigned</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Role"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteRole} isLoading={isSubmitting}>
              Delete Role
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
            Are you sure you want to delete the role{' '}
            <strong>{selectedRole?.displayName}</strong>? Users with this role will lose
            associated permissions.
          </p>
        </div>
      </Modal>
    </div>
  )
}

export default RolesPage
