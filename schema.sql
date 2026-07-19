-- ==========================================
-- Nucleus PMS Core - Database Schema
-- Instance: Brunch Bouaké PMS
-- Version: 3.0 (Master Relational Schema)
-- Target Database: MySQL 8.0+ / MariaDB
-- ==========================================

-- Clean-up existing tables if needed (Optional, commented out)
-- SET FOREIGN_KEY_CHECKS = 0;
-- DROP TABLE IF EXISTS hrms_employee_loans, hrms_employee_deductions, hrms_deduction_types, hrms_employee_bonus, hrms_bonus_types, hrms_salary_history, hrms_contracts, hrms_employees, hrms_jobs, hrms_teams, hrms_departments, hrms_payroll_rules, hrms_holidays;
-- DROP TABLE IF EXISTS audit_logs, stock_items, housekeeping_tasks, maintenance_tickets, restaurant_orders, restaurant_menu_items, payments, invoices, reservations, guests, rooms, room_categories, hotel_settings, users, role_permissions, roles;
-- SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- 1. ADMINISTRATION, ROLES & AUTHENTICATION
-- ==========================================

-- Table: roles
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: role_permissions
CREATE TABLE IF NOT EXISTS role_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    module VARCHAR(50) NOT NULL, -- e.g., 'reservations', 'finance', 'hrms'
    action VARCHAR(50) NOT NULL, -- e.g., 'view', 'create', 'approve', 'delete'
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE KEY uq_role_permission (role_id, module, action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'disabled'
    timezone VARCHAR(50) DEFAULT 'Africa/Abidjan',
    last_login TIMESTAMP NULL DEFAULT NULL,
    reset_code VARCHAR(10) NULL, -- forgot-password 6-digit code, cleared on use
    reset_code_expires DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: hotel_settings
CREATE TABLE IF NOT EXISTS hotel_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_name VARCHAR(100) NOT NULL,
    legal_name VARCHAR(150),
    address VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(100),
    website VARCHAR(100),
    currency VARCHAR(10) DEFAULT 'XOF',
    timezone VARCHAR(50) DEFAULT 'Africa/Abidjan',
    tva_rate DECIMAL(5,2) DEFAULT 18.00,
    tourist_tax_rate INT DEFAULT 500, -- in XOF per night
    invoice_prefix VARCHAR(10) DEFAULT 'FA',
    invoice_start_number INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 2. HOTEL CONFIGURATION & ROOMS
-- ==========================================

-- Table: room_categories
CREATE TABLE IF NOT EXISTS room_categories (
    id VARCHAR(50) PRIMARY KEY, -- e.g., 'cat-std', 'cat-dlx'
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    base_price_per_night DECIMAL(10,2) NOT NULL,
    capacity INT NOT NULL DEFAULT 2,
    color VARCHAR(20) DEFAULT 'emerald',
    icon VARCHAR(50) DEFAULT 'Bed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: rooms
CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(50) PRIMARY KEY, -- e.g., 'room-101'
    category_id VARCHAR(50) NOT NULL,
    room_number VARCHAR(10) NOT NULL UNIQUE,
    floor VARCHAR(30),
    capacity INT NOT NULL DEFAULT 2,
    bed_type VARCHAR(50) NOT NULL DEFAULT 'Lit Double',
    area DECIMAL(6,2) NOT NULL DEFAULT 20.00,
    base_price DECIMAL(10,2) NOT NULL,
    amenities TEXT, -- Comma-separated or JSON list of amenity IDs
    notes TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NULL,
    updated_by VARCHAR(100) NULL,
    FOREIGN KEY (category_id) REFERENCES room_categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 3. GUESTS & RESERVATIONS
-- ==========================================

-- Table: guests
CREATE TABLE IF NOT EXISTS guests (
    id VARCHAR(50) PRIMARY KEY, -- e.g., 'guest-123'
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    gender VARCHAR(10) DEFAULT 'M', -- 'M', 'F', 'Autre'
    birth_date DATE NULL DEFAULT NULL,
    nationality VARCHAR(50) DEFAULT 'Ivoirienne',
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(30) NOT NULL,
    address TEXT,
    document_type VARCHAR(50) DEFAULT 'CNI', -- 'CNI', 'Passeport', 'Permis', 'Autre'
    document_number VARCHAR(100),
    notes TEXT,
    vip BOOLEAN NOT NULL DEFAULT FALSE,
    blacklist BOOLEAN NOT NULL DEFAULT FALSE,
    guest_type VARCHAR(30) DEFAULT 'Individuel', -- 'Individuel', 'Entreprise', 'Corporate'
    company_name VARCHAR(100),
    tax_id VARCHAR(50),
    deferred_payment_authorized BOOLEAN DEFAULT FALSE,
    payment_terms VARCHAR(100),
    credit_limit DECIMAL(12,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: reservations
CREATE TABLE IF NOT EXISTS reservations (
    id VARCHAR(50) PRIMARY KEY, -- e.g., 'res-123'
    reservation_number VARCHAR(30) NOT NULL UNIQUE,
    guest_id VARCHAR(50) NOT NULL,
    room_id VARCHAR(50) NOT NULL,
    booking_source_id VARCHAR(50) NOT NULL DEFAULT 'walk_in', -- 'walk_in', 'phone', 'booking_com', 'website'
    status VARCHAR(30) NOT NULL DEFAULT 'En attente', -- 'Brouillon', 'En attente', 'Confirmée', 'En séjour', 'Terminée', 'Annulée', 'No Show'
    arrival_date DATE NOT NULL,
    departure_date DATE NOT NULL,
    adults INT NOT NULL DEFAULT 1,
    children INT NOT NULL DEFAULT 0,
    nights INT NOT NULL DEFAULT 1,
    room_rate DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    deposit DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    balance DECIMAL(10,2) NOT NULL,
    remarks TEXT,
    created_by VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES guests(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 4. BILLING, PAYMENTS & RESTAURANT
-- ==========================================

-- Table: invoices
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(50) PRIMARY KEY,
    invoice_number VARCHAR(30) NOT NULL UNIQUE,
    reservation_id VARCHAR(50) NOT NULL,
    guest_id VARCHAR(50) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    paid DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    balance DECIMAL(10,2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Brouillon', -- 'Brouillon', 'Émise', 'Partiellement payée', 'Payée', 'Annulée'
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id),
    FOREIGN KEY (guest_id) REFERENCES guests(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: payments
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(50) PRIMARY KEY,
    invoice_id VARCHAR(50) NOT NULL,
    reservation_id VARCHAR(50) NOT NULL,
    payment_method VARCHAR(30) NOT NULL, -- 'Espèces', 'Carte', 'Mobile Money', 'Virement', 'Chèque'
    amount DECIMAL(10,2) NOT NULL,
    reference VARCHAR(100),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cashier_id VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Validé', -- 'Validé', 'Remboursé', 'Annulé'
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    FOREIGN KEY (reservation_id) REFERENCES reservations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: restaurant_menu_items
CREATE TABLE IF NOT EXISTS restaurant_menu_items (
    id VARCHAR(50) PRIMARY KEY,
    category_id VARCHAR(50) NOT NULL, -- 'brunch', 'cocktails', 'plats', 'desserts'
    name VARCHAR(100) NOT NULL,
    description TEXT,
    selling_price DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 18.00,
    available BOOLEAN DEFAULT TRUE,
    image VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: restaurant_orders
CREATE TABLE IF NOT EXISTS restaurant_orders (
    id VARCHAR(50) PRIMARY KEY,
    order_number VARCHAR(30) NOT NULL UNIQUE,
    reservation_id VARCHAR(50) NULL,
    guest_id VARCHAR(50) NULL,
    room_id VARCHAR(50) NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'En attente', -- 'En attente', 'En préparation', 'Servie', 'Facturée', 'Annulée'
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE SET NULL,
    FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE SET NULL,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 5. OPERATIONS: MAINTENANCE, HOUSEKEEPING & STOCK
-- ==========================================

-- Table: housekeeping_tasks
CREATE TABLE IF NOT EXISTS housekeeping_tasks (
    id VARCHAR(50) PRIMARY KEY,
    room_id VARCHAR(50) NOT NULL,
    employee_id VARCHAR(50) NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'Normale', -- 'Faible', 'Normale', 'Haute'
    status VARCHAR(30) NOT NULL DEFAULT 'À nettoyer', -- 'À nettoyer', 'En cours', 'Contrôle', 'Disponible'
    scheduled_time DATETIME NOT NULL,
    completed_time DATETIME NULL DEFAULT NULL,
    notes TEXT,
    FOREIGN KEY (room_id) REFERENCES rooms(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: maintenance_tickets
CREATE TABLE IF NOT EXISTS maintenance_tickets (
    id VARCHAR(50) PRIMARY KEY,
    room_id VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'Normale', -- 'Faible', 'Normale', 'Haute', 'Critique'
    description TEXT NOT NULL,
    assigned_to VARCHAR(100) NULL,
    estimated_cost DECIMAL(10,2) DEFAULT 0.00,
    actual_cost DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'Signalé', -- 'Signalé', 'Assigné', 'En cours', 'Résolu', 'Clôturé'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: stock_items
CREATE TABLE IF NOT EXISTS stock_items (
    id VARCHAR(50) PRIMARY KEY,
    sku VARCHAR(50) UNIQUE,
    barcode VARCHAR(100) NULL,
    name VARCHAR(100) NOT NULL UNIQUE,
    category_id VARCHAR(50) NOT NULL, -- e.g., 'boissons', 'entretien'
    supplier_id VARCHAR(50) NULL,
    purchase_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    selling_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    unit VARCHAR(20) NOT NULL DEFAULT 'unit', -- 'unit', 'kg', 'liter', 'box'
    minimum_stock DECIMAL(10,2) NOT NULL DEFAULT 5.00,
    current_stock DECIMAL(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 6. AUDIT LOGS (TRAÇABILITÉ ACTIVE)
-- ==========================================

-- Table: audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    module VARCHAR(50) NOT NULL, -- e.g., 'reservations', 'billing', 'hrms'
    action VARCHAR(50) NOT NULL, -- e.g., 'check_in', 'void_invoice', 'sign_contract'
    record_id VARCHAR(50) NULL, -- affected record ID
    details TEXT,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 7. MODULE HRMS (HUMAN RESOURCES)
-- ==========================================

-- Table: hrms_payroll_rules
CREATE TABLE IF NOT EXISTS hrms_payroll_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    country_code VARCHAR(3) NOT NULL, -- e.g., 'CI', 'SN', 'BF', 'FR'
    default_currency VARCHAR(3) NOT NULL DEFAULT 'XOF',
    cnps_employee_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0550, -- e.g., 5.5%
    cnps_employer_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0770, -- e.g., 7.7%
    cnps_ceiling DECIMAL(12,2) NOT NULL DEFAULT 1200000.00,
    salary_tax_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0120,
    national_contribution_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
    effective_date DATE NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_by INT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by INT NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: hrms_departments
CREATE TABLE IF NOT EXISTS hrms_departments (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'dept-rec', 'dept-fin'
    hotel_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL, -- e.g., 'REC', 'FIN', 'HK'
    cost_center_code VARCHAR(30) NOT NULL,
    manager_id VARCHAR(50) NULL, -- REFERENCES hrms_employees(id) later via code trigger or logical association
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: hrms_teams
CREATE TABLE IF NOT EXISTS hrms_teams (
    id VARCHAR(50) PRIMARY KEY,
    hotel_id INT NOT NULL,
    department_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL, -- e.g., 'Equipe A'
    code VARCHAR(20) NOT NULL, -- e.g., 'EQ-HK-A'
    supervisor_id VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES hrms_departments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: hrms_jobs
CREATE TABLE IF NOT EXISTS hrms_jobs (
    id VARCHAR(50) PRIMARY KEY,
    hotel_id INT NOT NULL,
    department_id VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    salary_min DECIMAL(10,2),
    salary_max DECIMAL(10,2),
    hourly_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES hrms_departments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: hrms_employees
CREATE TABLE IF NOT EXISTS hrms_employees (
    id VARCHAR(50) PRIMARY KEY,
    hotel_id INT NOT NULL,
    user_id INT NULL,
    department_id VARCHAR(50) NOT NULL,
    job_id VARCHAR(50) NOT NULL,
    team_id VARCHAR(50) NULL,
    employee_code VARCHAR(20) NOT NULL, -- e.g., 'EMP-2026-001'
    employee_type VARCHAR(30) NOT NULL DEFAULT 'FULL_TIME', -- 'FULL_TIME', 'PART_TIME', etc.
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    gender VARCHAR(10) NOT NULL, -- 'M', 'F', 'Autre'
    date_of_birth DATE NOT NULL,
    address TEXT,
    nationality VARCHAR(50) NOT NULL,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(30),
    hire_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'on_leave', 'terminated'
    cnps_number VARCHAR(50) NULL,
    payment_method VARCHAR(30) NOT NULL DEFAULT 'bank_transfer', -- 'bank_transfer', 'mobile_money', 'cash'
    bank_name VARCHAR(100) NULL,
    bank_account_number VARCHAR(100) NULL,
    bank_swift VARCHAR(20) NULL,
    bank_iban VARCHAR(40) NULL,
    mobile_money_provider VARCHAR(30) NULL, -- 'Orange Money', 'MTN MoMo', 'Wave'
    mobile_money_number VARCHAR(30) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES hrms_departments(id),
    FOREIGN KEY (job_id) REFERENCES hrms_jobs(id),
    FOREIGN KEY (team_id) REFERENCES hrms_teams(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: hrms_contracts
CREATE TABLE IF NOT EXISTS hrms_contracts (
    id VARCHAR(50) PRIMARY KEY,
    hotel_id INT NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    contract_type VARCHAR(30) NOT NULL, -- 'CDI', 'CDD', 'EXTRA', 'INTERN', 'CONSULTANT'
    start_date DATE NOT NULL,
    end_date DATE NULL DEFAULT NULL,
    trial_period_end DATE NULL DEFAULT NULL,
    base_salary DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'XOF',
    social_security_opt_in BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) NOT NULL DEFAULT 'draft', -- 'draft', 'active', 'expired', 'superseded', 'terminated'
    signature_status VARCHAR(20) NOT NULL DEFAULT 'unsigned', -- 'unsigned', 'signed'
    signed_at TIMESTAMP NULL DEFAULT NULL,
    signed_by INT NULL DEFAULT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES hrms_employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: hrms_salary_history
CREATE TABLE IF NOT EXISTS hrms_salary_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    contract_id VARCHAR(50) NOT NULL,
    change_date DATE NOT NULL,
    old_salary DECIMAL(10,2) NOT NULL,
    new_salary DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'XOF',
    reason VARCHAR(255) NOT NULL, -- 'promotion', 'annual_indexation', 'contract_revision'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES hrms_employees(id) ON DELETE CASCADE,
    FOREIGN KEY (contract_id) REFERENCES hrms_contracts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: hrms_skills
CREATE TABLE IF NOT EXISTS hrms_skills (
    id VARCHAR(50) PRIMARY KEY,
    hotel_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(30) NOT NULL, -- 'languages', 'technical_haccp', 'safety', 'soft_skills'
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: hrms_employee_skills
CREATE TABLE IF NOT EXISTS hrms_employee_skills (
    id VARCHAR(50) PRIMARY KEY,
    hotel_id INT NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    skill_id VARCHAR(50) NOT NULL,
    level VARCHAR(20) NOT NULL, -- 'beginner', 'intermediate', 'advanced', 'expert'
    obtained_date DATE NULL DEFAULT NULL,
    expiration_date DATE NULL DEFAULT NULL,
    FOREIGN KEY (employee_id) REFERENCES hrms_employees(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES hrms_skills(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: hrms_documents
CREATE TABLE IF NOT EXISTS hrms_documents (
    id VARCHAR(50) PRIMARY KEY,
    hotel_id INT NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    document_type VARCHAR(30) NOT NULL, -- 'id_card', 'contract', 'diploma', 'payslip', 'medical_certificate', 'other'
    file_name VARCHAR(150) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(100) NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES hrms_employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: hrms_onboarding_tasks
CREATE TABLE IF NOT EXISTS hrms_onboarding_tasks (
    id VARCHAR(50) PRIMARY KEY,
    hotel_id INT NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    assigned_to VARCHAR(100) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'completed'
    completed_at TIMESTAMP NULL DEFAULT NULL,
    completed_by VARCHAR(100) NULL,
    FOREIGN KEY (employee_id) REFERENCES hrms_employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: hrms_business_events
CREATE TABLE IF NOT EXISTS hrms_business_events (
    id VARCHAR(50) PRIMARY KEY,
    hotel_id INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(50) NOT NULL, -- 'EmployeeCreated', 'EmployeeUpdated', etc.
    actor_name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    payload TEXT NULL -- JSON stringified payload
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================
-- 8. INDEXING & OPTIMIZATIONS
-- ==========================================
CREATE INDEX idx_reservation_dates ON reservations (arrival_date, departure_date);
CREATE INDEX idx_rooms_active ON rooms (active);
CREATE INDEX idx_audit_logs_user ON audit_logs (user_id);
CREATE INDEX idx_invoice_number ON invoices (invoice_number);
CREATE INDEX idx_hrms_emp_lookup ON hrms_employees (hotel_id, department_id, status);
CREATE INDEX idx_hrms_contracts_emp ON hrms_contracts (hotel_id, employee_id, status);
