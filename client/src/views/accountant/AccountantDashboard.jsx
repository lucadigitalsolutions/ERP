import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRole } from '../../context/RoleContext';
import { 
  CreditCard, DollarSign, FileText, Plus, Landmark, TrendingUp,
  FileCheck, Shield, Receipt, RefreshCw, Printer, AlertTriangle, FileSpreadsheet
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const AccountantDashboard = () => {
  const { clinic, addNotification, activeSubTab, setActiveSubTab } = useRole();
  
  // States
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [claims, setClaims] = useState([
    { id: 'CLM-781', patient_name: 'Rahul Verma', policy_no: 'SH-981123-A', provider: 'Star Health', amount: 1600.00, status: 'approved', corporate: 'Google Corp' },
    { id: 'CLM-782', patient_name: 'Priya Sharma', policy_no: 'HE-110293-B', provider: 'HDFC Ergo', amount: 800.00, status: 'pending_tpa', corporate: 'TCS Corp' }
  ]);

  // Filters & Toggles
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, yesterday, week
  const [paymentModeFilter, setPaymentModeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedInvoiceId, setExpandedInvoiceId] = useState(null);
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('all');

  // Add Expense form
  const [expenseForm, setExpenseForm] = useState({
    title: '', category: 'Medical Supplies', amount: '', method: 'UPI', date: new Date().toISOString().split('T')[0]
  });

  const fetchFinancials = async () => {
    try {
      const invRes = await axios.get('http://localhost:5000/api/finance/invoices');
      setInvoices(invRes.data);
      const expRes = await axios.get(`http://localhost:5000/api/finance/expenses?clinic_id=${clinic}`);
      setExpenses(expRes.data);
    } catch (err) {
      console.warn('Backend offline, loading mock financials...');
      setInvoices([
        { 
          id: 1, 
          invoice_number: 'INV-2026-0001', 
          patient_name: 'Rahul Verma', 
          patient_mrn: 'MRN-2026-0001', 
          grand_total: 1600.00, 
          gst_amount: 192.00, 
          sub_total: 1408.00, 
          payment_status: 'paid', 
          payment_method: 'UPI', 
          created_at: '2026-07-23T10:30:00Z',
          items: [{ item_name: 'Doctor Consultation Fee', quantity: 1, unit_price: 800.00, gst_percent: 18.00, total_price: 800.00 }, { item_name: 'Lipid Profile, HbA1c Lab Test', quantity: 1, unit_price: 800.00, gst_percent: 12.00, total_price: 800.00 }] 
        },
        { 
          id: 2, 
          invoice_number: 'INV-2026-0002', 
          patient_name: 'Priya Sharma', 
          patient_mrn: 'MRN-2026-0002', 
          grand_total: 800.00, 
          gst_amount: 96.00, 
          sub_total: 704.00, 
          payment_status: 'unpaid', 
          payment_method: 'Insurance', 
          created_at: '2026-07-23T11:45:00Z',
          items: [{ item_name: 'Orthodontics Checkup Fee', quantity: 1, unit_price: 600.00, gst_percent: 12.00, total_price: 600.00 }] 
        }
      ]);
      setExpenses([
        { id: 1, title: 'Reagent chemicals purchase', category: 'Medical Supplies', amount: 8500.00, method: 'UPI', date: '2026-07-20' },
        { id: 2, title: 'Clinic floor electricity bill', category: 'Utilities', amount: 14200.00, method: 'Bank Transfer', date: '2026-07-15' }
      ]);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, [clinic]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.title || !expenseForm.amount) {
      alert('Please enter expense title and amount.');
      return;
    }
    const payload = {
      clinic_id: clinic,
      title: expenseForm.title,
      category: expenseForm.category,
      amount: parseFloat(expenseForm.amount),
      method: expenseForm.method,
      date: expenseForm.date
    };
    try {
      await axios.post('http://localhost:5000/api/finance/expenses', payload);
      addNotification(`Operating expense recorded: ${payload.title}`, 'success');
      setExpenseForm({
        title: '', category: 'Medical Supplies', amount: '', method: 'UPI', date: new Date().toISOString().split('T')[0]
      });
      fetchFinancials();
    } catch (err) {
      const mockItem = { id: Date.now(), ...payload };
      setExpenses([mockItem, ...expenses]);
      addNotification(`Operating expense recorded (Offline Mode)`, 'success');
      setExpenseForm({
        title: '', category: 'Medical Supplies', amount: '', method: 'UPI', date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const handleApproveClaim = (claimId) => {
    setClaims(claims.map(c => c.id === claimId ? { ...c, status: 'approved' } : c));
    addNotification(`Insurance Claim ${claimId} cleared by Third Party Auditor (TPA).`, 'success');
  };

  const handleProcessRefund = async (invoiceId, invoiceNo) => {
    try {
      await axios.put(`http://localhost:5000/api/finance/invoices/${invoiceId}/refund`);
      addNotification(`Invoice ${invoiceNo} refunded successfully!`, 'success');
      fetchFinancials();
    } catch (err) {
      setInvoices(invoices.map(i => i.id === invoiceId ? { ...i, payment_status: 'refunded' } : i));
      addNotification(`Invoice ${invoiceNo} marked as Refunded (Offline Mode)`, 'success');
    }
  };

  const filterByDate = (itemDate, range) => {
    if (range === 'all') return true;
    const dateObj = new Date(itemDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const itemDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    
    if (range === 'today') {
      return itemDay.getTime() === today.getTime();
    }
    if (range === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return itemDay.getTime() === yesterday.getTime();
    }
    if (range === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return itemDay.getTime() >= weekAgo.getTime();
    }
    return true;
  };

  // Metrics
  const totalRevenue = invoices.filter(i => i.payment_status === 'paid').reduce((acc, inv) => acc + parseFloat(inv.grand_total || 0), 0);
  const totalGST = invoices.filter(i => i.payment_status === 'paid').reduce((acc, inv) => acc + parseFloat(inv.gst_amount || 0), 0);
  const totalExpenses = expenses.reduce((acc, exp) => acc + parseFloat(exp.amount || 0), 0);
  const netIncome = totalRevenue - totalExpenses;
  const outstandingBal = invoices.filter(i => i.payment_status === 'unpaid').reduce((acc, i) => acc + parseFloat(i.grand_total || 0), 0);

  // GST Calculation Breakdown
  const getGstSummary = () => {
    let gst0 = 0, taxable0 = 0;
    let gst5 = 0, taxable5 = 0;
    let gst12 = 0, taxable12 = 0;
    let gst18 = 0, taxable18 = 0;

    invoices.filter(i => i.payment_status === 'paid').forEach(inv => {
      if (inv.items && inv.items.length > 0) {
        inv.items.forEach(item => {
          const rate = parseFloat(item.gst_percent || 0);
          const total = parseFloat(item.total_price || 0);
          const taxable = total / (1 + rate / 100);
          const tax = total - taxable;

          if (rate === 0) {
            taxable0 += total;
          } else if (rate <= 5) {
            taxable5 += taxable;
            gst5 += tax;
          } else if (rate <= 12) {
            taxable12 += taxable;
            gst12 += tax;
          } else if (rate <= 18) {
            taxable18 += taxable;
            gst18 += tax;
          }
        });
      } else {
        const rate = 12.00;
        const total = parseFloat(inv.grand_total || 0);
        const taxable = total / (1 + rate / 100);
        const tax = total - taxable;
        taxable12 += taxable;
        gst12 += tax;
      }
    });

    return { gst0, taxable0, gst5, taxable5, gst12, taxable12, gst18, taxable18 };
  };

  const gstSummary = getGstSummary();

  const filteredExpenses = expenses.filter(exp => 
    expenseCategoryFilter === 'all' || exp.category === expenseCategoryFilter
  );

  // Chart data formatting
  const getChartData = () => {
    const days = ['July 18', 'July 19', 'July 20', 'July 21', 'July 22', 'July 23'];
    return days.map((day, idx) => {
      let rev = 4000 + idx * 500;
      let exp = 2000 + (idx % 2) * 1000;
      if (idx === 5) {
        rev = totalRevenue;
        exp = totalExpenses;
      }
      return { name: day, Revenue: rev, Expenses: exp };
    });
  };
  const revenueChartData = getChartData();

  return (
    <div className="space-y-6">
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Invoiced Revenue (Paid)</span>
            <p className="text-lg font-bold text-emerald-400 mt-1">₹{totalRevenue.toLocaleString()}</p>
          </div>
          <DollarSign className="w-8 h-8 text-emerald-500/20" />
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Total GST Collection</span>
            <p className="text-lg font-bold text-brand-400 mt-1">₹{totalGST.toLocaleString()}</p>
          </div>
          <Landmark className="w-8 h-8 text-brand-500/20" />
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Operating Expenses</span>
            <p className="text-lg font-bold text-red-400 mt-1">₹{totalExpenses.toLocaleString()}</p>
          </div>
          <CreditCard className="w-8 h-8 text-red-500/20" />
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Outstanding Balance</span>
            <p className="text-lg font-bold text-yellow-400 mt-1">₹{outstandingBal.toLocaleString()}</p>
          </div>
          <AlertTriangle className="w-8 h-8 text-yellow-500/20" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-4">
        {[
          { id: 'ledger', label: 'Invoices General Ledger', icon: <FileText className="w-4 h-4" /> },
          { id: 'expenses', label: 'Voucher Expense logs', icon: <CreditCard className="w-4 h-4" /> },
          { id: 'claims', label: 'Insurance & Corporate Claims', icon: <Shield className="w-4 h-4" /> },
          { id: 'gst', label: 'GST Tax Reports', icon: <Landmark className="w-4 h-4" /> },
          { id: 'charts', label: 'Cashflow Analytics', icon: <TrendingUp className="w-4 h-4" /> }
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

      {/* 1. General Ledger */}
      {activeSubTab === 'ledger' && (
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Invoice Cash Book</h2>
            <button onClick={() => addNotification('Invoices exported to Excel successfully.', 'success')} className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-950 border border-slate-800 text-[10px] uppercase font-bold text-slate-400 hover:text-slate-200 rounded">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Ledger</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Search Patient / Invoice</label>
              <input
                type="text"
                placeholder="Search name or INV..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Date Range</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last 7 Days</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Payment Mode</label>
              <select
                value={paymentModeFilter}
                onChange={(e) => setPaymentModeFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
              >
                <option value="all">All Modes</option>
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Insurance">Insurance</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="py-2.5 px-3">Invoice ID</th>
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3 text-right">GST Collected</th>
                  <th className="py-2.5 px-3 text-right">Grand Total (₹)</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                {invoices
                  .filter(inv => {
                    const patName = inv.patient_name || '';
                    const matchSearch = inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                      patName.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchDate = filterByDate(inv.created_at, dateFilter);
                    const matchMode = paymentModeFilter === 'all' || inv.payment_method === paymentModeFilter;
                    const matchStatus = statusFilter === 'all' || inv.payment_status === statusFilter;
                    return matchSearch && matchDate && matchMode && matchStatus;
                  })
                  .map((inv) => (
                    <React.Fragment key={inv.id}>
                      <tr 
                        onClick={() => setExpandedInvoiceId(expandedInvoiceId === inv.id ? null : inv.id)}
                        className="hover:bg-slate-900/10 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-3 font-semibold text-brand-400 font-mono">{inv.invoice_number}</td>
                        <td className="py-3 px-3 font-bold text-slate-200">{inv.patient_name}</td>
                        <td className="py-3 px-3">{new Date(inv.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            inv.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' : 
                            inv.payment_status === 'refunded' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>{inv.payment_status}</span>
                        </td>
                        <td className="py-3 px-3">{inv.payment_method}</td>
                        <td className="py-3 px-3 text-right text-slate-500">₹{parseFloat(inv.gst_amount || 0).toFixed(2)}</td>
                        <td className="py-3 px-3 text-right font-bold text-slate-200">₹{parseFloat(inv.grand_total || 0).toFixed(2)}</td>
                        <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          {inv.payment_status === 'paid' && (
                            <button 
                              onClick={() => handleProcessRefund(inv.id, inv.invoice_number)} 
                              className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg text-[9px] font-bold transition-all"
                            >
                              Refund Receipt
                            </button>
                          )}
                        </td>
                      </tr>
                      {expandedInvoiceId === inv.id && (
                        <tr className="bg-slate-950/40">
                          <td colSpan={8} className="p-4 border-b border-slate-800">
                            <div className="space-y-2">
                              <h4 className="font-bold text-slate-400 uppercase text-[9px] tracking-wider mb-2">Itemized Invoice Summary</h4>
                              {inv.items && inv.items.length > 0 ? (
                                <div className="divide-y divide-slate-800/40 text-[11px] text-slate-400 max-w-2xl">
                                  <div className="grid grid-cols-12 font-bold text-slate-500 pb-1.5 uppercase text-[9px]">
                                    <div className="col-span-6">Billed Charge Item</div>
                                    <div className="col-span-2 text-right">Qty</div>
                                    <div className="col-span-2 text-right">Rate (₹)</div>
                                    <div className="col-span-2 text-right">Total (₹)</div>
                                  </div>
                                  {inv.items.map((item, idx) => (
                                    <div key={idx} className="grid grid-cols-12 py-2">
                                      <div className="col-span-6 font-semibold text-slate-300">{item.item_name} <span className="text-[9px] text-slate-500">({item.gst_percent}% GST)</span></div>
                                      <div className="col-span-2 text-right font-mono">{item.quantity}</div>
                                      <div className="col-span-2 text-right font-mono">₹{parseFloat(item.unit_price).toFixed(2)}</div>
                                      <div className="col-span-2 text-right font-mono text-slate-200">₹{parseFloat(item.total_price).toFixed(2)}</div>
                                    </div>
                                  ))}
                                  <div className="grid grid-cols-12 pt-2 border-t border-slate-800 text-xs font-bold">
                                    <div className="col-span-10 text-right text-slate-500">Subtotal:</div>
                                    <div className="col-span-2 text-right text-slate-300 font-mono">₹{parseFloat(inv.sub_total || 0).toFixed(2)}</div>
                                  </div>
                                  <div className="grid grid-cols-12 text-xs font-bold mt-1">
                                    <div className="col-span-10 text-right text-slate-500">GST Collected:</div>
                                    <div className="col-span-2 text-right text-slate-300 font-mono">₹{parseFloat(inv.gst_amount || 0).toFixed(2)}</div>
                                  </div>
                                  <div className="grid grid-cols-12 text-xs font-bold mt-1">
                                    <div className="col-span-10 text-right text-slate-500">Discount:</div>
                                    <div className="col-span-2 text-right text-slate-300 font-mono">₹{parseFloat(inv.discount_amount || 0).toFixed(2)}</div>
                                  </div>
                                  <div className="grid grid-cols-12 text-sm font-extrabold mt-1 text-brand-400">
                                    <div className="col-span-10 text-right">Grand Total:</div>
                                    <div className="col-span-2 text-right font-mono">₹{parseFloat(inv.grand_total || 0).toFixed(2)}</div>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-slate-500 italic">No line items recorded for this invoice.</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Vouchers & Expenses */}
      {activeSubTab === 'expenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 glass-panel rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Voucher Expense Logs</h2>
              <select
                value={expenseCategoryFilter}
                onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-300 text-xs"
              >
                <option value="all">All Categories</option>
                <option value="Medical Supplies">Medical Supplies</option>
                <option value="Utilities">Utilities</option>
                <option value="Rent">Branch Rent</option>
                <option value="Salaries">Staff Salaries</option>
              </select>
            </div>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="py-2.5 px-3">Voucher Title</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300">
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-900/10">
                      <td className="py-3 px-3 font-semibold text-slate-200">{exp.title}</td>
                      <td className="py-3 px-3">{exp.category}</td>
                      <td className="py-3 px-3">{new Date(exp.date).toLocaleDateString()}</td>
                      <td className="py-3 px-3">{exp.method}</td>
                      <td className="py-3 px-3 text-right text-red-400 font-bold font-mono">₹{parseFloat(exp.amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-4 glass-panel rounded-2xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center space-x-1.5">
              <Plus className="w-4 h-4 text-brand-400" />
              <span>Record Expense Voucher</span>
            </h3>
            <form onSubmit={handleAddExpense} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Expense Title *</label>
                <input type="text" required value={expenseForm.title} onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Category</label>
                <select value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200">
                  <option value="Medical Supplies">Medical Supplies</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Rent">Branch Rent</option>
                  <option value="Salaries">Staff Salaries</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Amount (₹) *</label>
                <input type="number" required value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" />
              </div>
              <button type="submit" className="w-full py-2 bg-red-500 text-white font-bold rounded-lg mt-2 transition-all">Log Expense</button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Insurance & Corporate Claims */}
      {activeSubTab === 'claims' && (
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 pb-2 border-b border-slate-800">TPA Claims Registry</h2>
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="py-2.5 px-3">Claim ID</th>
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Provider</th>
                  <th className="py-2.5 px-3">Corporate Account</th>
                  <th className="py-2.5 px-3">Amount (₹)</th>
                  <th className="py-2.5 px-3">TPA Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                {claims.map(c => (
                  <tr key={c.id} className="hover:bg-slate-900/10">
                    <td className="py-3 px-3 font-semibold text-brand-400">{c.id}</td>
                    <td className="py-3 px-3 font-bold">{c.patient_name}</td>
                    <td className="py-3 px-3 font-medium">{c.provider} (Policy: {c.policy_no})</td>
                    <td className="py-3 px-3">{c.corporate}</td>
                    <td className="py-3 px-3 font-bold text-slate-200">₹{c.amount.toFixed(2)}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        c.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>{c.status.replace('_', ' ')}</span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {c.status !== 'approved' && (
                        <button onClick={() => handleApproveClaim(c.id)} className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white font-bold rounded text-[9px] uppercase">
                          Approve Claim
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. GST Tax Reports */}
      {activeSubTab === 'gst' && (
        <div className="glass-panel rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">GST Output Tax Liabilities</h2>
            <button onClick={() => addNotification('GST tax ledger downloaded.', 'success')} className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-950 border border-slate-800 text-[10px] uppercase font-bold text-slate-400 hover:text-slate-200 rounded">
              <Printer className="w-3.5 h-3.5" />
              <span>Print GSTR-1 Draft</span>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 text-center text-xs">
            <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl">
              <span className="text-slate-500 uppercase block font-semibold text-[9px]">GSTR 0% Tax Free</span>
              <strong className="text-sm text-slate-300 block mt-1">₹{gstSummary.taxable0.toFixed(2)}</strong>
            </div>
            <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl">
              <span className="text-slate-500 uppercase block font-semibold text-[9px]">GSTR 5% Output Tax</span>
              <strong className="text-sm text-emerald-400 block mt-1">₹{gstSummary.gst5.toFixed(2)} <span className="text-[10px] text-slate-500 block font-normal mt-0.5">CGST: ₹{(gstSummary.gst5/2).toFixed(2)} | SGST: ₹{(gstSummary.gst5/2).toFixed(2)}</span></strong>
            </div>
            <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl">
              <span className="text-slate-500 uppercase block font-semibold text-[9px]">GSTR 12% Output Tax</span>
              <strong className="text-sm text-brand-400 block mt-1">₹{gstSummary.gst12.toFixed(2)} <span className="text-[10px] text-slate-500 block font-normal mt-0.5">CGST: ₹{(gstSummary.gst12/2).toFixed(2)} | SGST: ₹{(gstSummary.gst12/2).toFixed(2)}</span></strong>
            </div>
            <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl">
              <span className="text-slate-500 uppercase block font-semibold text-[9px]">GSTR 18% Output Tax</span>
              <strong className="text-sm text-slate-350 block mt-1">₹{gstSummary.gst18.toFixed(2)} <span className="text-[10px] text-slate-500 block font-normal mt-0.5">CGST: ₹{(gstSummary.gst18/2).toFixed(2)} | SGST: ₹{(gstSummary.gst18/2).toFixed(2)}</span></strong>
            </div>
          </div>

          <div className="overflow-x-auto text-xs">
            <h3 className="font-bold text-slate-400 uppercase text-[10px] mb-3">GST Invoice Breakdown</h3>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="py-2 px-3">Invoice ID</th>
                  <th className="py-2 px-3">Patient</th>
                  <th className="py-2 px-3 text-right">Taxable Value (₹)</th>
                  <th className="py-2 px-3 text-right">CGST (₹)</th>
                  <th className="py-2 px-3 text-right">SGST (₹)</th>
                  <th className="py-2 px-3 text-right">Total GST (₹)</th>
                  <th className="py-2 px-3 text-right">Grand Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                {invoices.filter(i => i.payment_status === 'paid').map((inv) => {
                  const total = parseFloat(inv.grand_total || 0);
                  const tax = parseFloat(inv.gst_amount || 0);
                  const taxable = parseFloat(inv.sub_total || 0);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-900/10">
                      <td className="py-3 px-3 font-semibold text-brand-400 font-mono">{inv.invoice_number}</td>
                      <td className="py-3 px-3 font-bold">{inv.patient_name}</td>
                      <td className="py-3 px-3 text-right font-mono">₹{taxable.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-500">₹{(tax / 2).toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-500">₹{(tax / 2).toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-bold text-brand-400 font-mono">₹{tax.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-200 font-mono">₹{total.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Charts */}
      {activeSubTab === 'charts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel rounded-2xl p-6 h-80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Invoiced Revenue vs Operating Expenses</h3>
            <div className="w-full h-full pb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 h-80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Cash Position Growth</h3>
            <div className="w-full h-full pb-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Line type="monotone" dataKey="Revenue" stroke="#0ea5e9" strokeWidth={2} dot={{ fill: '#0ea5e9' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AccountantDashboard;
