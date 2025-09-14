// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react'
import { 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Users, 
  Droplets,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { useAuth } from '../Contexts/AuthContext'
import api from '../utils/api'
import './Dashboard.css'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    sensorReadings: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentOrders, setRecentOrders] = useState([])
  const [recentProducts, setRecentProducts] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [
        productsRes, 
        ordersRes, 
        usersRes, 
        sensorsRes,
        analyticsRes
      ] = await Promise.all([
        api.get('/products?limit=5'),
        api.get('/orders?limit=5'),
        user.role === 'admin' ? api.get('/users') : Promise.resolve({ data: [] }),
        api.get('/sensors?limit=1'),
        api.get('/analytics/sales')
      ])

      setStats({
        totalProducts: productsRes.data.length,
        totalOrders: ordersRes.data.length,
        totalRevenue: analyticsRes.data.reduce((sum, item) => sum + item.totalRevenue, 0),
        totalUsers: usersRes.data.length,
        sensorReadings: sensorsRes.data.length
      })

      setRecentOrders(ordersRes.data.slice(0, 5))
      setRecentProducts(productsRes.data.slice(0, 5))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ icon: Icon, title, value, trend, subtitle }) => (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon size={24} />
      </div>
      <div className="stat-content">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-title">{title}</p>
        {trend && (
          <div className={`stat-trend ${trend > 0 ? 'positive' : 'negative'}`}>
            {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user.name}!</h1>
        <p>Here's what's happening with your farm today</p>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={Package}
          title="Total Products"
          value={stats.totalProducts}
          trend={12}
        />
        <StatCard
          icon={ShoppingCart}
          title="Total Orders"
          value={stats.totalOrders}
          trend={8}
        />
        <StatCard
          icon={BarChart3}
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          trend={15}
        />
        {user.role === 'admin' && (
          <StatCard
            icon={Users}
            title="Total Users"
            value={stats.totalUsers}
            trend={5}
          />
        )}
        <StatCard
          icon={Droplets}
          title="Sensor Readings"
          value={stats.sensorReadings}
          subtitle="Latest data available"
        />
      </div>

      <div className="dashboard-content">
        <div className="recent-section">
          <h2>Recent Orders</h2>
          <div className="recent-list">
            {recentOrders.length > 0 ? (
              recentOrders.map(order => (
                <div key={order._id} className="recent-item">
                  <div className="item-info">
                    <h4>Order #{order._id.slice(-6)}</h4>
                    <p>Status: <span className={`status-${order.status}`}>{order.status}</span></p>
                  </div>
                  <div className="item-value">
                    ${order.totalPrice}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No recent orders</p>
            )}
          </div>
        </div>

        <div className="recent-section">
          <h2>Recent Products</h2>
          <div className="recent-list">
            {recentProducts.length > 0 ? (
              recentProducts.map(product => (
                <div key={product._id} className="recent-item">
                  <div className="item-info">
                    <h4>{product.name}</h4>
                    <p>Price: ${product.price}</p>
                  </div>
                  <div className="item-value">
                    Qty: {product.quantity}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No products available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard