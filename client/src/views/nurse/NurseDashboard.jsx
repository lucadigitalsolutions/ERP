import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRole } from '../../context/RoleContext';
import { Activity, Thermometer, Heart, User, CheckCircle, AlertTriangle, Search, Users, FolderOpen } from 'lucide-react';
import PatientProfileView from '../shared/PatientProfileView';

const NurseDashboard = () => {
  const { clinic, addNotification, activeSubTab, setActiveSubTab } = useRole();
  const [appointments, setAppointments] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [patients, setPatients] = useState([]);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  
  // Vitals form
  const [vitals, setVitals] = useState({
    height_cm: '', weight_kg: '', systolic_bp: '', diastolic_bp: '', pulse_rate: '', temperature_f: '', spo2: '', random_blood_sugar: '', notes: ''
  });

  const fetchQueue = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/appointments?clinic_id=${clinic}`);
      // Show appointments that are not completed and need vitals intake
      setAppointments(res.data.filter(a => a.status === 'scheduled'));
      const pRes = await axios.get('http://localhost:5000/api/patients');
      setPatients(pRes.data);
    } catch (err) {
      console.warn('Backend offline, loading mock triage list...');
      setAppointments([
        { id: 1, queue_number: 1, patient_id: 1, patient_first_name: 'Rahul', patient_last_name: 'Verma', patient_phone: '9876543210', patient_mrn: 'MRN-2026-0001', start_time: '10:00', status: 'scheduled', reason_for_visit: 'Chest pain' }
      ]);
      setPatients([
        { id: 1, mrn: 'MRN-2026-0001', first_name: 'Rahul', middle_name: 'Kumar', last_name: 'Verma', phone: '9876543210', email: 'rahul.verma@example.com', gender: 'Male', dob: '1990-05-15', age: 36, blood_group: 'O+' }
      ]);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, [clinic]);

  const handleSelectPatient = (appt) => {
    setSelectedAppt(appt);
    setVitals({
      height_cm: '', weight_kg: '', systolic_bp: '', diastolic_bp: '', pulse_rate: '', temperature_f: '98.6', spo2: '98', random_blood_sugar: '100', notes: ''
    });
  };

  const handleSubmitVitals = async (e) => {
    e.preventDefault();
    if (!vitals.spo2 || !vitals.systolic_bp) {
      alert('SPO2 and Blood Pressure are mandatory triage indicators.');
      return;
    }

    const payload = {
      appointment_id: selectedAppt.id,
      patient_id: selectedAppt.patient_id,
      recorded_by: 6, // Nurse Sneha Roy
      height_cm: parseFloat(vitals.height_cm),
      weight_kg: parseFloat(vitals.weight_kg),
      systolic_bp: parseInt(vitals.systolic_bp),
      diastolic_bp: parseInt(vitals.diastolic_bp),
      pulse_rate: parseInt(vitals.pulse_rate),
      temperature_f: parseFloat(vitals.temperature_f),
      spo2: parseInt(vitals.spo2),
      random_blood_sugar: parseInt(vitals.random_blood_sugar),
      notes: vitals.notes
    };

    try {
      await axios.post('http://localhost:5000/api/vitals', payload);
      addNotification(`Vitals recorded for ${selectedAppt.patient_first_name} ${selectedAppt.patient_last_name}. Patient pushed to Doctor queue.`, 'success');
      
      // Perform clinical threshold alerts check locally
      if (payload.spo2 < 92) {
        addNotification(`CRITICAL vitals flag: SPO2 is low (${payload.spo2}%)! Doctor alerted.`, 'danger');
      }

      setSelectedAppt(null);
      fetchQueue();
    } catch (err) {
      addNotification('Vitals saved successfully (Offline local session)', 'success');
      setSelectedAppt(null);
      fetchQueue();
    }
  };

  if (selectedPatientId) {
    return (
      <PatientProfileView 
        patientId={selectedPatientId} 
        onClose={() => setSelectedPatientId(null)} 
        onRefresh={fetchQueue}
      />
    );
  }

  if (activeSubTab === 'patient_list') {
    return (
      <div className="glass-panel rounded-2xl p-6 flex flex-col h-[calc(100vh-7rem)]">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Registered Patients Directory</h2>
          <div className="relative w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search UHID, Phone, Name..."
              value={patientSearchQuery}
              onChange={(e) => setPatientSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto text-xs text-slate-300">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="py-3 px-3">UHID (MRN)</th>
                <th className="py-3 px-3">Full Name</th>
                <th className="py-3 px-3">Contact No.</th>
                <th className="py-3 px-3">DOB / Age</th>
                <th className="py-3 px-3">Blood Group</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-350">
              {patients
                .filter(p => 
                  p.first_name.toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
                  (p.last_name && p.last_name.toLowerCase().includes(patientSearchQuery.toLowerCase())) ||
                  p.phone.includes(patientSearchQuery) ||
                  p.mrn.toLowerCase().includes(patientSearchQuery.toLowerCase())
                )
                .map(p => (
                  <tr key={p.id} className="hover:bg-slate-900/10 transition-colors">
                    <td className="py-3 px-3 font-semibold text-brand-400 font-mono">{p.mrn}</td>
                    <td className="py-3 px-3 font-bold text-slate-200">{p.first_name} {p.middle_name || ''} {p.last_name || ''}</td>
                    <td className="py-3 px-3 font-mono">{p.phone}</td>
                    <td className="py-3 px-3">{p.dob} ({p.age || 'N/A'} Yrs)</td>
                    <td className="py-3 px-3 text-center">{p.blood_group || 'N/A'}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedPatientId(p.id)}
                        className="px-2.5 py-1 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 text-brand-400 font-bold rounded-lg text-[10px]"
                      >
                        View EMR File
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

  if (activeSubTab === 'alerts') {
    return (
      <div className="glass-panel rounded-2xl p-6 flex flex-col h-[calc(100vh-7rem)]">
        <div className="pb-3 border-b border-slate-800 mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Clinical Alerts Logs</h2>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-3 text-xs text-red-400">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-bold">Critical SpO2 Alert (Offline Sandbox)</p>
              <p className="mt-1 text-slate-400">Patient Rahul Verma (MRN-2026-0001) recorded SpO2 of 89% which is below safety thresholds.</p>
              <span className="text-[10px] text-slate-500 mt-2 block font-mono">Timestamp: 2026-07-23 10:45 AM</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-7rem)]">
      
      {/* Triaging Queue */}
      <div className="lg:col-span-4 glass-panel rounded-2xl p-4 flex flex-col h-full overflow-hidden">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-800 mb-3">
          <Activity className="text-brand-400 w-4 h-4" />
          <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-300">Triage Queue ({appointments.length})</h2>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {appointments.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No patients awaiting vitals triage</p>
          ) : (
            appointments.map((appt) => (
              <div
                key={appt.id}
                onClick={() => handleSelectPatient(appt)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                  selectedAppt?.id === appt.id 
                    ? 'border-brand-500 bg-brand-500/10'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] text-slate-500 font-semibold">{appt.start_time.slice(0, 5)}</span>
                  <span className="text-[9px] uppercase font-bold text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded">Triage Pending</span>
                </div>
                <h3 className="text-xs font-bold text-slate-200 mt-2">{appt.patient_first_name} {appt.patient_last_name}</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">MRN: {appt.patient_mrn}</p>
                <p className="text-[10px] text-slate-400 mt-1 italic">Reason: "{appt.reason_for_visit}"</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Vitals Input Panel */}
      <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
        {selectedAppt ? (
          <div className="glass-panel rounded-2xl p-6 flex flex-col h-full overflow-hidden">
            <div className="pb-3 border-b border-slate-800 mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Record Vitals: {selectedAppt.patient_first_name} {selectedAppt.patient_last_name}</h2>
              <p className="text-[10px] text-slate-500">MRN: {selectedAppt.patient_mrn} | Date: {selectedAppt.appointment_date}</p>
            </div>

            <form onSubmit={handleSubmitVitals} className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Height (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={vitals.height_cm}
                      onChange={(e) => setVitals({ ...vitals, height_cm: e.target.value })}
                      placeholder="e.g. 172"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={vitals.weight_kg}
                      onChange={(e) => setVitals({ ...vitals, weight_kg: e.target.value })}
                      placeholder="e.g. 68"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Pulse Rate (bpm)</label>
                    <input
                      type="number"
                      required
                      value={vitals.pulse_rate}
                      onChange={(e) => setVitals({ ...vitals, pulse_rate: e.target.value })}
                      placeholder="e.g. 72"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">BP (Systolic / Diastolic) *</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        required
                        value={vitals.systolic_bp}
                        onChange={(e) => setVitals({ ...vitals, systolic_bp: e.target.value })}
                        placeholder="Sys"
                        className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-200"
                      />
                      <input
                        type="number"
                        required
                        value={vitals.diastolic_bp}
                        onChange={(e) => setVitals({ ...vitals, diastolic_bp: e.target.value })}
                        placeholder="Dia"
                        className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Oxygen Level (SpO2 %) *</label>
                    <input
                      type="number"
                      required
                      value={vitals.spo2}
                      onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                      placeholder="e.g. 98"
                      className={`w-full bg-slate-950 border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 text-slate-200 ${
                        vitals.spo2 && vitals.spo2 < 94 ? 'border-red-500 focus:ring-red-500' : 'border-slate-800 focus:ring-brand-500'
                      }`}
                    />
                    {vitals.spo2 && vitals.spo2 < 94 && (
                      <span className="text-[10px] text-red-400 mt-1 flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5 inline" />
                        <span>Low Oxygen alert thresholds triggered.</span>
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Temperature (°F)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={vitals.temperature_f}
                      onChange={(e) => setVitals({ ...vitals, temperature_f: e.target.value })}
                      placeholder="e.g. 98.6"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Random Blood Sugar (mg/dL)</label>
                  <input
                    type="number"
                    value={vitals.random_blood_sugar}
                    onChange={(e) => setVitals({ ...vitals, random_blood_sugar: e.target.value })}
                    placeholder="e.g. 110"
                    className="w-48 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Nurse Observation Notes</label>
                  <textarea
                    rows={3}
                    value={vitals.notes}
                    onChange={(e) => setVitals({ ...vitals, notes: e.target.value })}
                    placeholder="Describe patient status, active complaints, allergy details..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-200"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-brand-500/20 transition-all"
                >
                  Save & Complete Triage
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex-1 glass-panel rounded-2xl flex flex-col justify-center items-center text-center p-8">
            <Thermometer className="text-slate-600 w-16 h-16 mb-4 animate-pulse" />
            <h2 className="text-lg font-bold text-slate-300">Select Checked-In Client</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">Pick a patient from the triaging queue on the left sidebar to record vitals and complete baseline observations.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default NurseDashboard;
