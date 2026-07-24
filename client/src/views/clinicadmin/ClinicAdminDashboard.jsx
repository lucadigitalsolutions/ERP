import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRole } from '../../context/RoleContext';
import { 
  Users, Clock, Plus, ShieldCheck, Mail, Phone, Settings,
  LayoutDashboard, Calendar, BarChart2, TrendingUp, ShieldAlert, Edit, Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';

const ClinicAdminDashboard = () => {
  const { clinic, addNotification, activeSubTab, setActiveSubTab } = useRole();
  
  // Staff Directory
  const [staff, setStock] = useState([]);

  // Advanced Staff Filters
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [staffRoleFilter, setStaffRoleFilter] = useState('all');
  const [staffStartDate, setStaffStartDate] = useState('');
  const [staffEndDate, setStaffEndDate] = useState('');
  
  // Form State
  const [staffForm, setStaffForm] = useState({
    first_name: '', last_name: '', email: '', phone: '', role_id: '3', password: 'password123'
  });

  // Doctor session hours mock
  const [doctorHours, setDoctorHours] = useState([
    { id: 1, name: 'Dr. Aravind Sharma', spec: 'Cardiology', days: 'Mon - Fri', hours: '09:00 AM - 01:00 PM, 04:00 PM - 07:00 PM', status: 'active' },
    { id: 2, name: 'Dr. Priya Nair', spec: 'Orthodontics', days: 'Tue, Thu, Sat', hours: '10:00 AM - 03:00 PM', status: 'active' }
  ]);

  const fetchStaff = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users');
      setStock(res.data);
    } catch (err) {
      console.warn('Backend offline, loading mock staff roster...');
      setStock([
        { id: 1, first_name: 'Aravind', last_name: 'Sharma', email: 'doctor@careflow.com', phone: '9900000003', role_name: 'doctor', status: 'active' },
        { id: 2, first_name: 'Sneha', last_name: 'Roy', email: 'nurse@careflow.com', phone: '9900000006', role_name: 'nurse', status: 'active' },
        { id: 3, first_name: 'Rajesh', last_name: 'Kumar', email: 'receptionist@careflow.com', phone: '9900000005', role_name: 'receptionist', status: 'active' },
        { id: 4, first_name: 'Amit', last_name: 'Patel', email: 'pharmacist@careflow.com', phone: '9900000008', role_name: 'pharmacist', status: 'active' }
      ]);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [clinic]);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!staffForm.first_name || !staffForm.email) {
      alert('First name and Email address are required staff details.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/users', staffForm);
      addNotification(`Staff member invited: ${staffForm.first_name} ${staffForm.last_name}`, 'success');
      setStaffForm({
        first_name: '', last_name: '', email: '', phone: '', role_id: '3', password: 'password123'
      });
      fetchStaff();
    } catch (err) {
      const roleNames = { '1': 'super_admin', '2': 'clinic_admin', '3': 'doctor', '4': 'receptionist', '5': 'nurse', '6': 'lab_tech', '7': 'pharmacist', '8': 'accountant' };
      const mockUser = {
        id: Date.now(),
        first_name: staffForm.first_name,
        last_name: staffForm.last_name,
        email: staffForm.email,
        phone: staffForm.phone,
        role_name: roleNames[staffForm.role_id] || 'staff',
        status: 'active'
      };
      setStock([...staff, mockUser]);
      addNotification(`Staff invited successfully (Offline Session)`, 'success');
      setStaffForm({
        first_name: '', last_name: '', email: '', phone: '', role_id: '3', password: 'password123'
      });
    }
  };

  const handleUpdateDoctorHours = (docId) => {
    addNotification(`Operating session slots modified for Dr. Aravind.`, 'info');
  };

  // Mock analytics charts data
  const revenueTrendData = [
    { month: 'Jan', Revenue: 180000, Footfall: 240 },
    { month: 'Feb', Revenue: 210000, Footfall: 310 },
    { month: 'Mar', Revenue: 195000, Footfall: 290 },
    { month: 'Apr', Revenue: 240000, Footfall: 380 },
    { month: 'May', Revenue: 280000, Footfall: 420 },
    { month: 'Jun', Revenue: 310000, Footfall: 490 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Clinic branch sub-tabs header menu */}
      <div className="flex border-b border-slate-800 space-x-4">
        {[
          { id: 'analytics', label: 'Branch Analytics', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'staff', label: 'Staff Roster Profiles', icon: <Users className="w-4 h-4" /> },
          { id: 'hours', label: 'Doctor Consulting Hours', icon: <Calendar className="w-4 h-4" /> },
          { id: 'config', label: 'Branch Config', icon: <Settings className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center space-x-2 pb-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 ${
              activeSubTab === tab.id 
                ? 'border-brand-500 text-brand-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 1. Branch Analytics Tab */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-slate-500 uppercase block">Total Consults</span>
                <strong className="text-base text-brand-400 mt-1 block">1,823 Visits</strong>
              </div>
              <Activity className="w-8 h-8 text-brand-500/10" />
            </div>
            <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-slate-500 uppercase block">Active Clinicians</span>
                <strong className="text-base text-emerald-400 mt-1 block">8 Staff</strong>
              </div>
              <Users className="w-8 h-8 text-emerald-500/10" />
            </div>
            <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-slate-500 uppercase block">Diagnostics Lab TAT</span>
                <strong className="text-base text-yellow-400 mt-1 block">42 Mins Average</strong>
              </div>
              <Clock className="w-8 h-8 text-yellow-500/10" />
            </div>
            <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-slate-500 uppercase block">Net Margin Ratio</span>
                <strong className="text-base text-indigo-400 mt-1 block">78.4% Efficiency</strong>
              </div>
              <TrendingUp className="w-8 h-8 text-indigo-500/10" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel rounded-2xl p-6 h-80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Clinic Monthly Revenue growth</h3>
              <div className="w-full h-full pb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                    <Line type="monotone" dataKey="Revenue" stroke="#0ea5e9" strokeWidth={2} dot={{ fill: '#0ea5e9' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6 h-80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Patient Footfall Volume</h3>
              <div className="w-full h-full pb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                    <Bar dataKey="Footfall" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Staff Profiles Tab */}
      {activeSubTab === 'staff' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 glass-panel rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">Branch Staff Directory</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4 text-[11px]">
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Search Staff</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search name, phone, email..."
                    value={staffSearchQuery}
                    onChange={(e) => setStaffSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 pl-8 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Filter Role</label>
                <select
                  value={staffRoleFilter}
                  onChange={(e) => setStaffRoleFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1.5 text-slate-200"
                >
                  <option value="all">All Roles</option>
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="lab_tech">Lab Tech</option>
                  <option value="pharmacist">Pharmacist</option>
                  <option value="accountant">Accountant</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={staffStartDate}
                  onChange={(e) => setStaffStartDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={staffEndDate}
                  onChange={(e) => setStaffEndDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="py-2.5 px-3">Staff Name</th>
                    <th className="py-2.5 px-3">Access Level (Role)</th>
                    <th className="py-2.5 px-3">Contact Email</th>
                    <th className="py-2.5 px-3">Phone</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/45 text-slate-300">
                  {staff
                    .filter(s => {
                      const fullName = `${s.first_name} ${s.last_name || ''}`.toLowerCase();
                      const matchesQuery = fullName.includes(staffSearchQuery.toLowerCase()) || 
                                           s.email.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
                                           (s.phone && s.phone.includes(staffSearchQuery));
                      
                      const roleName = s.role_name ? s.role_name.toLowerCase() : 'doctor';
                      const matchesRole = staffRoleFilter === 'all' || roleName === staffRoleFilter.toLowerCase();
                      
                      const createdDate = s.created_at ? new Date(s.created_at) : new Date('2026-07-01');
                      const matchesStart = !staffStartDate || createdDate >= new Date(staffStartDate + 'T00:00:00');
                      const matchesEnd = !staffEndDate || createdDate <= new Date(staffEndDate + 'T23:59:59');

                      return matchesQuery && matchesRole && matchesStart && matchesEnd;
                    })
                    .map((s) => (
                      <tr key={s.id} className="hover:bg-slate-900/10">
                        <td className="py-3 px-3 font-semibold text-slate-200">{s.first_name} {s.last_name || ''}</td>
                        <td className="py-3 px-3 capitalize">
                          <span className="bg-slate-950 px-2 py-0.5 rounded text-slate-400 border border-slate-900 text-[10px]">
                            {s.role_name ? s.role_name.replace('_', ' ') : 'doctor'}
                          </span>
                        </td>
                        <td className="py-3 px-3">{s.email}</td>
                        <td className="py-3 px-3 font-mono">{s.phone || 'N/A'}</td>
                        <td className="py-3 px-3">
                          <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded text-[9px] uppercase">
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-4 glass-panel rounded-2xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center space-x-1.5">
              <Plus className="w-4 h-4 text-brand-400" />
              <span>Invite New Staff Member</span>
            </h3>
            <form onSubmit={handleAddStaff} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">First Name *</label>
                  <input type="text" required value={staffForm.first_name} onChange={(e) => setStaffForm({ ...staffForm, first_name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Last Name</label>
                  <input type="text" value={staffForm.last_name} onChange={(e) => setStaffForm({ ...staffForm, last_name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Email ID *</label>
                <input type="email" required value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Access Level *</label>
                <select value={staffForm.role_id} onChange={(e) => setStaffForm({ ...staffForm, role_id: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200">
                  <option value="3">Doctor (EMR write permissions)</option>
                  <option value="5">Nurse (Vitals triage write)</option>
                  <option value="4">Receptionist (Appointments & Registration)</option>
                  <option value="6">Lab Technician (Diagnostics write)</option>
                  <option value="7">Pharmacist (Inventory write)</option>
                  <option value="8">Accountant (Ledger & tax access)</option>
                </select>
              </div>
              <button type="submit" className="w-full py-2 bg-brand-500 text-white font-bold rounded-lg mt-2">Send Invitation</button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Doctor Consulting Hours Tab */}
      {activeSubTab === 'hours' && (
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 pb-2 border-b border-slate-800">Doctor Consulting Roster</h2>
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="py-2.5 px-3">Doctor</th>
                  <th className="py-2.5 px-3">Specialization</th>
                  <th className="py-2.5 px-3">Consulting Days</th>
                  <th className="py-2.5 px-3">Shift Hours</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                {doctorHours.map(d => (
                  <tr key={d.id} className="hover:bg-slate-900/10">
                    <td className="py-3 px-3 font-semibold text-slate-200">{d.name}</td>
                    <td className="py-3 px-3 text-brand-400 font-medium">{d.spec}</td>
                    <td className="py-3 px-3">{d.days}</td>
                    <td className="py-3 px-3 font-mono">{d.hours}</td>
                    <td className="py-3 px-3">
                      <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded text-[9px] uppercase">{d.status}</span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button onClick={() => handleUpdateDoctorHours(d.id)} className="p-1 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Branch Config Tab */}
      {activeSubTab === 'config' && (
        <div className="glass-panel rounded-2xl p-6 max-w-xl text-xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 pb-2 border-b border-slate-800">Branch Operational Settings</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Start Hour</label>
                <input type="time" defaultValue="09:00" className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">End Hour</label>
                <input type="time" defaultValue="21:00" className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" />
              </div>
            </div>
            
            <div className="pt-2">
              <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Active Specialities</label>
              <div className="space-y-2 mt-2">
                {['Cardiology', 'Pediatrics', 'Dental Care', 'General Medicine', 'Diagnostics Lab', 'Retail Pharmacy'].map((dept) => (
                  <label key={dept} className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-brand-500 font-bold" />
                    <span className="text-slate-300">{dept}</span>
                  </label>
                ))}
              </div>
            </div>

            <button 
              onClick={() => addNotification('Branch schedule updated.', 'success')}
              className="mt-4 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg"
            >
              Save Configurations
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ClinicAdminDashboard;
