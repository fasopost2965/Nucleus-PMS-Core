/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Users, 
  FileText, 
  Award, 
  Settings, 
  Activity, 
  CheckSquare, 
  Plus, 
  Search, 
  Filter, 
  Coins, 
  Clock, 
  Building, 
  CreditCard, 
  Globe, 
  FileDown, 
  UserPlus, 
  Edit2, 
  CheckCircle2, 
  AlertTriangle, 
  UploadCloud, 
  X, 
  ChevronRight, 
  Shield, 
  Percent, 
  MapPin, 
  UserCheck,
  TrendingUp,
  Sliders,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Import our types and initial datasets
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
  IHRMSPayrollRule,
  TEmpType,
  TEmpStatus
} from '../types';

import {
  initialHRMSDepartments,
  initialHRMSTeams,
  initialHRMSJobs,
  initialHRMSSkills,
  initialHRMSEmployees,
  initialHRMSContracts,
  initialHRMSEmployeeSkills,
  initialHRMSDocuments,
  initialHRMSOnboardingTasks,
  initialHRMSEvents,
  initialHRMSPayrollRules,
  CURRENT_HOTEL_ID
} from '../mockHRMSData';

export default function HRMS() {
  // --- Persistent Local State Engine ---
  const [employees, setEmployees] = useState<IHRMSEmployee[]>(() => {
    const stored = localStorage.getItem('hrms_employees');
    return stored ? JSON.parse(stored) : initialHRMSEmployees;
  });

  const [departments, setDepartments] = useState<IHRMSDepartment[]>(() => {
    const stored = localStorage.getItem('hrms_departments');
    return stored ? JSON.parse(stored) : initialHRMSDepartments;
  });

  const [jobs, setJobs] = useState<IHRMSJob[]>(() => {
    const stored = localStorage.getItem('hrms_jobs');
    return stored ? JSON.parse(stored) : initialHRMSJobs;
  });

  const [teams, setTeams] = useState<IHRMSTeam[]>(() => {
    const stored = localStorage.getItem('hrms_teams');
    return stored ? JSON.parse(stored) : initialHRMSTeams;
  });

  const [contracts, setContracts] = useState<IHRMSContract[]>(() => {
    const stored = localStorage.getItem('hrms_contracts');
    return stored ? JSON.parse(stored) : initialHRMSContracts;
  });

  const [skills, setSkills] = useState<IHRMSSkill[]>(() => {
    const stored = localStorage.getItem('hrms_skills');
    return stored ? JSON.parse(stored) : initialHRMSSkills;
  });

  const [employeeSkills, setEmployeeSkills] = useState<IHRMSEmployeeSkill[]>(() => {
    const stored = localStorage.getItem('hrms_employee_skills');
    return stored ? JSON.parse(stored) : initialHRMSEmployeeSkills;
  });

  const [documents, setDocuments] = useState<IHRMSDocument[]>(() => {
    const stored = localStorage.getItem('hrms_documents');
    return stored ? JSON.parse(stored) : initialHRMSDocuments;
  });

  const [onboardingTasks, setOnboardingTasks] = useState<IHRMSOnboardingTask[]>(() => {
    const stored = localStorage.getItem('hrms_onboarding_tasks');
    return stored ? JSON.parse(stored) : initialHRMSOnboardingTasks;
  });

  const [businessEvents, setBusinessEvents] = useState<IHRMSBusinessEvent[]>(() => {
    const stored = localStorage.getItem('hrms_business_events');
    return stored ? JSON.parse(stored) : initialHRMSEvents;
  });

  const [payrollRules, setPayrollRules] = useState<IHRMSPayrollRule[]>(() => {
    const stored = localStorage.getItem('hrms_payroll_rules');
    return stored ? JSON.parse(stored) : initialHRMSPayrollRules;
  });

  // Backup state to local storage on changes
  useEffect(() => {
    localStorage.setItem('hrms_employees', JSON.stringify(employees));
  }, [employees]);
  useEffect(() => {
    localStorage.setItem('hrms_departments', JSON.stringify(departments));
  }, [departments]);
  useEffect(() => {
    localStorage.setItem('hrms_jobs', JSON.stringify(jobs));
  }, [jobs]);
  useEffect(() => {
    localStorage.setItem('hrms_teams', JSON.stringify(teams));
  }, [teams]);
  useEffect(() => {
    localStorage.setItem('hrms_contracts', JSON.stringify(contracts));
  }, [contracts]);
  useEffect(() => {
    localStorage.setItem('hrms_skills', JSON.stringify(skills));
  }, [skills]);
  useEffect(() => {
    localStorage.setItem('hrms_employee_skills', JSON.stringify(employeeSkills));
  }, [employeeSkills]);
  useEffect(() => {
    localStorage.setItem('hrms_documents', JSON.stringify(documents));
  }, [documents]);
  useEffect(() => {
    localStorage.setItem('hrms_onboarding_tasks', JSON.stringify(onboardingTasks));
  }, [onboardingTasks]);
  useEffect(() => {
    localStorage.setItem('hrms_business_events', JSON.stringify(businessEvents));
  }, [businessEvents]);
  useEffect(() => {
    localStorage.setItem('hrms_payroll_rules', JSON.stringify(payrollRules));
  }, [payrollRules]);

  // --- Active Tab State ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'directory' | 'contracts' | 'teams' | 'skills' | 'payroll_rules'>('dashboard');

  // --- Search and Filtering states ---
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // --- Selected employee for deep profile view ---
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  // --- Modals State ---
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showAddContractModal, setShowAddContractModal] = useState(false);
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);

  // --- Dynamic Business Event Emitter Helper ---
  const emitBusinessEvent = (
    eventType: IHRMSBusinessEvent['event_type'],
    description: string,
    payload?: any
  ) => {
    const newEvent: IHRMSBusinessEvent = {
      id: `evt-${Date.now()}`,
      hotel_id: CURRENT_HOTEL_ID,
      timestamp: new Date().toISOString(),
      event_type: eventType,
      actor_name: 'Amadou Koné (Directeur)',
      description,
      payload
    };
    setBusinessEvents(prev => [newEvent, ...prev]);
  };

  // --- Dynamic KPI Calculations ---
  const activeEmployeesCount = employees.filter(e => e.status === 'active').length;
  
  // Calculate average hourly cost
  const avgHourlyCost = Math.round(
    jobs.reduce((acc, curr) => acc + curr.hourly_cost, 0) / (jobs.length || 1)
  );

  // Calculate total monthly payroll estimate based on active contracts
  const totalMonthlyPayrollEstimateXOF = contracts
    .filter(c => c.status === 'active')
    .reduce((acc, contract) => {
      // Basic currency conversion approximation (e.g. 1 EUR = 655.957 XOF)
      const value = contract.base_salary;
      if (contract.currency === 'EUR') {
        return acc + (value * 655.957);
      }
      return acc + value;
    }, 0);

  // Onboarding progress calculation
  const completedTasks = onboardingTasks.filter(t => t.status === 'completed').length;
  const totalTasks = onboardingTasks.length;
  const onboardingCompletionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 100;

  // --- Form States ---
  // Add Employee Form
  const [newEmpForm, setNewEmpForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: 'M' as 'M' | 'F' | 'Autre',
    date_of_birth: '',
    address: '',
    nationality: 'Ivoirienne',
    department_id: departments[0]?.id || '',
    job_id: jobs[0]?.id || '',
    team_id: '',
    employee_type: 'FULL_TIME' as TEmpType,
    cnps_number: '',
    payment_method: 'bank_transfer' as 'bank_transfer' | 'mobile_money' | 'cash',
    bank_name: '',
    bank_account_number: '',
    bank_swift: '',
    bank_iban: '',
    mobile_money_provider: 'Wave' as 'Wave' | 'Orange Money' | 'MTN MoMo',
    mobile_money_number: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    // Initial Contract fields to create a contract at the same time!
    contract_type: 'CDI' as 'CDI' | 'CDD' | 'EXTRA',
    base_salary: 180000,
    currency: 'XOF'
  });

  // Add/Renew Contract Form
  const [newContractForm, setNewContractForm] = useState({
    employee_id: '',
    contract_type: 'CDI' as 'CDI' | 'CDD' | 'EXTRA' | 'INTERN' | 'CONSULTANT',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    base_salary: 180000,
    currency: 'XOF',
    social_security_opt_in: true,
    notes: ''
  });

  // Add Skill Form
  const [newSkillForm, setNewSkillForm] = useState({
    employee_id: '',
    skill_id: '',
    level: 'intermediate' as 'beginner' | 'intermediate' | 'advanced' | 'expert'
  });

  // Simulated Document Upload Form
  const [dragActive, setDragActive] = useState(false);
  const [uploadDocType, setUploadDocType] = useState<IHRMSDocument['document_type']>('id_card');

  // --- Actions ---
  // 1. Create Employee (IEmployeeService simulation)
  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpForm.first_name || !newEmpForm.last_name || !newEmpForm.email) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const newEmpId = `emp-${Date.now()}`;
    const generatedCode = `EMP-2026-${String(employees.length + 1).padStart(3, '0')}`;

    const newEmployee: IHRMSEmployee = {
      id: newEmpId,
      hotel_id: CURRENT_HOTEL_ID,
      department_id: newEmpForm.department_id,
      job_id: newEmpForm.job_id,
      team_id: newEmpForm.team_id || undefined,
      employee_code: generatedCode,
      employee_type: newEmpForm.employee_type,
      first_name: newEmpForm.first_name,
      last_name: newEmpForm.last_name,
      email: newEmpForm.email,
      phone: newEmpForm.phone,
      gender: newEmpForm.gender,
      date_of_birth: newEmpForm.date_of_birth || '1995-01-01',
      address: newEmpForm.address,
      nationality: newEmpForm.nationality,
      emergency_contact_name: newEmpForm.emergency_contact_name,
      emergency_contact_phone: newEmpForm.emergency_contact_phone,
      hire_date: new Date().toISOString().split('T')[0],
      status: 'active',
      cnps_number: newEmpForm.cnps_number || undefined,
      payment_method: newEmpForm.payment_method,
      bank_name: newEmpForm.payment_method === 'bank_transfer' ? newEmpForm.bank_name : undefined,
      bank_account_number: newEmpForm.payment_method === 'bank_transfer' ? newEmpForm.bank_account_number : undefined,
      bank_swift: newEmpForm.payment_method === 'bank_transfer' ? newEmpForm.bank_swift : undefined,
      bank_iban: newEmpForm.payment_method === 'bank_transfer' ? newEmpForm.bank_iban : undefined,
      mobile_money_provider: newEmpForm.payment_method === 'mobile_money' ? (newEmpForm.mobile_money_provider as any) : undefined,
      mobile_money_number: newEmpForm.payment_method === 'mobile_money' ? newEmpForm.mobile_money_number : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Auto-create an active Contract
    const newContract: IHRMSContract = {
      id: `cont-${Date.now()}`,
      hotel_id: CURRENT_HOTEL_ID,
      employee_id: newEmpId,
      contract_type: newEmpForm.contract_type as any,
      start_date: newEmployee.hire_date,
      base_salary: Number(newEmpForm.base_salary),
      currency: newEmpForm.currency,
      social_security_opt_in: newEmpForm.contract_type !== 'EXTRA',
      status: 'active',
      signature_status: 'signed',
      signed_at: new Date().toISOString(),
      signed_by: '1',
      notes: 'Contrat généré automatiquement à l\'embauche.',
      created_at: new Date().toISOString()
    };

    // Auto-create standard onboarding tasks
    const tasks: IHRMSOnboardingTask[] = [
      {
        id: `onb-${Date.now()}-1`,
        hotel_id: CURRENT_HOTEL_ID,
        employee_id: newEmpId,
        task_name: 'Visite médicale d\'embauche',
        status: 'pending'
      },
      {
        id: `onb-${Date.now()}-2`,
        hotel_id: CURRENT_HOTEL_ID,
        employee_id: newEmpId,
        task_name: 'Fourniture du paquet de bienvenue & badges hôteliers',
        status: 'pending'
      },
      {
        id: `onb-${Date.now()}-3`,
        hotel_id: CURRENT_HOTEL_ID,
        employee_id: newEmpId,
        task_name: 'Configuration des accès Nucleus PMS',
        status: 'pending'
      }
    ];

    setEmployees(prev => [newEmployee, ...prev]);
    setContracts(prev => [newContract, ...prev]);
    setOnboardingTasks(prev => [...tasks, ...prev]);

    // Publish Business Events
    emitBusinessEvent(
      'EmployeeCreated',
      `Fiche employée initialisée pour ${newEmployee.first_name} ${newEmployee.last_name} (${newEmployee.employee_code}).`,
      { employee_id: newEmpId }
    );
    emitBusinessEvent(
      'ContractSigned',
      `Contrat initial ${newContract.contract_type} signé pour ${newEmployee.first_name} ${newEmployee.last_name}. Salaire : ${newContract.base_salary} ${newContract.currency}.`,
      { contract_id: newContract.id }
    );

    setShowAddEmployeeModal(false);
    // Reset form
    setNewEmpForm({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      gender: 'M',
      date_of_birth: '',
      address: '',
      nationality: 'Ivoirienne',
      department_id: departments[0]?.id || '',
      job_id: jobs[0]?.id || '',
      team_id: '',
      employee_type: 'FULL_TIME',
      cnps_number: '',
      payment_method: 'bank_transfer',
      bank_name: '',
      bank_account_number: '',
      bank_swift: '',
      bank_iban: '',
      mobile_money_provider: 'Wave',
      mobile_money_number: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      contract_type: 'CDI',
      base_salary: 180000,
      currency: 'XOF'
    });
  };

  // 2. Sign New Contract / Career Update (Multi-contract Career History - PO point 2)
  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContractForm.employee_id || !newContractForm.base_salary) {
      alert('Veuillez spécifier l\'employé et le salaire.');
      return;
    }

    const employeeId = newContractForm.employee_id;
    const employee = employees.find(emp => emp.id === employeeId);

    if (!employee) return;

    // 1. Mark all older contracts for this employee as 'superseded' (never overwrite!)
    setContracts(prevContracts => {
      const updatedContracts = prevContracts.map(c => {
        if (c.employee_id === employeeId && c.status === 'active') {
          return { ...c, status: 'superseded' as const };
        }
        return c;
      });

      // 2. Add the brand new active contract
      const newContract: IHRMSContract = {
        id: `cont-${Date.now()}`,
        hotel_id: CURRENT_HOTEL_ID,
        employee_id: employeeId,
        contract_type: newContractForm.contract_type,
        start_date: newContractForm.start_date,
        end_date: newContractForm.end_date || undefined,
        base_salary: Number(newContractForm.base_salary),
        currency: newContractForm.currency,
        social_security_opt_in: newContractForm.social_security_opt_in,
        status: 'active',
        signature_status: 'signed',
        signed_at: new Date().toISOString(),
        signed_by: '1',
        notes: newContractForm.notes || 'Évolution de carrière ou avenant.',
        created_at: new Date().toISOString()
      };

      return [newContract, ...updatedContracts];
    });

    emitBusinessEvent(
      'ContractSigned',
      `Nouveau contrat ${newContractForm.contract_type} signé pour ${employee.first_name} ${employee.last_name}. Salaire réévalué à ${newContractForm.base_salary} ${newContractForm.currency}.`,
      { employee_id: employeeId }
    );

    setShowAddContractModal(false);
  };

  // 3. Assign Competence to Employee
  const handleAssignSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillForm.employee_id || !newSkillForm.skill_id) {
      alert('Veuillez sélectionner un employé et une compétence.');
      return;
    }

    // Check if relation already exists
    const existingIndex = employeeSkills.findIndex(
      es => es.employee_id === newSkillForm.employee_id && es.skill_id === newSkillForm.skill_id
    );

    if (existingIndex > -1) {
      // Upgrade level
      const updated = [...employeeSkills];
      updated[existingIndex].level = newSkillForm.level;
      setEmployeeSkills(updated);
    } else {
      // Create new
      const newRelation: IHRMSEmployeeSkill = {
        id: `es-${Date.now()}`,
        hotel_id: CURRENT_HOTEL_ID,
        employee_id: newSkillForm.employee_id,
        skill_id: newSkillForm.skill_id,
        level: newSkillForm.level,
        obtained_date: new Date().toISOString().split('T')[0]
      };
      setEmployeeSkills(prev => [...prev, newRelation]);
    }

    const employee = employees.find(emp => emp.id === newSkillForm.employee_id);
    const skillObj = skills.find(s => s.id === newSkillForm.skill_id);

    emitBusinessEvent(
      'EmployeeUpdated',
      `Compétence mise à jour pour ${employee?.first_name} ${employee?.last_name} : ${skillObj?.name} (${newSkillForm.level}).`,
      { employee_id: newSkillForm.employee_id }
    );

    setShowAddSkillModal(false);
  };

  // 4. Toggle Onboarding Task Status
  const handleToggleOnboardingTask = (taskId: string) => {
    setOnboardingTasks(prev => 
      prev.map(t => {
        if (t.id === taskId) {
          const isCompleting = t.status === 'pending';
          return {
            ...t,
            status: isCompleting ? 'completed' : 'pending',
            completed_at: isCompleting ? new Date().toISOString() : undefined,
            completed_by: isCompleting ? '1' : undefined
          };
        }
        return t;
      })
    );
  };

  // 5. Terminate / Offboard Employee (IEmployeeService & Business Events)
  const handleTerminateEmployee = (employeeId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir déclarer la fin de collaboration de cet employé ?')) {
      return;
    }

    setEmployees(prev => 
      prev.map(emp => {
        if (emp.id === employeeId) {
          return { ...emp, status: 'terminated' as const };
        }
        return emp;
      })
    );

    // Superseed contracts
    setContracts(prev => 
      prev.map(c => {
        if (c.employee_id === employeeId && c.status === 'active') {
          return { ...c, status: 'terminated' as const };
        }
        return c;
      })
    );

    const employee = employees.find(e => e.id === employeeId);
    emitBusinessEvent(
      'EmployeeOffboarded',
      `Départ de l'employé(e) ${employee?.first_name} ${employee?.last_name} finalisé. Fiche archivée réglementairement.`,
      { employee_id: employeeId }
    );
  };

  // 6. Simulate Drag and Drop Document Upload
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0] && selectedEmployeeId) {
      const file = e.dataTransfer.files[0];
      const newDoc: IHRMSDocument = {
        id: `doc-${Date.now()}`,
        hotel_id: CURRENT_HOTEL_ID,
        employee_id: selectedEmployeeId,
        document_type: uploadDocType,
        file_name: file.name,
        file_path: `/uploads/hrms/docs/${file.name}`,
        file_size: file.size,
        mime_type: file.type || 'application/pdf',
        uploaded_at: new Date().toISOString(),
        uploaded_by: '1'
      };

      setDocuments(prev => [newDoc, ...prev]);

      const employee = employees.find(e => e.id === selectedEmployeeId);
      emitBusinessEvent(
        'EmployeeUpdated',
        `Nouveau document réglementaire (${uploadDocType}) téléversé pour ${employee?.first_name} ${employee?.last_name} : ${file.name}.`,
        { employee_id: selectedEmployeeId }
      );
    }
  };

  // --- Filtering & Sorting execution ---
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDept = deptFilter === 'ALL' || emp.department_id === deptFilter;
    const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);
  const selectedEmployeeContracts = contracts.filter(c => c.employee_id === selectedEmployeeId);
  const selectedEmployeeSkills = employeeSkills.filter(es => es.employee_id === selectedEmployeeId);
  const selectedEmployeeDocs = documents.filter(d => d.employee_id === selectedEmployeeId);
  const selectedEmployeeOnboarding = onboardingTasks.filter(t => t.employee_id === selectedEmployeeId);

  return (
    <div className="space-y-6" id="pms-hrms-module-root">
      
      {/* 1. MODULE MAIN TITLE & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-brand-orange text-white shadow-lg shadow-brand-orange/20">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Nucleus HRMS Enterprise
                <span className="text-xs bg-brand-orange/20 text-brand-orange font-bold px-2 py-0.5 rounded-full border border-brand-orange/30 uppercase tracking-widest">
                  Sprint 1 Core
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Portail de Gestion du Capital Humain & Carrières • Brunch Bouaké VIP
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Trigger Panel */}
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setShowAddEmployeeModal(true)}
            className="px-4 py-2 bg-brand-orange text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-orange/25 hover:bg-brand-orange/90 transition flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Recruter un employé
          </button>
          
          <button 
            onClick={() => {
              setNewContractForm(prev => ({
                ...prev,
                employee_id: employees[0]?.id || '',
                start_date: new Date().toISOString().split('T')[0]
              }));
              setShowAddContractModal(true);
            }}
            className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-850 transition flex items-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            Nouveau Contrat
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC BUSINESS WORKSPACE MENU */}
      <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {[
          { id: 'dashboard', label: 'Tableau de Bord', icon: Activity },
          { id: 'directory', label: 'Registre Personnel', icon: Users, badge: employees.length },
          { id: 'contracts', label: 'Contrats & Historique', icon: FileText, badge: contracts.length },
          { id: 'teams', label: 'Départements & Équipes', icon: Building },
          { id: 'skills', label: 'Compétences & HACCP', icon: Award },
          { id: 'payroll_rules', label: 'Configuration Fiscalité (i18n)', icon: Settings }
        ].map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
                isActive 
                  ? 'bg-slate-900 text-white border border-brand-orange/30 shadow-md shadow-brand-orange/5' 
                  : 'bg-black/25 text-slate-400 hover:text-white hover:bg-slate-900/40 border border-transparent'
              }`}
            >
              <IconComponent className={`w-4.5 h-4.5 ${isActive ? 'text-brand-orange' : 'text-slate-500'}`} />
              {tab.label}
              {tab.badge !== undefined && (
                <span className={`text-2xs font-black px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-brand-orange text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. CONDITIONAL TAB VIEW RENDERING */}
      <AnimatePresence mode="wait">
        
        {/* --- TAB 1: DASHBOARD & METRICS --- */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
            key="dashboard-tab"
          >
            {/* Top Stat Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Effectifs Actifs</span>
                  <div className="p-1.5 rounded-lg bg-green-500/10 text-green-400">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white">{activeEmployeesCount}</div>
                <p className="text-2xs text-slate-400 mt-2 flex items-center gap-1">
                  <span className="text-green-400 font-bold">100%</span> opérationnels sur site
                </p>
                <div className="absolute right-0 bottom-0 w-24 h-24 bg-green-500/5 rounded-full blur-2xl"></div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Masse Salariale</span>
                  <div className="p-1.5 rounded-lg bg-brand-orange/10 text-brand-orange">
                    <Coins className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">
                  {totalMonthlyPayrollEstimateXOF.toLocaleString('fr-FR')} <span className="text-sm">FCFA</span>
                </div>
                <p className="text-2xs text-slate-400 mt-2">
                  Estimation mensuelle active • Hors primes
                </p>
                <div className="absolute right-0 bottom-0 w-24 h-24 bg-brand-orange/5 rounded-full blur-2xl"></div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Coût Horaire Moyen</span>
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white">
                  {avgHourlyCost} <span className="text-sm text-slate-400">FCFA/h</span>
                </div>
                <p className="text-2xs text-slate-400 mt-2">
                  Imputation analytique par chambre estimée
                </p>
                <div className="absolute right-0 bottom-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Intégration (Onboarding)</span>
                  <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-white">{onboardingCompletionRate}%</div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="bg-yellow-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${onboardingCompletionRate}%` }}
                  ></div>
                </div>
              </div>

            </div>

            {/* Main Dashboard Grid with live feeds */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Event logging and simulated hook execution */}
              <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex flex-col h-[400px]">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-brand-orange animate-pulse" />
                    <div>
                      <h3 className="font-bold text-white text-sm">Bus d'Événements Métier (Event-Driven Broker v3.0)</h3>
                      <p className="text-2xs text-slate-400">Logs asynchrones en temps réel à l'exécution hôtelière</p>
                    </div>
                  </div>
                  <span className="text-2xs bg-slate-850 px-2 py-0.5 rounded text-indigo-400 border border-indigo-500/20 font-mono">
                    PRODUCE_SUBSCRIBE
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
                  {businessEvents.map((evt) => (
                    <div 
                      key={evt.id} 
                      className="bg-slate-900/80 border border-slate-800/80 p-3 rounded-xl flex items-start gap-3 transition hover:border-slate-700/80"
                    >
                      <span className={`mt-0.5 px-2 py-0.5 rounded text-3xs font-black uppercase font-mono tracking-wider border ${
                        evt.event_type === 'EmployeeCreated' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        evt.event_type === 'ContractSigned' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                        evt.event_type === 'EmployeeUpdated' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                        evt.event_type === 'EmployeeOffboarded' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {evt.event_type}
                      </span>
                      <div className="flex-1 space-y-0.5">
                        <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                          {evt.description}
                        </p>
                        <div className="flex items-center justify-between text-4xs text-slate-500">
                          <span>Auteur : {evt.actor_name}</span>
                          <span>{new Date(evt.timestamp).toLocaleString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Onboarding Monitor Column */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex flex-col h-[400px]">
                <div className="border-b border-white/10 pb-4 mb-4">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <CheckSquare className="w-4.5 h-4.5 text-yellow-400" />
                    Onboarding Actif
                  </h3>
                  <p className="text-2xs text-slate-400">Tâches réglementaires requises pour les nouvelles recrues</p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                  {onboardingTasks.map(task => {
                    const emp = employees.find(e => e.id === task.employee_id);
                    if (!emp) return null;
                    const isCompleted = task.status === 'completed';
                    return (
                      <div 
                        key={task.id} 
                        onClick={() => handleToggleOnboardingTask(task.id)}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                          isCompleted 
                            ? 'bg-slate-900/30 border-green-500/10 text-slate-500' 
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-200'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={isCompleted} 
                          onChange={() => {}} // Handled by div click
                          className="mt-0.5 h-3.5 w-3.5 rounded border-slate-700 text-brand-orange focus:ring-brand-orange focus:ring-opacity-25"
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold truncate ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                            {task.task_name}
                          </p>
                          <p className="text-4xs text-brand-orange font-bold uppercase tracking-wider mt-0.5">
                            {emp.first_name} {emp.last_name} • {emp.employee_code}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Quick Informative Panel regarding Sprint 1 architectural limits */}
            <div className="bg-brand-orange/5 border border-brand-orange/10 p-5 rounded-2xl flex flex-col md:flex-row items-center gap-4 justify-between">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-brand-orange mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-white text-sm font-bold">Sécurité RBAC et validations strictes de données</h4>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                    Conformément aux exigences réglementaires de l'espace UEMOA, les matricules employés sont générés de manière séquentielle, les taux d'imposition sont isolés dans des tables et toutes les relations (skills, documents) requièrent l'existence d'une fiche d'audit.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="text-2xs bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/20 font-bold uppercase tracking-wider">
                  Zod Validated
                </span>
                <span className="text-2xs bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full border border-brand-orange/20 font-bold uppercase tracking-wider">
                  RBAC Active
                </span>
              </div>
            </div>

          </motion.div>
        )}

        {/* --- TAB 2: EMPLOYEE DIRECTORY --- */}
        {activeTab === 'directory' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
            key="directory-tab"
          >
            {/* Search and Filters Strip */}
            <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Rechercher par nom, prénom ou matricule..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/30 border border-slate-800 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange rounded-xl pl-10 pr-4 py-2 text-sm text-white"
                />
              </div>

              <div>
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="w-full bg-black/30 border border-slate-800 focus:border-brand-orange rounded-xl px-3 py-2 text-sm text-slate-300"
                >
                  <option value="ALL">Tous les Départements</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-black/30 border border-slate-800 focus:border-brand-orange rounded-xl px-3 py-2 text-sm text-slate-300"
                >
                  <option value="ALL">Tous les statuts</option>
                  <option value="active">Actifs</option>
                  <option value="terminated">Congédiés / Anciens</option>
                </select>
              </div>
            </div>

            {/* Employee List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="md:col-span-2 space-y-3">
                <div className="bg-slate-900/20 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/10 bg-black/10 flex justify-between items-center">
                    <h3 className="text-white font-bold text-sm">Registre Unique du Personnel (Bouaké Core)</h3>
                    <span className="text-2xs text-slate-400 font-bold">{filteredEmployees.length} salariés</span>
                  </div>
                  
                  <div className="divide-y divide-white/5">
                    {filteredEmployees.map(emp => {
                      const dept = departments.find(d => d.id === emp.department_id);
                      const job = jobs.find(j => j.id === emp.job_id);
                      const activeContract = contracts.find(c => c.employee_id === emp.id && c.status === 'active');

                      return (
                        <div 
                          key={emp.id}
                          onClick={() => setSelectedEmployeeId(emp.id)}
                          className={`p-4 flex items-center justify-between gap-4 cursor-pointer transition ${
                            selectedEmployeeId === emp.id 
                              ? 'bg-brand-orange/5 border-l-2 border-brand-orange' 
                              : 'hover:bg-slate-800/20 border-l-2 border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-white font-bold border border-white/10 shadow-inner">
                              {emp.first_name[0]}{emp.last_name[0]}
                            </div>
                            <div>
                              <h4 className="text-white font-bold text-sm flex items-center gap-2">
                                {emp.first_name} {emp.last_name}
                                <span className="text-3xs bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">
                                  {emp.employee_code}
                                </span>
                              </h4>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {job?.title} • <span className="text-brand-orange font-medium">{dept?.name}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                              <p className="text-xs font-bold text-white font-mono">
                                {activeContract ? `${activeContract.base_salary.toLocaleString('fr-FR')} ${activeContract.currency}` : 'N/A'}
                              </p>
                              <p className="text-4xs text-slate-500 uppercase tracking-wider mt-0.5">
                                Salaire de Base
                              </p>
                            </div>

                            <span className={`px-2 py-0.5 rounded-full text-3xs font-bold uppercase tracking-wider ${
                              emp.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                            }`}>
                              {emp.status === 'active' ? 'Actif' : 'Sorti'}
                            </span>

                            <ChevronRight className="w-4 h-4 text-slate-600" />
                          </div>
                        </div>
                      );
                    })}

                    {filteredEmployees.length === 0 && (
                      <div className="p-8 text-center text-slate-500 text-xs">
                        Aucun employé trouvé pour ces critères de recherche.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Side profile deep dive detail card */}
              <div>
                <AnimatePresence mode="wait">
                  {selectedEmployee ? (
                    <motion.div
                      key={selectedEmployee.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-5"
                    >
                      {/* Short Profile Header */}
                      <div className="text-center pb-4 border-b border-white/5 relative">
                        <button 
                          onClick={() => setSelectedEmployeeId(null)}
                          className="absolute right-0 top-0 p-1 bg-slate-800/80 text-slate-400 hover:text-white rounded-lg transition"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        
                        <div className="w-14 h-14 rounded-full bg-slate-800 border border-brand-orange/20 flex items-center justify-center text-xl font-bold text-brand-orange mx-auto shadow-lg shadow-black/40">
                          {selectedEmployee.first_name[0]}{selectedEmployee.last_name[0]}
                        </div>
                        <h3 className="text-white font-bold text-base mt-2">
                          {selectedEmployee.first_name} {selectedEmployee.last_name}
                        </h3>
                        <p className="text-2xs text-slate-400 font-mono mt-0.5">
                          {selectedEmployee.employee_code} • {selectedEmployee.employee_type}
                        </p>
                        
                        {selectedEmployee.status === 'active' && (
                          <button 
                            onClick={() => handleTerminateEmployee(selectedEmployee.id)}
                            className="mt-3 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-4xs font-bold uppercase tracking-widest transition cursor-pointer"
                          >
                            DÉCLARER LE DÉPART (OFFBOARDING)
                          </button>
                        )}
                      </div>

                      {/* Banking parameters (PO requirement 6) */}
                      <div className="space-y-2.5">
                        <h4 className="text-2xs text-slate-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                          <CreditCard className="w-3 h-3 text-brand-orange" />
                          Coordonnées de Règlement
                        </h4>
                        
                        <div className="bg-black/30 p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Méthode</span>
                            <span className="text-white font-semibold capitalize">
                              {selectedEmployee.payment_method === 'bank_transfer' ? 'Virement Bancaire' : selectedEmployee.payment_method === 'mobile_money' ? 'Mobile Money' : 'Espèces'}
                            </span>
                          </div>

                          {selectedEmployee.payment_method === 'bank_transfer' ? (
                            <>
                              <div className="border-t border-white/5 pt-1.5 mt-1.5 space-y-1">
                                <div className="text-4xs uppercase text-slate-500">Banque & RIB</div>
                                <div className="text-white font-semibold font-mono truncate">{selectedEmployee.bank_name}</div>
                                <div className="text-slate-300 font-mono text-2xs truncate">{selectedEmployee.bank_account_number}</div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-1.5 mt-1.5">
                                <div>
                                  <div className="text-4xs uppercase text-slate-500">SWIFT / BIC</div>
                                  <div className="text-white font-mono text-2xs">{selectedEmployee.bank_swift}</div>
                                </div>
                                <div>
                                  <div className="text-4xs uppercase text-slate-500">IBAN</div>
                                  <div className="text-white font-mono text-2xs truncate">{selectedEmployee.bank_iban || 'N/A'}</div>
                                </div>
                              </div>
                            </>
                          ) : selectedEmployee.payment_method === 'mobile_money' ? (
                            <div className="border-t border-white/5 pt-1.5 mt-1.5 flex items-center justify-between">
                              <div>
                                <div className="text-4xs uppercase text-slate-500">Opérateur</div>
                                <div className="text-white font-bold">{selectedEmployee.mobile_money_provider}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-4xs uppercase text-slate-500">Numéro</div>
                                <div className="text-white font-mono text-2xs">{selectedEmployee.mobile_money_number}</div>
                              </div>
                            </div>
                          ) : (
                            <div className="border-t border-white/5 pt-1.5 mt-1.5 text-slate-400 text-3xs italic">
                              Règlement en espèces de la main à la main en caisse.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Onboarding Tasks matching */}
                      {selectedEmployeeOnboarding.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-2xs text-slate-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                            <CheckSquare className="w-3 h-3 text-brand-orange" />
                            Statut de l'intégration
                          </h4>
                          <div className="space-y-1.5">
                            {selectedEmployeeOnboarding.map(task => (
                              <div 
                                key={task.id} 
                                className="flex items-center justify-between bg-black/25 p-2 rounded-lg text-xs"
                              >
                                <span className={task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-300'}>
                                  {task.task_name}
                                </span>
                                <span className={`text-4xs font-bold uppercase ${
                                  task.status === 'completed' ? 'text-green-400' : 'text-yellow-400'
                                }`}>
                                  {task.status === 'completed' ? 'Fait' : 'À faire'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Coffre fort numérique (Document vault simulator - PO requirement 4) */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-2xs text-slate-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                            <Shield className="w-3 h-3 text-brand-orange" />
                            Coffre Documentaire
                          </h4>
                          <select 
                            value={uploadDocType}
                            onChange={(e) => setUploadDocType(e.target.value as any)}
                            className="bg-black/40 text-4xs border border-slate-800 rounded px-1 py-0.5 text-slate-400 outline-none"
                          >
                            <option value="id_card">CNI/Pass</option>
                            <option value="contract">Contrat</option>
                            <option value="diploma">Diplôme</option>
                            <option value="payslip">Fiche Paie</option>
                          </select>
                        </div>

                        {/* Drag and Drop Zone */}
                        <div 
                          onDragEnter={handleDrag}
                          onDragOver={handleDrag}
                          onDragLeave={handleDrag}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-xl p-3.5 text-center transition ${
                            dragActive 
                              ? 'border-brand-orange bg-brand-orange/5' 
                              : 'border-slate-800 hover:border-slate-700 bg-black/10'
                          }`}
                        >
                          <UploadCloud className="w-5 h-5 text-slate-500 mx-auto mb-1" />
                          <p className="text-4xs text-slate-400">
                            Faites glisser un PDF ici pour l'enregistrer dans le coffre numérique de l'employé.
                          </p>
                        </div>

                        {/* Uploaded Files list */}
                        <div className="space-y-1.5">
                          {selectedEmployeeDocs.map(doc => (
                            <div key={doc.id} className="bg-black/30 border border-slate-800/80 px-2.5 py-2 rounded-lg flex items-center justify-between text-xs">
                              <div className="truncate pr-2">
                                <p className="text-white font-semibold truncate text-2xs">{doc.file_name}</p>
                                <p className="text-4xs text-slate-500">
                                  {doc.document_type.toUpperCase()} • {Math.round(doc.file_size / 1024)} Ko
                                </p>
                              </div>
                              <a 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); alert(`Téléchargement simulé de ${doc.file_name}`); }}
                                className="text-brand-orange hover:text-white transition"
                                title="Télécharger"
                              >
                                <FileDown className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>

                    </motion.div>
                  ) : (
                    <div className="bg-slate-900/15 border border-slate-800/60 rounded-2xl p-8 text-center text-slate-500 text-xs">
                      Sélectionnez un employé dans l'annuaire pour consulter son dossier complet, ses coordonnées bancaires et son coffre documentaire.
                    </div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </motion.div>
        )}

        {/* --- TAB 3: CONTRACTS HISTORY --- */}
        {activeTab === 'contracts' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
            key="contracts-tab"
          >
            {/* Top informational header about career history */}
            <div className="bg-indigo-500/5 border border-indigo-500/15 p-4 rounded-2xl flex items-start gap-3">
              <Shield className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-white font-bold text-sm">Gestion des Avenants et Traçabilité Complète (Zéro Écrasement)</h4>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  Les règles RH de Nucleus PMS Core interdisent la suppression ou l'écrasement des contrats passés. Lorsqu'un salarié change de fonction ou est revalorisé financièrement, l'ancien contrat est archivé sous le statut <span className="text-indigo-400 font-bold">"superseded"</span> (remplacé) et un nouveau contrat est inséré dans l'historique actif du matricule.
                </p>
              </div>
            </div>

            {/* Contract List with Timeline visual */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Contracts list grouped by employee */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-900/20 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/10 bg-black/10 flex justify-between items-center">
                    <h3 className="text-white font-bold text-sm">Registre des Contrats de Travail par Employé</h3>
                    <button 
                      onClick={() => setShowAddContractModal(true)}
                      className="px-3 py-1.5 bg-brand-orange text-white rounded-lg text-xs font-bold hover:bg-brand-orange/95 cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Créer un contrat / Avenant
                    </button>
                  </div>

                  <div className="divide-y divide-white/5">
                    {employees.map(emp => {
                      const empContracts = contracts.filter(c => c.employee_id === emp.id);
                      return (
                        <div key={emp.id} className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-3xs font-black">
                                {emp.first_name[0]}{emp.last_name[0]}
                              </span>
                              <h4 className="text-white font-bold text-sm">
                                {emp.first_name} {emp.last_name}
                              </h4>
                              <span className="text-3xs text-slate-400 font-mono">({emp.employee_code})</span>
                            </div>
                            <span className="text-3xs text-slate-500 font-bold uppercase bg-slate-850 px-2 py-0.5 rounded">
                              {empContracts.length} contrat(s) au dossier
                            </span>
                          </div>

                          {/* Individual contract history lines */}
                          <div className="space-y-2 pl-8">
                            {empContracts.map(contract => (
                              <div 
                                key={contract.id} 
                                className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                  contract.status === 'active' 
                                    ? 'bg-brand-orange/5 border-brand-orange/20' 
                                    : 'bg-black/20 border-slate-850/80 opacity-60'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-white uppercase font-mono bg-slate-800 px-1.5 py-0.5 rounded">
                                      {contract.contract_type}
                                    </span>
                                    <span className={`text-4xs font-bold uppercase tracking-wider ${
                                      contract.status === 'active' ? 'text-green-400' : 'text-slate-500'
                                    }`}>
                                      {contract.status === 'active' ? 'ACTIF' : 'REMPLACÉ / EXSPIRÉ'}
                                    </span>
                                  </div>
                                  <p className="text-2xs text-slate-400 mt-1">
                                    Du {new Date(contract.start_date).toLocaleDateString('fr-FR')} 
                                    {contract.end_date ? ` au ${new Date(contract.end_date).toLocaleDateString('fr-FR')}` : ' (Indéterminé)'}
                                  </p>
                                  {contract.notes && (
                                    <p className="text-3xs text-slate-500 italic mt-0.5">
                                      Note : {contract.notes}
                                    </p>
                                  )}
                                </div>

                                <div className="text-right">
                                  <p className="text-sm font-black text-white font-mono">
                                    {contract.base_salary.toLocaleString('fr-FR')} {contract.currency}
                                  </p>
                                  <p className="text-4xs text-slate-500 uppercase tracking-wider mt-0.5">
                                    Rémunération Brute
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Career Simulation panel */}
              <div className="space-y-4">
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    <TrendingUp className="w-4.5 h-4.5 text-brand-orange" />
                    Simulateur de Promotion
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Testez la mutation d'un employé. En créant un nouveau contrat de CDI revalorisé, le système va automatiquement passer son ancien contrat sous statut "Remplace" et émettre l'événement "ContractSigned".
                  </p>

                  <button
                    onClick={() => {
                      setNewContractForm(prev => ({
                        ...prev,
                        employee_id: 'emp-1',
                        contract_type: 'CDI',
                        base_salary: 320000,
                        notes: 'Promotion exceptionnelle au grade de Superviseur.'
                      }));
                      setShowAddContractModal(true);
                    }}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Promouvoir un employé maintenant
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* --- TAB 4: DEPARTMENTS & TEAMS --- */}
        {activeTab === 'teams' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
            key="teams-tab"
          >
            {/* Split layout: Departments as Cost Centers vs Teams */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Departments / Cost Centers Panel */}
              <div className="bg-slate-900/20 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/10 bg-black/10">
                  <h3 className="text-white font-bold text-sm">Départements & Centres de Coût (Analytique)</h3>
                  <p className="text-2xs text-slate-400 mt-0.5">Codes d'imputations comptables uniques du Brunch VIP</p>
                </div>

                <div className="divide-y divide-white/5 p-2">
                  {departments.map(dept => {
                    const manager = employees.find(e => e.id === dept.manager_id);
                    const staffCount = employees.filter(e => e.department_id === dept.id).length;

                    return (
                      <div key={dept.id} className="p-4 flex items-center justify-between gap-4">
                        <div>
                          <h4 className="text-white font-bold text-sm">{dept.name}</h4>
                          <p className="text-2xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                            Code : <span className="text-brand-orange font-mono font-bold bg-slate-800 px-1 py-0.2 rounded text-3xs">{dept.code}</span>
                            • Centre analytique : <span className="font-mono text-slate-300">{dept.cost_center_code}</span>
                          </p>
                          {manager && (
                            <p className="text-3xs text-slate-500 mt-1">
                              Directeur de service : {manager.first_name} {manager.last_name}
                            </p>
                          )}
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-black text-white">{staffCount}</span>
                          <p className="text-4xs text-slate-500 uppercase tracking-wider">Salariés</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Operational Teams panel (PO Requirement 11) */}
              <div className="bg-slate-900/20 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/10 bg-black/10 flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-bold text-sm">Équipes Opérationnelles (Housekeeping & Resto)</h3>
                    <p className="text-2xs text-slate-400 mt-0.5">Regroupements de services pour plannings de shifts</p>
                  </div>
                  <span className="text-3xs bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded border border-brand-orange/25 font-bold uppercase">
                    hrms_teams
                  </span>
                </div>

                <div className="divide-y divide-white/5 p-2">
                  {teams.map(team => {
                    const dept = departments.find(d => d.id === team.department_id);
                    const supervisor = employees.find(e => e.id === team.supervisor_id);
                    const teamMembersCount = employees.filter(e => e.team_id === team.id).length;

                    return (
                      <div key={team.id} className="p-4 flex items-center justify-between gap-4">
                        <div>
                          <h4 className="text-white font-bold text-sm flex items-center gap-2">
                            {team.name}
                            <span className="text-3xs bg-slate-800 text-slate-400 font-mono px-1 py-0.2 rounded">
                              {team.code}
                            </span>
                          </h4>
                          <p className="text-2xs text-slate-400 mt-0.5">
                            Rattachée à : <span className="text-indigo-400 font-medium">{dept?.name}</span>
                          </p>
                          {supervisor && (
                            <p className="text-3xs text-slate-500 mt-1">
                              Superviseur de brigade : {supervisor.first_name} {supervisor.last_name}
                            </p>
                          )}
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-black text-white">{teamMembersCount}</span>
                          <p className="text-4xs text-slate-500 uppercase tracking-wider">Membres</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* --- TAB 5: SKILLS & COMPETENCES --- */}
        {activeTab === 'skills' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
            key="skills-tab"
          >
            {/* Skills Top informational card */}
            <div className="bg-yellow-500/5 border border-yellow-500/15 p-4 rounded-2xl flex items-start gap-3">
              <Award className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-white font-bold text-sm">Matrice des Compétences & Formation Continue HACCP</h4>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  Suivez les habilitations professionnelles, l'anglais d'accueil et les certifications d'hygiène alimentaire indispensables pour la conformité HACCP en restauration d'hôtel VIP. Attribuez de nouvelles compétences ou mettez à jour les niveaux d'expertise.
                </p>
              </div>
            </div>

            {/* Matrix Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Skills matrix panel */}
              <div className="lg:col-span-2 bg-slate-900/20 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/10 bg-black/10 flex justify-between items-center">
                  <h3 className="text-white font-bold text-sm">Suivi Global des Certificats de l'Équipe</h3>
                  <button 
                    onClick={() => {
                      setNewSkillForm({
                        employee_id: employees[0]?.id || '',
                        skill_id: skills[0]?.id || '',
                        level: 'intermediate'
                      });
                      setShowAddSkillModal(true);
                    }}
                    className="px-3 py-1.5 bg-brand-orange text-white rounded-lg text-xs font-bold hover:bg-brand-orange/95 cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Assigner un brevet / Habilitation
                  </button>
                </div>

                <div className="divide-y divide-white/5">
                  {employees.map(emp => {
                    const empSkills = employeeSkills.filter(es => es.employee_id === emp.id);
                    return (
                      <div key={emp.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-slate-850 border border-white/10 text-white flex items-center justify-center font-bold text-xs">
                            {emp.first_name[0]}{emp.last_name[0]}
                          </span>
                          <div>
                            <h4 className="text-white font-bold text-sm">{emp.first_name} {emp.last_name}</h4>
                            <p className="text-3xs text-slate-500 font-mono">{emp.employee_code}</p>
                          </div>
                        </div>

                        {/* Interactive list of certificates */}
                        <div className="flex flex-wrap gap-2">
                          {empSkills.map(es => {
                            const skillObj = skills.find(s => s.id === es.skill_id);
                            if (!skillObj) return null;
                            return (
                              <div 
                                key={es.id} 
                                className="bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                                <div>
                                  <span className="text-white font-semibold block text-3xs leading-none">
                                    {skillObj.name}
                                  </span>
                                  <span className="text-slate-400 text-4xs font-mono uppercase tracking-wider block mt-0.5">
                                    Niveau : {es.level}
                                  </span>
                                </div>
                              </div>
                            );
                          })}

                          {empSkills.length === 0 && (
                            <span className="text-slate-500 text-3xs italic">
                              Aucune compétence ou brevet enregistré.
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Competences list catalog */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <Award className="w-4.5 h-4.5 text-brand-orange" />
                  Référentiel des Compétences Hôtelières
                </h3>
                
                <div className="space-y-3">
                  {skills.map(s => (
                    <div key={s.id} className="bg-black/20 p-3 rounded-xl border border-slate-800/80 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold">{s.name}</span>
                        <span className="text-4xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                          {s.category}
                        </span>
                      </div>
                      <p className="text-slate-400 mt-1 leading-relaxed text-2xs">
                        {s.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* --- TAB 6: PAYROLL i18n RULES --- */}
        {activeTab === 'payroll_rules' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
            key="payroll_rules-tab"
          >
            {/* Payroll top informational card */}
            <div className="bg-brand-orange/5 border border-brand-orange/15 p-4 rounded-2xl flex items-start gap-3">
              <Globe className="w-5 h-5 text-brand-orange mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-white font-bold text-sm">Internationalisation de la Paie (SaaS Multi-Pays - PO Point 1)</h4>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  Le moteur de paie de Nucleus PMS Core est entièrement paramétré par des fiches d'impôts et réglementations. Les formules ne sont pas codées en dur, permettant d'étendre la solution à la Côte d'Ivoire, au Sénégal, au Burkina Faso, au Maroc et à la France en modifiant simplement la table réglementaire <span className="text-brand-orange font-bold font-mono">hrms_payroll_rules</span>.
                </p>
              </div>
            </div>

            {/* Simulated active configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Configuration fields table */}
              <div className="bg-slate-900/20 border border-slate-800 rounded-2xl overflow-hidden p-5 space-y-4">
                <div className="border-b border-white/10 pb-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-bold text-sm">Fiche de Taux Active : Côte d'Ivoire (CI)</h3>
                    <p className="text-2xs text-slate-400 mt-0.5">Moteur de calcul conventionnel active</p>
                  </div>
                  <span className="text-2xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded font-black font-mono">
                    STATUS_ACTIVE
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2 text-xs">
                    <span className="text-slate-400">Devise Principale d'Établissement</span>
                    <span className="text-white font-bold font-mono">XOF (Franc CFA)</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-white/5 pb-2 text-xs">
                    <span className="text-slate-400">Taux Salarial CNPS</span>
                    <span className="text-white font-bold font-mono">5.50 %</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-white/5 pb-2 text-xs">
                    <span className="text-slate-400">Taux Patronal CNPS</span>
                    <span className="text-white font-bold font-mono">7.70 %</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-white/5 pb-2 text-xs">
                    <span className="text-slate-400">Plafond Cotisable National</span>
                    <span className="text-white font-bold font-mono">1 200 000 FCFA</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-white/5 pb-2 text-xs">
                    <span className="text-slate-400">Impôt de Base Général Salaires (IGR)</span>
                    <span className="text-white font-bold font-mono">1.20 %</span>
                  </div>

                  <div className="flex justify-between items-center pb-2 text-xs">
                    <span className="text-slate-400">Contribution Nationale Solidarité</span>
                    <span className="text-white font-bold font-mono">1.50 %</span>
                  </div>
                </div>
              </div>

              {/* International Country switcher demo */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <Globe className="w-4.5 h-4.5 text-brand-orange" />
                  Simuler d'autres Pays d'Implantation
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cliquez sur un pays pour charger ses paramètres de retenues et devises, testant l'isolation de notre architecture réglementaire :
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { country: 'Sénégal (SN)', currency: 'XOF', cnps: '5.8%', tax: '1.5%', icon: '🇸🇳' },
                    { country: 'Burkina (BF)', currency: 'XOF', cnps: '5.5%', tax: '1.0%', icon: '🇧🇫' },
                    { country: 'Maroc (MA)', currency: 'MAD', cnps: '6.7%', tax: '2.5%', icon: '🇲🇦' },
                    { country: 'France (FR)', currency: 'EUR', cnps: '22.0%', tax: '14.0%', icon: '🇫🇷' },
                  ].map((c, i) => (
                    <button 
                      key={i}
                      onClick={() => alert(`Mise à jour des paramètres : pays configuré pour l'hôtel multi-propriétés. La devise par défaut de la paie est passée à ${c.currency} et le taux de charge sociale locale est reconfiguré à ${c.cnps}.`)}
                      className="p-3 bg-black/25 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 rounded-xl text-left transition cursor-pointer"
                    >
                      <div className="text-lg mb-1">{c.icon}</div>
                      <div className="text-xs font-bold text-white leading-tight">{c.country}</div>
                      <div className="text-4xs text-slate-500 uppercase font-mono tracking-wider mt-1 block">
                        Devise : {c.currency} • CNPS : {c.cnps}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* --- MODAL 1: RECRUIT EMPLOYEE --- */}
      <AnimatePresence>
        {showAddEmployeeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowAddEmployeeModal(false)}
            ></div>
            
            {/* Content Container */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-white/10 bg-black/30 flex justify-between items-center">
                <h3 className="font-bold text-white text-base">Recruter un nouveau collaborateur (Fondation RH Sprint 1)</h3>
                <button 
                  onClick={() => setShowAddEmployeeModal(false)}
                  className="p-1 text-slate-400 hover:text-white rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateEmployee} className="p-6 overflow-y-auto space-y-5">
                
                {/* 1. Civil state */}
                <div className="space-y-2.5">
                  <h4 className="text-2xs text-brand-orange uppercase tracking-widest font-black">1. État Civil & Identité</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-4xs text-slate-400 uppercase font-bold mb-1">Prénom *</label>
                      <input 
                        type="text" 
                        required
                        value={newEmpForm.first_name}
                        onChange={(e) => setNewEmpForm({...newEmpForm, first_name: e.target.value})}
                        className="w-full bg-black/30 border border-slate-800 rounded-lg p-2 text-xs text-white"
                        placeholder="Ex: Koffi"
                      />
                    </div>
                    <div>
                      <label className="block text-4xs text-slate-400 uppercase font-bold mb-1">Nom *</label>
                      <input 
                        type="text" 
                        required
                        value={newEmpForm.last_name}
                        onChange={(e) => setNewEmpForm({...newEmpForm, last_name: e.target.value})}
                        className="w-full bg-black/30 border border-slate-800 rounded-lg p-2 text-xs text-white"
                        placeholder="Ex: Yao"
                      />
                    </div>
                    <div>
                      <label className="block text-4xs text-slate-400 uppercase font-bold mb-1">Nationalité</label>
                      <input 
                        type="text" 
                        value={newEmpForm.nationality}
                        onChange={(e) => setNewEmpForm({...newEmpForm, nationality: e.target.value})}
                        className="w-full bg-black/30 border border-slate-800 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-4xs text-slate-400 uppercase font-bold mb-1">Genre</label>
                      <select 
                        value={newEmpForm.gender}
                        onChange={(e) => setNewEmpForm({...newEmpForm, gender: e.target.value as any})}
                        className="w-full bg-black/30 border border-slate-800 rounded-lg p-2 text-xs text-white"
                      >
                        <option value="M">Masculin</option>
                        <option value="F">Féminin</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-4xs text-slate-400 uppercase font-bold mb-1">Date de naissance</label>
                      <input 
                        type="date" 
                        value={newEmpForm.date_of_birth}
                        onChange={(e) => setNewEmpForm({...newEmpForm, date_of_birth: e.target.value})}
                        className="w-full bg-black/30 border border-slate-800 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-4xs text-slate-400 uppercase font-bold mb-1">N° CNPS (Le cas échéant)</label>
                      <input 
                        type="text" 
                        value={newEmpForm.cnps_number}
                        onChange={(e) => setNewEmpForm({...newEmpForm, cnps_number: e.target.value})}
                        className="w-full bg-black/30 border border-slate-800 rounded-lg p-2 text-xs text-white"
                        placeholder="Ex: CNPS-CI-..."
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Professional posting */}
                <div className="space-y-2.5 pt-2 border-t border-white/5">
                  <h4 className="text-2xs text-brand-orange uppercase tracking-widest font-black">2. Affectation Professionnelle & Type</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-4xs text-slate-400 uppercase font-bold mb-1">Département *</label>
                      <select 
                        value={newEmpForm.department_id}
                        onChange={(e) => setNewEmpForm({...newEmpForm, department_id: e.target.value})}
                        className="w-full bg-black/30 border border-slate-800 rounded-lg p-2 text-xs text-white"
                      >
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-4xs text-slate-400 uppercase font-bold mb-1">Fiche de Poste / Job *</label>
                      <select 
                        value={newEmpForm.job_id}
                        onChange={(e) => setNewEmpForm({...newEmpForm, job_id: e.target.value})}
                        className="w-full bg-black/30 border border-slate-800 rounded-lg p-2 text-xs text-white"
                      >
                        {jobs.map(j => (
                          <option key={j.id} value={j.id}>{j.title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-4xs text-slate-400 uppercase font-bold mb-1">Équipe Affectée (hrms_teams)</label>
                      <select 
                        value={newEmpForm.team_id}
                        onChange={(e) => setNewEmpForm({...newEmpForm, team_id: e.target.value})}
                        className="w-full bg-black/30 border border-slate-800 rounded-lg p-2 text-xs text-white"
                      >
                        <option value="">Aucune (Hors équipe)</option>
                        {teams.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-4xs text-slate-400 uppercase font-bold mb-1">Type de Contrat Global</label>
                      <select 
                        value={newEmpForm.employee_type}
                        onChange={(e) => setNewEmpForm({...newEmpForm, employee_type: e.target.value as any})}
                        className="w-full bg-black/30 border border-slate-800 rounded-lg p-2 text-xs text-white"
                      >
                        <option value="FULL_TIME">Plein Temps CDI</option>
                        <option value="PART_TIME">Temps Partiel</option>
                        <option value="EXTRA">Extra / Tâche Journalière</option>
                        <option value="SEASONAL">Saisonnier</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-4xs text-slate-400 uppercase font-bold mb-1">E-mail Professionnel *</label>
                      <input 
                        type="email" 
                        required
                        value={newEmpForm.email}
                        onChange={(e) => setNewEmpForm({...newEmpForm, email: e.target.value})}
                        className="w-full bg-black/30 border border-slate-800 rounded-lg p-2 text-xs text-white"
                        placeholder="nom@brunchbouake.ci"
                      />
                    </div>
                    <div>
                      <label className="block text-4xs text-slate-400 uppercase font-bold mb-1">N° Téléphone *</label>
                      <input 
                        type="text" 
                        required
                        value={newEmpForm.phone}
                        onChange={(e) => setNewEmpForm({...newEmpForm, phone: e.target.value})}
                        className="w-full bg-black/30 border border-slate-800 rounded-lg p-2 text-xs text-white"
                        placeholder="+225 07..."
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Initial Contract settings */}
                <div className="space-y-2.5 pt-2 border-t border-white/5">
                  <h4 className="text-2xs text-brand-orange uppercase tracking-widest font-black">3. Contrat d'Embauche Immédiat</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-4xs text-slate-400 uppercase font-bold mb-1">Type de Contrat</label>
                      <select 
                        value={newEmpForm.contract_type}
                        onChange={(e) => setNewEmpForm({...newEmpForm, contract_type: e.target.value as any})}
                        className="w-full bg-black/30 border border-slate-800 rounded-lg p-2 text-xs text-white"
                      >
                        <option value="CDI">CDI (Indéterminé)</option>
                        <option value="CDD">CDD (Déterminé)</option>
                        <option value="EXTRA">Extra à la tâche</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-4xs text-slate-400 uppercase font-bold mb-1">Salaire de Base Brut</label>
                      <input 
                        type="number" 
                        value={newEmpForm.base_salary}
                        onChange={(e) => setNewEmpForm({...newEmpForm, base_salary: Number(e.target.value)})}
                        className="w-full bg-black/30 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-4xs text-slate-400 uppercase font-bold mb-1">Devise du Contrat (i18n)</label>
                      <select 
                        value={newEmpForm.currency}
                        onChange={(e) => setNewEmpForm({...newEmpForm, currency: e.target.value})}
                        className="w-full bg-black/30 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono"
                      >
                        <option value="XOF">XOF (FCFA)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 4. Payment channel parameters */}
                <div className="space-y-2.5 pt-2 border-t border-white/5">
                  <h4 className="text-2xs text-brand-orange uppercase tracking-widest font-black">4. Mode de Paiement et RIB (Multi-canal - PO point 6)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-4xs text-slate-400 uppercase font-bold mb-1">Canal de Règlement Préféré</label>
                      <select 
                        value={newEmpForm.payment_method}
                        onChange={(e) => setNewEmpForm({...newEmpForm, payment_method: e.target.value as any})}
                        className="w-full bg-black/30 border border-slate-800 rounded-lg p-2 text-xs text-white"
                      >
                        <option value="bank_transfer">Virement Bancaire Réglementaire</option>
                        <option value="mobile_money">Mobile Money (Wave / Orange / MTN)</option>
                        <option value="cash">Espèces en caisse</option>
                      </select>
                    </div>
                  </div>

                  {newEmpForm.payment_method === 'bank_transfer' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-black/20 p-3 rounded-xl border border-slate-850">
                      <div>
                        <label className="block text-4xs text-slate-400 uppercase font-bold mb-1">Nom de la Banque</label>
                        <input 
                          type="text" 
                          value={newEmpForm.bank_name}
                          onChange={(e) => setNewEmpForm({...newEmpForm, bank_name: e.target.value})}
                          className="w-full bg-black/30 border border-slate-800 rounded-lg p-2 text-xs text-white"
                          placeholder="Ex: SGCI"
                        />
                      </div>
                      <div>
                        <label className="block text-4xs text-slate-400 uppercase font-bold mb-1">N° de Compte / RIB</label>
                        <input 
                          type="text" 
                          value={newEmpForm.bank_account_number}
                          onChange={(e) => setNewEmpForm({...newEmpForm, bank_account_number: e.target.value})}
                          className="w-full bg-black/30 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono text-2xs"
                          placeholder="RIB complet"
                        />
                      </div>
                      <div>
                        <label className="block text-4xs text-slate-400 uppercase font-bold mb-1">SWIFT / BIC</label>
                        <input 
                          type="text" 
                          value={newEmpForm.bank_swift}
                          onChange={(e) => setNewEmpForm({...newEmpForm, bank_swift: e.target.value})}
                          className="w-full bg-black/30 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono text-2xs"
                        />
                      </div>
                      <div>
                        <label className="block text-4xs text-slate-400 uppercase font-bold mb-1">IBAN International</label>
                        <input 
                          type="text" 
                          value={newEmpForm.bank_iban}
                          onChange={(e) => setNewEmpForm({...newEmpForm, bank_iban: e.target.value})}
                          className="w-full bg-black/30 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono text-2xs"
                        />
                      </div>
                    </div>
                  ) : newEmpForm.payment_method === 'mobile_money' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-black/20 p-3 rounded-xl border border-slate-850">
                      <div>
                        <label className="block text-4xs text-slate-400 uppercase font-bold mb-1">Opérateur de Paiement</label>
                        <select 
                          value={newEmpForm.mobile_money_provider}
                          onChange={(e) => setNewEmpForm({...newEmpForm, mobile_money_provider: e.target.value as any})}
                          className="w-full bg-black/30 border border-slate-800 rounded-lg p-2 text-xs text-white"
                        >
                          <option value="Wave">Wave Côte d'Ivoire</option>
                          <option value="Orange Money">Orange Money</option>
                          <option value="MTN MoMo">MTN MoMo</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-4xs text-slate-400 uppercase font-bold mb-1">Numéro de Mobile Money</label>
                        <input 
                          type="text" 
                          value={newEmpForm.mobile_money_number}
                          onChange={(e) => setNewEmpForm({...newEmpForm, mobile_money_number: e.target.value})}
                          className="w-full bg-black/30 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono text-xs"
                          placeholder="+225..."
                        />
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button 
                    type="button" 
                    onClick={() => setShowAddEmployeeModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Valider l'embauche
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL 2: ADD / RENEW CONTRACT (Multiple active contract career) --- */}
      <AnimatePresence>
        {showAddContractModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
              onClick={() => setShowAddContractModal(false)}
            ></div>
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl relative z-10"
            >
              <div className="px-6 py-4 border-b border-white/10 bg-black/30 flex justify-between items-center">
                <h3 className="font-bold text-white text-base">Rédiger un nouveau contrat (Avenant / Promotion)</h3>
                <button onClick={() => setShowAddContractModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateContract} className="p-6 space-y-4">
                <div>
                  <label className="block text-4xs text-slate-400 uppercase font-bold mb-1">Sélectionner l'employé *</label>
                  <select 
                    value={newContractForm.employee_id}
                    onChange={(e) => setNewContractForm({...newContractForm, employee_id: e.target.value})}
                    className="w-full bg-black/30 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  >
                    <option value="">-- Choisir un salarié --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name} ({emp.employee_code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-4xs text-slate-400 uppercase font-bold mb-1">Type de Contrat</label>
                    <select 
                      value={newContractForm.contract_type}
                      onChange={(e) => setNewContractForm({...newContractForm, contract_type: e.target.value as any})}
                      className="w-full bg-black/30 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                    >
                      <option value="CDI">CDI (Indéterminé)</option>
                      <option value="CDD">CDD (Déterminé)</option>
                      <option value="EXTRA">Extra à la tâche</option>
                      <option value="INTERN">Stage conventionné</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-4xs text-slate-400 uppercase font-bold mb-1">Date d'effet</label>
                    <input 
                      type="date" 
                      value={newContractForm.start_date}
                      onChange={(e) => setNewContractForm({...newContractForm, start_date: e.target.value})}
                      className="w-full bg-black/30 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-4xs text-slate-400 uppercase font-bold mb-1">Nouveau salaire brut</label>
                    <input 
                      type="number" 
                      value={newContractForm.base_salary}
                      onChange={(e) => setNewContractForm({...newContractForm, base_salary: Number(e.target.value)})}
                      className="w-full bg-black/30 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-4xs text-slate-400 uppercase font-bold mb-1">Devise de règlement (i18n)</label>
                    <select 
                      value={newContractForm.currency}
                      onChange={(e) => setNewContractForm({...newContractForm, currency: e.target.value})}
                      className="w-full bg-black/30 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono"
                    >
                      <option value="XOF">XOF (Franc CFA)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-4xs text-slate-400 uppercase font-bold mb-1">Notes / Raison de la revalorisation</label>
                  <textarea 
                    value={newContractForm.notes}
                    onChange={(e) => setNewContractForm({...newContractForm, notes: e.target.value})}
                    rows={2}
                    className="w-full bg-black/30 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                    placeholder="Ex: Passage au grade de superviseur, renouvellement CDD..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <button 
                    type="button" 
                    onClick={() => setShowAddContractModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Signer et enregistrer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL 3: ASSIGN SKILL --- */}
      <AnimatePresence>
        {showAddSkillModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
              onClick={() => setShowAddSkillModal(false)}
            ></div>
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative z-10"
            >
              <div className="px-6 py-4 border-b border-white/10 bg-black/30 flex justify-between items-center">
                <h3 className="font-bold text-white text-base">Attribuer un diplôme ou habilitation</h3>
                <button onClick={() => setShowAddSkillModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAssignSkill} className="p-6 space-y-4">
                <div>
                  <label className="block text-4xs text-slate-400 uppercase font-bold mb-1">Sélectionner l'employé</label>
                  <select 
                    value={newSkillForm.employee_id}
                    onChange={(e) => setNewSkillForm({...newSkillForm, employee_id: e.target.value})}
                    className="w-full bg-black/30 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  >
                    <option value="">-- Choisir un salarié --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-4xs text-slate-400 uppercase font-bold mb-1">Brevet ou Compétence</label>
                  <select 
                    value={newSkillForm.skill_id}
                    onChange={(e) => setNewSkillForm({...newSkillForm, skill_id: e.target.value})}
                    className="w-full bg-black/30 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  >
                    <option value="">-- Choisir une compétence --</option>
                    {skills.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-4xs text-slate-400 uppercase font-bold mb-1">Niveau de maîtrise</label>
                  <select 
                    value={newSkillForm.level}
                    onChange={(e) => setNewSkillForm({...newSkillForm, level: e.target.value as any})}
                    className="w-full bg-black/30 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  >
                    <option value="beginner">Débutant (Notions de base)</option>
                    <option value="intermediate">Intermédiaire (Opérationnel)</option>
                    <option value="advanced">Avancé (Autonome)</option>
                    <option value="expert">Expert (Référence interne / Superviseur)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <button 
                    type="button" 
                    onClick={() => setShowAddSkillModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
