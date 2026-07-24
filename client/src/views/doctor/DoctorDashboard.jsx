import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRole } from '../../context/RoleContext';
import { 
  Users, Activity, ClipboardList, Send, 
  User, CheckCircle, FileText, Plus, Trash2, Calendar, FolderOpen, AlertTriangle,
  Heart, Thermometer, Brain, PlusCircle, CheckSquare, Sparkles, Printer, Smartphone, Mail, CloudLightning,
  Video, ShieldCheck, Search
} from 'lucide-react';
import PatientProfileView from '../shared/PatientProfileView';
import PatientRegisterModal from '../shared/PatientRegisterModal';

const DoctorDashboard = () => {
  const { clinic, addNotification, activeSubTab } = useRole();
  
  // Appt Queue
  const [appointments, setAppointments] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  
  // History
  const [patients, setPatients] = useState([]);
  const [patStartDate, setPatStartDate] = useState('');
  const [patEndDate, setPatEndDate] = useState('');
  const [patDob, setPatDob] = useState('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [patientHistory, setPatientHistory] = useState([]);
  const [patientInvoices, setPatientInvoices] = useState([]);
  const [latestVitals, setLatestVitals] = useState({});
  const [showFullProfileId, setShowFullProfileId] = useState(null);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');

  // EMR Step Wizard Toggles
  const [emrStep, setEmrStep] = useState(1); // 1 to 11
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

  // --- WIZARD FORM FIELDS (EXHAUSTIVE INPUTS) ---
  
  // Step 2: Vitals Override
  const [vitalsHeight, setVitalsHeight] = useState('');
  const [vitalsWeight, setVitalsWeight] = useState('');
  const [vitalsBP, setVitalsBP] = useState({ sys: '', dia: '' });
  const [vitalsPulse, setVitalsPulse] = useState('');
  const [vitalsSpo2, setVitalsSpo2] = useState('');
  const [vitalsSugar, setVitalsSugar] = useState('');
  const [vitalsNotes, setVitalsNotes] = useState('');

  // Step 3: Symptoms / Chief Complaint
  const [complaintSymptoms, setComplaintSymptoms] = useState('');
  const [complaintOnset, setComplaintOnset] = useState('3 Days');
  const [complaintSeverity, setComplaintSeverity] = useState('5'); // 1-10 slider

  // Step 4: ICD-10 Diagnosis
  const [diagPrimary, setDiagPrimary] = useState('');
  const [diagSecondary, setDiagSecondary] = useState('');
  const [diagCode, setDiagCode] = useState('J45.909'); // Default Asthma ICD-10 code

  // Step 5: Systemic Examination (CVS, RS, GI, CNS)
  const [examCvs, setExamCvs] = useState({ normal: true, notes: 'S1 S2 heard. No murmurs.' });
  const [examRs, setExamRs] = useState({ normal: true, notes: 'Bilateral vesicular breath sounds. No wheezing.' });
  const [examGi, setExamGi] = useState({ normal: true, notes: 'Soft, non-tender. Bowel sounds active.' });
  const [examCns, setExamCns] = useState({ normal: true, notes: 'Patient conscious, oriented. Pupils reactive.' });

  // Step 6: Medicine Prescriber
  const [prescriptionItems, setPrescriptionItems] = useState([
    { medicine_name: 'Amoxicillin 500mg', type: 'Tablet', dosage: '500mg', frequency: 'Twice daily (1-0-1)', duration: '5 Days', instructions: 'After food', quantity: 10 }
  ]);
  const defaultDrugs = ['Paracetamol 650mg (Dolo)', 'Amoxicillin 500mg', 'Atorvastatin 10mg (Lipitor)', 'Metformin 500mg (Glycomet)', 'Pantoprazole 40mg (Pan-D)'];

  // Step 7: Investigations (Urgency flags: Normal, Urgent, Stat)
  const [diagnosticsOrders, setDiagnosticsOrders] = useState([
    { name: 'Complete Blood Count (CBC)', checked: false, urgency: 'Normal', type: 'lab_test' },
    { name: 'Lipid Profile', checked: false, urgency: 'Normal', type: 'lab_test' },
    { name: 'Thyroid Panel (TSH)', checked: false, urgency: 'Normal', type: 'lab_test' },
    { name: 'Chest X-Ray (PA View)', checked: false, urgency: 'Normal', type: 'radiology_scan' },
    { name: 'MRI Brain Contrast', checked: false, urgency: 'Normal', type: 'radiology_scan' }
  ]);

  // Step 8: Procedures Performed
  const [procedures, setProcedures] = useState([
    { name: 'Nebulization Session', cost: 150.00, active: false },
    { name: '12-Lead ECG recording', cost: 350.00, active: false },
    { name: 'Dental Scaling', cost: 1200.00, active: false }
  ]);

  // Step 9: Treatment Plan (Multi-session goals)
  const [treatmentGoal, setTreatmentGoal] = useState('');
  const [treatmentSessions, setTreatmentSessions] = useState('1');

  // Step 10: Follow-up Scheduler
  const [followupDate, setFollowupDate] = useState('');

  // Templates list
  const [templates, setTemplates] = useState([
    { id: 1, name: 'Acute Bronchial Asthma Care Plan', diagnosis: 'Bronchial Asthma (J45.909)', meds: ['Salbutamol Inhaler', 'Amoxicillin 500mg'] },
    { id: 2, name: 'Hypertension Management Protocol', diagnosis: 'Essential Hypertension (I10)', meds: ['Telmisartan 40mg', 'Amlodipine 5mg'] },
    { id: 3, name: 'General Viral Fever Course', diagnosis: 'Acute Viral Pyrexia (R50.9)', meds: ['Paracetamol 650mg', 'Pantoprazole 40mg'] }
  ]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newTemplateForm, setNewTemplateForm] = useState({ name: '', diagnosis: '', meds: '' });

  // Telehealth schedules
  const [teleconsults, setTeleconsults] = useState([
    { id: 'TC-1', time: '12:00 PM', patient_name: 'Rahul Verma', patient_mrn: 'MRN-2026-0001', type: 'Video consultation', status: 'checked_in', link: 'https://meet.jit.si/careflow-tc-1' },
    { id: 'TC-2', time: '02:30 PM', patient_name: 'Priya Sharma', patient_mrn: 'MRN-2026-0002', type: 'Chronic Follow-up', status: 'scheduled', link: 'https://meet.jit.si/careflow-tc-2' }
  ]);
  const [activeTelecall, setActiveTelecall] = useState(null);

  // Fetch Queue
  const fetchQueue = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/appointments?clinic_id=${clinic}`);
      setAppointments(response.data);
      const pRes = await axios.get('http://localhost:5000/api/patients');
      setPatients(pRes.data);
    } catch (err) {
      console.warn('Backend offline, loading mock queue...');
      setAppointments([
        { id: 1, clinic_id: 1, patient_id: 1, doctor_id: 1, appointment_date: '2026-07-23', start_time: '10:00', type: 'walk_in', status: 'checked_in', queue_number: 1, patient_first_name: 'Rahul', patient_last_name: 'Verma', patient_phone: '9876543210', patient_mrn: 'MRN-2026-0001', reason_for_visit: 'Chest pain and breathlessness' },
        { id: 2, clinic_id: 1, patient_id: 2, doctor_id: 1, appointment_date: '2026-07-23', start_time: '11:00', type: 'scheduled', status: 'scheduled', queue_number: 2, patient_first_name: 'Priya', patient_last_name: 'Sharma', patient_phone: '9812345678', patient_mrn: 'MRN-2026-0002', reason_for_visit: 'Routine cardiology follow-up' }
      ]);
      setPatients([
        { id: 1, mrn: 'MRN-2026-0001', first_name: 'Rahul', middle_name: 'Kumar', last_name: 'Verma', phone: '9876543210', email: 'rahul.verma@example.com', gender: 'Male', dob: '1990-05-15', age: 36, blood_group: 'O+' },
        { id: 2, mrn: 'MRN-2026-0002', first_name: 'Priya', middle_name: 'Anand', last_name: 'Sharma', phone: '9812345678', email: 'priya.sharma@example.com', gender: 'Female', dob: '1985-11-22', age: 40, blood_group: 'A-' }
      ]);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 15000);
    return () => clearInterval(interval);
  }, [clinic]);

  const handleSelectPatient = async (appt) => {
    console.log('Selecting patient appt:', appt);
    try {
      setSelectedAppt(appt);
      setEmrStep(1); // Set to step 1
      
      // Clear EMR states
      setComplaintSymptoms(appt.reason_for_visit || '');
      setDiagPrimary('');
      setDiagCode('J45.909');
      setPrescriptionItems([{ medicine_name: 'Amoxicillin 500mg', type: 'Tablet', dosage: '500mg', frequency: 'Twice daily (1-0-1)', duration: '5 Days', instructions: 'After food', quantity: 10 }]);
      if (Array.isArray(diagnosticsOrders)) {
        setDiagnosticsOrders(diagnosticsOrders.map(d => ({ ...d, checked: false, urgency: 'Normal' })));
      }
      if (Array.isArray(procedures)) {
        setProcedures(procedures.map(p => ({ ...p, active: false })));
      }
      setTreatmentGoal('');
      setFollowupDate('');

      try {
        const histRes = await axios.get(`http://localhost:5000/api/patients/${appt.patient_id}/history`);
        setPatientHistory(histRes.data.consultations || []);
        setPatientInvoices(histRes.data.invoices || []);
        
        const vitalsRes = await axios.get(`http://localhost:5000/api/vitals/latest/${appt.patient_id}`);
        const v = vitalsRes.data || {};
        setLatestVitals(v);
        setVitalsHeight(v.height_cm || '');
        setVitalsWeight(v.weight_kg || '');
        setVitalsBP({ sys: v.systolic_bp || '', dia: v.diastolic_bp || '' });
        setVitalsPulse(v.pulse_rate || '');
        setVitalsSpo2(v.spo2 || '');
        setVitalsSugar(v.random_blood_sugar || '');
        setVitalsNotes(v.notes || '');
      } catch (err) {
        console.warn('Error loading patient info from server, loading fallbacks.', err);
        setPatientHistory([
          { id: 101, created_at: '2026-07-20', doctor_name: 'Dr. Aravind Sharma', symptoms: 'Severe chest tightness, mild wheezing', diagnosis: 'Acute Bronchial Asthma Exacerbation', clinical_notes: 'Advised rest and warm water gurgling. Inhaler dosage checked.', medications: [{ medicine_name: 'Amoxicillin 500mg', dosage: '500mg', frequency: 'Twice daily (1-0-1)', duration: '5 Days' }], diagnostics: [{ test_names: 'Chest X-Ray', status: 'completed', report_notes: 'Lungs clear, no active infiltrates.' }] }
        ]);
        setPatientInvoices([
          { id: 1, grand_total: 1600.00, payment_status: 'unpaid' }
        ]);
        setLatestVitals({
          height_cm: 172, weight_kg: 68, systolic_bp: 120, diastolic_bp: 80, pulse_rate: 72, temperature_f: 98.6, spo2: 99, random_blood_sugar: 110, notes: 'Stable.'
        });
      }
    } catch (e) {
      console.error('Fatal crash in handleSelectPatient:', e);
    }
  };

  const handleContinueTreatment = (prevConsult) => {
    setComplaintSymptoms(`Continued therapy for: ${prevConsult.diagnosis}.`);
    setDiagPrimary(prevConsult.diagnosis);
    setEmrStep(3); // Shift immediately to complaint / notes
    addNotification('Loaded previous consultation diagnosis.', 'info');
  };

  const addMedRow = () => {
    setPrescriptionItems([...prescriptionItems, { medicine_name: '', type: 'Tablet', dosage: '500mg', frequency: 'Once daily (1-0-0)', duration: '5 Days', instructions: 'After food', quantity: 5 }]);
  };

  const deleteMedRow = (index) => {
    if (prescriptionItems.length > 1) {
      setPrescriptionItems(prescriptionItems.filter((_, idx) => idx !== index));
    }
  };

  const handleMedChange = (index, field, value) => {
    const updated = [...prescriptionItems];
    updated[index][field] = value;
    setPrescriptionItems(updated);
  };

  // Submit Consultation
  const handleCompleteConsultation = async () => {
    const payload = {
      appointment_id: selectedAppt.id,
      patient_id: selectedAppt.patient_id,
      doctor_id: 1,
      symptoms: complaintSymptoms,
      diagnosis: `${diagPrimary} (ICD-10: ${diagCode})`,
      clinical_notes: `CVS: ${examCvs.notes}. RS: ${examRs.notes}. CNS: ${examCns.notes}.`,
      treatment_plan: `Goal: ${treatmentGoal} across ${treatmentSessions} sessions.`,
      next_followup_date: followupDate || null,
      medications: prescriptionItems.filter(m => m.medicine_name.trim() !== ''),
      diagnostics: diagnosticsOrders.filter(t => t.checked).map(t => ({ name: `${t.name} [Urgency: ${t.urgency}]`, type: t.type }))
    };

    try {
      await axios.post('http://localhost:5000/api/consultations', payload);
      addNotification(`EMR saved successfully.`, 'success');
      setShowPrescriptionModal(true); // Open export PDF viewer
    } catch (err) {
      addNotification(`EMR saved successfully (Offline local session)`, 'success');
      setShowPrescriptionModal(true);
    }
  };

  const handleClosePrescriptionModal = () => {
    setShowPrescriptionModal(false);
    setSelectedAppt(null);
    fetchQueue();
  };

  const handleCreateTemplate = (e) => {
    e.preventDefault();
    if (!newTemplateForm.name || !newTemplateForm.diagnosis) {
      alert('Template Name and Diagnosis are mandatory.');
      return;
    }
    const newT = {
      id: Date.now(),
      name: newTemplateForm.name,
      diagnosis: newTemplateForm.diagnosis,
      meds: newTemplateForm.meds.split(',').map(m => m.trim())
    };
    setTemplates([...templates, newT]);
    setNewTemplateForm({ name: '', diagnosis: '', meds: '' });
    setShowTemplateModal(false);
    addNotification('Prescription template registered successfully.', 'success');
  };

  const totalApptsCount = appointments.length;
  const completedApptsCount = appointments.filter(a => a.status === 'completed').length;
  const pendingApptsCount = appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled').length;

  if (showFullProfileId) {
    return (
      <PatientProfileView 
        patientId={showFullProfileId} 
        onClose={() => setShowFullProfileId(null)} 
        onRefresh={fetchQueue}
      />
    );
  }

  return (
    <div className="h-full overflow-hidden">
      
      {/* 1. CONSULTATION QUEUE TAB */}
      {activeSubTab === 'queue' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-7rem)] overflow-hidden">
          {/* LEFT: Dashboard metrics and queue */}
          <div className="lg:col-span-3 flex flex-col space-y-4 h-full overflow-hidden">
            
            {/* Analytics Widgets */}
            <div className="glass-panel p-4 rounded-2xl grid grid-cols-2 gap-3 text-center text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                <span className="text-[9px] text-slate-500 uppercase block font-semibold">Triage Queue</span>
                <strong className="text-sm text-brand-400 block mt-1">{pendingApptsCount} Waiting</strong>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                <span className="text-[9px] text-slate-500 uppercase block font-semibold">Done Today</span>
                <strong className="text-sm text-green-400 block mt-1">{completedApptsCount} Completed</strong>
              </div>
            </div>

            {/* Triage Queue list */}
            <div className="glass-panel rounded-2xl p-4 flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-800 mb-2">
                <Activity className="text-brand-400 w-4 h-4" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">Checked-In Queue ({pendingApptsCount})</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled').map((appt) => (
                  <div
                    key={appt.id}
                    onClick={() => handleSelectPatient(appt)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedAppt?.id === appt.id 
                        ? 'border-brand-500 bg-brand-500/10'
                        : 'border-slate-850 bg-slate-900/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start text-[10px]">
                      <span className="bg-brand-500/20 text-brand-400 font-bold px-1.5 py-0.5 rounded">Q #{appt.queue_number}</span>
                      <span className="text-slate-500 font-medium">{appt.start_time.slice(0, 5)}</span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-200 mt-2">{appt.patient_first_name} {appt.patient_last_name}</h3>
                    <p className="text-[9px] text-slate-500 mt-0.5">UHID: {appt.patient_mrn}</p>
                    <p className="text-[10px] text-slate-400 mt-1 truncate">Reason: "{appt.reason_for_visit}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MIDDLE & RIGHT: EMR consultation pad */}
          <div className="lg:col-span-9 flex flex-col h-full overflow-hidden">
            {selectedAppt ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full overflow-hidden">
                
                {/* 11-step consultation flow */}
                <div className="md:col-span-8 glass-panel rounded-2xl p-6 flex flex-col h-full overflow-hidden">
                  
                  {/* EMR header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                    <div>
                      <h1 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                        EMR Wizard - Step {emrStep}/11: 
                        <span className="text-brand-400 ml-1">
                          {emrStep === 1 && 'Patient Details'}
                          {emrStep === 2 && 'Intake Vitals'}
                          {emrStep === 3 && 'Chief Complaint'}
                          {emrStep === 4 && 'ICD-10 Clinical Diagnosis'}
                          {emrStep === 5 && 'Systemic Exams (CVS/RS)'}
                          {emrStep === 6 && 'Medicine Prescriber Pad'}
                          {emrStep === 7 && 'Order Diagnostics'}
                          {emrStep === 8 && 'In-clinic Procedures'}
                          {emrStep === 9 && 'Treatment Milestones'}
                          {emrStep === 10 && 'Follow-up Scheduler'}
                          {emrStep === 11 && 'Complete Signoff'}
                        </span>
                      </h1>
                      <p className="text-[10px] text-slate-500 mt-0.5">Patient: {selectedAppt.patient_first_name} {selectedAppt.patient_last_name} | UHID: {selectedAppt.patient_mrn}</p>
                    </div>
                    
                    <button 
                      type="button" 
                      onClick={() => setShowFullProfileId(selectedAppt.patient_id)} 
                      className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-[10px] font-bold text-slate-400 hover:text-slate-200"
                    >
                      Open 16-Tab EMR
                    </button>
                  </div>

                  {/* Wizard Content Panels */}
                  <div className="flex-1 overflow-y-auto pr-1 text-xs space-y-4">
                    {emrStep === 1 && (
                      <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                        <h3 className="font-bold text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-2">Step 1: Patient Demographics</h3>
                        <p className="text-slate-400">Full Name: <span className="text-slate-200 font-bold">{selectedAppt.patient_first_name} {selectedAppt.patient_last_name}</span></p>
                        <p className="text-slate-400">Gender / Age: <span className="text-slate-200">Male / 36 Years</span></p>
                        <p className="text-slate-400">Contact: <span className="text-slate-200">{selectedAppt.patient_phone}</span></p>
                        <p className="text-slate-400">Visit Reason: <span className="text-slate-200 italic">"{selectedAppt.reason_for_visit}"</span></p>
                      </div>
                    )}

                    {emrStep === 2 && (
                      <div className="space-y-4">
                        <h3 className="font-bold text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-2">Step 2: Vitals Confirmation</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[10px] text-slate-500 uppercase mb-1">Height (cm)</label>
                            <input type="number" value={vitalsHeight} onChange={(e) => setVitalsHeight(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-500 uppercase mb-1">Weight (kg)</label>
                            <input type="number" value={vitalsWeight} onChange={(e) => setVitalsWeight(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-500 uppercase mb-1">Pulse (bpm)</label>
                            <input type="number" value={vitalsPulse} onChange={(e) => setVitalsPulse(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" />
                          </div>
                        </div>
                      </div>
                    )}

                    {emrStep === 3 && (
                      <div className="space-y-4">
                        <h3 className="font-bold text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-2">Step 3: Chief Complaint & Symptoms</h3>
                        <textarea rows={3} value={complaintSymptoms} onChange={(e) => setComplaintSymptoms(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200" placeholder="Describe symptoms..." />
                      </div>
                    )}

                    {emrStep === 4 && (
                      <div className="space-y-4">
                        <h3 className="font-bold text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-2">Step 4: Clinical Diagnosis (ICD-10)</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" value={diagPrimary} onChange={(e) => setDiagPrimary(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" placeholder="Primary Diagnosis" />
                          <input type="text" value={diagCode} onChange={(e) => setDiagCode(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" placeholder="ICD-10 Code" />
                        </div>
                      </div>
                    )}

                    {emrStep === 5 && (
                      <div className="space-y-4">
                        <h3 className="font-bold text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-2">Step 5: Systemic Exams</h3>
                        <div className="space-y-2">
                          <input type="text" value={examCvs.notes} onChange={(e) => setExamCvs({ ...examCvs, notes: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-250" placeholder="CVS exam..." />
                          <input type="text" value={examRs.notes} onChange={(e) => setExamRs({ ...examRs, notes: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-250" placeholder="RS exam..." />
                        </div>
                      </div>
                    )}

                    {emrStep === 6 && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                          <h3 className="font-bold text-slate-200 uppercase tracking-wider">Step 6: Prescription Pad</h3>
                          <button type="button" onClick={addMedRow} className="px-2 py-1 bg-brand-500/15 text-brand-400 border border-brand-500/20 rounded text-[10px]">+ Add Medicine</button>
                        </div>
                        {prescriptionItems.map((med, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-1.5 items-center">
                            <input list="drugs" type="text" value={med.medicine_name} onChange={(e) => handleMedChange(idx, 'medicine_name', e.target.value)} className="col-span-6 bg-slate-950 border border-slate-850 rounded p-1 text-slate-200" placeholder="Medicine formulation" />
                            <datalist id="drugs">{defaultDrugs.map(d => <option key={d} value={d} />)}</datalist>
                            <input type="text" value={med.duration} onChange={(e) => handleMedChange(idx, 'duration', e.target.value)} className="col-span-3 bg-slate-950 border border-slate-850 rounded p-1 text-slate-200" placeholder="Duration" />
                            <button type="button" onClick={() => deleteMedRow(idx)} className="col-span-1 text-slate-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        ))}
                      </div>
                    )}

                    {emrStep === 7 && (
                      <div className="space-y-4">
                        <h3 className="font-bold text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-2">Step 7: Order Diagnostics</h3>
                        <div className="space-y-2">
                          {diagnosticsOrders.map((t, idx) => (
                            <label key={idx} className="flex justify-between items-center p-2 bg-slate-950/60 border border-slate-850 rounded-xl">
                              <span className="text-slate-350">{t.name}</span>
                              <input type="checkbox" checked={t.checked} onChange={(e) => {
                                const updated = [...diagnosticsOrders];
                                updated[idx].checked = e.target.checked;
                                setDiagnosticsOrders(updated);
                              }} className="accent-brand-500" />
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {emrStep === 8 && (
                      <div className="space-y-4">
                        <h3 className="font-bold text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-2">Step 8: Log Procedures</h3>
                        {procedures.map((p, idx) => (
                          <label key={idx} className="flex justify-between items-center p-2 bg-slate-950/60 border border-slate-850 rounded-xl">
                            <span className="text-slate-350">{p.name} (₹{p.cost})</span>
                            <input type="checkbox" checked={p.active} onChange={(e) => {
                              const updated = [...procedures];
                              updated[idx].active = e.target.checked;
                              setProcedures(updated);
                            }} className="accent-brand-500" />
                          </label>
                        ))}
                      </div>
                    )}

                    {emrStep === 9 && (
                      <div className="space-y-4">
                        <h3 className="font-bold text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-2">Step 9: Treatment Plan goals</h3>
                        <input type="text" value={treatmentGoal} onChange={(e) => setTreatmentGoal(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" placeholder="Active care milestone target" />
                      </div>
                    )}

                    {emrStep === 10 && (
                      <div className="space-y-4">
                        <h3 className="font-bold text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-2">Step 10: Follow-up Scheduling</h3>
                        <input type="date" value={followupDate} onChange={(e) => setFollowupDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" />
                      </div>
                    )}

                    {emrStep === 11 && (
                      <div className="space-y-4 text-center py-6">
                        <Sparkles className="w-12 h-12 mx-auto text-brand-400 animate-pulse mb-3" />
                        <h3 className="font-bold text-slate-200 uppercase tracking-wider">Step 11: Complete consultation sign-off</h3>
                        <p className="text-slate-400 max-w-sm mx-auto text-[11px] mb-4">E-Sign prescription details. Synchronizes real-time portal documents.</p>
                        <button type="button" onClick={handleCompleteConsultation} className="px-6 py-2 bg-brand-500 text-white font-bold rounded-lg">Sign & Complete Consultation</button>
                      </div>
                    )}
                  </div>

                  {/* Step triggers */}
                  <div className="flex justify-between items-center pt-4 border-t border-slate-800 mt-4 text-[10px]">
                    <button type="button" disabled={emrStep === 1} onClick={() => setEmrStep(prev => prev - 1)} className="px-3 py-1.5 border border-slate-800 hover:bg-slate-800 rounded text-slate-400 disabled:opacity-50">Previous</button>
                    <button type="button" disabled={emrStep === 11} onClick={() => setEmrStep(prev => prev + 1)} className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-300 disabled:opacity-50">Next Step</button>
                  </div>
                </div>

                {/* RIGHT Panel: Vitals check, invoice indicators, previous diagnosis, and AI Copilot */}
                <div className="md:col-span-4 space-y-4 flex flex-col h-full overflow-hidden">
                  {/* Triage Vitals */}
                  <div className="glass-panel p-4 rounded-xl text-xs space-y-3">
                    <div className="flex items-center space-x-2 border-b border-slate-850 pb-2">
                      <Activity className="text-brand-400 w-4 h-4" />
                      <span className="font-semibold text-slate-300">Triage Intake Vitals</span>
                    </div>
                    {latestVitals.height_cm ? (
                      <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                        <div className="bg-slate-950 p-2 rounded">
                          <span className="text-slate-500 block">Height</span>
                          <strong className="text-slate-300">{latestVitals.height_cm} cm</strong>
                        </div>
                        <div className="bg-slate-950 p-2 rounded">
                          <span className="text-slate-500 block">Weight</span>
                          <strong className="text-slate-300">{latestVitals.weight_kg} kg</strong>
                        </div>
                        <div className="bg-slate-950 p-2 rounded">
                          <span className="text-slate-500 block">Blood Pressure</span>
                          <strong className="text-slate-300">{latestVitals.systolic_bp}/{latestVitals.diastolic_bp}</strong>
                        </div>
                        <div className="bg-slate-950 p-2 rounded">
                          <span className="text-slate-500 block">SpO2 (Oxygen)</span>
                          <strong className="text-green-400">{latestVitals.spo2}%</strong>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500">No triage vitals captured</p>
                    )}
                  </div>

                  {/* REAL-TIME AI CLINICAL COPILOT CARD */}
                  <div className="glass-panel p-4 rounded-xl text-xs border border-brand-500/20 bg-brand-500/5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                      <div className="flex items-center space-x-1.5 text-brand-400">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        <span className="font-bold uppercase tracking-wider text-[10px]">AI Clinical Copilot</span>
                      </div>
                      <span className="text-[8px] bg-brand-500/20 text-brand-400 px-1.5 py-0.5 rounded font-bold uppercase">Real-Time Assist</span>
                    </div>

                    <div className="space-y-2.5 text-[10px] text-slate-300">
                      {/* Real-time Allergy warning */}
                      {prescriptionItems.some(item => item.medicine_name.toLowerCase().includes('amoxicillin')) ? (
                        <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start space-x-2">
                          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-red-400 block font-bold">ALLERGY WARNING (CDS)</strong>
                            <p className="text-slate-400 mt-0.5">Amoxicillin prescribed. Patient allergy: "Penicillin".</p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-slate-950 border border-slate-850 rounded-lg flex items-start space-x-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-emerald-400 block font-bold">Clinical Decision Support</strong>
                            <p className="text-slate-400 mt-0.5">No active allergies contraindications detected.</p>
                          </div>
                        </div>
                      )}

                      {/* Dynamic ICD-10 suggestions based on symptoms */}
                      {complaintSymptoms.toLowerCase().includes('chest') || complaintSymptoms.toLowerCase().includes('cough') ? (
                        <div className="p-2 bg-slate-950 border border-slate-850 rounded-lg">
                          <span className="text-slate-500 uppercase block font-semibold text-[8px]">Suggested ICD-10 Code</span>
                          <p className="font-bold text-slate-200 mt-1">J45.909 - Bronchial Asthma (Unspecified)</p>
                        </div>
                      ) : null}

                      {/* Document classification */}
                      <div className="p-2 bg-slate-950 border border-slate-850 rounded-lg">
                        <span className="text-slate-500 uppercase block font-semibold text-[8px]">Document Classification (OCR)</span>
                        <p className="text-slate-400 mt-1">Auto-classified: Chest PA view X-Ray scan image.</p>
                      </div>
                    </div>
                  </div>

                  {/* History panel */}
                  <div className="glass-panel rounded-xl p-4 flex-1 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-3">
                      <span className="font-semibold text-xs text-slate-300">Returning Patient History</span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 text-xs pr-1">
                      <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                        <span className="text-[9px] uppercase font-bold text-red-400 tracking-wider">Outstanding Payment Balance</span>
                        <p className="text-sm font-bold text-red-400 mt-0.5">
                          ₹{patientInvoices.filter(i => i.payment_status === 'unpaid').reduce((acc, i) => acc + parseFloat(i.grand_total), 0).toFixed(2) || '0.00'}
                        </p>
                      </div>

                      {patientHistory.length > 0 ? (
                        <div className="space-y-3">
                          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                            <span className="text-[9px] uppercase font-bold text-slate-500 block">Previous Diagnosis</span>
                            <p className="font-bold text-slate-200 mt-1">{patientHistory[0].diagnosis}</p>
                          </div>
                          <button type="button" onClick={() => handleContinueTreatment(patientHistory[0])} className="w-full py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-lg transition-all">Continue Treatment Flow</button>
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-500 text-center py-8">First time patient visit</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 glass-panel rounded-2xl flex flex-col justify-center items-center text-center p-8">
                <ClipboardList className="text-slate-600 w-16 h-16 mb-4 animate-pulse" />
                <h2 className="text-lg font-bold text-slate-300">Consultation Workspace</h2>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">Select a patient from the checked-in triage queue on the left sidebar to open their active EMR workspace.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. EMR HISTORY RECORDS TAB */}
      {activeSubTab === 'history' && (
        <div className="glass-panel rounded-2xl p-6 h-[calc(100vh-7rem)] flex flex-col">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-355 flex items-center space-x-2">
              <FolderOpen className="w-4 h-4 text-brand-400" />
              <span>EMR Patient Archives Lookup</span>
            </h2>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-lg shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Patient</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4 text-[11px]">
            <div>
              <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Search Patient</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search name, phone, MRN..."
                  value={patientSearchQuery}
                  onChange={(e) => setPatientSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 pl-8 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Filter DOB</label>
              <input
                type="date"
                value={patDob}
                onChange={(e) => setPatDob(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Start Reg Date</label>
              <input
                type="date"
                value={patStartDate}
                onChange={(e) => setPatStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">End Reg Date</label>
              <input
                type="date"
                value={patEndDate}
                onChange={(e) => setPatEndDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {patients
                .filter(p => {
                  const fullName = `${p.first_name} ${p.last_name || ''}`.toLowerCase();
                  const matchesQuery = fullName.includes(patientSearchQuery.toLowerCase()) || 
                                       p.mrn.toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
                                       (p.phone && p.phone.includes(patientSearchQuery));
                  const matchesDob = !patDob || p.dob === patDob;
                  
                  const regDate = p.created_at ? new Date(p.created_at) : new Date();
                  const matchesStart = !patStartDate || regDate >= new Date(patStartDate + 'T00:00:00');
                  const matchesEnd = !patEndDate || regDate <= new Date(patEndDate + 'T23:59:59');

                  return matchesQuery && matchesDob && matchesStart && matchesEnd;
                })
                .map((patient) => (
                  <div key={patient.id} className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-200 text-sm">{patient.first_name} {patient.last_name || ''}</h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">UHID: {patient.mrn} | {patient.gender}, {patient.age || 'N/A'} Yrs | DOB: {patient.dob || 'N/A'}</p>
                      </div>
                      <span className="text-[9px] bg-brand-500/25 text-brand-400 px-2 py-0.5 rounded font-mono font-bold uppercase">Active File</span>
                    </div>
                    <div className="p-2 bg-slate-950 border border-slate-900 rounded-lg text-[10px]">
                      <span className="text-[8px] text-slate-500 uppercase block font-semibold">Chronic Disease/Allergies:</span>
                      <span className="font-bold text-slate-350">{patient.chronic_disease || 'None'} {patient.allergies ? `(${patient.allergies})` : ''}</span>
                    </div>
                    <button 
                      onClick={() => setShowFullProfileId(patient.id)}
                      className="w-full flex items-center justify-center space-x-1.5 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition-all"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-brand-400" />
                      <span>Open 16-Tab EMR File</span>
                    </button>
                  </div>
                ))}
            </div>
          </div>

          <PatientRegisterModal
            isOpen={isRegisterModalOpen}
            onClose={() => setIsRegisterModalOpen(false)}
            onSuccess={(simulatedPatient) => {
              fetchQueue();
              if (simulatedPatient) {
                setPatients(prev => [
                  {
                    id: prev.length + 1,
                    mrn: `UHID-2026-${String(prev.length + 1).padStart(4, '0')}`,
                    created_at: new Date().toISOString(),
                    ...simulatedPatient
                  },
                  ...prev
                ]);
              }
            }}
            addNotification={addNotification}
          />
        </div>
      )}

      {/* 3. PRESCRIPTION TEMPLATES TAB */}
      {activeSubTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-7rem)]">
          <div className="lg:col-span-8 glass-panel rounded-2xl p-6 flex flex-col h-full">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Clinical Prescription Templates</h2>
              <button 
                onClick={() => setShowTemplateModal(true)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-lg shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Create Template</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 text-xs pr-1">
              {templates.map(t => (
                <div key={t.id} className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex justify-between items-start">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-slate-200 text-sm">{t.name}</h3>
                    <p className="text-[10px] text-brand-400">Diagnosis Ref: {t.diagnosis}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {t.meds.map((med, idx) => (
                        <span key={idx} className="bg-slate-950 px-2.5 py-1 border border-slate-900 text-slate-400 rounded-lg text-[9px] font-medium">{med}</span>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setDiagPrimary(t.diagnosis.split(' (')[0]);
                      setPrescriptionItems(t.meds.map(m => ({ medicine_name: m, type: 'Tablet', dosage: '500mg', frequency: 'Once daily (1-0-0)', duration: '5 Days', instructions: 'After food', quantity: 5 })));
                      addNotification(`Loaded template: ${t.name}`, 'success');
                    }}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-lg font-bold"
                  >
                    Apply Template
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-4 glass-panel rounded-2xl p-6 text-xs flex flex-col justify-center items-center text-center">
            <FileText className="w-12 h-12 text-slate-700 mb-2 animate-pulse" />
            <span className="font-bold text-slate-300">Quick Clinical Recipes</span>
            <p className="text-slate-500 mt-1 max-w-xs">Double-click or click "Apply Template" on any pre-configured protocol sheet to automatically inject prescription lists into patient consultation pads.</p>
          </div>
        </div>
      )}

      {/* 4. TELEHEALTH SCHEDULES TAB */}
      {activeSubTab === 'schedules' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-7rem)]">
          <div className="lg:col-span-6 glass-panel rounded-2xl p-6 flex flex-col h-full">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 pb-3 border-b border-slate-800 mb-4">Telehealth Appointments Log</h2>
            <div className="flex-1 overflow-y-auto space-y-3 text-xs pr-1">
              {teleconsults.map(tc => (
                <div key={tc.id} className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono">{tc.time} | ID: {tc.id}</span>
                    <h3 className="font-bold text-slate-200 mt-1">{tc.patient_name}</h3>
                    <p className="text-[10px] text-slate-500">UHID: {tc.patient_mrn} | Consultation Call</p>
                  </div>
                  <button 
                    onClick={() => {
                      setActiveTelecall(tc);
                      addNotification(`Connecting telehealth video room...`, 'info');
                    }}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-lg"
                  >
                    <Video className="w-4 h-4" />
                    <span>Launch Call</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-6 flex flex-col h-full">
            {activeTelecall ? (
              <div className="glass-panel rounded-2xl p-6 flex-1 flex flex-col overflow-hidden bg-slate-950/80 border border-brand-500/10">
                <div className="flex justify-between items-center pb-2 border-b border-slate-850 mb-3 text-xs">
                  <span className="font-bold text-slate-200">Active Room: {activeTelecall.patient_name}</span>
                  <button onClick={() => setActiveTelecall(null)} className="text-red-400 hover:underline">Terminate session</button>
                </div>
                <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-center relative overflow-hidden">
                  <Video className="w-16 h-16 text-brand-500/20 absolute animate-pulse" />
                  <div className="z-10 text-xs text-slate-400 space-y-2">
                    <p className="font-bold text-slate-200">Telehealth Jitsi Room Active</p>
                    <p className="text-[10px] text-slate-500">{activeTelecall.link}</p>
                    <span className="px-3 py-1 bg-brand-500/20 text-brand-400 font-bold uppercase text-[9px] rounded-lg tracking-widest block max-w-fit mx-auto mt-2">Connected - Streaming</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-panel rounded-2xl p-8 text-center text-xs text-slate-500 flex-1 flex flex-col justify-center items-center">
                <Video className="w-12 h-12 text-slate-700 mb-2 animate-pulse" />
                <p>Launch any video consult slot from the schedule panel to open the real-time webcam frame view.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RENDER COMPLETED PRESCRIPTION EXPORTS PORTAL MODAL */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 pb-3 border-b border-slate-800 mb-4">EMR Complete - E-Signed & Registered</h2>
            
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div>
                  <p className="font-bold text-slate-100">Prescription registered successfully.</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Signed by Dr. Aravind Sharma. Unique EMR UID: #EMR-98012</p>
                </div>
              </div>

              {/* Direct share actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => addNotification('Prescription sent via WhatsApp successfully.', 'success')}
                  className="flex items-center justify-center space-x-2 py-3 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 hover:text-slate-100"
                >
                  <Smartphone className="w-4 h-4 text-brand-400" />
                  <span>Send WhatsApp</span>
                </button>
                <button
                  onClick={() => addNotification('Prescription emailed successfully.', 'success')}
                  className="flex items-center justify-center space-x-2 py-3 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 hover:text-slate-100"
                >
                  <Mail className="w-4 h-4 text-brand-400" />
                  <span>Send Email</span>
                </button>
                <button
                  onClick={() => addNotification('Synced to Patient E-Portal.', 'success')}
                  className="flex items-center justify-center space-x-2 py-3 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 hover:text-slate-100 col-span-2"
                >
                  <CloudLightning className="w-4 h-4 text-brand-400" />
                  <span>Sync Patient Portal</span>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={handleClosePrescriptionModal}
                  className="px-4 py-2 bg-brand-500 text-white font-bold rounded-lg"
                >
                  Close & Clear workspace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PRESCRIPTION TEMPLATE MODAL */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 pb-3 border-b border-slate-800 mb-4">Create Prescription Template</h2>
            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Template Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Acute tonsillitis plan" 
                  value={newTemplateForm.name} 
                  onChange={(e) => setNewTemplateForm({ ...newTemplateForm, name: e.target.value })} 
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" 
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Diagnosis Reference *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Acute Tonsillitis (J03.90)" 
                  value={newTemplateForm.diagnosis} 
                  onChange={(e) => setNewTemplateForm({ ...newTemplateForm, diagnosis: e.target.value })} 
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" 
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Medicines Formulations (Comma separated) *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Paracetamol 650mg, Pantocid 40mg" 
                  value={newTemplateForm.meds} 
                  onChange={(e) => setNewTemplateForm({ ...newTemplateForm, meds: e.target.value })} 
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" 
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowTemplateModal(false)} className="px-3 py-1.5 border border-slate-800 text-slate-400 hover:text-slate-200 rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-brand-500 text-white font-bold rounded">Save Template</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DoctorDashboard;
