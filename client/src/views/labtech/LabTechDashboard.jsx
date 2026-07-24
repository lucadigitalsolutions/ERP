import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRole } from '../../context/RoleContext';
import { 
  FlaskConical, Beaker, FileText, Upload, CheckCircle, 
  Clock, Printer, Cpu, QrCode, AlertTriangle, ShieldCheck, CheckSquare
} from 'lucide-react';

const LabTechDashboard = () => {
  const { addNotification, activeSubTab, setActiveSubTab } = useRole();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Results inputs
  const [reportNotes, setReportNotes] = useState('');
  const [reportFileUrl, setReportFileUrl] = useState('https://careflow.s3.amazonaws.com/reports/LAB-CBC-9902.pdf');
  const [updating, setUpdating] = useState(false);

  // LIS Machine Integration state
  const [lisMachineStatus, setLisMachineStatus] = useState('disconnected'); // disconnected, connected, reading
  const [lisAnalyzerName, setLisAnalyzerName] = useState('Sysmex XN-1000 Hematology');

  // Specimen profile
  const [specimenType, setSpecimenType] = useState('Whole Blood (EDTA)');
  const [specimenVolume, setSpecimenVolume] = useState('3.0 mL');
  const [specimenCondition, setSpecimenCondition] = useState('Adequate'); // Adequate, Hemolyzed, Lipemic

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/lab/orders');
      setOrders(res.data);
    } catch (err) {
      console.warn('Backend offline, loading mock diagnostics orders...');
      setOrders([
        { id: 1, consultation_id: 10, patient_id: 1, ordered_by_doctor_id: 1, order_type: 'lab_test', test_names: 'Complete Blood Count (CBC), Lipid Profile', status: 'ordered', technician_id: null, report_file_url: null, report_notes: null, patient_name: 'Rahul Verma', patient_mrn: 'MRN-2026-0001', doctor_name: 'Dr. Aravind Sharma', created_at: new Date() }
      ]);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/lab/orders/${orderId}/report`, { status: newStatus });
      addNotification(`Lab order status updated to: ${newStatus.replace('_', ' ')}`, 'info');
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      addNotification(`Lab order updated (Offline Session)`, 'info');
    }
  };

  // Simulate LIS automated readings injection
  const handleQueryLISAnalyzer = () => {
    setLisMachineStatus('reading');
    addNotification(`Connecting LIS Port to ${lisAnalyzerName}...`, 'info');
    
    setTimeout(() => {
      setLisMachineStatus('connected');
      setReportNotes(
        `Hemoglobin: 14.8 g/dL (Normal: 13.0-17.0)\n` +
        `WBC Count: 7,200 /cu.mm (Normal: 4000-11000)\n` +
        `Platelets: 2,45,000 /cu.mm (Normal: 150000-45000)\n` +
        `Total Cholesterol: 185 mg/dL (Normal: < 200)\n` +
        `Triglycerides: 140 mg/dL (Normal: < 150)\n` +
        `LIS Automated Sync complete. Signature verified.`
      );
      addNotification('Automated findings read from Sysmex Analyzer.', 'success');
    }, 1500);
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportNotes) {
      alert('Please fill out report findings.');
      return;
    }
    setUpdating(true);

    try {
      await axios.put(`http://localhost:5000/api/lab/orders/${selectedOrder.id}/report`, {
        status: 'completed',
        report_notes: `Specimen: ${specimenType} (${specimenCondition}). Findings:\n${reportNotes}`,
        report_file_url: reportFileUrl
      });
      addNotification(`Diagnostic report uploaded successfully.`, 'success');
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: 'completed', report_notes: reportNotes, report_file_url: reportFileUrl } : o));
      addNotification(`Diagnostic report saved (Offline Session)`, 'success');
      setSelectedOrder(null);
    } finally {
      setUpdating(false);
    }
  };

  const handlePrintBarcode = () => {
    addNotification(`Barcode label printed for Tube ID #T${selectedOrder.id}902`, 'success');
  };

  if (activeSubTab === 'lab_history') {
    return (
      <div className="glass-panel rounded-2xl p-6 flex flex-col h-[calc(100vh-7rem)]">
        <div className="pb-3 border-b border-slate-800 mb-4 flex justify-between items-center">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Diagnostics History Records</h2>
        </div>
        <div className="flex-1 overflow-y-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">Patient Details</th>
                <th className="py-2.5 px-3">Ordered By</th>
                <th className="py-2.5 px-3">Test Names</th>
                <th className="py-2.5 px-3">Findings</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-350">
              {orders
                .filter(o => o.status === 'completed')
                .map((order) => (
                  <tr key={order.id} className="hover:bg-slate-900/10 transition-colors">
                    <td className="py-3 px-3 font-semibold text-brand-400 font-mono">#ORD-{order.id}</td>
                    <td className="py-3 px-3 font-bold text-slate-200">
                      {order.patient_name} <span className="text-[10px] text-slate-500 block font-mono">{order.patient_mrn}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{order.doctor_name || 'System Doc'}</td>
                    <td className="py-3 px-3 font-semibold text-slate-400">{order.test_names}</td>
                    <td className="py-3 px-3 whitespace-pre-line text-[10px] text-slate-400 max-w-xs truncate">{order.report_notes || 'No notes uploaded.'}</td>
                    <td className="py-3 px-3 text-right">
                      <button 
                        onClick={() => addNotification(`Printing diagnostic report for Order #${order.id}...`, 'success')} 
                        className="px-2.5 py-1 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 text-brand-400 font-bold rounded-lg text-[10px]"
                      >
                        Print Report
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (activeSubTab === 'specimens') {
    return (
      <div className="glass-panel rounded-2xl p-6 flex flex-col h-[calc(100vh-7rem)]">
        <div className="pb-3 border-b border-slate-800 mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Specimen Intake Logs</h2>
        </div>
        <div className="flex-1 overflow-y-auto text-xs text-slate-300 space-y-4">
          <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2">
            <h3 className="font-bold text-slate-200">Active LIS Analyzer Integration</h3>
            <p className="text-slate-400">Current Analyzer: <span className="text-brand-400 font-bold">{lisAnalyzerName}</span></p>
            <p className="text-slate-400">Machine Status: 
              <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                lisMachineStatus === 'connected' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
              }`}>{lisMachineStatus}</span>
            </p>
          </div>
          <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2">
            <h3 className="font-bold text-slate-200">Specimen Quality Checklist</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-500 block">Default Specimen:</span>
                <span className="font-semibold">{specimenType}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Typical Volume:</span>
                <span className="font-semibold">{specimenVolume}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-7rem)]">
      
      {/* Pending diagnostics orders */}
      <div className="lg:col-span-4 glass-panel rounded-2xl p-4 flex flex-col h-full overflow-hidden">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-800 mb-3">
          <FlaskConical className="text-brand-400 w-4 h-4" />
          <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-300">Lab Orders Queue ({orders.filter(o => o.status !== 'completed').length})</h2>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {orders.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No diagnostics requested</p>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.id}
                onClick={() => setSelectedOrder(ord)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                  selectedOrder?.id === ord.id 
                    ? 'border-brand-500 bg-brand-500/10'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {new Date(ord.created_at).toLocaleDateString()}
                  </span>
                  <span className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded ${
                    ord.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    ord.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {ord.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-200 mt-2">{ord.patient_name}</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">MRN: {ord.patient_mrn} | Doctor: {ord.doctor_name}</p>
                <p className="text-[10px] text-brand-400 mt-2 font-medium truncate">{ord.test_names}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Diagnostics details/upload panel */}
      <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
        {selectedOrder ? (
          <div className="glass-panel rounded-2xl p-6 flex flex-col h-full overflow-hidden">
            <div className="pb-3 border-b border-slate-800 mb-4 flex justify-between items-start">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Order ID: #{selectedOrder.id}</h2>
                <p className="text-[10px] text-slate-500">Patient: {selectedOrder.patient_name} | MRN: {selectedOrder.patient_mrn}</p>
              </div>
              <div className="flex items-center space-x-2">
                {selectedOrder.status === 'ordered' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'sample_collected')}
                    className="px-2.5 py-1 bg-brand-500 text-white font-semibold text-[10px] uppercase rounded-lg hover:bg-brand-600"
                  >
                    Mark Sample Collected
                  </button>
                )}
                {selectedOrder.status === 'sample_collected' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'processing')}
                    className="px-2.5 py-1 bg-blue-500 text-white font-semibold text-[10px] uppercase rounded-lg hover:bg-blue-600"
                  >
                    Begin Analysis Processing
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              
              {/* Specimen Details & Barcode block */}
              {selectedOrder.status !== 'ordered' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Tube details form */}
                  <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-3 text-xs">
                    <h3 className="font-bold text-slate-350 uppercase tracking-wider">Specimen Tube Configuration</h3>
                    <div>
                      <label className="block text-[9px] text-slate-500 uppercase mb-1">Container Specimen Type</label>
                      <select 
                        value={specimenType} 
                        onChange={(e) => setSpecimenType(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-300"
                      >
                        <option value="Whole Blood (EDTA)">Whole Blood (Lavender EDTA Tube)</option>
                        <option value="Serum separator (Gel Tube)">Serum separator (Gold Gel Tube)</option>
                        <option value="Sodium Fluoride (Glucose Tube)">Sodium Fluoride (Gray Sugar Tube)</option>
                        <option value="Urine Container">Random Sterile Urine Cup</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] text-slate-500 uppercase mb-1">Volume ml</label>
                        <input type="text" value={specimenVolume} onChange={(e) => setSpecimenVolume(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded p-1" />
                      </div>
                      <div>
                        <label className="block text-[9px] text-slate-500 uppercase mb-1">Condition</label>
                        <select value={specimenCondition} onChange={(e) => setSpecimenCondition(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded p-1">
                          <option value="Adequate">Adequate</option>
                          <option value="Hemolyzed">Hemolyzed</option>
                          <option value="Inadequate">Inadequate Volume</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Visual Barcode print label */}
                  <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl flex items-center justify-between text-[11px] text-slate-400">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-300 block uppercase">Specimen Label ID</span>
                      <p className="text-[10px]">MRN: <strong className="text-slate-200">{selectedOrder.patient_mrn}</strong></p>
                      <p className="text-[10px]">Name: <strong className="text-slate-200">{selectedOrder.patient_name}</strong></p>
                      <p className="text-[10px] truncate max-w-[150px]">Tests: {selectedOrder.test_names}</p>
                      <button 
                        onClick={handlePrintBarcode}
                        className="flex items-center space-x-1 mt-2.5 px-2 py-1 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded"
                      >
                        <Printer className="w-3 h-3 text-brand-400" />
                        <span>Print Barcode Sticker</span>
                      </button>
                    </div>
                    <div className="text-center space-y-1">
                      <QrCode className="w-14 h-14 text-slate-300 mx-auto" />
                      <span className="font-mono text-[8px] tracking-widest block text-slate-500">*T{selectedOrder.id}902*</span>
                    </div>
                  </div>

                </div>
              )}

              {/* LIS Analyzer Machine trigger */}
              {selectedOrder.status === 'processing' && (
                <div className="bg-slate-950 p-4 border border-brand-500/10 rounded-xl flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-3">
                    <Cpu className={`w-8 h-8 ${lisMachineStatus === 'reading' ? 'text-yellow-400 animate-spin' : 'text-brand-400'}`} />
                    <div>
                      <span className="font-bold text-slate-200 block">LIS Instrument automated Integration</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">Analyzer: {lisAnalyzerName} | Port: COM3 (Active)</p>
                    </div>
                  </div>
                  <button
                    onClick={handleQueryLISAnalyzer}
                    className="px-3.5 py-1.5 bg-brand-500 text-white font-bold rounded-lg"
                  >
                    {lisMachineStatus === 'reading' ? 'Fetching Readings...' : 'Fetch LIS Readings'}
                  </button>
                </div>
              )}

              {/* Findings form */}
              {selectedOrder.status !== 'completed' ? (
                <form onSubmit={handleSubmitReport} className="space-y-4 pt-2 text-xs">
                  <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/20">
                    <h3 className="font-semibold text-slate-300 mb-3 flex items-center space-x-1.5">
                      <Upload className="w-4 h-4 text-brand-400" />
                      <span>Observation Findings & Notes</span>
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Enter Report Parameters *</label>
                        <textarea
                          required
                          rows={6}
                          value={reportNotes}
                          onChange={(e) => setReportNotes(e.target.value)}
                          placeholder="Parameters..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-200 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Report PDF Attachment</label>
                        <input
                          type="text"
                          required
                          value={reportFileUrl}
                          onChange={(e) => setReportFileUrl(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={updating}
                      className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl shadow-lg"
                    >
                      {updating ? 'Publishing...' : 'Publish Test Report'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-green-500/5 border border-green-500/20 p-4 rounded-xl space-y-3 text-xs">
                  <div className="flex items-center space-x-2 text-green-400 font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    <span>Report Completed & E-Signed</span>
                  </div>
                  <pre className="text-slate-300 font-mono bg-slate-950 p-3 rounded-lg border border-slate-850 max-h-48 overflow-y-auto whitespace-pre-wrap">{selectedOrder.report_notes}</pre>
                  <p className="text-[11px] text-slate-300">
                    <strong className="text-slate-400">Report Document: </strong>
                    <a href={selectedOrder.report_file_url} target="_blank" rel="noreferrer" className="text-brand-400 underline hover:text-brand-300">
                      View PDF Document Attachment
                    </a>
                  </p>
                </div>
              )}

            </div>
          </div>
        ) : (
          <div className="flex-1 glass-panel rounded-2xl flex flex-col justify-center items-center text-center p-8">
            <Beaker className="text-slate-600 w-16 h-16 mb-4 animate-pulse" />
            <h2 className="text-lg font-bold text-slate-300">Diagnostics Control Desk</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">Select an active laboratory or radiology order request from the side queue list to process samples and upload analysis documents.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default LabTechDashboard;
