// src/components/common/Layout.jsx
import { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../Contexts/AuthContext'
import Sidebar from './Sidebar'
import Header from './Header'
import './Layout.css'

const Layout = () => {
  const { user, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="layout">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      <div className="layout-content">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout