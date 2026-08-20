import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { Truck, MapPin, Building2, User, Phone, CheckCircle, Navigation, ShieldCheck, Clock, CheckCheck } from 'lucide-react';

export const DeliveryBoyDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeliveryTasks();
  }, [user]);

  const loadDeliveryTasks = async () => {
    setLoading(true);
    if (user?.id) {
      const data = await apiService.getDeliveryTasks(user.id);
      setTasks(data);
    }
    setLoading(false);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    await apiService.updateDeliveryStatus(taskId, user.id, newStatus);
    loadDeliveryTasks();
  };

  const activeTasks = tasks.filter(t => t.status !== 'DELIVERED');
  const completedTasks = tasks.filter(t => t.status === 'DELIVERED');

  return (
    <div className="dashboard-container">
      <div className="dashboard-hero hero-delivery">
        <div className="hero-content">
          <div className="hero-tag">
            <Truck size={16} className="text-blue" />
            <span>Express Logistics & Cold-Chain Dispatch</span>
          </div>
          <h1>Rider Portal: {user?.name}</h1>
          <p>Deliver emergency blood units safely from Blood Banks directly to Patients & Hospitals.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-blue-light">
            <Navigation size={24} className="text-blue" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{activeTasks.length}</span>
            <span className="stat-label">Active Express Deliveries</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-emerald-light">
            <CheckCheck size={24} className="text-emerald" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{completedTasks.length}</span>
            <span className="stat-label">Completed Deliveries</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-crimson-light">
            <ShieldCheck size={24} className="text-crimson" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{user?.licenseNumber || 'RIDER-PASS'}</span>
            <span className="stat-label">Verified Express Rider</span>
          </div>
        </div>
      </div>

      {/* Delivery Orders */}
      <div className="content-card">
        <div className="card-header">
          <h3>Emergency Blood Dispatch Orders</h3>
          <button className="icon-btn-text" onClick={loadDeliveryTasks}>Refresh Orders</button>
        </div>

        {loading ? (
          <p className="p-4 text-center text-muted">Loading delivery dispatches...</p>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <Truck size={40} className="text-muted" />
            <p>No active delivery tasks assigned right now.</p>
          </div>
        ) : (
          <div className="delivery-cards-grid">
            {tasks.map(task => (
              <div key={task.id} className={`delivery-card ${task.status?.toLowerCase()}`}>
                <div className="delivery-card-header">
                  <div className="flex-align gap-2">
                    <span className="blood-chip-sm">{task.bloodGroup}</span>
                    <strong>{task.unitsInMl} ml Order #{task.id}</strong>
                  </div>
                  <span className={`status-pill ${task.status?.toLowerCase()}`}>
                    {task.status?.replace('_', ' ')}
                  </span>
                </div>

                <div className="delivery-route-details">
                  <div className="route-point pickup">
                    <Building2 size={18} className="text-emerald" />
                    <div>
                      <span className="point-label">PICKUP FROM (Blood Bank)</span>
                      <strong>{task.bloodBankName || 'Central Blood Bank'}</strong>
                      <div className="text-sm text-muted">{task.bloodBankAddress || 'Main Logistics Desk'}</div>
                    </div>
                  </div>

                  <div className="route-connector"></div>

                  <div className="route-point dropoff">
                    <MapPin size={18} className="text-crimson" />
                    <div>
                      <span className="point-label">DELIVER TO (Patient / Hospital)</span>
                      <strong>{task.patientName}</strong>
                      <div className="text-sm text-muted">{task.deliveryAddress}</div>
                      <div className="flex-align gap-1 text-sm mt-1">
                        <Phone size={12} /> <span>{task.patientPhone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="delivery-actions">
                  {task.status === 'PENDING_ASSIGNMENT' || task.status === 'ACCEPTED' ? (
                    <button
                      className="btn-primary full-width"
                      onClick={() => handleStatusChange(task.id, 'IN_TRANSIT')}
                    >
                      <Navigation size={16} /> Pickup Blood & Start Express Transit
                    </button>
                  ) : task.status === 'IN_TRANSIT' ? (
                    <button
                      className="btn-success full-width"
                      onClick={() => handleStatusChange(task.id, 'DELIVERED')}
                    >
                      <CheckCircle size={16} /> Confirm Handover & Mark Delivered
                    </button>
                  ) : (
                    <div className="fulfilled-badge">
                      <CheckCheck size={18} className="text-emerald" />
                      <span>Order Delivered Successfully</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
