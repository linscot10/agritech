// src/pages/Orders.jsx
import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Eye, Edit, Truck, Package } from 'lucide-react'
import { useAuth } from '../Contexts/AuthContext'
import api from '../utils/api'
import OrderModal from '../components/orders/OrderModal'
import OrderDetailsModal from '../components/orders/OrderDetailsModal'
import './Orders.css'

const Orders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [ordersPerPage] = useState(10)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.get('/orders'),
        api.get('/products')
      ])
      setOrders(ordersRes.data)
      setProducts(productsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrder = () => {
    setShowCreateModal(true)
  }

  const handleViewDetails = (order) => {
    setSelectedOrder(order)
  }

  const handleCloseModals = () => {
    setShowCreateModal(false)
    setSelectedOrder(null)
  }

  const handleOrderCreated = (newOrder) => {
    setOrders([newOrder, ...orders])
    setShowCreateModal(false)
  }

  const handleStatusUpdate = (updatedOrder) => {
    setOrders(orders.map(order => 
      order._id === updatedOrder._id ? updatedOrder : order
    ))
    setSelectedOrder(null)
  }

  // Filter orders based on search term and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Get unique statuses for filter
  const statuses = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'Ksh'
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

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="loading-spinner"></div>
        <p>Loading orders...</p>
      </div>
    )
  }

  return (
    <div className="orders">
      <div className="orders-header">
        <div className="header-content">
          <h1>Orders</h1>
          <p>Manage your product orders and track their status</p>
        </div>
        {user.role !== 'tech' && (
          <button className="btn-primary" onClick={handleCreateOrder}>
            <Plus size={20} />
            New Order
          </button>
        )}
      </div>

      <div className="orders-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters">
          <div className="filter-group">
            <Filter size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="stats">
          <span>{filteredOrders.length} orders found</span>
        </div>
      </div>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Product</th>
              <th>Buyer</th>
              <th>Quantity</th>
              <th>Total Price</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.length > 0 ? (
              currentOrders.map(order => (
                <OrderRow
                  key={order._id}
                  order={order}
                  onViewDetails={handleViewDetails}
                  userRole={user.role}
                  formatDate={formatDate}
                  formatCurrency={formatCurrency}
                  getStatusClass={getStatusClass}
                />
              ))
            ) : (
              <tr>
                <td colSpan="8" className="empty-state">
                  <div className="empty-content">
                    <Package size={64} />
                    <h3>No orders found</h3>
                    <p>Get started by creating your first order</p>
                    {user.role !== 'tech' && (
                      <button className="btn-primary" onClick={handleCreateOrder}>
                        <Plus size={20} />
                        New Order
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
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

      {showCreateModal && (
        <OrderModal
          products={products}
          onClose={handleCloseModals}
          onOrderCreated={handleOrderCreated}
        />
      )}

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={handleCloseModals}
          onStatusUpdate={handleStatusUpdate}
          userRole={user.role}
        />
      )}
    </div>
  )
}

const OrderRow = ({ order, onViewDetails, userRole, formatDate, formatCurrency, getStatusClass }) => {
  return (
    <tr>
      <td>
        <div className="order-id">
          <strong>#{order._id.slice(-6)}</strong>
        </div>
      </td>
      <td>
        <div className="product-info">
          <div className="product-name">{order.product?.name}</div>
          <div className="product-price">{formatCurrency(order.product?.price)} each</div>
        </div>
      </td>
      <td>
        <div className="buyer-info">
          <div className="buyer-name">{order.buyer?.name}</div>
          <div className="buyer-email">{order.buyer?.email}</div>
        </div>
      </td>
      <td>
        <span className="quantity">{order.quantity}</span>
      </td>
      <td>
        <span className="total-price">{formatCurrency(order.totalPrice)}</span>
      </td>
      <td>
        <span className={`status ${getStatusClass(order.status)}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </td>
      <td>
        <span className="date">{formatDate(order.createdAt)}</span>
      </td>
      <td>
        <div className="actions">
          <button 
            className="btn-icon" 
            onClick={() => onViewDetails(order)}
            title="View Details"
          >
            <Eye size={16} />
          </button>
          {userRole === 'admin' && order.status === 'pending' && (
            <button 
              className="btn-icon" 
              onClick={() => onViewDetails(order)}
              title="Manage Order"
            >
              <Edit size={16} />
            </button>
          )}
          {userRole === 'admin' && order.status === 'confirmed' && (
            <button 
              className="btn-icon" 
              onClick={() => onViewDetails(order)}
              title="Update Shipping"
            >
              <Truck size={16} />
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

export default Orders