// src/pages/Notifications.jsx
import { useState, useEffect } from 'react'
import { Bell, CheckCircle, XCircle, ShoppingCart, Droplets, MessageSquare, AlertTriangle, Calendar, Filter } from 'lucide-react'
import { useAuth } from '../Contexts/AuthContext'
import api from '../utils/api'
import './Notifications.css'

const Notifications = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [notificationsPerPage] = useState(15)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications')
      setNotifications(response.data)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`)
      setNotifications(notifications.map(notif =>
        notif._id === notificationId ? { ...notif, isRead: true } : notif
      ))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(notif => !notif.isRead)
      await Promise.all(
        unreadNotifications.map(notif =>
          api.put(`/notifications/${notif._id}/read`)
        )
      )
      setNotifications(notifications.map(notif => ({ ...notif, isRead: true })))
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`)
      setNotifications(notifications.filter(notif => notif._id !== notificationId))
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notif.isRead
    return notif.type === filter
  })

  // Pagination
  const indexOfLastNotification = currentPage * notificationsPerPage
  const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage
  const currentNotifications = filteredNotifications.slice(indexOfFirstNotification, indexOfLastNotification)
  const totalPages = Math.ceil(filteredNotifications.length / notificationsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return <ShoppingCart size={18} />
      case 'irrigation':
        return <Droplets size={18} />
      case 'forum':
        return <MessageSquare size={18} />
      case 'reminder':
        return <Calendar size={18} />
      case 'general':
      default:
        return <Bell size={18} />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order':
        return 'var(--color-order)'
      case 'irrigation':
        return 'var(--color-irrigation)'
      case 'forum':
        return 'var(--color-forum)'
      case 'reminder':
        return 'var(--color-reminder)'
      case 'general':
      default:
        return 'var(--color-general)'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const unreadCount = notifications.filter(notif => !notif.isRead).length

  if (loading) {
    return (
      <div className="notifications-loading">
        <div className="loading-spinner"></div>
        <p>Loading notifications...</p>
      </div>
    )
  }

  return (
    <div className="notifications">
      <div className="notifications-header">
        <div className="header-content">
          <h1>Notifications</h1>
          <p>Stay updated with your farming activities</p>
        </div>
        
        <div className="header-stats">
          <div className="unread-badge">
            <Bell size={16} />
            <span>{unreadCount} unread</span>
          </div>
          
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="btn-secondary">
              <CheckCircle size={16} />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className="notifications-toolbar">
        <div className="filters">
          <div className="filter-group">
            <Filter size={16} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="order">Orders</option>
              <option value="irrigation">Irrigation</option>
              <option value="forum">Forum</option>
              <option value="reminder">Reminders</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>

        <div className="stats">
          <span>{filteredNotifications.length} notifications</span>
        </div>
      </div>

      <div className="notifications-list">
        {currentNotifications.length > 0 ? (
          currentNotifications.map(notification => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
              getNotificationIcon={getNotificationIcon}
              getNotificationColor={getNotificationColor}
              formatDate={formatDate}
            />
          ))
        ) : (
          <div className="empty-state">
            <Bell size={64} />
            <h3>No notifications</h3>
            <p>You're all caught up! New notifications will appear here.</p>
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
    </div>
  )
}

const NotificationItem = ({ notification, onMarkAsRead, onDelete, getNotificationIcon, getNotificationColor, formatDate }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="notification-icon" style={{ color: getNotificationColor(notification.type) }}>
        {getNotificationIcon(notification.type)}
      </div>

      <div className="notification-content">
        <div className="notification-header">
          <h4 className="notification-title">{notification.title}</h4>
          <span className="notification-time">{formatDate(notification.createdAt)}</span>
        </div>
        
        <p className="notification-message">{notification.message}</p>
        
        <div className="notification-type">
          <span>{notification.type}</span>
        </div>
      </div>

      <div className="notification-actions">
        {!notification.isRead && (
          <button
            onClick={() => onMarkAsRead(notification._id)}
            className="btn-icon"
            title="Mark as read"
          >
            <CheckCircle size={16} />
          </button>
        )}
        
        <button
          onClick={() => onDelete(notification._id)}
          className="btn-icon danger"
          title="Delete notification"
        >
          <XCircle size={16} />
        </button>
      </div>

      {!notification.isRead && (
        <div className="unread-indicator"></div>
      )}
    </div>
  )
}

export default Notifications