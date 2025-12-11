/**
 * Users Management Page
 * List, create, edit, and delete users
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { userManagementService, roleService, masterDataService } from '@services/api'
import { Table, Pagination, Column } from '@components/common/Table'
import { Modal } from '@components/common/Modal'
import { Button } from '@components/common/Button'
import type {
  UserSummary,
  User,
  Role,
  CreateUserRequest,
  UpdateUserRequest,
  AllocationBucket,
  MasterData,
} from '@types'
import './UsersPage.css'

export function UsersPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<UserSummary[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const pageSize = 20

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // City and State options from Master Data
  const [cityOptions, setCityOptions] = useState<MasterData[]>([])
  const [stateOptions, setStateOptions] = useState<MasterData[]>([])

  // Allocation bucket options
  const allocationBucketOptions: AllocationBucket[] = ['DEFAULT', 'HIGH', 'MEDIUM', 'LOW']

  // Form states
  const [formData, setFormData] = useState<CreateUserRequest>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    mobileNumber: '',
    status: 'ACTIVE',
    userGroupId: null,
    city: '',
    state: '',
    maxCaseCapacity: 100,
    allocationPercentage: 100,
    allocationBucket: 'DEFAULT',
    teamId: null,
    roleIds: [],
  })

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await userManagementService.getAll({
        page: currentPage,
        size: pageSize,
      })
      setUsers(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
    } finally {
      setIsLoading(false)
    }
  }, [currentPage])

  const fetchRoles = useCallback(async () => {
    try {
      const rolesData = await roleService.getAll()
      setRoles(rolesData)
    } catch (err) {
      console.error('Failed to fetch roles:', err)
    }
  }, [])

  const fetchCityOptions = useCallback(async () => {
    try {
      const cities = await masterDataService.getByType('CITY')
      setCityOptions(cities)
    } catch (err) {
      console.error('Failed to fetch city options:', err)
    }
  }, [])

  const fetchStateOptions = useCallback(async () => {
    try {
      const states = await masterDataService.getByType('STATE')
      setStateOptions(states)
    } catch (err) {
      console.error('Failed to fetch state options:', err)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
    fetchRoles()
    fetchCityOptions()
    fetchStateOptions()
  }, [fetchUsers, fetchRoles, fetchCityOptions, fetchStateOptions])

  const handleViewUser = (user: UserSummary) => {
    navigate(`/access-management/users/${user.id}`)
  }

  const handleEditUser = async (user: UserSummary) => {
    try {
      const fullUser = await userManagementService.getById(user.id) as User & {
        city?: string
        state?: string
        maxCaseCapacity?: number
        allocationPercentage?: number
        allocationBucket?: AllocationBucket
        userGroupId?: number | null
        teamId?: number | null
      }
      setSelectedUser(fullUser)
      setFormData({
        username: fullUser.username,
        email: fullUser.email,
        password: '',
        firstName: fullUser.firstName,
        lastName: fullUser.lastName,
        mobileNumber: fullUser.mobileNumber || '',
        status: fullUser.status || 'ACTIVE',
        userGroupId: fullUser.userGroupId || null,
        city: fullUser.city || '',
        state: fullUser.state || '',
        maxCaseCapacity: fullUser.maxCaseCapacity || 100,
        allocationPercentage: fullUser.allocationPercentage || 100,
        allocationBucket: fullUser.allocationBucket || 'DEFAULT',
        teamId: fullUser.teamId || null,
        roleIds: fullUser.roles?.map((r: { id: number }) => r.id) || [],
      })
      setIsEditModalOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user details')
    }
  }

  const handleDeleteClick = (user: UserSummary) => {
    setSelectedUser(user as User)
    setIsDeleteModalOpen(true)
  }

  const handleCreateUser = async () => {
    try {
      setIsSubmitting(true)
      await userManagementService.create(formData)
      setIsCreateModalOpen(false)
      resetForm()
      fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return

    try {
      setIsSubmitting(true)
      const updateData: UpdateUserRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        mobileNumber: formData.mobileNumber,
        status: formData.status,
        userGroupId: formData.userGroupId,
        city: formData.city,
        state: formData.state,
        maxCaseCapacity: formData.maxCaseCapacity,
        allocationPercentage: formData.allocationPercentage,
        allocationBucket: formData.allocationBucket,
        teamId: formData.teamId,
        roleIds: formData.roleIds,
      }
      await userManagementService.update(selectedUser.id, updateData)
      setIsEditModalOpen(false)
      resetForm()
      fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      setIsSubmitting(true)
      await userManagementService.delete(selectedUser.id)
      setIsDeleteModalOpen(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      mobileNumber: '',
      status: 'ACTIVE',
      userGroupId: null,
      city: '',
      state: '',
      maxCaseCapacity: 100,
      allocationPercentage: 100,
      allocationBucket: 'DEFAULT',
      teamId: null,
      roleIds: [],
    })
    setSelectedUser(null)
  }

  const openCreateModal = () => {
    resetForm()
    setIsCreateModalOpen(true)
  }

  const columns: Column<UserSummary>[] = [
    {
      key: 'username',
      header: 'Username',
      render: (user) => (
        <div className="user-info">
          <div className="user-avatar">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
          <div className="user-details">
            <span className="user-name">
              {user.firstName} {user.lastName}
            </span>
            <span className="user-username">@{user.username}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => (
        <span className={`status-badge status-badge--${user.status.toLowerCase()}`}>
          {user.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user) => (
        <div className="table-actions">
          <button
            className="table-action-btn"
            onClick={(e) => {
              e.stopPropagation()
              handleViewUser(user)
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
              handleEditUser(user)
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
              handleDeleteClick(user)
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
    <div className="users-page">
      <div className="page-header">
        <div className="page-header__content">
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage system users and their roles</p>
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
          Add User
        </Button>
      </div>

      {error && (
        <div className="alert alert--error">
          <span>{error}</span>
          <button onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      <Table columns={columns} data={users} keyExtractor={(user) => user.id} isLoading={isLoading} emptyMessage="No users found" />

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalElements}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New User"
        size="md"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleCreateUser} isLoading={isSubmitting}>
              Create User
            </Button>
          </>
        }
      >
        <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <input
              type="tel"
              className="form-input"
              value={formData.mobileNumber}
              onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-input"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED' })}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="LOCKED">Locked</option>
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">State</label>
              <select
                className="form-input"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              >
                <option value="">Select State</option>
                {stateOptions.map((state) => (
                  <option key={state.id} value={state.code}>{state.value}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <select
                className="form-input"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              >
                <option value="">Select City</option>
                {cityOptions.map((city) => (
                  <option key={city.id} value={city.code}>{city.value}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Max Case Capacity</label>
              <input
                type="number"
                className="form-input"
                value={formData.maxCaseCapacity}
                onChange={(e) => setFormData({ ...formData, maxCaseCapacity: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Allocation %</label>
              <input
                type="number"
                className="form-input"
                value={formData.allocationPercentage}
                onChange={(e) => setFormData({ ...formData, allocationPercentage: parseFloat(e.target.value) || 0 })}
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Allocation Bucket</label>
            <select
              className="form-input"
              value={formData.allocationBucket}
              onChange={(e) => setFormData({ ...formData, allocationBucket: e.target.value as AllocationBucket })}
            >
              {allocationBucketOptions.map((bucket) => (
                <option key={bucket} value={bucket}>{bucket}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Roles</label>
            <div className="checkbox-group">
              {roles.map((role) => (
                <label key={role.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.roleIds.includes(role.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, roleIds: [...formData.roleIds, role.id] })
                      } else {
                        setFormData({
                          ...formData,
                          roleIds: formData.roleIds.filter((id) => id !== role.id),
                        })
                      }
                    }}
                  />
                  <span>{role.displayName}</span>
                </label>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User"
        size="md"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleUpdateUser} isLoading={isSubmitting}>
              Save Changes
            </Button>
          </>
        }
      >
        <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              value={formData.username}
              disabled
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              disabled
            />
          </div>
          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <input
              type="tel"
              className="form-input"
              value={formData.mobileNumber}
              onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-input"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED' })}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="LOCKED">Locked</option>
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">State</label>
              <select
                className="form-input"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              >
                <option value="">Select State</option>
                {stateOptions.map((state) => (
                  <option key={state.id} value={state.code}>{state.value}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <select
                className="form-input"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              >
                <option value="">Select City</option>
                {cityOptions.map((city) => (
                  <option key={city.id} value={city.code}>{city.value}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Max Case Capacity</label>
              <input
                type="number"
                className="form-input"
                value={formData.maxCaseCapacity}
                onChange={(e) => setFormData({ ...formData, maxCaseCapacity: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Allocation %</label>
              <input
                type="number"
                className="form-input"
                value={formData.allocationPercentage}
                onChange={(e) => setFormData({ ...formData, allocationPercentage: parseFloat(e.target.value) || 0 })}
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Allocation Bucket</label>
            <select
              className="form-input"
              value={formData.allocationBucket}
              onChange={(e) => setFormData({ ...formData, allocationBucket: e.target.value as AllocationBucket })}
            >
              {allocationBucketOptions.map((bucket) => (
                <option key={bucket} value={bucket}>{bucket}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Roles</label>
            <div className="checkbox-group">
              {roles.map((role) => (
                <label key={role.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.roleIds.includes(role.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, roleIds: [...formData.roleIds, role.id] })
                      } else {
                        setFormData({
                          ...formData,
                          roleIds: formData.roleIds.filter((id) => id !== role.id),
                        })
                      }
                    }}
                  />
                  <span>{role.displayName}</span>
                </label>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete User"
        size="sm"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={handleDeleteUser} isLoading={isSubmitting}>
              Delete User
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
            Are you sure you want to delete user{' '}
            <strong>
              {selectedUser?.firstName} {selectedUser?.lastName}
            </strong>
            ? This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  )
}

export default UsersPage
