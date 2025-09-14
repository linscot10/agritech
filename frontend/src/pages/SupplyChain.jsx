// src/pages/SupplyChain.jsx
import { useState, useEffect } from 'react'
import { Search, Filter, Truck, Package, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../Contexts/AuthContext'
import api from '../utils/api'
import SupplyChainModal from '../components/supplychain/SupplyChainModal'
import './SupplyChain.css'

const SupplyChain = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [ordersPerPage] = useState(10)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders')
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (order) => {
    setSelectedOrder(order)
  }

  const handleCloseModal = () => {
    setSelectedOrder(null)
    fetchOrders() // Refresh data to get updates
  }

  const handleStatusUpdate = (updatedOrder) => {
    setOrders(orders.map(order => 
      order._id === updatedOrder._id ? updatedOrder : order
    ))
  }

  // Filter orders based on search term and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplyChain?.driver?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplyChain?.vehicle?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.supplyChain?.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Get unique statuses for filter
  const statuses = ['all', 'PROCESSING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED']

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PROCESSING': return <Package size={16} />
      case 'DISPATCHED': return <Truck size={16} />
      case 'IN_TRANSIT': return <MapPin size={16} />
      case 'DELIVERED': return <CheckCircle size={16} />
      default: return <Clock size={16} />
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'PROCESSING': return 'status-processing'
      case 'DISPATCHED': return 'status-dispatched'
      case 'IN_TRANSIT': return 'status-in-transit'
      case 'DELIVERED': return 'status-delivered'
      default: return 'status-processing'
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

  if (loading) {
    return (
      <div className="supply-chain-loading">
        <div className="loading-spinner"></div>
        <p>Loading supply chain data...</p>
      </div>
    )
  }

  return (
    <div className="supply-chain">
      <div className="supply-chain-header">
        <div className="header-content">
          <h1>Supply Chain</h1>
          <p>Track and manage your order logistics and delivery status</p>
        </div>
      </div>

      <div className="supply-chain-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search orders, drivers, vehicles..."
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
                  {status === 'all' ? 'All Statuses' : getStatusText(status)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="stats">
          <span>{filteredOrders.length} orders found</span>
        </div>
      </div>

      <div className="supply-chain-grid">
        {currentOrders.length > 0 ? (
          currentOrders.map(order => (
            <SupplyChainCard
              key={order._id}
              order={order}
              onViewDetails={handleViewDetails}
              userRole={user.role}
              formatDate={formatDate}
              getStatusIcon={getStatusIcon}
              getStatusClass={getStatusClass}
              getStatusText={getStatusText}
            />
          ))
        ) : (
          <div className="empty-state">
            <Truck size={64} />
            <h3>No orders found</h3>
            <p>No orders match your search criteria</p>
          </div>
        )}
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

      {selectedOrder && (
        <SupplyChainModal
          order={selectedOrder}
          onClose={handleCloseModal}
          onStatusUpdate={handleStatusUpdate}
          userRole={user.role}
        />
      )}
    </div>
  )
}

const SupplyChainCard = ({ order, onViewDetails, userRole, formatDate, getStatusIcon, getStatusClass, getStatusText }) => {
  const supplyChain = order.supplyChain || { status: 'PROCESSING' }

  return (
    <div className="supply-chain-card">
      <div className="card-header">
        <div className="order-info">
          <h3>Order #{order._id.slice(-6)}</h3>
          <p className="product-name">{order.product?.name}</p>
        </div>
        <div className={`status ${getStatusClass(supplyChain.status)}`}>
          {getStatusIcon(supplyChain.status)}
          {getStatusText(supplyChain.status)}
        </div>
      </div>

      <div className="card-content">
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Buyer:</span>
            <span className="value">{order.buyer?.name}</span>
          </div>
          <div className="info-item">
            <span className="label">Quantity:</span>
            <span className="value">{order.quantity} units</span>
          </div>
          <div className="info-item">
            <span className="label">Order Date:</span>
            <span className="value">{formatDate(order.createdAt)}</span>
          </div>
          {supplyChain.driver && (
            <div className="info-item">
              <span className="label">Driver:</span>
              <span className="value">{supplyChain.driver}</span>
            </div>
          )}
          {supplyChain.vehicle && (
            <div className="info-item">
              <span className="label">Vehicle:</span>
              <span className="value">{supplyChain.vehicle}</span>
            </div>
          )}
          {supplyChain.updatedAt && (
            <div className="info-item">
              <span className="label">Last Update:</span>
              <span className="value">{formatDate(supplyChain.updatedAt)}</span>
            </div>
          )}
        </div>

        {supplyChain.deliveryNotes && (
          <div className="delivery-notes">
            <span className="label">Delivery Notes:</span>
            <p className="value">{supplyChain.deliveryNotes}</p>
          </div>
        )}

        {(!supplyChain.driver || !supplyChain.vehicle) && supplyChain.status !== 'DELIVERED' && (
          <div className="warning">
            <AlertCircle size={16} />
            <span>Logistics information needed</span>
          </div>
        )}
      </div>

      <div className="card-actions">
        <button 
          className="btn-primary"
          onClick={() => onViewDetails(order)}
        >
          View Details
        </button>
      </div>
    </div>
  )
}

export default SupplyChain