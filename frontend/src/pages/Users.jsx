// src/pages/Users.jsx
import { useState, useEffect } from 'react'
import { Search, Filter, User, Mail, Phone, Calendar, Edit, Trash2, Shield, UserCheck, UserX } from 'lucide-react'
import { useAuth } from '../Contexts/AuthContext'
import api from '../../utils/api'
import UserModal from '../components/users/UserModal'
import DeleteConfirmation from '../components/common/DeleteConfirmation'
import './Users.css'

const Users = () => {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [deleteUser, setDeleteUser] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(10)

  useEffect(() => {
    if (user.role === 'admin') {
      fetchUsers()
    }
  }, [user.role])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users')
      setUsers(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setShowUserModal(true)
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${deleteUser._id}`)
      setUsers(users.filter(u => u._id !== deleteUser._id))
      setDeleteUser(null)
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const handleModalClose = () => {
    setShowUserModal(false)
    setSelectedUser(null)
    fetchUsers() // Refresh users
  }

  // Filter users based on search term and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    return matchesSearch && matchesRole
  })

  // Get unique roles for filter
  const roles = ['all', 'farmer', 'admin', 'tech']

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield size={16} />
      case 'tech':
        return <UserCheck size={16} />
      case 'farmer':
        return <User size={16} />
      default:
        return <User size={16} />
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'var(--color-admin)'
      case 'tech':
        return 'var(--color-tech)'
      case 'farmer':
        return 'var(--color-farmer)'
      default:
        return 'var(--color-default)'
    }
  }

  const getRoleText = (role) => {
    return role.charAt(0).toUpperCase() + role.slice(1)
  }

  if (user.role !== 'admin') {
    return (
      <div className="access-denied">
        <Shield size={64} />
        <h2>Access Denied</h2>
        <p>You need administrator privileges to access this page.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="users-loading">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    )
  }

  return (
    <div className="users">
      <div className="users-header">
        <div className="header-content">
          <h1>User Management</h1>
          <p>Manage user accounts and permissions</p>
        </div>
      </div>

      <div className="users-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters">
          <div className="filter-group">
            <Filter size={16} />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              {roles.map(role => (
                <option key={role} value={role}>
                  {role === 'all' ? 'All Roles' : getRoleText(role)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="stats">
          <span>{filteredUsers.length} users found</span>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Contact</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map(user => (
                <UserRow
                  key={user._id}
                  user={user}
                  onEdit={handleEditUser}
                  onDelete={setDeleteUser}
                  formatDate={formatDate}
                  getRoleIcon={getRoleIcon}
                  getRoleColor={getRoleColor}
                  getRoleText={getRoleText}
                />
              ))
            ) : (
              <tr>
                <td colSpan="5" className="empty-state">
                  <div className="empty-content">
                    <User size={64} />
                    <h3>No users found</h3>
                    <p>No users match your search criteria</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => paginate(page)}
              className={currentPage === page ? 'active' : ''}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {showUserModal && (
        <UserModal
          user={selectedUser}
          onClose={handleModalClose}
        />
      )}

      {deleteUser && (
        <DeleteConfirmation
          item={deleteUser}
          onClose={() => setDeleteUser(null)}
          onConfirm={handleDelete}
          title="Delete User"
          message={`Are you sure you want to delete user "${deleteUser.name}"? This action cannot be undone.`}
        />
      )}
    </div>
  )
}

const UserRow = ({ user, onEdit, onDelete, formatDate, getRoleIcon, getRoleColor, getRoleText }) => {
  return (
    <tr className="user-row">
      <td>
        <div className="user-info">
          <div className="user-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <div className="user-name">{user.name}</div>
            <div className="user-id">ID: {user._id.slice(-6)}</div>
          </div>
        </div>
      </td>
      <td>
        <div className="contact-info">
          <div className="contact-item">
            <Mail size={14} />
            <span>{user.email}</span>
          </div>
          {user.phone && (
            <div className="contact-item">
              <Phone size={14} />
              <span>{user.phone}</span>
            </div>
          )}
        </div>
      </td>
      <td>
        <div className="role-badge" style={{ color: getRoleColor(user.role) }}>
          {getRoleIcon(user.role)}
          <span>{getRoleText(user.role)}</span>
        </div>
      </td>
      <td>
        <div className="join-date">
          <Calendar size={14} />
          <span>{formatDate(user.createdAt)}</span>
        </div>
      </td>
      <td>
        <div className="user-actions">
          <button
            onClick={() => onEdit(user)}
            className="btn-icon"
            title="Edit User"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(user)}
            className="btn-icon danger"
            title="Delete User"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  )
}

export default Users