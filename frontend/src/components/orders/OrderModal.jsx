// src/components/orders/OrderModal.jsx
import { useState } from 'react'
import { X, ShoppingCart } from 'lucide-react'
import api from '../../utils/api'
import './OrderModal.css'

const OrderModal = ({ products, onClose, onOrderCreated }) => {
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 1
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [selectedProduct, setSelectedProduct] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (name === 'productId') {
      const product = products.find(p => p._id === value)
      setSelectedProduct(product)
    }

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
    
    if (!formData.productId) newErrors.productId = 'Please select a product'
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = 'Valid quantity is required'
    
    if (selectedProduct && formData.quantity > selectedProduct.quantity) {
      newErrors.quantity = `Only ${selectedProduct.quantity} units available`
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const response = await api.post('/orders', {
        productId: formData.productId,
        quantity: Number(formData.quantity)
      })

      onOrderCreated(response.data)
    } catch (error) {
      console.error('Error creating order:', error)
      setErrors({ submit: error.response?.data?.message || 'Failed to create order' })
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = () => {
    if (!selectedProduct) return 0
    return selectedProduct.price * formData.quantity
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Create New Order</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="productId">Select Product *</label>
            <select
              id="productId"
              name="productId"
              value={formData.productId}
              onChange={handleChange}
              className={errors.productId ? 'error' : ''}
            >
              <option value="">Choose a product...</option>
              {products
                .filter(product => product.quantity > 0)
                .map(product => (
                  <option key={product._id} value={product._id}>
                    {product.name} - ${product.price} (Stock: {product.quantity})
                  </option>
                ))
              }
            </select>
            {errors.productId && <span className="error-text">{errors.productId}</span>}
          </div>

          {selectedProduct && (
            <div className="product-details">
              <h4>Product Details</h4>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="label">Price:</span>
                  <span className="value">${selectedProduct.price}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Available:</span>
                  <span className="value">{selectedProduct.quantity} units</span>
                </div>
                <div className="detail-item">
                  <span className="label">Category:</span>
                  <span className="value">{selectedProduct.category || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="quantity">Quantity *</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="1"
              max={selectedProduct?.quantity || 1}
              value={formData.quantity}
              onChange={handleChange}
              className={errors.quantity ? 'error' : ''}
            />
            {errors.quantity && <span className="error-text">{errors.quantity}</span>}
          </div>

          {selectedProduct && (
            <div className="order-summary">
              <h4>Order Summary</h4>
              <div className="summary-item">
                <span>Unit Price:</span>
                <span>${selectedProduct.price}</span>
              </div>
              <div className="summary-item">
                <span>Quantity:</span>
                <span>{formData.quantity}</span>
              </div>
              <div className="summary-item total">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          )}

          {errors.submit && (
            <div className="error-message">
              {errors.submit}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading || !selectedProduct}
            >
              {loading ? (
                <>
                  <ShoppingCart size={18} />
                  Creating Order...
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  Create Order
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default OrderModal