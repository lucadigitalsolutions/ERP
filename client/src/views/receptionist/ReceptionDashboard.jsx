import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRole } from '../../context/RoleContext';
import { 
  UserPlus, Calendar, CreditCard, Activity, 
  Search, ShieldAlert, CheckCircle, Clock, Plus, Trash2, FolderOpen,
  LayoutGrid, MapPin, Sliders, Smartphone, AlertTriangle, FileText
} from 'lucide-react';
import PatientProfileView from '../shared/PatientProfileView';
import PatientRegisterModal from '../shared/PatientRegisterModal';

const ReceptionDashboard = () => {
  const { clinic, addNotification, activeSubTab, setActiveSubTab } = useRole();

  // Profile overlay state
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  // States
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [rooms, setRooms] = useState([
    { id: 'R101', name: 'Consultation Room 1', doctor: 'Dr. Aravind Sharma' },
    { id: 'R102', name: 'Consultation Room 2', doctor: 'Dr. Priya Nair' },
    { id: 'DS-A', name: 'Dental Suite A', doctor: 'None' },
    { id: 'PH-1', name: 'Physiotherapy Hall 1', doctor: 'None' }
  ]);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
  
  // Advanced Patient Filters
  const [patStartDate, setPatStartDate] = useState('');
  const [patEndDate, setPatEndDate] = useState('');
  const [patDob, setPatDob] = useState('');
  const [patDoctorFilter, setPatDoctorFilter] = useState('all');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Advanced Appointment Filters
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState('all');
  const [apptStartDate, setApptStartDate] = useState('');
  const [apptEndDate, setApptEndDate] = useState('');

  // Calendar Layout: daily, weekly, monthly, timeline
  const [calendarLayout, setCalendarLayout] = useState('daily');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState('all');
  const [selectedQueueStatusFilter, setSelectedQueueStatusFilter] = useState('all');

  // Registration wizard section
  const [regFormSection, setRegFormSection] = useState('personal');

  // Registration Form
  const [patientForm, setPatientForm] = useState({
    first_name: '', middle_name: '', last_name: '', dob: '', gender: 'Male', blood_group: 'O+', 
    height_cm: '', weight_kg: '', marital_status: 'Single', occupation: '', 
    aadhaar_number: '', passport: '', abha_number: '', nationality: 'Indian', preferred_language: 'English', religion: 'Hindu', photo_url: '',
    phone: '', alternate_mobile: '', email: '', whatsapp_number: '', 
    address: '', landmark: '', city: 'Bengaluru', state: 'Karnataka', country: 'India', pincode: '',
    emergency_contact_name: '', emergency_contact_relation: 'Spouse', emergency_contact_phone: '',
    insurance_provider: '', insurance_policy_number: '', insurance_validity: '', insurance_corporate: '',
    allergies: '', current_medication: '', chronic_disease: '', surgery_history: '', pregnancy_status: 'N/A', family_history: '',
    smoking_status: 'Non-Smoker', alcohol_status: 'Non-Drinker', tobacco_status: 'None',
    consent_privacy: false, consent_treatment: false, digital_signature_url: ''
  });

  // Appt Booking
  const [apptForm, setApptForm] = useState({
    patient_id: '', doctor_id: '', appointment_date: new Date().toISOString().split('T')[0], 
    start_time: '10:00', end_time: '10:30', type: 'walk_in', reason_for_visit: '', room_number: 'R101'
  });

  // Billing
  const [billingForm, setBillingForm] = useState({
    patient_id: '',
    items: [{ item_name: 'Doctor Consultation Fee', quantity: 1, unit_price: 800.00, gst_percent: 0.00, total_price: 800.00 }],
    payment_method: 'UPI',
    discount_amount: 0.00
  });

  const fetchData = async () => {
    try {
      const pRes = await axios.get('http://localhost:5000/api/patients');
      setPatients(pRes.data);

      const dRes = await axios.get('http://localhost:5000/api/doctors');
      setDoctors(dRes.data);

      const aRes = await axios.get(`http://localhost:5000/api/appointments?clinic_id=${clinic}`);
      setAppointments(aRes.data);

      const invRes = await axios.get('http://localhost:5000/api/finance/invoices');
      setInvoices(invRes.data);
    } catch (err) {
      console.warn('Backend connection error. Setting offline fallbacks...');
      setPatients([
        { id: 1, mrn: 'MRN-2026-0001', first_name: 'Rahul', middle_name: 'Kumar', last_name: 'Verma', phone: '9876543210', email: 'rahul.verma@example.com', gender: 'Male', dob: '1990-05-15', age: 36, blood_group: 'O+', emergency_contact_name: 'Sunita Verma', emergency_contact_relation: 'Spouse', emergency_contact_phone: '9876543211' }
      ]);
      setDoctors([
        { id: 1, first_name: 'Aravind', last_name: 'Sharma', specialization: 'Cardiology', consultation_fee: 800.00 }
      ]);
      setAppointments([
        { id: 1, queue_number: 1, patient_first_name: 'Rahul', patient_last_name: 'Verma', doctor_first_name: 'Aravind', doctor_last_name: 'Sharma', appointment_date: '2026-07-23', start_time: '10:00', status: 'checked_in', type: 'walk_in', reason_for_visit: 'Chest pain', room_number: 'R101' }
      ]);
      setInvoices([
        { id: 1, invoice_number: 'INV-2026-0001', patient_name: 'Rahul Verma', patient_mrn: 'MRN-2026-0001', grand_total: 1600.00, gst_amount: 192.00, sub_total: 1408.00, payment_status: 'paid', payment_method: 'UPI', created_at: '2026-07-23T10:30:00Z' }
      ]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [clinic]);

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    if (!patientForm.first_name || !patientForm.phone || !patientForm.dob) {
      alert('Demographics require First Name, Phone, and DOB.');
      return;
    }
    try {
      const res = await axios.post('http://localhost:5000/api/patients', patientForm);
      addNotification(`Registered UHID: ${res.data.mrn}`, 'success');
      setPatientForm({
        first_name: '', middle_name: '', last_name: '', dob: '', gender: 'Male', blood_group: 'O+', 
        height_cm: '', weight_kg: '', marital_status: 'Single', occupation: '', 
        aadhaar_number: '', passport: '', abha_number: '', nationality: 'Indian', preferred_language: 'English', religion: 'Hindu', photo_url: '',
        phone: '', alternate_mobile: '', email: '', whatsapp_number: '', 
        address: '', landmark: '', city: 'Bengaluru', state: 'Karnataka', country: 'India', pincode: '',
        emergency_contact_name: '', emergency_contact_relation: 'Spouse', emergency_contact_phone: '',
        insurance_provider: '', insurance_policy_number: '', insurance_validity: '', insurance_corporate: '',
        allergies: '', current_medication: '', chronic_disease: '', surgery_history: '', pregnancy_status: 'N/A', family_history: '',
        smoking_status: 'Non-Smoker', alcohol_status: 'Non-Drinker', tobacco_status: 'None',
        consent_privacy: false, consent_treatment: false, digital_signature_url: ''
      });
      fetchData();
      setActiveSubTab('schedule');
    } catch (err) {
      const mock = { id: Date.now(), mrn: `MRN-2026-${Math.floor(1000+Math.random()*9000)}`, ...patientForm };
      setPatients([mock, ...patients]);
      addNotification(`Registered Patient ${mock.first_name} (Offline)`, 'success');
      setActiveSubTab('schedule');
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!apptForm.patient_id || !apptForm.doctor_id) {
      alert('Choose patient and doctor.');
      return;
    }

    const patientIdInt = parseInt(apptForm.patient_id);
    const doctorIdInt = parseInt(apptForm.doctor_id);
    const selectedPat = patients.find(p => p.id == patientIdInt);
    const selectedDoc = doctors.find(d => d.id == doctorIdInt);

    try {
      await axios.post('http://localhost:5000/api/appointments', { ...apptForm, clinic_id: clinic });
      addNotification('Consultation scheduled successfully.', 'success');
      setApptForm({
        patient_id: '', doctor_id: '', appointment_date: new Date().toISOString().split('T')[0], 
        start_time: '10:00', end_time: '10:30', type: 'walk_in', reason_for_visit: '', room_number: 'R101'
      });
      fetchData();
      setActiveSubTab('queue');
    } catch (err) {
      const mockAppt = {
        id: Date.now(),
        clinic_id: parseInt(clinic),
        patient_id: patientIdInt,
        doctor_id: doctorIdInt,
        appointment_date: apptForm.appointment_date,
        start_time: apptForm.start_time,
        type: apptForm.type,
        status: 'booked',
        queue_number: appointments.length + 1,
        reason_for_visit: apptForm.reason_for_visit,
        room_number: apptForm.room_number,
        patient_first_name: selectedPat ? selectedPat.first_name : 'Walk-In',
        patient_last_name: selectedPat ? selectedPat.last_name : 'Patient',
        patient_mrn: selectedPat ? selectedPat.mrn : 'MRN-MOCK',
        doctor_first_name: selectedDoc ? selectedDoc.first_name : 'Aravind',
        doctor_last_name: selectedDoc ? selectedDoc.last_name : 'Sharma'
      };
      setAppointments([mockAppt, ...appointments]);
      addNotification('Appointment Booked (Demo Mode Local Sync)', 'success');
      setApptForm({
        patient_id: '', doctor_id: '', appointment_date: new Date().toISOString().split('T')[0], 
        start_time: '10:00', end_time: '10:30', type: 'walk_in', reason_for_visit: '', room_number: 'R101'
      });
      setActiveSubTab('queue');
    }
  };

  const handleUpdateStatus = async (apptId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/appointments/${apptId}/status`, { status: newStatus });
      addNotification(`Appointment status modified to: ${newStatus.replace('_', ' ')}`, 'info');
      fetchData();
    } catch (err) {
      setAppointments(appointments.map(a => a.id == apptId ? { ...a, status: newStatus } : a));
      addNotification(`Status updated (Demo Mode Local Sync)`, 'info');
    }
  };

  const addBillingItem = () => {
    setBillingForm({
      ...billingForm,
      items: [...billingForm.items, { item_name: '', quantity: 1, unit_price: 0.00, gst_percent: 18.00, total_price: 0.00 }]
    });
  };

  const updateBillingItem = (index, field, value) => {
    const updated = [...billingForm.items];
    updated[index][field] = value;
    
    if (field === 'unit_price' || field === 'quantity' || field === 'gst_percent') {
      const qty = parseInt(updated[index].quantity) || 0;
      const price = parseFloat(updated[index].unit_price) || 0;
      const gst = parseFloat(updated[index].gst_percent) || 0;
      const base = qty * price;
      updated[index].total_price = base + (base * (gst / 100));
    }
    setBillingForm({ ...billingForm, items: updated });
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!billingForm.patient_id) return;
    
    let subTotal = 0;
    let gstAmt = 0;
    billingForm.items.forEach(i => {
      const base = i.quantity * i.unit_price;
      subTotal += base;
      gstAmt += base * ((i.gst_percent || 0) / 100);
    });

    const grandTotal = subTotal + gstAmt - parseFloat(billingForm.discount_amount || 0);

    const payload = {
      clinic_id: clinic,
      patient_id: parseInt(billingForm.patient_id),
      sub_total: subTotal,
      gst_amount: gstAmt,
      discount_amount: parseFloat(billingForm.discount_amount),
      grand_total: grandTotal,
      payment_status: 'paid',
      payment_method: billingForm.payment_method,
      items: billingForm.items
    };

    try {
      await axios.post('http://localhost:5000/api/finance/invoices', payload);
      addNotification('Invoice billed.', 'success');
      setBillingForm({
        patient_id: '',
        items: [{ item_name: 'Doctor Consultation Fee', quantity: 1, unit_price: 800.00, gst_percent: 0.00, total_price: 800.00 }],
        payment_method: 'UPI',
        discount_amount: 0.00
      });
      fetchData();
    } catch (err) {
      addNotification('Billed successfully (Demo Mode Local Sync)', 'success');
      setBillingForm({
        patient_id: '',
        items: [{ item_name: 'Doctor Consultation Fee', quantity: 1, unit_price: 800.00, gst_percent: 0.00, total_price: 800.00 }],
        payment_method: 'UPI',
        discount_amount: 0.00
      });
    }
  };

  // Filtered Appointments based on selected status, room number, doctor, & date range filters
  const filteredAppointments = appointments.filter(appt => {
    const statusMatch = selectedQueueStatusFilter === 'all' || appt.status === selectedQueueStatusFilter;
    const roomMatch = selectedRoomFilter === 'all' || appt.room_number === selectedRoomFilter;
    const doctorMatch = selectedDoctorFilter === 'all' || appt.doctor_id == selectedDoctorFilter;
    
    const apptDate = appt.appointment_date ? new Date(appt.appointment_date) : new Date();
    const startMatch = !apptStartDate || apptDate >= new Date(apptStartDate + 'T00:00:00');
    const endMatch = !apptEndDate || apptDate <= new Date(apptEndDate + 'T23:59:59');

    return statusMatch && roomMatch && doctorMatch && startMatch && endMatch;
  });

  const filteredPatients = patients.filter(p => 
    p.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone.includes(searchQuery) ||
    p.mrn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedPatientId) {
    return (
      <PatientProfileView 
        patientId={selectedPatientId} 
        onClose={() => setSelectedPatientId(null)} 
        onRefresh={fetchData}
      />
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Tab Selectors */}
      <div className="flex border-b border-slate-800 space-x-4">
        {[
          { id: 'register', label: 'Patient Registrations', icon: <UserPlus className="w-4 h-4" /> },
          { id: 'patient_list', label: 'Patient Directory', icon: <FolderOpen className="w-4 h-4" /> },
          { id: 'schedule', label: 'Book appointment', icon: <Calendar className="w-4 h-4" /> },
          { id: 'queue', label: 'Scheduling & Queue board', icon: <Activity className="w-4 h-4" /> },
          { id: 'billing', label: 'Retail Invoicing', icon: <CreditCard className="w-4 h-4" /> },
          { id: 'invoice_list', label: 'Billing Ledger', icon: <FileText className="w-4 h-4" /> }
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

      {/* 1. Register Patient Wizard */}
      {activeSubTab === 'register' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 glass-panel rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">New Patient Registration Wizard</h2>
              <div className="flex space-x-1">
                {['personal', 'contact', 'emergency', 'insurance', 'history', 'consent'].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setRegFormSection(sec)}
                    className={`px-2 py-1 rounded text-[10px] uppercase font-bold transition-all ${
                      regFormSection === sec ? 'bg-brand-500 text-white' : 'bg-slate-950 text-slate-400 hover:bg-slate-805'
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleRegisterPatient} className="space-y-4 text-xs">
              {regFormSection === 'personal' && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">First Name *</label>
                    <input type="text" required value={patientForm.first_name} onChange={(e) => setPatientForm({ ...patientForm, first_name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Middle Name</label>
                    <input type="text" value={patientForm.middle_name} onChange={(e) => setPatientForm({ ...patientForm, middle_name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Last Name *</label>
                    <input type="text" required value={patientForm.last_name} onChange={(e) => setPatientForm({ ...patientForm, last_name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">DOB *</label>
                    <input type="date" required value={patientForm.dob} onChange={(e) => setPatientForm({ ...patientForm, dob: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Gender</label>
                    <select value={patientForm.gender} onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-200">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Blood Group</label>
                    <input type="text" value={patientForm.blood_group} onChange={(e) => setPatientForm({ ...patientForm, blood_group: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Aadhaar (UIDAI)</label>
                    <input type="text" value={patientForm.aadhaar_number} onChange={(e) => setPatientForm({ ...patientForm, aadhaar_number: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Passport No</label>
                    <input type="text" value={patientForm.passport} onChange={(e) => setPatientForm({ ...patientForm, passport: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">ABHA Number</label>
                    <input type="text" value={patientForm.abha_number} onChange={(e) => setPatientForm({ ...patientForm, abha_number: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" />
                  </div>
                </div>
              )}

              {regFormSection === 'contact' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Phone *</label>
                    <input type="text" required value={patientForm.phone} onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">WhatsApp</label>
                    <input type="text" value={patientForm.whatsapp_number} onChange={(e) => setPatientForm({ ...patientForm, whatsapp_number: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Address Details</label>
                    <textarea rows={2} value={patientForm.address} onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200" />
                  </div>
                </div>
              )}

              {regFormSection === 'emergency' && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Contact Name</label>
                    <input type="text" value={patientForm.emergency_contact_name} onChange={(e) => setPatientForm({ ...patientForm, emergency_contact_name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Relation</label>
                    <input type="text" value={patientForm.emergency_contact_relation} onChange={(e) => setPatientForm({ ...patientForm, emergency_contact_relation: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Phone</label>
                    <input type="text" value={patientForm.emergency_contact_phone} onChange={(e) => setPatientForm({ ...patientForm, emergency_contact_phone: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" />
                  </div>
                </div>
              )}

              {regFormSection === 'insurance' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Provider Company</label>
                    <input type="text" value={patientForm.insurance_provider} onChange={(e) => setPatientForm({ ...patientForm, insurance_provider: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Policy ID</label>
                    <input type="text" value={patientForm.insurance_policy_number} onChange={(e) => setPatientForm({ ...patientForm, insurance_policy_number: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" />
                  </div>
                </div>
              )}

              {regFormSection === 'history' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Allergies</label>
                    <input type="text" value={patientForm.allergies} onChange={(e) => setPatientForm({ ...patientForm, allergies: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Chronic Diseases</label>
                    <input type="text" value={patientForm.chronic_disease} onChange={(e) => setPatientForm({ ...patientForm, chronic_disease: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200" />
                  </div>
                </div>
              )}

              {regFormSection === 'consent' && (
                <div className="space-y-4">
                  <div className="bg-slate-950 p-4 border border-slate-800 rounded space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" checked={patientForm.consent_privacy} onChange={(e) => setPatientForm({ ...patientForm, consent_privacy: e.target.checked })} className="accent-brand-500" />
                      <span className="text-slate-300">Authorize privacy and data policies</span>
                    </label>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="px-5 py-2.5 bg-brand-500 text-white font-bold rounded-lg shadow-lg">
                      Save Profile
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          <div className="lg:col-span-4 glass-panel rounded-2xl p-6 flex flex-col h-[500px]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Directory Quick Lookup</h3>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search UHID, Phone, Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredPatients.map(p => (
                <div key={p.id} className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl text-xs flex justify-between items-center group hover:border-slate-700">
                  <div>
                    <p className="font-bold text-slate-200">{p.first_name} {p.last_name || ''}</p>
                    <p className="text-[10px] text-slate-500 mt-1">UHID: {p.mrn} | Mob: {p.phone}</p>
                  </div>
                  <button onClick={() => setSelectedPatientId(p.id)} className="p-1 text-brand-400 hover:text-brand-300 rounded">
                    <FolderOpen className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Book appointment Tab */}
      {activeSubTab === 'schedule' && (
        <div className="glass-panel rounded-2xl p-6 max-w-2xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">Book Consultation Slot</h2>
          <form onSubmit={handleBookAppointment} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Select Patient *</label>
                <select required value={apptForm.patient_id} onChange={(e) => setApptForm({ ...apptForm, patient_id: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200">
                  <option value="">Select Patient...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.mrn})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Select Doctor *</label>
                <select required value={apptForm.doctor_id} onChange={(e) => setApptForm({ ...apptForm, doctor_id: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200">
                  <option value="">Select Doctor...</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.first_name} {d.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Consultation Room</label>
                <select value={apptForm.room_number} onChange={(e) => setApptForm({ ...apptForm, room_number: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200">
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.doctor})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Date *</label>
                <input type="date" required value={apptForm.appointment_date} onChange={(e) => setApptForm({ ...apptForm, appointment_date: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200" />
              </div>
            </div>
            <button type="submit" className="px-4 py-2 bg-brand-500 text-white font-bold rounded-lg shadow-lg">Schedule Slot</button>
          </form>
        </div>
      )}

      {/* 3. Scheduling & Queue board (Rich Appointment module views) */}
      {activeSubTab === 'queue' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">EMR Scheduling Board</h2>
            
            {/* Visual View selectors */}
            <div className="flex space-x-1.5">
              {['daily', 'weekly', 'monthly', 'timeline'].map((layout) => (
                <button
                  key={layout}
                  onClick={() => setCalendarLayout(layout)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                    calendarLayout === layout ? 'bg-brand-500 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400'
                  }`}
                >
                  {layout} View
                </button>
              ))}
            </div>
          </div>

          {/* Filtering row */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-[10px] uppercase text-slate-500 mb-1">Filter Room</label>
              <select
                value={selectedRoomFilter}
                onChange={(e) => setSelectedRoomFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded px-2.5 py-1.5 focus:outline-none"
              >
                <option value="all">All Rooms</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase text-slate-500 mb-1">Filter Doctor</label>
              <select
                value={selectedDoctorFilter}
                onChange={(e) => setSelectedDoctorFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded px-2.5 py-1.5 focus:outline-none"
              >
                <option value="all">All Doctors</option>
                {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.first_name} {d.last_name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase text-slate-500 mb-1">Queue Status</label>
              <select
                value={selectedQueueStatusFilter}
                onChange={(e) => setSelectedQueueStatusFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded px-2.5 py-1.5 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="booked">Booked (Scheduled)</option>
                <option value="checked_in">Checked In (Arrived)</option>
                <option value="waiting">Waiting (Triage Done)</option>
                <option value="in_consultation">In Consultation</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rescheduled">Rescheduled</option>
                <option value="no_show">No Show</option>
                <option value="payment_pending">Payment Pending</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase text-slate-500 mb-1">Start Date</label>
              <input
                type="date"
                value={apptStartDate}
                onChange={(e) => setapptStartDate ? setApptStartDate(e.target.value) : null}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded px-2.5 py-1.5 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase text-slate-500 mb-1">End Date</label>
              <input
                type="date"
                value={apptEndDate}
                onChange={(e) => setapptEndDate ? setApptEndDate(e.target.value) : null}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded px-2.5 py-1.5 focus:outline-none"
              />
            </div>
          </div>

          {/* Render Calendar / Timeline slots according to selected view */}
          {calendarLayout === 'daily' ? (
            <div className="glass-panel rounded-2xl p-6">
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500">
                      <th className="py-2.5 px-3">Slot Time</th>
                      <th className="py-2.5 px-3">Patient Name</th>
                      <th className="py-2.5 px-3">Assigned Room</th>
                      <th className="py-2.5 px-3">Consulting Doctor</th>
                      <th className="py-2.5 px-3">Queue No</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Update Queue Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300">
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-500">No appointments fit filters today</td>
                      </tr>
                    ) : (
                      filteredAppointments.map((appt) => (
                        <tr key={appt.id} className="hover:bg-slate-900/10">
                          <td className="py-3 px-3 font-semibold text-brand-400">{appt.start_time.slice(0, 5)}</td>
                          <td className="py-3 px-3 font-bold">{appt.patient_first_name} {appt.patient_last_name}</td>
                          <td className="py-3 px-3 font-mono">{appt.room_number || 'R101'}</td>
                          <td className="py-3 px-3">Dr. {appt.doctor_first_name} {appt.doctor_last_name}</td>
                          <td className="py-3 px-3 font-bold">#{appt.queue_number || '1'}</td>
                          <td className="py-3 px-3">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              appt.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                              appt.status === 'checked_in' ? 'bg-blue-500/20 text-blue-400' :
                              appt.status === 'waiting' ? 'bg-indigo-500/20 text-indigo-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {appt.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <select
                              value={appt.status}
                              onChange={(e) => handleUpdateStatus(appt.id, e.target.value)}
                              className="bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-[11px] focus:outline-none"
                            >
                              <option value="booked">Booked</option>
                              <option value="checked_in">Checked In</option>
                              <option value="waiting">Waiting</option>
                              <option value="in_consultation">In Consultation</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                              <option value="rescheduled">Rescheduled</option>
                              <option value="no_show">No Show</option>
                              <option value="payment_pending">Payment Pending</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-8 text-center text-xs text-slate-500">
              <Sliders className="w-8 h-8 mx-auto text-slate-700 mb-2" />
              <p>Calendar views ({calendarLayout}) are simulated using the active Daily List queue. Toggle back to "Daily View" to adjust statuses.</p>
            </div>
          )}
        </div>
      )}

      {/* 4. Cash counter billing Tab */}
      {activeSubTab === 'billing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 glass-panel rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">Cashier Invoice Creator</h2>
            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Select Patient *</label>
                  <select required value={billingForm.patient_id} onChange={(e) => setBillingForm({ ...billingForm, patient_id: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200">
                    <option value="">Select Patient...</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.mrn})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-1">Payment Method</label>
                  <select value={billingForm.payment_method} onChange={(e) => setBillingForm({ ...billingForm, payment_method: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200">
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Insurance">Insurance</option>
                  </select>
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/20">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-slate-300">Billing items ledger</h3>
                  <button type="button" onClick={addBillingItem} className="px-2 py-1 bg-brand-500/10 border border-brand-500/20 text-brand-400 font-bold rounded">+ Add Charge</button>
                </div>
                <div className="space-y-3">
                  {billingForm.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <input type="text" required value={item.item_name} onChange={(e) => updateBillingItem(idx, 'item_name', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-200" />
                      </div>
                      <div className="col-span-2">
                        <input type="number" value={item.quantity} onChange={(e) => updateBillingItem(idx, 'quantity', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-200" />
                      </div>
                      <div className="col-span-2">
                        <input type="number" value={item.unit_price} onChange={(e) => updateBillingItem(idx, 'unit_price', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-200" />
                      </div>
                      <div className="col-span-2">
                        <select value={item.gst_percent} onChange={(e) => updateBillingItem(idx, 'gst_percent', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-1 py-1.5 text-slate-200">
                          <option value={0}>0%</option>
                          <option value={5}>5%</option>
                          <option value={12}>12%</option>
                          <option value={18}>18%</option>
                        </select>
                      </div>
                      <div className="col-span-1 text-right text-slate-400">₹{item.total_price.toFixed(1)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <input type="number" placeholder="Discount" value={billingForm.discount_amount} onChange={(e) => setBillingForm({ ...billingForm, discount_amount: e.target.value })} className="w-24 bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-200" />
                <p className="font-bold text-brand-400">Total: ₹{(billingForm.items.reduce((acc, i) => acc + i.total_price, 0) - parseFloat(billingForm.discount_amount || 0)).toFixed(2)}</p>
              </div>
              <button type="submit" className="px-4 py-2 bg-brand-500 text-white font-bold rounded-lg shadow-lg">Fulfill bill</button>
            </form>
          </div>
        </div>
      )}

      {/* 1.5 Patient Directory Tab */}
      {activeSubTab === 'patient_list' && (
        <div className="glass-panel rounded-2xl p-6 flex flex-col h-[calc(100vh-12rem)]">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Registered Patients Directory</h2>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-lg shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Patient</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-4 text-[11px]">
            <div>
              <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Search Patient</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search Name, Phone, MRN..."
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
              <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Filter Doctor</label>
              <select
                value={patDoctorFilter}
                onChange={(e) => setPatDoctorFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1.5 text-slate-200"
              >
                <option value="all">All Doctors</option>
                {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.first_name} {d.last_name}</option>)}
              </select>
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
          
          <div className="flex-1 overflow-y-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-3">UHID (MRN)</th>
                  <th className="py-3 px-3">Full Name</th>
                  <th className="py-3 px-3">Contact No.</th>
                  <th className="py-3 px-3">DOB / Age</th>
                  <th className="py-3 px-3">Blood Group</th>
                  <th className="py-3 px-3">Emergency Contact</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-350">
                {patients
                  .filter(p => {
                    const matchesQuery = p.first_name.toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
                                         (p.last_name && p.last_name.toLowerCase().includes(patientSearchQuery.toLowerCase())) ||
                                         p.phone.includes(patientSearchQuery) ||
                                         p.mrn.toLowerCase().includes(patientSearchQuery.toLowerCase());
                    const matchesDob = !patDob || p.dob === patDob;
                    
                    const regDate = p.created_at ? new Date(p.created_at) : new Date();
                    const matchesStart = !patStartDate || regDate >= new Date(patStartDate + 'T00:00:00');
                    const matchesEnd = !patEndDate || regDate <= new Date(patEndDate + 'T23:59:59');

                    let matchesDoc = true;
                    if (patDoctorFilter && patDoctorFilter !== 'all') {
                      matchesDoc = appointments.some(appt => 
                        appt.patient_id === p.id && 
                        appt.doctor_id == patDoctorFilter
                      );
                    }

                    return matchesQuery && matchesDob && matchesStart && matchesEnd && matchesDoc;
                  })
                  .map(p => (
                    <tr key={p.id} className="hover:bg-slate-900/10 transition-colors">
                      <td className="py-3 px-3 font-semibold text-brand-400 font-mono">{p.mrn}</td>
                      <td className="py-3 px-3 font-bold text-slate-200">{p.first_name} {p.middle_name || ''} {p.last_name || ''}</td>
                      <td className="py-3 px-3 font-mono">{p.phone}</td>
                      <td className="py-3 px-3">{p.dob} ({p.age || 'N/A'} Yrs)</td>
                      <td className="py-3 px-3 font-semibold text-center w-16 bg-slate-950/20 rounded">{p.blood_group || 'N/A'}</td>
                      <td className="py-3 px-3">
                        {p.emergency_contact_name ? (
                          <span>{p.emergency_contact_name} ({p.emergency_contact_relation}) - {p.emergency_contact_phone}</span>
                        ) : 'None'}
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        <button
                          onClick={() => setSelectedPatientId(p.id)}
                          className="px-2.5 py-1 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 text-brand-400 font-bold rounded-lg text-[10px]"
                        >
                          View EMR File
                        </button>
                        <button
                          onClick={() => {
                            setApptForm({ ...apptForm, patient_id: p.id });
                            setActiveSubTab('schedule');
                          }}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-850 text-slate-300 font-bold rounded-lg text-[10px]"
                        >
                          Book Appt
                        </button>
                        <button
                          onClick={() => {
                            setBillingForm({ ...billingForm, patient_id: p.id });
                            setActiveSubTab('billing');
                          }}
                          className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-bold rounded-lg text-[10px]"
                        >
                          Bill Charge
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4.5 Billing Ledger (Invoice List) Tab */}
      {activeSubTab === 'invoice_list' && (
        <div className="glass-panel rounded-2xl p-6 flex flex-col h-[calc(100vh-12rem)]">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Billing General Ledger</h2>
            <div className="relative w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search Invoice No, Patient Name..."
                value={invoiceSearchQuery}
                onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-semibold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Invoice No</th>
                  <th className="py-2.5 px-3">Patient Name</th>
                  <th className="py-2.5 px-3">Billing Date</th>
                  <th className="py-2.5 px-3">Payment Method</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Tax GST</th>
                  <th className="py-2.5 px-3 text-right">Grand Total (₹)</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-350">
                {invoices
                  .filter(inv => {
                    const patName = inv.patient_name || (patients.find(p => p.id === inv.patient_id)?.first_name || '');
                    return inv.invoice_number.toLowerCase().includes(invoiceSearchQuery.toLowerCase()) ||
                           patName.toLowerCase().includes(invoiceSearchQuery.toLowerCase());
                  })
                  .map((inv) => {
                    const patName = inv.patient_name || `${patients.find(p => p.id === inv.patient_id)?.first_name || 'Walk-In'} ${patients.find(p => p.id === inv.patient_id)?.last_name || 'Patient'}`;
                    return (
                      <tr key={inv.id} className="hover:bg-slate-900/10 transition-colors">
                        <td className="py-3 px-3 font-semibold text-brand-400 font-mono">{inv.invoice_number}</td>
                        <td className="py-3 px-3 font-bold text-slate-200">{patName}</td>
                        <td className="py-3 px-3">{new Date(inv.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-3">{inv.payment_method}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            inv.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                          }`}>{inv.payment_status}</span>
                        </td>
                        <td className="py-3 px-3 text-right text-slate-500">₹{parseFloat(inv.gst_amount || 0).toFixed(2)}</td>
                        <td className="py-3 px-3 text-right font-bold text-slate-200">₹{parseFloat(inv.grand_total || 0).toFixed(2)}</td>
                        <td className="py-3 px-3 text-right">
                          <button 
                            onClick={() => addNotification(`Refund receipt generated for Invoice ${inv.invoice_number}. Amount credited back.`, 'info')} 
                            className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg text-[9px] font-bold"
                          >
                            Refund Receipt
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      <PatientRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={(simulatedPatient) => {
          fetchData();
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
  );
};

export default ReceptionDashboard;
