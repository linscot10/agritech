// src/components/orders/OrderDetailsModal.jsx
import { useState } from 'react'
import { X, Calendar, Truck, Package, User, DollarSign } from 'lucide-react'
import api from '../../utils/api'
import './OrderDetailsModal.css'

const OrderDetailsModal = ({ order, onClose, onStatusUpdate, userRole }) => {
  const [loading, setLoading] = useState(false)
  const [newStatus, setNewStatus] = useState(order.status)

  const handleStatusUpdate = async () => {
    if (newStatus === order.status) return

    setLoading(true)
    try {
      const response = await api.put(`/orders/${order._id}/status`, {
        status: newStatus
      })
      onStatusUpdate(response.data)
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending'
      case 'confirmed': return 'status-confirmed'
      case 'shipped': return 'status-shipped'
      case 'delivered': return 'status-delivered'
      case 'cancelled': return 'status-cancelled'
      default: return 'status-pending'
    }
  }

  const canUpdateStatus = userRole === 'admin' && order.status !== 'delivered' && order.status !== 'cancelled'

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Order Details</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="order-details">
          <div className="detail-section">
            <h3>
              <Package size={20} />
              Order Information
            </h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">Order ID:</span>
                <span className="value">#{order._id.slice(-6)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Status:</span>
                <span className={`value status ${getStatusClass(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Date:</span>
                <span className="value">
                  <Calendar size={16} />
                  {formatDate(order.createdAt)}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Total Amount:</span>
                <span className="value price">
                  <DollarSign size={16} />
                  {formatCurrency(order.totalPrice)}
                </span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>
              <User size={20} />
              Buyer Information
            </h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">Name:</span>
                <span className="value">{order.buyer?.name}</span>
              </div>
              <div className="detail-item">
                <span className="label">Email:</span>
                <span className="value">{order.buyer?.email}</span>
              </div>
              <div className="detail-item">
                <span className="label">Role:</span>
                <span className="value capitalize">{order.buyer?.role}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>
              <Package size={20} />
              Product Information
            </h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">Product:</span>
                <span className="value">{order.product?.name}</span>
              </div>
              <div className="detail-item">
                <span className="label">Price:</span>
                <span className="value">{formatCurrency(order.product?.price)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Quantity:</span>
                <span className="value">{order.quantity}</span>
              </div>
              <div className="detail-item">
                <span className="label">Category:</span>
                <span className="value">{order.product?.category || 'N/A'}</span>
              </div>
            </div>
          </div>

          {canUpdateStatus && (
            <div className="detail-section">
              <h3>
                <Truck size={20} />
                Update Status
              </h3>
              <div className="status-update">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="status-select"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={handleStatusUpdate}
                  disabled={loading || newStatus === order.status}
                  className="btn-primary"
                >
                  {loading ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailsModal