// src/components/inventory/InventoryModal.jsx
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import api from '../../utils/api'
import './InventoryModal.css'

const InventoryModal = ({ item, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'OTHER',
    quantity: '',
    unit: '',
    acquiredDate: '',
    expiryDate: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const categories = [
    { value: 'SEED', label: 'Seed' },
    { value: 'FERTILIZER', label: 'Fertilizer' },
    { value: 'TOOL', label: 'Tool' },
    { value: 'EQUIPMENT', label: 'Equipment' },
    { value: 'OTHER', label: 'Other' }
  ]

  const units = [
    { value: '', label: 'Select Unit' },
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'g', label: 'Grams (g)' },
    { value: 'l', label: 'Liters (l)' },
    { value: 'ml', label: 'Milliliters (ml)' },
    { value: 'pieces', label: 'Pieces' },
    { value: 'bags', label: 'Bags' },
    { value: 'boxes', label: 'Boxes' }
  ]

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        category: item.category || 'OTHER',
        quantity: item.quantity || '',
        unit: item.unit || '',
        acquiredDate: item.acquiredDate ? new Date(item.acquiredDate).toISOString().split('T')[0] : '',
        expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : ''
      })
    }
  }, [item])

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
    
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.quantity || formData.quantity < 0) newErrors.quantity = 'Valid quantity is required'
    if (formData.expiryDate && new Date(formData.expiryDate) < new Date(formData.acquiredDate || new Date())) {
      newErrors.expiryDate = 'Expiry date cannot be before acquired date'
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
        ...formData,
        quantity: parseInt(formData.quantity),
        acquiredDate: formData.acquiredDate || new Date().toISOString(),
        expiryDate: formData.expiryDate || undefined
      }

      let response
      if (item) {
        response = await api.put(`/inventory/${item._id}`, submitData)
      } else {
        response = await api.post('/inventory', submitData)
      }

      onSave(response.data.item)
    } catch (error) {
      console.error('Error saving inventory item:', error)
      setErrors({ submit: 'Failed to save item. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{item ? 'Edit Inventory Item' : 'Add New Inventory Item'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Item Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
                placeholder="Enter item name"
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quantity">Quantity *</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min="0"
                value={formData.quantity}
                onChange={handleChange}
                className={errors.quantity ? 'error' : ''}
                placeholder="Enter quantity"
              />
              {errors.quantity && <span className="error-text">{errors.quantity}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="unit">Unit</label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
              >
                {units.map(unit => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="acquiredDate">Acquired Date</label>
              <input
                type="date"
                id="acquiredDate"
                name="acquiredDate"
                value={formData.acquiredDate}
                onChange={handleChange}
                max={formData.expiryDate || undefined}
              />
            </div>

            <div className="form-group">
              <label htmlFor="expiryDate">Expiry Date</label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                min={formData.acquiredDate || new Date().toISOString().split('T')[0]}
                className={errors.expiryDate ? 'error' : ''}
              />
              {errors.expiryDate && <span className="error-text">{errors.expiryDate}</span>}
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
              {loading ? 'Saving...' : (item ? 'Update Item' : 'Create Item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default InventoryModal