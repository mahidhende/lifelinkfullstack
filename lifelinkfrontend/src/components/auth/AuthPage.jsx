import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { HeartPulse, Mail, Lock, User, Phone, MapPin, Building2, Truck, Droplet, AlertCircle } from 'lucide-react';

export const AuthPage = ({ onOpenForgotPassword }) => {
  const { login } = useAuth();
  const [activeRole, setActiveRole] = useState('DONOR');
  const [isRegister, setIsRegister] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    bloodGroup: 'O+',
    address: '',
    licenseNumber: '',
    hospitalName: ''
  });

  const roles = [
    { id: 'DONOR', label: 'Blood Donor', icon: Droplet, desc: 'Donate blood to save lives' },
    { id: 'PATIENT', label: 'Patient / Hospital', icon: HeartPulse, desc: 'Request blood emergency' },
    { id: 'BLOOD_BANK', label: 'Blood Bank', icon: Building2, desc: 'Manage stock & supply' },
    { id: 'DELIVERY_BOY', label: 'Delivery Rider', icon: Truck, desc: 'Dispatch & deliver blood' }
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (isRegister) {
      const res = await apiService.register({ ...formData, role: activeRole });
      setLoading(false);
      if (res.success) {
        login(res.user);
      } else {
        setErrorMsg(res.message);
      }
    } else {
      const res = await apiService.login(formData.email, formData.password, activeRole);
      setLoading(false);
      if (res.success) {
        login(res.user);
      } else {
        setErrorMsg(res.message);
      }
    }
  };

  const fillDemoAccount = () => {
    switch (activeRole) {
      case 'DONOR':
        setFormData(prev => ({ ...prev, email: 'donor@lifelink.com', password: 'password123' }));
        break;
      case 'PATIENT':
        setFormData(prev => ({ ...prev, email: 'patient@lifelink.com', password: 'password123' }));
        break;
      case 'BLOOD_BANK':
        setFormData(prev => ({ ...prev, email: 'bank@lifelink.com', password: 'password123' }));
        break;
      case 'DELIVERY_BOY':
        setFormData(prev => ({ ...prev, email: 'delivery@lifelink.com', password: 'password123' }));
        break;
      default:
        break;
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-glass">
        <div className="auth-header">
          <div className="pulse-badge">
            <HeartPulse size={24} className="text-crimson" />
          </div>
          <h2>{isRegister ? 'Create Account' : 'Welcome to LifeLink'}</h2>
          <p className="auth-sub">Select your portal role to continue</p>
        </div>

        {/* Role Selection Tabs */}
        <div className="role-selector-grid">
          {roles.map(role => {
            const IconComp = role.icon;
            const isSelected = activeRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                className={`role-tab-btn ${isSelected ? 'active' : ''}`}
                onClick={() => { setActiveRole(role.id); setErrorMsg(''); }}
              >
                <IconComp size={20} className={isSelected ? 'text-crimson' : 'text-muted'} />
                <span className="role-btn-title">{role.label}</span>
              </button>
            );
          })}
        </div>

        {errorMsg && (
          <div className="alert-banner alert-error">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form-body">
          {isRegister && (
            <div className="input-group">
              <label>Full Name / Organization Name</label>
              <div className="input-icon-wrapper">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. John Doe / Central Hospital"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label>Email Address</label>
            <div className="input-icon-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                name="email"
                required
                placeholder="e.g. user@lifelink.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="input-group">
            <div className="label-flex">
              <label>Password</label>
              {!isRegister && (
                <button
                  type="button"
                  className="link-btn-sm"
                  onClick={() => onOpenForgotPassword(activeRole)}
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="input-icon-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          {isRegister && (
            <>
              <div className="input-group">
                <label>Phone Number</label>
                <div className="input-icon-wrapper">
                  <Phone className="input-icon" size={18} />
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+1 234 567 8900"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {(activeRole === 'DONOR' || activeRole === 'PATIENT') && (
                <div className="input-group">
                  <label>Blood Group</label>
                  <div className="input-icon-wrapper">
                    <Droplet className="input-icon text-crimson" size={18} />
                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
                      {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div className="input-group">
                <label>Address / Location</label>
                <div className="input-icon-wrapper">
                  <MapPin className="input-icon" size={18} />
                  <input
                    type="text"
                    name="address"
                    required
                    placeholder="Street, City, Zip"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {activeRole === 'PATIENT' && (
                <div className="input-group">
                  <label>Associated Hospital (Optional)</label>
                  <div className="input-icon-wrapper">
                    <Building2 className="input-icon" size={18} />
                    <input
                      type="text"
                      name="hospitalName"
                      placeholder="e.g. City General Hospital"
                      value={formData.hospitalName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              {(activeRole === 'BLOOD_BANK' || activeRole === 'DELIVERY_BOY') && (
                <div className="input-group">
                  <label>{activeRole === 'BLOOD_BANK' ? 'Registration License ID' : 'Rider License Number'}</label>
                  <div className="input-icon-wrapper">
                    <Building2 className="input-icon" size={18} />
                    <input
                      type="text"
                      name="licenseNumber"
                      required
                      placeholder="e.g. LIC-998822"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <button type="submit" className="btn-primary full-width mt-3" disabled={loading}>
            {loading ? 'Processing...' : (isRegister ? `Register as ${activeRole.replace('_', ' ')}` : `Login to ${activeRole.replace('_', ' ')} Portal`)}
          </button>
        </form>

        <div className="auth-footer flex-between align-center">
          <button type="button" className="demo-btn-sm" onClick={fillDemoAccount}>
            ⚡ Auto-Fill Demo ({activeRole.replace('_', ' ')})
          </button>
          <button type="button" className="link-toggle-btn" onClick={() => { setIsRegister(!isRegister); setErrorMsg(''); }}>
            {isRegister ? 'Already registered? Login here' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};
