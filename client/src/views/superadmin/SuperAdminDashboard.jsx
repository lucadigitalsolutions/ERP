import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRole } from '../../context/RoleContext';
import { LayoutDashboard, Users, Key, FileText, Plus, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const SuperAdminDashboard = () => {
  const { addNotification } = useRole();
  const [activeSubTab, setActiveSubTab] = useState('metrics'); // metrics, orgs, apiKeys
  
  // States
  const [metrics, setMetrics] = useState({
    activeTenants: 12, totalClinics: 48, activeDoctors: 184, mrrRupees: 650000
  });
  const [growthChart, setGrowthChart] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [keys, setKeys] = useState([
    { id: 1, name: 'Tally ERP Connector', key: 'cf_live_8910...22a', status: 'active', created_at: '2026-07-01' },
    { id: 2, name: 'MetaBase Reporting Tool', key: 'cf_live_3418...11f', status: 'active', created_at: '2026-07-10' }
  ]);

  // Forms
  const [orgForm, setOrgForm] = useState({ name: '', domain: '', billing_email: '', plan: 'enterprise' });
  const [keyName, setKeyName] = useState('');

  const fetchSuperData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/super/metrics');
      setMetrics(res.data.metrics);
      setGrowthChart(res.data.growthChart);
      
      const orgRes = await axios.get('http://localhost:5000/api/clinics');
      setOrgs(orgRes.data);
    } catch (err) {
      console.warn('Backend offline, loading mock metrics...');
      setGrowthChart([
        { month: 'Jan', revenue: 450000, clinics: 30 },
        { month: 'Feb', revenue: 490000, clinics: 34 },
        { month: 'Mar', revenue: 520000, clinics: 39 },
        { month: 'Apr', revenue: 580000, clinics: 42 },
        { month: 'May', revenue: 610000, clinics: 46 },
        { month: 'Jun', revenue: 650000, clinics: 48 }
      ]);
      setOrgs([
        { id: 1, name: 'CareFlow Bengaluru Downtown', code: 'CF-BLR-01', type: 'multi_specialty', city: 'Bengaluru', status: 'active' },
        { id: 2, name: 'CareFlow Indiranagar Dental', code: 'CF-BLR-02', type: 'dental', city: 'Bengaluru', status: 'active' }
      ]);
    }
  };

  useEffect(() => {
    fetchSuperData();
  }, []);

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    if (!orgForm.name || !orgForm.domain) {
      alert('Organization name and web domain are required.');
      return;
    }
    const newOrg = {
      id: Date.now(),
      name: orgForm.name,
      code: `CF-${orgForm.domain.split('.')[0].toUpperCase()}`,
      type: 'multi_specialty',
      city: 'Delhi',
      status: 'active'
    };
    setOrgs([...orgs, newOrg]);
    addNotification(`Tenant Organization ${orgForm.name} onboarded!`, 'success');
    setOrgForm({ name: '', domain: '', billing_email: '', plan: 'enterprise' });
    setActiveSubTab('orgs');
  };

  const handleGenerateKey = (e) => {
    e.preventDefault();
    if (!keyName) return;
    const newKey = {
      id: Date.now(),
      name: keyName,
      key: `cf_live_${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 5)}`,
      status: 'active',
      created_at: new Date().toISOString().split('T')[0]
    };
    setKeys([...keys, newKey]);
    addNotification(`Developer API token generated: ${keyName}`, 'success');
    setKeyName('');
  };

  return (
    <div className="space-y-6">
      
      {/* Metrics widgets row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Active Tenant Orgs</span>
            <p className="text-lg font-bold text-slate-200 mt-1">{metrics.activeTenants} Organizations</p>
          </div>
          <Users className="w-8 h-8 text-brand-500/20" />
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Active Clinics</span>
            <p className="text-lg font-bold text-slate-200 mt-1">{metrics.totalClinics} Clinic Hubs</p>
          </div>
          <LayoutDashboard className="w-8 h-8 text-brand-500/20" />
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Licensed Physicians</span>
            <p className="text-lg font-bold text-slate-200 mt-1">{metrics.activeDoctors} Doctors</p>
          </div>
          <Users className="w-8 h-8 text-brand-500/20" />
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Monthly SaaS Revenue (MRR)</span>
            <p className="text-lg font-bold text-emerald-400 mt-1">₹{metrics.mrrRupees.toLocaleString()}</p>
          </div>
          <Check className="w-8 h-8 text-emerald-500/20" />
        </div>
      </div>

      {/* Main Switcher */}
      <div className="flex border-b border-slate-800 space-x-4">
        <button
          onClick={() => setActiveSubTab('metrics')}
          className={`flex items-center space-x-2 pb-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 ${
            activeSubTab === 'metrics' 
              ? 'border-brand-500 text-brand-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>SaaS Platform Stats</span>
        </button>
        <button
          onClick={() => setActiveSubTab('orgs')}
          className={`flex items-center space-x-2 pb-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 ${
            activeSubTab === 'orgs' 
              ? 'border-brand-500 text-brand-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Tenant Organization Accounts</span>
        </button>
        <button
          onClick={() => setActiveSubTab('apiKeys')}
          className={`flex items-center space-x-2 pb-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 ${
            activeSubTab === 'apiKeys' 
              ? 'border-brand-500 text-brand-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Developer API Integrations</span>
        </button>
      </div>

      {/* Render Sub Tabs */}
      {activeSubTab === 'metrics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="glass-panel rounded-2xl p-6 h-80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Monthly Recurring Revenue Trajectory</h3>
            <div className="w-full h-full pb-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthChart}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Clinics Count Chart */}
          <div className="glass-panel rounded-2xl p-6 h-80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Branch Onboarding Growth</h3>
            <div className="w-full h-full pb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Bar dataKey="clinics" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'orgs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Orgs List */}
          <div className="lg:col-span-8 glass-panel rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">Onboarded Clinic Tenants</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3">Branch Clinic Hub</th>
                    <th className="py-2.5 px-3">Unique Code</th>
                    <th className="py-2.5 px-3">Specialty Type</th>
                    <th className="py-2.5 px-3">City Region</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {orgs.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-900/10 text-slate-300">
                      <td className="py-3 px-3 font-semibold text-slate-200">{o.name}</td>
                      <td className="py-3 px-3 font-mono">{o.code}</td>
                      <td className="py-3 px-3 capitalize">{o.type ? o.type.replace('_', ' ') : 'Multi Specialty'}</td>
                      <td className="py-3 px-3">{o.city}</td>
                      <td className="py-3 px-3">
                        <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                          {o.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Onboard Form */}
          <div className="lg:col-span-4 glass-panel rounded-2xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center space-x-1.5">
              <Plus className="w-4 h-4 text-brand-400" />
              <span>Create New Clinic Tenant</span>
            </h3>
            
            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Clinic Name *</label>
                <input
                  type="text"
                  required
                  value={orgForm.name}
                  onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                  placeholder="e.g. CareFlow Delhi Fortis"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none text-slate-200"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Web Domain *</label>
                <input
                  type="text"
                  required
                  value={orgForm.domain}
                  onChange={(e) => setOrgForm({ ...orgForm, domain: e.target.value })}
                  placeholder="e.g. delhifortis.careflow.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none text-slate-200"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Billing Email</label>
                <input
                  type="email"
                  value={orgForm.billing_email}
                  onChange={(e) => setOrgForm({ ...orgForm, billing_email: e.target.value })}
                  placeholder="e.g. finance@delhifortis.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none text-slate-200"
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs rounded-xl shadow-lg transition-all"
              >
                Onboard Clinic Branch
              </button>
            </form>
          </div>
        </div>
      )}

      {activeSubTab === 'apiKeys' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* API Keys List */}
          <div className="lg:col-span-8 glass-panel rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">Active API credentials</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3">Service Name</th>
                    <th className="py-2.5 px-3">API Token String</th>
                    <th className="py-2.5 px-3">Generated Date</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {keys.map((k) => (
                    <tr key={k.id} className="hover:bg-slate-900/10 text-slate-300">
                      <td className="py-3 px-3 font-semibold text-slate-200">{k.name}</td>
                      <td className="py-3 px-3 font-mono text-brand-400">{k.key}</td>
                      <td className="py-3 px-3">{k.created_at}</td>
                      <td className="py-3 px-3">
                        <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                          {k.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Generate Key Form */}
          <div className="lg:col-span-4 glass-panel rounded-2xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center space-x-1.5">
              <Key className="w-4 h-4 text-brand-400" />
              <span>Generate Developer Token</span>
            </h3>
            
            <form onSubmit={handleGenerateKey} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Service Integration Name *</label>
                <input
                  type="text"
                  required
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="e.g. WhatsApp Bot Webhook"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none text-slate-200"
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs rounded-xl shadow-lg"
              >
                Generate API Key
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SuperAdminDashboard;
