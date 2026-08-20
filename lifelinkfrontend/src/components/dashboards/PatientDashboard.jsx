import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { StatusTracker } from '../StatusTracker';
import { HeartPulse, PlusCircle, AlertTriangle, Building2, MapPin, Phone, User, CheckCircle2, Clock, X } from 'lucide-react';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'profile'
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    bloodGroup: user?.bloodGroup || 'A+',
    unitsInMl: 350,
    hospitalName: user?.hospitalName || 'Metro General Hospital',
    deliveryAddress: user?.address || 'Room 402, Metro Hospital',
    urgencyLevel: 'CRITICAL'
  });

  const [submitMsg, setSubmitMsg] = useState('');

  useEffect(() => {
    loadRequests();
  }, [user]);

  const loadRequests = async () => {
    setLoading(true);
    if (user?.id) {
      const data = await apiService.getPatientRequests(user.id);
      setRequests(data);
    }
    setLoading(false);
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setSubmitMsg('Broadcasting emergency blood request to network...');
    const result = await apiService.submitPatientRequest({
      patientId: user.id,
      patientName: user.name,
      patientPhone: user.phone,
      ...formData,
      unitsInMl: parseInt(formData.unitsInMl)
    });
    setSubmitMsg('Emergency request broadcasted! Blood Banks notified.');
    setTimeout(() => {
      setIsModalOpen(false);
      setSubmitMsg('');
      loadRequests();
    }, 1500);
  };

  // Find active ongoing request for live delivery tracker
  const activeRequest = requests.find(r => r.status === 'ACCEPTED' || r.status === 'PENDING') || requests[0];

  return (
    <div className="dashboard-container">
      <div className="dashboard-hero hero-patient">
        <div className="hero-content">
          <div className="hero-tag">
            <HeartPulse size={16} className="text-crimson" />
            <span>Emergency Patient Care Portal</span>
          </div>
          <h1>Patient Dashboard</h1>
          <p>Instant emergency blood requests & real-time express supply chain tracking.</p>
        </div>
        <button className="btn-primary btn-lg btn-danger-pulse" onClick={() => setIsModalOpen(true)}>
          <PlusCircle size={20} />
          <span>Request Emergency Blood</span>
        </button>
      </div>

      {/* Live Status Tracker Widget */}
      {activeRequest && (
        <div className="mb-4">
          <StatusTracker
            status={activeRequest.status}
            acceptedByBank={activeRequest.acceptedByBankName}
          />
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          My Blood Requests ({requests.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Patient Profile
        </button>
      </div>

      {activeTab === 'requests' ? (
        <div className="content-card">
          <div className="card-header">
            <h3>Request History & Status</h3>
            <span className="text-muted">{requests.length} Requests registered</span>
          </div>

          {loading ? (
            <p className="p-4 text-center text-muted">Loading requests...</p>
          ) : requests.length === 0 ? (
            <div className="empty-state">
              <HeartPulse size={40} className="text-muted" />
              <p>No active or past blood requests found.</p>
              <button className="btn-primary" onClick={() => setIsModalOpen(true)}>Create Request</button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Req ID</th>
                    <th>Blood Group</th>
                    <th>Volume (ml)</th>
                    <th>Hospital / Destination</th>
                    <th>Urgency</th>
                    <th>Fulfilled By Bank</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <tr key={req.id}>
                      <td><strong>#{req.id}</strong></td>
                      <td><span className="blood-chip">{req.bloodGroup}</span></td>
                      <td>{req.unitsInMl} ml</td>
                      <td>
                        <div>
                          <strong>{req.hospitalName}</strong>
                          <div className="text-muted text-sm">{req.deliveryAddress}</div>
                        </div>
                      </td>
                      <td>
                        <span className={`urgency-badge ${req.urgencyLevel?.toLowerCase()}`}>
                          {req.urgencyLevel}
                        </span>
                      </td>
                      <td>{req.acceptedByBankName || 'Broadcasted to all'}</td>
                      <td>
                        <span className={`status-pill ${req.status?.toLowerCase()}`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="content-card">
          <div className="card-header">
            <h3>Patient Profile Information</h3>
          </div>
          <div className="profile-details-grid">
            <div className="profile-field">
              <User size={18} className="text-muted" />
              <div>
                <span className="field-label">Full Name</span>
                <span className="field-value">{user?.name}</span>
              </div>
            </div>
            <div className="profile-field">
              <Phone size={18} className="text-muted" />
              <div>
                <span className="field-label">Contact Phone</span>
                <span className="field-value">{user?.phone || 'Not specified'}</span>
              </div>
            </div>
            <div className="profile-field">
              <Building2 size={18} className="text-muted" />
              <div>
                <span className="field-label">Hospital Association</span>
                <span className="field-value">{user?.hospitalName || 'Metro General Hospital'}</span>
              </div>
            </div>
            <div className="profile-field">
              <MapPin size={18} className="text-muted" />
              <div>
                <span className="field-label">Delivery Address</span>
                <span className="field-value">{user?.address || 'City Hospital Wing'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Request Blood Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex-align gap-2">
                <AlertTriangle className="text-crimson" size={24} />
                <h3>Request Emergency Blood</h3>
              </div>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleRequestSubmit} className="modal-body form-layout">
              {submitMsg && (
                <div className="alert-banner alert-success">
                  <CheckCircle2 size={18} />
                  <span>{submitMsg}</span>
                </div>
              )}

              <div className="form-row-2">
                <div className="input-group">
                  <label>Required Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Units / Quantity (ml)</label>
                  <input
                    type="number"
                    required
                    min={100}
                    max={2000}
                    value={formData.unitsInMl}
                    onChange={e => setFormData({ ...formData, unitsInMl: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Urgency Level</label>
                <select
                  value={formData.urgencyLevel}
                  onChange={e => setFormData({ ...formData, urgencyLevel: e.target.value })}
                >
                  <option value="CRITICAL">🔥 CRITICAL (Immediate Dispatch)</option>
                  <option value="HIGH">⚠️ HIGH (Within 2 Hours)</option>
                  <option value="MEDIUM">🟢 MEDIUM (Standard Order)</option>
                </select>
              </div>

              <div className="input-group">
                <label>Hospital / Destination Name</label>
                <input
                  type="text"
                  required
                  value={formData.hospitalName}
                  onChange={e => setFormData({ ...formData, hospitalName: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Exact Room / Delivery Address</label>
                <input
                  type="text"
                  required
                  value={formData.deliveryAddress}
                  onChange={e => setFormData({ ...formData, deliveryAddress: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-primary full-width mt-2 btn-danger-pulse">
                Broadcast Emergency Blood Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
