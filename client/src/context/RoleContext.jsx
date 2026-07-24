import React, { createContext, useState, useContext, useEffect } from 'react';
import { io } from 'socket.io-client';

const RoleContext = createContext();

// Socket.io host connection
const SOCKET_URL = 'http://localhost:5000';

export const RoleProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('cf_token') || 'demo_token');
  const [role, setRole] = useState(localStorage.getItem('cf_role') || 'doctor');
  const [clinic, setClinic] = useState(parseInt(localStorage.getItem('cf_clinic')) || 1);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('cf_user')) || {
      id: 3,
      email: 'doctor@careflow.com',
      first_name: 'Aravind',
      last_name: 'Sharma',
      phone: '9900000003'
    }
  );
  
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Welcome to CareFlow EMR. System initialized successfully.', type: 'info', time: new Date() }
  ]);

  // Global tab navigation state
  const [activeSubTab, setActiveSubTab] = useState('register');

  // Handle live notifications via Socket.IO
  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('Connected to real-time CareFlow notification stream.');
    });

    socket.on('critical_vitals_alert', (data) => {
      setNotifications(prev => [
        {
          id: Date.now(),
          message: `CRITICAL ALERT: Patient vitals abnormal! SPO2: ${data.spo2}%, BP: ${data.systolic} mmHg.`,
          type: 'danger',
          time: new Date()
        },
        ...prev
      ]);
    });

    socket.on('patient_registered', (patient) => {
      setNotifications(prev => [
        {
          id: Date.now(),
          message: `New Patient Registered: ${patient.first_name} ${patient.last_name} (${patient.mrn})`,
          type: 'success',
          time: new Date()
        },
        ...prev
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Update default tab upon role initialization or switch
  const getDefaultTabForRole = (newRole) => {
    switch (newRole) {
      case 'receptionist': return 'register';
      case 'doctor': return 'queue';
      case 'super_admin': return 'orgs';
      case 'clinic_admin': return 'analytics';
      case 'nurse': return 'vitals';
      case 'lab_tech': return 'orders';
      case 'pharmacist': return 'dispensation';
      case 'accountant': return 'ledger';
      default: return 'overview';
    }
  };

  useEffect(() => {
    setActiveSubTab(getDefaultTabForRole(role));
  }, [role]);

  const login = (newToken, newUser, newRole) => {
    setToken(newToken);
    setUser(newUser);
    setRole(newRole);
    setActiveSubTab(getDefaultTabForRole(newRole));
    localStorage.setItem('cf_token', newToken);
    localStorage.setItem('cf_user', JSON.stringify(newUser));
    localStorage.setItem('cf_role', newRole);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRole('doctor');
    setActiveSubTab('queue');
    localStorage.removeItem('cf_token');
    localStorage.removeItem('cf_user');
    localStorage.removeItem('cf_role');
  };

  const switchRole = (newRole) => {
    setRole(newRole);
    setActiveSubTab(getDefaultTabForRole(newRole));
    localStorage.setItem('cf_role', newRole);
    
    // Simulate user mapping changes for demo roles
    const roleMapping = {
      super_admin: { id: 1, email: 'superadmin@careflow.com', first_name: 'Super', last_name: 'Admin' },
      clinic_admin: { id: 2, email: 'admin@careflow.com', first_name: 'Clinic', last_name: 'Admin' },
      doctor: { id: 3, email: 'doctor@careflow.com', first_name: 'Aravind', last_name: 'Sharma' },
      receptionist: { id: 5, email: 'receptionist@careflow.com', first_name: 'Rajesh', last_name: 'Kumar' },
      nurse: { id: 6, email: 'nurse@careflow.com', first_name: 'Sneha', last_name: 'Roy' },
      lab_tech: { id: 7, email: 'labtech@careflow.com', first_name: 'Vikram', last_name: 'Singh' },
      pharmacist: { id: 8, email: 'pharmacist@careflow.com', first_name: 'Amit', last_name: 'Patel' },
      accountant: { id: 9, email: 'accountant@careflow.com', first_name: 'Sanjay', last_name: 'Shah' }
    };
    
    if (roleMapping[newRole]) {
      setUser(roleMapping[newRole]);
      localStorage.setItem('cf_user', JSON.stringify(roleMapping[newRole]));
    }
  };

  const selectClinic = (clinicId) => {
    setClinic(clinicId);
    localStorage.setItem('cf_clinic', clinicId);
  };

  const addNotification = (message, type = 'info') => {
    setNotifications(prev => [
      { id: Date.now(), message, type, time: new Date() },
      ...prev
    ]);
  };

  return (
    <RoleContext.Provider value={{
      token,
      role,
      clinic,
      user,
      notifications,
      activeSubTab,
      setActiveSubTab,
      login,
      logout,
      switchRole,
      selectClinic,
      addNotification,
      setNotifications
    }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
