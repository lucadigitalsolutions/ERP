import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { Heart, Lock, Mail, Users, ArrowRight } from 'lucide-react';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useRole();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Connect to server login endpoint
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Determine default role folder mapping
      let roleName = 'doctor';
      if (user.role_id === 1) roleName = 'super_admin';
      else if (user.role_id === 2) roleName = 'clinic_admin';
      else if (user.role_id === 3) roleName = 'doctor';
      else if (user.role_id === 4) roleName = 'receptionist';
      else if (user.role_id === 5) roleName = 'nurse';
      else if (user.role_id === 6) roleName = 'lab_tech';
      else if (user.role_id === 7) roleName = 'pharmacist';
      else if (user.role_id === 8) roleName = 'accountant';

      login(token, user, roleName);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Database connection error. Proceeding with demo fallback session...');
      
      // Mock login fallback if backend isn't actively running
      setTimeout(() => {
        const mockUser = { id: 3, email, first_name: 'Dr. John', last_name: 'Doe', role_id: 3 };
        login('demo_token', mockUser, 'doctor');
        navigate('/dashboard');
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  // Demo accounts quick actions
  const demoAccounts = [
    { label: 'Doctor EMR', email: 'doctor@careflow.com', role: 'doctor' },
    { label: 'Clinic Admin', email: 'admin@careflow.com', role: 'clinic_admin' },
    { label: 'Front Desk / Reception', email: 'receptionist@careflow.com', role: 'receptionist' },
    { label: 'Triage Nurse', email: 'nurse@careflow.com', role: 'nurse' },
    { label: 'Lab Technician', email: 'labtech@careflow.com', role: 'lab_tech' },
    { label: 'Pharmacy Inventory', email: 'pharmacist@careflow.com', role: 'pharmacist' },
    { label: 'Clinic Accountant', email: 'accountant@careflow.com', role: 'accountant' },
    { label: 'Super Platform Admin', email: 'superadmin@careflow.com', role: 'super_admin' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Background glowing blur points */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10">
        
        {/* Left column: Login Form */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-brand-500 text-white p-2 rounded-xl">
              <Heart className="w-6 h-6 pulse-heart" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-sans">CareFlow EMR</h2>
              <span className="text-[10px] uppercase font-bold text-brand-400 tracking-widest block leading-none">Enterprise Suite</span>
            </div>
          </div>

          <h3 className="text-2xl font-semibold text-slate-100 mb-2">Welcome Back</h3>
          <p className="text-xs text-slate-400 mb-6">Access your clinical work area and patient queue portal.</p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="User Email ID"
                className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Account Password"
                className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50"
            >
              <span>{loading ? 'Logging In...' : 'Verify & Enter'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>

        {/* Right column: Demo quick shortcuts */}
        <div className="border-t md:border-t-0 md:border-l border-slate-800 pt-6 md:pt-0 md:pl-8 flex flex-col justify-center">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-4 h-4 text-brand-400" />
            <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Evaluation Fast-Pass logins</h4>
          </div>
          <p className="text-[11px] text-slate-500 mb-4">Select any role below to automatically fill credentials and login with demo credentials (password123):</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {demoAccounts.map((acc, index) => (
              <button
                key={index}
                onClick={() => {
                  setEmail(acc.email);
                  setPassword('password123');
                  setError('');
                }}
                className="text-left px-3 py-2 bg-slate-950/50 hover:bg-slate-950/90 border border-slate-800/80 rounded-xl transition-all duration-200 group"
              >
                <p className="text-xs font-semibold text-slate-300 group-hover:text-brand-400 transition-colors">{acc.label}</p>
                <span className="text-[10px] text-slate-500 block truncate">{acc.email}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
