// src/components/programs/ApplicationModal.jsx
import { useState } from 'react'
import { X, User, Calendar, BookOpen, AlertCircle } from 'lucide-react'
import api from '../../utils/api'
import './ApplicationModal.css'

const ApplicationModal = ({ program, onClose }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    setLoading(true)
    setError('')
    try {
      await api.post(`/programs/${program._id}/apply`)
      onClose()
    } catch (error) {
      console.error('Error applying to program:', error)
      setError(error.response?.data?.message || 'Failed to apply. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
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

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Apply to Program</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="application-content">
          <div className="program-summary">
            <h3>{program.title}</h3>
            <div className="program-details">
              <div className="detail-item">
                <BookOpen size={16} />
                <span>{getProgramTypeText(program.type)}</span>
              </div>
              <div className="detail-item">
                <Calendar size={16} />
                <span>Ends: {formatDate(program.endDate)}</span>
              </div>
            </div>
          </div>

          {program.eligibility && (
            <div className="eligibility-section">
              <h4>
                <AlertCircle size={18} />
                Eligibility Requirements
              </h4>
              <p>{program.eligibility}</p>
            </div>
          )}

          <div className="application-info">
            <h4>
              <User size={18} />
              Application Information
            </h4>
            <p>Your profile information will be submitted with this application. Please ensure your profile is up to date.</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="application-form">
            <div className="form-group">
              <label htmlFor="notes">Additional Notes (Optional)</label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Add any additional information you'd like to include with your application..."
              />
            </div>

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ApplicationModal