import React from 'react';
import { CheckCircle2, Clock, Truck, Check, AlertCircle } from 'lucide-react';

export const StatusTracker = ({ status, acceptedByBank }) => {
  const steps = [
    { key: 'PENDING', label: 'Request Submitted', desc: 'Broadcasted to all Blood Banks' },
    { key: 'ACCEPTED', label: 'Accepted by Bank', desc: acceptedByBank ? `Stock reserved at ${acceptedByBank}` : 'Blood Bank confirmed stock' },
    { key: 'IN_TRANSIT', label: 'Express Transit', desc: 'Rider picked up & on the way' },
    { key: 'DELIVERED', label: 'Delivered to Patient', desc: 'Handover complete & fulfilled' }
  ];

  const getStepState = (stepKey, index) => {
    const currentUpper = (status || 'PENDING').toUpperCase();
    
    if (currentUpper === 'FULFILLED') return 'completed';

    const order = ['PENDING', 'ACCEPTED', 'IN_TRANSIT', 'DELIVERED'];
    const currentIndex = order.indexOf(currentUpper);

    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'active';
    return 'upcoming';
  };

  return (
    <div className="status-tracker-widget">
      <div className="tracker-header">
        <h4>Live Delivery Progress Tracking</h4>
        <span className={`status-badge-lg ${status?.toLowerCase()}`}>
          {status?.replace('_', ' ')}
        </span>
      </div>

      <div className="timeline-steps">
        {steps.map((step, idx) => {
          const state = getStepState(step.key, idx);
          return (
            <div key={step.key} className={`timeline-step ${state}`}>
              <div className="step-node">
                {state === 'completed' ? <Check size={16} /> :
                 state === 'active' ? <Clock size={16} className="spinning-icon" /> :
                 (idx + 1)}
              </div>
              <div className="step-info">
                <span className="step-title">{step.label}</span>
                <span className="step-desc">{step.desc}</span>
              </div>
              {idx < steps.length - 1 && <div className="step-line"></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
