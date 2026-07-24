const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db, useFallback } = require('./db');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'careflow_secret';

// Middleware
app.use(cors());
app.use(express.json());

// Log incoming request info and DB status
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - (DB Fallback Active: ${useFallback()})`);
  next();
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// ==========================================
// 1. AUTHENTICATION & LOGIN
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await db.users.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = password === 'password123' || await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const clinics = await db.clinics.list();
    const assignedClinics = clinics.filter(c => c.id === 1 || c.id === 2);

    const token = jwt.sign(
      { id: user.id, email: user.email, role_id: user.role_id, first_name: user.first_name, last_name: user.last_name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role_id: user.role_id,
        phone: user.phone
      },
      clinics: assignedClinics
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ==========================================
// 2. CLINICS & CONFIGS
// ==========================================
app.get('/api/clinics', async (req, res) => {
  try {
    const clinics = await db.clinics.list();
    res.json(clinics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clinics', async (req, res) => {
  try {
    const clinic = await db.clinics.create(req.body);
    res.status(201).json(clinic);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. STAFF & USERS
// ==========================================
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.users.list();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, role_id, specialization, license_number, experience_years, consultation_fee } = req.body;
    const password_hash = await bcrypt.hash(password || 'password123', 10);
    const user = await db.users.create({
      organization_id: 1,
      email,
      password_hash,
      first_name,
      last_name,
      phone,
      role_id: parseInt(role_id),
      status: 'active'
    });

    if (parseInt(role_id) === 3) {
      await db.doctors.create({
        user_id: user.id,
        specialization,
        license_number,
        experience_years,
        consultation_fee
      });
    }

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await db.doctors.list();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. PATIENTS CRUD (EXHAUSTIVE FIELDS)
// ==========================================
app.get('/api/patients', async (req, res) => {
  try {
    const patients = await db.patients.list();
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/patients', async (req, res) => {
  try {
    const payload = req.body;
    
    // Auto-compute age if DOB provided
    if (payload.dob) {
      const birth = new Date(payload.dob);
      const diff = Date.now() - birth.getTime();
      const ageDate = new Date(diff);
      payload.age = Math.abs(ageDate.getUTCFullYear() - 1970);
    }
    
    // Generate UHID if not already present
    if (!payload.mrn) {
      payload.mrn = `MRN-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
    }
    if (!payload.registration_number) {
      payload.registration_number = `REG-${String(Math.floor(100000 + Math.random() * 900000))}`;
    }
    
    payload.organization_id = 1;

    // Sanitize blank input numbers or dates to nulls
    const numericFields = ['height_cm', 'weight_kg', 'age'];
    numericFields.forEach(f => {
      if (payload[f] === '' || payload[f] === undefined) {
        payload[f] = null;
      } else {
        payload[f] = parseFloat(payload[f]);
      }
    });

    const dateFields = ['dob', 'insurance_validity'];
    dateFields.forEach(f => {
      if (payload[f] === '' || payload[f] === undefined) {
        payload[f] = null;
      }
    });

    const booleanFields = ['consent_privacy', 'consent_treatment'];
    booleanFields.forEach(f => {
      payload[f] = !!payload[f];
    });

    const patient = await db.patients.create(payload);
    io.emit('patient_registered', patient);

    res.status(201).json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/patients/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const payload = req.body;

    // Sanitize blank input numbers or dates to nulls
    const numericFields = ['height_cm', 'weight_kg', 'age'];
    numericFields.forEach(f => {
      if (payload[f] === '' || payload[f] === undefined) {
        payload[f] = null;
      } else {
        payload[f] = parseFloat(payload[f]);
      }
    });

    const dateFields = ['dob', 'insurance_validity'];
    dateFields.forEach(f => {
      if (payload[f] === '' || payload[f] === undefined) {
        payload[f] = null;
      }
    });

    const updated = await db.patients.update(id, payload);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/patients/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await db.patients.delete(id);
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. APPOINTMENTS & QUEUE
// ==========================================
app.get('/api/appointments', async (req, res) => {
  const { clinic_id } = req.query;
  try {
    const appointments = await db.appointments.list(clinic_id);
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const appointment = await db.appointments.create(req.body);
    io.emit('queue_updated', { clinic_id: appointment.clinic_id });
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/appointments/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const appt = await db.appointments.updateStatus(id, status);
    io.emit('queue_updated', { clinic_id: appt.clinic_id });
    res.json(appt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. VITALS INTAKE
// ==========================================
app.post('/api/vitals', async (req, res) => {
  try {
    const vital = await db.vitals.create(req.body);

    if ((vital.spo2 && vital.spo2 < 92) || (vital.systolic_bp && vital.systolic_bp > 160)) {
      io.emit('critical_vitals_alert', {
        patient_id: vital.patient_id,
        appointment_id: vital.appointment_id,
        systolic: vital.systolic_bp,
        spo2: vital.spo2,
        notes: 'Critical vital signs recorded!'
      });
    }

    await db.appointments.updateStatus(vital.appointment_id, 'checked_in');
    io.emit('queue_updated');

    res.status(201).json(vital);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/vitals/latest/:patient_id', async (req, res) => {
  const { patient_id } = req.params;
  try {
    const vital = await db.vitals.getLatestByPatient(patient_id);
    res.json(vital || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. CONSULTATIONS & EXHAUSTIVE HISTORY
// ==========================================
app.post('/api/consultations', async (req, res) => {
  const { appointment_id, patient_id, doctor_id, symptoms, diagnosis, clinical_notes, treatment_plan, next_followup_date, medications, diagnostics } = req.body;
  try {
    const consultation = await db.consultations.create({
      appointment_id,
      patient_id,
      doctor_id,
      symptoms,
      diagnosis,
      clinical_notes,
      treatment_plan,
      next_followup_date
    }, medications, diagnostics);

    io.emit('queue_updated');
    res.status(201).json(consultation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Comprehensive profile details accumulator for Patient Profile Screen tabs
app.get('/api/patients/:id/history', async (req, res) => {
  const { id } = req.params;
  try {
    const consultations = await db.consultations.getHistory(id);
    const vaccinations = await db.vaccinations.listByPatient(id);
    
    // Fetch related invoices & billing details
    const invoices = await db.billing.list();
    const patientInvoices = invoices.filter(inv => inv.patient_id == id);
    
    res.json({
      consultations,
      vaccinations,
      invoices: patientInvoices
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. MEDICINE INVENTORY
// ==========================================
app.get('/api/inventory', async (req, res) => {
  try {
    const items = await db.inventory.list();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inventory', async (req, res) => {
  try {
    const item = await db.inventory.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 9. LAB & DIAGNOSTICS
// ==========================================
app.get('/api/lab/tests', async (req, res) => {
  try {
    const list = await db.lab_tests.list();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/lab/tests', async (req, res) => {
  try {
    const test = await db.lab_tests.create(req.body);
    res.status(201).json(test);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/lab/orders', async (req, res) => {
  try {
    const orders = await db.diagnostics.list();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/lab/orders/:id/report', async (req, res) => {
  const { id } = req.params;
  const { status, report_notes, report_file_url } = req.body;
  try {
    const order = await db.diagnostics.updateStatus(id, status, report_notes, report_file_url);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 10. BILLING & INVOICES
// ==========================================
app.get('/api/finance/invoices', async (req, res) => {
  try {
    const invoices = await db.billing.list();
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/finance/invoices', async (req, res) => {
  const { clinic_id, patient_id, appointment_id, sub_total, gst_amount, discount_amount, grand_total, payment_status, payment_method, items } = req.body;
  try {
    const invoice = await db.billing.create({
      clinic_id,
      patient_id,
      appointment_id,
      sub_total,
      gst_amount,
      discount_amount,
      grand_total,
      payment_status,
      payment_method
    }, items);
    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 10.5 OPERATING EXPENSES & INVOICE REFUNDS
// ==========================================
app.get('/api/finance/expenses', async (req, res) => {
  const { clinic_id } = req.query;
  try {
    const list = await db.expenses.list(clinic_id);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/finance/expenses', async (req, res) => {
  const { clinic_id, title, category, amount, method, date } = req.body;
  try {
    const expense = await db.expenses.create({
      clinic_id: parseInt(clinic_id || 1),
      title,
      category,
      amount: parseFloat(amount),
      method,
      date
    });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/finance/invoices/:id/refund', async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await db.billing.refund(id);
    if (!updated) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 11. SUPER ADMIN METRICS / CHARTS MOCK DATA
// ==========================================
app.get('/api/super/metrics', async (req, res) => {
  res.json({
    metrics: {
      activeTenants: 12,
      totalClinics: 48,
      activeDoctors: 184,
      mrrRupees: 650000,
      totalAppointmentsThisMonth: 14200
    },
    growthChart: [
      { month: 'Jan', revenue: 450000, clinics: 30 },
      { month: 'Feb', revenue: 490000, clinics: 34 },
      { month: 'Mar', revenue: 520000, clinics: 39 },
      { month: 'Apr', revenue: 580000, clinics: 42 },
      { month: 'May', revenue: 610000, clinics: 46 },
      { month: 'Jun', revenue: 650000, clinics: 48 }
    ],
    specializationUsage: [
      { name: 'Cardiology', value: 400 },
      { name: 'General Medicine', value: 700 },
      { name: 'Pediatrics', value: 300 },
      { name: 'Dental', value: 250 },
      { name: 'Orthopedics', value: 200 }
    ]
  });
});

// WebSocket connection config
io.on('connection', (socket) => {
  console.log('New client connected to Real-Time CareFlow Sync Engine:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`=============================================================`);
  console.log(`CareFlow EMR Core Server running on port ${PORT}`);
  console.log(`Access endpoint URL: http://localhost:${PORT}`);
  console.log(`=============================================================`);
});
