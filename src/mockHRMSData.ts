import { 
  IHRMSDepartment, 
  IHRMSJob, 
  IHRMSTeam, 
  IHRMSEmployee, 
  IHRMSContract, 
  IHRMSSkill, 
  IHRMSEmployeeSkill, 
  IHRMSDocument, 
  IHRMSOnboardingTask, 
  IHRMSBusinessEvent,
  IHRMSPayrollRule
} from './types';

// Multi-tenant Reference Hotel ID
export const CURRENT_HOTEL_ID = 1;

// 1. Departments / cost centers
export const initialHRMSDepartments: IHRMSDepartment[] = [
  {
    id: 'dept-1',
    hotel_id: CURRENT_HOTEL_ID,
    name: 'Réception & Front Office',
    code: 'REC',
    cost_center_code: 'CC-REC-100',
    manager_id: 'emp-1',
    created_at: '2025-01-10T08:00:00Z'
  },
  {
    id: 'dept-2',
    hotel_id: CURRENT_HOTEL_ID,
    name: 'Housekeeping & Propreté',
    code: 'HK',
    cost_center_code: 'CC-HK-200',
    manager_id: 'emp-2',
    created_at: '2025-01-10T08:00:00Z'
  },
  {
    id: 'dept-3',
    hotel_id: CURRENT_HOTEL_ID,
    name: 'Restauration & Cuisine',
    code: 'REST',
    cost_center_code: 'CC-REST-300',
    manager_id: 'emp-3',
    created_at: '2025-01-10T08:00:00Z'
  },
  {
    id: 'dept-4',
    hotel_id: CURRENT_HOTEL_ID,
    name: 'Finance & Administration',
    code: 'FIN',
    cost_center_code: 'CC-FIN-400',
    manager_id: 'emp-4',
    created_at: '2025-01-10T08:00:00Z'
  },
  {
    id: 'dept-5',
    hotel_id: CURRENT_HOTEL_ID,
    name: 'Technique & Maintenance',
    code: 'TECH',
    cost_center_code: 'CC-TECH-500',
    manager_id: 'emp-5',
    created_at: '2025-01-10T08:00:00Z'
  }
];

// 2. Teams
export const initialHRMSTeams: IHRMSTeam[] = [
  {
    id: 'team-1',
    hotel_id: CURRENT_HOTEL_ID,
    department_id: 'dept-2',
    name: 'Équipe Matin Propreté A',
    code: 'EQ-HK-A',
    supervisor_id: 'emp-2',
    created_at: '2025-01-15T08:00:00Z'
  },
  {
    id: 'team-2',
    hotel_id: CURRENT_HOTEL_ID,
    department_id: 'dept-2',
    name: 'Équipe Soir Propreté B',
    code: 'EQ-HK-B',
    created_at: '2025-01-15T08:00:00Z'
  },
  {
    id: 'team-3',
    hotel_id: CURRENT_HOTEL_ID,
    department_id: 'dept-3',
    name: 'Brigade Cuisine de Jour',
    code: 'EQ-REST-A',
    supervisor_id: 'emp-3',
    created_at: '2025-01-15T08:00:00Z'
  }
];

// 3. Jobs
export const initialHRMSJobs: IHRMSJob[] = [
  {
    id: 'job-1',
    hotel_id: CURRENT_HOTEL_ID,
    department_id: 'dept-1',
    title: 'Réceptionniste de Jour',
    description: 'Accueil des clients, check-in, check-out et facturation au comptoir.',
    salary_min: 180000,
    salary_max: 280000,
    hourly_cost: 1200,
    created_at: '2025-01-12T08:00:00Z'
  },
  {
    id: 'job-2',
    hotel_id: CURRENT_HOTEL_ID,
    department_id: 'dept-2',
    title: 'Gouvernante de Chambre',
    description: 'Nettoyage, désinfection, remise en état et approvisionnement des chambres.',
    salary_min: 150000,
    salary_max: 220000,
    hourly_cost: 1000,
    created_at: '2025-01-12T08:00:00Z'
  },
  {
    id: 'job-3',
    hotel_id: CURRENT_HOTEL_ID,
    department_id: 'dept-3',
    title: 'Chef de Partie Cuisine',
    description: 'Préparation et gestion des plats froids/chauds pour le brunch et le resto VIP.',
    salary_min: 250000,
    salary_max: 450000,
    hourly_cost: 2000,
    created_at: '2025-01-12T08:00:00Z'
  },
  {
    id: 'job-4',
    hotel_id: CURRENT_HOTEL_ID,
    department_id: 'dept-4',
    title: 'Responsable Comptable & RH',
    description: 'Suivi de la facturation hôtelière générale, paie mensuelle et déclarations.',
    salary_min: 350000,
    salary_max: 600000,
    hourly_cost: 3000,
    created_at: '2025-01-12T08:00:00Z'
  },
  {
    id: 'job-5',
    hotel_id: CURRENT_HOTEL_ID,
    department_id: 'dept-5',
    title: 'Technicien de Maintenance Senior',
    description: 'Maintenance préventive et corrective de la plomberie, de la climatisation et de l\'électricité.',
    salary_min: 220000,
    salary_max: 350000,
    hourly_cost: 1600,
    created_at: '2025-01-12T08:00:00Z'
  }
];

// 4. Global Skills Catalog
export const initialHRMSSkills: IHRMSSkill[] = [
  {
    id: 'skill-1',
    hotel_id: CURRENT_HOTEL_ID,
    name: 'Anglais Courant / Anglais Hôtelier',
    category: 'languages',
    description: 'Capacité à mener une conversation fluide d\'accueil et de service client en anglais.'
  },
  {
    id: 'skill-2',
    hotel_id: CURRENT_HOTEL_ID,
    name: 'Certification HACCP Hygiène de Table',
    category: 'technical_haccp',
    description: 'Maîtrise absolue des contrôles de température, de stockage et d\'hygiène alimentaire ouest-africaine.'
  },
  {
    id: 'skill-3',
    hotel_id: CURRENT_HOTEL_ID,
    name: 'Secourisme & Évacuation Incendie',
    category: 'safety',
    description: 'Aptitude SST (Sauveteur Secouriste du Travail) et habilitation maniement d\'extincteurs.'
  },
  {
    id: 'skill-4',
    hotel_id: CURRENT_HOTEL_ID,
    name: 'Maitrise de Nucleus PMS Core v3.0',
    category: 'soft_skills',
    description: 'Expertise dans l\'usage quotidien du logiciel : attributions de chambres, rapports, facturation.'
  }
];

// 5. Employees Register
export const initialHRMSEmployees: IHRMSEmployee[] = [
  {
    id: 'emp-1',
    hotel_id: CURRENT_HOTEL_ID,
    user_id: '1',
    department_id: 'dept-1',
    job_id: 'job-1',
    employee_code: 'EMP-2025-001',
    employee_type: 'FULL_TIME',
    first_name: 'Koffi',
    last_name: 'Yao',
    email: 'koffi.yao@brunchbouake.ci',
    phone: '+225 07 48 29 10 99',
    gender: 'M',
    date_of_birth: '1992-05-14',
    address: 'Quartier Kennedy, Bouaké, Côte d\'Ivoire',
    nationality: 'Ivoirienne',
    emergency_contact_name: 'Yao Amenan (Épouse)',
    emergency_contact_phone: '+225 05 12 34 56 78',
    hire_date: '2025-01-15',
    status: 'active',
    cnps_number: 'CNPS-CI-9928102-Y',
    payment_method: 'bank_transfer',
    bank_name: 'SGCI (Société Générale Côte d\'Ivoire)',
    bank_account_number: 'CI083 01234 56789012345 67',
    bank_swift: 'SGCIABCIXX',
    bank_iban: 'CI83SGCI012345678901234567',
    created_at: '2025-01-14T10:00:00Z',
    updated_at: '2025-01-14T10:00:00Z'
  },
  {
    id: 'emp-2',
    hotel_id: CURRENT_HOTEL_ID,
    department_id: 'dept-2',
    job_id: 'job-2',
    team_id: 'team-1',
    employee_code: 'EMP-2025-002',
    employee_type: 'FULL_TIME',
    first_name: 'Mariam',
    last_name: 'Bamba',
    email: 'mariam.bamba@brunchbouake.ci',
    phone: '+225 01 02 88 11 22',
    gender: 'F',
    date_of_birth: '1995-09-22',
    address: 'Quartier Nimbo, Bouaké, Côte d\'Ivoire',
    nationality: 'Ivoirienne',
    emergency_contact_name: 'Bamba Lamine (Frère)',
    emergency_contact_phone: '+225 07 99 88 77 66',
    hire_date: '2025-02-01',
    status: 'active',
    cnps_number: 'CNPS-CI-8820193-M',
    payment_method: 'mobile_money',
    mobile_money_provider: 'Wave',
    mobile_money_number: '+225 01 02 88 11 22',
    created_at: '2025-01-30T10:00:00Z',
    updated_at: '2025-01-30T10:00:00Z'
  },
  {
    id: 'emp-3',
    hotel_id: CURRENT_HOTEL_ID,
    department_id: 'dept-3',
    job_id: 'job-3',
    team_id: 'team-3',
    employee_code: 'EMP-2025-003',
    employee_type: 'FULL_TIME',
    first_name: 'Seydou',
    last_name: 'Coulibaly',
    email: 'seydou.coulibaly@brunchbouake.ci',
    phone: '+225 05 55 44 33 22',
    gender: 'M',
    date_of_birth: '1988-11-03',
    address: 'Quartier Broukro, Bouaké, Côte d\'Ivoire',
    nationality: 'Malienne',
    emergency_contact_name: 'Coulibaly Fatoumata (Sœur)',
    emergency_contact_phone: '+223 76 54 32 10',
    hire_date: '2025-02-15',
    status: 'active',
    cnps_number: 'CNPS-CI-7738291-C',
    payment_method: 'bank_transfer',
    bank_name: 'NSIA Banque CI',
    bank_account_number: 'CI042 12345 67890123456 78',
    bank_swift: 'NSIACIBJXX',
    bank_iban: 'CI42NSIA123456789012345678',
    created_at: '2025-02-14T10:00:00Z',
    updated_at: '2025-02-14T10:00:00Z'
  },
  {
    id: 'emp-4',
    hotel_id: CURRENT_HOTEL_ID,
    department_id: 'dept-4',
    job_id: 'job-4',
    employee_code: 'EMP-2025-004',
    employee_type: 'FULL_TIME',
    first_name: 'Awa',
    last_name: 'Diallo',
    email: 'awa.diallo@brunchbouake.ci',
    phone: '+225 07 77 66 55 44',
    gender: 'F',
    date_of_birth: '1990-03-30',
    address: 'Quartier Gonfreville, Bouaké, Côte d\'Ivoire',
    nationality: 'Guinéenne',
    emergency_contact_name: 'Diallo Alpha (Père)',
    emergency_contact_phone: '+224 622 11 22 33',
    hire_date: '2025-01-01',
    status: 'active',
    cnps_number: 'CNPS-CI-6638201-D',
    payment_method: 'bank_transfer',
    bank_name: 'Ecobank Côte d\'Ivoire',
    bank_account_number: 'CI059 98765 43210987654 32',
    bank_swift: 'ECOBCIABXX',
    bank_iban: 'CI59ECOB987654321098765432',
    created_at: '2024-12-28T10:00:00Z',
    updated_at: '2024-12-28T10:00:00Z'
  },
  {
    id: 'emp-5',
    hotel_id: CURRENT_HOTEL_ID,
    department_id: 'dept-5',
    job_id: 'job-5',
    employee_code: 'EMP-2025-005',
    employee_type: 'EXTRA',
    first_name: 'Hassan',
    last_name: 'Kaboré',
    email: 'hassan.kabore@external.ci',
    phone: '+225 05 99 00 11 22',
    gender: 'M',
    date_of_birth: '1996-07-07',
    address: 'Quartier Air France, Bouaké, Côte d\'Ivoire',
    nationality: 'Burkinabè',
    emergency_contact_name: 'Kaboré Inoussa (Oncle)',
    emergency_contact_phone: '+226 70 12 34 56',
    hire_date: '2025-03-01',
    status: 'active',
    payment_method: 'mobile_money',
    mobile_money_provider: 'Orange Money',
    mobile_money_number: '+225 05 99 00 11 22',
    created_at: '2025-02-28T10:00:00Z',
    updated_at: '2025-02-28T10:00:00Z'
  }
];

// 6. Contracts history (multiple contracts per career)
export const initialHRMSContracts: IHRMSContract[] = [
  // Emp 1 : Koffi Yao (Started with standard CDD, then upgraded to CDI)
  {
    id: 'cont-1-old',
    hotel_id: CURRENT_HOTEL_ID,
    employee_id: 'emp-1',
    contract_type: 'CDD',
    start_date: '2025-01-15',
    end_date: '2025-07-14',
    base_salary: 200000,
    currency: 'XOF',
    social_security_opt_in: true,
    status: 'superseded',
    signature_status: 'signed',
    signed_at: '2025-01-15T09:00:00Z',
    notes: 'Contrat d\'essai initial de 6 mois.',
    created_at: '2025-01-14T10:00:00Z'
  },
  {
    id: 'cont-1-new',
    hotel_id: CURRENT_HOTEL_ID,
    employee_id: 'emp-1',
    contract_type: 'CDI',
    start_date: '2025-07-15',
    base_salary: 260000, // Augmented salary!
    currency: 'XOF',
    social_security_opt_in: true,
    status: 'active',
    signature_status: 'signed',
    signed_at: '2025-07-14T15:30:00Z',
    notes: 'Période d\'essai concluante, passage en CDI avec augmentation de salaire négociée.',
    created_at: '2025-07-14T15:00:00Z'
  },
  
  // Emp 2 : Mariam Bamba
  {
    id: 'cont-2',
    hotel_id: CURRENT_HOTEL_ID,
    employee_id: 'emp-2',
    contract_type: 'CDI',
    start_date: '2025-02-01',
    base_salary: 195000,
    currency: 'XOF',
    social_security_opt_in: true,
    status: 'active',
    signature_status: 'signed',
    signed_at: '2025-02-01T08:30:00Z',
    notes: 'Contrat d\'embauche d\'origine.',
    created_at: '2025-01-30T10:00:00Z'
  },

  // Emp 3 : Seydou Coulibaly
  {
    id: 'cont-3',
    hotel_id: CURRENT_HOTEL_ID,
    employee_id: 'emp-3',
    contract_type: 'CDI',
    start_date: '2025-02-15',
    base_salary: 320000,
    currency: 'XOF',
    social_security_opt_in: true,
    status: 'active',
    signature_status: 'signed',
    signed_at: '2025-02-14T11:00:00Z',
    notes: 'Chef de partie recruté avec engagement immédiat en CDI.',
    created_at: '2025-02-14T10:00:00Z'
  },

  // Emp 4 : Awa Diallo (Paid in Euro equivalent for international corporate structure)
  {
    id: 'cont-4',
    hotel_id: CURRENT_HOTEL_ID,
    employee_id: 'emp-4',
    contract_type: 'CDI',
    start_date: '2025-01-01',
    base_salary: 800, // Euro currency
    currency: 'EUR',
    social_security_opt_in: true,
    status: 'active',
    signature_status: 'signed',
    signed_at: '2024-12-30T09:00:00Z',
    notes: 'Responsable financière rattachée.',
    created_at: '2024-12-28T10:00:00Z'
  },

  // Emp 5 : Hassan Kaboré (Extra / Freelance contract)
  {
    id: 'cont-5',
    hotel_id: CURRENT_HOTEL_ID,
    employee_id: 'emp-5',
    contract_type: 'EXTRA',
    start_date: '2025-03-01',
    base_salary: 12000, // Pay per daily shift
    currency: 'XOF',
    social_security_opt_in: false,
    status: 'active',
    signature_status: 'unsigned',
    notes: 'Contrat d\'extra renouvelable à la tâche journalière.',
    created_at: '2025-02-28T10:00:00Z'
  }
];

// 7. Employee Skills matching
export const initialHRMSEmployeeSkills: IHRMSEmployeeSkill[] = [
  {
    id: 'es-1',
    hotel_id: CURRENT_HOTEL_ID,
    employee_id: 'emp-1',
    skill_id: 'skill-1',
    level: 'advanced',
    obtained_date: '2023-06-12'
  },
  {
    id: 'es-2',
    hotel_id: CURRENT_HOTEL_ID,
    employee_id: 'emp-1',
    skill_id: 'skill-4',
    level: 'expert',
    obtained_date: '2025-01-18'
  },
  {
    id: 'es-3',
    hotel_id: CURRENT_HOTEL_ID,
    employee_id: 'emp-3',
    skill_id: 'skill-2',
    level: 'expert',
    obtained_date: '2024-04-10',
    expiration_date: '2027-04-10'
  },
  {
    id: 'es-4',
    hotel_id: CURRENT_HOTEL_ID,
    employee_id: 'emp-5',
    skill_id: 'skill-3',
    level: 'intermediate',
    obtained_date: '2024-11-20'
  }
];

// 8. Documents
export const initialHRMSDocuments: IHRMSDocument[] = [
  {
    id: 'doc-1',
    hotel_id: CURRENT_HOTEL_ID,
    employee_id: 'emp-1',
    document_type: 'id_card',
    file_name: 'CNI_Koffi_Yao.pdf',
    file_path: '/uploads/hrms/docs/CNI_Koffi_Yao.pdf',
    file_size: 1450200,
    mime_type: 'application/pdf',
    uploaded_at: '2025-01-14T11:20:00Z',
    uploaded_by: '1'
  },
  {
    id: 'doc-2',
    hotel_id: CURRENT_HOTEL_ID,
    employee_id: 'emp-1',
    document_type: 'contract',
    file_name: 'Contrat_CDI_Koffi_Yao_Signe.pdf',
    file_path: '/uploads/hrms/docs/Contrat_CDI_Koffi_Yao_Signe.pdf',
    file_size: 2450000,
    mime_type: 'application/pdf',
    uploaded_at: '2025-07-14T16:00:00Z',
    uploaded_by: '1'
  },
  {
    id: 'doc-3',
    hotel_id: CURRENT_HOTEL_ID,
    employee_id: 'emp-3',
    document_type: 'diploma',
    file_name: 'CAP_Cuisine_Seydou_Coulibaly.pdf',
    file_path: '/uploads/hrms/docs/CAP_Cuisine_Seydou_Coulibaly.pdf',
    file_size: 890000,
    mime_type: 'application/pdf',
    uploaded_at: '2025-02-14T14:30:00Z',
    uploaded_by: '1'
  }
];

// 9. Onboarding checklists
export const initialHRMSOnboardingTasks: IHRMSOnboardingTask[] = [
  // Emp 1
  {
    id: 'onb-1-1',
    hotel_id: CURRENT_HOTEL_ID,
    employee_id: 'emp-1',
    task_name: 'Créer l\'adresse e-mail professionnelle',
    assigned_to: '1',
    status: 'completed',
    completed_at: '2025-01-14T12:00:00Z',
    completed_by: '1'
  },
  {
    id: 'onb-1-2',
    hotel_id: CURRENT_HOTEL_ID,
    employee_id: 'emp-1',
    task_name: 'Attribuer le badge d\'accès Réception',
    assigned_to: '1',
    status: 'completed',
    completed_at: '2025-01-15T08:00:00Z',
    completed_by: '1'
  },
  {
    id: 'onb-1-3',
    hotel_id: CURRENT_HOTEL_ID,
    employee_id: 'emp-1',
    task_name: 'Livrer 2 vestes et badges de nom corporatif',
    assigned_to: '1',
    status: 'completed',
    completed_at: '2025-01-15T08:15:00Z',
    completed_by: '1'
  },
  
  // Emp 5 : Hassan Kaboré (Slightly pending checklist)
  {
    id: 'onb-5-1',
    hotel_id: CURRENT_HOTEL_ID,
    employee_id: 'emp-5',
    task_name: 'Livrer le polo de sécurité de l\'hôtel',
    assigned_to: 'emp-4',
    status: 'completed',
    completed_at: '2025-03-01T08:00:00Z',
    completed_by: 'emp-4'
  },
  {
    id: 'onb-5-2',
    hotel_id: CURRENT_HOTEL_ID,
    employee_id: 'emp-5',
    task_name: 'Signature de la décharge d\'équipements techniques',
    assigned_to: 'emp-4',
    status: 'pending'
  }
];

// 10. Live Activity Business Events Log
export const initialHRMSEvents: IHRMSBusinessEvent[] = [
  {
    id: 'evt-1',
    hotel_id: CURRENT_HOTEL_ID,
    timestamp: '2025-01-01T09:00:00Z',
    event_type: 'EmployeeCreated',
    actor_name: 'System Root',
    description: 'Fiche employée initialisée pour Awa Diallo (Responsable RH & Comptable).',
    payload: { employee_id: 'emp-4' }
  },
  {
    id: 'evt-2',
    hotel_id: CURRENT_HOTEL_ID,
    timestamp: '2025-01-01T09:05:00Z',
    event_type: 'ContractSigned',
    actor_name: 'Awa Diallo',
    description: 'Contrat d\'embauche CDI signé électroniquement par Awa Diallo. Rémunération : 800 EUR.',
    payload: { contract_id: 'cont-4' }
  },
  {
    id: 'evt-3',
    hotel_id: CURRENT_HOTEL_ID,
    timestamp: '2025-01-14T10:00:00Z',
    event_type: 'EmployeeCreated',
    actor_name: 'Awa Diallo',
    description: 'Nouveau collaborateur Koffi Yao enregistré dans la base des effectifs.',
    payload: { employee_id: 'emp-1' }
  },
  {
    id: 'evt-4',
    hotel_id: CURRENT_HOTEL_ID,
    timestamp: '2025-07-14T15:30:00Z',
    event_type: 'ContractSigned',
    actor_name: 'Amadou Koné',
    description: 'Contrat d\'évolution de carrière CDI signé par Koffi Yao. Revalorisation à 260 000 XOF.',
    payload: { contract_id: 'cont-1-new' }
  }
];

// 11. Initial Payroll Rules for i18n
export const initialHRMSPayrollRules: IHRMSPayrollRule[] = [
  {
    id: 'rule-ci',
    hotel_id: CURRENT_HOTEL_ID,
    country_code: 'CI', // Côte d'Ivoire
    default_currency: 'XOF',
    cnps_employee_rate: 0.0550, // 5.5%
    cnps_employer_rate: 0.0770, // 7.7%
    cnps_ceiling: 1200000,
    salary_tax_rate: 0.0120, // 1.2%
    national_contribution_rate: 0.0150, // 1.5%
    effective_date: '2025-01-01',
    active: true
  }
];
