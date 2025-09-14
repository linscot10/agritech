// src/components/supplychain/SupplyChainModal.jsx
import { useState } from 'react'
import { X, Truck, MapPin, User, Calendar, Package, CheckCircle } from 'lucide-react'
import api from '../../utils/api'
import './SupplyChainModal.css'

const SupplyChainModal = ({ order, onClose, onStatusUpdate, userRole }) => {
  const [formData, setFormData] = useState({
    status: order.supplyChain?.status || 'PROCESSING',
    driver: order.supplyChain?.driver || '',
    vehicle: order.supplyChain?.vehicle || '',
    deliveryNotes: order.supplyChain?.deliveryNotes || ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    setLoading(true)
    try {
      const response = await api.put(`/supply-chain/${order._id}`, formData)
      onStatusUpdate(response.data.order)
    } catch (error) {
      console.error('Error updating supply chain:', error)
      alert('Failed to update supply chain information')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PROCESSING': return <Package size={20} />
      case 'DISPATCHED': return <Truck size={20} />
      case 'IN_TRANSIT': return <MapPin size={20} />
      case 'DELIVERED': return <CheckCircle size={20} />
      default: return <Package size={20} />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'PROCESSING': return 'Processing'
      case 'DISPATCHED': return 'Dispatched'
      case 'IN_TRANSIT': return 'In Transit'
      case 'DELIVERED': return 'Delivered'
      default: return 'Processing'
    }
  }

  const canEdit = userRole === 'admin' || userRole === 'farmer'

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Supply Chain Details</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          <div className="order-overview">
            <div className="overview-item">
              <Package size={18} />
              <span>Order #{order._id.slice(-6)}</span>
            </div>
            <div className="overview-item">
              <User size={18} />
              <span>{order.buyer?.name}</span>
            </div>
            <div className="overview-item">
              <Calendar size={18} />
              <span>{formatDate(order.createdAt)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="supply-chain-form">
            <div className="form-section">
              <h3>
                <Truck size={20} />
                Logistics Information
              </h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="status">Delivery Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={!canEdit}
                  >
                    <option value="PROCESSING">Processing</option>
                    <option value="DISPATCHED">Dispatched</option>
                    <option value="IN_TRANSIT">In Transit</option>
                    <option value="DELIVERED">Delivered</option>
                  </select>
                </div>

                <div className="current-status">
                  <span className="label">Current Status:</span>
                  <div className={`status status-${formData.status.toLowerCase()}`}>
                    {getStatusIcon(formData.status)}
                    {getStatusText(formData.status)}
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="driver">Driver Name</label>
                  <input
                    type="text"
                    id="driver"
                    name="driver"
                    value={formData.driver}
                    onChange={handleChange}
                    placeholder="Enter driver's name"
                    disabled={!canEdit}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="vehicle">Vehicle Info</label>
                  <input
                    type="text"
                    id="vehicle"
                    name="vehicle"
                    value={formData.vehicle}
                    onChange={handleChange}
                    placeholder="Enter vehicle number/ID"
                    disabled={!canEdit}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="deliveryNotes">Delivery Notes</label>
                <textarea
                  id="deliveryNotes"
                  name="deliveryNotes"
                  rows="3"
                  value={formData.deliveryNotes}
                  onChange={handleChange}
                  placeholder="Add any delivery notes, issues, or special instructions..."
                  disabled={!canEdit}
                />
              </div>
            </div>

            {order.supplyChain?.updatedAt && (
              <div className="last-update">
                <span className="label">Last updated:</span>
                <span className="value">{formatDate(order.supplyChain.updatedAt)}</span>
              </div>
            )}

            {canEdit && (
              <div className="form-actions">
                <button type="button" onClick={onClose} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Logistics'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default SupplyChainModal