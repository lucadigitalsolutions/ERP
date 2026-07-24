const { Pool } = require('pg');
require('dotenv').config();

let pool = null;
let useFallback = false;

// In-Memory Database Fallback if PostgreSQL is unreachable
const memoryDb = {
  organizations: [
    { id: 1, name: 'CareFlow Health Systems', domain: 'careflow.com', status: 'active', billing_email: 'billing@careflow.com' }
  ],
  clinics: [
    { id: 1, organization_id: 1, name: 'CareFlow Bengaluru Downtown', code: 'CF-BLR-01', type: 'multi_specialty', address_line1: '102, 80 Feet Road, Koramangala', city: 'Bengaluru', state: 'Karnataka', zip_code: '560034', phone_number: '+91 80 4912 3456', email: 'koramangala@careflow.com', gstin: '29AAAAA0000A1Z1', status: 'active' },
    { id: 2, organization_id: 1, name: 'CareFlow Indiranagar Dental', code: 'CF-BLR-02', type: 'dental', address_line1: '45, 100 Feet Road, Indiranagar', city: 'Bengaluru', state: 'Karnataka', zip_code: '560038', phone_number: '+91 80 4912 3457', email: 'indiranagar@careflow.com', gstin: '29AAAAA0000A1Z2', status: 'active' }
  ],
  users: [
    { id: 1, organization_id: 1, email: 'superadmin@careflow.com', first_name: 'Super', last_name: 'Admin', phone: '9900000001', role_id: 1, status: 'active' },
    { id: 2, organization_id: 1, email: 'admin@careflow.com', first_name: 'Clinic', last_name: 'Admin', phone: '9900000002', role_id: 2, status: 'active' },
    { id: 3, organization_id: 1, email: 'doctor@careflow.com', first_name: 'Aravind', last_name: 'Sharma', phone: '9900000003', role_id: 3, status: 'active' },
    { id: 4, organization_id: 1, email: 'dentist@careflow.com', first_name: 'Priya', last_name: 'Nair', phone: '9900000004', role_id: 3, status: 'active' },
    { id: 5, organization_id: 1, email: 'receptionist@careflow.com', first_name: 'Rajesh', last_name: 'Kumar', phone: '9900000005', role_id: 4, status: 'active' },
    { id: 6, organization_id: 1, email: 'nurse@careflow.com', first_name: 'Sneha', last_name: 'Roy', phone: '9900000006', role_id: 5, status: 'active' },
    { id: 7, organization_id: 1, email: 'labtech@careflow.com', first_name: 'Vikram', last_name: 'Singh', phone: '9900000007', role_id: 6, status: 'active' },
    { id: 8, organization_id: 1, email: 'pharmacist@careflow.com', first_name: 'Amit', last_name: 'Patel', phone: '9900000008', role_id: 7, status: 'active' },
    { id: 9, organization_id: 1, email: 'accountant@careflow.com', first_name: 'Sanjay', last_name: 'Shah', phone: '9900000009', role_id: 8, status: 'active' }
  ],
  doctors: [
    { id: 1, user_id: 3, specialization: 'Cardiology', license_number: 'KMC-91823', experience_years: 15, consultation_fee: 800.00, signature_url: 'https://placehold.co/150x50/png?text=Dr+Aravind', calendar_link: 'https://calendly.com/dr-aravind', teleconsult_available: true },
    { id: 2, user_id: 4, specialization: 'Orthodontics', license_number: 'KMC-41235', experience_years: 8, consultation_fee: 600.00, signature_url: 'https://placehold.co/150x50/png?text=Dr+Priya', calendar_link: 'https://calendly.com/dr-priya', teleconsult_available: false }
  ],
  patients: [
    {
      id: 1,
      organization_id: 1,
      mrn: 'MRN-2026-0001',
      registration_number: 'REG-100221',
      first_name: 'Rahul',
      middle_name: 'Kumar',
      last_name: 'Verma',
      gender: 'Male',
      dob: '1990-05-15',
      age: 36,
      blood_group: 'O+',
      height_cm: 172.50,
      weight_kg: 68.20,
      marital_status: 'Married',
      occupation: 'Software Engineer',
      aadhaar_number: '1234-5678-9012',
      passport: 'P1234567',
      abha_number: '44-9021-3312-44',
      nationality: 'Indian',
      preferred_language: 'English',
      religion: 'Hindu',
      photo_url: 'https://placehold.co/150x150/png?text=Rahul+Verma',
      phone: '9876543210',
      alternate_mobile: '9876543222',
      email: 'rahul.verma@example.com',
      whatsapp_number: '9876543210',
      address: 'Flat 302, Green Glen Layout, Bellandur',
      landmark: 'Near Sobha Dewflower',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      pincode: '560103',
      emergency_contact_name: 'Sunita Verma',
      emergency_contact_relation: 'Spouse',
      emergency_contact_phone: '9876543211',
      insurance_provider: 'Star Health Insurance',
      insurance_policy_number: 'SH-981123-A',
      insurance_validity: '2028-12-31',
      insurance_corporate: 'Google Corp Tier-1',
      allergies: 'Dust Mites, Penicillin',
      current_medication: 'None',
      chronic_disease: 'Asthma',
      surgery_history: 'Appendectomy (2018)',
      pregnancy_status: 'N/A',
      family_history: 'Father has Type-2 Diabetes',
      smoking_status: 'Non-Smoker',
      alcohol_status: 'Occasional',
      tobacco_status: 'None',
      consent_privacy: true,
      consent_treatment: true,
      digital_signature_url: 'https://placehold.co/150x50/png?text=Rahul+Signature',
      attachment_aadhaar_url: 'https://careflow.s3.amazonaws.com/docs/aadhaar.pdf',
      attachment_insurance_url: 'https://careflow.s3.amazonaws.com/docs/insurance.pdf',
      attachment_previous_reports_url: 'https://careflow.s3.amazonaws.com/docs/reports.pdf',
      attachment_xray_url: 'https://careflow.s3.amazonaws.com/docs/xray.jpg',
      attachment_mri_url: 'https://careflow.s3.amazonaws.com/docs/mri.jpg'
    },
    {
      id: 2,
      organization_id: 1,
      mrn: 'MRN-2026-0002',
      registration_number: 'REG-100222',
      first_name: 'Priya',
      middle_name: 'Anand',
      last_name: 'Sharma',
      gender: 'Female',
      dob: '1985-11-22',
      age: 40,
      blood_group: 'A-',
      height_cm: 160.00,
      weight_kg: 54.00,
      marital_status: 'Married',
      occupation: 'Professor',
      aadhaar_number: '9876-5432-1098',
      passport: 'Q7654321',
      abha_number: '88-1122-3344-55',
      nationality: 'Indian',
      preferred_language: 'Hindi',
      religion: 'Hindu',
      photo_url: 'https://placehold.co/150x150/png?text=Priya+Sharma',
      phone: '9812345678',
      alternate_mobile: '9812345688',
      email: 'priya.sharma@example.com',
      whatsapp_number: '9812345678',
      address: 'Villa 14, Prestige Lakeside Habitat, Varthur',
      landmark: 'Near Varthur Lake',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      pincode: '560087',
      emergency_contact_name: 'Amit Sharma',
      emergency_contact_relation: 'Spouse',
      emergency_contact_phone: '9812345679',
      insurance_provider: 'HDFC Ergo Health',
      insurance_policy_number: 'HE-110293-B',
      insurance_validity: '2027-05-15',
      insurance_corporate: 'TCS Corporate Plan',
      allergies: 'Sulfonamides',
      current_medication: 'Thyroxine 50mcg',
      chronic_disease: 'Hypothyroidism',
      surgery_history: 'None',
      pregnancy_status: 'N/A',
      family_history: 'Mother has Hypertension',
      smoking_status: 'Non-Smoker',
      alcohol_status: 'Non-Drinker',
      tobacco_status: 'None',
      consent_privacy: true,
      consent_treatment: true,
      digital_signature_url: 'https://placehold.co/150x50/png?text=Priya+Signature'
    }
  ],
  appointments: [
    { id: 1, clinic_id: 1, patient_id: 1, doctor_id: 1, appointment_date: '2026-07-23', start_time: '10:00', end_time: '10:30', type: 'walk_in', status: 'checked_in', queue_number: 1, reason_for_visit: 'Chest pain and breathlessness' },
    { id: 2, clinic_id: 1, patient_id: 2, doctor_id: 1, appointment_date: '2026-07-23', start_time: '11:00', end_time: '11:30', type: 'scheduled', status: 'scheduled', queue_number: 2, reason_for_visit: 'Routine cardiology follow-up' }
  ],
  patient_vitals: [],
  consultations: [],
  prescriptions: [],
  prescription_items: [],
  patient_vaccinations: [
    { id: 1, patient_id: 1, vaccine_name: 'Covishield Dose 1', date_administered: '2021-06-15', administered_by: 'Sneha Roy', notes: 'First Dose completed' },
    { id: 2, patient_id: 1, vaccine_name: 'Covishield Dose 2', date_administered: '2021-09-10', administered_by: 'Sneha Roy', notes: 'Second Dose completed' },
    { id: 3, patient_id: 1, vaccine_name: 'Hepatitis B', date_administered: '2025-02-14', administered_by: 'Sneha Roy', notes: 'Booster Dose' }
  ],
  inventory: [
    { id: 1, clinic_id: 1, medicine_name: 'Paracetamol 650mg (Dolo)', batch_number: 'B-DOL901', expiry_date: '2028-06-30', stock_qty: 500, purchase_rate: 1.20, sale_rate: 2.00, gst_percent: 12.00 },
    { id: 2, clinic_id: 1, medicine_name: 'Amoxicillin 500mg', batch_number: 'B-AMX402', expiry_date: '2027-12-15', stock_qty: 250, purchase_rate: 4.50, sale_rate: 7.50, gst_percent: 12.00 },
    { id: 3, clinic_id: 1, medicine_name: 'Atorvastatin 10mg (Lipitor)', batch_number: 'B-LIP551', expiry_date: '2027-09-20', stock_qty: 300, purchase_rate: 8.00, sale_rate: 14.00, gst_percent: 12.00 }
  ],
  diagnostics_orders: [
    { id: 1, consultation_id: null, patient_id: 1, ordered_by_doctor_id: 1, clinic_id: 1, order_type: 'lab_test', test_names: 'Lipid Profile, HbA1c', status: 'ordered', technician_id: null, report_file_url: null, report_notes: null, created_at: new Date() }
  ],
  invoices: [
    { id: 1, clinic_id: 1, patient_id: 1, appointment_id: 1, invoice_number: 'INV-2026-0001', sub_total: 1408.00, gst_amount: 192.00, discount_amount: 0.00, grand_total: 1600.00, payment_status: 'paid', payment_method: 'UPI', created_at: '2026-07-23T10:30:00Z' }
  ],
  invoice_items: [
    { id: 1, invoice_id: 1, item_name: 'Doctor Consultation Fee', quantity: 1, unit_price: 800.00, gst_percent: 0.00, total_price: 800.00 }
  ],
  expenses: [
    { id: 1, clinic_id: 1, title: 'Reagent chemicals purchase', category: 'Medical Supplies', amount: 8500.00, method: 'UPI', date: '2026-07-20' },
    { id: 2, clinic_id: 1, title: 'Clinic floor electricity bill', category: 'Utilities', amount: 14200.00, method: 'Bank Transfer', date: '2026-07-15' }
  ],
  lab_tests: [
    { id: 1, name: 'Complete Blood Count (CBC)', category: 'Hematology', standard_cost: 350.00, normal_range: 'Hb: 12-16 g/dL, WBC: 4k-11k' },
    { id: 2, name: 'Lipid Profile', category: 'Biochemistry', standard_cost: 600.00, normal_range: 'Cholesterol: <200 mg/dL' },
    { id: 3, name: 'HbA1c', category: 'Diabetology', standard_cost: 450.00, normal_range: '< 5.7%' },
    { id: 4, name: 'Thyroid Profile (T3, T4, TSH)', category: 'Endocrinology', standard_cost: 550.00, normal_range: 'TSH: 0.4-4.0 mIU/L' },
    { id: 5, name: 'Urine Routine & Microscopy', category: 'Clinical Pathology', standard_cost: 200.00, normal_range: 'Clear, pH: 6.0' }
  ],
  audit_logs: []
};

// PostgreSQL Config
const pgConfig = {
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/careflow_emr',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

const initDb = async () => {
  try {
    pool = new Pool(pgConfig);
    const res = await pool.query('SELECT NOW()');
    console.log('Successfully connected to PostgreSQL at:', res.rows[0].now);
  } catch (err) {
    console.warn('PostgreSQL connection failed. Falling back to in-memory database configuration.');
    useFallback = true;
  }
};

initDb();

const query = async (text, params) => {
  if (useFallback) {
    throw new Error('Using in-memory database configuration.');
  }
  return pool.query(text, params);
};

const db = {
  organizations: {
    list: async () => {
      if (useFallback) return memoryDb.organizations;
      const res = await pool.query('SELECT * FROM organizations ORDER BY id ASC');
      return res.rows;
    }
  },
  clinics: {
    list: async () => {
      if (useFallback) return memoryDb.clinics;
      const res = await pool.query('SELECT * FROM clinics ORDER BY id ASC');
      return res.rows;
    }
  },
  users: {
    findByEmail: async (email) => {
      if (useFallback) {
        return memoryDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      }
      const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      return res.rows[0];
    },
    list: async () => {
      if (useFallback) return memoryDb.users;
      const res = await pool.query('SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id ORDER BY u.id ASC');
      return res.rows;
    },
    create: async (user) => {
      if (useFallback) {
        const newUser = { id: memoryDb.users.length + 1, ...user, created_at: new Date() };
        memoryDb.users.push(newUser);
        return newUser;
      }
      const res = await pool.query(
        'INSERT INTO users (organization_id, email, password_hash, first_name, last_name, phone, role_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [user.organization_id, user.email, user.password_hash, user.first_name, user.last_name, user.phone, user.role_id, 'active']
      );
      return res.rows[0];
    }
  },
  doctors: {
    list: async () => {
      if (useFallback) {
        return memoryDb.doctors.map(d => {
          const user = memoryDb.users.find(u => u.id === d.user_id);
          return { ...d, ...user };
        });
      }
      const res = await pool.query(`
        SELECT d.*, u.first_name, u.last_name, u.email, u.phone, u.status 
        FROM doctors d 
        JOIN users u ON d.user_id = u.id
      `);
      return res.rows;
    },
    create: async (doc) => {
      if (useFallback) {
        const newDoc = {
          id: memoryDb.doctors.length + 1,
          user_id: doc.user_id,
          specialization: doc.specialization || 'General Medicine',
          license_number: doc.license_number || `LIC-${Math.floor(10000 + Math.random() * 90000)}`,
          experience_years: parseInt(doc.experience_years || 5),
          consultation_fee: parseFloat(doc.consultation_fee || 500.00),
          teleconsult_available: true
        };
        memoryDb.doctors.push(newDoc);
        return newDoc;
      }
      try {
        const res = await pool.query(
          'INSERT INTO doctors (user_id, specialization, license_number, experience_years, consultation_fee, teleconsult_available) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [doc.user_id, doc.specialization || 'General Medicine', doc.license_number || `LIC-${Math.floor(10000 + Math.random() * 90000)}`, parseInt(doc.experience_years || 5), parseFloat(doc.consultation_fee || 500.00), true]
        );
        return res.rows[0];
      } catch (err) {
        const newDoc = {
          id: memoryDb.doctors.length + 1,
          user_id: doc.user_id,
          specialization: doc.specialization || 'General Medicine',
          license_number: doc.license_number || `LIC-${Math.floor(10000 + Math.random() * 90000)}`,
          experience_years: parseInt(doc.experience_years || 5),
          consultation_fee: parseFloat(doc.consultation_fee || 500.00),
          teleconsult_available: true
        };
        memoryDb.doctors.push(newDoc);
        return newDoc;
      }
    }
  },
  patients: {
    list: async () => {
      if (useFallback) return memoryDb.patients;
      const res = await pool.query('SELECT * FROM patients ORDER BY id DESC');
      return res.rows;
    },
    create: async (p) => {
      if (useFallback) {
        const newPatient = { 
          id: memoryDb.patients.length + 1, 
          ...p, 
          created_at: new Date(), 
          updated_at: new Date() 
        };
        memoryDb.patients.push(newPatient);
        return newPatient;
      }
      
      const keys = Object.keys(p);
      const values = Object.values(p);
      const valueParams = keys.map((_, i) => `$${i + 1}`).join(', ');
      
      const sql = `INSERT INTO patients (${keys.join(', ')}) VALUES (${valueParams}) RETURNING *`;
      const res = await pool.query(sql, values);
      return res.rows[0];
    },
    update: async (id, p) => {
      if (useFallback) {
        const index = memoryDb.patients.findIndex(pat => pat.id == id);
        if (index !== -1) {
          memoryDb.patients[index] = { ...memoryDb.patients[index], ...p, updated_at: new Date() };
          return memoryDb.patients[index];
        }
        return null;
      }
      
      const keys = Object.keys(p);
      const values = Object.values(p);
      const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
      
      const sql = `UPDATE patients SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${keys.length + 1} RETURNING *`;
      const res = await pool.query(sql, [...values, id]);
      return res.rows[0];
    },
    delete: async (id) => {
      if (useFallback) {
        const index = memoryDb.patients.findIndex(p => p.id == id);
        if (index !== -1) {
          const deleted = memoryDb.patients.splice(index, 1);
          return deleted[0];
        }
        return null;
      }
      const res = await pool.query('DELETE FROM patients WHERE id = $1 RETURNING *', [id]);
      return res.rows[0];
    }
  },
  appointments: {
    list: async (clinic_id) => {
      if (useFallback) {
        let appts = memoryDb.appointments;
        if (clinic_id) {
          appts = appts.filter(a => a.clinic_id == clinic_id);
        }
        return appts.map(a => {
          const patient = memoryDb.patients.find(p => p.id == a.patient_id);
          const doctor = memoryDb.doctors.find(d => d.id == a.doctor_id);
          const docUser = doctor ? memoryDb.users.find(u => u.id == doctor.user_id) : null;
          return {
            ...a,
            patient_first_name: patient?.first_name,
            patient_last_name: patient?.last_name,
            patient_phone: patient?.phone,
            patient_mrn: patient?.mrn,
            doctor_first_name: docUser?.first_name,
            doctor_last_name: docUser?.last_name,
            doctor_specialization: doctor?.specialization
          };
        });
      }
      const filterClause = clinic_id ? 'WHERE a.clinic_id = $1' : '';
      const params = clinic_id ? [parseInt(clinic_id)] : [];
      const res = await pool.query(`
        SELECT a.*, 
               p.first_name as patient_first_name, p.last_name as patient_last_name, p.phone as patient_phone, p.mrn as patient_mrn,
               u.first_name as doctor_first_name, u.last_name as doctor_last_name, d.specialization as doctor_specialization
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users u ON d.user_id = u.id
        ${filterClause}
        ORDER BY a.appointment_date DESC, a.start_time ASC
      `, params);
      return res.rows;
    },
    create: async (appt) => {
      const clinicId = parseInt(appt.clinic_id);
      const patientId = parseInt(appt.patient_id);
      const doctorId = parseInt(appt.doctor_id);
      
      if (useFallback) {
        const newAppt = {
          id: memoryDb.appointments.length + 1,
          ...appt,
          clinic_id: clinicId,
          patient_id: patientId,
          doctor_id: doctorId,
          status: appt.status || 'scheduled',
          queue_number: memoryDb.appointments.filter(a => a.appointment_date === appt.appointment_date).length + 1,
          created_at: new Date()
        };
        memoryDb.appointments.push(newAppt);
        return newAppt;
      }
      const qNumRes = await pool.query(
        'SELECT COALESCE(MAX(queue_number), 0) + 1 as next_q FROM appointments WHERE appointment_date = $1 AND clinic_id = $2',
        [appt.appointment_date, clinicId]
      );
      const nextQ = qNumRes.rows[0].next_q;

      const res = await pool.query(
        'INSERT INTO appointments (clinic_id, patient_id, doctor_id, appointment_date, start_time, end_time, type, status, queue_number, reason_for_visit, room_number) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
        [clinicId, patientId, doctorId, appt.appointment_date, appt.start_time, appt.end_time, appt.type || 'walk_in', appt.status || 'scheduled', nextQ, appt.reason_for_visit, appt.room_number || 'R101']
      );
      return res.rows[0];
    },
    updateStatus: async (id, status) => {
      if (useFallback) {
        const appt = memoryDb.appointments.find(a => a.id == id);
        if (appt) appt.status = status;
        return appt;
      }
      const res = await pool.query('UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *', [status, parseInt(id)]);
      return res.rows[0];
    }
  },
  vitals: {
    create: async (vital) => {
      const apptId = parseInt(vital.appointment_id);
      const patId = parseInt(vital.patient_id);
      
      if (useFallback) {
        const newVital = { 
          id: memoryDb.patient_vitals.length + 1, 
          ...vital, 
          appointment_id: apptId,
          patient_id: patId,
          created_at: new Date() 
        };
        memoryDb.patient_vitals.push(newVital);
        return newVital;
      }
      const res = await pool.query(
        'INSERT INTO patient_vitals (appointment_id, patient_id, recorded_by, height_cm, weight_kg, systolic_bp, diastolic_bp, pulse_rate, temperature_f, spo2, random_blood_sugar, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
        [apptId, patId, vital.recorded_by, vital.height_cm, vital.weight_kg, vital.systolic_bp, vital.diastolic_bp, vital.pulse_rate, vital.temperature_f, vital.spo2, vital.random_blood_sugar, vital.notes]
      );
      return res.rows[0];
    },
    getLatestByPatient: async (patientId) => {
      if (useFallback) {
        const vList = memoryDb.patient_vitals.filter(v => v.patient_id == patientId);
        return vList.length ? vList[vList.length - 1] : null;
      }
      const res = await pool.query('SELECT * FROM patient_vitals WHERE patient_id = $1 ORDER BY created_at DESC LIMIT 1', [parseInt(patientId)]);
      return res.rows[0];
    }
  },
  consultations: {
    create: async (c, prescriptionItems, diagnosticsOrders) => {
      const apptId = parseInt(c.appointment_id);
      const patId = parseInt(c.patient_id);
      const docId = parseInt(c.doctor_id);

      if (useFallback) {
        const newC = { 
          id: memoryDb.consultations.length + 1, 
          ...c, 
          appointment_id: apptId,
          patient_id: patId,
          doctor_id: docId,
          created_at: new Date() 
        };
        memoryDb.consultations.push(newC);

        if (prescriptionItems && prescriptionItems.length > 0) {
          const newRx = { id: memoryDb.prescriptions.length + 1, consultation_id: newC.id, patient_id: patId, doctor_id: docId, created_at: new Date() };
          memoryDb.prescriptions.push(newRx);
          prescriptionItems.forEach(item => {
            memoryDb.prescription_items.push({
              id: memoryDb.prescription_items.length + 1,
              prescription_id: newRx.id,
              ...item
            });
            const stock = memoryDb.inventory.find(i => i.medicine_name.toLowerCase() === item.medicine_name.toLowerCase());
            if (stock) {
              stock.stock_qty = Math.max(0, stock.stock_qty - (item.quantity || 0));
            }
          });
        }

        if (diagnosticsOrders && diagnosticsOrders.length > 0) {
          diagnosticsOrders.forEach(ord => {
            memoryDb.diagnostics_orders.push({
              id: memoryDb.diagnostics_orders.length + 1,
              consultation_id: newC.id,
              patient_id: patId,
              ordered_by_doctor_id: docId,
              clinic_id: 1,
              order_type: ord.type,
              test_names: ord.name,
              status: 'ordered',
              created_at: new Date()
            });
          });
        }
        
        // Update appointment status in memory too!
        const appt = memoryDb.appointments.find(a => a.id == apptId);
        if (appt) appt.status = 'completed';

        return newC;
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const cRes = await client.query(
          'INSERT INTO consultations (appointment_id, patient_id, doctor_id, symptoms, diagnosis, clinical_notes, treatment_plan, next_followup_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
          [apptId, patId, docId, c.symptoms, c.diagnosis, c.clinical_notes, c.treatment_plan, c.next_followup_date]
        );
        const consultation = cRes.rows[0];

        if (prescriptionItems && prescriptionItems.length > 0) {
          const rxRes = await client.query(
            'INSERT INTO prescriptions (consultation_id, patient_id, doctor_id) VALUES ($1, $2, $3) RETURNING id',
            [consultation.id, patId, docId]
          );
          const rxId = rxRes.rows[0].id;
          for (const item of prescriptionItems) {
            await client.query(
              'INSERT INTO prescription_items (prescription_id, medicine_name, dosage, frequency, duration, instructions, quantity) VALUES ($1, $2, $3, $4, $5, $6, $7)',
              [rxId, item.medicine_name, item.dosage, item.frequency, item.duration, item.instructions, item.quantity || 0]
            );
            await client.query(
              'UPDATE inventory SET stock_qty = GREATEST(0, stock_qty - $1) WHERE LOWER(medicine_name) = LOWER($2)',
              [item.quantity || 0, item.medicine_name]
            );
          }
        }

        if (diagnosticsOrders && diagnosticsOrders.length > 0) {
          for (const ord of diagnosticsOrders) {
            await client.query(
              'INSERT INTO diagnostics_orders (consultation_id, patient_id, ordered_by_doctor_id, order_type, test_names, status) VALUES ($1, $2, $3, $4, $5, $6)',
              [consultation.id, patId, docId, ord.type, ord.name, 'ordered']
            );
          }
        }

        await client.query('UPDATE appointments SET status = \'completed\' WHERE id = $1', [apptId]);

        await client.query('COMMIT');
        return consultation;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    },
    getHistory: async (patientId) => {
      if (useFallback) {
        const consults = memoryDb.consultations.filter(c => c.patient_id == patientId);
        return consults.map(c => {
          const prescription = memoryDb.prescriptions.find(p => p.consultation_id === c.id);
          const rxItems = prescription ? memoryDb.prescription_items.filter(ri => ri.prescription_id === prescription.id) : [];
          const labOrders = memoryDb.diagnostics_orders.filter(o => o.consultation_id === c.id);
          const doctor = memoryDb.doctors.find(d => d.id === c.doctor_id);
          const docUser = doctor ? memoryDb.users.find(u => u.id === doctor.user_id) : null;
          return {
            ...c,
            doctor_name: docUser ? `Dr. ${docUser.first_name} ${docUser.last_name}` : 'Unknown Doctor',
            medications: rxItems,
            diagnostics: labOrders
          };
        });
      }
      const res = await pool.query(`
        SELECT c.*, 
               u.first_name as doc_first, u.last_name as doc_last
        FROM consultations c
        JOIN doctors d ON c.doctor_id = d.id
        JOIN users u ON d.user_id = u.id
        WHERE c.patient_id = $1
        ORDER BY c.created_at DESC
      `, [patientId]);
      
      const consults = [];
      for (const row of res.rows) {
        const rxRes = await pool.query('SELECT * FROM prescriptions WHERE consultation_id = $1', [row.id]);
        let medications = [];
        if (rxRes.rows.length > 0) {
          const mRes = await pool.query('SELECT * FROM prescription_items WHERE prescription_id = $1', [rxRes.rows[0].id]);
          medications = mRes.rows;
        }
        const diagRes = await pool.query('SELECT * FROM diagnostics_orders WHERE consultation_id = $1', [row.id]);
        consults.push({
          ...row,
          doctor_name: `Dr. ${row.doc_first} ${row.doc_last}`,
          medications,
          diagnostics: diagRes.rows
        });
      }
      return consults;
    }
  },
  vaccinations: {
    listByPatient: async (patientId) => {
      if (useFallback) return memoryDb.patient_vaccinations.filter(v => v.patient_id == patientId);
      const res = await pool.query('SELECT * FROM patient_vaccinations WHERE patient_id = $1 ORDER BY date_administered DESC', [patientId]);
      return res.rows;
    }
  },
  inventory: {
    list: async () => {
      if (useFallback) return memoryDb.inventory;
      const res = await pool.query('SELECT * FROM inventory ORDER BY medicine_name ASC');
      return res.rows;
    },
    create: async (item) => {
      if (useFallback) {
        const newItem = { id: memoryDb.inventory.length + 1, ...item, created_at: new Date() };
        memoryDb.inventory.push(newItem);
        return newItem;
      }
      const res = await pool.query(
        'INSERT INTO inventory (clinic_id, medicine_name, batch_number, expiry_date, stock_qty, purchase_rate, sale_rate, gst_percent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [item.clinic_id, item.medicine_name, item.batch_number, item.expiry_date, item.stock_qty, item.purchase_rate, item.sale_rate, item.gst_percent]
      );
      return res.rows[0];
    }
  },
  diagnostics: {
    list: async () => {
      if (useFallback) {
        return memoryDb.diagnostics_orders.map(o => {
          const patient = memoryDb.patients.find(p => p.id === o.patient_id);
          const doctor = memoryDb.doctors.find(d => d.id === o.ordered_by_doctor_id);
          const docUser = doctor ? memoryDb.users.find(u => u.id === doctor.user_id) : null;
          return {
            ...o,
            patient_name: patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown',
            patient_mrn: patient?.mrn,
            doctor_name: docUser ? `Dr. ${docUser.first_name} ${docUser.last_name}` : 'Unknown'
          };
        });
      }
      const res = await pool.query(`
        SELECT d.*, 
               p.first_name as patient_first, p.last_name as patient_last, p.mrn as patient_mrn,
               u.first_name as doc_first, u.last_name as doc_last
        FROM diagnostics_orders d
        JOIN patients p ON d.patient_id = p.id
        LEFT JOIN doctors doc ON d.ordered_by_doctor_id = doc.id
        LEFT JOIN users u ON doc.user_id = u.id
        ORDER BY d.created_at DESC
      `);
      return res.rows.map(row => ({
        ...row,
        patient_name: `${row.patient_first} ${row.patient_last}`,
        doctor_name: row.doc_first ? `Dr. ${row.doc_first} ${row.doc_last}` : 'N/A'
      }));
    },
    updateStatus: async (id, status, notes, fileUrl) => {
      if (useFallback) {
        const order = memoryDb.diagnostics_orders.find(o => o.id == id);
        if (order) {
          order.status = status;
          if (notes) order.report_notes = notes;
          if (fileUrl) order.report_file_url = fileUrl;
          order.updated_at = new Date();
        }
        return order;
      }
      const res = await pool.query(
        'UPDATE diagnostics_orders SET status = $1, report_notes = COALESCE($2, report_notes), report_file_url = COALESCE($3, report_file_url), updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
        [status, notes, fileUrl, id]
      );
      return res.rows[0];
    }
  },
  billing: {
    list: async () => {
      if (useFallback) {
        return memoryDb.invoices.map(i => {
          const patient = memoryDb.patients.find(p => p.id === i.patient_id);
          const items = memoryDb.invoice_items.filter(item => item.invoice_id === i.id);
          return {
            ...i,
            patient_name: patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown',
            patient_mrn: patient?.mrn,
            items
          };
        });
      }
      try {
        const res = await pool.query(`
          SELECT inv.*, p.first_name as patient_first, p.last_name as patient_last, p.mrn as patient_mrn
          FROM invoices inv
          JOIN patients p ON inv.patient_id = p.id
          ORDER BY inv.created_at DESC
        `);
        const list = [];
        for (const row of res.rows) {
          const itemRes = await pool.query('SELECT * FROM invoice_items WHERE invoice_id = $1', [row.id]);
          list.push({
            ...row,
            patient_name: `${row.patient_first} ${row.patient_last}`,
            items: itemRes.rows
          });
        }
        return list;
      } catch (err) {
        return memoryDb.invoices.map(i => {
          const patient = memoryDb.patients.find(p => p.id === i.patient_id);
          const items = memoryDb.invoice_items.filter(item => item.invoice_id === i.id);
          return {
            ...i,
            patient_name: patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown',
            patient_mrn: patient?.mrn,
            items
          };
        });
      }
    },
    create: async (inv, items) => {
      const clinicId = parseInt(inv.clinic_id);
      const patientId = parseInt(inv.patient_id);
      const apptId = inv.appointment_id ? parseInt(inv.appointment_id) : null;

      if (useFallback) {
        const newInv = {
          id: memoryDb.invoices.length + 1,
          invoice_number: `INV-2026-${String(memoryDb.invoices.length + 1).padStart(4, '0')}`,
          ...inv,
          clinic_id: clinicId,
          patient_id: patientId,
          appointment_id: apptId,
          created_at: new Date(),
          updated_at: new Date()
        };
        memoryDb.invoices.push(newInv);
        items.forEach(item => {
          memoryDb.invoice_items.push({
            id: memoryDb.invoice_items.length + 1,
            invoice_id: newInv.id,
            ...item
          });
        });
        return newInv;
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const invNum = `INV-2026-${Date.now().toString().slice(-6)}`;
        const invRes = await client.query(
          'INSERT INTO invoices (clinic_id, patient_id, appointment_id, invoice_number, sub_total, gst_amount, discount_amount, grand_total, payment_status, payment_method) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
          [clinicId, patientId, apptId, invNum, inv.sub_total, inv.gst_amount, inv.discount_amount || 0, inv.grand_total, inv.payment_status || 'unpaid', inv.payment_method]
        );
        const invoice = invRes.rows[0];

        for (const item of items) {
          await client.query(
            'INSERT INTO invoice_items (invoice_id, item_name, quantity, unit_price, gst_percent, total_price) VALUES ($1, $2, $3, $4, $5, $6)',
            [invoice.id, item.item_name, item.quantity || 1, item.unit_price, item.gst_percent || 0, item.total_price]
          );
        }

        await client.query('COMMIT');
        return invoice;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    },
    refund: async (id) => {
      if (useFallback) {
        const inv = memoryDb.invoices.find(i => i.id == id || i.invoice_number == id);
        if (inv) {
          inv.payment_status = 'refunded';
        }
        return inv;
      }
      try {
        const queryText = isNaN(id) 
          ? 'UPDATE invoices SET payment_status = \'refunded\' WHERE invoice_number = $1 RETURNING *'
          : 'UPDATE invoices SET payment_status = \'refunded\' WHERE id = $1 RETURNING *';
        const paramVal = isNaN(id) ? id : parseInt(id);
        const res = await pool.query(queryText, [paramVal]);
        return res.rows[0];
      } catch (err) {
        const inv = memoryDb.invoices.find(i => i.id == id || i.invoice_number == id);
        if (inv) {
          inv.payment_status = 'refunded';
        }
        return inv;
      }
    }
  },
  expenses: {
    list: async (clinicId) => {
      if (useFallback) {
        return clinicId ? memoryDb.expenses.filter(e => e.clinic_id == clinicId) : memoryDb.expenses;
      }
      try {
        const res = await pool.query('SELECT * FROM expenses ORDER BY date DESC');
        return res.rows;
      } catch (err) {
        return memoryDb.expenses;
      }
    },
    create: async (expense) => {
      if (useFallback) {
        const newExp = { id: memoryDb.expenses.length + 1, ...expense, created_at: new Date() };
        memoryDb.expenses.push(newExp);
        return newExp;
      }
      try {
        const res = await pool.query(
          'INSERT INTO expenses (clinic_id, title, category, amount, method, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [expense.clinic_id, expense.title, expense.category, expense.amount, expense.method, expense.date]
        );
        return res.rows[0];
      } catch (err) {
        const newExp = { id: memoryDb.expenses.length + 1, ...expense, created_at: new Date() };
        memoryDb.expenses.push(newExp);
        return newExp;
      }
    }
  },
  lab_tests: {
    list: async () => {
      if (useFallback) return memoryDb.lab_tests;
      try {
        const res = await pool.query('SELECT * FROM lab_tests ORDER BY name ASC');
        return res.rows;
      } catch (err) {
        return memoryDb.lab_tests;
      }
    },
    create: async (test) => {
      if (useFallback) {
        const newTest = { id: memoryDb.lab_tests.length + 1, ...test, created_at: new Date() };
        memoryDb.lab_tests.push(newTest);
        return newTest;
      }
      try {
        const res = await pool.query(
          'INSERT INTO lab_tests (name, category, standard_cost, normal_range) VALUES ($1, $2, $3, $4) RETURNING *',
          [test.name, test.category, parseFloat(test.standard_cost), test.normal_range]
        );
        return res.rows[0];
      } catch (err) {
        const newTest = { id: memoryDb.lab_tests.length + 1, ...test, created_at: new Date() };
        memoryDb.lab_tests.push(newTest);
        return newTest;
      }
    }
  }
};

module.exports = {
  query,
  db,
  useFallback: () => useFallback
};
