import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthPage } from './components/auth/AuthPage';
import { DonorDashboard } from './components/dashboards/DonorDashboard';
import { PatientDashboard } from './components/dashboards/PatientDashboard';
import { BloodBankDashboard } from './components/dashboards/BloodBankDashboard';
import { DeliveryBoyDashboard } from './components/dashboards/DeliveryBoyDashboard';
import { NotificationModal } from './components/NotificationModal';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import './App.css';

const MainContent = () => {
  const { user } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [forgotModal, setForgotModal] = useState({ isOpen: false, role: 'DONOR' });

  const renderDashboard = () => {
    if (!user) {
      return (
        <AuthPage
          onOpenForgotPassword={(role) => setForgotModal({ isOpen: true, role })}
        />
      );
    }

    switch (user.role) {
      case 'DONOR':
        return <DonorDashboard />;
      case 'PATIENT':
        return <PatientDashboard />;
      case 'BLOOD_BANK':
        return <BloodBankDashboard />;
      case 'DELIVERY_BOY':
        return <DeliveryBoyDashboard />;
      default:
        return <DonorDashboard />;
    }
  };

  return (
    <div className="app-shell">
      <Navbar onOpenNotifications={() => setIsNotifOpen(true)} />
      <main className="main-viewport">
        {renderDashboard()}
      </main>

      <NotificationModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />

      <ForgotPasswordModal
        isOpen={forgotModal.isOpen}
        defaultRole={forgotModal.role}
        onClose={() => setForgotModal({ isOpen: false, role: 'DONOR' })}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
