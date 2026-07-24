import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider, useRole } from './context/RoleContext';
import Login from './views/auth/Login';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';

// Dashboards
import SuperAdminDashboard from './views/superadmin/SuperAdminDashboard';
import ClinicAdminDashboard from './views/clinicadmin/ClinicAdminDashboard';
import DoctorDashboard from './views/doctor/DoctorDashboard';
import ReceptionDashboard from './views/receptionist/ReceptionDashboard';
import NurseDashboard from './views/nurse/NurseDashboard';
import LabTechDashboard from './views/labtech/LabTechDashboard';
import PharmacistDashboard from './views/pharmacist/PharmacistDashboard';
import AccountantDashboard from './views/accountant/AccountantDashboard';

// Dashboard Switcher View
const MainLayout = () => {
  const { token, role } = useRole();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Choose dashboard view based on active role
  const renderDashboard = () => {
    switch (role) {
      case 'super_admin':
        return <SuperAdminDashboard />;
      case 'clinic_admin':
        return <ClinicAdminDashboard />;
      case 'doctor':
        return <DoctorDashboard />;
      case 'receptionist':
        return <ReceptionDashboard />;
      case 'nurse':
        return <NurseDashboard />;
      case 'lab_tech':
        return <LabTechDashboard />;
      case 'pharmacist':
        return <PharmacistDashboard />;
      case 'accountant':
        return <AccountantDashboard />;
      default:
        return <DoctorDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-100">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Topbar & Role Switcher */}
        <Topbar />

        {/* Dashboard Panels */}
        <main className="flex-1 overflow-y-auto p-6 relative z-10">
          {renderDashboard()}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <RoleProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<MainLayout />} />
        </Routes>
      </Router>
    </RoleProvider>
  );
}

export default App;
