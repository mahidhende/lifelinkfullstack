// LifeLink API Service with backend integration & local fallback store
const API_BASE_URL = 'http://localhost:8080/api';

// Initial Mock Data Store for offline/instant mode
const INITIAL_MOCK_DATA = {
  users: [
    { id: 1, name: 'John Donor', email: 'donor@lifelink.com', role: 'DONOR', phone: '+1 9876543210', bloodGroup: 'O+', address: '123 Main St, City' },
    { id: 2, name: 'Jane Patient', email: 'patient@lifelink.com', role: 'PATIENT', phone: '+1 8765432109', bloodGroup: 'A+', address: '456 Oak Ave, Metro Hospital', hospitalName: 'Metro General Hospital' },
    { id: 3, name: 'Central Blood Bank', email: 'bank@lifelink.com', role: 'BLOOD_BANK', phone: '+1 5550192837', address: '789 Health Blvd', licenseNumber: 'BB-9920-IN' },
    { id: 4, name: 'Alex Delivery Rider', email: 'delivery@lifelink.com', role: 'DELIVERY_BOY', phone: '+1 4443322110', licenseNumber: 'DL-88219-EX' }
  ],
  bloodStock: [
    { id: 1, bloodBankId: 3, bloodBankName: 'Central Blood Bank', bloodGroup: 'A+', quantityMl: 1500 },
    { id: 2, bloodBankId: 3, bloodBankName: 'Central Blood Bank', bloodGroup: 'O+', quantityMl: 2500 },
    { id: 3, bloodBankId: 3, bloodBankName: 'Central Blood Bank', bloodGroup: 'B+', quantityMl: 800 },
    { id: 4, bloodBankId: 3, bloodBankName: 'Central Blood Bank', bloodGroup: 'AB+', quantityMl: 600 }
  ],
  donations: [
    { id: 101, donorId: 1, donorName: 'John Donor', donorPhone: '+1 9876543210', bloodBankId: 3, bloodBankName: 'Central Blood Bank', bloodGroup: 'O+', quantityMl: 450, status: 'ACCEPTED', createdAt: new Date(Date.now() - 86400000).toISOString() }
  ],
  patientRequests: [
    { id: 201, patientId: 2, patientName: 'Jane Patient', patientPhone: '+1 8765432109', bloodGroup: 'A+', unitsInMl: 350, hospitalName: 'Metro General Hospital', deliveryAddress: 'Room 402, Metro Hospital', urgencyLevel: 'CRITICAL', status: 'ACCEPTED', acceptedByBankId: 3, acceptedByBankName: 'Central Blood Bank', createdAt: new Date().toISOString() }
  ],
  deliveries: [
    { id: 301, patientRequestId: 201, patientName: 'Jane Patient', patientPhone: '+1 8765432109', deliveryAddress: 'Room 402, Metro Hospital', bloodBankId: 3, bloodBankName: 'Central Blood Bank', bloodGroup: 'A+', unitsInMl: 350, deliveryBoyId: 4, deliveryBoyName: 'Alex Delivery Rider', deliveryBoyPhone: '+1 4443322110', status: 'IN_TRANSIT', assignedTime: new Date().toISOString() }
  ],
  notifications: [
    { id: 1, userId: 1, message: 'Your blood donation of 450ml (O+) was accepted by Central Blood Bank!', type: 'DONATION_UPDATE', isRead: false, createdAt: new Date().toISOString() },
    { id: 2, userId: 2, message: 'Central Blood Bank has accepted your 350ml A+ request. Alex Express Rider is delivering now.', type: 'DELIVERY_UPDATE', isRead: false, createdAt: new Date().toISOString() }
  ]
};

const getLocalData = () => {
  const data = localStorage.getItem('LIFELINK_STORE');
  if (!data) {
    localStorage.setItem('LIFELINK_STORE', JSON.stringify(INITIAL_MOCK_DATA));
    return INITIAL_MOCK_DATA;
  }
  return JSON.parse(data);
};

const saveLocalData = (data) => {
  localStorage.setItem('LIFELINK_STORE', JSON.stringify(data));
};

export const apiService = {
  // --- AUTH ---
  register: async (userData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline, using fallback mock auth');
    }
    const store = getLocalData();
    const existing = store.users.find(u => u.email === userData.email);
    if (existing) return { success: false, message: 'User already exists with this email' };

    const newUser = { id: Date.now(), ...userData, role: userData.role || 'DONOR' };
    store.users.push(newUser);
    saveLocalData(store);
    return { success: true, message: 'Registration successful!', user: newUser, token: 'mock-jwt-token' };
  },

  login: async (email, password, role) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline, using fallback mock auth');
    }
    const store = getLocalData();
    const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return { success: false, message: 'User email not found' };
    if (role && user.role !== role) return { success: false, message: `User registered as ${user.role}, not ${role}` };
    return { success: true, message: 'Login successful!', user, token: 'mock-jwt-token' };
  },

  sendOtp: async (email, role) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline, fallback mock OTP generation');
    }
    const store = getLocalData();
    const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return { success: false, message: 'No registered user found with email: ' + email };
    if (role && user.role !== role) return { success: false, message: `User registered as ${user.role}, not ${role}` };
    
    // Store mock OTP in local store for dev testing
    const mockOtp = '123456';
    store.activeOtps = store.activeOtps || {};
    store.activeOtps[email.toLowerCase()] = { otp: mockOtp, expiry: Date.now() + 600000 };
    saveLocalData(store);
    
    return { success: true, message: `Verification OTP sent to ${email}! (Mock OTP: 123456)` };
  },

  verifyOtp: async (email, otp) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline, fallback mock OTP verification');
    }
    const store = getLocalData();
    const active = store.activeOtps ? store.activeOtps[email.toLowerCase()] : null;
    if (otp === '123456' || (active && active.otp === otp && active.expiry > Date.now())) {
      return { success: true, message: 'OTP verified successfully!' };
    }
    return { success: false, message: 'Invalid or expired OTP code.' };
  },

  forgotPassword: async (email, newPassword, otp, role) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword, otp, role })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline, fallback password reset');
    }
    const store = getLocalData();
    const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return { success: false, message: 'No registered user found with this email' };
    if (role && user.role !== role) return { success: false, message: `User registered as ${user.role}, not ${role}` };

    if (otp) {
      const active = store.activeOtps ? store.activeOtps[email.toLowerCase()] : null;
      if (otp !== '123456' && (!active || active.otp !== otp || active.expiry < Date.now())) {
        return { success: false, message: 'Invalid or expired OTP code.' };
      }
    }

    user.password = newPassword;
    if (store.activeOtps) delete store.activeOtps[email.toLowerCase()];
    saveLocalData(store);
    return { success: true, message: 'Password reset successfully! Please login with your new password.' };
  },

  // --- DONOR ---
  submitDonation: async (donationData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/donor/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donationData)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    const store = getLocalData();
    const newDonation = {
      id: Date.now(),
      ...donationData,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    store.donations.push(newDonation);
    saveLocalData(store);
    return newDonation;
  },

  getDonorHistory: async (donorId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/donor/history/${donorId}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    const store = getLocalData();
    return store.donations.filter(d => d.donorId === donorId);
  },

  getBloodBanksList: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/donor/blood-banks`);
      if (res.ok) return await res.json();
    } catch (e) {}
    const store = getLocalData();
    return store.users.filter(u => u.role === 'BLOOD_BANK');
  },

  // --- PATIENT ---
  submitPatientRequest: async (reqData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/patient/request-blood`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqData)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    const store = getLocalData();
    const newReq = {
      id: Date.now(),
      ...reqData,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    store.patientRequests.push(newReq);
    // Broadcast notification to blood banks
    store.users.filter(u => u.role === 'BLOOD_BANK').forEach(bank => {
      store.notifications.push({
        id: Date.now() + Math.random(),
        userId: bank.id,
        message: `EMERGENCY: Patient ${newReq.patientName} requested ${newReq.unitsInMl}ml of ${newReq.bloodGroup}!`,
        type: 'PATIENT_REQUEST',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    });
    saveLocalData(store);
    return newReq;
  },

  getPatientRequests: async (patientId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/patient/requests/${patientId}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    const store = getLocalData();
    return store.patientRequests.filter(r => r.patientId === patientId);
  },

  // --- BLOOD BANK ---
  getBankStock: async (bloodBankId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/bloodbank/stock/${bloodBankId}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    const store = getLocalData();
    return store.bloodStock.filter(s => s.bloodBankId === bloodBankId);
  },

  addStock: async (bloodBankId, bloodGroup, quantityMl) => {
    try {
      const res = await fetch(`${API_BASE_URL}/bloodbank/stock/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bloodBankId, bloodGroup, quantityMl })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    const store = getLocalData();
    let stock = store.bloodStock.find(s => s.bloodBankId === bloodBankId && s.bloodGroup === bloodGroup);
    if (stock) {
      stock.quantityMl += parseInt(quantityMl);
    } else {
      stock = { id: Date.now(), bloodBankId, bloodBankName: 'Blood Bank', bloodGroup, quantityMl: parseInt(quantityMl) };
      store.bloodStock.push(stock);
    }
    saveLocalData(store);
    return stock;
  },

  getBankDonorRequests: async (bloodBankId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/bloodbank/donor-requests/${bloodBankId}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    const store = getLocalData();
    return store.donations.filter(d => d.bloodBankId === bloodBankId || !d.bloodBankId);
  },

  updateDonationStatus: async (donationId, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/bloodbank/donor-requests/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationId, status })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    const store = getLocalData();
    const don = store.donations.find(d => d.id === donationId);
    if (don) {
      don.status = status;
      if (status === 'ACCEPTED') {
        let stock = store.bloodStock.find(s => s.bloodGroup === don.bloodGroup);
        if (stock) stock.quantityMl += don.quantityMl;
      }
      saveLocalData(store);
    }
    return don;
  },

  getPendingPatientRequests: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/bloodbank/patient-requests/pending`);
      if (res.ok) return await res.json();
    } catch (e) {}
    const store = getLocalData();
    return store.patientRequests.filter(r => r.status === 'PENDING');
  },

  acceptPatientRequest: async (requestId, bloodBankId, bankName) => {
    try {
      const res = await fetch(`${API_BASE_URL}/bloodbank/patient-requests/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, bloodBankId })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    const store = getLocalData();
    const req = store.patientRequests.find(r => r.id === requestId);
    if (req && req.status === 'PENDING') {
      req.status = 'ACCEPTED';
      req.acceptedByBankId = bloodBankId;
      req.acceptedByBankName = bankName || 'Central Blood Bank';

      // Auto-assign delivery task
      const deliveryBoy = store.users.find(u => u.role === 'DELIVERY_BOY') || { id: 4, name: 'Alex Delivery Rider', phone: '+1 4443322110' };
      const newDelivery = {
        id: Date.now(),
        patientRequestId: req.id,
        patientName: req.patientName,
        patientPhone: req.patientPhone,
        deliveryAddress: req.deliveryAddress,
        bloodBankId,
        bloodBankName: req.acceptedByBankName,
        bloodGroup: req.bloodGroup,
        unitsInMl: req.unitsInMl,
        deliveryBoyId: deliveryBoy.id,
        deliveryBoyName: deliveryBoy.name,
        deliveryBoyPhone: deliveryBoy.phone,
        status: 'ACCEPTED',
        assignedTime: new Date().toISOString()
      };
      store.deliveries.push(newDelivery);

      // Add notifications
      store.notifications.push({
        id: Date.now(),
        userId: req.patientId,
        message: `Your request for ${req.unitsInMl}ml of ${req.bloodGroup} was ACCEPTED by ${req.acceptedByBankName}! Delivery dispatched.`,
        type: 'PATIENT_REQUEST',
        isRead: false,
        createdAt: new Date().toISOString()
      });

      saveLocalData(store);
    }
    return req;
  },

  // --- DELIVERY BOY ---
  getDeliveryTasks: async (deliveryBoyId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/delivery/tasks/boy/${deliveryBoyId}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    const store = getLocalData();
    return store.deliveries;
  },

  updateDeliveryStatus: async (taskId, deliveryBoyId, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/delivery/tasks/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, deliveryBoyId, status })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    const store = getLocalData();
    const del = store.deliveries.find(d => d.id === taskId);
    if (del) {
      del.status = status;

      // Sync with patient request status
      const patientReq = store.patientRequests.find(r => r.id === del.patientRequestId);
      if (patientReq && status === 'DELIVERED') {
        patientReq.status = 'FULFILLED';
      }

      // Add notify
      if (patientReq) {
        store.notifications.push({
          id: Date.now(),
          userId: patientReq.patientId,
          message: `Delivery Status Update: ${status.replace('_', ' ')}`,
          type: 'DELIVERY_UPDATE',
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
      saveLocalData(store);
    }
    return del;
  },

  // --- NOTIFICATIONS ---
  getUserNotifications: async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/${userId}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    const store = getLocalData();
    return store.notifications.filter(n => n.userId === userId || !n.userId);
  }
};
