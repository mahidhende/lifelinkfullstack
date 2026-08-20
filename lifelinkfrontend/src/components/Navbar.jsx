import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { HeartPulse, Bell, Moon, Sun, LogOut, User as UserIcon, ShieldAlert } from 'lucide-react';

export const Navbar = ({ onOpenNotifications }) => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
      apiService.getUserNotifications(user.id).then(notifs => {
        const unread = notifs.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      });
    }
  }, [user]);

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'DONOR': return 'badge-donor';
      case 'PATIENT': return 'badge-patient';
      case 'BLOOD_BANK': return 'badge-bank';
      case 'DELIVERY_BOY': return 'badge-delivery';
      default: return 'badge-donor';
    }
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <div className="brand-logo">
          <div className="logo-icon-pulse">
            <HeartPulse size={28} className="heart-icon" />
          </div>
          <div className="brand-text">
            <span className="brand-title">LifeLink</span>
            <span className="brand-tagline">Blood Supply & Express Logistics</span>
          </div>
        </div>

        {user && (
          <div className="nav-actions">
            <div className={`role-pill ${getRoleBadgeColor(user.role)}`}>
              <span className="dot"></span>
              {user.role?.replace('_', ' ')}
            </div>

            <button className="icon-btn position-relative" onClick={onOpenNotifications} title="Notifications">
              <Bell size={20} />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>

            <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="user-profile-summary">
              <div className="avatar">
                <UserIcon size={18} />
              </div>
              <div className="user-details">
                <span className="user-name">{user.name}</span>
                <span className="user-sub">{user.bloodGroup || user.email}</span>
              </div>
            </div>

            <button className="logout-btn" onClick={logout} title="Logout">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
