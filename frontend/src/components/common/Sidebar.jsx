// src/components/common/Sidebar.jsx
import { NavLink } from 'react-router-dom'
import { 
  Home, 
  Package, 
  BarChart3, 
  Droplets, 
  ShoppingCart, 
  MessageSquare,
  Bell,
  Users,
  MapPin,
  Warehouse,
  Calendar,
  Cloud,
  Truck,
  BookOpen,
  Settings,
  LogOut,
  X
} from 'lucide-react'
import { useAuth } from '../../Contexts/AuthContext'
import './Sidebar.css'

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth()

  const navigationItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/inventory', icon: Warehouse, label: 'Inventory' },
    { path: '/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/supply-chain', icon: Truck, label: 'Supply Chain' },
    { path: '/sensors', icon: Droplets, label: 'Sensors' },
    { path: '/geo-data', icon: MapPin, label: 'Farm Data' },
    { path: '/weather', icon: Cloud, label: 'Weather' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/forum', icon: MessageSquare, label: 'Forum' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/programs', icon: BookOpen, label: 'Programs' },
    { path: '/users', icon: Users, label: 'Users', adminOnly: true },
  ]

  const handleLogout = () => {
    logout()
    onClose()
  }

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Droplets size={32} />
            <span>Agritech</span>
          </div>
          <button className="sidebar-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => {
            if (item.adminOnly && user.role !== 'admin') return null
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
                onClick={onClose}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <span className="user-name">{user.name}</span>
              <span className="user-role capitalize">{user.role}</span>
            </div>
          </div>
          
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar