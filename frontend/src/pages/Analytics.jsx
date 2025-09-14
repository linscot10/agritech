// src/pages/Analytics.jsx
import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, TrendingDown, Users, MessageSquare, ShoppingCart, Package, Droplets, Calendar } from 'lucide-react'
import { useAuth } from '../Contexts/AuthContext'
import api from '../utils/api'
import './Analytics.css'

const Analytics = () => {
  const { user } = useAuth()
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7days')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    try {
      const response = await api.get('/analytics/dashboard')
      setAnalyticsData(response.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US').format(number)
  }

  const getTrendIcon = (value) => {
    return value > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />
  }

  const getTrendClass = (value) => {
    return value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral'
  }

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics data...</p>
      </div>
    )
  }

  return (
    <div className="analytics">
      <div className="analytics-header">
        <div className="header-content">
          <h1>Analytics Dashboard</h1>
          <p>Gain insights into your farming business performance</p>
        </div>
        
        <div className="header-controls">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-selector"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
          </select>
        </div>
      </div>

      <div className="analytics-tabs">
        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={18} />
          Overview
        </button>
        <button
          className={activeTab === 'sales' ? 'active' : ''}
          onClick={() => setActiveTab('sales')}
        >
          <ShoppingCart size={18} />
          Sales
        </button>
        <button
          className={activeTab === 'products' ? 'active' : ''}
          onClick={() => setActiveTab('products')}
        >
          <Package size={18} />
          Products
        </button>
        <button
          className={activeTab === 'irrigation' ? 'active' : ''}
          onClick={() => setActiveTab('irrigation')}
        >
          <Droplets size={18} />
          Irrigation
        </button>
        {user.role === 'admin' && (
          <button
            className={activeTab === 'forum' ? 'active' : ''}
            onClick={() => setActiveTab('forum')}
          >
            <MessageSquare size={18} />
            Forum
          </button>
        )}
      </div>

      {activeTab === 'overview' && analyticsData && (
        <div className="overview-content">
          {/* Key Metrics */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-header">
                <ShoppingCart size={20} />
                <span>Total Revenue</span>
              </div>
              <div className="metric-value">
                {formatCurrency(analyticsData.sales.reduce((sum, item) => sum + item.totalRevenue, 0))}
              </div>
              <div className="metric-trend positive">
                {getTrendIcon(12)}
                <span>12% increase</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <Package size={20} />
                <span>Total Orders</span>
              </div>
              <div className="metric-value">
                {formatNumber(analyticsData.sales.reduce((sum, item) => sum + item.totalOrders, 0))}
              </div>
              <div className="metric-trend positive">
                {getTrendIcon(8)}
                <span>8% increase</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <Users size={20} />
                <span>Active Users</span>
              </div>
              <div className="metric-value">
                {user.role === 'admin' ? formatNumber(125) : 'N/A'}
              </div>
              <div className="metric-trend positive">
                {getTrendIcon(5)}
                <span>5% growth</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <Droplets size={20} />
                <span>Water Saved</span>
              </div>
              <div className="metric-value">
                12,500 L
              </div>
              <div className="metric-trend positive">
                {getTrendIcon(15)}
                <span>15% efficiency</span>
              </div>
            </div>
          </div>

          {/* Sales Chart */}
          <div className="chart-section">
            <h3>Sales Performance</h3>
            <div className="chart-placeholder">
              <BarChart3 size={48} />
              <p>Sales chart would be displayed here</p>
              <span className="chart-note">Visualization of revenue and orders over time</span>
            </div>
          </div>

          {/* Top Products */}
          <div className="top-products">
            <h3>Top Performing Products</h3>
            <div className="products-list">
              {analyticsData.topProducts.slice(0, 5).map((product, index) => (
                <div key={product._id?._id || index} className="product-item">
                  <div className="product-info">
                    <span className="rank">{index + 1}</span>
                    <span className="name">{product._id?.name || 'Unknown Product'}</span>
                  </div>
                  <div className="product-stats">
                    <span className="quantity">{formatNumber(product.totalQuantity)} sold</span>
                    <span className="revenue">{formatCurrency(product.totalRevenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sales' && analyticsData && (
        <div className="sales-content">
          <div className="sales-header">
            <h2>Sales Analytics</h2>
            <p>Detailed breakdown of sales performance</p>
          </div>

          <div className="sales-stats">
            {analyticsData.sales.map((sale, index) => (
              <div key={index} className="sale-stat">
                <h4>{sale._id}</h4>
                <div className="stat-details">
                  <div className="stat-item">
                    <span className="label">Orders:</span>
                    <span className="value">{formatNumber(sale.totalOrders)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="label">Revenue:</span>
                    <span className="value">{formatCurrency(sale.totalRevenue)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="sales-chart">
            <h3>Revenue by Status</h3>
            <div className="chart-placeholder">
              <BarChart3 size={48} />
              <p>Revenue distribution chart</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && analyticsData && (
        <div className="products-content">
          <h2>Product Performance</h2>
          <div className="products-grid">
            {analyticsData.topProducts.map((product, index) => (
              <div key={product._id?._id || index} className="product-card">
                <div className="product-header">
                  <span className="rank">#{index + 1}</span>
                  <h4>{product._id?.name || 'Unknown Product'}</h4>
                </div>
                <div className="product-details">
                  <div className="detail-item">
                    <span className="label">Price:</span>
                    <span className="value">{product._id?.price ? formatCurrency(product._id.price) : 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Sold:</span>
                    <span className="value">{formatNumber(product.totalQuantity)} units</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Revenue:</span>
                    <span className="value revenue">{formatCurrency(product.totalRevenue)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'irrigation' && (
        <div className="irrigation-content">
          <h2>Irrigation Analytics</h2>
          <div className="irrigation-stats">
            <div className="stat-card">
              <Droplets size={32} />
              <div className="stat-content">
                <h3>Water Usage</h3>
                <p>Optimized irrigation saved 25% water</p>
                <span className="stat-value">12,500 L saved</span>
              </div>
            </div>
            
            <div className="stat-card">
              <TrendingUp size={32} />
              <div className="stat-content">
                <h3>Efficiency</h3>
                <p>15% improvement in water efficiency</p>
                <span className="stat-value">85% efficiency</span>
              </div>
            </div>
          </div>

          <div className="irrigation-chart">
            <h3>Water Usage Trends</h3>
            <div className="chart-placeholder">
              <BarChart3 size={48} />
              <p>Water usage and savings over time</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'forum' && user.role === 'admin' && analyticsData && (
        <div className="forum-content">
          <h2>Forum Engagement</h2>
          <div className="forum-stats">
            <div className="forum-stat">
              <MessageSquare size={32} />
              <div className="stat-content">
                <h3>Total Posts</h3>
                <span className="stat-value">{formatNumber(analyticsData.forum.posts)}</span>
              </div>
            </div>
            
            <div className="forum-stat">
              <Users size={32} />
              <div className="stat-content">
                <h3>Total Comments</h3>
                <span className="stat-value">{formatNumber(analyticsData.forum.comments)}</span>
              </div>
            </div>
          </div>

          <div className="engagement-chart">
            <h3>Community Engagement</h3>
            <div className="chart-placeholder">
              <BarChart3 size={48} />
              <p>Post and comment activity over time</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Analytics