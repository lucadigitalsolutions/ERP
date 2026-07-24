import React, { useState } from 'react';
import { useRole } from '../context/RoleContext';
import { Bell, ShieldAlert, Users, LogOut, Building, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const Topbar = () => {
  const { role, switchRole, clinic, selectClinic, user, logout, notifications, setNotifications } = useRole();
  const [showRoles, setShowRoles] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const roleTitles = {
    super_admin: 'Super Admin',
    clinic_admin: 'Clinic Admin',
    doctor: 'Doctor (EMR)',
    receptionist: 'Receptionist',
    nurse: 'Nurse (Vitals)',
    lab_tech: 'Lab Technician',
    pharmacist: 'Pharmacist',
    accountant: 'Accountant'
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="text-red-500 w-4 h-4 pulse-heart" />;
      case 'success':
        return <CheckCircle2 className="text-green-500 w-4 h-4" />;
      default:
        return <Info className="text-blue-400 w-4 h-4" />;
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md flex items-center justify-between px-6 z-30">
      {/* Clinic Selector & Organization Context */}
      <div className="flex items-center space-x-4">
        <Building className="text-brand-400 w-5 h-5" />
        <select
          value={clinic}
          onChange={(e) => selectClinic(parseInt(e.target.value))}
          className="bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
        >
          <option value={1}>CareFlow Bengaluru Downtown (Multi-Specialty)</option>
          <option value={2}>CareFlow Indiranagar Dental (Dental Clinic)</option>
        </select>
      </div>

      {/* Actionable items and Role Switcher */}
      <div className="flex items-center space-x-4">
        {/* Real-time Alerts Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 rounded-lg relative transition-colors duration-200"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-40 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-2">
                <span className="font-semibold text-xs text-slate-400 uppercase tracking-wider">Clinical Alerts Stream</span>
                <button
                  onClick={() => setNotifications([])}
                  className="text-xs text-brand-400 hover:underline"
                >
                  Clear All
                </button>
              </div>
              {notifications.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No recent notifications</p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div key={n.id} className="flex space-x-3 text-xs bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/40">
                      <div className="mt-0.5">{getNotificationIcon(n.type)}</div>
                      <div>
                        <p className="text-slate-300 font-medium">{n.message}</p>
                        <span className="text-[10px] text-slate-500">
                          {new Date(n.time).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Master Role Switcher for evaluations */}
        <div className="relative">
          <button
            onClick={() => setShowRoles(!showRoles)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-brand-500/10 border border-brand-500/30 text-brand-400 hover:bg-brand-500/20 text-xs font-semibold rounded-lg transition-all"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Role: {roleTitles[role]}</span>
          </button>

          {showRoles && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-40">
              <div className="px-3 py-1.5 text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-800 mb-1">
                Evaluation Switcher
              </div>
              {Object.keys(roleTitles).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setShowRoles(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center space-x-2 transition-colors ${
                    role === r ? 'bg-brand-500 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{roleTitles[r]}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Active Logged-in Staff Details */}
        <div className="flex items-center pl-2 border-l border-slate-800">
          <div className="text-right mr-3 hidden sm:block">
            <p className="text-xs font-semibold text-slate-200">{user.first_name} {user.last_name}</p>
            <p className="text-[10px] text-slate-500 capitalize">{role.replace('_', ' ')}</p>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
