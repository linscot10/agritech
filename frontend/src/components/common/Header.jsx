// src/components/common/Header.jsx
import { Menu, Bell, User } from 'lucide-react'
import { useAuth } from '../../Contexts/AuthContext'
import { useState, useEffect } from 'react'
import api from '../../utils/api'
import './Header.css'

const Header = ({ onMenuClick }) => {
    const { user } = useAuth()
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        fetchUnreadCount()
    }, [])

    const fetchUnreadCount = async () => {
        try {
            const response = await api.get('/notifications')
            const unread = response.data.filter(notif => !notif.isRead).length
            setUnreadCount(unread)
        } catch (error) {
            console.error('Error fetching notifications:', error)
        }
    }

    return (
        <header className="header">
            <div className="header-left">
                <button className="menu-btn" onClick={onMenuClick}>
                    <Menu size={24} />
                </button>
                <h1 className="header-title">Agritech Dashboard</h1>
            </div>

            <div className="header-right">
                <button className="icon-btn">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                    )}
                </button>

                <div className="user-menu">
                    <div className="user-avatar">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                        <span className="user-name">{user.name}</span>
                        <span className="user-role capitalize">{user.role}</span>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header