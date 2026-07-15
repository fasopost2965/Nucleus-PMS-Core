/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  ChevronRight, 
  X, 
  CreditCard, 
  Shield, 
  UploadCloud, 
  FileDown, 
  CheckSquare,
  Users
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  IHRMSEmployee, 
  IHRMSDepartment, 
  IHRMSJob, 
  IHRMSContract, 
  IHRMSEmployeeSkill, 
  IHRMSDocument, 
  IHRMSOnboardingTask 
} from '../../types';

interface HRMSDirectoryProps {
  employees: IHRMSEmployee[];
  departments: IHRMSDepartment[];
  jobs: IHRMSJob[];
  contracts: IHRMSContract[];
  employeeSkills: IHRMSEmployeeSkill[];
  documents: IHRMSDocument[];
  onboardingTasks: IHRMSOnboardingTask[];
  selectedEmployeeId: string | null;
  setSelectedEmployeeId: (id: string | null) => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  deptFilter: string;
  setDeptFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  uploadDocType: IHRMSDocument['document_type'];
  setUploadDocType: (val: IHRMSDocument['document_type']) => void;
  dragActive: boolean;
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleTerminateEmployee: (id: string) => void;
}

export default function HRMSDirectory({
  employees,
  departments,
  jobs,
  contracts,
  employeeSkills,
  documents,
  onboardingTasks,
  selectedEmployeeId,
  setSelectedEmployeeId,
  searchTerm,
  setSearchTerm,
  deptFilter,
  setDeptFilter,
  statusFilter,
  setStatusFilter,
  uploadDocType,
  setUploadDocType,
  dragActive,
  handleDrag,
  handleDrop,
  handleTerminateEmployee
}: HRMSDirectoryProps) {
  // Filtering employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDept = deptFilter === 'ALL' || emp.department_id === deptFilter;
    const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);
  const selectedEmployeeDocs = documents.filter(d => d.employee_id === selectedEmployeeId);
  const selectedEmployeeOnboarding = onboardingTasks.filter(t => t.employee_id === selectedEmployeeId);

  return (
    <div className="space-y-4" id="hrms-directory-root">
      
      {/* 1. Search & Filter Strip */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Rechercher par nom, prénom ou matricule..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-700 outline-none transition"
          />
        </div>

        <div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-brand-orange rounded-xl px-3 py-2.5 text-xs text-slate-600 outline-none transition"
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
            className="w-full bg-slate-50 border border-slate-200 focus:border-brand-orange rounded-xl px-3 py-2.5 text-xs text-slate-600 outline-none transition"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="active">Salariés Actifs</option>
            <option value="terminated">Anciens Salariés (Sortis)</option>
          </select>
        </div>
      </div>

      {/* 2. Employee List & Sidebar details split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Employees unique register */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-slate-800 font-bold text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-orange" />
                Registre Unique du Personnel
              </h3>
              <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2.5 py-1 rounded-full">
                {filteredEmployees.length} salariés
              </span>
            </div>
            
            <div className="divide-y divide-slate-100">
              {filteredEmployees.map(emp => {
                const dept = departments.find(d => d.id === emp.department_id);
                const job = jobs.find(j => j.id === emp.job_id);
                const activeContract = contracts.find(c => c.employee_id === emp.id && c.status === 'active');

                return (
                  <div 
                    key={emp.id}
                    onClick={() => setSelectedEmployeeId(emp.id)}
                    className={`p-4 flex items-center justify-between gap-4 cursor-pointer transition-all border-l-4 ${
                      selectedEmployeeId === emp.id 
                        ? 'bg-orange-50/30 border-l-brand-orange' 
                        : 'hover:bg-slate-50/50 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100/50 border border-orange-200 flex items-center justify-center text-brand-orange font-bold shadow-inner">
                        {emp.first_name[0]}{emp.last_name[0]}
                      </div>
                      <div className="text-left">
                        <h4 className="text-slate-800 font-bold text-sm flex items-center gap-1.5">
                          {emp.first_name} {emp.last_name}
                          <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono">
                            {emp.employee_code}
                          </span>
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {job?.title} • <span className="text-brand-orange font-medium">{dept?.name}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-slate-700 font-mono">
                          {activeContract ? `${activeContract.base_salary.toLocaleString('fr-FR')} ${activeContract.currency}` : 'N/A'}
                        </p>
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">
                          Salaire de Base
                        </p>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                        emp.status === 'active' 
                          ? 'bg-emerald-50 text-success border-emerald-100' 
                          : 'bg-red-50 text-danger border-red-100'
                      }`}>
                        {emp.status === 'active' ? 'Actif' : 'Sorti'}
                      </span>

                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                );
              })}

              {filteredEmployees.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs italic">
                  Aucun collaborateur ne correspond à vos critères de recherche.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Deep dive detailed employee CV/File */}
        <div>
          <AnimatePresence mode="wait">
            {selectedEmployee ? (
              <motion.div
                key={selectedEmployee.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white border border-slate-200 shadow-md rounded-xl p-5 space-y-5 text-left"
              >
                {/* Header profile block */}
                <div className="text-center pb-4 border-b border-slate-100 relative">
                  <button 
                    onClick={() => setSelectedEmployeeId(null)}
                    className="absolute right-0 top-0 p-1.5 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  <div className="w-14 h-14 rounded-full bg-orange-100/50 border-2 border-brand-orange flex items-center justify-center text-xl font-bold text-brand-orange mx-auto shadow-inner">
                    {selectedEmployee.first_name[0]}{selectedEmployee.last_name[0]}
                  </div>
                  <h3 className="text-slate-800 font-bold text-base mt-2">
                    {selectedEmployee.first_name} {selectedEmployee.last_name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {selectedEmployee.employee_code} • {selectedEmployee.employee_type}
                  </p>
                  
                  {selectedEmployee.status === 'active' && (
                    <button 
                      onClick={() => handleTerminateEmployee(selectedEmployee.id)}
                      className="mt-3 px-3 py-1.5 bg-red-50 hover:bg-danger text-danger hover:text-white border border-red-200 hover:border-danger rounded-lg text-[9px] font-bold uppercase tracking-wider transition cursor-pointer"
                    >
                      Déclarer le départ (Offboarding)
                    </button>
                  )}
                </div>

                {/* Banking info Section */}
                <div className="space-y-2">
                  <h4 className="text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-brand-orange" />
                    Coordonnées de Règlement
                  </h4>
                  
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Canal Préféré</span>
                      <span className="text-slate-700 font-semibold capitalize">
                        {selectedEmployee.payment_method === 'bank_transfer' ? 'Virement Bancaire' : selectedEmployee.payment_method === 'mobile_money' ? 'Mobile Money' : 'Espèces'}
                      </span>
                    </div>

                    {selectedEmployee.payment_method === 'bank_transfer' ? (
                      <>
                        <div className="border-t border-slate-100 pt-2 space-y-1.5">
                          <div className="text-[9px] uppercase text-slate-400 font-semibold">Banque & Intitulé</div>
                          <div className="text-slate-700 font-bold truncate">{selectedEmployee.bank_name}</div>
                          <div className="text-slate-600 font-mono text-[11px] bg-white p-1 rounded border border-slate-150 truncate">
                            {selectedEmployee.bank_account_number}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2">
                          <div>
                            <div className="text-[9px] uppercase text-slate-400 font-semibold">SWIFT</div>
                            <div className="text-slate-600 font-mono text-[10px]">{selectedEmployee.bank_swift}</div>
                          </div>
                          <div>
                            <div className="text-[9px] uppercase text-slate-400 font-semibold">IBAN</div>
                            <div className="text-slate-600 font-mono text-[10px] truncate" title={selectedEmployee.bank_iban}>
                              {selectedEmployee.bank_iban || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : selectedEmployee.payment_method === 'mobile_money' ? (
                      <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
                        <div>
                          <div className="text-[9px] uppercase text-slate-400 font-semibold">Opérateur</div>
                          <div className="text-slate-700 font-bold">{selectedEmployee.mobile_money_provider}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] uppercase text-slate-400 font-semibold">Numéro</div>
                          <div className="text-slate-600 font-mono text-xs">{selectedEmployee.mobile_money_number}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="border-t border-slate-100 pt-2 text-slate-400 text-[10px] italic">
                        Règlement direct de la main à la main contre émargement.
                      </div>
                    )}
                  </div>
                </div>

                {/* Onboarding progress if active */}
                {selectedEmployeeOnboarding.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-brand-orange" />
                      Progression Intégration
                    </h4>
                    <div className="space-y-1.5">
                      {selectedEmployeeOnboarding.map(task => (
                        <div 
                          key={task.id} 
                          className="flex items-center justify-between bg-slate-50 border border-slate-100 p-2 rounded-lg text-xs"
                        >
                          <span className={task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-600 font-medium'}>
                            {task.task_name}
                          </span>
                          <span className={`text-[9px] font-black uppercase ${
                            task.status === 'completed' ? 'text-success' : 'text-warning'
                          }`}>
                            {task.status === 'completed' ? 'Complété' : 'En cours'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Secure File Vault section */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-brand-orange" />
                      Coffre Documentaire
                    </h4>
                    <select 
                      value={uploadDocType}
                      onChange={(e) => setUploadDocType(e.target.value as any)}
                      className="bg-slate-100 text-[9px] border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 outline-none"
                    >
                      <option value="id_card">CNI/Passeport</option>
                      <option value="contract">Contrat</option>
                      <option value="diploma">Diplôme</option>
                      <option value="payslip">Fiche de Paie</option>
                    </select>
                  </div>

                  {/* Drag and Drop Zone */}
                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                      dragActive 
                        ? 'border-brand-orange bg-orange-50/30' 
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <UploadCloud className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    <p className="text-[9px] text-slate-400 leading-normal">
                      Glissez-déposez le fichier de l'employé pour le charger dans le coffre réglementaire.
                    </p>
                  </div>

                  {/* List of uploaded files */}
                  <div className="space-y-1.5">
                    {selectedEmployeeDocs.map(doc => (
                      <div key={doc.id} className="bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg flex items-center justify-between text-xs">
                        <div className="truncate pr-2 text-left">
                          <p className="text-slate-700 font-bold truncate text-[11px]">{doc.file_name}</p>
                          <p className="text-[9px] text-slate-400">
                            {doc.document_type.toUpperCase()} • {Math.round(doc.file_size / 1024)} Ko
                          </p>
                        </div>
                        <a 
                          href="#" 
                          onClick={(e) => { e.preventDefault(); alert(`Téléchargement simulé du document : ${doc.file_name}`); }}
                          className="text-brand-orange hover:text-brand-orange-hover p-1 bg-white rounded border border-slate-200 transition"
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
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs italic">
                Sélectionnez un employé dans l'annuaire pour consulter son dossier complet, ses coordonnées bancaires et son coffre documentaire.
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
