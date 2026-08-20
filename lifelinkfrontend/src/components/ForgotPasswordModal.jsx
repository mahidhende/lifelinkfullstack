import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { X, KeyRound, Mail, Lock, CheckCircle, AlertCircle, Droplet, HeartPulse, Building2, Truck, RefreshCw } from 'lucide-react';

export const ForgotPasswordModal = ({ isOpen, onClose, defaultRole }) => {
  const [selectedRole, setSelectedRole] = useState(defaultRole || 'DONOR');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Enter OTP & Reset
  const [msg, setMsg] = useState({ text: '', isError: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (defaultRole) {
      setSelectedRole(defaultRole);
    }
  }, [defaultRole]);

  if (!isOpen) return null;

  const roles = [
    { id: 'DONOR', label: 'Donor', icon: Droplet },
    { id: 'PATIENT', label: 'Patient', icon: HeartPulse },
    { id: 'BLOOD_BANK', label: 'Blood Bank', icon: Building2 },
    { id: 'DELIVERY_BOY', label: 'Rider', icon: Truck }
  ];

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMsg({ text: '', isError: false });
    if (!email) {
      setMsg({ text: 'Please enter your registered email address', isError: true });
      return;
    }

    setLoading(true);
    const res = await apiService.sendOtp(email, selectedRole);
    setLoading(false);

    if (res.success) {
      setStep(2);
      setMsg({ text: res.message, isError: false });
    } else {
      setMsg({ text: res.message, isError: true });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMsg({ text: '', isError: false });

    if (!otp) {
      setMsg({ text: 'Please enter the 6-digit OTP code', isError: true });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setMsg({ text: 'Password must be at least 6 characters long', isError: true });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMsg({ text: 'Passwords do not match', isError: true });
      return;
    }

    setLoading(true);
    const res = await apiService.forgotPassword(email, newPassword, otp, selectedRole);
    setLoading(false);

    if (res.success) {
      setMsg({ text: res.message, isError: false });
      setTimeout(() => {
        onClose();
        setStep(1);
        setEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setMsg({ text: '', isError: false });
      }, 2000);
    } else {
      setMsg({ text: res.message, isError: true });
    }
  };

  const handleResendOtp = async () => {
    setMsg({ text: '', isError: false });
    setLoading(true);
    const res = await apiService.sendOtp(email, selectedRole);
    setLoading(false);
    if (res.success) {
      setMsg({ text: 'New OTP sent to ' + email, isError: false });
    } else {
      setMsg({ text: res.message, isError: true });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card forgot-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex-align gap-2">
            <KeyRound className="text-crimson" size={22} />
            <h3>Reset Account Password</h3>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          {/* Role selector tabs */}
          <div className="role-modal-tabs" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '16px' }}>
            {roles.map(r => {
              const IconComp = r.icon;
              const isSelected = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => { setSelectedRole(r.id); setMsg({ text: '', isError: false }); }}
                  className={`role-tab-sm ${isSelected ? 'active' : ''}`}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: isSelected ? '1px solid #dc2626' : '1px solid #e2e8f0',
                    background: isSelected ? '#fef2f2' : '#ffffff',
                    color: isSelected ? '#dc2626' : '#64748b',
                    fontSize: '12px',
                    fontWeight: isSelected ? '600' : '400',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <IconComp size={16} />
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>

          {msg.text && (
            <div className={`alert-banner ${msg.isError ? 'alert-error' : 'alert-success'}`}>
              {msg.isError ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
              <span>{msg.text}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="form-layout">
              <p className="form-intro">
                Enter your registered <strong>{selectedRole.replace('_', ' ')}</strong> email address. We will send a 6-digit OTP code to your email for password recovery.
              </p>
              <div className="input-group">
                <label>Registered Email Address</label>
                <div className="input-icon-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    required
                    placeholder="e.g. user@lifelink.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary full-width mt-2" disabled={loading}>
                {loading ? 'Sending Verification OTP...' : `Send OTP to ${selectedRole.replace('_', ' ')} Email`}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="form-layout">
              <div className="input-group">
                <div className="label-flex flex-between align-center">
                  <label>Enter 6-Digit OTP Code</label>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="link-btn-sm flex-align gap-1"
                    style={{ fontSize: '12px', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                  >
                    <RefreshCw size={12} /> Resend OTP
                  </button>
                </div>
                <div className="input-icon-wrapper">
                  <KeyRound className="input-icon" size={18} />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 123456"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>New Password</label>
                <div className="input-icon-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type="password"
                    required
                    placeholder="Enter new strong password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Confirm New Password</label>
                <div className="input-icon-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type="password"
                    required
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-align gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary"
                  style={{ flex: '1', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: '2' }}
                  disabled={loading}
                >
                  {loading ? 'Updating Password...' : 'Reset & Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
