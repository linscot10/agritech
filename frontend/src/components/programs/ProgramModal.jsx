// src/components/programs/ProgramModal.jsx
import { useState, useEffect } from 'react'
import { X, Calendar, BookOpen, Award, Users } from 'lucide-react'
import api from '../../utils/api'
import './ProgramModal.css'

const ProgramModal = ({ program, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'SUBSIDY',
    eligibility: '',
    startDate: '',
    endDate: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const programTypes = ['SUBSIDY', 'TRAINING', 'GRANT']

  useEffect(() => {
    if (program) {
      setFormData({
        title: program.title || '',
        description: program.description || '',
        type: program.type || 'SUBSIDY',
        eligibility: program.eligibility || '',
        startDate: program.startDate ? new Date(program.startDate).toISOString().split('T')[0] : '',
        endDate: program.endDate ? new Date(program.endDate).toISOString().split('T')[0] : ''
      })
    }
  }, [program])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.startDate) newErrors.startDate = 'Start date is required'
    if (!formData.endDate) newErrors.endDate = 'End date is required'
    
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      if (program) {
        await api.put(`/programs/${program._id}`, formData)
      } else {
        await api.post('/programs', formData)
      }
      onClose()
    } catch (error) {
      console.error('Error saving program:', error)
      setErrors({ submit: 'Failed to save program. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const getProgramTypeIcon = (type) => {
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

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{program ? 'Edit Program' : 'Create New Program'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Program Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'error' : ''}
              placeholder="Enter program title"
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="type">Program Type *</label>
            <div className="type-selector">
              {programTypes.map(type => (
                <label key={type} className="type-option">
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    checked={formData.type === type}
                    onChange={handleChange}
                  />
                  <div className="type-content">
                    {getProgramTypeIcon(type)}
                    <span>{getProgramTypeText(type)}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? 'error' : ''}
              placeholder="Describe the program details, benefits, and requirements..."
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="eligibility">Eligibility Criteria</label>
            <textarea
              id="eligibility"
              name="eligibility"
              rows={3}
              value={formData.eligibility}
              onChange={handleChange}
              placeholder="Who is eligible to apply for this program?"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date *</label>
              <div className="date-input">
                <Calendar size={18} />
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={errors.startDate ? 'error' : ''}
                />
              </div>
              {errors.startDate && <span className="error-text">{errors.startDate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date *</label>
              <div className="date-input">
                <Calendar size={18} />
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={errors.endDate ? 'error' : ''}
                  min={formData.startDate}
                />
              </div>
              {errors.endDate && <span className="error-text">{errors.endDate}</span>}
            </div>
          </div>

          {errors.submit && (
            <div className="error-message">
              {errors.submit}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (program ? 'Update Program' : 'Create Program')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProgramModal