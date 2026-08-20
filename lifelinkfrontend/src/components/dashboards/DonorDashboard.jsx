import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { Droplet, Heart, PlusCircle, Clock, CheckCircle2, Building2, Calendar, ShieldCheck, X } from 'lucide-react';

export const DonorDashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    bloodBankId: '',
    bloodBankName: '',
    bloodGroup: user?.bloodGroup || 'O+',
    quantityMl: 450,
    notes: 'Feeling healthy & ready to donate.'
  });

  const [submitMsg, setSubmitMsg] = useState('');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    if (user?.id) {
      const [hist, banks] = await Promise.all([
        apiService.getDonorHistory(user.id),
        apiService.getBloodBanksList()
      ]);
      setHistory(hist);
      setBloodBanks(banks);
      if (banks.length > 0) {
        setFormData(prev => ({ ...prev, bloodBankId: banks[0].id, bloodBankName: banks[0].name }));
      }
    }
    setLoading(false);
  };

  const handleBankChange = (e) => {
    const bankId = parseInt(e.target.value);
    const bank = bloodBanks.find(b => b.id === bankId);
    setFormData({
      ...formData,
      bloodBankId: bankId,
      bloodBankName: bank ? bank.name : ''
    });
  };

  const handleSubmitDonation = async (e) => {
    e.preventDefault();
    setSubmitMsg('Submitting donation pledge...');
    const result = await apiService.submitDonation({
      donorId: user.id,
      donorName: user.name,
      donorPhone: user.phone,
      ...formData,
      quantityMl: parseInt(formData.quantityMl)
    });
    setSubmitMsg('Blood donation request successfully sent to Blood Bank!');
    setTimeout(() => {
      setIsModalOpen(false);
      setSubmitMsg('');
      loadData();
    }, 1500);
  };

  const totalDonatedMl = history
    .filter(h => h.status === 'ACCEPTED' || h.status === 'COMPLETED')
    .reduce((acc, curr) => acc + (curr.quantityMl || 0), 0);

  return (
    <div className="dashboard-container">
      <div className="dashboard-hero hero-donor">
        <div className="hero-content">
          <div className="hero-tag">
            <Heart size={16} className="text-crimson fill-crimson" />
            <span>Hero Donor Portal</span>
          </div>
          <h1>Welcome, {user?.name}!</h1>
          <p>Your selfless blood donations give critical patients another chance at life.</p>
        </div>
        <button className="btn-primary btn-lg" onClick={() => setIsModalOpen(true)}>
          <PlusCircle size={20} />
          <span>Donate Blood Now</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-crimson-light">
            <Droplet size={24} className="text-crimson" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalDonatedMl} ml</span>
            <span className="stat-label">Total Blood Donated</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-emerald-light">
            <Heart size={24} className="text-emerald" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{history.length}</span>
            <span className="stat-label">Total Donations</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-blue-light">
            <ShieldCheck size={24} className="text-blue" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{user?.bloodGroup || 'O+'}</span>
            <span className="stat-label">Your Blood Group</span>
          </div>
        </div>
      </div>

      {/* Donation History Table */}
      <div className="content-card">
        <div className="card-header">
          <h3>Your Donation Request History</h3>
          <span className="text-muted">{history.length} Records found</span>
        </div>

        {loading ? (
          <p className="p-4 text-center text-muted">Loading donation history...</p>
        ) : history.length === 0 ? (
          <div className="empty-state">
            <Droplet size={40} className="text-muted" />
            <p>You haven't submitted any donation requests yet.</p>
            <button className="btn-secondary" onClick={() => setIsModalOpen(true)}>Submit First Donation</button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Target Blood Bank</th>
                  <th>Blood Group</th>
                  <th>Quantity</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map(item => (
                  <tr key={item.id}>
                    <td><strong>#{item.id}</strong></td>
                    <td>
                      <div className="flex-align gap-2">
                        <Building2 size={16} className="text-muted" />
                        <span>{item.bloodBankName || 'Central Bank'}</span>
                      </div>
                    </td>
                    <td><span className="blood-chip">{item.bloodGroup}</span></td>
                    <td>{item.quantityMl} ml</td>
                    <td>{new Date(item.createdAt || Date.now()).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-pill ${item.status?.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Donate Blood Modal Form */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex-align gap-2">
                <Droplet className="text-crimson" size={24} />
                <h3>Blood Donation Request Form</h3>
              </div>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmitDonation} className="modal-body form-layout">
              {submitMsg && (
                <div className="alert-banner alert-success">
                  <CheckCircle2 size={18} />
                  <span>{submitMsg}</span>
                </div>
              )}

              <div className="input-group">
                <label>Select Target Blood Bank</label>
                <select value={formData.bloodBankId} onChange={handleBankChange} required>
                  {bloodBanks.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.address})</option>
                  ))}
                  {bloodBanks.length === 0 && <option value="3">Central Blood Bank</option>}
                </select>
              </div>

              <div className="form-row-2">
                <div className="input-group">
                  <label>Blood Group</label>
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
                  <label>Quantity (in ml)</label>
                  <input
                    type="number"
                    required
                    min={100}
                    max={500}
                    value={formData.quantityMl}
                    onChange={e => setFormData({ ...formData, quantityMl: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Additional Notes / Health Declaration</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Last donated 3 months ago, feeling fit."
                />
              </div>

              <button type="submit" className="btn-primary full-width mt-2">
                Confirm & Submit Donation
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
