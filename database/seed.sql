-- CareFlow EMR - PostgreSQL seed data including comprehensive patient information

-- 1. Insert Organizations
INSERT INTO organizations (name, domain, status, billing_email) VALUES
('CareFlow Health Systems', 'careflow.com', 'active', 'billing@careflow.com')
ON CONFLICT (domain) DO NOTHING;

-- 2. Insert Clinics
INSERT INTO clinics (organization_id, name, code, type, address_line1, address_line2, city, state, country, zip_code, phone_number, email, gstin, status) VALUES
(1, 'CareFlow Bengaluru Downtown', 'CF-BLR-01', 'multi_specialty', '102, 80 Feet Road, Koramangala', 'Block 4', 'Bengaluru', 'Karnataka', 'India', '560034', '+91 80 4912 3456', 'koramangala@careflow.com', '29AAAAA0000A1Z1', 'active'),
(1, 'CareFlow Indiranagar Dental', 'CF-BLR-02', 'dental', '45, 100 Feet Road, Indiranagar', 'First Floor', 'Bengaluru', 'Karnataka', 'India', '560038', '+91 80 4912 3457', 'indiranagar@careflow.com', '29AAAAA0000A1Z2', 'active')
ON CONFLICT (code) DO NOTHING;

-- 3. Insert Users (Password hashes are bcrypt for 'password123')
INSERT INTO users (organization_id, email, password_hash, first_name, last_name, phone, role_id, status) VALUES
(1, 'superadmin@careflow.com', '$2a$10$w858Y0Cg/V1v9Yj6M0oGcuuF.w5fS7GgE5QeJbE3V7g5zJbLq/Hfa', 'Super', 'Admin', '9900000001', 1, 'active'),
(1, 'admin@careflow.com', '$2a$10$w858Y0Cg/V1v9Yj6M0oGcuuF.w5fS7GgE5QeJbE3V7g5zJbLq/Hfa', 'Clinic', 'Admin', '9900000002', 2, 'active'),
(1, 'doctor@careflow.com', '$2a$10$w858Y0Cg/V1v9Yj6M0oGcuuF.w5fS7GgE5QeJbE3V7g5zJbLq/Hfa', 'Aravind', 'Sharma', '9900000003', 3, 'active'),
(1, 'dentist@careflow.com', '$2a$10$w858Y0Cg/V1v9Yj6M0oGcuuF.w5fS7GgE5QeJbE3V7g5zJbLq/Hfa', 'Priya', 'Nair', '9900000004', 3, 'active'),
(1, 'receptionist@careflow.com', '$2a$10$w858Y0Cg/V1v9Yj6M0oGcuuF.w5fS7GgE5QeJbE3V7g5zJbLq/Hfa', 'Rajesh', 'Kumar', '9900000005', 4, 'active'),
(1, 'nurse@careflow.com', '$2a$10$w858Y0Cg/V1v9Yj6M0oGcuuF.w5fS7GgE5QeJbE3V7g5zJbLq/Hfa', 'Sneha', 'Roy', '9900000006', 5, 'active'),
(1, 'labtech@careflow.com', '$2a$10$w858Y0Cg/V1v9Yj6M0oGcuuF.w5fS7GgE5QeJbE3V7g5zJbLq/Hfa', 'Vikram', 'Singh', '9900000007', 6, 'active'),
(1, 'pharmacist@careflow.com', '$2a$10$w858Y0Cg/V1v9Yj6M0oGcuuF.w5fS7GgE5QeJbE3V7g5zJbLq/Hfa', 'Amit', 'Patel', '9900000008', 7, 'active'),
(1, 'accountant@careflow.com', '$2a$10$w858Y0Cg/V1v9Yj6M0oGcuuF.w5fS7GgE5QeJbE3V7g5zJbLq/Hfa', 'Sanjay', 'Shah', '9900000009', 8, 'active')
ON CONFLICT (email) DO NOTHING;

-- 4. Map Users to Clinics
INSERT INTO clinic_users (clinic_id, user_id) VALUES
(1, 2), (1, 3), (2, 4), (1, 5), (2, 5), (1, 6), (1, 7), (1, 8), (1, 9)
ON CONFLICT (clinic_id, user_id) DO NOTHING;

-- 5. Insert Doctors Info
INSERT INTO doctors (user_id, specialization, license_number, experience_years, consultation_fee, signature_url, calendar_link, teleconsult_available) VALUES
(3, 'Cardiology', 'KMC-91823', 15, 800.00, 'https://placehold.co/150x50/png?text=Dr+Aravind', 'https://calendly.com/dr-aravind', TRUE),
(4, 'Orthodontics', 'KMC-41235', 8, 600.00, 'https://placehold.co/150x50/png?text=Dr+Priya', 'https://calendly.com/dr-priya', FALSE)
ON CONFLICT (license_number) DO NOTHING;

-- 6. Insert Exhaustive Patients Data
INSERT INTO patients (
    organization_id, mrn, registration_number, first_name, middle_name, last_name, gender, dob, age, blood_group, height_cm, weight_kg, marital_status, occupation, aadhaar_number, passport, abha_number, nationality, preferred_language, religion, photo_url,
    phone, alternate_mobile, email, whatsapp_number, address, landmark, city, state, country, pincode,
    emergency_contact_name, emergency_contact_relation, emergency_contact_phone,
    insurance_provider, insurance_policy_number, insurance_validity, insurance_corporate,
    allergies, current_medication, chronic_disease, surgery_history, pregnancy_status, family_history, smoking_status, alcohol_status, tobacco_status,
    consent_privacy, consent_treatment, digital_signature_url,
    attachment_aadhaar_url, attachment_insurance_url, attachment_previous_reports_url, attachment_xray_url, attachment_mri_url
) VALUES
(
    1, 'MRN-2026-0001', 'REG-100221', 'Rahul', 'Kumar', 'Verma', 'Male', '1990-05-15', 36, 'O+', 172.50, 68.20, 'Married', 'Software Engineer', '1234-5678-9012', 'P1234567', '44-9021-3312-44', 'Indian', 'English', 'Hindu', 'https://placehold.co/150x150/png?text=Rahul+Verma',
    '9876543210', '9876543222', 'rahul.verma@example.com', '9876543210', 'Flat 302, Green Glen Layout, Bellandur', 'Near Sobha Dewflower', 'Bengaluru', 'Karnataka', 'India', '560103',
    'Sunita Verma', 'Spouse', '9876543211',
    'Star Health Insurance', 'SH-981123-A', '2028-12-31', 'Google Corp Tier-1',
    'Dust Mites, Penicillin', 'None', 'Asthma', 'Appendectomy (2018)', 'N/A', 'Father has Type-2 Diabetes', 'Non-Smoker', 'Occasional', 'None',
    TRUE, TRUE, 'https://placehold.co/150x50/png?text=Rahul+Signature',
    'https://careflow.s3.amazonaws.com/docs/aadhaar.pdf', 'https://careflow.s3.amazonaws.com/docs/insurance.pdf', 'https://careflow.s3.amazonaws.com/docs/reports.pdf', 'https://careflow.s3.amazonaws.com/docs/xray.jpg', 'https://careflow.s3.amazonaws.com/docs/mri.jpg'
),
(
    1, 'MRN-2026-0002', 'REG-100222', 'Priya', 'Anand', 'Sharma', 'Female', '1985-11-22', 40, 'A-', 160.00, 54.00, 'Married', 'Professor', '9876-5432-1098', 'Q7654321', '88-1122-3344-55', 'Indian', 'Hindi', 'Hindu', 'https://placehold.co/150x150/png?text=Priya+Sharma',
    '9812345678', '9812345688', 'priya.sharma@example.com', '9812345678', 'Villa 14, Prestige Lakeside Habitat, Varthur', 'Near Varthur Lake', 'Bengaluru', 'Karnataka', 'India', '560087',
    'Amit Sharma', 'Spouse', '9812345679',
    'HDFC Ergo Health', 'HE-110293-B', '2027-05-15', 'TCS Corporate Plan',
    'Sulfonamides', 'Thyroxine 50mcg', 'Hypothyroidism', 'None', 'N/A', 'Mother has Hypertension', 'Non-Smoker', 'Non-Drinker', 'None',
    TRUE, TRUE, 'https://placehold.co/150x50/png?text=Priya+Signature',
    null, null, null, null, null
)
ON CONFLICT (mrn) DO NOTHING;

-- 7. Insert Vaccine logs
INSERT INTO patient_vaccinations (patient_id, vaccine_name, date_administered, administered_by, notes) VALUES
(1, 'Covishield Dose 1', '2021-06-15', 'Sneha Roy', 'First Dose completed'),
(1, 'Covishield Dose 2', '2021-09-10', 'Sneha Roy', 'Second Dose completed'),
(1, 'Hepatitis B', '2025-02-14', 'Sneha Roy', 'Booster Dose')
ON CONFLICT DO NOTHING;

-- 8. Insert Inventory stock
INSERT INTO inventory (clinic_id, medicine_name, batch_number, expiry_date, stock_qty, purchase_rate, sale_rate, gst_percent) VALUES
(1, 'Paracetamol 650mg (Dolo)', 'B-DOL901', '2028-06-30', 500, 1.20, 2.00, 12.00),
(1, 'Amoxicillin 500mg', 'B-AMX402', '2027-12-15', 250, 4.50, 7.50, 12.00),
(1, 'Atorvastatin 10mg (Lipitor)', 'B-LIP551', '2027-09-20', 300, 8.00, 14.00, 12.00),
(1, 'Metformin 500mg (Glycomet)', 'B-GLY772', '2028-03-10', 1000, 0.80, 1.50, 12.00),
(1, 'Pantoprazole 40mg (Pan-D)', 'B-PAN118', '2027-05-18', 400, 3.00, 5.00, 12.00)
ON CONFLICT DO NOTHING;

-- 9. Insert Subscriptions
INSERT INTO subscriptions (organization_id, plan_name, start_date, end_date, status) VALUES
(1, 'Enterprise Multi-Clinic Plan', '2026-01-01', '2027-01-01', 'active')
ON CONFLICT DO NOTHING;
