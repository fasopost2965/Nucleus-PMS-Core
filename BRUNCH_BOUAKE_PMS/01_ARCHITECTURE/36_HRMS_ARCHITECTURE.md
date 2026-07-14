# 36_HRMS_ARCHITECTURE.md

**Projet :** Nucleus PMS Core
**Instance de référence :** Brunch Bouaké PMS
**Version :** 3.0 (Master HRMS Enterprise Blueprint - GO VALIDÉ)
**Statut :** Architecture Globale Officiellement Validée - Lancement du Sprint 1
**Auteur :** Lead Software Architect - Nucleus PMS Core

---

## 1. Alignement Stratégique et Multi-Tenancy SaaS

Ce document formalise la version 3.0 des spécifications d'architecture du module **HRMS (Human Resources Management System)** pour Nucleus PMS Core. 

Conçu pour un fonctionnement multi-établissement étanche (`hotel_id`), le système intègre l'internationalisation des règles de paie, la traçabilité intégrale de l'historique de carrière, la séparation rigoureuse des flux financiers (avances vs prêts) et la publication d'événements métiers.

### Principes Architecturaux Clefs
1. **Multi-Property Natif** : Chaque enregistrement porte l'identifiant `hotel_id` indexé.
2. **Auditabilité et Archivage Logique** : Toutes les tables héritent des champs d'audit standard :
   * `hotel_id INT NOT NULL`
   * `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
   * `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
   * `created_by INT NULL`
   * `updated_by INT NULL`
   * `deleted_at TIMESTAMP NULL DEFAULT NULL`
   * `deleted_by INT NULL DEFAULT NULL`
3. **Prise en charge de l'Internationalisation (i18n)** : Toutes les données financières comportent une indication explicite de la devise (`currency` de type ISO, ex: XOF, EUR, USD).
4. **Architecture Événementielle** : Chaque action critique publie des événements standardisés pour consommation asynchrone par des tiers (Comptabilité, Log, Audit).

---

## 2. Schéma de Base de Données Relationnelle (Version 3.0 Enrichie)

Toutes les relations de base de données sont définies avec intégrité de clé étrangère et indexation optimale pour les requêtes à forte volumétrie.

### 2.1. Indexation Stratégique Recommandée (Prisma / SQL)
Les tables clés intègrent des index composites ou individuels sur :
* `hotel_id` : Pour le partitionnement logique multi-locataire.
* `employee_id` et `employee_code` : Pour la recherche de fiches personnelles.
* `department_id`, `job_id`, `team_id` : Pour l'analyse de structure.
* `contract_id` et `status` : Pour le suivi de carrières.
* `month` / `year` / `payroll_month` : Pour l'accélération des clôtures de paie.

---

### 2.2. DDL SQL des Tables de Fondation & Évolutions

#### 1. Table `hrms_payroll_rules` (Internationalisation de la Paie)
Permet de paramétrer les cotisations locales, taux d'imposition et devises sans modifier une seule ligne de code.
```sql
CREATE TABLE hrms_payroll_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    country_code VARCHAR(3) NOT NULL, -- Ex: 'CI', 'SN', 'BF', 'MA', 'FR'
    default_currency VARCHAR(3) NOT NULL DEFAULT 'XOF',
    cnps_employee_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0550, -- Taux salarial CNPS (ex: 5.5%)
    cnps_employer_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0770, -- Taux patronal CNPS
    cnps_ceiling DECIMAL(12,2) NOT NULL DEFAULT 1200000.00, -- Plafond de cotisation
    salary_tax_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0120, -- Impôt général sur le revenu (taux de base)
    national_contribution_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0000, -- Contribution nationale
    effective_date DATE NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_by INT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by INT NULL DEFAULT NULL,
    INDEX idx_hotel_payroll_rules (hotel_id, country_code, active)
);
```

#### 2. Table `hrms_teams` (Gestion des Équipes Opérationnelles)
Regroupe les salariés en équipes (ex: Équipe A, B ou C pour le ménage ou le restaurant).
```sql
CREATE TABLE hrms_teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    department_id INT NOT NULL,
    name VARCHAR(100) NOT NULL, -- Ex: 'Equipe de Jour A', 'Brigade de Cuisine B'
    code VARCHAR(20) NOT NULL, -- Ex: 'EQ-HK-A'
    supervisor_id INT NULL, -- ID Employee superviseur de l'équipe
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_by INT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by INT NULL DEFAULT NULL,
    FOREIGN KEY (department_id) REFERENCES hrms_departments(id),
    INDEX idx_hotel_teams (hotel_id, department_id),
    UNIQUE KEY uq_hotel_team_code (hotel_id, code)
);
```

#### 3. Table `hrms_departments` (Centres de Coût)
```sql
CREATE TABLE hrms_departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL, -- Ex: 'REC', 'RES', 'HK', 'FIN'
    cost_center_code VARCHAR(30) NOT NULL, -- Code analytique pour l'imputation comptable
    manager_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_by INT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by INT NULL DEFAULT NULL,
    INDEX idx_hotel_dept (hotel_id, code),
    UNIQUE KEY uq_hotel_dep_code (hotel_id, code)
);
```

#### 4. Table `hrms_jobs` (Fiches de Postes)
```sql
CREATE TABLE hrms_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    department_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    salary_min DECIMAL(10,2),
    salary_max DECIMAL(10,2),
    hourly_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00, -- Coût horaire estimé du poste
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_by INT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by INT NULL DEFAULT NULL,
    FOREIGN KEY (department_id) REFERENCES hrms_departments(id),
    INDEX idx_hotel_jobs (hotel_id, department_id)
);
```

#### 5. Table `hrms_employees` (Registre Global avec Comptes Bancaires Multi-canaux)
```sql
CREATE TABLE hrms_employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    user_id INT NULL,
    department_id INT NOT NULL,
    job_id INT NOT NULL,
    team_id INT NULL, -- Équipe affectée
    employee_code VARCHAR(20) NOT NULL, -- Matricule (Ex: 'EMP-2026-001')
    employee_type VARCHAR(30) NOT NULL DEFAULT 'FULL_TIME', -- 'FULL_TIME', 'PART_TIME', 'EXTRA', 'SEASONAL', 'INTERN', 'CONSULTANT'
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    gender VARCHAR(10) NOT NULL, -- 'male', 'female', 'other'
    date_of_birth DATE NOT NULL,
    address TEXT,
    nationality VARCHAR(50) NOT NULL,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(30),
    hire_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'on_leave', 'terminated'
    cnps_number VARCHAR(50) NULL,
    -- Comptes Bancaires et Paiement Multi-canal
    payment_method VARCHAR(30) NOT NULL DEFAULT 'bank_transfer', -- 'bank_transfer', 'mobile_money', 'cash'
    bank_name VARCHAR(100) NULL,
    bank_account_number VARCHAR(100) NULL,
    bank_swift VARCHAR(20) NULL,
    bank_iban VARCHAR(40) NULL,
    mobile_money_provider VARCHAR(30) NULL, -- 'Orange Money', 'MTN MoMo', 'Wave'
    mobile_money_number VARCHAR(30) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_by INT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by INT NULL DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES hrms_departments(id),
    FOREIGN KEY (job_id) REFERENCES hrms_jobs(id),
    FOREIGN KEY (team_id) REFERENCES hrms_teams(id),
    INDEX idx_hotel_employees (hotel_id, department_id, team_id, status),
    UNIQUE KEY uq_hotel_emp_code (hotel_id, employee_code)
);
```

#### 6. Table `hrms_contracts` (Plusieurs contrats dans la carrière)
Chaque avenant, renouvellement ou promotion génère une nouvelle fiche de contrat fermée de manière chronologique.
```sql
CREATE TABLE hrms_contracts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    employee_id INT NOT NULL,
    contract_type VARCHAR(30) NOT NULL, -- 'CDI', 'CDD', 'EXTRA', 'INTERN', 'CONSULTANT'
    start_date DATE NOT NULL,
    end_date DATE NULL, -- Nul pour un CDI
    trial_period_end DATE NULL,
    base_salary DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'XOF', -- Devise du contrat
    social_security_opt_in BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) NOT NULL DEFAULT 'draft', -- 'draft', 'active', 'expired', 'superseded', 'terminated'
    signature_status VARCHAR(20) NOT NULL DEFAULT 'unsigned', -- 'unsigned', 'signed'
    signed_at TIMESTAMP NULL DEFAULT NULL,
    signed_by INT NULL DEFAULT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_by INT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by INT NULL DEFAULT NULL,
    FOREIGN KEY (employee_id) REFERENCES hrms_employees(id),
    INDEX idx_hotel_contracts (hotel_id, employee_id, status)
);
```

#### 7. Table `hrms_salary_history` (Suivi des Évolutions de Salaires)
```sql
CREATE TABLE hrms_salary_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    employee_id INT NOT NULL,
    contract_id INT NOT NULL,
    change_date DATE NOT NULL,
    old_salary DECIMAL(10,2) NOT NULL,
    new_salary DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'XOF',
    reason VARCHAR(255) NOT NULL, -- 'promotion', 'annual_indexation', 'contract_revision'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_by INT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by INT NULL DEFAULT NULL,
    FOREIGN KEY (employee_id) REFERENCES hrms_employees(id),
    FOREIGN KEY (contract_id) REFERENCES hrms_contracts(id),
    INDEX idx_emp_salary_history (hotel_id, employee_id)
);
```

#### 8. Table `hrms_bonus_types` & `hrms_employee_bonus` (Paramétrage des Primes)
```sql
CREATE TABLE hrms_bonus_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    name VARCHAR(100) NOT NULL, -- Ex: 'Prime de Transport', 'Prime de Logement', 'Prime d'Ancienneté'
    code VARCHAR(30) NOT NULL, -- Ex: 'BONUS_TRANS', 'BONUS_HOUSING', 'BONUS_SENIORITY'
    category VARCHAR(30) NOT NULL, -- 'allowance', 'bonus', 'overtime'
    default_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'XOF',
    is_taxable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_by INT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by INT NULL DEFAULT NULL,
    UNIQUE KEY uq_hotel_bonus_type (hotel_id, code)
);

CREATE TABLE hrms_employee_bonus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    employee_id INT NOT NULL,
    bonus_type_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'XOF',
    month INT NOT NULL,
    year INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'integrated_in_payroll'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES hrms_employees(id),
    FOREIGN KEY (bonus_type_id) REFERENCES hrms_bonus_types(id)
);
```

#### 9. Table `hrms_deduction_types` & `hrms_employee_deductions` (Retenues Variables)
```sql
CREATE TABLE hrms_deduction_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    name VARCHAR(100) NOT NULL, -- Ex: 'Retenue pour Absence', 'Casse Matériel', 'Pénalité Disciplinaire'
    code VARCHAR(30) NOT NULL, -- Ex: 'DEDUCT_ABS', 'DEDUCT_DAMAGE', 'DEDUCT_DISC'
    default_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'XOF',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_by INT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by INT NULL DEFAULT NULL,
    UNIQUE KEY uq_hotel_ded_type (hotel_id, code)
);

CREATE TABLE hrms_employee_deductions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    employee_id INT NOT NULL,
    deduction_type_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'XOF',
    month INT NOT NULL,
    year INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'applied'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES hrms_employees(id),
    FOREIGN KEY (deduction_type_id) REFERENCES hrms_deduction_types(id)
);
```

#### 10. Table `hrms_employee_loans` (Prêts Employés Long-Terme)
À différencier explicitement des avances mensuelles à court terme.
```sql
CREATE TABLE hrms_employee_loans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    employee_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    monthly_installment DECIMAL(10,2) NOT NULL,
    remaining_balance DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'XOF',
    duration_months INT NOT NULL,
    start_month INT NOT NULL,
    start_year INT NOT NULL,
    status VARCHAR(25) NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'repaid', 'cancelled'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_by INT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by INT NULL DEFAULT NULL,
    FOREIGN KEY (employee_id) REFERENCES hrms_employees(id),
    INDEX idx_hotel_loans (hotel_id, employee_id, status)
);
```

#### 11. Table `hrms_holidays` (Référentiel des Jours Fériés de l'Hôtel)
```sql
CREATE TABLE hrms_holidays (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    date DATE NOT NULL,
    name VARCHAR(100) NOT NULL, -- Ex: 'Fête de l'Indépendance', 'Tabaski'
    is_recurring BOOLEAN DEFAULT TRUE, -- Se répète d'année en année
    overtime_rate DECIMAL(5,4) NOT NULL DEFAULT 2.0000, -- Majoration de salaire (ex: 200%)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NULL,
    updated_by INT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by INT NULL DEFAULT NULL,
    UNIQUE KEY uq_hotel_holiday_date (hotel_id, date)
);
```

---

## 3. Interfaces de Services Métiers Définies (IHRMService)

Pour assurer l'autonomie et l'isolation du module, nous déclarons les contrats d'interface TypeScript à implémenter.

### 3.1. `IEmployeeService`
```typescript
interface IEmployeeService {
  createEmployee(hotelId: number, data: CreateEmployeeDTO): Promise<Employee>;
  updateEmployee(hotelId: number, employeeId: number, data: UpdateEmployeeDTO): Promise<Employee>;
  terminateEmployee(hotelId: number, employeeId: number, date: Date, reason: string): Promise<void>;
  getEmployeeProfile(hotelId: number, employeeId: number): Promise<EmployeeDetailedProfile>;
  listEmployees(hotelId: number, filters: EmployeeFilters): Promise<Employee[]>;
}
```

### 3.2. `IPayrollService`
```typescript
interface IPayrollService {
  calculateMonthlyPayroll(hotelId: number, month: number, year: number): Promise<PayrollRunSummary>;
  validatePayrollRun(hotelId: number, payrollRunId: string): Promise<void>;
  generatePayslipPDF(hotelId: number, payslipId: number): Promise<string>;
  getSalaryHistory(hotelId: number, employeeId: number): Promise<SalaryHistoryRecord[]>;
}
```

---

## 4. Architecture Événementielle (Business Events)

Toutes les actions majeures émettent des messages typés via un courtier interne. 

### Événements Définis
* `EmployeeCreated` : Émis à la création d'un dossier. Provoque la création asynchrone des checklists d'Onboarding.
* `ContractSigned` : Émis lors de la signature d'un nouveau contrat. Valide la mise à jour du salaire.
* `PayrollGenerated` : Émis lors de la clôture des paies mensuelles. Envoie une requête au module Comptabilité (`registerPayrollExpense`).
* `SalaryAdvanceApproved` : Émis lors de la validation d'une avance. Prépare le décaissement en banque/Wave.
* `LeaveApproved` : Émis à l'approbation d'un congé. Bloque le planning de l'employé sur cette période.

---

## 5. Matrice de Route de Sprints Révisée

* **SPRINT 1 : FONDATION RH** (Actuel) :
  * Création des départements (Cost Centers), Jobs, fiches salariés, équipes (`hrms_teams`).
  * Système complet de contrats multiples (Historisation active), Skills & Compétences.
  * Coffre-fort de documents et checklists d'Onboarding.
  * Dashboard de contrôle et d'activité interactive (Simulation des évènements et signatures).
* **SPRINT 2** : Horodatage, Remplacements de Shifts, Congés & Workflows.
* **SPRINT 3** : Moteur de Paie, Avances de fonds, Prêts, Impôts i18n & Primes.
* **SPRINT 4** : Uniformes, Formations HACCP, Inventaire de matériel (Assets) & Notation de Performance.
* **SPRINT 5** : ATS complet (Recrutement 10 étapes) & Statistiques Analytiques RH.

---
**Fin du document - 36_HRMS_ARCHITECTURE.md (Version 3.0 Enterprise)**
