// src/components/sensors/SensorModal.jsx
import { useState } from 'react'
import { X, MapPin, Droplets, Thermometer, Gauge } from 'lucide-react'
import api from '../../utils/api'
import './SensorModal.css'

const SensorModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    soilMoisture: '',
    temperature: '',
    humidity: '',
    latitude: '',
    longitude: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.soilMoisture || formData.soilMoisture < 0 || formData.soilMoisture > 100) {
      newErrors.soilMoisture = 'Moisture must be between 0-100%'
    }
    if (!formData.temperature || formData.temperature < -50 || formData.temperature > 100) {
      newErrors.temperature = 'Temperature must be between -50°C and 100°C'
    }
    if (!formData.humidity || formData.humidity < 0 || formData.humidity > 100) {
      newErrors.humidity = 'Humidity must be between 0-100%'
    }
    
    // Validate coordinates if provided
    if (formData.latitude && (formData.latitude < -90 || formData.latitude > 90)) {
      newErrors.latitude = 'Latitude must be between -90 and 90'
    }
    if (formData.longitude && (formData.longitude < -180 || formData.longitude > 180)) {
      newErrors.longitude = 'Longitude must be between -180 and 180'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const location = formData.latitude && formData.longitude ? {
        type: 'Point',
        coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)]
      } : undefined

      await api.post('/sensors', {
        soilMoisture: parseFloat(formData.soilMoisture),
        temperature: parseFloat(formData.temperature),
        humidity: parseFloat(formData.humidity),
        location
      })

      onClose()
    } catch (error) {
      console.error('Error creating sensor reading:', error)
      setErrors({ submit: 'Failed to create sensor reading. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          }))
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Could not get current location. Please enter coordinates manually.')
        }
      )
    } else {
      alert('Geolocation is not supported by this browser.')
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Add Sensor Reading</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-section">
            <h3>
              <Droplets size={20} />
              Sensor Data
            </h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="soilMoisture">Soil Moisture (%) *</label>
                <input
                  type="number"
                  id="soilMoisture"
                  name="soilMoisture"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.soilMoisture}
                  onChange={handleChange}
                  className={errors.soilMoisture ? 'error' : ''}
                  placeholder="0-100%"
                  required
                />
                {errors.soilMoisture && <span className="error-text">{errors.soilMoisture}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="temperature">Temperature (°C) *</label>
                <input
                  type="number"
                  id="temperature"
                  name="temperature"
                  min="-50"
                  max="100"
                  step="0.1"
                  value={formData.temperature}
                  onChange={handleChange}
                  className={errors.temperature ? 'error' : ''}
                  placeholder="°C"
                  required
                />
                {errors.temperature && <span className="error-text">{errors.temperature}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="humidity">Humidity (%) *</label>
                <input
                  type="number"
                  id="humidity"
                  name="humidity"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.humidity}
                  onChange={handleChange}
                  className={errors.humidity ? 'error' : ''}
                  placeholder="0-100%"
                  required
                />
                {errors.humidity && <span className="error-text">{errors.humidity}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>
              <MapPin size={20} />
              Location (Optional)
            </h3>
            
            <div className="location-actions">
              <button type="button" onClick={getCurrentLocation} className="btn-secondary">
                Use Current Location
              </button>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="latitude">Latitude</label>
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
                />
                {errors.latitude && <span className="error-text">{errors.latitude}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="longitude">Longitude</label>
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
                />
                {errors.longitude && <span className="error-text">{errors.longitude}</span>}
              </div>
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
              {loading ? 'Adding Reading...' : 'Add Reading'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SensorModal