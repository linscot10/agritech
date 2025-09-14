// src/components/products/ProductModal.jsx
import { useState, useEffect } from 'react'
import { X, Upload, Image as ImageIcon } from 'lucide-react'
import api from '../../utils/api'
import './ProductModal.css'

const ProductModal = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    category: '',
    image: null
  })
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        quantity: product.quantity || '',
        category: product.category || '',
        image: null
      })
      if (product.image) {
        setImagePreview(`http://localhost:5000${product.image}`)
      }
    }
  }, [product])

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

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }))
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required'
    if (!formData.quantity || formData.quantity < 0) newErrors.quantity = 'Valid quantity is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('description', formData.description)
      submitData.append('price', formData.price)
      submitData.append('quantity', formData.quantity)
      submitData.append('category', formData.category)
      if (formData.image) {
        submitData.append('image', formData.image)
      }

      let response
      if (product) {
        response = await api.put(`/products/${product._id}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      } else {
        response = await api.post('/products', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      }

      onSave(response.data)
    } catch (error) {
      console.error('Error saving product:', error)
      setErrors({ submit: 'Failed to save product. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Product Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="price">Price ($) *</label>
              <input
                type="number"
                id="price"
                name="price"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                className={errors.price ? 'error' : ''}
              />
              {errors.price && <span className="error-text">{errors.price}</span>}
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
              />
              {errors.quantity && <span className="error-text">{errors.quantity}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Vegetables, Fruits"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? 'error' : ''}
              placeholder="Describe your product..."
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label>Product Image</label>
            <div className="image-upload">
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
              />
              <label htmlFor="image" className="upload-btn">
                <Upload size={20} />
                Choose Image
              </label>
              
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
              
              {!imagePreview && (
                <div className="image-placeholder">
                  <ImageIcon size={32} />
                  <span>No image selected</span>
                </div>
              )}
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
              {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductModal