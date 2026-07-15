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
  Building, 
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Importation de l'en-tête de page standardisé
import { PageHeader } from '../components/ui/pms-ui';

// Importation des sous-composants modulaires
import HRMSDashboard from '../components/hrms/HRMSDashboard';
import HRMSDirectory from '../components/hrms/HRMSDirectory';
import HRMSContracts from '../components/hrms/HRMSContracts';
import HRMSTeams from '../components/hrms/HRMSTeams';
import HRMSSkills from '../components/hrms/HRMSSkills';
import HRMSPayrollRules from '../components/hrms/HRMSPayrollRules';
import HRMSModals from '../components/hrms/HRMSModals';

// Importation des types et jeux de données initiaux
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
import { api } from '../utils/api';

export default function HRMS() {
  // États de persistance locaux du module
  const isPurged = localStorage.getItem('pms_db_purged') === 'true';
  const [employees, setEmployees] = useState<IHRMSEmployee[]>(() => isPurged ? [] : initialHRMSEmployees);
  const [departments, setDepartments] = useState<IHRMSDepartment[]>(() => isPurged ? [] : initialHRMSDepartments);
  const [jobs, setJobs] = useState<IHRMSJob[]>(() => isPurged ? [] : initialHRMSJobs);
  const [teams, setTeams] = useState<IHRMSTeam[]>(() => isPurged ? [] : initialHRMSTeams);
  const [contracts, setContracts] = useState<IHRMSContract[]>(() => isPurged ? [] : initialHRMSContracts);
  const [skills, setSkills] = useState<IHRMSSkill[]>(() => isPurged ? [] : initialHRMSSkills);
  const [employeeSkills, setEmployeeSkills] = useState<IHRMSEmployeeSkill[]>(() => isPurged ? [] : initialHRMSEmployeeSkills);
  const [documents, setDocuments] = useState<IHRMSDocument[]>(() => isPurged ? [] : initialHRMSDocuments);
  const [onboardingTasks, setOnboardingTasks] = useState<IHRMSOnboardingTask[]>(() => isPurged ? [] : initialHRMSOnboardingTasks);
  const [businessEvents, setBusinessEvents] = useState<IHRMSBusinessEvent[]>(() => isPurged ? [] : initialHRMSEvents);
  const [payrollRules, setPayrollRules] = useState<IHRMSPayrollRule[]>(() => isPurged ? [] : initialHRMSPayrollRules);

  // Synchronisation avec l'API du serveur Node / Express sur le montage
  useEffect(() => {
    const loadHRMSData = async () => {
      try {
        const loadedEmployees = await api.getEmployees();
        setEmployees(loadedEmployees || []);
      } catch (e) { console.warn('Fallback API employés:', e); }

      try {
        const loadedDepts = await api.getDepartments();
        setDepartments(loadedDepts || []);
      } catch (e) { console.warn('Fallback API départements:', e); }

      try {
        const loadedJobs = await api.getJobs();
        setJobs(loadedJobs || []);
      } catch (e) { console.warn('Fallback API postes:', e); }

      try {
        const loadedTeams = await api.getTeams();
        setTeams(loadedTeams || []);
      } catch (e) { console.warn('Fallback API équipes:', e); }

      try {
        const loadedContracts = await api.getContracts();
        setContracts(loadedContracts || []);
      } catch (e) { console.warn('Fallback API contrats:', e); }

      try {
        const loadedTasks = await api.getOnboardingTasks();
        setOnboardingTasks(loadedTasks || []);
      } catch (e) { console.warn('Fallback API tâches d\'intégration:', e); }

      try {
        const loadedSkills = await api.getSkills();
        setSkills(loadedSkills || []);
      } catch (e) { console.warn('Fallback API compétences:', e); }

      try {
        const loadedEmpSkills = await api.getEmployeeSkills();
        setEmployeeSkills(loadedEmpSkills || []);
      } catch (e) { console.warn('Fallback API compétences employés:', e); }

      try {
        const loadedRules = await api.getPayrollRules();
        setPayrollRules(loadedRules || []);
      } catch (e) { console.warn('Fallback API règles de paie:', e); }

      try {
        const loadedEvents = await api.getBusinessEvents();
        setBusinessEvents(loadedEvents || []);
      } catch (e) { console.warn('Fallback API événements:', e); }
    };
    loadHRMSData();
  }, []);

  // Sauvegarde préventive dans le localStorage lors des changements d'état
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

  // État de l'onglet de navigation actif
  const [activeTab, setActiveTab] = useState<'dashboard' | 'directory' | 'contracts' | 'teams' | 'skills' | 'payroll_rules'>('dashboard');

  // Filtres globaux de recherche du personnel
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Choix du code pays pour le moteur fiscal (i18n)
  const [activeCountryCode, setActiveCountryCode] = useState('CIV');

  // ID du collaborateur sélectionné pour consultation de sa fiche détaillée
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  // Visibilité des modales d'ajout de données
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showAddContractModal, setShowAddContractModal] = useState(false);
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);

  // Publication d'un événement métier (piste d'audit interne)
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

  // Indicateurs clés de performance du personnel (KPIs)
  const activeEmployeesCount = employees.filter(e => e.status === 'active').length;
  
  const avgHourlyCost = Math.round(
    jobs.reduce((acc, curr) => acc + curr.hourly_cost, 0) / (jobs.length || 1)
  );

  const totalMonthlyPayrollEstimateXOF = contracts
    .filter(c => c.status === 'active')
    .reduce((acc, contract) => {
      const value = contract.base_salary;
      if (contract.currency === 'EUR') {
        return acc + (value * 655.957); // Taux officiel fixe EUR vers XOF (Franc CFA)
      }
      return acc + value;
    }, 0);

  const completedTasks = onboardingTasks.filter(t => t.status === 'completed').length;
  const totalTasks = onboardingTasks.length;
  const onboardingCompletionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 100;

  // Données initiales des formulaires de saisie
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
    contract_type: 'CDI' as 'CDI' | 'CDD' | 'EXTRA',
    base_salary: 180000,
    currency: 'XOF'
  });

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

  const [newSkillForm, setNewSkillForm] = useState({
    employee_id: '',
    skill_id: '',
    level: 'intermediate' as 'beginner' | 'intermediate' | 'advanced' | 'expert'
  });

  const [dragActive, setDragActive] = useState(false);
  const [uploadDocType, setUploadDocType] = useState<IHRMSDocument['document_type']>('id_card');

  // 1. Embauche d'un collaborateur et génération simultanée du contrat initial
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

    api.createEmployee(newEmployee).catch(e => console.error('Erreur API sauvegarde employé:', e));
    api.createContract(newContract).catch(e => console.error('Erreur API sauvegarde contrat:', e));

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

  // 2. Renouvellement ou avenant contractuel (historique de carrière de l'employé)
  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContractForm.employee_id || !newContractForm.base_salary) {
      alert('Veuillez spécifier l\'employé et le salaire.');
      return;
    }

    const employeeId = newContractForm.employee_id;
    const employee = employees.find(emp => emp.id === employeeId);

    if (!employee) return;

    setContracts(prevContracts => {
      // Marquer les anciens contrats du même collaborateur comme remplacés
      const updatedContracts = prevContracts.map(c => {
        if (c.employee_id === employeeId && c.status === 'active') {
          return { ...c, status: 'superseded' as const };
        }
        return c;
      });

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

  // 3. Affectation d'une compétence d'équipe ou réglementaire
  const handleAssignSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillForm.employee_id || !newSkillForm.skill_id) {
      alert('Veuillez sélectionner un employé et une compétence.');
      return;
    }

    const existingIndex = employeeSkills.findIndex(
      es => es.employee_id === newSkillForm.employee_id && es.skill_id === newSkillForm.skill_id
    );

    if (existingIndex > -1) {
      const updated = [...employeeSkills];
      updated[existingIndex].level = newSkillForm.level;
      setEmployeeSkills(updated);
    } else {
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

  // 4. Gestion de l'état d'avancement des tâches d'intégration
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

  // 5. Départ d'un employé (clôture des fiches et contrats)
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

  // 6. Zone de glisser-déposer pour téléversement de documents d'identité ou diplômes
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

  return (
    <div className="space-y-6 animate-fade-in" id="pms-hrms-module-root">
      
      {/* En-tête de page principal */}
      <PageHeader
        title="Nucleus HRMS Enterprise"
        description="Portail de Gestion du Capital Humain & Carrières • Brunch Bouaké VIP"
        actionButton={{
          label: 'Recruter un employé',
          onClick: () => setShowAddEmployeeModal(true),
          icon: UserPlus
        }}
        secondaryAction={{
          label: 'Nouveau Contrat',
          onClick: () => {
            setNewContractForm(prev => ({
              ...prev,
              employee_id: employees[0]?.id || '',
              start_date: new Date().toISOString().split('T')[0]
            }));
            setShowAddContractModal(true);
          },
          icon: FileText
        }}
      />

      {/* Menu de navigation des onglets */}
      <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none">
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
                  ? 'bg-brand-orange text-white border border-brand-orange shadow-md shadow-brand-orange/10' 
                  : 'bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-200 shadow-3xs'
              }`}
            >
              <IconComponent className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`text-2xs font-black px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white text-brand-orange' : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Rendu conditionnel de l'onglet actif */}
      <AnimatePresence mode="wait">
        
        {/* Onglet : Tableau de bord */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            key="dashboard-tab"
          >
            <HRMSDashboard
              activeEmployeesCount={activeEmployeesCount}
              totalMonthlyPayrollEstimateXOF={totalMonthlyPayrollEstimateXOF}
              avgHourlyCost={avgHourlyCost}
              onboardingCompletionRate={onboardingCompletionRate}
              businessEvents={businessEvents}
              onboardingTasks={onboardingTasks}
              employees={employees}
              handleToggleOnboardingTask={handleToggleOnboardingTask}
            />
          </motion.div>
        )}

        {/* Onglet : Registre personnel */}
        {activeTab === 'directory' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            key="directory-tab"
          >
            <HRMSDirectory
              employees={employees}
              departments={departments}
              jobs={jobs}
              contracts={contracts}
              employeeSkills={employeeSkills}
              documents={documents}
              onboardingTasks={onboardingTasks}
              selectedEmployeeId={selectedEmployeeId}
              setSelectedEmployeeId={setSelectedEmployeeId}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              deptFilter={deptFilter}
              setDeptFilter={setDeptFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              uploadDocType={uploadDocType}
              setUploadDocType={setUploadDocType}
              dragActive={dragActive}
              handleDrag={handleDrag}
              handleDrop={handleDrop}
              handleTerminateEmployee={handleTerminateEmployee}
            />
          </motion.div>
        )}

        {/* Onglet : Contrats */}
        {activeTab === 'contracts' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            key="contracts-tab"
          >
            <HRMSContracts
              employees={employees}
              contracts={contracts}
              setShowAddContractModal={setShowAddContractModal}
              setNewContractForm={setNewContractForm}
            />
          </motion.div>
        )}

        {/* Onglet : Organigramme & Équipes */}
        {activeTab === 'teams' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            key="teams-tab"
          >
            <HRMSTeams
              departments={departments}
              teams={teams}
              employees={employees}
            />
          </motion.div>
        )}

        {/* Onglet : Gestion des compétences */}
        {activeTab === 'skills' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            key="skills-tab"
          >
            <HRMSSkills
              employees={employees}
              skills={skills}
              employeeSkills={employeeSkills}
              setShowAddSkillModal={setShowAddSkillModal}
              setNewSkillForm={setNewSkillForm}
            />
          </motion.div>
        )}

        {/* Onglet : Paramètres fiscaux et locaux */}
        {activeTab === 'payroll_rules' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            key="payroll_rules-tab"
          >
            <HRMSPayrollRules
              payrollRules={payrollRules}
              activeCountryCode={activeCountryCode}
              setActiveCountryCode={setActiveCountryCode}
            />
          </motion.div>
        )}

      </AnimatePresence>

      {/* Modales transactionnelles */}
      <HRMSModals
        showAddEmployeeModal={showAddEmployeeModal}
        setShowAddEmployeeModal={setShowAddEmployeeModal}
        departments={departments}
        jobs={jobs}
        teams={teams}
        newEmpForm={newEmpForm}
        setNewEmpForm={setNewEmpForm}
        handleCreateEmployee={handleCreateEmployee}

        showAddContractModal={showAddContractModal}
        setShowAddContractModal={setShowAddContractModal}
        employees={employees}
        newContractForm={newContractForm}
        setNewContractForm={setNewContractForm}
        handleCreateContract={handleCreateContract}

        showAddSkillModal={showAddSkillModal}
        setShowAddSkillModal={setShowAddSkillModal}
        skills={skills}
        newSkillForm={newSkillForm}
        setNewSkillForm={setNewSkillForm}
        handleAssignSkill={handleAssignSkill}
      />

    </div>
  );
}
