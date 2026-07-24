import React from 'react';
import { useRole } from '../context/RoleContext';
import { 
  Heart, Calendar, Users, Activity, FileText, 
  FlaskConical, Database, CreditCard, LayoutDashboard, 
  Settings, Key, AlertCircle, ShoppingBag, FolderOpen
} from 'lucide-react';

const Sidebar = () => {
  const { role, activeSubTab, setActiveSubTab } = useRole();

  // Define sidebar menus based on roles with unique identifiers matching dashboard states
  const getMenuForRole = () => {
    switch (role) {
      case 'super_admin':
        return [
          { id: 'orgs', label: 'SaaS Platform Org', icon: <Users className="w-4 h-4" /> },
          { id: 'subs', label: 'Tenant Subscriptions', icon: <CreditCard className="w-4 h-4" /> },
          { id: 'keys', label: 'Developer API Keys', icon: <Key className="w-4 h-4" /> },
          { id: 'logs', label: 'Global Audit Logs', icon: <FileText className="w-4 h-4" /> },
          { id: 'settings', label: 'Platform Settings', icon: <Settings className="w-4 h-4" /> }
        ];
      case 'clinic_admin':
        return [
          { id: 'analytics', label: 'Clinic Branch Analytics', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'staff', label: 'Staff Roster Profiles', icon: <Users className="w-4 h-4" /> },
          { id: 'hours', label: 'Doctor Consulting Hours', icon: <Calendar className="w-4 h-4" /> },
          { id: 'config', label: 'Branch Config', icon: <Settings className="w-4 h-4" /> }
        ];
      case 'doctor':
        return [
          { id: 'queue', label: 'Consultation Queue', icon: <Activity className="w-4 h-4" /> },
          { id: 'history', label: 'EMR History Records', icon: <FileText className="w-4 h-4" /> },
          { id: 'templates', label: 'Prescription Templates', icon: <FileText className="w-4 h-4" /> },
          { id: 'schedules', label: 'Telehealth Schedules', icon: <Calendar className="w-4 h-4" /> }
        ];
      case 'receptionist':
        return [
          { id: 'register', label: 'Patient Registrations', icon: <Users className="w-4 h-4" /> },
          { id: 'patient_list', label: 'Patient Directory', icon: <FolderOpen className="w-4 h-4" /> },
          { id: 'schedule', label: 'Appointment Scheduling', icon: <Calendar className="w-4 h-4" /> },
          { id: 'queue', label: 'Walk-In Check-In Queue', icon: <Activity className="w-4 h-4" /> },
          { id: 'billing', label: 'Retail Invoicing', icon: <CreditCard className="w-4 h-4" /> },
          { id: 'invoice_list', label: 'Billing Ledger', icon: <FileText className="w-4 h-4" /> }
        ];
      case 'nurse':
        return [
          { id: 'vitals', label: 'Vitals Intake Queue', icon: <Activity className="w-4 h-4" /> },
          { id: 'patient_list', label: 'Patient Directory', icon: <Users className="w-4 h-4" /> },
          { id: 'alerts', label: 'Clinical Alert History', icon: <AlertCircle className="w-4 h-4" /> }
        ];
      case 'lab_tech':
        return [
          { id: 'orders', label: 'Diagnostics Orders', icon: <FlaskConical className="w-4 h-4" /> },
          { id: 'lab_history', label: 'Diagnostics History', icon: <FileText className="w-4 h-4" /> },
          { id: 'specimens', label: 'Specimen Intake Logs', icon: <Database className="w-4 h-4" /> },
          { id: 'catalog', label: 'Diagnostics Catalog', icon: <FlaskConical className="w-4 h-4" /> }
        ];
      case 'pharmacist':
        return [
          { id: 'dispensation', label: 'Med Dispensation Desk', icon: <ShoppingBag className="w-4 h-4" /> },
          { id: 'dispense_history', label: 'Dispensation History', icon: <FileText className="w-4 h-4" /> },
          { id: 'inventory', label: 'Medicine Inventory Stock', icon: <Database className="w-4 h-4" /> },
          { id: 'alerts', label: 'Expiry Batch Alerts', icon: <AlertCircle className="w-4 h-4" /> }
        ];
      case 'accountant':
        return [
          { id: 'ledger', label: 'Daily Cash Ledger', icon: <CreditCard className="w-4 h-4" /> },
          { id: 'tax', label: 'GST Tax Collections', icon: <FileText className="w-4 h-4" /> },
          { id: 'expenses', label: 'Operating Expenses', icon: <Database className="w-4 h-4" /> }
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuForRole();

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/80 backdrop-blur-md flex flex-col h-full z-20">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 space-x-3">
        <div className="bg-brand-500 text-white p-1.5 rounded-lg">
          <Heart className="w-5 h-5 pulse-heart" />
        </div>
        <div>
          <span className="font-bold text-lg tracking-wider text-slate-100 font-sans">CareFlow</span>
          <span className="text-[10px] uppercase font-bold text-brand-400 block tracking-widest leading-none">Enterprise EMR</span>
        </div>
      </div>

      {/* Menu Options */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold px-3 mb-2">
          Dashboard Menu
        </div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSubTab(item.id)}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeSubTab === item.id
                ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 text-[10px] text-slate-500 text-center uppercase tracking-widest">
        Powered by CareFlow v2.0
      </div>
    </aside>
  );
};

export default Sidebar;
