// src/pages/Programs.jsx
import { useState, useEffect } from 'react'
import { Plus, Search, Filter, BookOpen, Calendar, UserCheck, UserX, Clock, Award } from 'lucide-react'
import { useAuth } from '../Contexts/AuthContext'
import api from '../utils/api'
import ProgramModal from '../components/programs/ProgramModal'
import ApplicationModal from '../components/programs/ApplicationModal'
import DeleteConfirmation from '../components/common/DeleteConfirmation'
import './Programs.css'

const Programs = () => {
  const { user } = useAuth()
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showProgramModal, setShowProgramModal] = useState(false)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [deleteProgram, setDeleteProgram] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [programsPerPage] = useState(10)

  useEffect(() => {
    fetchPrograms()
  }, [])

  const fetchPrograms = async () => {
    try {
      const response = await api.get('/programs')
      setPrograms(response.data.programs || response.data)
    } catch (error) {
      console.error('Error fetching programs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProgram = () => {
    setSelectedProgram(null)
    setShowProgramModal(true)
  }

  const handleApply = (program) => {
    setSelectedProgram(program)
    setShowApplicationModal(true)
  }

  const handleEdit = (program) => {
    setSelectedProgram(program)
    setShowProgramModal(true)
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/programs/${deleteProgram._id}`)
      setPrograms(programs.filter(p => p._id !== deleteProgram._id))
      setDeleteProgram(null)
    } catch (error) {
      console.error('Error deleting program:', error)
    }
  }

  const handleModalClose = () => {
    setShowProgramModal(false)
    setShowApplicationModal(false)
    setSelectedProgram(null)
    fetchPrograms() // Refresh programs
  }

  // Filter programs based on search term and filters
  const filteredPrograms = programs.filter(program => {
    const matchesSearch = 
      program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.eligibility.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === 'all' || program.type === typeFilter
    const matchesStatus = statusFilter === 'all' || 
      (program.applicants && program.applicants.find(a => a.farmer._id === user._id)?.status === statusFilter)
    
    return matchesSearch && matchesType && matchesStatus
  })

  // Get unique types for filter
  const programTypes = ['all', 'SUBSIDY', 'TRAINING', 'GRANT']
  const applicationStatuses = ['all', 'APPLIED', 'APPROVED', 'REJECTED']

  // Pagination
  const indexOfLastProgram = currentPage * programsPerPage
  const indexOfFirstProgram = indexOfLastProgram - programsPerPage
  const currentPrograms = filteredPrograms.slice(indexOfFirstProgram, indexOfLastProgram)
  const totalPages = Math.ceil(filteredPrograms.length / programsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getProgramIcon = (type) => {
    switch (type) {
      case 'SUBSIDY':
        return <Award size={20} />
      case 'TRAINING':
        return <BookOpen size={20} />
      case 'GRANT':
        return <Award size={20} />
      default:
        return <BookOpen size={20} />
    }
  }

  const getProgramTypeText = (type) => {
    switch (type) {
      case 'SUBSIDY':
        return 'Subsidy Program'
      case 'TRAINING':
        return 'Training Program'
      case 'GRANT':
        return 'Grant Program'
      default:
        return type
    }
  }

  const getApplicationStatus = (program) => {
    if (!program.applicants) return null
    const application = program.applicants.find(a => a.farmer._id === user._id)
    return application ? application.status : null
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'status-approved'
      case 'REJECTED':
        return 'status-rejected'
      case 'APPLIED':
        return 'status-pending'
      default:
        return 'status-none'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'Approved'
      case 'REJECTED':
        return 'Rejected'
      case 'APPLIED':
        return 'Pending Review'
      default:
        return 'Not Applied'
    }
  }

  const isProgramActive = (program) => {
    const now = new Date()
    const endDate = new Date(program.endDate)
    return now <= endDate
  }

  if (loading) {
    return (
      <div className="programs-loading">
        <div className="loading-spinner"></div>
        <p>Loading programs...</p>
      </div>
    )
  }

  return (
    <div className="programs">
      <div className="programs-header">
        <div className="header-content">
          <h1>Farming Programs</h1>
          <p>Discover and apply for agricultural support programs</p>
        </div>
        {user.role === 'admin' && (
          <button className="btn-primary" onClick={handleCreateProgram}>
            <Plus size={20} />
            New Program
          </button>
        )}
      </div>

      <div className="programs-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search programs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters">
          <div className="filter-group">
            <Filter size={16} />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {programTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : getProgramTypeText(type)}
                </option>
              ))}
            </select>
          </div>

          {user.role === 'farmer' && (
            <div className="filter-group">
              <Filter size={16} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {applicationStatuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Statuses' : getStatusText(status)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="stats">
          <span>{filteredPrograms.length} programs found</span>
        </div>
      </div>

      <div className="programs-grid">
        {currentPrograms.length > 0 ? (
          currentPrograms.map(program => (
            <ProgramCard
              key={program._id}
              program={program}
              onApply={handleApply}
              onEdit={handleEdit}
              onDelete={setDeleteProgram}
              user={user}
              formatDate={formatDate}
              getProgramIcon={getProgramIcon}
              getProgramTypeText={getProgramTypeText}
              getApplicationStatus={getApplicationStatus}
              getStatusClass={getStatusClass}
              getStatusText={getStatusText}
              isProgramActive={isProgramActive}
            />
          ))
        ) : (
          <div className="empty-state">
            <BookOpen size={64} />
            <h3>No programs found</h3>
            <p>No programs match your search criteria</p>
            {user.role === 'admin' && (
              <button className="btn-primary" onClick={handleCreateProgram}>
                <Plus size={20} />
                Create Program
              </button>
            )}
          </div>
        )}
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

      {showProgramModal && (
        <ProgramModal
          program={selectedProgram}
          onClose={handleModalClose}
        />
      )}

      {showApplicationModal && (
        <ApplicationModal
          program={selectedProgram}
          onClose={handleModalClose}
        />
      )}

      {deleteProgram && (
        <DeleteConfirmation
          item={deleteProgram}
          onClose={() => setDeleteProgram(null)}
          onConfirm={handleDelete}
          title="Delete Program"
          message={`Are you sure you want to delete "${deleteProgram.title}"? This action cannot be undone.`}
        />
      )}
    </div>
  )
}

const ProgramCard = ({ program, onApply, onEdit, onDelete, user, formatDate, getProgramIcon, getProgramTypeText, getApplicationStatus, getStatusClass, getStatusText, isProgramActive }) => {
  const applicationStatus = getApplicationStatus(program)
  const active = isProgramActive(program)

  return (
    <div className="program-card">
      <div className="program-header">
        <div className="program-type">
          <span className="type-icon">{getProgramIcon(program.type)}</span>
          <span className="type-text">{getProgramTypeText(program.type)}</span>
        </div>
        
        <div className="program-status">
          {active ? (
            <span className="status-active">Active</span>
          ) : (
            <span className="status-expired">Expired</span>
          )}
        </div>
      </div>

      <div className="program-content">
        <h3 className="program-title">{program.title}</h3>
        <p className="program-description">{program.description}</p>
        
        <div className="program-dates">
          <div className="date-item">
            <Calendar size={16} />
            <span>Starts: {formatDate(program.startDate)}</span>
          </div>
          <div className="date-item">
            <Calendar size={16} />
            <span>Ends: {formatDate(program.endDate)}</span>
          </div>
        </div>

        {program.eligibility && (
          <div className="program-eligibility">
            <h4>Eligibility</h4>
            <p>{program.eligibility}</p>
          </div>
        )}

        {user.role === 'farmer' && (
          <div className="application-status">
            <span className={`status ${getStatusClass(applicationStatus)}`}>
              {getStatusText(applicationStatus)}
            </span>
          </div>
        )}
      </div>

      <div className="program-footer">
        {user.role === 'admin' ? (
          <div className="admin-actions">
            <span className="applicants-count">
              {program.applicants?.length || 0} applicants
            </span>
            <div className="action-buttons">
              <button onClick={() => onEdit(program)} className="btn-secondary">
                Edit
              </button>
              <button onClick={() => onDelete(program)} className="btn-danger">
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="farmer-actions">
            {applicationStatus ? (
              <div className="application-info">
                <Clock size={16} />
                <span>Application {getStatusText(applicationStatus).toLowerCase()}</span>
              </div>
            ) : (
              <button
                onClick={() => onApply(program)}
                disabled={!active}
                className="btn-primary"
              >
                {active ? 'Apply Now' : 'Program Closed'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Programs