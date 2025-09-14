// src/components/geodata/GeoDataModal.jsx
import { useState, useEffect } from 'react'
import { X, MapPin, Droplets, Sprout, Plus, XCircle } from 'lucide-react'
import api from '../../utils/api'
import './GeoDataModal.css'

const GeoDataModal = ({ data, onClose, viewMode = false }) => {
  const [formData, setFormData] = useState({
    farmName: '',
    latitude: '',
    longitude: '',
    soilType: 'CLAY',
    waterSource: 'RIVER',
    produce: []
  })
  const [newProduce, setNewProduce] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const soilTypes = ['CLAY', 'SANDY', 'LOAMY', 'SILTY', 'PEATY', 'CHALKY']
  const waterSources = ['RIVER', 'WELL', 'RAINFED', 'IRRIGATION_SYSTEM']

  useEffect(() => {
    if (data) {
      setFormData({
        farmName: data.farmName || '',
        latitude: data.location?.latitude?.toString() || '',
        longitude: data.location?.longitude?.toString() || '',
        soilType: data.soilType || 'CLAY',
        waterSource: data.waterSource || 'RIVER',
        produce: data.produce || []
      })
    }
  }, [data])

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

  const handleAddProduce = () => {
    if (newProduce.trim() && !formData.produce.includes(newProduce.trim())) {
      setFormData(prev => ({
        ...prev,
        produce: [...prev.produce, newProduce.trim()]
      }))
      setNewProduce('')
    }
  }

  const handleRemoveProduce = (index) => {
    setFormData(prev => ({
      ...prev,
      produce: prev.produce.filter((_, i) => i !== index)
    }))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddProduce()
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.farmName.trim()) newErrors.farmName = 'Farm name is required'
    if (!formData.latitude || formData.latitude < -90 || formData.latitude > 90) {
      newErrors.latitude = 'Valid latitude is required (-90 to 90)'
    }
    if (!formData.longitude || formData.longitude < -180 || formData.longitude > 180) {
      newErrors.longitude = 'Valid longitude is required (-180 to 180)'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const submitData = {
        farmName: formData.farmName,
        location: {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude)
        },
        soilType: formData.soilType,
        waterSource: formData.waterSource,
        produce: formData.produce
      }

      if (data) {
        await api.put(`/geo-data/${data._id}`, submitData)
      } else {
        await api.post('/geo-data', submitData)
      }

      onClose()
    } catch (error) {
      console.error('Error saving geo data:', error)
      setErrors({ submit: 'Failed to save farm data. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const formatSoilType = (type) => {
    return type.charAt(0) + type.slice(1).toLowerCase()
  }

  const formatWaterSource = (source) => {
    return source.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{viewMode ? 'Farm Details' : (data ? 'Edit Farm Data' : 'Add Farm Data')}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-section">
            <h3>
              <MapPin size={20} />
              Farm Information
            </h3>
            
            <div className="form-group">
              <label htmlFor="farmName">Farm Name *</label>
              <input
                type="text"
                id="farmName"
                name="farmName"
                value={formData.farmName}
                onChange={handleChange}
                className={errors.farmName ? 'error' : ''}
                placeholder="Enter farm name"
                disabled={viewMode}
                required
              />
              {errors.farmName && <span className="error-text">{errors.farmName}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="latitude">Latitude *</label>
                <input
                  type="number"
                  id="latitude"
                  name="latitude"
                  min="-90"
                  max="90"
                  step="0.000001"
                  value={formData.latitude}
                  onChange={handleChange}
                  className={errors.latitude ? 'error' : ''}
                  placeholder="e.g., 40.7128"
                  disabled={viewMode}
                  required
                />
                {errors.latitude && <span className="error-text">{errors.latitude}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="longitude">Longitude *</label>
                <input
                  type="number"
                  id="longitude"
                  name="longitude"
                  min="-180"
                  max="180"
                  step="0.000001"
                  value={formData.longitude}
                  onChange={handleChange}
                  className={errors.longitude ? 'error' : ''}
                  placeholder="e.g., -74.0060"
                  disabled={viewMode}
                  required
                />
                {errors.longitude && <span className="error-text">{errors.longitude}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>
              <Droplets size={20} />
              Soil & Water
            </h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="soilType">Soil Type *</label>
                <select
                  id="soilType"
                  name="soilType"
                  value={formData.soilType}
                  onChange={handleChange}
                  disabled={viewMode}
                  required
                >
                  {soilTypes.map(type => (
                    <option key={type} value={type}>
                      {formatSoilType(type)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="waterSource">Water Source *</label>
                <select
                  id="waterSource"
                  name="waterSource"
                  value={formData.waterSource}
                  onChange={handleChange}
                  disabled={viewMode}
                  required
                >
                  {waterSources.map(source => (
                    <option key={source} value={source}>
                      {formatWaterSource(source)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>
              <Sprout size={20} />
              Produce
            </h3>
            
            {!viewMode && (
              <div className="produce-input">
                <input
                  type="text"
                  value={newProduce}
                  onChange={(e) => setNewProduce(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add produce (e.g., Maize, Tomatoes)"
                  className="produce-field"
                />
                <button
                  type="button"
                  onClick={handleAddProduce}
                  className="add-produce-btn"
                  disabled={!newProduce.trim()}
                >
                  <Plus size={16} />
                </button>
              </div>
            )}

            {formData.produce.length > 0 ? (
              <div className="produce-tags">
                {formData.produce.map((item, index) => (
                  <span key={index} className="produce-tag">
                    {item}
                    {!viewMode && (
                      <button
                        type="button"
                        onClick={() => handleRemoveProduce(index)}
                        className="remove-tag"
                      >
                        <XCircle size={14} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <p className="no-produce">No produce added yet</p>
            )}
          </div>

          {errors.submit && (
            <div className="error-message">
              {errors.submit}
            </div>
          )}

          {!viewMode && (
            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : (data ? 'Update Farm Data' : 'Add Farm Data')}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default GeoDataModal