-- CareFlow EMR - Comprehensive Database Schema

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations (Tenants)
CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(100) UNIQUE,
    status VARCHAR(50) DEFAULT 'active', -- active, suspended, trial
    billing_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Clinics (Branches)
CREATE TABLE IF NOT EXISTS clinics (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g. CF-BLR-01
    type VARCHAR(100) NOT NULL, -- single_clinic, multi_specialty, dental, physiotherapist, diagnostic_center
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    zip_code VARCHAR(20) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    gstin VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Roles
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- super_admin, clinic_admin, doctor, receptionist, nurse, lab_tech, pharmacist, accountant
    description TEXT
);

-- Seed basic roles
INSERT INTO roles (name, description) VALUES
('super_admin', 'Global Platform Administrator'),
('clinic_admin', 'Clinic Manager/Administrator'),
('doctor', 'Medical Practitioner'),
('receptionist', 'Front Desk Staff'),
('nurse', 'Clinical Assistant'),
('lab_tech', 'Diagnostics Laboratory Technician'),
('pharmacist', 'Pharmacy and Stock Manager'),
('accountant', 'Finance and Payroll Officer')
ON CONFLICT (name) DO NOTHING;

-- 4. Users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    role_id INTEGER REFERENCES roles(id),
    status VARCHAR(50) DEFAULT 'active', -- active, inactive
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Clinic-User Link
CREATE TABLE IF NOT EXISTS clinic_users (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(clinic_id, user_id)
);

-- 6. Doctors Metadata
CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(150) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    experience_years INTEGER NOT NULL,
    consultation_fee NUMERIC(10, 2) NOT NULL,
    signature_url TEXT,
    calendar_link TEXT,
    teleconsult_available BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Patients Master (Exhaustive Columns)
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    mrn VARCHAR(100) UNIQUE NOT NULL, -- Medical Record Number / UHID
    registration_number VARCHAR(100) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    dob DATE NOT NULL,
    age INTEGER,
    blood_group VARCHAR(10),
    height_cm NUMERIC(5, 2),
    weight_kg NUMERIC(5, 2),
    marital_status VARCHAR(50),
    occupation VARCHAR(100),
    aadhaar_number VARCHAR(50),
    passport VARCHAR(50),
    abha_number VARCHAR(50),
    nationality VARCHAR(100) DEFAULT 'Indian',
    preferred_language VARCHAR(100) DEFAULT 'English',
    religion VARCHAR(100),
    photo_url TEXT,
    
    -- Contact Details
    phone VARCHAR(50) NOT NULL,
    alternate_mobile VARCHAR(50),
    email VARCHAR(255),
    whatsapp_number VARCHAR(50),
    address TEXT,
    landmark VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    pincode VARCHAR(20) NOT NULL,
    
    -- Emergency Contact
    emergency_contact_name VARCHAR(150),
    emergency_contact_relation VARCHAR(100),
    emergency_contact_phone VARCHAR(50),
    
    -- Insurance
    insurance_provider VARCHAR(255),
    insurance_policy_number VARCHAR(100),
    insurance_validity DATE,
    insurance_corporate VARCHAR(255),
    
    -- Medical History
    allergies TEXT,
    current_medication TEXT,
    chronic_disease TEXT,
    surgery_history TEXT,
    pregnancy_status VARCHAR(50),
    family_history TEXT,
    smoking_status VARCHAR(50),
    alcohol_status VARCHAR(50),
    tobacco_status VARCHAR(50),
    
    -- Consent
    consent_privacy BOOLEAN DEFAULT FALSE,
    consent_treatment BOOLEAN DEFAULT FALSE,
    digital_signature_url TEXT,
    
    -- Attachments URLs
    attachment_aadhaar_url TEXT,
    attachment_insurance_url TEXT,
    attachment_previous_reports_url TEXT,
    attachment_xray_url TEXT,
    attachment_mri_url TEXT,
    attachment_pdf_url TEXT,
    attachment_images_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Appointments & Queue
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    type VARCHAR(50) DEFAULT 'walk_in', -- walk_in, teleconsult, scheduled
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, checked_in, in_consultation, completed, cancelled
    queue_number INTEGER,
    reason_for_visit TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Patient Vitals
CREATE TABLE IF NOT EXISTS patient_vitals (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    recorded_by INTEGER REFERENCES users(id),
    height_cm NUMERIC(5, 2),
    weight_kg NUMERIC(5, 2),
    systolic_bp INTEGER,
    diastolic_bp INTEGER,
    pulse_rate INTEGER,
    temperature_f NUMERIC(4, 1),
    spo2 INTEGER,
    random_blood_sugar INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Consultations (EMR Master)
CREATE TABLE IF NOT EXISTS consultations (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
    symptoms TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    clinical_notes TEXT,
    treatment_plan TEXT,
    next_followup_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
    id SERIAL PRIMARY KEY,
    consultation_id INTEGER REFERENCES consultations(id) ON DELETE CASCADE,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prescription_items (
    id SERIAL PRIMARY KEY,
    prescription_id INTEGER REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    instructions VARCHAR(255),
    quantity INTEGER DEFAULT 0
);

-- 12. Patient Vaccinations
CREATE TABLE IF NOT EXISTS patient_vaccinations (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    vaccine_name VARCHAR(255) NOT NULL,
    date_administered DATE NOT NULL,
    administered_by VARCHAR(150),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Medicine Inventory
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    medicine_name VARCHAR(255) NOT NULL,
    batch_number VARCHAR(100) NOT NULL,
    expiry_date DATE NOT NULL,
    stock_qty INTEGER NOT NULL,
    purchase_rate NUMERIC(10, 2) NOT NULL,
    sale_rate NUMERIC(10, 2) NOT NULL,
    gst_percent NUMERIC(5, 2) DEFAULT 12.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Diagnostics Orders
CREATE TABLE IF NOT EXISTS diagnostics_orders (
    id SERIAL PRIMARY KEY,
    consultation_id INTEGER REFERENCES consultations(id) ON DELETE SET NULL,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    ordered_by_doctor_id INTEGER REFERENCES doctors(id),
    clinic_id INTEGER REFERENCES clinics(id),
    order_type VARCHAR(50) NOT NULL, -- lab_test, radiology_scan
    test_names TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'ordered', -- ordered, sample_collected, processing, completed, cancelled
    technician_id INTEGER REFERENCES users(id),
    report_file_url TEXT,
    report_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Billing Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    sub_total NUMERIC(10, 2) NOT NULL,
    gst_amount NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00,
    grand_total NUMERIC(10, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'unpaid', -- unpaid, paid, partially_paid, refunded
    payment_method VARCHAR(50), -- Cash, Card, UPI, Insurance
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    gst_percent NUMERIC(5, 2) DEFAULT 0.00,
    total_price NUMERIC(10, 2) NOT NULL
);

-- 16. Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    plan_name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'active'
);

-- 17. API Keys
CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    api_key_hash VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_mrn ON patients(mrn);
CREATE INDEX IF NOT EXISTS idx_appointments_date_clinic ON appointments(appointment_date, clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_patient ON consultations(patient_id);
