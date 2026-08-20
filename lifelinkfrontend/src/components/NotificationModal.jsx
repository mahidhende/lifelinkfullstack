import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { X, Bell, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export const NotificationModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user?.id) {
      setLoading(true);
      apiService.getUserNotifications(user.id).then(res => {
        setNotifications(res);
        setLoading(false);
      });
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card notification-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex-align gap-2">
            <Bell className="text-crimson" size={22} />
            <h3>Your Alerts & Notifications</h3>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          {loading ? (
            <p className="text-muted p-4 text-center">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <div className="empty-state">
              <Info size={36} className="text-muted" />
              <p>No new notifications right now.</p>
            </div>
          ) : (
            <div className="notification-list">
              {notifications.map(n => (
                <div key={n.id} className="notification-item">
                  <div className="notif-icon">
                    {n.type === 'DONATION_UPDATE' ? <CheckCircle className="text-emerald" size={20} /> :
                     n.type === 'PATIENT_REQUEST' ? <AlertTriangle className="text-crimson" size={20} /> :
                     <Info className="text-blue" size={20} />}
                  </div>
                  <div className="notif-content">
                    <p className="notif-msg">{n.message}</p>
                    <span className="notif-time">{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
