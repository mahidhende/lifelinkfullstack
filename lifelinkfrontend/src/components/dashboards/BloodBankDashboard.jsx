import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { Building2, Package, PlusCircle, CheckCircle, XCircle, AlertTriangle, RefreshCw, X, ShieldAlert } from 'lucide-react';

export const BloodBankDashboard = () => {
  const { user } = useAuth();
  const [stock, setStock] = useState([]);
  const [donorRequests, setDonorRequests] = useState([]);
  const [patientRequests, setPatientRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('stock'); // 'stock', 'donorReqs', 'patientReqs'
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stockForm, setStockForm] = useState({
    bloodGroup: 'A+',
    quantityMl: 500
  });

  useEffect(() => {
    loadAllBankData();
  }, [user]);

  const loadAllBankData = async () => {
    setLoading(true);
    if (user?.id) {
      const [stockData, donorReqData, patientReqData] = await Promise.all([
        apiService.getBankStock(user.id),
        apiService.getBankDonorRequests(user.id),
        apiService.getPendingPatientRequests()
      ]);
      setStock(stockData);
      setDonorRequests(donorReqData);
      setPatientRequests(patientReqData);
    }
    setLoading(false);
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    await apiService.addStock(user.id, stockForm.bloodGroup, stockForm.quantityMl);
    setIsStockModalOpen(false);
    loadAllBankData();
  };

  const handleDonationAction = async (donationId, newStatus) => {
    await apiService.updateDonationStatus(donationId, newStatus);
    loadAllBankData();
  };

  const handleAcceptPatientRequest = async (requestId) => {
    await apiService.acceptPatientRequest(requestId, user.id, user.name);
    loadAllBankData();
  };

  const totalUnitsMl = stock.reduce((sum, item) => sum + item.quantityMl, 0);

  return (
    <div className="dashboard-container">
      <div className="dashboard-hero hero-bank">
        <div className="hero-content">
          <div className="hero-tag">
            <Building2 size={16} className="text-emerald" />
            <span>Blood Bank Operation Management</span>
          </div>
          <h1>{user?.name || 'Central Blood Bank'}</h1>
          <p>Manage blood inventory stock, donor requests, and approve patient emergency fulfillments.</p>
        </div>
        <button className="btn-primary btn-lg" onClick={() => setIsStockModalOpen(true)}>
          <PlusCircle size={20} />
          <span>Add Stock to Inventory</span>
        </button>
      </div>

      {/* Quick Bank Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-crimson-light">
            <Package size={24} className="text-crimson" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalUnitsMl} ml</span>
            <span className="stat-label">Total Inventory Stock</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-emerald-light">
            <CheckCircle size={24} className="text-emerald" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{donorRequests.filter(d => d.status === 'PENDING').length}</span>
            <span className="stat-label">Pending Donor Pledges</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-blue-light">
            <AlertTriangle size={24} className="text-blue" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{patientRequests.length}</span>
            <span className="stat-label">Broadcasting Emergency Requests</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'stock' ? 'active' : ''}`}
          onClick={() => setActiveTab('stock')}
        >
          Inventory Stock ({stock.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'donorReqs' ? 'active' : ''}`}
          onClick={() => setActiveTab('donorReqs')}
        >
          Donor Pledges ({donorRequests.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'patientReqs' ? 'active' : ''}`}
          onClick={() => setActiveTab('patientReqs')}
        >
          Incoming Patient Requests ({patientRequests.length})
        </button>
      </div>

      {/* Tab 1: Inventory Stock */}
      {activeTab === 'stock' && (
        <div className="content-card">
          <div className="card-header">
            <h3>Current Blood Stock by Group</h3>
            <button className="icon-btn-text" onClick={loadAllBankData}><RefreshCw size={16} /> Refresh</button>
          </div>

          <div className="stock-cards-grid">
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => {
              const item = stock.find(s => s.bloodGroup === bg);
              const qty = item ? item.quantityMl : 0;
              return (
                <div key={bg} className={`stock-card ${qty < 500 ? 'low-stock' : ''}`}>
                  <div className="stock-bg-badge">{bg}</div>
                  <div className="stock-qty">{qty} <span className="unit">ml</span></div>
                  <span className={`stock-status-tag ${qty > 1000 ? 'good' : qty > 0 ? 'medium' : 'empty'}`}>
                    {qty > 1000 ? 'Optimal Stock' : qty > 0 ? 'Low Supply' : 'Out of Stock'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Donor Requests */}
      {activeTab === 'donorReqs' && (
        <div className="content-card">
          <div className="card-header">
            <h3>Donor Pledges & Submissions</h3>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Donor Name</th>
                  <th>Contact</th>
                  <th>Blood Group</th>
                  <th>Quantity</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {donorRequests.map(d => (
                  <tr key={d.id}>
                    <td><strong>{d.donorName}</strong></td>
                    <td>{d.donorPhone}</td>
                    <td><span className="blood-chip">{d.bloodGroup}</span></td>
                    <td>{d.quantityMl} ml</td>
                    <td>{new Date(d.createdAt || Date.now()).toLocaleDateString()}</td>
                    <td><span className={`status-pill ${d.status?.toLowerCase()}`}>{d.status}</span></td>
                    <td>
                      {d.status === 'PENDING' ? (
                        <div className="action-btn-group">
                          <button
                            className="btn-sm btn-success"
                            onClick={() => handleDonationAction(d.id, 'ACCEPTED')}
                          >
                            <CheckCircle size={14} /> Accept & Stock
                          </button>
                          <button
                            className="btn-sm btn-outline-danger"
                            onClick={() => handleDonationAction(d.id, 'REJECTED')}
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted text-sm">Action Complete</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Patient Broadcast Emergency Requests */}
      {activeTab === 'patientReqs' && (
        <div className="content-card">
          <div className="card-header">
            <h3>Broadcasted Patient Requests (Cross-Bank Dedicated System)</h3>
            <span className="text-sm text-muted">Accepting a request reserves stock and auto-assigns an Express Delivery Rider.</span>
          </div>

          {patientRequests.length === 0 ? (
            <div className="empty-state">
              <CheckCircle size={40} className="text-emerald" />
              <p>No active pending patient requests in queue!</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Req ID</th>
                    <th>Patient Name</th>
                    <th>Required Group</th>
                    <th>Volume Needed</th>
                    <th>Hospital & Room</th>
                    <th>Urgency</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {patientRequests.map(req => (
                    <tr key={req.id}>
                      <td><strong>#{req.id}</strong></td>
                      <td>
                        <strong>{req.patientName}</strong>
                        <div className="text-muted text-sm">{req.patientPhone}</div>
                      </td>
                      <td><span className="blood-chip">{req.bloodGroup}</span></td>
                      <td><strong>{req.unitsInMl} ml</strong></td>
                      <td>
                        <div>{req.hospitalName}</div>
                        <div className="text-muted text-sm">{req.deliveryAddress}</div>
                      </td>
                      <td>
                        <span className={`urgency-badge ${req.urgencyLevel?.toLowerCase()}`}>
                          {req.urgencyLevel}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-primary btn-sm"
                          onClick={() => handleAcceptPatientRequest(req.id)}
                        >
                          Accept Request & Dispatch Delivery
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Stock Modal */}
      {isStockModalOpen && (
        <div className="modal-overlay" onClick={() => setIsStockModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex-align gap-2">
                <Package className="text-emerald" size={24} />
                <h3>Add Stock to Inventory</h3>
              </div>
              <button className="close-btn" onClick={() => setIsStockModalOpen(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleAddStock} className="modal-body form-layout">
              <div className="input-group">
                <label>Blood Group</label>
                <select
                  value={stockForm.bloodGroup}
                  onChange={e => setStockForm({ ...stockForm, bloodGroup: e.target.value })}
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Volume to Add (ml)</label>
                <input
                  type="number"
                  required
                  min={100}
                  step={50}
                  value={stockForm.quantityMl}
                  onChange={e => setStockForm({ ...stockForm, quantityMl: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-primary full-width mt-2">
                Update Inventory Stock
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
