import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRole } from '../../context/RoleContext';
import { 
  ShoppingBag, Database, AlertCircle, Plus, Search, 
  Archive, Users, CreditCard, Receipt, Barcode, HelpCircle, 
  Printer, ArrowRightLeft, FileSpreadsheet, FileText, X
} from 'lucide-react';

const PharmacistDashboard = () => {
  const { clinic, addNotification, activeSubTab, setActiveSubTab } = useRole();
  const [dispensedList, setDispensedList] = useState([
    { id: 'RX-9000', patient_name: 'Amit Patel', patient_mrn: 'MRN-2026-0005', doctor_name: 'Dr. Priya Nair', date: '2026-07-22', status: 'dispensed', items: [{ medicine_name: 'Metformin 500mg', qty: 60, instructions: 'Twice daily after meals' }], dispensed_at: '2026-07-22T14:30:00Z' }
  ]);
  
  // Stock lists
  const [stock, setStock] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Simulated Prescriptions from Doctors awaiting dispensation
  const [prescriptions, setPrescriptions] = useState([
    { id: 'RX-9081', patient_name: 'Rahul Verma', patient_mrn: 'MRN-2026-0001', doctor_name: 'Dr. Aravind Sharma', date: '2026-07-23', status: 'pending', items: [{ medicine_name: 'Amoxicillin 500mg', qty: 10, instructions: 'Twice daily - 5 days' }, { medicine_name: 'Paracetamol 650mg (Dolo)', qty: 15, instructions: 'As needed' }] },
    { id: 'RX-9082', patient_name: 'Priya Sharma', patient_mrn: 'MRN-2026-0002', doctor_name: 'Dr. Priya Nair', date: '2026-07-23', status: 'pending', items: [{ medicine_name: 'Atorvastatin 10mg (Lipitor)', qty: 30, instructions: 'Once daily at night - 30 days' }] }
  ]);

  // Selected Rx for Dispensation Checkout
  const [selectedRx, setSelectedRx] = useState(null);

  // Add Stock form
  const [stockForm, setStockForm] = useState({
    medicine_name: '', batch_number: '', expiry_date: '', stock_qty: '', purchase_rate: '', sale_rate: '', gst_percent: '12',
    supplier_name: 'Apollo Pharma Distributors', supplier_invoice_no: 'INV-PH-88901'
  });

  // Advanced Inventory Filters & Modal
  const [expStartDate, setExpStartDate] = useState('');
  const [expEndDate, setExpEndDate] = useState('');
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);

  // Supplier profiles
  const [suppliers] = useState([
    { name: 'Apollo Pharma Distributors', phone: '9845012345', address: 'Koramangala, Bengaluru', active_invoices: 14 },
    { name: 'Cipla Wholesale Ltd', phone: '9845098765', address: 'Whitefield, Bengaluru', active_invoices: 8 },
    { name: 'Aurobindo Generics', phone: '9845055443', address: 'Electronic City, Bengaluru', active_invoices: 5 }
  ]);

  const fetchInventory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/inventory');
      setStock(res.data);
    } catch (err) {
      console.warn('Backend offline, loading mock pharmacy inventory...');
      setStock([
        { id: 1, medicine_name: 'Paracetamol 650mg (Dolo)', batch_number: 'B-DOL901', expiry_date: '2028-06-30', stock_qty: 500, purchase_rate: 1.20, sale_rate: 2.00, gst_percent: 12 },
        { id: 2, medicine_name: 'Amoxicillin 500mg', batch_number: 'B-AMX402', expiry_date: '2027-12-15', stock_qty: 12, purchase_rate: 4.50, sale_rate: 7.50, gst_percent: 12 },
        { id: 3, medicine_name: 'Atorvastatin 10mg (Lipitor)', batch_number: 'B-LIP551', expiry_date: '2027-09-20', stock_qty: 300, purchase_rate: 8.00, sale_rate: 14.00, gst_percent: 12 },
        { id: 4, medicine_name: 'Metformin 500mg (Glycomet)', batch_number: 'B-GLY772', expiry_date: '2026-11-10', stock_qty: 1000, purchase_rate: 0.80, sale_rate: 1.50, gst_percent: 12 }
      ]);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [clinic]);

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!stockForm.medicine_name || !stockForm.batch_number || !stockForm.stock_qty) {
      alert('Fill out formulation name, batch ID, and intake quantities.');
      return;
    }

    const payload = {
      clinic_id: clinic,
      medicine_name: stockForm.medicine_name,
      batch_number: stockForm.batch_number,
      expiry_date: stockForm.expiry_date,
      stock_qty: parseInt(stockForm.stock_qty),
      purchase_rate: parseFloat(stockForm.purchase_rate),
      sale_rate: parseFloat(stockForm.sale_rate),
      gst_percent: parseFloat(stockForm.gst_percent)
    };

    try {
      await axios.post('http://localhost:5000/api/inventory', payload);
      addNotification(`Stock updated: Added ${payload.stock_qty} units of ${payload.medicine_name}`, 'success');
      setStockForm({
        medicine_name: '', batch_number: '', expiry_date: '', stock_qty: '', purchase_rate: '', sale_rate: '', gst_percent: '12',
        supplier_name: 'Apollo Pharma Distributors', supplier_invoice_no: 'INV-PH-88901'
      });
      fetchInventory();
      setActiveSubTab('inventory');
    } catch (err) {
      const mockItem = { id: Date.now(), ...payload };
      setStock([mockItem, ...stock]);
      addNotification(`Stock batch registered (Offline Session)`, 'success');
      setActiveSubTab('inventory');
    }
  };

  const handleDispenseRx = (rxId) => {
    const rx = prescriptions.find(p => p.id === rxId);
    if (rx) {
      const updatedRx = { ...rx, status: 'dispensed', dispensed_at: new Date().toISOString() };
      setDispensedList([updatedRx, ...dispensedList]);
    }
    setPrescriptions(prescriptions.map(p => p.id === rxId ? { ...p, status: 'dispensed' } : p));
    setSelectedRx(null);
    addNotification(`Dispensation voucher signed and stock items cleared for receipt ${rxId}`, 'success');
  };

  // Calculations for alerts
  const lowStockMeds = stock.filter(item => item.stock_qty < 50);
  const nearExpiryMeds = stock.filter(item => {
    const expDate = new Date(item.expiry_date);
    const today = new Date();
    const diffMonths = (expDate.getFullYear() - today.getFullYear()) * 12 + (expDate.getMonth() - today.getMonth());
    return diffMonths <= 12;
  });

  const filteredStock = stock.filter(item => {
    const matchesQuery = item.medicine_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.batch_number.toLowerCase().includes(searchQuery.toLowerCase());
    
    const expDate = item.expiry_date ? new Date(item.expiry_date) : new Date();
    const matchesStart = !expStartDate || expDate >= new Date(expStartDate + 'T00:00:00');
    const matchesEnd = !expEndDate || expDate <= new Date(expEndDate + 'T23:59:59');

    return matchesQuery && matchesStart && matchesEnd;
  });

  return (
    <div className="space-y-6">
      
      {/* Tab Menu Options */}
      <div className="flex border-b border-slate-800 space-x-4">
        {[
          { id: 'dispensation', label: 'Med Dispensation Desk', icon: <ShoppingBag className="w-4 h-4" /> },
          { id: 'dispense_history', label: 'Dispensation History', icon: <FileText className="w-4 h-4" /> },
          { id: 'inventory', label: 'Pharmacy Stock Ledger', icon: <Database className="w-4 h-4" /> },
          { id: 'add_stock', label: 'Restock Voucher Intake', icon: <Plus className="w-4 h-4" /> },
          { id: 'suppliers', label: 'Supplier registries', icon: <Users className="w-4 h-4" /> },
          { id: 'alerts', label: 'Expiry Batch Alerts', icon: <AlertCircle className="w-4 h-4" /> }
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

      {/* 1. Medication Stock Ledger Tab */}
      {activeSubTab === 'inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 glass-panel rounded-2xl p-6">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Medication Stock Ledger</h2>
              <button
                onClick={() => setIsAddStockModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-lg shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Add Stock Item</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-[11px]">
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Search Formulation</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Filter name, batch..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 pl-8 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Expiry Start Date</label>
                <input
                  type="date"
                  value={expStartDate}
                  onChange={(e) => setExpStartDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Expiry End Date</label>
                <input
                  type="date"
                  value={expEndDate}
                  onChange={(e) => setExpEndDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="py-2.5 px-3">Formulation Name</th>
                    <th className="py-2.5 px-3">Batch ID</th>
                    <th className="py-2.5 px-3">Expiry Date</th>
                    <th className="py-2.5 px-3 text-right">Stock Level</th>
                    <th className="py-2.5 px-3 text-right">Retail Rate</th>
                    <th className="py-2.5 px-3 text-right">Tax GST</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300">
                  {filteredStock.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/10">
                      <td className="py-3 px-3 font-semibold text-slate-200">{item.medicine_name}</td>
                      <td className="py-3 px-3 font-mono">{item.batch_number}</td>
                      <td className="py-3 px-3">{new Date(item.expiry_date).toLocaleDateString()}</td>
                      <td className="py-3 px-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.stock_qty < 50 ? 'bg-red-500/20 text-red-400' : 'bg-slate-950 text-slate-300'
                        }`}>
                          {item.stock_qty} Units
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-brand-400">₹{parseFloat(item.sale_rate).toFixed(2)}</td>
                      <td className="py-3 px-3 text-right text-slate-500">{item.gst_percent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel rounded-2xl p-4 text-xs">
              <h3 className="font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                <Archive className="w-4 h-4" />
                <span>Critical Low Stock ({lowStockMeds.length})</span>
              </h3>
              <div className="space-y-2">
                {lowStockMeds.map(item => (
                  <div key={item.id} className="p-2 bg-red-500/5 border border-red-500/20 rounded-lg">
                    <p className="font-bold text-slate-350">{item.medicine_name}</p>
                    <p className="text-red-400 font-bold mt-0.5">Remaining: {item.stock_qty} units</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-4 text-xs">
              <h3 className="font-bold text-yellow-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>Batch Expiry Alerts ({nearExpiryMeds.length})</span>
              </h3>
              <div className="space-y-2">
                {nearExpiryMeds.map(item => (
                  <div key={item.id} className="p-2 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                    <p className="font-bold text-slate-350">{item.medicine_name}</p>
                    <p className="text-slate-500 mt-0.5">Exp: {new Date(item.expiry_date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Dispensation Counter Tab */}
      {activeSubTab === 'dispensation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 glass-panel rounded-2xl p-4 flex flex-col h-[500px]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 pb-2 border-b border-slate-800">Pending Prescriptions Queue</h3>
            <div className="flex-1 overflow-y-auto space-y-2">
              {prescriptions.filter(p => p.status === 'pending').map((rx) => (
                <div 
                  key={rx.id} 
                  onClick={() => setSelectedRx(rx)}
                  className={`p-3 border rounded-xl cursor-pointer text-xs transition-all ${
                    selectedRx?.id === rx.id ? 'border-brand-500 bg-brand-500/10' : 'border-slate-850 bg-slate-950/40'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-brand-400">{rx.id}</span>
                    <span className="text-[10px] text-slate-500">{rx.date}</span>
                  </div>
                  <h4 className="font-bold text-slate-200 mt-2">{rx.patient_name}</h4>
                  <p className="text-[10px] text-slate-500">UHID: {rx.patient_mrn} | Doc: {rx.doctor_name}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            {selectedRx ? (
              <div className="glass-panel rounded-2xl p-6 space-y-4 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                  <div>
                    <h3 className="font-bold text-slate-200 uppercase text-xs">Prescription checkout: {selectedRx.id}</h3>
                    <p className="text-[10px] text-slate-500">Patient: {selectedRx.patient_name} | UHID: {selectedRx.patient_mrn}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 font-bold uppercase text-[9px] rounded">Awaiting dispensing</span>
                </div>

                <div className="space-y-3">
                  <span className="font-bold text-slate-400 uppercase text-[10px] block">Prescribed Medicines Check:</span>
                  <div className="divide-y divide-slate-800">
                    {selectedRx.items.map((item, idx) => {
                      const stockMatch = stock.find(s => s.medicine_name.toLowerCase() === item.medicine_name.toLowerCase());
                      const hasStock = stockMatch && stockMatch.stock_qty >= item.qty;
                      return (
                        <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-slate-200">{item.medicine_name}</p>
                            <p className="text-[10px] text-slate-500">{item.instructions}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-350 block">Qty: {item.qty} units</span>
                            {hasStock ? (
                              <span className="text-[9px] bg-green-500/20 text-green-400 font-bold px-1 py-0.5 rounded">In Stock ({stockMatch.stock_qty} avail)</span>
                            ) : (
                              <span className="text-[9px] bg-red-500/20 text-red-400 font-bold px-1 py-0.5 rounded">Low Stock</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => handleDispenseRx(selectedRx.id)}
                    className="px-5 py-2.5 bg-brand-500 text-white font-bold rounded-xl shadow-lg"
                  >
                    Confirm Dispensation Voucher
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-panel rounded-2xl p-8 text-center text-xs text-slate-500">
                <ShoppingBag className="w-12 h-12 mx-auto text-slate-700 mb-2 animate-pulse" />
                <p>Choose an active prescription checkout ticket from the queue list to dispensate drugs.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Restock Voucher Intake Tab */}
      {activeSubTab === 'add_stock' && (
        <div className="glass-panel rounded-2xl p-6 max-w-2xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">Stock Restock Intake Voucher</h2>
          <form onSubmit={handleAddStock} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Supplier Distributor Name</label>
                <select value={stockForm.supplier_name} onChange={(e) => setStockForm({ ...stockForm, supplier_name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200">
                  {suppliers.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Supplier Invoice Ref ID</label>
                <input type="text" value={stockForm.supplier_invoice_no} onChange={(e) => setStockForm({ ...stockForm, supplier_invoice_no: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Medicine Formulation Name *</label>
                <input type="text" required value={stockForm.medicine_name} onChange={(e) => setStockForm({ ...stockForm, medicine_name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Batch Code ID *</label>
                <input type="text" required value={stockForm.batch_number} onChange={(e) => setStockForm({ ...stockForm, batch_number: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Expiration Date *</label>
                <input type="date" required value={stockForm.expiry_date} onChange={(e) => setStockForm({ ...stockForm, expiry_date: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Quantity *</label>
                <input type="number" required value={stockForm.stock_qty} onChange={(e) => setStockForm({ ...stockForm, stock_qty: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Purchase Rate (₹)</label>
                <input type="number" step="0.01" value={stockForm.purchase_rate} onChange={(e) => setStockForm({ ...stockForm, purchase_rate: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Sale Rate (₹)</label>
                <input type="number" step="0.01" value={stockForm.sale_rate} onChange={(e) => setStockForm({ ...stockForm, sale_rate: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" />
              </div>
            </div>
            <button type="submit" className="px-4 py-2 bg-brand-500 text-white font-bold rounded-lg mt-2">Log stock entry</button>
          </form>
        </div>
      )}

      {/* 4. Supplier Registries Tab */}
      {activeSubTab === 'suppliers' && (
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 pb-2 border-b border-slate-800">Supplier Ledger Profiles</h2>
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="py-2 px-3">Supplier Name</th>
                  <th className="py-2 px-3">Phone Line</th>
                  <th className="py-2 px-3">Office Location</th>
                  <th className="py-2 px-3 text-right">Invoices logged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                {suppliers.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/10">
                    <td className="py-3 px-3 font-semibold text-slate-200">{s.name}</td>
                    <td className="py-3 px-3 font-mono">{s.phone}</td>
                    <td className="py-3 px-3">{s.address}</td>
                    <td className="py-3 px-3 text-right font-bold text-brand-400">{s.active_invoices} Invoices</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2.5 Dispensation History Tab */}
      {activeSubTab === 'dispense_history' && (
        <div className="glass-panel rounded-2xl p-6 flex flex-col h-[calc(100vh-12rem)]">
          <div className="pb-3 border-b border-slate-800 mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Dispensation History Records</h2>
          </div>
          <div className="flex-1 overflow-y-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-semibold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Rx Code</th>
                  <th className="py-2.5 px-3">Patient Name (UHID)</th>
                  <th className="py-2.5 px-3">Prescribing Doctor</th>
                  <th className="py-2.5 px-3">Dispensation Date</th>
                  <th className="py-2.5 px-3">Dispensed Items</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-350">
                {dispensedList.map((rx) => (
                  <tr key={rx.id} className="hover:bg-slate-900/10 transition-colors">
                    <td className="py-3 px-3 font-semibold text-brand-400 font-mono">{rx.id}</td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-200">{rx.patient_name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{rx.patient_mrn}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{rx.doctor_name}</td>
                    <td className="py-3 px-3">{new Date(rx.dispensed_at).toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        {rx.items.map((item, idx) => (
                          <p key={idx} className="text-slate-400">
                            • {item.medicine_name} <span className="text-slate-500 font-semibold">({item.qty} Qty)</span>
                          </p>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expiry Batch Alerts Tab */}
      {activeSubTab === 'alerts' && (
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 pb-2 border-b border-slate-800">Expiry Batch Alerts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="glass-panel rounded-2xl p-4">
              <h3 className="font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                <Archive className="w-4 h-4" />
                <span>Critical Low Stock ({lowStockMeds.length})</span>
              </h3>
              <div className="space-y-2">
                {lowStockMeds.map(item => (
                  <div key={item.id} className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-300">{item.medicine_name}</p>
                      <p className="text-slate-500">Batch: {item.batch_number}</p>
                    </div>
                    <p className="text-red-400 font-bold">Remaining: {item.stock_qty} units</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="glass-panel rounded-2xl p-4">
              <h3 className="font-bold text-yellow-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>Batch Expiry Alerts ({nearExpiryMeds.length})</span>
              </h3>
              <div className="space-y-2">
                {nearExpiryMeds.map(item => (
                  <div key={item.id} className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-350">{item.medicine_name}</p>
                      <p className="text-slate-500">Batch: {item.batch_number}</p>
                    </div>
                    <p className="text-yellow-400 font-bold">Exp: {new Date(item.expiry_date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {isAddStockModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl relative text-xs text-slate-300 animate-fade-in">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-slate-200 uppercase text-xs">Add New Stock Item</h3>
              <button onClick={() => setIsAddStockModalOpen(false)} className="p-1 hover:bg-slate-850 rounded text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={(e) => {
              handleAddStock(e);
              setIsAddStockModalOpen(false);
            }} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Supplier Distributor Name</label>
                  <select value={stockForm.supplier_name} onChange={(e) => setStockForm({ ...stockForm, supplier_name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none">
                    {suppliers.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Supplier Invoice Ref ID</label>
                  <input type="text" value={stockForm.supplier_invoice_no} onChange={(e) => setStockForm({ ...stockForm, supplier_invoice_no: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Medicine Formulation Name *</label>
                  <input type="text" required value={stockForm.medicine_name} onChange={(e) => setStockForm({ ...stockForm, medicine_name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Batch Code ID *</label>
                  <input type="text" required value={stockForm.batch_number} onChange={(e) => setStockForm({ ...stockForm, batch_number: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Expiration Date *</label>
                  <input type="date" required value={stockForm.expiry_date} onChange={(e) => setStockForm({ ...stockForm, expiry_date: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Quantity *</label>
                  <input type="number" required value={stockForm.stock_qty} onChange={(e) => setStockForm({ ...stockForm, stock_qty: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Purchase Rate (₹)</label>
                  <input type="number" step="0.01" value={stockForm.purchase_rate} onChange={(e) => setStockForm({ ...stockForm, purchase_rate: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Retail Rate (₹) *</label>
                  <input type="number" step="0.01" required value={stockForm.sale_rate} onChange={(e) => setStockForm({ ...stockForm, sale_rate: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg shadow-lg">
                  Submit Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PharmacistDashboard;
