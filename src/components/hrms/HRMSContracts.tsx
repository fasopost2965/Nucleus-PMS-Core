/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Shield, 
  Plus, 
  TrendingUp,
  FileText
} from 'lucide-react';
import { IHRMSEmployee, IHRMSContract } from '../../types';

interface HRMSContractsProps {
  employees: IHRMSEmployee[];
  contracts: IHRMSContract[];
  setShowAddContractModal: (show: boolean) => void;
  setNewContractForm: React.Dispatch<React.SetStateAction<any>>;
}

export default function HRMSContracts({
  employees,
  contracts,
  setShowAddContractModal,
  setNewContractForm
}: HRMSContractsProps) {

  const triggerPromotionSimulator = (employeeId: string) => {
    setNewContractForm({
      employee_id: employeeId,
      contract_type: 'CDI',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      base_salary: 320000,
      currency: 'XOF',
      social_security_opt_in: true,
      notes: 'Promotion exceptionnelle au grade de Superviseur.'
    });
    setShowAddContractModal(true);
  };

  return (
    <div className="space-y-6" id="hrms-contracts-root">
      
      {/* 1. Explanatory banner */}
      <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-start gap-3 text-left">
        <Shield className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-indigo-900 font-bold text-sm">Gestion des Avenants et Traçabilité Complète (Zéro Écrasement)</h4>
          <p className="text-xs text-indigo-700 leading-relaxed mt-1">
            Les règles réglementaires de l'espace UEMOA exigent la traçabilité intégrale de l'historique de paie. Lors d'un avenant ou d'une revalorisation, l'ancien contrat n'est pas modifié : son statut passe à <span className="font-bold">"superseded"</span> (remplacé) et un nouveau contrat actif est inséré.
          </p>
        </div>
      </div>

      {/* 2. Main Content Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Contracts list by employee */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-slate-800 font-bold text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-orange" />
                Registre des Contrats de Travail
              </h3>
              <button 
                onClick={() => {
                  setNewContractForm({
                    employee_id: employees[0]?.id || '',
                    contract_type: 'CDI',
                    start_date: new Date().toISOString().split('T')[0],
                    end_date: '',
                    base_salary: 180000,
                    currency: 'XOF',
                    social_security_opt_in: true,
                    notes: ''
                  });
                  setShowAddContractModal(true);
                }}
                className="px-3 py-1.5 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Créer un avenant
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {employees.map(emp => {
                const empContracts = contracts.filter(c => c.employee_id === emp.id);
                return (
                  <div key={emp.id} className="p-4 space-y-3 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold border border-slate-200">
                          {emp.first_name[0]}{emp.last_name[0]}
                        </span>
                        <h4 className="text-slate-800 font-bold text-sm">
                          {emp.first_name} {emp.last_name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">({emp.employee_code})</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full border border-slate-150">
                        {empContracts.length} contrat(s) au dossier
                      </span>
                    </div>

                    {/* Timeline representation */}
                    <div className="space-y-2 pl-9">
                      {empContracts.map(contract => (
                        <div 
                          key={contract.id} 
                          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            contract.status === 'active' 
                              ? 'bg-orange-50/40 border-orange-100' 
                              : 'bg-slate-50 border-slate-200 opacity-65'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-700 uppercase font-mono bg-white border border-slate-200 px-2 py-0.5 rounded shadow-3xs">
                                {contract.contract_type}
                              </span>
                              <span className={`text-[9px] font-bold uppercase tracking-wider ${
                                contract.status === 'active' ? 'text-success' : 'text-slate-400'
                              }`}>
                                {contract.status === 'active' ? 'ACTIF / EN COURS' : 'ARCHIVÉ / REMPLACÉ'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
                              Du {new Date(contract.start_date).toLocaleDateString('fr-FR')} 
                              {contract.end_date ? ` au ${new Date(contract.end_date).toLocaleDateString('fr-FR')}` : ' (Indéterminé)'}
                            </p>
                            {contract.notes && (
                              <p className="text-[10px] text-slate-400 italic mt-1 bg-white/60 p-1 px-2 rounded border border-slate-100">
                                Note : {contract.notes}
                              </p>
                            )}
                          </div>

                          <div className="text-right sm:min-w-[120px]">
                            <p className="text-sm font-black text-slate-700 font-mono">
                              {contract.base_salary.toLocaleString('fr-FR')} {contract.currency}
                            </p>
                            <p className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">
                              Brut Mensuel
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

        {/* Right Column: Promotion simulation sandbox */}
        <div className="space-y-4 text-left">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-slate-800 font-bold text-sm flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-brand-orange" />
              Simulateur de Carrière
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Testez instantanément la promotion d'un employé. En créant un CDI revalorisé, l'ancien contrat actif passera en statut "remplacé" de façon asynchrone, validant l'absence totale d'écrasement de données.
            </p>

            <button
              onClick={() => triggerPromotionSimulator('emp-1')}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-3xs"
            >
              Promouvoir un employé (Test)
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
